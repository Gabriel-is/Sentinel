# Sentinel

NIST AI RMF and Financial Services AI RMF compliance learning and checking tool, built as an MCP server.

## What it does

**Learn mode** — Interactive study of the NIST AI Risk Management Framework and the FS AI RMF (230 control objectives). Glossary, quizzes with spaced repetition, framework exploration.

**Check mode** — Feed in a plan, architecture doc, code, or policy and get a structured compliance gap analysis against relevant control objectives.

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Clone this repo
3. Link: `npx supabase link --project-ref <your-project-ref>`
4. Run migrations: `npx supabase db push`
5. Seed data: `python scripts/ingest.py` (requires source docs in `data/sources/`)
6. Deploy: `npx supabase functions deploy mcp --no-verify-jwt`

## MCP Tools

| Tool | Description |
|------|-------------|
| `sentinel:lookup` | Query framework taxonomy by ID or keyword |
| `sentinel:explain` | Plain-English explanations with financial services context |
| `sentinel:glossary` | Regulatory term definitions |
| `sentinel:quiz` | Spaced repetition flashcards |
| `sentinel:progress` | Learning progress dashboard |
| `sentinel:assess` | Compliance gap analysis |
| `sentinel:crosswalk` | Map controls across frameworks |
| `sentinel:adoption_stage` | AI maturity assessment |

## Data Sources

- NIST AI 100-1 (AI RMF 1.0)
- CRI FS AI RMF Guidebook v1.0
- NIST AI RMF Playbook
- NIST AI 600-1 (GenAI Profile)

See `data/sources/README.md` for download links.

## License

AGPL-3.0 — see LICENSE
