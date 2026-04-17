// OCC document classifier.
// Regex-first against the seed corpus filenames; the 22 OCC sources should
// classify deterministically without an LLM call. The LLM fallback signal
// is returned via rule="llm" so the caller can decide whether to invoke
// Haiku — _core/run.ts owns that decision.

import type { Classification, ParsedDoc, SourceSpec } from "../_core/types.ts";
import { OCC_SOURCES } from "./sources.ts";

interface RuleOutput {
  category: string;
  doc_type: string;        // adapter-defined sub-type within category
  platform: string | null;
}

// Deterministic rules in order; first match wins.
const RULES: Array<{
  match: RegExp;
  out: RuleOutput;
}> = [
  // Annual reports
  { match: /occ[-_]?\d{4}[-_]?financials\.pdf$/i,
    out: { category: "annual_report", doc_type: "financial_statements", platform: null } },
  { match: /occ-?\d{4}-annual-report\.pdf$/i,
    out: { category: "annual_report", doc_type: "annual_narrative", platform: null } },

  // Risk framework
  { match: /third-party-risk-management-framework\.pdf$/i,
    out: { category: "risk_framework", doc_type: "third_party_rmf", platform: null } },
  { match: /risk-management-framework\.pdf$/i,
    out: { category: "risk_framework", doc_type: "rmf_canonical", platform: null } },
  { match: /(GenUse_)?PartGuide.*\.pdf$/i,
    out: { category: "risk_framework", doc_type: "rwd_participant_guide", platform: null } },
  { match: /\/risk-management\/risk-management-framework\/?$/i,
    out: { category: "risk_framework", doc_type: "rmf_landing", platform: null } },

  // Governance — committee charters
  { match: /board_of_directors_charter\.pdf$/i,
    out: { category: "governance", doc_type: "board_charter", platform: null } },
  { match: /governance_nominating_charter\.pdf$/i,
    out: { category: "governance", doc_type: "committee_charter", platform: null } },
  { match: /risk_committee_charter\.pdf$/i,
    out: { category: "governance", doc_type: "committee_charter", platform: null } },
  { match: /technology_committee_charter\.pdf$/i,
    out: { category: "governance", doc_type: "committee_charter", platform: null } },

  // Technology — Renaissance / cloud / Ovation
  { match: /occs-renaissance-initiative.*cloud-native-fintech/i,
    out: { category: "technology", doc_type: "renaissance_narrative", platform: "aws" } },
  { match: /11-26-OCC-Moving-Clearing-Data-and-Risk-Applicatio/i,
    out: { category: "technology", doc_type: "cloud_migration", platform: "aws" } },
  { match: /\/occ-transformation\/proposed-path-to-cloud-adoption\/?$/i,
    out: { category: "technology", doc_type: "cloud_adoption_plan", platform: "aws" } },
  { match: /ovation-platform-changes-and-enhancements.*\.pdf$/i,
    out: { category: "technology", doc_type: "ovation_release_notes", platform: "aws" } },

  // PFMI
  { match: /\/risk-management\/pfmi-disclosures\/?$/i,
    out: { category: "pqd", doc_type: "pfmi_landing", platform: null } },
  { match: /pfmi-disclosures\.pdf$/i,
    out: { category: "pqd", doc_type: "pfmi_narrative", platform: null } },

  // Regulatory filings — SR-OCC-YYYY-NNN
  { match: /sr[_-]?occ[_-]?\d{4}[_-]?\d{3}\.pdf$/i,
    out: { category: "regulatory_filing", doc_type: "sr_occ_filing", platform: null } },

  // Strategic — about pages
  { match: /\/company-information\/executives\/?$/i,
    out: { category: "strategic", doc_type: "executives", platform: null } },
  { match: /\/company-information\/board-of-directors\/?$/i,
    out: { category: "strategic", doc_type: "board_roster", platform: null } },
  { match: /\/occ-transformation\/?$/i,
    out: { category: "strategic", doc_type: "transformation_hub", platform: "aws" } },
];

export function classifyByRule(doc: ParsedDoc): Classification | null {
  // Try matching against local_filename, then source_url, then title.
  for (const candidate of [doc.local_filename, doc.source_url, doc.title]) {
    for (const rule of RULES) {
      if (rule.match.test(candidate)) {
        return {
          category: rule.out.category,
          doc_type: rule.out.doc_type,
          platform: rule.out.platform,
          confidence: 1.0,
          rule: "regex",
        };
      }
    }
  }
  return null;
}

// Fallback to spec hint if regex misses (the SourceSpec already carries
// category and platform; this just promotes them to a Classification).
export function classifyBySpec(spec: SourceSpec): Classification {
  return {
    category: spec.category,
    doc_type: spec.category,
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

  // No regex, no spec — flag for LLM fallback (caller invokes Haiku).
  return {
    category: "unclassified",
    doc_type: "unknown",
    platform: null,
    confidence: 0.0,
    rule: "llm",
  };
}
