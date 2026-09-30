import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BudgetExceededError, createUsageMeter } from "../../src/lib/evidence/usage";

describe("usage meter", () => {
  it("stops new searches at the configured monthly cap", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "gramraksha-budget-"));
    try {
      const meter = createUsageMeter(directory, 1);
      await meter.assertWithinBudget();
      await meter.recordSuccessful("google");
      await expect(meter.assertWithinBudget()).rejects.toBeInstanceOf(BudgetExceededError);
      await expect(meter.snapshot()).resolves.toMatchObject({ total: 1, remaining: 0, byEngine: { google: 1 } });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
