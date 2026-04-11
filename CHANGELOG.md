# Changelog

All notable changes to Sentinel are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [0.3.0] - 2026-04-11

### Added
- MCP server with 8 tools deployed on Supabase Edge Functions (Deno)
  - Learning tools: lookup, explain, glossary, quiz (SM-2 spaced repetition), progress
  - Compliance tools: assess (keyword-based gap analysis), crosswalk, adoption_stage
- CLI tool (`cli/sentinel.ts`) with local SQLite database
  - All 8 tools available offline via local data
  - Remote sync from Supabase REST API (`sentinel sync`)
  - Human-readable formatted output + `--json` mode
  - Interactive adoption stage assessment (`sentinel stage`)
  - Pipe support for assess (`cat doc.md | sentinel assess - --type policy`)
- Supabase Postgres schema with full RLS
  - Reference tables: anon + authenticated read
  - User tables (flashcards, assessments): auth.uid() isolation
  - Full-text search view across all content
- Seed data:
  - NIST AI RMF taxonomy: 4 functions, 18 categories, 67 subcategories
  - 7 trustworthiness characteristics
  - 230 FS AI RMF control objectives with financial services context
  - 82 glossary terms (governance, risk, technical, regulatory)
  - 109 framework crosswalks (SR 11-7, ISO 42001, EU AI Act, OWASP LLM Top 10)
- Seed SQL generator script (`scripts/generate_seed.py`)
- Structured JSON data files in `data/parsed/`
- JWT authentication on MCP endpoint (Supabase gateway + application-level verification)

### Security
- All tables have RLS enabled
- MCP tools/call requires authenticated Supabase JWT
- Service role key server-side only
- user_id columns are NOT NULL with auth.users FK
- No anonymous write access

## [0.1.0] - 2026-04-10

### Added
- Initial project scaffold
- CLAUDE.md project specification
- Basic schema and MCP function stubs
