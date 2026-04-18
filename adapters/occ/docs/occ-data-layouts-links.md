# OCC — Data Layouts & Schemas — Download Links

> **Provenance:** This is the user's verbatim harvest doc, recovered after
> Claude's first reconstruction targeted the wrong corpus (governance /
> annual reports). Source hub:
> https://www.theocc.com/company-information/occ-transformation/data-layouts

The live page uses collapsible "Show More" sections and also points
Clearing Members to MyOCC.com for some protected docs (Contrary Intentions
output guide, Delta Position Limits output for Exchanges, ENCORE current
layouts). The list below is every public-facing OCC-hosted document
confirmed from this hub plus its children (FIXML 4.4 / 5.0 schema pages,
Clearing/Risk Summary, connectivity, testing docs). Anything marked
(MyOCC) is behind the member login and is **not** included in the seed
corpus.

**Total fetchable public seed: 31 URLs.** (The kickoff prompt's "22"
estimate was approximate — the actual harvest count is 31.)

**Fetch reality:** OCC's web edge returns HTTP 403 to all automated
fetches from datacenter IPs. URLs are publicly browseable from a
residential connection. Ingest reads bytes from a manually-seeded
Supabase Storage bucket (`corpus-raw/occ/`); URLs are citation targets
only.

---

## 1. Summary / orientation (4)

- Ovation Platform – Clearing and Risk Data Layout Changes Summary
  https://www.theocc.com/getmedia/08171c22-8d53-4dc6-a041-6e72e288b29a/OV_Clearing_Risk_Data_Layout_Changes_Summary.pdf

- Ovation Platform – Changes and Enhancements for Clearing Members (Jan 2024)
  https://www.theocc.com/getmedia/8e2487b2-a4e3-4bb1-947a-a52f39828f5f/Ovation-Platform-Changes-Enhancements_Clearing-Members_Jan2024.pdf

- Ovation Platform – Changes and Enhancements for Trade Sources (Jan 2024)
  https://www.theocc.com/getmedia/0db1ac5e-ca85-43b6-a109-4354a572d912/Ovation-Platform-Changes-and-Enhancements_Trade-Sources_Jan2024.pdf

- Ovation Conversion FAQ (Nov 2022)
  https://www.theocc.com/getmedia/0f1d3eaf-edd3-4ea4-99a4-155c8e620446/FINAL-Ovation_Conversion_FAQ-November-2022.pdf

---

## 2. Ovation DDS output guides (9 fetchable; 2 MyOCC)

- DDS Output Overview Guide
  https://www.theocc.com/getmedia/7ddf6f7c-de6c-41a5-9473-57f5fbae7e55/OV_DDS_Output_Overview_Guide.pdf

- DDS Market Data Output Guide
  https://www.theocc.com/getmedia/adb82faf-1b16-4ed0-a01f-be12cf2777f5/OV_DDS_Market_Data_Output_Guide.pdf

- DDS Collateral Output Guide
  https://www.theocc.com/getmedia/7aa16792-da55-45ff-944b-4a6b9e4443d1/OV_DDS_Collateral_Output_Guide.pdf

- DDS Trades, Positions, Exercise & Assignment Output Guide
  https://www.theocc.com/getmedia/7e8375e5-c54d-4aed-a1b4-cef1c07fbb89/OV_DDS_Trades_Positions_E-A_Output_Guide.pdf

- DDS On-Demand Positions Guide
  https://www.theocc.com/getmedia/eab72bd1-1beb-4c11-80b0-c191b25a3428/OV_DDS_OnDemand_Positions_Guide.pdf

- DDS RBH / CPM Output Guide
  https://www.theocc.com/getmedia/9b593a2e-effd-4ff3-845e-addb48b2a033/OV_DDS_RBH-CPM_Output_Guide.pdf

- DDS Stock Loan Output Guide (Market Loan Program)
  https://www.theocc.com/getmedia/d72be0c6-6563-4cab-bb66-e935774b3207/OV_DDS_Stock-Loan_Output_Guide_MarketLoan_Program_1.pdf

- DDS Delta Position Limits Reference Guide for Clearing Members
  https://www.theocc.com/getmedia/91c74b19-4b44-4c95-b8e5-2753c1bd53dd/OV_DDS_Delta_Position_Limits_Ref_Guide_CM.pdf

- DDS / FIXML Futures Message Flow Reference Guide
  https://www.theocc.com/getmedia/06cced4d-001b-452c-9b76-28b064dba355/OV_DDS-FIXML_Futures_Message_Flow_Ref_Guide.pdf

- DDS Contrary Intentions Output Guide — (MyOCC, excluded)
- DDS Delta Position Limits Output Guide for Exchanges — (MyOCC, excluded)

---

## 3. Ovation inbound / submission guides (3)

- CSV Input Guide for Clearing Members
  https://www.theocc.com/getmedia/2e5c9d6f-6080-4333-9694-178ad4c04940/OV_CSV_Input_Guide_for-Clearing_Members.pdf

- LOPR Reference Guide for Firms
  https://www.theocc.com/getmedia/ce237a7a-ebdc-480a-894e-a79e9d4098e5/OV_LOPR_Reference_Guide_for_Firms.pdf

- Query Exercise by Exception API Guide
  https://www.theocc.com/getmedia/c4c6b680-2073-4386-b9ec-e9fe4cb5e6ed/Query_Ex_by_Ex_API_Guide.pdf

---

## 4. FIXML schema definition files (2 hub pages)

- FIXML 4.4 Definition Files
  https://www.theocc.com/company-information/occ-transformation/data-layouts/fixml-schema-definition-changes
- FIXML 5.0 Definition Files (Stock Loan uses 5.0)
  https://www.theocc.com/company-information/occ-transformation/data-layouts/ovation-fixml-schema-5-0-definition-files

Note: individual .xsd files are linked from those two pages. They're
served from the same /getmedia/ pattern but the page-level URLs above are
the entry points. ~40 XSDs across the two versions; out of scope for V1
(see V2 candidates below).

---

## 5. Testing & connectivity (4)

- Ovation External Testing Functionality
  https://www.theocc.com/getContentAsset/b47e9ef6-1f14-4705-99af-1ac05f084e07/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/occ-ovation-external-testing-functionality.pdf

- Ovation External Party Testing FAQ
  https://www.theocc.com/getmedia/39081af3-f104-4efe-bf07-f6013f444932/Ovation-External-Party-Testing-FAQ.pdf

- Inbound FIXML Connectivity Setup Procedures
  https://www.theocc.com/getmedia/408f921d-abbb-4ddb-aae9-ddf94f0e4815/Inbound_FIXML_Connectivity_Setup_Procedures.pdf

- DDS Recipient Setup Guide (Real-Time MQ & Batch Pull)
  https://www.theocc.com/getmedia/ec5a2069-f272-48b6-a1ca-92af0afbb5fc/DDS_Recipient_Setup_Guide.pdf

---

## 6. Current ENCORE layouts (linked from hub for reference until Ovation launch) (9)

- ENCORE DDS Guide – Overview / Implementation
  https://www.theocc.com/getmedia/edaac932-1d30-4c31-899d-e06a5ebaf591/ENCORE_DDS_Overview_Implementation.pdf

- ENCORE DDS Guide – Delta Position Limits
  https://www.theocc.com/getmedia/63b34fce-8b84-4161-80d6-7381013cbf2d/ENCORE_DDS_Guide_Delta_Position_Limits.pdf

- ENCORE On-Demand Request Developer Reference Guide
  https://www.theocc.com/getmedia/75e7ebed-2e5c-4682-8a68-075fba49f884/ENCORE_OnDemand_Req_Dev_Ref_Guide.pdf

- ENCORE Inbound FIXML Developer Reference Guide – Proprietary Transmissions
  https://www.theocc.com/getmedia/3d4c9aff-4856-4e46-b624-8f6a31c1330a/Inbound_FIXML_Developer_Ref_Prop_Transmission.pdf

- Inbound FIXML CM Reference – Delta Position Limits
  https://www.theocc.com/getmedia/aec621a2-359f-429a-9f12-ab6ba9c3fc29/Inbound_FIXML_CM_Ref_Delta_Position_Limits.pdf

- Inbound CFTC Large Trader Record Layout
  https://www.theocc.com/getmedia/48345da6-b86d-452f-9020-0ce907021a09/inbound_cftc.pdf

- Series Download Record Layout
  https://www.theocc.com/getmedia/b192b56e-58e5-486d-a67f-b6f6e787dc50/series-download-record-layout.pdf

- HTTP Volume Download with Contract Date Record Layout
  https://www.theocc.com/getmedia/83ff9e6c-5c5d-4e34-be7a-3085df49499d/http-volume-contract-date-record-layout.pdf

- HTTP Directory of Listed Products Record Layout
  https://www.theocc.com/getmedia/a140e253-8f38-451f-ab0d-f90110443109/http-directory-record-layout.pdf

- Flex Open Interest Record Layout
  https://www.theocc.com/getmedia/c4bbef04-3062-46d5-865c-2361036e8c99/flex-open-interest-record-layout.pdf

---

## Gaps / caveats for Chris

1. OCC's web edge blocks automated fetches (403). Can't confirm 100% of
   the "Show More" expansions from the outside. These links are every
   public-facing doc surfaced via Google's index of the hub + its child
   pages + the Oct 2024 InfoMemo #55385 link bundle.

2. Anything tagged (MyOCC) lives behind the member portal — public hub
   shows the title but the file isn't publicly served. Contrary
   Intentions output, Delta Position Limits exchange output, and
   "current ENCORE manuals and user guides" all route there.

3. FIXML 4.4 and 5.0 each have ~40 individual .xsd files linked off
   their respective hub pages. The two hub URLs are seeded; the ~80
   leaf XSDs are V2 (ingest XSDs as a structured doc_type with the
   same chunk/embed pipeline, or render them as nodes in the graph
   without chunking).

4. Testing was paused June 2025; OCC said in the 04/17/2026 version of
   the Testing page that Ovation testing reopens Q2 2026. Worth a
   sanity-check before kicking anything off.
