// OCC document classifier — Ovation data layouts V1 corpus (18 items).
//
// Taxonomy:
//   doc_type:  ovation_guide | summary | record_layout | fixml_schema | xlsx_template
//   platform:  ovation | both
//   category:  summary | input | dds_output | connectivity | fixml_schema
//
// V1 corpus is all-Ovation; ENCORE legacy and testing sibling-page docs
// are deferred to V2. The ENCORE variants of edge_type (e.g.
// encore_equivalent_of) remain in the schema for V2 but won't be
// populated in V1.

import type { Classification, ParsedDoc, SourceSpec } from "../_core/types.ts";
import { OCC_SOURCES } from "./sources.ts";

interface RuleOutput {
  doc_type: string;
  category: string;
  platform: string;
}

// Order matters: first match wins. Rules here match filenames the user
// actually has on disk (see screenshot + page listing at
// theocc.com/company-information/occ-transformation/data-layouts).
const RULES: Array<{ match: RegExp; out: RuleOutput }> = [
  // ── Summary / orientation ───────────────────────────────────
  { match: /OV_Clearing_Risk_Data_Layout_Changes_Summary\.pdf$/i,
    out: { doc_type: "summary", category: "summary", platform: "ovation" } },
  { match: /OV_Layout_Documentation_Updates_Summary\.pdf$/i,
    out: { doc_type: "summary", category: "summary", platform: "ovation" } },

  // ── Ovation System Input ────────────────────────────────────
  { match: /OV_CSV_Input_Guide_for-Clearing_Members\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "input", platform: "ovation" } },
  { match: /OV_CSV_Input_Templates_for_Clearing_Members\.xlsx$/i,
    out: { doc_type: "xlsx_template", category: "input", platform: "ovation" } },
  { match: /OV_LOPR_Reference_Guide_for_Firms\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "input", platform: "ovation" } },

  // ── DDS output guides ───────────────────────────────────────
  { match: /OV_DDS_Output_Overview_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_Market_Data_Output(_Guide)?\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_Collateral_Output_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_Trades_Positions_E-A_Output_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_OnDemand_Positions_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_RBH-CPM_Output_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_Stock[-_]Loan_Output_Guide_MarketLoan(_Program)?(_\d+)?\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_Stock[-_]Loan_Output_Guide_Hedge(_Program)?\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_Delta_Position_Limits_Ref_Guide_CM\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS-FIXML_Futures_Message_Flow_Ref_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },

  // ── Connectivity ────────────────────────────────────────────
  { match: /OV_DDS_Output_Connectivity_Setup_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "connectivity", platform: "ovation" } },

  // ── FIXML schema zips (V2 ingest — stub rows in V1) ─────────
  { match: /^FIXML\.zip$/i,
    out: { doc_type: "fixml_schema", category: "fixml_schema", platform: "ovation" } },
  { match: /^fixml-occ-main-5-0/i,
    out: { doc_type: "fixml_schema", category: "fixml_schema", platform: "ovation" } },
];

export function classifyByRule(doc: ParsedDoc): Classification | null {
  for (const candidate of [doc.local_filename, doc.source_url, doc.title]) {
    for (const rule of RULES) {
      if (rule.match.test(candidate)) {
        return {
          doc_type: rule.out.doc_type,
          category: rule.out.category,
          platform: rule.out.platform,
          confidence: 1.0,
          rule: "regex",
        };
      }
    }
  }
  return null;
}

export function classifyBySpec(spec: SourceSpec): Classification {
  return {
    doc_type: spec.doc_type,
    category: spec.category,
    platform: spec.platform,
    confidence: 0.6,
    rule: "spec_hint",
  };
}

export async function classifyOcc(doc: ParsedDoc): Promise<Classification> {
  const ruleHit = classifyByRule(doc);
  if (ruleHit) return ruleHit;

  const spec = OCC_SOURCES.find((s) => s.local_filename === doc.local_filename);
  if (spec) return classifyBySpec(spec);

  return {
    doc_type: "unknown",
    category: "unknown",
    platform: "unknown",
    confidence: 0.0,
    rule: "llm",
  };
}
