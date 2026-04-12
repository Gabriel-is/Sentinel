# Session Wrap-Up: Sentinel Build

## Session ID: s-20260410-7b3e
## Duration: ~8 hours (overnight autonomous + interactive)
## Billing: Personal

## What Shipped

### Sentinel Repo (Gabriel-is/Sentinel) — 4 PRs merged
| PR | Title | Key changes |
|----|-------|-------------|
| #1 | v0.3.0: MCP server + CLI | Full build: schema, seed data, 8 tools, CLI, tests, docs |
| #2 | Auth hardening | Rate limiting, audit logging, X-Sentinel-Token |
| #3 | X-Sentinel-Token auth fix | Restored 4-layer security after gateway JWT issue |
| #4 | Auto-seed flashcards | 70+ cards on first quiz, code review fixes, docs update |

### my2b.ai Repo (Gabriel-is/my2b.ai) — 7 PRs merged
| PR | Title |
|----|-------|
| #47 | Sentinel MCP signup/login UI |
| #48 | X-Sentinel-Token header fix for curl/config |
| #49 | Cross-card reference links + related cards |
| #50 | Code review fixes (XSS, null safety) |
| #51 | Search clear X button |
| #52 | Live Sentinel API drill-down (18 cards) |
| #53 | Copy button feedback, scrollbar styling, credentials width |

### Supabase (ewugluzfpgsonifbpeau)
- Standalone account, free tier, transferable
- Schema: 10 tables, RLS on all, FTS view
- Data: 4+18+67+230+7+82+109 rows
- Edge function: mcp v0.4.0
- Auth: email confirmation, 10-char password policy, sign-up rate limit 10/5min

## Metrics
- Files changed: 30+ across 2 repos
- Lines: ~12,000 added
- Tests: 41 passing
- Tools implemented: 8 (all functional)
- Security layers: 4
- Crosswalk frameworks: 4

## Decisions Made
1. **MIT license** (temporary — user wants to decide later)
2. **Standalone Supabase account** — separate from personal org, transferable on free tier
3. **X-Sentinel-Token header pattern** — user JWT in custom header, anon key in Authorization for gateway
4. **CLI + MCP dual distribution** — same handler logic, different transport
5. **Keyword matching for assess** — not semantic/embeddings (v0.7+ roadmap)
6. **No API keys yet** — case made but deferred to v0.5+
7. **Auto-seed flashcards from DB** — not from static JSON file

## Learnings
1. Supabase gateway verify_jwt only handles HS256 — user auth JWTs are ES256 on newer projects. Split into two headers.
2. `npx supabase db query --linked` is the working path for remote SQL. `db execute` doesn't exist.
3. Supabase free tier limits confirmation emails to 2/hour — tell users in the UI.
4. PostgREST filter injection is real — sanitize user input before interpolating into .or()/.ilike() filters.
5. Deploy via MCP tool needs `files` array with content inline, not file paths.

## What's Left (Roadmap)
- v0.5: CLI compiled binary (`deno compile`)
- v0.6: CLI auth + flashcard sync
- v0.7: Cron-based weekly data refresh from sources
- v0.8: Semantic assessment via embeddings
- v1.0: Web UI, API keys, more crosswalk sources
- License decision
- MCP connection testing (couldn't test in this session — MCP config written but not verified)

## Process Notes
- User prefers autonomous work — "push through, report blockers async"
- Always: feature branch -> PR -> /code-review skill -> fix -> merge
- Never: inline reviews, skip the /code-review step
- User wants all issues fixed regardless of severity ("this is a get me a job demo")
