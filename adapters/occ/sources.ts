// OCC public document seed corpus.
// All 22 URLs are publicly browseable on theocc.com but return 403 to
// automated fetch from datacenter IPs (OCC's WAF). The pipeline reads
// from Supabase Storage `corpus-raw/occ/<local_filename>` rather than
// fetching these URLs at ingest time. The `url` field below is the
// citation target rendered in the dash page.
//
// See adapters/occ/docs/occ-data-layouts-links.md for the full harvest
// notes and per-doc rationale.

import type { SourceSpec } from "../_core/types.ts";

export const OCC_SOURCES: SourceSpec[] = [
  // ── Annual reports (3) ──────────────────────────────────────
  {
    url: "https://annualreport.theocc.com/getcontentasset/132d062a-e3b0-418c-b7b7-3337dec55adc/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/occ-2024-financials.pdf",
    local_filename: "occ-2024-financials.pdf",
    title: "OCC 2024 Financials",
    doc_type: "pdf",
    category: "annual_report",
    platform: null,
    classifier_hint: "occ[-_]?2024[-_]?financials\\.pdf$",
    notes: "table-heavy financial statements",
  },
  {
    url: "https://annualreport.theocc.com/getcontentasset/5fa96c20-2ef0-4665-9264-586bd18387d7/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/occ_2023_-financials_2-23-24_-final.pdf",
    local_filename: "occ-2023-financials.pdf",
    title: "OCC 2023 Financials",
    doc_type: "pdf",
    category: "annual_report",
    platform: null,
    classifier_hint: "occ[-_]?2023[-_]?financials.*\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getattachment/f3f461e9-fd92-406e-a261-efd97ff6ff6f/occ-2018-annual-report.pdf",
    local_filename: "occ-2018-annual-report.pdf",
    title: "OCC 2018 Annual Report",
    doc_type: "pdf",
    category: "annual_report",
    platform: null,
    classifier_hint: "occ-?\\d{4}-annual-report\\.pdf$",
    notes: "legacy design narrative; useful for cross-year comparison",
  },

  // ── Risk management framework (4) ───────────────────────────
  {
    url: "https://www.theocc.com/getmedia/3c9809d7-1671-4976-91da-121d21b47d53/Risk-Management-Framework.pdf",
    local_filename: "risk-management-framework.pdf",
    title: "OCC Risk Management Framework",
    doc_type: "pdf",
    category: "risk_framework",
    platform: null,
    classifier_hint: "risk-management-framework\\.pdf$",
    notes: "canonical RMF doc",
  },
  {
    url: "https://www.theocc.com/getcontentasset/68a1ea2d-ddae-4a93-a309-100bf70a0f28/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/third-party-risk-management-framework.pdf",
    local_filename: "third-party-risk-management-framework.pdf",
    title: "OCC Third-Party Risk Management Framework",
    doc_type: "pdf",
    category: "risk_framework",
    platform: null,
    classifier_hint: "third-party-risk-management-framework\\.pdf$",
    notes: "vendor-risk; ties to SR 11-7 conversations",
  },
  {
    url: "https://www.theocc.com/getmedia/e2cb031f-f53e-4c0b-981b-c3817bff79c9/GenUse_PartGuide_06182021.pdf",
    local_filename: "rwd-participant-guide.pdf",
    title: "OCC Recovery and Orderly Wind-Down Plan Participant Guide",
    doc_type: "pdf",
    category: "risk_framework",
    platform: null,
    classifier_hint: "(GenUse_)?PartGuide.*\\.pdf$",
    notes: "DCO-mandated public R&WD summary",
  },
  {
    url: "https://www.theocc.com/risk-management/risk-management-framework",
    local_filename: "risk-management-framework-landing.html",
    title: "OCC - Risk Management Framework (landing page)",
    doc_type: "html",
    category: "risk_framework",
    platform: null,
    classifier_hint: "/risk-management/risk-management-framework/?$",
    notes: "narrative + 3-lines-of-defense",
  },

  // ── Governance — board + committee charters (4) ─────────────
  {
    url: "https://www.theocc.com/getmedia/99ed48a4-aa44-45ac-8dee-9399b479a1c8/board_of_directors_charter.pdf",
    local_filename: "board-of-directors-charter.pdf",
    title: "Board of Directors Charter and Corporate Governance Principles",
    doc_type: "pdf",
    category: "governance",
    platform: null,
    classifier_hint: "board_of_directors_charter\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/483ac739-0d43-46d2-a1ca-7ed38094975c/governance_nominating_charter.pdf",
    local_filename: "governance-nominating-committee-charter.pdf",
    title: "Governance and Nominating Committee Charter",
    doc_type: "pdf",
    category: "governance",
    platform: null,
    classifier_hint: "governance_nominating_charter\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/e71a4c1d-52dc-4c95-aeb1-98dab9159f41/risk_committee_charter.pdf",
    local_filename: "risk-committee-charter.pdf",
    title: "Risk Committee Charter",
    doc_type: "pdf",
    category: "governance",
    platform: null,
    classifier_hint: "risk_committee_charter\\.pdf$",
    notes: "maps to AI RMF GOVERN — strong cross-link target",
  },
  {
    url: "https://www.theocc.com/getmedia/aa0b642e-9032-4723-b819-26548d50e667/technology_committee_charter.pdf",
    local_filename: "technology-committee-charter.pdf",
    title: "Technology Committee Charter",
    doc_type: "pdf",
    category: "governance",
    platform: null,
    classifier_hint: "technology_committee_charter\\.pdf$",
    notes: "KEY DOC for QA/SDLC pitch",
  },

  // ── Technology — Renaissance / cloud / Ovation (4) ──────────
  {
    url: "https://www.theocc.com/newsroom/views/2023/05-25-occs-renaissance-initiative-heralds-a-new-era-in-cloud-native-fintech",
    local_filename: "renaissance-cloud-native-fintech.html",
    title: "OCC's Renaissance Initiative Heralds a New Era in Cloud-Native Fintech",
    doc_type: "html",
    category: "technology",
    platform: "aws",
    classifier_hint: "occs-renaissance-initiative.*cloud-native-fintech",
  },
  {
    url: "https://www.theocc.com/Newsroom/Insights/2019/11-26-OCC-Moving-Clearing-Data-and-Risk-Applicatio",
    local_filename: "clearing-data-risk-cloud-migration.html",
    title: "OCC Moving Clearing Data and Risk Applications to the Cloud",
    doc_type: "html",
    category: "technology",
    platform: "aws",
    classifier_hint: "11-26-OCC-Moving-Clearing-Data-and-Risk-Applicatio",
  },
  {
    url: "https://www.theocc.com/company-information/occ-transformation/proposed-path-to-cloud-adoption",
    local_filename: "proposed-path-to-cloud-adoption.html",
    title: "OCC - Proposed Path to Cloud Adoption",
    doc_type: "html",
    category: "technology",
    platform: "aws",
    classifier_hint: "/occ-transformation/proposed-path-to-cloud-adoption/?$",
  },
  {
    url: "https://www.theocc.com/getcontentasset/0db1ac5e-ca85-43b6-a109-4354a572d912/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/ovation-platform-changes-and-enhancements_trade-sources_jan2024.pdf",
    local_filename: "ovation-platform-changes-jan2024.pdf",
    title: "Ovation Platform Changes and Enhancements for Trade Sources (Jan 2024)",
    doc_type: "pdf",
    category: "technology",
    platform: "aws",
    classifier_hint: "ovation-platform-changes-and-enhancements.*\\.pdf$",
    notes: "KEY DOC for QA/SDLC pitch — release management",
  },

  // ── PFMI public quantitative disclosures (2) ────────────────
  {
    url: "https://www.theocc.com/risk-management/pfmi-disclosures",
    local_filename: "pfmi-disclosures-landing.html",
    title: "OCC - PFMI Disclosures (landing)",
    doc_type: "html",
    category: "pqd",
    platform: null,
    classifier_hint: "/risk-management/pfmi-disclosures/?$",
  },
  {
    url: "https://www.theocc.com/getmedia/4664dece-7172-42a5-8f55-5982f358b696/pfmi-disclosures.pdf",
    local_filename: "pfmi-disclosures-narrative.pdf",
    title: "OCC Disclosure Framework for Financial Market Infrastructures",
    doc_type: "pdf",
    category: "pqd",
    platform: null,
    classifier_hint: "pfmi-disclosures\\.pdf$",
  },

  // ── Regulatory filings (2) ──────────────────────────────────
  {
    url: "https://www.theocc.com/getmedia/d62230fa-018d-4472-9a48-05152029b997/sr_occ_2024_016.pdf",
    local_filename: "sr-occ-2024-016.pdf",
    title: "SR-OCC-2024-016 Proposed Rule Change Filing",
    doc_type: "pdf",
    category: "regulatory_filing",
    platform: null,
    classifier_hint: "sr[_-]occ[_-]\\d{4}[_-]\\d{3}\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/88a24549-3a86-458f-9231-d0b072608c63/SR-OCC-2024-002.pdf",
    local_filename: "sr-occ-2024-002.pdf",
    title: "SR-OCC-2024-002 Proposed Rule Change (T+1 conforming changes)",
    doc_type: "pdf",
    category: "regulatory_filing",
    platform: null,
    classifier_hint: "SR-OCC-\\d{4}-\\d{3}\\.pdf$",
  },

  // ── Strategic — about / leadership (3) ──────────────────────
  {
    url: "https://www.theocc.com/company-information/executives",
    local_filename: "executives.html",
    title: "OCC - Executives",
    doc_type: "html",
    category: "strategic",
    platform: null,
    classifier_hint: "/company-information/executives/?$",
    notes: "org chart source for entity extraction",
  },
  {
    url: "https://www.theocc.com/company-information/board-of-directors",
    local_filename: "board-of-directors.html",
    title: "OCC - Board of Directors",
    doc_type: "html",
    category: "strategic",
    platform: null,
    classifier_hint: "/company-information/board-of-directors/?$",
  },
  {
    url: "https://www.theocc.com/occ-transformation",
    local_filename: "occ-transformation-hub.html",
    title: "OCC Transformation (Renaissance program landing)",
    doc_type: "html",
    category: "strategic",
    platform: "aws",
    classifier_hint: "/occ-transformation/?$",
    notes: "ties governance to technology",
  },
];

// Compile-time guards.
if (OCC_SOURCES.length !== 22) {
  throw new Error(`Expected 22 OCC sources, got ${OCC_SOURCES.length}`);
}
for (const s of OCC_SOURCES) {
  if (s.url.toLowerCase().includes("myocc")) {
    throw new Error(`MyOCC URL forbidden: ${s.url}`);
  }
  if (!s.url.toLowerCase().includes("theocc.com")) {
    throw new Error(`Non-theocc.com URL forbidden: ${s.url}`);
  }
}
