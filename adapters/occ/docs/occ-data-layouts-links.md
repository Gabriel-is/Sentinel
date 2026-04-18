# OCC Data Layouts & Schemas — V1 seed corpus (18 items)

> **Provenance:** Original user-pasted harvest plus ground-truth listing
> from https://www.theocc.com/company-information/occ-transformation/data-layouts
> (the public Ovation Data Layouts & Schemas page). V1 scope is exactly
> what that page publishes.

## Fetch reality (unchanged from V0)

OCC's web edge returns HTTP 403 to automated fetch from datacenter IPs.
All 18 URLs are publicly browseable from a residential connection but
cannot be fetched by Deno/curl/WebFetch. The user downloads each file
once from a residential connection and drops them into
`data/sources/occ/` in their local Sentinel checkout. The ingest
pipeline reads from disk. `source_url` on each `sentinel_documents` row
is the citation target for the dash page, not a runtime fetch URL.

## Categorization summary

| Section | Items | Notes |
|---|---:|---|
| Summary / orientation | 2 | Layout Documentation Updates + Clearing/Risk Data Layout Changes |
| Ovation System Input | 3 | CSV Input Guide, CSV Input Templates (XLSX — V2 parse), Delta Position Limits Ref Guide |
| Ovation System Output | 11 listed (10 unique; Delta Position Limits is shared with Input) | Collateral, FIXML Futures Msg Flow, Market Data, On-Demand Positions, Output Connectivity, Output Overview, RBH/CPM, Stock Loan Hedge, Stock Loan MarketLoan, Trades+Positions+E&A, LOPR |
| Ovation Schemas | 2 | FIXML 4.4 zip, FIXML 5.0 zip (V2 parse of individual XSDs) |
| **V1 total** | **18 unique** | |

## URLs (V1 seed — 18 items)

### Summary / orientation

```
1. URL:   https://www.theocc.com/company-information/occ-transformation/data-layouts  (hub; current-edition routes via Download PDF button)
   file:  OV_Layout_Documentation_Updates_Summary.pdf
   title: Layout Documentation Updates Summary (Ed. 1.9, October 2025)

2. URL:   https://www.theocc.com/getmedia/08171c22-8d53-4dc6-a041-6e72e288b29a/OV_Clearing_Risk_Data_Layout_Changes_Summary.pdf
   file:  OV_Clearing_Risk_Data_Layout_Changes_Summary.pdf
   title: Clearing and Risk Data Layout Changes Summary (Ed. 1.9, October 2025)
```

### Ovation System Input

```
3. URL:   https://www.theocc.com/getmedia/2e5c9d6f-6080-4333-9694-178ad4c04940/OV_CSV_Input_Guide_for-Clearing_Members.pdf
   file:  OV_CSV_Input_Guide_for-Clearing_Members.pdf
   title: CSV Input Guide for Clearing Members (Ed. 1.4, January 2025)

4. URL:   https://www.theocc.com/company-information/occ-transformation/data-layouts  (hub)
   file:  OV_CSV_Input_Templates_for_Clearing_Members.xlsx
   title: CSV Input Templates for Clearing Members (Ed. 1.1, January 2025)
   note:  XLSX — V2 parser; stub row only in V1

5. URL:   https://www.theocc.com/getmedia/91c74b19-4b44-4c95-b8e5-2753c1bd53dd/OV_DDS_Delta_Position_Limits_Ref_Guide_CM.pdf
   file:  OV_DDS_Delta_Position_Limits_Ref_Guide_CM.pdf
   title: DDS Delta Position Limits Reference Guide for Clearing Members (Ed. 1.1, February 2024)
   note:  listed under both Input and Output on the hub; single file
```

### Ovation System Output (10 unique)

```
 6. OV_DDS_Collateral_Output_Guide.pdf                                     — DDS Collateral Output Guide (Ed. 1.2, Dec 2024)
 7. OV_DDS-FIXML_Futures_Message_Flow_Ref_Guide.pdf                        — DDS/FIXML Futures Message Flow Reference Guide (Ed. 1.0, Sep 2024)
 8. OV_DDS_Market_Data_Output.pdf                                          — DDS Market Data Output Guide (Ed. 1.5, Oct 2025)  [note: user has file w/o "_Guide" suffix]
 9. OV_DDS_OnDemand_Positions_Guide.pdf                                    — DDS On-Demand Positions Guide (Ed. 1.1, Feb 2024)
10. OV_DDS_Output_Connectivity_Setup_Guide.pdf                             — DDS Output Connectivity Set Up Guide (Ed. 1.0, Apr 2025)
11. OV_DDS_Output_Overview_Guide.pdf                                       — DDS Output Overview Guide (Ed. 1.5, Feb 2026)
12. OV_DDS_RBH-CPM_Output_Guide.pdf                                        — DDS RBH/CPM Output Guide
13. OV_DDS_Stock-Loan_Output_Guide_Hedge_Program.pdf                       — DDS Stock Loan Output Guide – Hedge Program (Ed. 1.0, Nov 2022)
14. OV_DDS_Stock-Loan_Output_Guide_MarketLoan_Program_1.pdf                — DDS Stock Loan Output Guide – Market Loan Program (Ed. 1.3, May 2025)
15. OV_DDS_Trades_Positions_E-A_Output_Guide.pdf                           — DDS Trades, Positions, and E&A Output Guide (Ed. 1.8, Mar 2026)
16. OV_LOPR_Reference_Guide_for_Firms.pdf                                  — LOPR Reference Guide for Firms (Ed. 1.4, Nov 2024)
```

### Ovation Schemas (2)

```
17. URL:   https://www.theocc.com/company-information/occ-transformation/data-layouts/fixml-schema-definition-changes
    file:  FIXML.zip
    title: FIXML Schemas 4.4
    note:  V2 — unzip and ingest individual XSDs; V1 is a stub row for edge targeting only

18. URL:   https://www.theocc.com/company-information/occ-transformation/data-layouts/ovation-fixml-schema-5-0-definition-files
    file:  fixml-occ-main-5-0-SP2.zip
    title: FIXML Schema 5.0 (for Stock Loan only)
    note:  V2 — see FIXML.zip note
```

## V2 candidates (not in V1 scope)

Sibling pages under `/company-information/occ-transformation/`, each of
which is a one-shot addition to `adapters/occ/sources.ts`:

- **Testing and Certification Information** — Ovation External Testing
  Functionality, External Party Testing FAQ, Inbound FIXML Connectivity
  Setup Procedures, DDS Recipient Setup Guide. Adds ~4 docs.
- **Manuals and User Guides** — ENCORE legacy layouts. Caveat: original
  harvest noted "current ENCORE manuals and user guides" route to
  MyOCC, so some may be gated.
- **APIs** — likely hosts the Query Exercise by Exception API Guide.
- **Recent Updates** — release-notes feed; polling adapter.
- **Learn about Ovation** — narrative content.
- **Proposed Path to Cloud Adoption** — reads well as a second corpus
  (Ovation-governance / cloud-strategy) if we want to light up the
  dropdown with a real second entry instead of placeholders.

## MyOCC exclusions (never in seed)

- DDS Contrary Intentions Output Guide (MyOCC)
- DDS Delta Position Limits Output Guide for Exchanges (MyOCC)
- ENCORE "current manuals and user guides" (MyOCC per hub note)

A compile-time guard in `sources.ts` rejects any URL containing `myocc`.
