// Sentinel adapter core — types only. Corpus-agnostic.
// Any new corpus implements `Adapter` and registers itself in `registry.ts`.

export interface SourceSpec {
  url: string;
  local_filename: string;
  title: string;
  doc_type: "pdf" | "html";
  category: string;
  platform: string | null;
  classifier_hint: string;
  notes?: string;
}

export interface RawBlob {
  storage_path: string;
  bytes: Uint8Array;
  content_hash: string;
  fetched_at: string;
}

export interface ParsedDoc {
  source_url: string;
  local_filename: string;
  title: string;
  doc_type: "pdf" | "html";
  raw_text: string;
  page_count?: number;
  content_hash: string;
  fetched_at: string;
  raw_storage_path: string;
}

export interface Classification {
  doc_type: string;
  category: string;
  platform: string | null;
  confidence: number;
  rule: "regex" | "llm" | "spec_hint";
}

export interface Chunk {
  document_id: string;
  chunk_index: number;
  text: string;
  token_count: number;
  heading_path: string[];
  metadata: Record<string, unknown>;
}

export interface EmbeddedChunk extends Chunk {
  embedding: number[];
}

export interface EdgeCandidate {
  source_chunk_id: string;
  target_doc_title: string;
  relation_type: string;
  evidence_sentence: string;
  confidence: number;
}

export interface Edge {
  source_chunk_id: string;
  target_document_id: string;
  relation_type: string;
  evidence_sentence: string;
  confidence: number;
}

export interface Adapter {
  corpus_id: string;
  label: string;
  description: string;
  sources: SourceSpec[];
  classify(doc: ParsedDoc): Promise<Classification>;
}

export const RELATION_TYPES = [
  "references",
  "supersedes",
  "sibling_of",
  "encore_equivalent_of",
] as const;

export type RelationType = typeof RELATION_TYPES[number];
