import { describe, expect, it } from "vitest";
import { lintText } from "../../src/lib/llm/safety";

describe("safety linter", () => {
  it("blocks verdict language", () => {
    expect(lintText("This hospital is a scam.").safe).toBe(false);
  });

  it("blocks dosage patterns", () => {
    expect(lintText("Spray 20 ml per litre.").safe).toBe(false);
  });

  it("allows neutral evidence wording", () => {
    expect(lintText("The public source lists a contact route.").safe).toBe(true);
  });
});
