// OCC public document seed corpus — Ovation data layouts.
//
// Source hub: https://www.theocc.com/company-information/occ-transformation/data-layouts
// See adapters/occ/docs/occ-data-layouts-links.md for harvest provenance.
//
// V1 scope is the 18 unique items published on the Data Layouts & Schemas
// page above. Testing & Certification, ENCORE legacy manuals, and other
// sibling pages under /occ-transformation are V2 candidates.
//
// Fetch reality: every URL returns 403 to automated fetch from datacenter
// IPs. The user drops local copies into data/sources/occ/ and the
// pipeline reads from disk. `url` is the citation target on the dash
// page, not a runtime fetch URL.

import type { SourceSpec } from "../_core/types.ts";

export const OCC_SOURCES: SourceSpec[] = [
  // ── Summary / orientation (2) ───────────────────────────────
  {
    url: "https://www.theocc.com/company-information/occ-transformation/data-layouts",
    local_filename: "OV_Layout_Documentation_Updates_Summary.pdf",
    title: "Layout Documentation Updates Summary (Ed. 1.9, October 2025)",
    doc_type: "pdf",
    category: "summary",
    platform: "ovation",
    classifier_hint: "OV_Layout_Documentation_Updates_Summary\\.pdf$",
    notes: "edition tracker — hub page is stable; Download PDF routes to current",
  },
  {
    url: "https://www.theocc.com/getmedia/08171c22-8d53-4dc6-a041-6e72e288b29a/OV_Clearing_Risk_Data_Layout_Changes_Summary.pdf",
    local_filename: "OV_Clearing_Risk_Data_Layout_Changes_Summary.pdf",
    title: "Clearing and Risk Data Layout Changes Summary (Ed. 1.9, October 2025)",
    doc_type: "pdf",
    category: "summary",
    platform: "ovation",
    classifier_hint: "OV_Clearing_Risk_Data_Layout_Changes_Summary\\.pdf$",
  },

  // ── Ovation System Input (3) ────────────────────────────────
  {
    url: "https://www.theocc.com/getmedia/2e5c9d6f-6080-4333-9694-178ad4c04940/OV_CSV_Input_Guide_for-Clearing_Members.pdf",
    local_filename: "OV_CSV_Input_Guide_for-Clearing_Members.pdf",
    title: "CSV Input Guide for Clearing Members (Ed. 1.4, January 2025)",
    doc_type: "pdf",
    category: "input",
    platform: "ovation",
    classifier_hint: "OV_CSV_Input_Guide_for-Clearing_Members\\.pdf$",
  },
  {
    url: "https://www.theocc.com/company-information/occ-transformation/data-layouts",
    local_filename: "OV_CSV_Input_Templates_for_Clearing_Members.xlsx",
    title: "CSV Input Templates for Clearing Members (Ed. 1.1, January 2025)",
    doc_type: "xlsx",
    category: "input",
    platform: "ovation",
    classifier_hint: "OV_CSV_Input_Templates_for_Clearing_Members\\.xlsx$",
    notes: "V2 ingest — XLSX parsing skipped in V1; stub row only",
  },
  {
    url: "https://www.theocc.com/getmedia/91c74b19-4b44-4c95-b8e5-2753c1bd53dd/OV_DDS_Delta_Position_Limits_Ref_Guide_CM.pdf",
    local_filename: "OV_DDS_Delta_Position_Limits_Ref_Guide_CM.pdf",
    title: "DDS Delta Position Limits Reference Guide for Clearing Members (Ed. 1.1, February 2024)",
    doc_type: "pdf",
    category: "input",
    platform: "ovation",
    classifier_hint: "OV_DDS_Delta_Position_Limits_Ref_Guide_CM\\.pdf$",
    notes: "listed under both Input and Output on the hub; dedupe via content_hash",
  },

  // ── Ovation System Output (11) ──────────────────────────────
  {
    url: "https://www.theocc.com/getmedia/7aa16792-da55-45ff-944b-4a6b9e4443d1/OV_DDS_Collateral_Output_Guide.pdf",
    local_filename: "OV_DDS_Collateral_Output_Guide.pdf",
    title: "DDS Collateral Output Guide (Ed. 1.2, December 2024)",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_Collateral_Output_Guide\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/06cced4d-001b-452c-9b76-28b064dba355/OV_DDS-FIXML_Futures_Message_Flow_Ref_Guide.pdf",
    local_filename: "OV_DDS-FIXML_Futures_Message_Flow_Ref_Guide.pdf",
    title: "DDS/FIXML Futures Message Flow Reference Guide (Ed. 1.0, September 2024)",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS-FIXML_Futures_Message_Flow_Ref_Guide\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/adb82faf-1b16-4ed0-a01f-be12cf2777f5/OV_DDS_Market_Data_Output_Guide.pdf",
    local_filename: "OV_DDS_Market_Data_Output.pdf",
    title: "DDS Market Data Output Guide (Ed. 1.5, October 2025)",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_Market_Data_Output(_Guide)?\\.pdf$",
    notes: "user's file dropped the '_Guide' suffix; classifier regex tolerates both",
  },
  {
    url: "https://www.theocc.com/getmedia/eab72bd1-1beb-4c11-80b0-c191b25a3428/OV_DDS_OnDemand_Positions_Guide.pdf",
    local_filename: "OV_DDS_OnDemand_Positions_Guide.pdf",
    title: "DDS On-Demand Positions Guide (Ed. 1.1, February 2024)",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_OnDemand_Positions_Guide\\.pdf$",
  },
  {
    url: "https://www.theocc.com/company-information/occ-transformation/data-layouts",
    local_filename: "OV_DDS_Output_Connectivity_Setup_Guide.pdf",
    title: "DDS Output Connectivity Set Up Guide (Ed. 1.0, April 2025)",
    doc_type: "pdf",
    category: "connectivity",
    platform: "ovation",
    classifier_hint: "OV_DDS_Output_Connectivity_Setup_Guide\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/7ddf6f7c-de6c-41a5-9473-57f5fbae7e55/OV_DDS_Output_Overview_Guide.pdf",
    local_filename: "OV_DDS_Output_Overview_Guide.pdf",
    title: "DDS Output Overview Guide (Ed. 1.5, February 2026)",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_Output_Overview_Guide\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/9b593a2e-effd-4ff3-845e-addb48b2a033/OV_DDS_RBH-CPM_Output_Guide.pdf",
    local_filename: "OV_DDS_RBH-CPM_Output_Guide.pdf",
    title: "DDS Risk Based Haircuts / Customer Portfolio Margining (RBH/CPM) Output Guide",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_RBH-CPM_Output_Guide\\.pdf$",
  },
  {
    url: "https://www.theocc.com/company-information/occ-transformation/data-layouts",
    local_filename: "OV_DDS_Stock-Loan_Output_Guide_Hedge_Program.pdf",
    title: "DDS Stock Loan Output Guide – Hedge Program (Ed. 1.0, November 2022)",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_Stock[-_]?Loan_Output_Guide_Hedge(_Program)?\\.pdf$",
    notes: "paired with Market Loan variant — strong sibling_of edge candidate",
  },
  {
    url: "https://www.theocc.com/getmedia/d72be0c6-6563-4cab-bb66-e935774b3207/OV_DDS_Stock-Loan_Output_Guide_MarketLoan_Program_1.pdf",
    local_filename: "OV_DDS_Stock-Loan_Output_Guide_MarketLoan_Program_1.pdf",
    title: "DDS Stock Loan Output Guide – Market Loan Program (Ed. 1.3, May 2025)",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_Stock[-_]?Loan_Output_Guide_MarketLoan(_Program)?(_\\d+)?\\.pdf$",
    notes: "paired with Hedge variant — strong sibling_of edge candidate",
  },
  {
    url: "https://www.theocc.com/getmedia/7e8375e5-c54d-4aed-a1b4-cef1c07fbb89/OV_DDS_Trades_Positions_E-A_Output_Guide.pdf",
    local_filename: "OV_DDS_Trades_Positions_E-A_Output_Guide.pdf",
    title: "DDS Trades, Positions, and E&A Output Guide (Ed. 1.8, March 2026)",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_Trades_Positions_E-A_Output_Guide\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/ce237a7a-ebdc-480a-894e-a79e9d4098e5/OV_LOPR_Reference_Guide_for_Firms.pdf",
    local_filename: "OV_LOPR_Reference_Guide_for_Firms.pdf",
    title: "LOPR Reference Guide for Firms (Ed. 1.4, November 2024)",
    doc_type: "pdf",
    category: "input",
    platform: "ovation",
    classifier_hint: "OV_LOPR_Reference_Guide_for_Firms\\.pdf$",
    notes: "appears under Output on the hub but semantically a firm-side input reference",
  },

  // ── Ovation Schemas (2 — FIXML zips; V2 ingest) ─────────────
  {
    url: "https://www.theocc.com/company-information/occ-transformation/data-layouts/fixml-schema-definition-changes",
    local_filename: "FIXML.zip",
    title: "FIXML Schemas 4.4",
    doc_type: "zip",
    category: "fixml_schema",
    platform: "ovation",
    classifier_hint: "^FIXML\\.zip$",
    notes: "V2 — unzip, ingest individual XSDs as linked nodes; V1 stub for edge targeting only",
  },
  {
    url: "https://www.theocc.com/company-information/occ-transformation/data-layouts/ovation-fixml-schema-5-0-definition-files",
    local_filename: "fixml-occ-main-5-0-SP2.zip",
    title: "FIXML Schema 5.0 (Stock Loan only)",
    doc_type: "zip",
    category: "fixml_schema",
    platform: "ovation",
    classifier_hint: "^fixml-occ-main-5-0(-[A-Za-z0-9]+)?\\.zip$",
    notes: "V2 — see FIXML.zip note",
  },
];

// Compile-time guards.
const EXPECTED_COUNT = 18;
if (OCC_SOURCES.length !== EXPECTED_COUNT) {
  throw new Error(
    `Expected ${EXPECTED_COUNT} OCC sources, got ${OCC_SOURCES.length}`,
  );
}
for (const s of OCC_SOURCES) {
  if (s.url.toLowerCase().includes("myocc")) {
    throw new Error(`MyOCC URL forbidden: ${s.url}`);
  }
  if (!s.url.toLowerCase().includes("theocc.com")) {
    throw new Error(`Non-theocc.com URL forbidden: ${s.url}`);
  }
}

// Items the pipeline actively chunks/embeds in V1 (skips zip + xlsx).
export function v1IngestableSources(): SourceSpec[] {
  return OCC_SOURCES.filter((s) => s.doc_type === "pdf" || s.doc_type === "html");
}
