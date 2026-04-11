# Security

Security posture for the Sentinel MCP server.

## Security Model

Sentinel uses a layered authentication and authorization model built on Supabase infrastructure.

### Authentication

All authenticated requests require a valid Supabase JWT issued via `supabase.auth.signUp()` or `supabase.auth.signInWithPassword()`. The token flow works as follows:

1. **Supabase Gateway** validates the JWT signature and expiry before the request reaches the Edge Function. Invalid or expired tokens are rejected at the gateway with a 401 response.
2. **Application-level verification** inside the MCP Edge Function extracts the user ID from the JWT claims and passes it to database queries, ensuring Row Level Security policies bind to the correct user.
3. **Service role key** is used only server-side within the Edge Function for operations that need elevated access (e.g., reading reference data on behalf of an anonymous caller). This key is stored as a Supabase Edge Function secret and is never exposed to clients.

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

### No Rate Limiting on the MCP Endpoint

The Edge Function has no request throttling. A malicious or misconfigured client could send unlimited requests, potentially exhausting Supabase Edge Function invocation limits or database connections. The only backstop is Supabase's platform-level rate limits on the free tier.

### CORS is Wildcard (*)

The MCP endpoint returns `Access-Control-Allow-Origin: *`, allowing any origin to make requests. This is acceptable for a public MCP server but means browser-based clients from any domain can interact with the API.

### No API Key Rotation Mechanism

There is no built-in process for rotating the Supabase anon key or service role key. Rotation requires manual update of Supabase project settings and redeployment of the Edge Function.

### Assessment Uses Keyword Matching, Not Semantic Analysis

The `sentinel:assess` tool identifies relevant controls by matching keywords from control objectives against the submitted content. This approach:

- Can miss controls that are semantically relevant but use different terminology
- Can surface false positives when keywords appear in unrelated context
- Does not understand negation (e.g., "we do NOT perform bias testing" would still match bias-related controls as covered)

### No Email Confirmation on Signup

Supabase email confirmation is not enabled. Any valid email address gets instant access upon signup. This means there is no verification that the user owns the email address they register with.

### Token Refresh is Client Responsibility

JWTs expire after the default Supabase duration (1 hour). The server does not handle refresh -- clients must call `supabase.auth.refreshSession()` or re-authenticate. Expired tokens are rejected at the gateway.

### CLI Anon Key is Embedded in Source

The Supabase anon key is hardcoded in `cli/sentinel.ts`. This is by design: the anon key only grants read access to public reference data. However, it does mean anyone with the source code can make unauthenticated read requests to the Supabase project.

### No Audit Logging of Tool Calls

There is no record of which tools are called, by whom, or with what arguments. Failed and successful requests are not logged beyond Supabase's built-in Edge Function logs (which have limited retention on the free tier).

### No Input Length Validation on Assess Content

The `sentinel:assess` tool accepts arbitrary-length content in the `content` field. A very large document could cause slow processing or memory issues in the Edge Function. There is no server-side validation of input size.

### Crosswalk Data is Manually Maintained

Framework crosswalk mappings (SR 11-7, ISO 42001, EU AI Act, OWASP LLM Top 10) were manually curated. They are not automatically updated when source frameworks are revised. Staleness is a risk as frameworks evolve.

## Recommendations for Production Deployment

If Sentinel were to be deployed in a production environment handling real compliance workflows, the following changes would be necessary:

1. **Tighten CORS to specific origins.** Replace the wildcard `*` with an allowlist of trusted domains (e.g., `my2b.ai`, the organization's internal tools).

2. **Enable email confirmation.** Turn on Supabase email confirmation to verify user identity before granting access. Consider adding organizational domain restrictions.

3. **Add rate limiting via Edge Function middleware.** Implement per-user and per-IP rate limits at the Edge Function level, using either Supabase's built-in mechanisms or a custom token bucket stored in the database or KV.

4. **Implement API key auth for MCP clients.** Issue per-client API keys for programmatic access, separate from user JWTs. This enables revocation and usage tracking per integration.

5. **Add audit logging.** Log every tool invocation with timestamp, user ID, tool name, input parameters (redacted as appropriate), and response status. Store logs in a dedicated table with appropriate retention policies.

6. **Add input size limits.** Validate the `content` field in `sentinel:assess` and other free-text inputs. Reject payloads above a reasonable threshold (e.g., 100KB).

7. **Set up monitoring and alerting.** Configure alerts on Edge Function error rates, database connection pool usage, and unusual request patterns. Supabase dashboard metrics and external monitoring (e.g., Grafana, PagerDuty) are both viable.

8. **Implement semantic analysis for assessments.** Replace or augment keyword matching with embedding-based similarity search to improve control relevance in `sentinel:assess` results.

9. **Automate crosswalk updates.** Establish a review cadence for crosswalk data and, where possible, pull from machine-readable framework sources to reduce manual maintenance burden.

10. **Enable database backups.** Ensure Supabase point-in-time recovery is enabled and tested. User assessment data has compliance value and should not be lost.

## Reporting Vulnerabilities

If you discover a security vulnerability in Sentinel, please report it responsibly.

**Email:** gabriel@my2b.ai

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

You will receive an acknowledgment within 48 hours. Sentinel is an open-source project under AGPL-3.0; responsible disclosures are appreciated and credited.
