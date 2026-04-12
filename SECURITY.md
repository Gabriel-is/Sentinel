# Security

Security posture for the Sentinel MCP server.

## Security Model

Sentinel uses a layered authentication and authorization model built on Supabase infrastructure.

### Authentication

Sentinel uses a 4-layer authentication model:

1. **HTTPS** -- Supabase-managed TLS. All traffic is encrypted in transit.
2. **Supabase Gateway** -- Validates the `Authorization: Bearer <anon_key>` header (HS256 JWT). This acts as a firewall that rejects garbage requests before they reach application code. The anon key is public by design.
3. **Application-level verification** -- The Edge Function reads the user's auth token from the `X-Sentinel-Token` header and calls `supabase.auth.getUser()` to validate it against the auth server (ES256 JWT). This is the real identity check. Returns 401 if invalid or expired.
4. **Row Level Security** -- Database policies enforce data isolation per `auth.uid()`.

Why two headers: The Supabase gateway only verifies HS256 JWTs (anon/service keys), but user auth tokens are ES256. Splitting into `Authorization` (gateway firewall) and `X-Sentinel-Token` (app auth) restores all four security layers.

**Rate limiting:** 60 requests/minute for `tools/call`, 10/minute for discovery endpoints (`initialize`, `tools/list`). Per-IP sliding window stored in `sentinel_rate_limits` table. Returns HTTP 429 when exceeded.

**Audit logging:** Every `tools/call` is logged to `sentinel_audit_log` with user_id, tool_name, input_summary (truncated to 200 chars), IP address, user agent, response status, and duration_ms. Users can read their own audit logs via RLS.

**Service role key** is used only server-side within the Edge Function. Stored as a Supabase environment secret, never exposed to clients.

**Password policy:** Minimum 10 characters, must include uppercase, lowercase, digit, and symbol. Email confirmation required before access.

### Authorization (Row Level Security)

Every table in the Sentinel schema has RLS enabled. Policies follow a simple split:

- **Reference tables** (`frameworks`, `functions`, `categories`, `subcategories`, `control_objectives`, `glossary_terms`, `crosswalks`, `trustworthiness_characteristics`): SELECT is granted to both `anon` and `authenticated` roles. No INSERT, UPDATE, or DELETE for non-service roles.
- **User tables** (`user_flashcards`, `user_assessments`): All operations are restricted to rows where `user_id = auth.uid()`. The `user_id` column is NOT NULL with a foreign key to `auth.users`, preventing orphaned or unattributed records.

### CLI Authentication

The CLI tool (`cli/sentinel.ts`) embeds the Supabase anon key in source code. This is intentional -- the anon key grants read-only access to reference data, which is public information derived from published government and industry documents. User-specific operations (flashcards, assessments, sync) require the user to authenticate via `sentinel login`, which stores the session token locally.

## Data Classification

### Public (Reference Data)

All framework content is derived from publicly available documents and is treated as non-sensitive:

- NIST AI RMF functions, categories, and subcategories
- FS AI RMF control objectives
- Glossary terms and definitions
- Framework crosswalk mappings
- Trustworthiness characteristics

This data is readable by unauthenticated (anon) users by design.

### Private (User Data)

User-generated data is isolated per user via RLS and is not accessible to other users or unauthenticated callers:

- **Flashcards** (`user_flashcards`): Quiz history, SM-2 spaced repetition state (ease factor, interval, next review date), per-card performance.
- **Assessments** (`user_assessments`): Compliance assessment results, including the submitted content, identified gaps, and scores.

### Secrets

The following values are sensitive and must not be committed to source control or exposed to clients:

- Supabase service role key (stored as Edge Function secret)
- Database connection string (managed by Supabase)
- Any future API keys for third-party integrations

## Known Gaps and Limitations

This section documents known security limitations honestly. Sentinel is a demonstration project and interview artifact, not a production compliance platform.

### CORS is Wildcard (*)

The MCP endpoint returns `Access-Control-Allow-Origin: *`, allowing any origin to make requests. This is acceptable for a public MCP server but means browser-based clients from any domain can interact with the API. Tighten to specific origins for production.

### No API Key Rotation Mechanism

There is no built-in process for rotating the Supabase anon key or service role key. Rotation requires manual update of Supabase project settings and redeployment. Long-lived API keys for MCP clients (as an alternative to 1-hour JWTs) are planned but not yet implemented.

### Assessment Uses Keyword Matching, Not Semantic Analysis

The `sentinel:assess` tool identifies relevant controls by matching keywords from control objectives against the submitted content. This approach:

- Can miss controls that are semantically relevant but use different terminology
- Can surface false positives when keywords appear in unrelated context
- Does not understand negation (e.g., "we do NOT perform bias testing" would still match bias-related controls as covered)

Semantic assessment via embeddings is on the roadmap (v0.7+).

### Token Refresh is Client Responsibility

JWTs expire after 1 hour. The server does not handle refresh -- clients must re-authenticate or use the refresh token. Users are informed of this during signup at [my2b.ai/sentinel](https://my2b.ai/sentinel).

### CLI Anon Key is Embedded in Source

The Supabase anon key is hardcoded in `cli/commands/sync.ts`. This is by design: the anon key only grants read access to public reference data (enforced by RLS). It cannot write data or access user-specific records.

### Crosswalk Data is Manually Maintained

Framework crosswalk mappings (SR 11-7, ISO 42001, EU AI Act, OWASP LLM Top 10) were manually curated. They are not automatically updated when source frameworks are revised. Automated weekly checks for source updates are planned.

## Recommendations for Production Deployment

If Sentinel were to be deployed in a production environment handling real compliance workflows, the following changes would be necessary:

1. ~~**Add rate limiting.**~~ Done (v0.4.0). 60/min tools/call, 10/min discovery, per-IP.
2. ~~**Add audit logging.**~~ Done (v0.4.0). Every call logged with user, tool, IP, duration.
3. ~~**Enable email confirmation.**~~ Done. Configured in Supabase dashboard.
4. ~~**Add input size limits.**~~ Done. 100KB max on assess content.
5. **Tighten CORS to specific origins.** Replace `*` with `my2b.ai` and trusted domains.
6. **Implement API key auth for MCP clients.** Long-lived keys for programmatic access, separate from 1-hour JWTs.
7. **Set up monitoring and alerting.** Alert on error rates, connection pool usage, unusual patterns.
8. **Implement semantic assessment.** Embedding-based similarity search to replace keyword matching.
9. **Automate crosswalk updates.** Weekly checks against source framework publications.
10. **Enable database backups.** Point-in-time recovery for user assessment data.

## Reporting Vulnerabilities

If you discover a security vulnerability in Sentinel, please report it responsibly.

**Email:** gabriel@my2b.ai

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

You will receive an acknowledgment within 48 hours. Sentinel is an open-source project under MIT license; responsible disclosures are appreciated and credited.
