// OCC document classifier — Ovation/ENCORE data layout corpus.
//
// Taxonomy from the build spec:
//   doc_type:  ovation_guide | encore_guide | fixml_schema | summary | record_layout
//   platform:  ovation | encore | both
//   category:  dds_output | input | connectivity | testing | reference | summary | fixml_schema
//
// Regex-first against filename + URL path. The 31 seed docs all classify
// deterministically; LLM fallback is signaled (rule="llm") only if both
// the regex pass and the SourceSpec hint pass miss.

import type { Classification, ParsedDoc, SourceSpec } from "../_core/types.ts";
import { OCC_SOURCES } from "./sources.ts";

interface RuleOutput {
  doc_type: string;
  category: string;
  platform: string;
}

// Order matters: first match wins. More specific patterns first.
const RULES: Array<{ match: RegExp; out: RuleOutput }> = [
  // ── Summary / orientation ───────────────────────────────────
  { match: /OV_Clearing_Risk_Data_Layout_Changes_Summary\.pdf$/i,
    out: { doc_type: "summary", category: "summary", platform: "both" } },
  { match: /Ovation-Platform-Changes-Enhancements_Clearing-Members.*\.pdf$/i,
    out: { doc_type: "summary", category: "summary", platform: "ovation" } },
  { match: /Ovation-Platform-Changes-and-Enhancements_Trade-Sources.*\.pdf$/i,
    out: { doc_type: "summary", category: "summary", platform: "ovation" } },
  { match: /Ovation_Conversion_FAQ.*\.pdf$/i,
    out: { doc_type: "summary", category: "summary", platform: "both" } },

  // ── Ovation DDS output guides ───────────────────────────────
  { match: /OV_DDS_Output_Overview_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_Market_Data_Output_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_Collateral_Output_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_Trades_Positions_E-A_Output_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_OnDemand_Positions_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_RBH-CPM_Output_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_Stock-Loan_Output_Guide.*\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS_Delta_Position_Limits_Ref_Guide_CM\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },
  { match: /OV_DDS-FIXML_Futures_Message_Flow_Ref_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "dds_output", platform: "ovation" } },

  // ── Ovation inbound / submission guides ─────────────────────
  { match: /OV_CSV_Input_Guide_for-Clearing_Members\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "input", platform: "ovation" } },
  { match: /OV_LOPR_Reference_Guide_for_Firms\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "input", platform: "ovation" } },
  { match: /Query_Ex_by_Ex_API_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "input", platform: "ovation" } },

  // ── FIXML schema hub pages ──────────────────────────────────
  { match: /fixml-schema-definition-changes/i,
    out: { doc_type: "fixml_schema", category: "fixml_schema", platform: "ovation" } },
  { match: /ovation-fixml-schema-5-0-definition-files/i,
    out: { doc_type: "fixml_schema", category: "fixml_schema", platform: "ovation" } },

  // ── Testing & connectivity ──────────────────────────────────
  { match: /occ-ovation-external-testing-functionality\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "connectivity", platform: "ovation" } },
  { match: /Ovation-External-Party-Testing-FAQ\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "testing", platform: "ovation" } },
  { match: /Inbound_FIXML_Connectivity_Setup_Procedures\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "connectivity", platform: "ovation" } },
  { match: /DDS_Recipient_Setup_Guide\.pdf$/i,
    out: { doc_type: "ovation_guide", category: "connectivity", platform: "ovation" } },

  // ── ENCORE legacy ───────────────────────────────────────────
  { match: /ENCORE_DDS_Overview_Implementation\.pdf$/i,
    out: { doc_type: "encore_guide", category: "reference", platform: "encore" } },
  { match: /ENCORE_DDS_Guide_Delta_Position_Limits\.pdf$/i,
    out: { doc_type: "encore_guide", category: "reference", platform: "encore" } },
  { match: /ENCORE_OnDemand_Req_Dev_Ref_Guide\.pdf$/i,
    out: { doc_type: "encore_guide", category: "reference", platform: "encore" } },
  { match: /Inbound_FIXML_Developer_Ref_Prop_Transmission\.pdf$/i,
    out: { doc_type: "encore_guide", category: "reference", platform: "encore" } },
  { match: /Inbound_FIXML_CM_Ref_Delta_Position_Limits\.pdf$/i,
    out: { doc_type: "encore_guide", category: "reference", platform: "encore" } },
  { match: /inbound_cftc\.pdf$/i,
    out: { doc_type: "record_layout", category: "reference", platform: "encore" } },
  { match: /series-download-record-layout\.pdf$/i,
    out: { doc_type: "record_layout", category: "reference", platform: "encore" } },
  { match: /http-volume-contract-date-record-layout\.pdf$/i,
    out: { doc_type: "record_layout", category: "reference", platform: "encore" } },
  { match: /http-directory-record-layout\.pdf$/i,
    out: { doc_type: "record_layout", category: "reference", platform: "encore" } },
  { match: /flex-open-interest-record-layout\.pdf$/i,
    out: { doc_type: "record_layout", category: "reference", platform: "encore" } },
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
