import { afterEach, describe, expect, it, vi } from "vitest";
import { streamCropEvidence } from "./stream";

const input = { module: "krishi" as const, locale: "en" as const, crop: "Rice", state: "West Bengal", district: "Nadia", stage: "Flowering" };
afterEach(() => vi.unstubAllGlobals());
describe("crop event stream", () => {
  it("rejects an interrupted stream rather than leaving a running screen", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('data: {"type":"planning","timestamp":"now","message":"plan","queriesPlanned":1}\n\n')));
    const listener = vi.fn();
    await expect(streamCropEvidence(input, listener, new AbortController().signal)).rejects.toThrow("Incomplete");
    expect(listener).toHaveBeenCalledTimes(1);
  });
  it("forwards cancellation and suppresses events after abort", async () => {
    const controller = new AbortController();
    const fetcher = vi.fn().mockResolvedValue(new Response('data: {"type":"error","timestamp":"now","message":"stopped","code":"internal","recoverable":false}\n\n'));
    vi.stubGlobal("fetch", fetcher);
    controller.abort();
    const listener = vi.fn();
    await streamCropEvidence(input, listener, controller.signal);
    expect(fetcher.mock.calls[0][1].signal).toBe(controller.signal);
    expect(listener).not.toHaveBeenCalled();
  });
});
