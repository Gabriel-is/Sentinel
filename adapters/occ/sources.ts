// OCC public document seed corpus — Ovation/ENCORE data layout transition.
//
// Source hub: https://www.theocc.com/company-information/occ-transformation/data-layouts
// See adapters/occ/docs/occ-data-layouts-links.md for harvest provenance and
// per-doc rationale.
//
// Fetch reality: every URL returns HTTP 403 to automated fetch from
// datacenter IPs. The user drops local copies into data/sources/occ/ (or
// uploads to Supabase Storage corpus-raw/occ/), and the pipeline reads
// from disk/storage. The `url` field below is the citation target
// rendered in the dash page, not a runtime fetch URL.

import type { SourceSpec } from "../_core/types.ts";

export const OCC_SOURCES: SourceSpec[] = [
  // ── 1. Summary / orientation (4) ────────────────────────────
  {
    url: "https://www.theocc.com/getmedia/08171c22-8d53-4dc6-a041-6e72e288b29a/OV_Clearing_Risk_Data_Layout_Changes_Summary.pdf",
    local_filename: "OV_Clearing_Risk_Data_Layout_Changes_Summary.pdf",
    title: "Ovation Platform – Clearing and Risk Data Layout Changes Summary",
    doc_type: "pdf",
    category: "summary",
    platform: "ovation",
    classifier_hint: "OV_Clearing_Risk_Data_Layout_Changes_Summary\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/8e2487b2-a4e3-4bb1-947a-a52f39828f5f/Ovation-Platform-Changes-Enhancements_Clearing-Members_Jan2024.pdf",
    local_filename: "Ovation-Platform-Changes-Enhancements_Clearing-Members_Jan2024.pdf",
    title: "Ovation Platform – Changes and Enhancements for Clearing Members (Jan 2024)",
    doc_type: "pdf",
    category: "summary",
    platform: "ovation",
    classifier_hint: "Ovation-Platform-Changes-Enhancements_Clearing-Members.*\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/0db1ac5e-ca85-43b6-a109-4354a572d912/Ovation-Platform-Changes-and-Enhancements_Trade-Sources_Jan2024.pdf",
    local_filename: "Ovation-Platform-Changes-and-Enhancements_Trade-Sources_Jan2024.pdf",
    title: "Ovation Platform – Changes and Enhancements for Trade Sources (Jan 2024)",
    doc_type: "pdf",
    category: "summary",
    platform: "ovation",
    classifier_hint: "Ovation-Platform-Changes-and-Enhancements_Trade-Sources.*\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/0f1d3eaf-edd3-4ea4-99a4-155c8e620446/FINAL-Ovation_Conversion_FAQ-November-2022.pdf",
    local_filename: "FINAL-Ovation_Conversion_FAQ-November-2022.pdf",
    title: "Ovation Conversion FAQ (Nov 2022)",
    doc_type: "pdf",
    category: "summary",
    platform: "ovation",
    classifier_hint: "Ovation_Conversion_FAQ.*\\.pdf$",
  },

  // ── 2. Ovation DDS output guides (9) ────────────────────────
  {
    url: "https://www.theocc.com/getmedia/7ddf6f7c-de6c-41a5-9473-57f5fbae7e55/OV_DDS_Output_Overview_Guide.pdf",
    local_filename: "OV_DDS_Output_Overview_Guide.pdf",
    title: "DDS Output Overview Guide",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_Output_Overview_Guide\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/adb82faf-1b16-4ed0-a01f-be12cf2777f5/OV_DDS_Market_Data_Output_Guide.pdf",
    local_filename: "OV_DDS_Market_Data_Output_Guide.pdf",
    title: "DDS Market Data Output Guide",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_Market_Data_Output_Guide\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/7aa16792-da55-45ff-944b-4a6b9e4443d1/OV_DDS_Collateral_Output_Guide.pdf",
    local_filename: "OV_DDS_Collateral_Output_Guide.pdf",
    title: "DDS Collateral Output Guide",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_Collateral_Output_Guide\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/7e8375e5-c54d-4aed-a1b4-cef1c07fbb89/OV_DDS_Trades_Positions_E-A_Output_Guide.pdf",
    local_filename: "OV_DDS_Trades_Positions_E-A_Output_Guide.pdf",
    title: "DDS Trades, Positions, Exercise & Assignment Output Guide",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_Trades_Positions_E-A_Output_Guide\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/eab72bd1-1beb-4c11-80b0-c191b25a3428/OV_DDS_OnDemand_Positions_Guide.pdf",
    local_filename: "OV_DDS_OnDemand_Positions_Guide.pdf",
    title: "DDS On-Demand Positions Guide",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_OnDemand_Positions_Guide\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/9b593a2e-effd-4ff3-845e-addb48b2a033/OV_DDS_RBH-CPM_Output_Guide.pdf",
    local_filename: "OV_DDS_RBH-CPM_Output_Guide.pdf",
    title: "DDS RBH / CPM Output Guide",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_RBH-CPM_Output_Guide\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/d72be0c6-6563-4cab-bb66-e935774b3207/OV_DDS_Stock-Loan_Output_Guide_MarketLoan_Program_1.pdf",
    local_filename: "OV_DDS_Stock-Loan_Output_Guide_MarketLoan_Program_1.pdf",
    title: "DDS Stock Loan Output Guide (Market Loan Program)",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_Stock-Loan_Output_Guide.*\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/91c74b19-4b44-4c95-b8e5-2753c1bd53dd/OV_DDS_Delta_Position_Limits_Ref_Guide_CM.pdf",
    local_filename: "OV_DDS_Delta_Position_Limits_Ref_Guide_CM.pdf",
    title: "DDS Delta Position Limits Reference Guide for Clearing Members",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS_Delta_Position_Limits_Ref_Guide_CM\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/06cced4d-001b-452c-9b76-28b064dba355/OV_DDS-FIXML_Futures_Message_Flow_Ref_Guide.pdf",
    local_filename: "OV_DDS-FIXML_Futures_Message_Flow_Ref_Guide.pdf",
    title: "DDS / FIXML Futures Message Flow Reference Guide",
    doc_type: "pdf",
    category: "dds_output",
    platform: "ovation",
    classifier_hint: "OV_DDS-FIXML_Futures_Message_Flow_Ref_Guide\\.pdf$",
  },

  // ── 3. Ovation inbound / submission guides (3) ──────────────
  {
    url: "https://www.theocc.com/getmedia/2e5c9d6f-6080-4333-9694-178ad4c04940/OV_CSV_Input_Guide_for-Clearing_Members.pdf",
    local_filename: "OV_CSV_Input_Guide_for-Clearing_Members.pdf",
    title: "CSV Input Guide for Clearing Members",
    doc_type: "pdf",
    category: "input",
    platform: "ovation",
    classifier_hint: "OV_CSV_Input_Guide_for-Clearing_Members\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/ce237a7a-ebdc-480a-894e-a79e9d4098e5/OV_LOPR_Reference_Guide_for_Firms.pdf",
    local_filename: "OV_LOPR_Reference_Guide_for_Firms.pdf",
    title: "LOPR Reference Guide for Firms",
    doc_type: "pdf",
    category: "input",
    platform: "ovation",
    classifier_hint: "OV_LOPR_Reference_Guide_for_Firms\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/c4c6b680-2073-4386-b9ec-e9fe4cb5e6ed/Query_Ex_by_Ex_API_Guide.pdf",
    local_filename: "Query_Ex_by_Ex_API_Guide.pdf",
    title: "Query Exercise by Exception API Guide",
    doc_type: "pdf",
    category: "input",
    platform: "ovation",
    classifier_hint: "Query_Ex_by_Ex_API_Guide\\.pdf$",
  },

  // ── 4. FIXML schema definition files (2 hub pages) ──────────
  {
    url: "https://www.theocc.com/company-information/occ-transformation/data-layouts/fixml-schema-definition-changes",
    local_filename: "fixml-schema-definition-changes.html",
    title: "FIXML 4.4 Definition Files (hub)",
    doc_type: "html",
    category: "fixml_schema",
    platform: "ovation",
    classifier_hint: "fixml-schema-definition-changes",
    notes: "links to ~40 individual .xsd files; leaves are V2",
  },
  {
    url: "https://www.theocc.com/company-information/occ-transformation/data-layouts/ovation-fixml-schema-5-0-definition-files",
    local_filename: "ovation-fixml-schema-5-0-definition-files.html",
    title: "FIXML 5.0 Definition Files (hub) — Stock Loan",
    doc_type: "html",
    category: "fixml_schema",
    platform: "ovation",
    classifier_hint: "ovation-fixml-schema-5-0-definition-files",
    notes: "Stock Loan uses 5.0; ~40 .xsd leaves V2",
  },

  // ── 5. Testing & connectivity (4) ───────────────────────────
  {
    url: "https://www.theocc.com/getContentAsset/b47e9ef6-1f14-4705-99af-1ac05f084e07/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/occ-ovation-external-testing-functionality.pdf",
    local_filename: "occ-ovation-external-testing-functionality.pdf",
    title: "Ovation External Testing Functionality",
    doc_type: "pdf",
    category: "connectivity",
    platform: "ovation",
    classifier_hint: "occ-ovation-external-testing-functionality\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/39081af3-f104-4efe-bf07-f6013f444932/Ovation-External-Party-Testing-FAQ.pdf",
    local_filename: "Ovation-External-Party-Testing-FAQ.pdf",
    title: "Ovation External Party Testing FAQ",
    doc_type: "pdf",
    category: "testing",
    platform: "ovation",
    classifier_hint: "Ovation-External-Party-Testing-FAQ\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/408f921d-abbb-4ddb-aae9-ddf94f0e4815/Inbound_FIXML_Connectivity_Setup_Procedures.pdf",
    local_filename: "Inbound_FIXML_Connectivity_Setup_Procedures.pdf",
    title: "Inbound FIXML Connectivity Setup Procedures",
    doc_type: "pdf",
    category: "connectivity",
    platform: "ovation",
    classifier_hint: "Inbound_FIXML_Connectivity_Setup_Procedures\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/ec5a2069-f272-48b6-a1ca-92af0afbb5fc/DDS_Recipient_Setup_Guide.pdf",
    local_filename: "DDS_Recipient_Setup_Guide.pdf",
    title: "DDS Recipient Setup Guide (Real-Time MQ & Batch Pull)",
    doc_type: "pdf",
    category: "connectivity",
    platform: "ovation",
    classifier_hint: "DDS_Recipient_Setup_Guide\\.pdf$",
  },

  // ── 6. ENCORE legacy layouts (9) ────────────────────────────
  {
    url: "https://www.theocc.com/getmedia/edaac932-1d30-4c31-899d-e06a5ebaf591/ENCORE_DDS_Overview_Implementation.pdf",
    local_filename: "ENCORE_DDS_Overview_Implementation.pdf",
    title: "ENCORE DDS Guide – Overview / Implementation",
    doc_type: "pdf",
    category: "reference",
    platform: "encore",
    classifier_hint: "ENCORE_DDS_Overview_Implementation\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/63b34fce-8b84-4161-80d6-7381013cbf2d/ENCORE_DDS_Guide_Delta_Position_Limits.pdf",
    local_filename: "ENCORE_DDS_Guide_Delta_Position_Limits.pdf",
    title: "ENCORE DDS Guide – Delta Position Limits",
    doc_type: "pdf",
    category: "reference",
    platform: "encore",
    classifier_hint: "ENCORE_DDS_Guide_Delta_Position_Limits\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/75e7ebed-2e5c-4682-8a68-075fba49f884/ENCORE_OnDemand_Req_Dev_Ref_Guide.pdf",
    local_filename: "ENCORE_OnDemand_Req_Dev_Ref_Guide.pdf",
    title: "ENCORE On-Demand Request Developer Reference Guide",
    doc_type: "pdf",
    category: "reference",
    platform: "encore",
    classifier_hint: "ENCORE_OnDemand_Req_Dev_Ref_Guide\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/3d4c9aff-4856-4e46-b624-8f6a31c1330a/Inbound_FIXML_Developer_Ref_Prop_Transmission.pdf",
    local_filename: "Inbound_FIXML_Developer_Ref_Prop_Transmission.pdf",
    title: "ENCORE Inbound FIXML Developer Reference Guide – Proprietary Transmissions",
    doc_type: "pdf",
    category: "reference",
    platform: "encore",
    classifier_hint: "Inbound_FIXML_Developer_Ref_Prop_Transmission\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/aec621a2-359f-429a-9f12-ab6ba9c3fc29/Inbound_FIXML_CM_Ref_Delta_Position_Limits.pdf",
    local_filename: "Inbound_FIXML_CM_Ref_Delta_Position_Limits.pdf",
    title: "Inbound FIXML CM Reference – Delta Position Limits",
    doc_type: "pdf",
    category: "reference",
    platform: "encore",
    classifier_hint: "Inbound_FIXML_CM_Ref_Delta_Position_Limits\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/48345da6-b86d-452f-9020-0ce907021a09/inbound_cftc.pdf",
    local_filename: "inbound_cftc.pdf",
    title: "Inbound CFTC Large Trader Record Layout",
    doc_type: "pdf",
    category: "reference",
    platform: "encore",
    classifier_hint: "inbound_cftc\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/b192b56e-58e5-486d-a67f-b6f6e787dc50/series-download-record-layout.pdf",
    local_filename: "series-download-record-layout.pdf",
    title: "Series Download Record Layout",
    doc_type: "pdf",
    category: "reference",
    platform: "encore",
    classifier_hint: "series-download-record-layout\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/83ff9e6c-5c5d-4e34-be7a-3085df49499d/http-volume-contract-date-record-layout.pdf",
    local_filename: "http-volume-contract-date-record-layout.pdf",
    title: "HTTP Volume Download with Contract Date Record Layout",
    doc_type: "pdf",
    category: "reference",
    platform: "encore",
    classifier_hint: "http-volume-contract-date-record-layout\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/a140e253-8f38-451f-ab0d-f90110443109/http-directory-record-layout.pdf",
    local_filename: "http-directory-record-layout.pdf",
    title: "HTTP Directory of Listed Products Record Layout",
    doc_type: "pdf",
    category: "reference",
    platform: "encore",
    classifier_hint: "http-directory-record-layout\\.pdf$",
  },
  {
    url: "https://www.theocc.com/getmedia/c4bbef04-3062-46d5-865c-2361036e8c99/flex-open-interest-record-layout.pdf",
    local_filename: "flex-open-interest-record-layout.pdf",
    title: "Flex Open Interest Record Layout",
    doc_type: "pdf",
    category: "reference",
    platform: "encore",
    classifier_hint: "flex-open-interest-record-layout\\.pdf$",
  },
];

// Compile-time guards.
const EXPECTED_COUNT = 31;
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
