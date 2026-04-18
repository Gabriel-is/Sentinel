# OCC Context Graph — Build Spec

> **Provenance note:** The original spec document was lost in the chat handoff.
> This file is Claude's reconstruction of the spec from the kickoff prompt's
> framing constraints. Treat it as a draft to be ratified or corrected, not as
> ground truth. Anything marked `[ASSUMPTION]` is Claude's call and should be
> reviewed before code lands.

## 1. Mission

Ship an OCC public-document context graph as Sentinel's first populated corpus,
surfaced through a my2b.ai dash page. The artifact is framed as a **platform
demo with OCC as the loaded example corpus** — not as an OCC-specific tool.

Audience: Chris Jones (Head of QA, OCC) → forwarded to the SDLC hiring
director. Public sources only — `theocc.com` only, no MyOCC, no rulebooks, no
proprietary data.

## 2. Platform-framing constraints (UX)

These are non-negotiable and shape the build.

- Corpus selector visible at top of dash: `[Corpus: OCC Public Docs ▼]`
- Dropdown contains at least two greyed/disabled placeholders:
  - "Anthropic Docs (coming soon)"
  - "Supabase Docs (coming soon)"
- Page H1 is Sentinel-framed: "Sentinel — Context Graph over Any Document
  Corpus."
- Subtitle: "Currently loaded: OCC public transformation docs (22 sources)."
- Three canned example questions are framed as "Try these against the OCC
  corpus:". V1 questions (answerable from the 18 Ovation data-layout docs):
  1. "What's different between the Stock Loan Hedge Program output and
     the Market Loan Program output?"  (exercises `sibling_of` edges)
  2. "Where is Exercise by Exception documented in the DDS output guides,
     and how does the Trades/Positions/E&A guide describe the flow?"
     (exercises `references` edges across two docs)
  3. "Which documents changed in the Layout Documentation Updates Summary
     Ed. 1.9 (October 2025), and what output guides should I re-read?"
     (exercises `supersedes` edges off the summary doc)
- Footer text — **verbatim, no paraphrase, no relocation**:

  > Built from public OCC resources only. No MyOCC access, no insider data,
  > no rulebook ingestion. The same pattern scales to any document corpus
  > with proper auth.

## 3. Adapter interface (must be reusable)

Lives in `adapters/_core/types.ts`. OCC is the forcing function — the contract
must work for arbitrary future corpora (Anthropic docs, Supabase docs, FedNow
specs, internal SDLC docs, etc.) without core changes.

```ts
export interface SourceSpec {
  url: string;
  title?: string;                // hint; parser may override from doc metadata
  doc_type?: "pdf" | "html";     // hint; sniffer may override
  category?: string;             // hint; classifier may override
  platform?: string | null;      // hint; classifier may override
  classifier_hint?: string;      // regex against filename or title
  notes?: string;
}

export interface ParsedDoc {
  source_url: string;
  title: string;
  doc_type: "pdf" | "html";
  raw_text: string;
  fetched_at: string;
  raw_storage_path: string;      // supabase storage key
  content_hash: string;          // sha256 of raw bytes
}

export interface Classification {
  doc_type: string;              // adapter-defined taxonomy (e.g. "annual_report")
  category: string;              // higher-level grouping
  platform: string | null;       // for tech docs only
  confidence: number;            // 0-1
  rule: "regex" | "llm";         // which path produced the classification
}

export interface Adapter {
  corpus_id: string;             // "occ"
  label: string;                 // "OCC Public Docs"
  description: string;
  sources: SourceSpec[];         // declared at module load
  classify(doc: ParsedDoc): Promise<Classification>;
  // No write logic — _core writes through the shared schema.
}
```

**Reusability gate (verified post-build):** `grep -ri "occ\|theocc" supabase/
cli/ adapters/_core/` returns no hits. `OCC` may appear only in
`adapters/occ/**` and as the single `corpora.label` row in seed SQL.

## 4. Schema additions

New migration: `supabase/migrations/005_corpus_graph.sql`.

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE sentinel_corpora (
  id              TEXT PRIMARY KEY,           -- "occ"
  label           TEXT NOT NULL,              -- "OCC Public Docs"
  description     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active',  -- active|coming_soon|archived
  source_count    INTEGER NOT NULL DEFAULT 0,
  last_ingested_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sentinel_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corpus_id       TEXT NOT NULL REFERENCES sentinel_corpora(id),
  source_url      TEXT NOT NULL,
  title           TEXT NOT NULL,
  doc_type        TEXT NOT NULL,              -- adapter taxonomy
  category        TEXT,
  platform        TEXT,
  content_hash    TEXT NOT NULL,
  raw_storage_path TEXT,
  ingest_status   TEXT NOT NULL DEFAULT 'pending',
  -- pending | fetched | parsed | chunked | embedded | edged | done
  -- | skipped_scanned | error_fetch | error_parse
  error           TEXT,
  fetched_at      TIMESTAMPTZ,
  UNIQUE (corpus_id, content_hash)
);
CREATE INDEX idx_documents_corpus ON sentinel_documents (corpus_id);
CREATE INDEX idx_documents_doc_type ON sentinel_documents (doc_type);

CREATE TABLE sentinel_chunks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES sentinel_documents(id) ON DELETE CASCADE,
  chunk_index     INTEGER NOT NULL,
  text            TEXT NOT NULL,
  token_count     INTEGER NOT NULL,
  embedding       VECTOR(1536),               -- text-embedding-3-small [ASSUMPTION]
  metadata        JSONB DEFAULT '{}',
  UNIQUE (document_id, chunk_index)
);
CREATE INDEX idx_chunks_embedding ON sentinel_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_chunks_text_fts ON sentinel_chunks
  USING gin (to_tsvector('english', text));

CREATE TABLE sentinel_edges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_chunk_id UUID NOT NULL REFERENCES sentinel_chunks(id) ON DELETE CASCADE,
  target_document_id UUID NOT NULL REFERENCES sentinel_documents(id) ON DELETE CASCADE,
  relation_type   TEXT NOT NULL,
  -- cites | references | defines | supersedes | related  [ASSUMPTION]
  evidence_sentence TEXT NOT NULL,             -- MUST be substring of source chunk
  confidence      NUMERIC NOT NULL,
  extracted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_edges_source ON sentinel_edges (source_chunk_id);
CREATE INDEX idx_edges_target ON sentinel_edges (target_document_id);

ALTER TABLE sentinel_corpora ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY corpora_read ON sentinel_corpora FOR SELECT TO authenticated USING (true);
CREATE POLICY documents_read ON sentinel_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY chunks_read ON sentinel_chunks FOR SELECT TO authenticated USING (true);
CREATE POLICY edges_read ON sentinel_edges FOR SELECT TO authenticated USING (true);
-- Writes only via service role.
```

## 5. Ingest pipeline

`adapters/_core/run.ts` — runnable via `deno task ingest occ`.

Stages, idempotent at every step via `content_hash`:

### 5.1 Fetch — REVISED based on harvest research

OCC's WAF returns 403 to all datacenter-IP fetches (Deno, curl, WebFetch
— even with realistic Chrome UAs). All 22 seed URLs are publicly
browseable from a residential connection, but cannot be fetched
automatically.

**Resulting design (manual cache as primary path):**

1. The user (residential connection) downloads each of the 22 docs once
   and uploads to Supabase Storage at `corpus-raw/occ/<local_filename>`.
   Filenames are listed in `adapters/occ/docs/occ-data-layouts-links.md`.
2. `_core/run.ts` enumerates `corpus-raw/<corpus_id>/` from Supabase
   Storage. For each blob it computes `content_hash`, looks up the
   matching `SourceSpec` from the adapter (matched on `local_filename`),
   and uses the spec's `url` field as the `source_url` row value (for
   citation rendering on the dash page).
3. If a `SourceSpec` has no corresponding blob in Storage, log
   `missing_cache` and set `ingest_status='pending'` so a later upload
   triggers ingest.
4. **No automated HTTP fetch is attempted by default.** A
   `--try-fetch` flag remains for future corpora that don't have WAF
   issues, but is opt-in.
2. **Parse.** PDF via `pdfjs-dist` (Deno-compatible). HTML via `deno-dom`.
   Scanned/table-only PDFs (heuristic: text density < 50 chars per page)
   skip with `ingest_status='skipped_scanned'`. **No OCR in V1.**
3. **Classify.** Adapter's `classify()` returns `{doc_type, category, platform}`.
   Regex rules first (filename + title); LLM fallback (Haiku) only if regex
   misses. The 22 OCC seed docs should classify deterministically — LLM
   fallback should fire zero or near-zero times in V1.
4. **Chunk.** Sentence-aware splitter, target ~500 tokens per chunk, 50-token
   overlap. [ASSUMPTION on sizes — adjust if spec disagrees.]
5. **Embed.** OpenAI `text-embedding-3-small` (1536-dim). Batch 50 chunks per
   request. [ASSUMPTION on model.]
6. **Edges.** Per chunk: prompt Haiku with chunk text + a list of all doc
   titles in the same corpus. Ask for candidate edges as
   `{target_doc_title, relation_type, evidence_sentence}`. **Post-filter:
   reject any edge whose `evidence_sentence` is not a substring of the
   chunk text.** Resolve `target_doc_title` to `target_document_id` by
   fuzzy match against `sentinel_documents.title` within the same corpus.

## 6. Query tool (MCP)

New tool registered alongside the existing 8 in
`supabase/functions/mcp/index.ts`.

```
sentinel:context_query
  input:  { query: string, corpus_id: string, top_k?: number = 5 }
  output: {
    chunks: [{
      chunk_id, document_id, document_title, source_url,
      text, score, evidence_sentence?
    }],
    related_docs: [{
      document_id, title, source_url, relation_types: string[]
    }]
  }
```

Behaviour: embed the query, kNN over `sentinel_chunks` filtered by
`corpus_id`, dedupe to top docs, gather outgoing `sentinel_edges` from the
matched chunks for the related-docs rail. **No answer synthesis here** —
this tool returns retrieval data only. Streaming and synthesis live in the
demo function (§7).

## 7. Public demo surface

Per kickoff: option (b), signed short-lived demo token. Main `mcp` function
stays JWT-gated. New edge function `supabase/functions/demo/`:

- `POST /functions/v1/demo/token` — mints HS256 JWT with 15-min TTL,
  scope=`demo`, fixed demo `user_id`. CORS open to `my2b.ai`.
- `POST /functions/v1/demo/stream` — body `{query, corpus_id, demo_token}`.
  Validates token. Calls `context_query` internally. Streams synthesized
  answer (Haiku [ASSUMPTION]) with inline `[^doc_id]` citation markers
  resolved client-side to OCC PDF URLs. Per-IP rate limit: 20 req/hour.
  Audit row per call.

## 8. my2b.ai dash page

Separate repo (`Gabriel-is/my2b.ai`), branch `claude/sentinel-occ-demo`
[ASSUMPTION on branch name]. Single page, layout in load order:

1. Header — H1 (Sentinel-framed), corpus selector, currently-loaded
   subtitle
2. Ask box — three canned questions inline, framed "Try these against the
   OCC corpus:"
3. Streamed answer pane — citation chips inline, click → opens real OCC
   PDF in new tab
4. Related-docs rail (right side) — populated from `related_docs`
5. Footer — verbatim text from §2

Token mint on page load. SSE for stream.

## 9. Sequencing (commits on `claude/occ-adapter-LkZ2k`)

1. Adapter `_core` types + registry (no schema, no OCC content)
2. `005_corpus_graph.sql` (file only — applied after pgvector confirmed)
3. `adapters/occ/sources.ts` + `classify.ts` from harvest doc
4. `_core/run.ts` end-to-end on a single OCC URL (smoke)
5. Full 22-URL ingest run; spot-check 5 docs
6. Edge extraction + substring guard; spot-check 5 edges
7. `sentinel:context_query` MCP tool + handler tests
8. `demo` edge function (token + stream) with rate limiting
9. my2b.ai parallel branch with dash page wired to demo endpoint
10. End-to-end: 3 canned questions return real citations
11. Self code-review, draft PR with screenshots + "Known gaps for V2"

## 10. Risks & mitigations

| Risk | Mitigation |
|---|---|
| OCC edge 403s automated fetch | Realistic UA + retry; on persistent 403, fall back to manual local cache uploaded to Supabase Storage. Document gap in PR. |
| pgvector not enabled on free tier | Confirm with `CREATE EXTENSION vector;` before applying 005. Free-tier Supabase generally supports it. |
| Edge extraction hallucination | Substring-of-chunk guard on `evidence_sentence`. Reject anything that fails. Spot-check 5 random edges before ship. |
| Synthesis hallucination on demo | Force inline citations; UI greys out any sentence without a citation chip. |
| Director sees "OCC tool" framing instead of "platform with example" | Greyed future entries in dropdown; H1 is Sentinel-framed; verbatim footer; OCC kept as a label, not branding. |
| OCC logo / endorsement implication | OCC name appears only as corpus label and in citation chip text. No logo. No "for OCC" language. |
| Director can't try the demo (auth wall) | Signed demo token minted page-side; no signup required. |
| MyOCC content accidentally ingested | Adapter `sources.ts` whitelisted to `theocc.com` only; unit test asserts no source URL contains `myocc`. |

## 11. Definition of done (weekend)

- [ ] OCC adapter ingests all (or all-fetchable-of) 22 seed URLs through the
  `_core` interface
- [ ] No OCC-specific logic in core: grep gate passes
- [ ] Documents + chunks + edges populated; spot-check 5 docs + 5 edges
- [ ] `sentinel:context_query` registered and returns structured chunks +
  related_docs
- [ ] my2b.ai dash page deployed with: corpus selector, 3 example questions,
  streamed answer, working citations to live OCC URLs, related-docs rail,
  verbatim footer
- [ ] Draft PR (Sentinel + my2b.ai) open with implementation summary,
  screenshots, "Known gaps for V2" section
- [ ] No merge to main on either repo

## 12. Out of scope (V2 backlog)

- OCR for scanned PDFs
- Anthropic / Supabase corpora actually ingested (greyed UI only)
- License decision (Sentinel still on temporary MIT)
- Production caching / CDN for the demo
- Per-user demo token instead of shared
- Replacing keyword-based `sentinel:assess` with embedding-based assess
- Cross-corpus queries
- Edge extraction quality eval harness

## 13. Open questions Claude needs answered before implementation starts

1. Is pgvector enabled on the Sentinel Supabase project, and OK to enable?
2. Are `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` available as Supabase
   secrets, or should I propose alternatives?
3. my2b.ai repo — branch convention? Preferred path for the page (a new
   `/sentinel/demo` route or replace existing `/sentinel`)?
4. OCC 403 fallback — accept partial ingest with documented gap, or pause
   for manual cache upload?
5. Anything in §5 (chunk size), §4 (relation type vocabulary), §6 (top_k
   default), §7 (synthesis model) that should change before I commit?
