// Local embeddings via Transformers.js. Runs on the user's machine — no
// API key, no cost, works offline. First call downloads ~130 MB of model
// weights to `.cache/` (gitignored).
//
// Model: Xenova/gte-small — 384-dim, English, decent quality for 18-doc
// corpus. Swap to gte-base or bge-small via the MODEL_ID below if quality
// is lacking in V1.1.

import { pipeline } from "npm:@huggingface/transformers@3.0.2";

const MODEL_ID = "Xenova/gte-small";
const EMBEDDING_DIM = 384;

// deno-lint-ignore no-explicit-any
let extractor: any = null;

async function getExtractor() {
  if (extractor) return extractor;
  console.log(`[embed] loading ${MODEL_ID} (first run downloads ~130 MB)`);
  extractor = await pipeline("feature-extraction", MODEL_ID, {
    dtype: "fp32",
  });
  return extractor;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const ex = await getExtractor();
  const results: number[][] = [];

  // Batch to keep memory bounded
  const BATCH = 16;
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const output = await ex(batch, {
      pooling: "mean",
      normalize: true,
    });
    // output.tolist() returns number[][] for batches
    const arr = output.tolist() as number[][];
    for (const vec of arr) {
      if (vec.length !== EMBEDDING_DIM) {
        throw new Error(
          `Embedding dim mismatch: got ${vec.length}, expected ${EMBEDDING_DIM}`,
        );
      }
      results.push(vec);
    }
    if (texts.length > BATCH) {
      console.log(`[embed] ${Math.min(i + BATCH, texts.length)}/${texts.length}`);
    }
  }
  return results;
}

export function embeddingDim(): number {
  return EMBEDDING_DIM;
}
