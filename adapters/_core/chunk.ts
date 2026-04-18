// Sentence-aware chunker. Target ~500 tokens per chunk with 50-token
// overlap. Token counts are approximate (4 chars ≈ 1 token for English).
// Heading-path extraction is V1.1; V1 emits empty heading_path.

import type { Chunk } from "./types.ts";

const TARGET_TOKENS = 500;
const OVERLAP_TOKENS = 50;
const CHARS_PER_TOKEN = 4;

const TARGET_CHARS = TARGET_TOKENS * CHARS_PER_TOKEN;
const OVERLAP_CHARS = OVERLAP_TOKENS * CHARS_PER_TOKEN;

export function chunkText(
  text: string,
  documentId: string,
): Omit<Chunk, "document_id">[] & { document_id?: string }[] {
  if (!text.trim()) return [];

  // Split into sentences (crude but good enough for V1).
  // Keeps the terminating punctuation on each sentence.
  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: Omit<Chunk, "document_id">[] = [];
  let current: string[] = [];
  let currentChars = 0;
  let chunkIndex = 0;

  const flush = () => {
    if (current.length === 0) return;
    const text = current.join(" ");
    chunks.push({
      chunk_index: chunkIndex++,
      text,
      token_count: Math.round(text.length / CHARS_PER_TOKEN),
      heading_path: [],
      metadata: {},
    });
  };

  for (const sentence of sentences) {
    const len = sentence.length;

    if (currentChars + len > TARGET_CHARS && current.length > 0) {
      flush();
      // Start next chunk with overlap tail from current
      const tail: string[] = [];
      let tailChars = 0;
      for (let i = current.length - 1; i >= 0; i--) {
        tail.unshift(current[i]);
        tailChars += current[i].length;
        if (tailChars >= OVERLAP_CHARS) break;
      }
      current = tail;
      currentChars = tailChars;
    }

    current.push(sentence);
    currentChars += len;
  }

  flush();

  return chunks.map((c) => ({ ...c, document_id: documentId }));
}
