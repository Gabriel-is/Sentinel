# OCC Public Document Harvest — Seed Corpus

> **Provenance note:** Original harvest doc lost in chat handoff. This file
> was rebuilt by Claude via web research on 2026-04-17. URL list verified
> as publicly indexed via search-engine results on theocc.com — but every
> candidate returns **HTTP 403 to automated fetch** (Deno, curl, WebFetch
> all blocked by OCC's edge/WAF, even with a realistic Chrome User-Agent).
>
> **Implication:** automated ingest from these URLs will not work from a
> Supabase edge function or any datacenter IP. The pipeline must read from
> a manually-seeded Supabase Storage bucket. The 22 URLs below remain valid
> as **citation targets** for the dash page (a human browser can open them
> fine), but the raw bytes need to be fetched from a residential connection
> and uploaded once.
>
> See `occ-context-graph-spec.md` §5.1 (revised) for the resulting ingest
> shape.

## Manual cache flow (revised primary path)

1. From a residential connection, download each of the 22 URLs to local
   disk, preserving the filename suffix at the end of the URL (the GUID-
   prefixed `getmedia` and `getcontentasset` paths produce ugly filenames —
   rename to the `local_filename` shown below for clarity).
2. Upload to Supabase Storage:
   `corpus-raw/occ/<local_filename>` (one bucket, flat layout).
3. Run `deno task ingest occ` — `_core/run.ts` will read from
   `corpus-raw/occ/`, parse, chunk, embed, persist. The `source_url` field
   on each `sentinel_documents` row carries the original theocc.com URL
   for citation rendering.

## Categorization summary

| Category | Count | Notes |
|---|---:|---|
| `annual_report` | 3 | 2018, 2023, 2024 financials |
| `risk_framework` | 4 | RMF, third-party RMF, R&WD plan, RMF landing page |
| `governance` | 4 | Board + Governance & Nominating + Risk + Technology committee charters |
| `technology` | 4 | Renaissance / cloud / Ovation platform — primary SDLC/QA-pitch material |
| `pqd` | 2 | PFMI disclosures landing + narrative PDF |
| `regulatory_filing` | 2 | Two SR-OCC rule change filings |
| `strategic` | 3 | Executives, Board roster, Transformation hub |
| **Total** | **22** | |

## URL list

### Annual reports (3)

```
1. URL:           https://annualreport.theocc.com/getcontentasset/132d062a-e3b0-418c-b7b7-3337dec55adc/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/occ-2024-financials.pdf
   local_filename: occ-2024-financials.pdf
   title:          OCC 2024 Financials
   doc_type:       pdf
   category:       annual_report
   platform:       null
   classifier_hint: occ[-_]?2024[-_]?financials\.pdf$
   fetch_status:   403 (needs manual cache)
   notes:          table-heavy financial statements; OCR not needed but text density is low in some pages

2. URL:           https://annualreport.theocc.com/getcontentasset/5fa96c20-2ef0-4665-9264-586bd18387d7/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/occ_2023_-financials_2-23-24_-final.pdf
   local_filename: occ-2023-financials.pdf
   title:          OCC 2023 Financials
   doc_type:       pdf
   category:       annual_report
   platform:       null
   classifier_hint: occ[-_]?2023[-_]?financials.*\.pdf$
   fetch_status:   403
   notes:          table-heavy

3. URL:           https://www.theocc.com/getattachment/f3f461e9-fd92-406e-a261-efd97ff6ff6f/occ-2018-annual-report.pdf
   local_filename: occ-2018-annual-report.pdf
   title:          OCC 2018 Annual Report
   doc_type:       pdf
   category:       annual_report
   platform:       null
   classifier_hint: occ-?\d{4}-annual-report\.pdf$
   fetch_status:   403
   notes:          legacy design narrative; useful for cross-year comparison
```

### Risk management framework (4)

```
4. URL:           https://www.theocc.com/getmedia/3c9809d7-1671-4976-91da-121d21b47d53/Risk-Management-Framework.pdf
   local_filename: risk-management-framework.pdf
   title:          OCC Risk Management Framework
   doc_type:       pdf
   category:       risk_framework
   platform:       null
   classifier_hint: risk-management-framework\.pdf$
   fetch_status:   403
   notes:          canonical RMF doc

5. URL:           https://www.theocc.com/getcontentasset/68a1ea2d-ddae-4a93-a309-100bf70a0f28/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/third-party-risk-management-framework.pdf
   local_filename: third-party-risk-management-framework.pdf
   title:          OCC Third-Party Risk Management Framework (eff. 2025-11-18)
   doc_type:       pdf
   category:       risk_framework
   platform:       null
   classifier_hint: third-party-risk-management-framework\.pdf$
   fetch_status:   403
   notes:          vendor-risk relevant; ties to SR 11-7 conversations

6. URL:           https://www.theocc.com/getmedia/e2cb031f-f53e-4c0b-981b-c3817bff79c9/GenUse_PartGuide_06182021.pdf
   local_filename: rwd-participant-guide.pdf
   title:          OCC Recovery and Orderly Wind-Down Plan Participant Guide
   doc_type:       pdf
   category:       risk_framework
   platform:       null
   classifier_hint: (GenUse_)?PartGuide.*\.pdf$
   fetch_status:   403
   notes:          public R&WD summary; DCO requirement

7. URL:           https://www.theocc.com/risk-management/risk-management-framework
   local_filename: risk-management-framework-landing.html
   title:          OCC - Risk Management Framework (landing page)
   doc_type:       html
   category:       risk_framework
   platform:       null
   classifier_hint: /risk-management/risk-management-framework/?$
   fetch_status:   403
   notes:          narrative + 3-lines-of-defense diagram described inline
```

### Governance — board + committee charters (4)

```
8. URL:           https://www.theocc.com/getmedia/99ed48a4-aa44-45ac-8dee-9399b479a1c8/board_of_directors_charter.pdf
   local_filename: board-of-directors-charter.pdf
   title:          Board of Directors Charter and Corporate Governance Principles
   doc_type:       pdf
   category:       governance
   platform:       null
   classifier_hint: board_of_directors_charter\.pdf$
   fetch_status:   403
   notes:          governance backbone

9. URL:           https://www.theocc.com/getmedia/483ac739-0d43-46d2-a1ca-7ed38094975c/governance_nominating_charter.pdf
   local_filename: governance-nominating-committee-charter.pdf
   title:          Governance and Nominating Committee Charter
   doc_type:       pdf
   category:       governance
   platform:       null
   classifier_hint: governance_nominating_charter\.pdf$
   fetch_status:   403
   notes:

10. URL:           https://www.theocc.com/getmedia/e71a4c1d-52dc-4c95-aeb1-98dab9159f41/risk_committee_charter.pdf
    local_filename: risk-committee-charter.pdf
    title:          Risk Committee Charter
    doc_type:       pdf
    category:       governance
    platform:       null
    classifier_hint: risk_committee_charter\.pdf$
    fetch_status:   403
    notes:          maps to AI RMF GOVERN function — strong cross-link target

11. URL:           https://www.theocc.com/getmedia/aa0b642e-9032-4723-b819-26548d50e667/technology_committee_charter.pdf
    local_filename: technology-committee-charter.pdf
    title:          Technology Committee Charter
    doc_type:       pdf
    category:       governance
    platform:       null
    classifier_hint: technology_committee_charter\.pdf$
    fetch_status:   403
    notes:          KEY DOC for QA/SDLC pitch — board-level tech oversight
```

### Technology — Renaissance / cloud transformation / platform (4)

```
12. URL:           https://www.theocc.com/newsroom/views/2023/05-25-occs-renaissance-initiative-heralds-a-new-era-in-cloud-native-fintech
    local_filename: renaissance-cloud-native-fintech.html
    title:          OCC's Renaissance Initiative Heralds a New Era in Cloud-Native Fintech
    doc_type:       html
    category:       technology
    platform:       aws
    classifier_hint: occs-renaissance-initiative.*cloud-native-fintech
    fetch_status:   403
    notes:          cloud-native narrative; cites AWS

13. URL:           https://www.theocc.com/Newsroom/Insights/2019/11-26-OCC-Moving-Clearing-Data-and-Risk-Applicatio
    local_filename: clearing-data-risk-cloud-migration.html
    title:          OCC Moving Clearing Data and Risk Applications to the Cloud
    doc_type:       html
    category:       technology
    platform:       aws
    classifier_hint: 11-26-OCC-Moving-Clearing-Data-and-Risk-Applicatio
    fetch_status:   403
    notes:          cloud migration scope detail

14. URL:           https://www.theocc.com/company-information/occ-transformation/proposed-path-to-cloud-adoption
    local_filename: proposed-path-to-cloud-adoption.html
    title:          OCC - Proposed Path to Cloud Adoption
    doc_type:       html
    category:       technology
    platform:       aws
    classifier_hint: /occ-transformation/proposed-path-to-cloud-adoption/?$
    fetch_status:   403
    notes:          SEC no-objection context

15. URL:           https://www.theocc.com/getcontentasset/0db1ac5e-ca85-43b6-a109-4354a572d912/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/ovation-platform-changes-and-enhancements_trade-sources_jan2024.pdf
    local_filename: ovation-platform-changes-jan2024.pdf
    title:          Ovation Platform Changes and Enhancements for Trade Sources (Jan 2024)
    doc_type:       pdf
    category:       technology
    platform:       aws
    classifier_hint: ovation-platform-changes-and-enhancements.*\.pdf$
    fetch_status:   403
    notes:          KEY DOC for QA/SDLC pitch — release-management surface
```

### Public Quantitative Disclosures / PFMI (2)

```
16. URL:           https://www.theocc.com/risk-management/pfmi-disclosures
    local_filename: pfmi-disclosures-landing.html
    title:          OCC - PFMI Disclosures (landing page)
    doc_type:       html
    category:       pqd
    platform:       null
    classifier_hint: /risk-management/pfmi-disclosures/?$
    fetch_status:   403
    notes:          index of quarterly PQDs

17. URL:           https://www.theocc.com/getmedia/4664dece-7172-42a5-8f55-5982f358b696/pfmi-disclosures.pdf
    local_filename: pfmi-disclosures-narrative.pdf
    title:          OCC Disclosure Framework for Financial Market Infrastructures (PFMI narrative)
    doc_type:       pdf
    category:       pqd
    platform:       null
    classifier_hint: pfmi-disclosures\.pdf$
    fetch_status:   403
    notes:          narrative companion to quarterly quantitative file
```

### Regulatory filings (2)

```
18. URL:           https://www.theocc.com/getmedia/d62230fa-018d-4472-9a48-05152029b997/sr_occ_2024_016.pdf
    local_filename: sr-occ-2024-016.pdf
    title:          SR-OCC-2024-016 Proposed Rule Change Filing
    doc_type:       pdf
    category:       regulatory_filing
    platform:       null
    classifier_hint: sr[_-]occ[_-]\d{4}[_-]\d{3}\.pdf$
    fetch_status:   403
    notes:          canonical 19b-4-style filing

19. URL:           https://www.theocc.com/getmedia/88a24549-3a86-458f-9231-d0b072608c63/SR-OCC-2024-002.pdf
    local_filename: sr-occ-2024-002.pdf
    title:          SR-OCC-2024-002 Proposed Rule Change (T+1 conforming changes)
    doc_type:       pdf
    category:       regulatory_filing
    platform:       null
    classifier_hint: SR-OCC-\d{4}-\d{3}\.pdf$
    fetch_status:   403
    notes:
```

### Strategic — about / leadership (3)

```
20. URL:           https://www.theocc.com/company-information/executives
    local_filename: executives.html
    title:          OCC - Executives
    doc_type:       html
    category:       strategic
    platform:       null
    classifier_hint: /company-information/executives/?$
    fetch_status:   403
    notes:          org chart source — useful entity-extraction target

21. URL:           https://www.theocc.com/company-information/board-of-directors
    local_filename: board-of-directors.html
    title:          OCC - Board of Directors
    doc_type:       html
    category:       strategic
    platform:       null
    classifier_hint: /company-information/board-of-directors/?$
    fetch_status:   403
    notes:          board roster

22. URL:           https://www.theocc.com/occ-transformation
    local_filename: occ-transformation-hub.html
    title:          OCC Transformation (Renaissance program landing)
    doc_type:       html
    category:       strategic
    platform:       aws
    classifier_hint: /occ-transformation/?$
    fetch_status:   403
    notes:          Renaissance program hub; ties governance to technology
```

## What got dropped from the 26-URL candidate set

- 2 archive index pages (annual-reports index, board-charters index) — link-mining targets, not corpus material. Better to ingest the leaf docs directly.
- 1 2019 Renaissance press release — superseded by the 2023 cloud-native-fintech narrative (#12) and the transformation hub (#22).
- 1 2023 SEC RIN cybersecurity comment letter — interesting but tangential to the SDLC/QA pitch; can add in V2 if relation-extraction needs more cyber surface area.

## MyOCC verification

Zero URLs in this list contain `myocc`. A unit test in `adapters/occ/`
should assert this and fail the build if violated.

## V2 candidates (not in seed)

- The two index pages above (treated as scrapers, not corpus docs).
- Renaissance 2019 press release.
- 2023 cyber comment letter.
- Quarterly PQD spreadsheets (XLSX parser needed).
- Older annual reports (2017 and prior) for trend analysis.
- OCC RAFM / margin methodology white papers if findable on theocc.com.

## Open data questions for ratification

1. Are 3 annual reports enough, or should we shift one slot to a 4th annual
   report (e.g. 2022) to make year-over-year edges more interesting?
2. The two index pages were dropped — do you want them in for category-page
   citations from the dash page?
3. Comment letter (#23 from candidate set) — include in V1 for cyber
   posture, or defer?
4. Manual cache — do you want me to wire the pipeline to also accept a
   pre-prepared local folder (e.g. `data/sources/occ/`) so caching is
   filesystem-based instead of Supabase Storage upload? Faster local dev,
   slower production. Or both paths?
