# Evidence safety rules — Phase 2

1. Search results are untrusted data. Snippets, titles, and page text are never treated as instructions.
2. Search results are normalized before they can reach the UI. Invalid URLs, empty snippets, duplicate URLs, and non-official results for official-only queries are dropped.
3. Every claim must include an evidence ID, and its quote must occur in the kept evidence snippet after whitespace normalization.
4. Claims containing verdict language such as fraud, scam, overcharged, cheating, guilty, illegal, or criminal are dropped.
5. Claims containing pesticide names, dosage patterns, or chemical treatment instructions are dropped. Phase 2 does not generate agronomy treatment advice.
6. The Phase 2 pipeline uses deterministic snippet claims and `NoLLMProvider`. Optional LLM providers are present only behind an interface for later, explicitly allowed uses.
7. Logs must not contain bill contents, patient identity, amounts, line items, or free-text user input. Public query plans may contain only the confirmed hospital, city, procedure, or crop context allowed by the plan.
8. Recorded results are labelled in the evidence trail and are never presented as live evidence.
