# Sentinel — NIST AI RMF / FS AI RMF Compliance MCP Server

## What This Is
A standalone MCP server that teaches and checks compliance against the NIST AI Risk Management Framework and the Financial Services AI RMF (FS AI RMF). Two modes: **Learn** (interactive study, glossary, quizzes) and **Check** (assess plans/docs/code against 230 control objectives).

## Stack
- **Runtime:** Deno (Supabase Edge Functions)
- **Database:** Supabase Postgres (own project — NOT 2b-core)
- **MCP Protocol:** JSON-RPC over SSE, same pattern as cloud-mcp
- **License:** AGPL-3.0
- **Repo:** Gabriel-is/sentinel (GitHub personal account `github-personal`)

## Project Structure
```
sentinel/
├── CLAUDE.md                    # You are here
├── README.md                    # Public-facing docs
├── LICENSE                      # AGPL-3.0
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 001_sentinel_schema.sql    # Core tables
│   │   └── 002_seed_data.sql          # Framework data
│   └── functions/
│       └── mcp/
│           └── index.ts               # MCP server entry point
├── data/
│   ├── sources/                       # Raw PDFs/docs from NIST, CRI, OCC
│   │   └── README.md                  # What to download and where
│   └── parsed/                        # Structured JSON extracted from sources
│       ├── nist-ai-rmf-taxonomy.json  # Functions/categories/subcategories
│       ├── fs-ai-rmf-controls.json    # 230 control objectives
│       └── glossary.json              # All terms
├── scripts/
│   └── ingest.py                      # Parse source docs → seed SQL
└── sentinel-page/                     # Copy of my2b.ai/sentinel for reference
```

## Supabase Project
- **Create a new Supabase project** for Sentinel (free tier is fine)
- Project name: `sentinel`
- Region: us-east-1 (or closest)
- After creation, note the project ref ID and set up:
  - `npx supabase link --project-ref <ref>`
  - Anon key and service role key for edge function env vars

## Development
- **CLI:** Use `npx supabase` (not bare `supabase`) — WSL requirement
- **Edge functions:** `npx supabase functions serve mcp --no-verify-jwt` for local dev
- **Deploy:** `npx supabase functions deploy mcp --no-verify-jwt`
- **Migrations:** `npx supabase db push` or run SQL directly in DataGrip/Dashboard

## MCP Tools to Implement

### Learning Tools
| Tool | Input | What it does |
|------|-------|-------------|
| `sentinel:lookup` | `{ query, scope?: 'nist'\|'fs'\|'all' }` | Query any function/category/subcategory/control by ID or keyword |
| `sentinel:explain` | `{ topic, depth?: 'brief'\|'detailed'\|'expert' }` | Plain-English explanation with financial services examples |
| `sentinel:glossary` | `{ term }` or `{ category }` | Term lookup and definition |
| `sentinel:quiz` | `{ topic?, type?: 'term'\|'scenario'\|'control', difficulty?: 1-3 }` | Generate quiz question, track spaced repetition |
| `sentinel:progress` | `{}` | Learning progress dashboard |

### Compliance Tools
| Tool | Input | What it does |
|------|-------|-------------|
| `sentinel:assess` | `{ content, type: 'plan'\|'architecture'\|'code'\|'policy', context? }` | Evaluate against relevant controls, return gaps |
| `sentinel:crosswalk` | `{ control_id, target: 'iso42001'\|'eu_ai_act'\|'sr11-7' }` | Map controls between frameworks |
| `sentinel:adoption_stage` | `{ responses }` | Assess AI maturity stage, return applicable controls |

## Data Sources (Priority Order)

### Must Ingest for v1
1. **NIST AI 100-1** (AI RMF 1.0) — https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf
   - Extract: 4 functions, all categories, all subcategories, trustworthiness characteristics
2. **CRI FS AI RMF Guidebook v1.0** — https://cyberriskinstitute.org/wp-content/uploads/2026/02/CRI-FS-AI-RMF-Guidebook_Full_v.1.0-1.docx
   - Extract: 230 control objectives, RCM mappings, adoption stage questionnaire
3. **NIST AI RMF Playbook** — https://airc.nist.gov/AI_RMF_Playbook
   - Extract: Suggested actions for each subcategory
4. **NIST AI 600-1** (GenAI Profile) — https://airc.nist.gov/Docs/1
   - Extract: GenAI-specific risks and mitigations

### v2 Sources
5. NIST Critical Infrastructure AI Profile (April 2026 concept note)
6. ISO/IEC 42001 crosswalk
7. EU AI Act mappings
8. OWASP LLM Top 10 / Agentic Top 10
9. OCC-published documentation (annual reports, risk management policy, board charters)

## Design Principles
- **Portable:** Anyone can clone, create a Supabase project, run migrations, deploy. No dependencies on 2b-core, cloud-mcp, or any other Gabe infrastructure.
- **Data-driven:** All framework content lives in the database, not hardcoded. Adding a new framework = adding rows, not changing code.
- **MCP-native:** Built for Claude/LLM consumption. Tools return structured data that an AI can reason about.
- **Interview artifact:** This is a demonstrable product for the OCC AI Product & Strategy role. It should look professional and work reliably.

## Session Workflow
1. Check current state of the repo
2. Work through the phases in order (see below)
3. Commit after each meaningful chunk
4. Test edge functions locally before deploying

## Build Phases

### Phase 1: Foundation
- [ ] Init Supabase project
- [ ] Run 001_sentinel_schema.sql migration
- [ ] Scaffold MCP edge function with tool routing boilerplate
- [ ] Test: function serves MCP handshake

### Phase 2: Data Ingestion
- [ ] Download source documents to data/sources/
- [ ] Write ingest.py to parse NIST AI RMF PDF → structured JSON
- [ ] Write ingest.py to parse FS AI RMF guidebook → structured JSON
- [ ] Generate 002_seed_data.sql from parsed JSON
- [ ] Run seed migration
- [ ] Test: data queryable via SQL

### Phase 3: Learning Tools
- [ ] Implement sentinel:lookup
- [ ] Implement sentinel:explain
- [ ] Implement sentinel:glossary
- [ ] Implement sentinel:quiz (with spaced repetition tracking)
- [ ] Implement sentinel:progress
- [ ] Test: all learning tools return correct data

### Phase 4: Compliance Tools
- [ ] Implement sentinel:assess
- [ ] Implement sentinel:crosswalk
- [ ] Implement sentinel:adoption_stage
- [ ] Test: assessment returns structured findings

### Phase 5: Polish
- [ ] README with setup instructions
- [ ] Error handling and edge cases
- [ ] Rate limiting / auth if needed
- [ ] Update sentinel page on my2b.ai with link to MCP
