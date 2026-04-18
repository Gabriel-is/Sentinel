# Sentinel corpus raw sources — OCC public docs

This folder holds the raw files the ingest pipeline reads. **Nothing in
here except this README and the `.gitignore` is committed to git** —
PDFs and zips are OCC's copyright and not Sentinel's to redistribute.

## What goes here

31 public documents from theocc.com's Ovation/ENCORE data-layout hub.
Expected filenames (case-sensitive, must match `adapters/occ/sources.ts`):

### Summary / orientation (4)
- `OV_Clearing_Risk_Data_Layout_Changes_Summary.pdf`
- `Ovation-Platform-Changes-Enhancements_Clearing-Members_Jan2024.pdf`
- `Ovation-Platform-Changes-and-Enhancements_Trade-Sources_Jan2024.pdf`
- `FINAL-Ovation_Conversion_FAQ-November-2022.pdf`

### DDS output guides (9)
- `OV_DDS_Output_Overview_Guide.pdf`
- `OV_DDS_Market_Data_Output_Guide.pdf`
- `OV_DDS_Collateral_Output_Guide.pdf`
- `OV_DDS_Trades_Positions_E-A_Output_Guide.pdf`
- `OV_DDS_OnDemand_Positions_Guide.pdf`
- `OV_DDS_RBH-CPM_Output_Guide.pdf`
- `OV_DDS_Stock-Loan_Output_Guide_MarketLoan_Program_1.pdf`
- `OV_DDS_Delta_Position_Limits_Ref_Guide_CM.pdf`
- `OV_DDS-FIXML_Futures_Message_Flow_Ref_Guide.pdf`

### Inbound / submission guides (3)
- `OV_CSV_Input_Guide_for-Clearing_Members.pdf`
- `OV_LOPR_Reference_Guide_for_Firms.pdf`
- `Query_Ex_by_Ex_API_Guide.pdf`

### FIXML schema hubs (2, save the hub pages as HTML)
- `fixml-schema-definition-changes.html`
- `ovation-fixml-schema-5-0-definition-files.html`

### Testing & connectivity (4)
- `occ-ovation-external-testing-functionality.pdf`
- `Ovation-External-Party-Testing-FAQ.pdf`
- `Inbound_FIXML_Connectivity_Setup_Procedures.pdf`
- `DDS_Recipient_Setup_Guide.pdf`

### ENCORE legacy layouts (9)
- `ENCORE_DDS_Overview_Implementation.pdf`
- `ENCORE_DDS_Guide_Delta_Position_Limits.pdf`
- `ENCORE_OnDemand_Req_Dev_Ref_Guide.pdf`
- `Inbound_FIXML_Developer_Ref_Prop_Transmission.pdf`
- `Inbound_FIXML_CM_Ref_Delta_Position_Limits.pdf`
- `inbound_cftc.pdf`
- `series-download-record-layout.pdf`
- `http-volume-contract-date-record-layout.pdf`
- `http-directory-record-layout.pdf`
- `flex-open-interest-record-layout.pdf`

## Reconciling what you have against the expected list

From the Sentinel repo root:

```
python3 scripts/check_occ_sources.py
```

Prints three lists:
- **Missing** — expected filename not present in `data/sources/occ/`
- **Extra** — present but not in `sources.ts` (candidates for V2 add)
- **Close match** — probably the same doc with a different filename
  (script uses fuzzy match; confirm manually, then either rename on
  disk or update `sources.ts`)

## Why these are gitignored

These are OCC's copyrighted documents. They're publicly browseable at
theocc.com but Sentinel isn't a redistribution channel. The repo only
stores the URL pointers and citation metadata in `adapters/occ/sources.ts`.
Running the ingest locally produces embeddings + extracted text in the
Sentinel Supabase DB — those are Sentinel's derived artifacts, not the
original PDFs.
