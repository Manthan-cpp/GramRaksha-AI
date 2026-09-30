import { EvidenceEventSchema, type EvidenceEvent, type EvidenceRunRequest } from "@/lib/schemas";

export async function streamCropEvidence(input: EvidenceRunRequest, onEvent: (event: EvidenceEvent) => void, signal: AbortSignal) {
  const response = await fetch("/api/evidence/run", { method: "POST", headers: { "content-type": "application/json", accept: "text/event-stream" }, body: JSON.stringify(input), signal });
  if (!response.ok || !response.body) throw new Error("Evidence request failed");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "", terminal = false;
  const consume = () => {
    const frames = buffer.split(/\r?\n\r?\n/); buffer = frames.pop() || "";
    for (const frame of frames) {
      const data = frame.split(/\r?\n/).filter(l => l.startsWith("data:")).map(l => l.slice(5).trim()).join("\n");
      if (!data) continue;
      const event = EvidenceEventSchema.parse(JSON.parse(data));
      if (signal.aborted || terminal) return;
      terminal = event.type === "done" || event.type === "error";
      onEvent(event);
    }
  };
  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true }); consume();
    }
    buffer += decoder.decode() + "\n\n"; consume();
    if (!terminal && !signal.aborted) throw new Error("Incomplete evidence stream");
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
