// Adapter registry. Each adapter module exports a default Adapter
// instance and is registered here by corpus_id.

import type { Adapter } from "./types.ts";
import occ from "../occ/adapter.ts";

const ADAPTERS: Record<string, Adapter> = {
  [occ.corpus_id]: occ,
};

export function getAdapter(corpus_id: string): Adapter {
  const a = ADAPTERS[corpus_id];
  if (!a) {
    const known = Object.keys(ADAPTERS).join(", ");
    throw new Error(`Unknown corpus_id: ${corpus_id}. Known: ${known}`);
  }
  return a;
}

export function listAdapters(): Adapter[] {
  return Object.values(ADAPTERS);
}
