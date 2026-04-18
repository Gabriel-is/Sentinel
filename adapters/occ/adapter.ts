// OCC adapter — declares the corpus to Sentinel's adapter registry.
// All OCC-specific logic lives here and in sources.ts/classify.ts.
// Core code (adapters/_core/*) and Sentinel core (supabase/, cli/) must
// not reference "OCC" or "theocc" — verified by the reusability gate
// described in adapters/occ/docs/occ-context-graph-spec.md §3.

import type { Adapter, ParsedDoc, Classification } from "../_core/types.ts";
import { OCC_SOURCES } from "./sources.ts";
import { classifyOcc } from "./classify.ts";

const occAdapter: Adapter = {
  corpus_id: "occ",
  label: "OCC Public Docs",
  description:
    "18 public documents from theocc.com's Ovation Data Layouts & Schemas " +
    "hub: two summary docs, the CSV + LOPR input guides, ten DDS output " +
    "guides, the Output Connectivity setup guide, and FIXML 4.4 / 5.0 " +
    "schema bundles. Public sources only — no MyOCC content, no rulebook " +
    "ingestion, no proprietary data. ENCORE legacy manuals, testing & " +
    "certification docs, and cloud-adoption whitepapers live on sibling " +
    "pages and are V2 candidates.",
  sources: OCC_SOURCES,
  classify(doc: ParsedDoc): Promise<Classification> {
    return classifyOcc(doc);
  },
};

export default occAdapter;
