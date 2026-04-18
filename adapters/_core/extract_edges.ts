// Edge extraction via Anthropic Haiku 4.5. For each chunk, prompt Haiku
// with the chunk text + a list of all other doc titles in the corpus.
// Haiku returns candidate edges; we substring-guard each edge's evidence
// sentence against the source chunk and reject any that don't match.
//
// Haiku 4.5 does NOT support the `effort` parameter (API rejects it).
// No thinking needed — edge extraction is a structured extraction task.

import Anthropic from "npm:@anthropic-ai/sdk@0.40.0";
import type { EdgeCandidate } from "./types.ts";

interface EdgeExtractionInput {
  chunkId: string;
  chunkText: string;
  corpusDocuments: Array<{ id: string; title: string }>;
  sourceDocumentId: string;
}

export class EdgeExtractor {
  private client: Anthropic;
  private model = "claude-haiku-4-5";

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async extract(input: EdgeExtractionInput): Promise<EdgeCandidate[]> {
    const otherDocs = input.corpusDocuments.filter(
      (d) => d.id !== input.sourceDocumentId,
    );
    if (otherDocs.length === 0) return [];

    const docList = otherDocs
      .map((d, i) => `${i + 1}. "${d.title}"`)
      .join("\n");

    const system =
      `You extract cross-references from technical documentation. You are reading one chunk of text from a document and identifying references it makes to OTHER documents in the same corpus.

Valid relation types:
- references: generic mention or reference to another document
- supersedes: this chunk's document is described as replacing the target
- sibling_of: this doc and the target are two variants of the same concept (e.g., "Hedge Program" vs "Market Loan Program")
- encore_equivalent_of: this (Ovation) doc maps to an older ENCORE-era doc

Return STRICT JSON in the schema:
{"edges": [{"target_index": <1-based index into the doc list>, "relation_type": "...", "evidence_sentence": "<verbatim sentence from the chunk that supports the edge>", "confidence": 0.0-1.0}]}

Rules:
- evidence_sentence MUST be a verbatim substring of the chunk text. If you paraphrase or summarize, the edge will be rejected.
- Only include edges with confidence >= 0.6.
- Return {"edges": []} if no valid cross-references are present.
- Do not invent documents not in the list.`;

    const user = `DOCUMENTS IN THE CORPUS:
${docList}

CHUNK TEXT (from a different document):
${input.chunkText}

Extract valid cross-references.`;

    let response;
    try {
      response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        system,
        messages: [{ role: "user", content: user }],
      });
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) {
        console.warn("[edges] rate limited; skipping chunk");
        return [];
      }
      console.warn(`[edges] API error: ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return [];

    const parsed = safeParseJson(textBlock.text);
    if (!parsed?.edges || !Array.isArray(parsed.edges)) return [];

    const validated: EdgeCandidate[] = [];
    for (const raw of parsed.edges) {
      const targetIdx = Number(raw.target_index) - 1;
      if (
        targetIdx < 0 ||
        targetIdx >= otherDocs.length ||
        !raw.evidence_sentence ||
        typeof raw.evidence_sentence !== "string"
      ) continue;

      // Substring guard — rejects hallucinated evidence
      const evidence = String(raw.evidence_sentence).trim();
      if (!input.chunkText.includes(evidence)) {
        console.log(`[edges] rejected: evidence not in chunk — "${evidence.slice(0, 60)}..."`);
        continue;
      }

      const target = otherDocs[targetIdx];
      const relation = String(raw.relation_type || "references");
      const allowed = ["references", "supersedes", "sibling_of", "encore_equivalent_of"];
      if (!allowed.includes(relation)) continue;

      const confidence = Math.max(0, Math.min(1, Number(raw.confidence) || 0));
      if (confidence < 0.6) continue;

      validated.push({
        source_chunk_id: input.chunkId,
        target_doc_title: target.title,
        relation_type: relation,
        evidence_sentence: evidence,
        confidence,
      });
    }

    return validated;
  }
}

// Extract a JSON object from a possibly-chatty model response.
// deno-lint-ignore no-explicit-any
function safeParseJson(text: string): any {
  // Strip markdown code fences
  const cleaned = text
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: find the first { ... } block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    return null;
  }
}
