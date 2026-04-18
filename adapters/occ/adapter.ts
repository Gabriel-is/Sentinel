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
    "31 public documents from theocc.com covering OCC's Ovation/ENCORE " +
    "data layout transition: clearing and risk data layout summaries, " +
    "DDS output guides, inbound submission guides, FIXML 4.4 / 5.0 schema " +
    "hubs, testing and connectivity procedures, and the legacy ENCORE " +
    "record layouts retained for reference until Ovation launch. Public " +
    "sources only — no MyOCC content, no rulebook ingestion, no " +
    "proprietary data.",
  sources: OCC_SOURCES,
  classify(doc: ParsedDoc): Promise<Classification> {
    return classifyOcc(doc);
  },
};

export default occAdapter;
