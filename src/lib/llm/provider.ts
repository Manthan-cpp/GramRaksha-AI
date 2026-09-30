import type { Claim, Evidence } from "@/lib/schemas";

export interface GroundedClaimInput {
  evidence: Evidence[];
  instruction?: string;
}

export interface LLMProvider {
  readonly name: "gemini" | "groq" | "none";
  readonly enabled: boolean;
  generateGroundedClaims(input: GroundedClaimInput): Promise<Claim[]>;
}

export class NoLLMProvider implements LLMProvider {
  readonly name = "none" as const;
  readonly enabled = false;

  async generateGroundedClaims(): Promise<Claim[]> {
    return [];
  }
}

class DisabledRemoteProvider implements LLMProvider {
  readonly enabled = false;

  constructor(readonly name: "gemini" | "groq") {}

  async generateGroundedClaims(): Promise<Claim[]> {
    throw new Error(`${this.name} is intentionally disabled until a later phase.`);
  }
}

export class GeminiProvider extends DisabledRemoteProvider {
  constructor() {
    super("gemini");
  }
}

export class GroqProvider extends DisabledRemoteProvider {
  constructor() {
    super("groq");
  }
}

export function createLLMProvider(): LLMProvider {
  switch (process.env.LLM_PROVIDER) {
    case "gemini":
      return new GeminiProvider();
    case "groq":
      return new GroqProvider();
    default:
      return new NoLLMProvider();
  }
}
