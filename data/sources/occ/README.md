# Sentinel corpus raw sources — OCC public docs (V1)

This folder holds the raw files the ingest pipeline reads. **Nothing here
except this README and the `.gitignore` is committed to git** — PDFs,
XLSXs, and zips are OCC's copyright and not Sentinel's to redistribute.

## V1 scope (18 items)

Everything on OCC's public Ovation Data Layouts & Schemas hub:

https://www.theocc.com/company-information/occ-transformation/data-layouts

Filenames expected by `adapters/occ/sources.ts` (case-sensitive):

### Summary / orientation (2)
- `OV_Layout_Documentation_Updates_Summary.pdf`
- `OV_Clearing_Risk_Data_Layout_Changes_Summary.pdf`

### Ovation System Input (3)
- `OV_CSV_Input_Guide_for-Clearing_Members.pdf`
- `OV_CSV_Input_Templates_for_Clearing_Members.xlsx` *(V2 parse)*
- `OV_DDS_Delta_Position_Limits_Ref_Guide_CM.pdf`

### Ovation System Output (11 — 1 shared with Input, so 10 unique)
- `OV_DDS_Collateral_Output_Guide.pdf`
- `OV_DDS-FIXML_Futures_Message_Flow_Ref_Guide.pdf`
- `OV_DDS_Market_Data_Output.pdf` *(or `OV_DDS_Market_Data_Output_Guide.pdf` — classifier accepts both)*
- `OV_DDS_OnDemand_Positions_Guide.pdf`
- `OV_DDS_Output_Connectivity_Setup_Guide.pdf`
- `OV_DDS_Output_Overview_Guide.pdf`
- `OV_DDS_RBH-CPM_Output_Guide.pdf`
- `OV_DDS_Stock-Loan_Output_Guide_Hedge_Program.pdf`
- `OV_DDS_Stock-Loan_Output_Guide_MarketLoan_Program_1.pdf`
- `OV_DDS_Trades_Positions_E-A_Output_Guide.pdf`
- `OV_LOPR_Reference_Guide_for_Firms.pdf`

### Ovation Schemas (2 — V2 parse; V1 stubs only)
- `FIXML.zip`
- `fixml-occ-main-5-0-SP2.zip`

## V2 candidates (sibling pages on /occ-transformation/)

Not in V1. Add by downloading from the relevant page, dropping into this
folder, and appending entries to `adapters/occ/sources.ts`. The ingest
pipeline is content-hash idempotent — re-running picks up the new files
and skips the ones already in the DB.

- **Testing and Certification Information** page — Ovation External
  Testing Functionality PDF, External Party Testing FAQ, Inbound FIXML
  Connectivity Setup Procedures, DDS Recipient Setup Guide
- **Manuals and User Guides** page — ENCORE legacy layouts (caveat: some
  or all may be MyOCC-gated)
- **APIs** page — Query Exercise by Exception API Guide
- **Recent Updates** feed — release-notes polling (incremental adapter
  refresh)
- **Proposed Path to Cloud Adoption** — if/when a governance corpus is
  added as a second swappable entry in the dash dropdown

## Why these are gitignored

OCC's copyrighted documents. Publicly browseable at theocc.com but
Sentinel isn't a redistribution channel. The repo only stores the URL
pointers and citation metadata in `adapters/occ/sources.ts`. The ingest
pipeline produces embeddings + extracted text in the Sentinel Supabase
DB — those are Sentinel's derived artifacts.
