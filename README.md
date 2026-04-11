# Sentinel

**NIST AI RMF & FS AI RMF compliance toolkit -- MCP server + CLI**

By [Gabriel Ziegler](https://github.com/Gabriel-is)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What is Sentinel?

Sentinel is a structured compliance toolkit for two foundational AI risk management frameworks:

- **NIST AI RMF 1.0** (AI 100-1) -- The federal standard for AI risk management, organized into four core functions (Govern, Map, Measure, Manage), 19 categories, and 72 subcategories.
- **CRI Financial Services AI RMF** (FS AI RMF) -- The Cyber Risk Institute's financial-services overlay that maps 230 control objectives onto the NIST structure, with adoption stages, risk tiering, and trustworthiness principles tailored to regulated institutions.

Sentinel operates in two modes:

| Mode | Purpose |
|------|---------|
| **Learn** | Interactive study of the frameworks: taxonomy exploration, glossary lookup, quizzes with SM-2 spaced repetition |
| **Check** | Assess plans, architecture docs, code, or policies against 230 control objectives; crosswalk controls to other frameworks; evaluate organizational AI maturity |

Two interfaces serve different users:

| Interface | Audience | How it works |
|-----------|----------|-------------|
| **MCP Server** | Claude, LLM agents, programmatic clients | JSON-RPC 2.0 over HTTP POST, deployed as a Supabase Edge Function (Deno) |
| **CLI** | Humans, shell scripts, CI pipelines | Deno executable with a local SQLite cache, synced from the Supabase backend |

The dataset includes:

- 4 NIST AI RMF functions, 19 categories, 72 subcategories
- 230 FS AI RMF control objectives with adoption stages and trustworthiness principles
- 82 glossary terms across risk, governance, technical, and regulatory categories
- 109 framework crosswalks (SR 11-7, ISO 42001, EU AI Act, NIST CSF, OWASP LLM Top 10)
- 7 trustworthiness characteristics

The financial services focus covers OCC supervisory expectations, SR 11-7 model risk management, fair lending, BSA/AML, and systemically important financial market utility (SIFMU) considerations.

---

## Quick Start

### CLI

```bash
git clone https://github.com/Gabriel-is/sentinel.git
cd sentinel

# First run syncs data automatically from Supabase
deno run --allow-read --allow-write --allow-net --allow-env --unstable-ffi cli/sentinel.ts lookup "GOVERN 1.1"

# Or sync explicitly first
deno run --allow-read --allow-write --allow-net --allow-env --unstable-ffi cli/sentinel.ts sync
deno run --allow-read --allow-write --allow-net --allow-env --unstable-ffi cli/sentinel.ts lookup "bias"
```

For convenience, create a shell alias:

```bash
alias sentinel='deno run --allow-read --allow-write --allow-net --allow-env --unstable-ffi /path/to/sentinel/cli/sentinel.ts'
```

Then use it directly:

```bash
sentinel lookup "GOVERN 1.1"
sentinel explain "model risk management" --depth expert
sentinel assess policy.md --type policy
```

### MCP Server

The MCP server is already deployed and live:

```
https://ewugluzfpgsonifbpeau.supabase.co/functions/v1/mcp
```

To connect it to **Claude Desktop**, add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sentinel": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "-H", "Content-Type: application/json",
        "-H", "Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN",
        "-d", "{\"method\":\"tools/list\",\"jsonrpc\":\"2.0\",\"id\":1}",
        "https://ewugluzfpgsonifbpeau.supabase.co/functions/v1/mcp"
      ]
    }
  }
}
```

> **Note:** `initialize` and `tools/list` are public (no auth required). All `tools/call` invocations require a valid Supabase JWT. See [Authentication](#authentication--new-user-flow) for how to obtain one.

---

## CLI Usage

```
sentinel <command> [args] [options]
```

### `sentinel lookup <query>`

Search the framework taxonomy by ID or keyword.

```bash
sentinel lookup "GOVERN 1.1"           # Exact subcategory match
sentinel lookup "MAP 2"                # Category with its subcategories
sentinel lookup "GOVERN"               # Function with its categories
sentinel lookup "GV-1.1-001"           # Specific control objective
sentinel lookup "bias"                 # Full-text keyword search
sentinel lookup "model validation" --scope nist   # NIST-only results
sentinel lookup "third party" --scope fs          # FS AI RMF controls only
```

**Options:**
- `--scope <nist|fs|all>` -- Filter results to NIST base framework, FS AI RMF controls, or all (default: `all`)

### `sentinel explain <topic>`

Get a plain-English explanation of a concept, function, category, or control. Includes financial services context.

```bash
sentinel explain "model risk management"
sentinel explain "GOVERN 1.1" --depth brief
sentinel explain "trustworthiness" --depth expert
```

**Options:**
- `--depth <brief|detailed|expert>` -- Level of detail (default: `detailed`)

### `sentinel glossary [term]`

Look up regulatory and AI risk management terms.

```bash
sentinel glossary                           # List all categories and term counts
sentinel glossary "bias"                    # Search for a specific term
sentinel glossary --category risk           # All terms in the "risk" category
sentinel glossary "validation" --category technical
```

**Options:**
- `--category <risk|governance|technical|regulatory>` -- Filter by category

### `sentinel crosswalk <control_id> <target>`

Map a NIST AI RMF or FS AI RMF control to equivalent controls in another framework.

```bash
sentinel crosswalk "GOVERN 1.1" sr11_7
sentinel crosswalk "MAP 1.1" iso42001
sentinel crosswalk "MEASURE 2.1" eu_ai_act
sentinel crosswalk "MANAGE 1.1" owasp_llm
sentinel crosswalk "GOVERN 1.1" nist_csf
```

**Targets:** `iso42001`, `eu_ai_act`, `sr11_7`, `nist_csf`, `owasp_llm`

### `sentinel assess <file|-> --type <type>`

Assess a document against the 230 FS AI RMF control objectives. Returns a compliance gap analysis with specific control IDs, relevance scores, and recommendations.

```bash
sentinel assess policy.md --type policy
sentinel assess architecture.md --type architecture
sentinel assess main.py --type code

# Pipe from stdin
cat my_plan.txt | sentinel assess - --type plan
echo "We deploy models without validation" | sentinel assess - --type plan
```

**Options:**
- `--type <plan|architecture|code|policy>` -- What kind of content is being assessed (required)
- `--context <string>` -- Optional context (e.g., "AI-assisted code review pipeline for a SIFMU")

### `sentinel stage`

Interactive AI maturity stage assessment. Answers 16 questions across five dimensions (governance, inventory, risk management, monitoring, culture) and returns the organization's adoption stage (Scoping, Minimum Viable, Scaling, or Full Implementation) with applicable controls.

```bash
sentinel stage
```

The tool will prompt for each question interactively. Responses: `yes`, `partial`, or `no`.

### `sentinel sync`

Pull the latest framework data from Supabase into the local SQLite cache. Falls back to local JSON files in `data/parsed/` if the network is unavailable.

```bash
sentinel sync
```

### `sentinel stats`

Show local database statistics: row counts for each table and sync metadata.

```bash
sentinel stats
```

### Global Options

| Flag | Description |
|------|-------------|
| `--json`, `-j` | Output raw JSON instead of formatted text |
| `--help`, `-h` | Show help |
| `--version`, `-v` | Show version (currently `0.3.0`) |

---

## MCP Server API

### Protocol

- **Transport:** JSON-RPC 2.0 over HTTP POST
- **Endpoint:** `https://ewugluzfpgsonifbpeau.supabase.co/functions/v1/mcp`
- **Content-Type:** `application/json`
- **CORS:** Enabled (all origins)

### Methods

| Method | Auth Required | Description |
|--------|:---:|-------------|
| `initialize` | No | Returns server info and protocol version |
| `tools/list` | No | Returns all available tools with input schemas |
| `tools/call` | Yes | Execute a tool by name with arguments |

### Tools

#### `sentinel:lookup`

Query any NIST AI RMF function, category, subcategory, or FS AI RMF control objective by ID or keyword.

```json
{
  "query": "string (required) -- Search term, ID, or keyword",
  "scope": "string (optional) -- 'nist' | 'fs' | 'all' (default: 'all')"
}
```

#### `sentinel:explain`

Get a plain-English explanation of any AI RMF concept with financial services context.

```json
{
  "topic": "string (required) -- What to explain",
  "depth": "string (optional) -- 'brief' | 'detailed' | 'expert' (default: 'detailed')"
}
```

#### `sentinel:glossary`

Look up regulatory and AI risk management terms.

```json
{
  "term": "string (optional) -- Term to look up",
  "category": "string (optional) -- 'risk' | 'governance' | 'technical' | 'regulatory'"
}
```

#### `sentinel:quiz`

Generate a quiz question with spaced repetition tracking (SM-2 algorithm).

```json
{
  "topic": "string (optional) -- Topic to focus on",
  "type": "string (optional) -- 'term' | 'scenario' | 'control' | 'acronym' (default: 'term')",
  "difficulty": "integer (optional) -- 1-3 (default: 2)"
}
```

#### `sentinel:progress`

Show the authenticated user's learning progress: cards reviewed, mastery levels, weak areas.

```json
{}
```

#### `sentinel:assess`

Evaluate content against relevant FS AI RMF control objectives. Returns compliance gaps with specific control IDs and recommendations.

```json
{
  "content": "string (required) -- The plan, doc, code, or policy text to assess",
  "type": "string (required) -- 'plan' | 'architecture' | 'code' | 'policy'",
  "context": "string (optional) -- Additional context, e.g. 'SIFMU model risk pipeline'"
}
```

#### `sentinel:crosswalk`

Map a control to equivalent controls in other frameworks.

```json
{
  "control_id": "string (required) -- Control or subcategory ID to map",
  "target": "string (required) -- 'iso42001' | 'eu_ai_act' | 'sr11_7' | 'nist_csf' | 'owasp_llm'"
}
```

#### `sentinel:adoption_stage`

Assess organizational AI maturity based on questionnaire responses.

```json
{
  "responses": {
    "ai_policy_exists": "yes | partial | no",
    "ai_roles_defined": "yes | partial | no",
    "board_oversight": "yes | partial | no",
    "risk_appetite_defined": "yes | partial | no",
    "ai_inventory_complete": "yes | partial | no",
    "risk_tiering_applied": "yes | partial | no",
    "third_party_ai_tracked": "yes | partial | no",
    "risk_assessment_process": "yes | partial | no",
    "model_validation_independent": "yes | partial | no",
    "incident_response_defined": "yes | partial | no",
    "performance_monitoring_active": "yes | partial | no",
    "bias_monitoring_active": "yes | partial | no",
    "drift_detection_deployed": "yes | partial | no",
    "ai_training_program": "yes | partial | no",
    "ethics_framework": "yes | partial | no",
    "diverse_teams": "yes | partial | no"
  }
}
```

### Example Requests

**Initialize (no auth):**

```bash
curl -X POST \
  https://ewugluzfpgsonifbpeau.supabase.co/functions/v1/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize"}'
```

**List tools (no auth):**

```bash
curl -X POST \
  https://ewugluzfpgsonifbpeau.supabase.co/functions/v1/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

**Call a tool (auth required):**

```bash
curl -X POST \
  https://ewugluzfpgsonifbpeau.supabase.co/functions/v1/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "sentinel:lookup",
      "arguments": { "query": "GOVERN 1.1", "scope": "all" }
    }
  }'
```

---

## Authentication & New User Flow

### MCP Server Authentication

The server uses a two-layer authentication model:

1. **Discovery is public.** `initialize` and `tools/list` require no authentication, so any MCP client can discover Sentinel's capabilities.
2. **Tool execution requires a Supabase JWT.** All `tools/call` requests must include `Authorization: Bearer <access_token>`.
3. **Two verification layers.** The Supabase gateway validates the JWT at the edge, and the application calls `getUser(token)` to verify the user exists and extract `user_id`.
4. **RLS on all tables.** Even with a valid token, users can only read reference data and access their own flashcards/assessments.

### New User Signup Flow

Sentinel uses Supabase Auth. To create an account and obtain a token:

**1. Sign up:**

```bash
curl -X POST \
  https://ewugluzfpgsonifbpeau.supabase.co/auth/v1/signup \
  -H "apikey: SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "your-password"}'
```

**2. Extract the access token from the response:**

```json
{
  "access_token": "eyJhbG...",
  "refresh_token": "abc123...",
  "expires_in": 3600,
  "token_type": "bearer"
}
```

**3. Use the token in subsequent requests:**

```bash
-H "Authorization: Bearer eyJhbG..."
```

**4. Refresh when expired (tokens last 1 hour):**

```bash
curl -X POST \
  https://ewugluzfpgsonifbpeau.supabase.co/auth/v1/token?grant_type=refresh_token \
  -H "apikey: SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "abc123..."}'
```

### CLI Authentication

- **Reference data is public.** The CLI's `sync` command uses the Supabase anon key to pull reference data (functions, categories, subcategories, controls, glossary, crosswalks) via the REST API.
- **No login required.** All CLI commands work without authentication because they operate on the local SQLite cache.
- **Quiz/flashcard tracking is local only.** Spaced repetition sync to Supabase requires authenticated sessions, which is planned for a future release.

---

## Security Model

### What is enforced

- **Row Level Security (RLS)** is enabled on every table.
  - Reference tables (functions, categories, subcategories, controls, glossary, crosswalks, trustworthiness characteristics): read-only for `authenticated` role.
  - User-scoped tables (flashcards, assessments): full access restricted to `auth.uid() = user_id`.
- **Service role key** is used server-side only by the Edge Function for database operations. It is stored in Supabase's environment variable vault and never exposed to clients.
- **JWT verification** occurs at two levels: the Supabase gateway and the application's `authenticateRequest()` function, which calls `getUser()` to validate the token.
- **No anonymous write access.** User-scoped tables have `NOT NULL` foreign keys to `auth.users(id)`.
- **Parameterized queries.** All database access uses the Supabase client library (PostgREST) or parameterized SQLite queries, preventing SQL injection.

### Known gaps and limitations

- No rate limiting on the MCP endpoint.
- No API key rotation mechanism.
- CLI stores no credentials locally (by design -- it only accesses read-only reference data).
- The assessment tool (`sentinel:assess`) uses keyword frequency matching, not semantic analysis. It identifies relevant controls but does not deeply understand document content.
- Token refresh must be handled client-side. The server returns a 401 on expiration.
- No email confirmation is enabled -- signup is instant.
- CORS is set to wildcard (`*`). This should be tightened for production deployments.

---

## Architecture

```
                    ┌─────────────┐
                    │   Claude /  │
                    │  LLM Agent  │
                    └──────┬──────┘
                           │ JSON-RPC 2.0
                    ┌──────▼──────┐
                    │  Supabase   │
                    │Edge Function│
                    │   (Deno)    │
                    └──────┬──────┘
                           │ Service Role Key
                    ┌──────▼──────┐
                    │  Supabase   │
                    │  Postgres   │
                    │  (RLS + FTS)│
                    └──────┬──────┘
                           │ REST API (anon key)
                    ┌──────▼──────┐
                    │ Sentinel CLI│
                    │  (SQLite)   │
                    └─────────────┘
```

**MCP Server path:** Claude or any MCP-compatible client sends JSON-RPC requests to the Edge Function. The function authenticates the caller's JWT, executes the tool handler using the service role key (bypassing RLS for server-side logic), and returns structured JSON.

**CLI path:** The CLI pulls reference data from Supabase Postgres via the REST API using the anon key, stores it in a local SQLite database at `~/.sentinel/sentinel.db`, and runs all queries locally. No network required after the initial sync.

---

## Data Sources

### Ingested (v0.3)

| Source | What was extracted | How |
|--------|--------------------|-----|
| [NIST AI 100-1](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf) (AI RMF 1.0) | 4 functions, 19 categories, 72 subcategories, 7 trustworthiness characteristics | Manual extraction to `data/parsed/nist-ai-rmf-taxonomy.json`, then `scripts/generate_seed.py` to SQL |
| [CRI FS AI RMF Guidebook v1.0](https://cyberriskinstitute.org/wp-content/uploads/2026/02/CRI-FS-AI-RMF-Guidebook_Full_v.1.0-1.docx) | 230 control objectives with adoption stages, risk statements, trustworthy principles, implementation guidance | Manual extraction to `data/parsed/fs-ai-rmf-controls.json`, then `scripts/generate_seed.py` to SQL |
| [NIST AI RMF Playbook](https://airc.nist.gov/AI_RMF_Playbook) | Suggested actions for each subcategory | Included in `nist-ai-rmf-taxonomy.json` as `suggested_actions` arrays |
| Regulatory glossary (composite) | 82 terms across risk, governance, technical, and regulatory categories | `data/parsed/glossary.json` |

### Crosswalk Sources

| Target Framework | Crosswalk Count | Description |
|-----------------|:-:|-------------|
| SR 11-7 | -- | OCC Supervisory Guidance on Model Risk Management |
| ISO/IEC 42001 | -- | AI Management System standard |
| EU AI Act | -- | European Union Artificial Intelligence Act |
| NIST CSF | -- | NIST Cybersecurity Framework |
| OWASP LLM Top 10 | -- | OWASP Top 10 for Large Language Model Applications |

Total: 109 crosswalk mappings across all target frameworks.

### Planned (v2)

- NIST AI 600-1 (GenAI Profile) -- GenAI-specific risks and mitigations
- NIST Critical Infrastructure AI Profile (April 2026 concept note)
- ISO/IEC 42001 deep crosswalk
- EU AI Act full mapping
- OWASP Agentic AI Top 10

---

## Database Schema

### Supabase Postgres (source of truth)

| Table | Description | Rows |
|-------|-------------|-----:|
| `sentinel_functions` | NIST AI RMF core functions (Govern, Map, Measure, Manage) | 4 |
| `sentinel_categories` | Categories within each function | 19 |
| `sentinel_subcategories` | Subcategories with suggested actions | 72 |
| `sentinel_control_objectives` | FS AI RMF control objectives with adoption stages, risk statements, trustworthy principles | 230 |
| `sentinel_trustworthy_characteristics` | The 7 AI trustworthiness characteristics | 7 |
| `sentinel_glossary` | Regulatory and AI risk management terms (FTS-indexed) | 82 |
| `sentinel_crosswalks` | Mappings between frameworks | 109 |
| `sentinel_flashcards` | Per-user spaced repetition cards (SM-2 algorithm) | per user |
| `sentinel_assessments` | Per-user compliance assessment history | per user |

### CLI SQLite (local mirror)

Mirrors all reference tables above (functions through crosswalks) plus:

| Table | Description |
|-------|-------------|
| `sentinel_meta` | Sync metadata (last sync timestamp) |
| `sentinel_fts` | FTS5 virtual table for full-text search (Porter stemming, Unicode) |

---

## Development

### Prerequisites

- [Deno](https://deno.land/) (v1.40+)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm install -g supabase` or use `npx supabase`)
- Python 3.x (for seed generation only)

### Local Development

```bash
# Clone and link to your own Supabase project
git clone https://github.com/Gabriel-is/sentinel.git
cd sentinel
npx supabase link --project-ref <your-project-ref>

# Run migrations
npx supabase db push

# Generate seed data from parsed JSON (if re-seeding)
python3 scripts/generate_seed.py

# Serve the MCP function locally (no JWT verification)
npx supabase functions serve mcp --no-verify-jwt
```

### Deploy

```bash
# Deploy Edge Function (JWT verification enabled in production)
npx supabase functions deploy mcp
```

### Migrations

| File | Purpose |
|------|---------|
| `supabase/migrations/001_sentinel_schema.sql` | Core tables, indexes, RLS policies, full-text search view |
| `supabase/migrations/002_seed_data.sql` | Framework reference data: functions, categories, subcategories, controls, glossary, trustworthiness characteristics |
| `supabase/migrations/003_crosswalk_data.sql` | Framework crosswalk mappings (SR 11-7, ISO 42001, EU AI Act, NIST CSF, OWASP) |

### Seed Generation

```bash
python3 scripts/generate_seed.py
```

Reads from `data/parsed/*.json` and writes `supabase/migrations/002_seed_data.sql`. Run this when the parsed JSON files are updated.

### Project Structure

```
sentinel/
├── CLAUDE.md                         # Build spec and session instructions
├── README.md                         # This file
├── LICENSE                           # MIT
├── cli/
│   ├── sentinel.ts                   # CLI entry point
│   ├── commands/
│   │   └── sync.ts                   # Supabase sync with local JSON fallback
│   ├── db/
│   │   ├── local.ts                  # SQLite open/seed/check
│   │   └── schema.sql                # SQLite schema (mirrors Postgres)
│   └── lib/
│       └── handlers.ts               # CLI tool handlers (lookup, explain, etc.)
├── data/
│   ├── sources/                      # Raw source documents (not committed)
│   │   └── README.md                 # Download instructions
│   └── parsed/                       # Structured JSON extracted from sources
│       ├── nist-ai-rmf-taxonomy.json
│       ├── fs-ai-rmf-controls.json
│       └── glossary.json
├── scripts/
│   └── generate_seed.py              # JSON -> SQL seed generator
└── supabase/
    ├── config.toml
    ├── migrations/
    │   ├── 001_sentinel_schema.sql
    │   ├── 002_seed_data.sql
    │   └── 003_crosswalk_data.sql
    └── functions/
        └── mcp/
            └── index.ts              # MCP server (Edge Function)
```

---

## Roadmap

| Version | Milestone |
|---------|-----------|
| **v0.4** | CLI compiled binary distribution via `deno compile` |
| **v0.5** | CLI authentication + flashcard/quiz sync to Supabase |
| **v0.6** | Cron-based data refresh from source documents |
| **v0.7** | Semantic assessment using embeddings (upgrade from keyword matching) |
| **v1.0** | EU AI Act full mapping, ISO 42001 deep crosswalk, OWASP Agentic AI Top 10 |
| **Future** | Web UI, multi-tenant support, API key authentication |

---

## License

[MIT](LICENSE) -- Copyright (c) 2026 Gabriel Israel

---

## Author

**Gabriel Ziegler** -- [github.com/Gabriel-is](https://github.com/Gabriel-is)
