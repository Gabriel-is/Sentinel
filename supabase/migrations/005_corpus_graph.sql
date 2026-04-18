-- Sentinel corpus context graph
-- Schema for the document/chunk/edge graph that powers `sentinel:context_query`
-- and the my2b.ai dash demo. Corpus-agnostic — any corpus (declared via an
-- adapter under adapters/<corpus>/) is registered as a row in
-- sentinel_corpora and referenced by `corpus_id` foreign keys throughout.

-- ============================================================
-- pgvector — required for chunk embeddings
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- Corpora
-- ============================================================

CREATE TABLE sentinel_corpora (
  id                TEXT PRIMARY KEY,           -- short slug, e.g. matches adapter dir name
  label             TEXT NOT NULL,              -- human-readable name shown in dropdown
  description       TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'active',  -- active | coming_soon | archived
  source_count      INTEGER NOT NULL DEFAULT 0,
  last_ingested_at  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Documents
-- ============================================================

CREATE TABLE sentinel_documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corpus_id         TEXT NOT NULL REFERENCES sentinel_corpora(id),
  source_url        TEXT NOT NULL,              -- canonical public URL for citation
  local_filename    TEXT NOT NULL,              -- filename in corpus-raw storage bucket
  title             TEXT NOT NULL,
  doc_type          TEXT NOT NULL,              -- adapter-defined taxonomy
  category          TEXT,
  platform          TEXT,
  content_hash      TEXT NOT NULL,              -- sha256 of raw bytes
  raw_storage_path  TEXT,                       -- corpus-raw/<corpus_id>/<local_filename>
  page_count        INTEGER,
  ingest_status     TEXT NOT NULL DEFAULT 'pending',
  -- pending | fetched | parsed | chunked | embedded | edged | done
  -- | skipped_scanned | error_fetch | error_parse | missing_cache
  error             TEXT,
  fetched_at        TIMESTAMPTZ,
  UNIQUE (corpus_id, content_hash)
);

CREATE INDEX idx_documents_corpus ON sentinel_documents (corpus_id);
CREATE INDEX idx_documents_doc_type ON sentinel_documents (doc_type);
CREATE INDEX idx_documents_status ON sentinel_documents (ingest_status);

-- ============================================================
-- Chunks
-- ============================================================

CREATE TABLE sentinel_chunks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id       UUID NOT NULL REFERENCES sentinel_documents(id) ON DELETE CASCADE,
  chunk_index       INTEGER NOT NULL,
  text              TEXT NOT NULL,
  token_count       INTEGER NOT NULL,
  heading_path      TEXT[] DEFAULT '{}',        -- e.g. ['DDS Market Data Output', 'Full Derivative', 'Options']
  embedding         VECTOR(1536),               -- text-embedding-3-small
  metadata          JSONB DEFAULT '{}',
  UNIQUE (document_id, chunk_index)
);

CREATE INDEX idx_chunks_document ON sentinel_chunks (document_id);
CREATE INDEX idx_chunks_embedding ON sentinel_chunks
  USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_chunks_text_fts ON sentinel_chunks
  USING gin (to_tsvector('english', text));

-- ============================================================
-- Edges (cross-references between docs, anchored on a chunk)
-- ============================================================

CREATE TABLE sentinel_edges (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_chunk_id     UUID NOT NULL REFERENCES sentinel_chunks(id) ON DELETE CASCADE,
  target_document_id  UUID NOT NULL REFERENCES sentinel_documents(id) ON DELETE CASCADE,
  relation_type       TEXT NOT NULL,
  -- references | supersedes | sibling_of | encore_equivalent_of
  evidence_sentence   TEXT NOT NULL,            -- substring of source chunk text
  confidence          NUMERIC NOT NULL,
  extracted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (confidence >= 0 AND confidence <= 1)
);

CREATE INDEX idx_edges_source_chunk ON sentinel_edges (source_chunk_id);
CREATE INDEX idx_edges_target_document ON sentinel_edges (target_document_id);
CREATE INDEX idx_edges_relation_type ON sentinel_edges (relation_type);

-- ============================================================
-- RLS — read-only for authenticated; writes via service role only
-- ============================================================

ALTER TABLE sentinel_corpora ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY corpora_read   ON sentinel_corpora   FOR SELECT TO authenticated USING (true);
CREATE POLICY documents_read ON sentinel_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY chunks_read    ON sentinel_chunks    FOR SELECT TO authenticated USING (true);
CREATE POLICY edges_read     ON sentinel_edges     FOR SELECT TO authenticated USING (true);
