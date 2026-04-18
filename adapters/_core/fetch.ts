// Read raw corpus files from the local filesystem.
//
// OCC's web edge 403s automated fetch, so the pipeline doesn't pull from
// URLs at ingest time. The user drops files into data/sources/<corpus>/
// and this module matches each file against an adapter's SourceSpec by
// filename.

import { encodeHex } from "jsr:@std/encoding@0.224/hex";
import type { Adapter, RawBlob, SourceSpec } from "./types.ts";

export interface FetchResult {
  spec: SourceSpec;
  blob: RawBlob | null;     // null = file missing on disk
  error?: string;
}

export async function readLocalCorpus(
  adapter: Adapter,
  sourcesDir: string,
): Promise<FetchResult[]> {
  const results: FetchResult[] = [];

  // Enumerate actual files on disk (for diagnostics).
  const onDisk = new Set<string>();
  try {
    for await (const entry of Deno.readDir(sourcesDir)) {
      if (entry.isFile) onDisk.add(entry.name);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Cannot read corpus directory ${sourcesDir}: ${msg}`,
    );
  }

  for (const spec of adapter.sources) {
    const filePath = `${sourcesDir}/${spec.local_filename}`;
    try {
      const bytes = await Deno.readFile(filePath);
      const hash = await sha256(bytes);
      results.push({
        spec,
        blob: {
          storage_path: `corpus-raw/${adapter.corpus_id}/${spec.local_filename}`,
          bytes,
          content_hash: hash,
          fetched_at: new Date().toISOString(),
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("NotFound") || msg.includes("No such file")) {
        results.push({ spec, blob: null, error: "missing_on_disk" });
      } else {
        results.push({ spec, blob: null, error: msg });
      }
    }
  }

  // Surface extras (files on disk the adapter doesn't know about) to the
  // ingest log. These are candidates for V2 additions to sources.ts.
  const expected = new Set(adapter.sources.map((s) => s.local_filename));
  const extras = [...onDisk].filter((f) => !expected.has(f));
  if (extras.length) {
    console.log(
      `[fetch] ${extras.length} extra file(s) on disk not in sources.ts:`,
    );
    for (const e of extras) console.log(`  - ${e}`);
  }

  return results;
}

async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return encodeHex(new Uint8Array(digest));
}
