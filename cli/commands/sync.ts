import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { seedFromJson } from "../db/local.ts";
import { dirname, fromFileUrl, join } from "https://deno.land/std@0.224.0/path/mod.ts";

const SUPABASE_URL = "https://ewugluzfpgsonifbpeau.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dWdsdXpmcGdzb25pZmJwZWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjQzODcsImV4cCI6MjA5MTUwMDM4N30.XIitzd5_XQgxoPTOxyX-TkT1kv-FYNDHwDrHxqeO9nw";

async function fetchTable(table: string, select = "*", order?: string): Promise<unknown[]> {
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}`;
  if (order) url += `&order=${order}`;
  const resp = await fetch(url, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  if (!resp.ok) throw new Error(`Failed to fetch ${table}: ${resp.status}`);
  return await resp.json();
}

export async function syncFromRemote(db: DB): Promise<void> {
  console.log("Syncing from Supabase...");

  try {
    // Quick connectivity check
    const testResp = await fetch(`${SUPABASE_URL}/rest/v1/sentinel_functions?select=id&limit=1`, {
      headers: { apikey: ANON_KEY },
    });
    if (!testResp.ok) throw new Error(`Supabase REST returned ${testResp.status}: ${await testResp.text()}`);

    const [functions, categories, subcategories, controls, characteristics, glossary, crosswalks] = await Promise.all([
      fetchTable("sentinel_functions", "*", "sort_order"),
      fetchTable("sentinel_categories", "*", "sort_order"),
      fetchTable("sentinel_subcategories", "*", "sort_order"),
      fetchTable("sentinel_control_objectives", "*", "sort_order"),
      fetchTable("sentinel_trustworthy_characteristics", "*", "sort_order"),
      fetchTable("sentinel_glossary", "id,term,definition,source,related_terms,category", "term"),
      fetchTable("sentinel_crosswalks"),
    ]);

    seedFromJson(db, {
      functions: functions as Array<Record<string, unknown>>,
      categories: categories as Array<Record<string, unknown>>,
      subcategories: subcategories as Array<Record<string, unknown>>,
      controls: controls as Array<Record<string, unknown>>,
      trustworthy_characteristics: characteristics as Array<Record<string, unknown>>,
      glossary: glossary as Array<Record<string, unknown>>,
      crosswalks: crosswalks as Array<Record<string, unknown>>,
    });

    console.log(`Synced: ${(functions as unknown[]).length} functions, ${(categories as unknown[]).length} categories, ${(subcategories as unknown[]).length} subcategories, ${(controls as unknown[]).length} controls, ${(glossary as unknown[]).length} glossary, ${(crosswalks as unknown[]).length} crosswalks`);
  } catch (e) {
    // Fall back to local JSON files
    console.log(`Remote sync failed: ${(e as Error).message}`);
    console.log("Trying local JSON files...");
    const cliDir = dirname(dirname(fromFileUrl(import.meta.url)));
    const dataDir = join(dirname(cliDir), "data", "parsed");

    try {
      const taxonomy = JSON.parse(Deno.readTextFileSync(join(dataDir, "nist-ai-rmf-taxonomy.json")));
      const controlsData = JSON.parse(Deno.readTextFileSync(join(dataDir, "fs-ai-rmf-controls.json")));
      const glossaryData = JSON.parse(Deno.readTextFileSync(join(dataDir, "glossary.json")));

      let crosswalksData: { crosswalks: Array<Record<string, unknown>> } = { crosswalks: [] };
      try {
        crosswalksData = JSON.parse(Deno.readTextFileSync(join(dataDir, "crosswalks.json")));
      } catch { /* optional */ }

      seedFromJson(db, {
        functions: taxonomy.functions,
        categories: taxonomy.categories,
        subcategories: taxonomy.subcategories,
        trustworthy_characteristics: taxonomy.trustworthy_characteristics,
        controls: controlsData.controls,
        glossary: glossaryData.terms,
        crosswalks: crosswalksData.crosswalks,
      });
      console.log("Seeded from local JSON files.");
    } catch {
      console.error("Failed to seed from local files. Run from the sentinel repo directory or ensure network access.");
      throw e;
    }
  }
}
