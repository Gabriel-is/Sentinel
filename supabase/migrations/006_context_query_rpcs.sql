-- Vector search RPC for the sentinel:context_query MCP tool.
-- Returns top-k chunks from a given corpus by cosine similarity, joined
-- with document metadata needed for citation rendering.

CREATE OR REPLACE FUNCTION sentinel_vector_search(
  query_embedding VECTOR(384),
  corpus TEXT,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  chunk_id          UUID,
  document_id       UUID,
  chunk_index       INT,
  text              TEXT,
  heading_path      TEXT[],
  token_count       INT,
  similarity        FLOAT,
  document_title    TEXT,
  document_source_url TEXT,
  document_category TEXT,
  document_platform TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS chunk_id,
    c.document_id,
    c.chunk_index,
    c.text,
    c.heading_path,
    c.token_count,
    (1 - (c.embedding <=> query_embedding))::FLOAT AS similarity,
    d.title AS document_title,
    d.source_url AS document_source_url,
    d.category AS document_category,
    d.platform AS document_platform
  FROM sentinel_chunks c
  JOIN sentinel_documents d ON d.id = c.document_id
  WHERE d.corpus_id = corpus
    AND c.embedding IS NOT NULL
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION sentinel_vector_search(VECTOR(384), TEXT, INT)
  TO authenticated;


-- FTS fallback RPC for when vector embeddings aren't available at query
-- time (e.g., runtime doesn't have Supabase.ai.Session). Keeps the MCP
-- tool useful even if the semantic path fails.

CREATE OR REPLACE FUNCTION sentinel_fts_search(
  query_text TEXT,
  corpus TEXT,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  chunk_id          UUID,
  document_id       UUID,
  chunk_index       INT,
  text              TEXT,
  heading_path      TEXT[],
  token_count       INT,
  rank              FLOAT,
  document_title    TEXT,
  document_source_url TEXT,
  document_category TEXT,
  document_platform TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  q TSQUERY := websearch_to_tsquery('english', query_text);
BEGIN
  RETURN QUERY
  SELECT
    c.id AS chunk_id,
    c.document_id,
    c.chunk_index,
    c.text,
    c.heading_path,
    c.token_count,
    ts_rank(to_tsvector('english', c.text), q)::FLOAT AS rank,
    d.title AS document_title,
    d.source_url AS document_source_url,
    d.category AS document_category,
    d.platform AS document_platform
  FROM sentinel_chunks c
  JOIN sentinel_documents d ON d.id = c.document_id
  WHERE d.corpus_id = corpus
    AND to_tsvector('english', c.text) @@ q
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION sentinel_fts_search(TEXT, TEXT, INT)
  TO authenticated;
