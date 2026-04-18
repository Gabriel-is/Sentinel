// Supabase writes. All writes go through the service-role client; RLS
// gives read-only to `authenticated` for the same tables.

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.39.0";
import type {
  Adapter,
  Classification,
  EdgeCandidate,
  ParsedDoc,
} from "./types.ts";

export interface PersistedDocument {
  id: string;
  title: string;
  local_filename: string;
}

export class Persister {
  client: SupabaseClient;

  constructor(url: string, serviceKey: string) {
    this.client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async upsertCorpus(adapter: Adapter): Promise<void> {
    const { error } = await this.client
      .from("sentinel_corpora")
      .upsert({
        id: adapter.corpus_id,
        label: adapter.label,
        description: adapter.description,
        status: "active",
        source_count: adapter.sources.length,
        last_ingested_at: new Date().toISOString(),
      }, { onConflict: "id" });
    if (error) throw new Error(`corpus upsert: ${error.message}`);
  }

  async upsertDocument(
    corpusId: string,
    doc: ParsedDoc,
    classification: Classification,
    ingestStatus:
      | "pending"
      | "parsed"
      | "chunked"
      | "embedded"
      | "edged"
      | "done"
      | "skipped_scanned"
      | "stub_only",
  ): Promise<PersistedDocument> {
    const row = {
      corpus_id: corpusId,
      source_url: doc.source_url,
      local_filename: doc.local_filename,
      title: doc.title,
      doc_type: classification.doc_type,
      category: classification.category,
      platform: classification.platform,
      content_hash: doc.content_hash,
      raw_storage_path: doc.raw_storage_path,
      page_count: doc.page_count ?? null,
      ingest_status: ingestStatus,
      fetched_at: doc.fetched_at,
    };

    const { data, error } = await this.client
      .from("sentinel_documents")
      .upsert(row, { onConflict: "corpus_id,content_hash" })
      .select("id, title, local_filename")
      .single();

    if (error) throw new Error(`document upsert: ${error.message}`);
    return data as PersistedDocument;
  }

  async updateDocumentStatus(
    documentId: string,
    status: string,
    errorMsg?: string,
  ): Promise<void> {
    const patch: Record<string, unknown> = { ingest_status: status };
    if (errorMsg) patch.error = errorMsg;
    const { error } = await this.client
      .from("sentinel_documents")
      .update(patch)
      .eq("id", documentId);
    if (error) console.warn(`[persist] status update failed: ${error.message}`);
  }

  async deleteDocumentChunks(documentId: string): Promise<void> {
    const { error } = await this.client
      .from("sentinel_chunks")
      .delete()
      .eq("document_id", documentId);
    if (error) throw new Error(`delete chunks: ${error.message}`);
  }

  async insertChunks(
    chunks: Array<{
      document_id: string;
      chunk_index: number;
      text: string;
      token_count: number;
      heading_path: string[];
      embedding: number[];
      metadata: Record<string, unknown>;
    }>,
  ): Promise<Array<{ id: string; chunk_index: number }>> {
    if (chunks.length === 0) return [];

    const BATCH = 50;
    const out: Array<{ id: string; chunk_index: number }> = [];
    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH);
      const { data, error } = await this.client
        .from("sentinel_chunks")
        .insert(batch)
        .select("id, chunk_index");
      if (error) throw new Error(`chunk insert: ${error.message}`);
      out.push(...(data ?? []));
    }
    return out;
  }

  async insertEdges(
    candidates: EdgeCandidate[],
    corpusDocuments: Array<{ id: string; title: string }>,
  ): Promise<number> {
    if (candidates.length === 0) return 0;

    const titleIndex = new Map(
      corpusDocuments.map((d) => [d.title.toLowerCase(), d.id]),
    );

    const rows: Array<Record<string, unknown>> = [];
    for (const c of candidates) {
      const targetId = titleIndex.get(c.target_doc_title.toLowerCase());
      if (!targetId) continue; // unknown target — drop silently
      rows.push({
        source_chunk_id: c.source_chunk_id,
        target_document_id: targetId,
        relation_type: c.relation_type,
        evidence_sentence: c.evidence_sentence,
        confidence: c.confidence,
      });
    }

    if (rows.length === 0) return 0;

    const { error } = await this.client.from("sentinel_edges").insert(rows);
    if (error) throw new Error(`edge insert: ${error.message}`);
    return rows.length;
  }

  async listCorpusDocuments(
    corpusId: string,
  ): Promise<Array<{ id: string; title: string }>> {
    const { data, error } = await this.client
      .from("sentinel_documents")
      .select("id, title")
      .eq("corpus_id", corpusId);
    if (error) throw new Error(`list docs: ${error.message}`);
    return data ?? [];
  }
}
