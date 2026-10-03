import { EvidenceEventSchema, type EvidenceEvent, type EvidenceRunRequest } from "@/lib/schemas";

export async function streamEvidenceRun(
  input: EvidenceRunRequest,
  onEvent: (event: EvidenceEvent) => void
): Promise<void> {
  const response = await fetch("/api/evidence/run", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "text/event-stream" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || "The evidence request was rejected.");
  }
  if (!response.body) throw new Error("The evidence stream was unavailable.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const consume = (chunk: string) => {
    buffer += chunk;
    const frames = buffer.split(/\r?\n\r?\n/);
    buffer = frames.pop() || "";

    for (const frame of frames) {
      const data = frame
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim())
        .join("");
      if (!data) continue;
      try {
        const parsed = EvidenceEventSchema.safeParse(JSON.parse(data));
        if (parsed.success) onEvent(parsed.data);
      } catch {
      }
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    consume(decoder.decode(value, { stream: true }));
  }
  consume(decoder.decode());
}
