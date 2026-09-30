import { EvidenceRunRequestSchema, type EvidenceEvent } from "@/lib/schemas";
import { runEvidencePipeline } from "@/lib/evidence/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_REQUEST_BYTES = 64 * 1024;
const encoder = new TextEncoder();

async function readJsonWithinLimit(request: Request): Promise<unknown> {
  if (!request.body) throw new Error("Request body is missing.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new Error("Request is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

function sse(event: EvidenceEvent): Uint8Array {
  return encoder.encode(`event: evidence\ndata: ${JSON.stringify(event)}\n\n`);
}

export async function POST(request: Request): Promise<Response> {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return Response.json({ error: "Request is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await readJsonWithinLimit(request);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error && error.message === "Request is too large." ? error.message : "Request body must be valid JSON." },
      { status: error instanceof Error && error.message === "Request is too large." ? 413 : 400 }
    );
  }

  const parsed = EvidenceRunRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "The evidence request did not match the required fields." }, { status: 400 });
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const emit = (event: EvidenceEvent) => {
        controller.enqueue(sse(event));
      };

      void runEvidencePipeline(parsed.data, emit)
        .catch(() => {
          emit({
            type: "error",
            timestamp: new Date().toISOString(),
            code: "internal",
            message: "The evidence search could not be completed.",
            recoverable: true
          });
        })
        .finally(() => controller.close());
    }
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
