// Ingest orchestrator. End-to-end flow for one corpus:
//   1. Read local files from data/sources/<corpus>/ (content-hash)
//   2. Parse (PDF via pdfjs-dist, HTML via deno-dom, xlsx/zip stub)
//   3. Classify via adapter.classify()
//   4. Upsert corpus + document rows
//   5. Chunk + embed (local Transformers.js)
//   6. Insert chunks
//   7. Per chunk: extract edges via Haiku, substring-guarded
//   8. Insert edges
//
// Idempotent: re-runs with the same files skip already-persisted
// documents via (corpus_id, content_hash) UNIQUE constraint. To
// re-chunk an existing document, pass --force-rechunk.

import { load as loadEnv } from "jsr:@std/dotenv@0.225";
import { parseArgs } from "jsr:@std/cli@1.0.6/parse-args";
import { dirname, fromFileUrl, join } from "jsr:@std/path@1.0.6";
import { getAdapter } from "./registry.ts";
import { readLocalCorpus } from "./fetch.ts";
import { parseBlob } from "./parse.ts";
import { chunkText } from "./chunk.ts";
import { embedTexts, embeddingDim } from "./embed.ts";
import { EdgeExtractor } from "./extract_edges.ts";
import { Persister } from "./persist.ts";

const HERE = dirname(fromFileUrl(import.meta.url));
const REPO_ROOT = join(HERE, "..", "..");

interface RunOptions {
  corpusId: string;
  forceRechunk: boolean;
  skipEdges: boolean;
  limit?: number;
}

async function main() {
  const args = parseArgs(Deno.args, {
    boolean: ["force-rechunk", "skip-edges", "help"],
    string: ["limit"],
    alias: { h: "help" },
  });

  if (args.help || args._.length === 0) {
    console.log(`Usage: deno task ingest <corpus_id> [options]

Options:
  --force-rechunk    Re-chunk even if document content_hash is unchanged
  --skip-edges       Skip Haiku edge extraction (fast, free)
  --limit <N>        Only ingest the first N sources (for smoke testing)

Env vars required (in .env at repo root):
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  ANTHROPIC_API_KEY   (unless --skip-edges)

Corpus raw files must live at: data/sources/<corpus_id>/
`);
    Deno.exit(args.help ? 0 : 1);
  }

  await loadEnv({ envPath: join(REPO_ROOT, ".env"), export: true });

  const options: RunOptions = {
    corpusId: String(args._[0]),
    forceRechunk: args["force-rechunk"],
    skipEdges: args["skip-edges"],
    limit: args.limit ? Number(args.limit) : undefined,
  };

  await run(options);
}

async function run(options: RunOptions) {
  const supabaseUrl = requireEnv("SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const anthropicKey = options.skipEdges
    ? ""
    : requireEnv("ANTHROPIC_API_KEY");

  const adapter = getAdapter(options.corpusId);
  const sourcesDir = join(REPO_ROOT, "data", "sources", adapter.corpus_id);

  console.log(`[run] corpus: ${adapter.corpus_id} (${adapter.label})`);
  console.log(`[run] sources dir: ${sourcesDir}`);
  console.log(`[run] embedding dim: ${embeddingDim()}`);
  console.log(`[run] skip-edges: ${options.skipEdges}`);

  const persister = new Persister(supabaseUrl, serviceKey);
  await persister.upsertCorpus(adapter);

  // 1. Read local files
  const fetches = await readLocalCorpus(adapter, sourcesDir);
  const toProcess = options.limit ? fetches.slice(0, options.limit) : fetches;

  const summary = {
    total: toProcess.length,
    missing: 0,
    parsed: 0,
    chunked: 0,
    scanned_skipped: 0,
    stub_only: 0,
    errors: 0,
    total_chunks: 0,
    total_edges: 0,
  };

  for (const f of toProcess) {
    if (!f.blob) {
      summary.missing++;
      console.log(`[run] MISSING: ${f.spec.local_filename} (${f.error})`);
      continue;
    }

    try {
      // 2. Parse
      const parseResult = await parseBlob(f.spec, f.blob);
      summary.parsed++;

      // 3. Classify
      const classification = await adapter.classify(parseResult.doc);

      // Decide the doc's final ingest status
      let status:
        | "done"
        | "skipped_scanned"
        | "stub_only"
        | "chunked"
        | "embedded"
        | "edged" = "chunked";
      if (parseResult.skip_reason === "scanned") {
        status = "skipped_scanned";
        summary.scanned_skipped++;
      } else if (parseResult.skip_reason === "stub_only") {
        status = "stub_only";
        summary.stub_only++;
      }

      // 4. Upsert document row
      const doc = await persister.upsertDocument(
        adapter.corpus_id,
        parseResult.doc,
        classification,
        status,
      );

      // Scanned / stub docs don't get chunked
      if (status !== "chunked") {
        console.log(
          `[run] ${f.spec.local_filename}: ${status}`,
        );
        continue;
      }

      // 5. Chunk + embed
      const chunks = chunkText(parseResult.doc.raw_text, doc.id);
      if (chunks.length === 0) {
        await persister.updateDocumentStatus(doc.id, "done");
        continue;
      }

      // Wipe prior chunks for this doc (forceRechunk or first run is same path)
      if (options.forceRechunk) {
        await persister.deleteDocumentChunks(doc.id);
      }

      console.log(
        `[run] ${f.spec.local_filename}: ${parseResult.doc.page_count ?? "?"} pages, ${chunks.length} chunks, embedding...`,
      );
      const embeddings = await embedTexts(chunks.map((c) => c.text));

      const chunkRows = chunks.map((c, i) => ({
        document_id: doc.id,
        chunk_index: c.chunk_index,
        text: c.text,
        token_count: c.token_count,
        heading_path: c.heading_path,
        metadata: c.metadata,
        embedding: embeddings[i],
      }));

      const inserted = await persister.insertChunks(chunkRows);
      summary.total_chunks += inserted.length;
      summary.chunked++;
      await persister.updateDocumentStatus(doc.id, "embedded");
    } catch (err) {
      summary.errors++;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[run] ERROR processing ${f.spec.local_filename}: ${msg}`);
    }
  }

  // 6. Edge extraction pass (after all docs + chunks are in)
  if (!options.skipEdges && summary.chunked > 0) {
    console.log(`[run] extracting edges with Haiku...`);
    const corpusDocs = await persister.listCorpusDocuments(adapter.corpus_id);
    const extractor = new EdgeExtractor(anthropicKey);

    // Pull freshly-inserted chunks — easiest: query all chunks for this corpus
    const { data: chunkRows, error } = await persister.client
      .from("sentinel_chunks")
      .select("id, document_id, text")
      .in("document_id", corpusDocs.map((d) => d.id));
    if (error) {
      console.error(`[run] edge scan failed: ${error.message}`);
    } else {
      let edgeTotal = 0;
      for (const [i, chunk] of (chunkRows ?? []).entries()) {
        const candidates = await extractor.extract({
          chunkId: chunk.id,
          chunkText: chunk.text,
          corpusDocuments: corpusDocs,
          sourceDocumentId: chunk.document_id,
        });
        const inserted = await persister.insertEdges(candidates, corpusDocs);
        edgeTotal += inserted;
        if ((i + 1) % 10 === 0) {
          console.log(`[run] edges: ${i + 1}/${chunkRows?.length}`);
        }
      }
      summary.total_edges = edgeTotal;
    }
  }

  console.log("\n=== Ingest summary ===");
  console.log(summary);
}

function requireEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) {
    console.error(`Missing env var: ${name}`);
    console.error(`Set it in .env at the repo root (see .env.example).`);
    Deno.exit(1);
  }
  return v;
}

if (import.meta.main) {
  await main();
}
