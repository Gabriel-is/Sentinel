import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { dirname, fromFileUrl, join } from "https://deno.land/std@0.224.0/path/mod.ts";

const SCHEMA_PATH = join(dirname(fromFileUrl(import.meta.url)), "schema.sql");

export function getDbPath(): string {
  const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || ".";
  const dir = join(home, ".sentinel");
  try {
    Deno.mkdirSync(dir, { recursive: true });
  } catch { /* exists */ }
  return join(dir, "sentinel.db");
}

export function openDb(): DB {
  const dbPath = getDbPath();
  const db = new DB(dbPath);
  db.execute("PRAGMA journal_mode=WAL");
  db.execute("PRAGMA foreign_keys=ON");

  // Apply schema
  const schema = Deno.readTextFileSync(SCHEMA_PATH);
  db.execute(schema);

  return db;
}

export function isSeeded(db: DB): boolean {
  const [[count]] = db.query<[number]>("SELECT count(*) FROM sentinel_functions");
  return count > 0;
}

export function seedFromJson(db: DB, data: {
  functions?: Array<Record<string, unknown>>;
  categories?: Array<Record<string, unknown>>;
  subcategories?: Array<Record<string, unknown>>;
  controls?: Array<Record<string, unknown>>;
  trustworthy_characteristics?: Array<Record<string, unknown>>;
  glossary?: Array<Record<string, unknown>>;
  crosswalks?: Array<Record<string, unknown>>;
}): void {
  db.execute("BEGIN");
  try {
    for (const fn of data.functions || []) {
      db.query(
        "INSERT OR REPLACE INTO sentinel_functions (id, name, description, is_crosscutting, sort_order) VALUES (?, ?, ?, ?, ?)",
        [fn.id, fn.name, fn.description, fn.is_crosscutting ? 1 : 0, fn.sort_order]
      );
    }
    for (const cat of data.categories || []) {
      db.query(
        "INSERT OR REPLACE INTO sentinel_categories (id, function_id, name, description, sort_order) VALUES (?, ?, ?, ?, ?)",
        [cat.id, cat.function_id, cat.name, cat.description, cat.sort_order]
      );
    }
    for (const sub of data.subcategories || []) {
      db.query(
        "INSERT OR REPLACE INTO sentinel_subcategories (id, category_id, name, description, suggested_actions, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
        [sub.id, sub.category_id, sub.name, sub.description, JSON.stringify(sub.suggested_actions || []), sub.sort_order]
      );
    }
    for (const ctrl of data.controls || []) {
      db.query(
        "INSERT OR REPLACE INTO sentinel_control_objectives (id, subcategory_id, objective_text, implementation_guidance, adoption_stages, risk_statement, trustworthy_principle, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [ctrl.id, ctrl.subcategory_id, ctrl.objective_text, ctrl.implementation_guidance, JSON.stringify(ctrl.adoption_stages || []), ctrl.risk_statement, ctrl.trustworthy_principle, ctrl.sort_order]
      );
    }
    for (const tc of data.trustworthy_characteristics || []) {
      db.query(
        "INSERT OR REPLACE INTO sentinel_trustworthy_characteristics (id, name, description, is_foundational, is_crosscutting, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
        [tc.id, tc.name, tc.description, tc.is_foundational ? 1 : 0, tc.is_crosscutting ? 1 : 0, tc.sort_order]
      );
    }
    for (const g of data.glossary || []) {
      db.query(
        "INSERT OR REPLACE INTO sentinel_glossary (id, term, definition, source, related_terms, category) VALUES (?, ?, ?, ?, ?, ?)",
        [g.id || crypto.randomUUID(), g.term, g.definition, g.source, JSON.stringify(g.related_terms || []), g.category]
      );
    }
    for (const cw of data.crosswalks || []) {
      db.query(
        "INSERT OR REPLACE INTO sentinel_crosswalks (id, source_framework, source_id, target_framework, target_id, target_name, relationship, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [cw.id || crypto.randomUUID(), cw.source_framework, cw.source_id, cw.target_framework, cw.target_id, cw.target_name, cw.relationship, cw.notes]
      );
    }

    // Rebuild FTS index
    db.execute("DELETE FROM sentinel_fts");
    db.execute(`
      INSERT INTO sentinel_fts (id, entity_type, title, content)
      SELECT id, 'function', name, description FROM sentinel_functions
      UNION ALL SELECT id, 'category', name, description FROM sentinel_categories
      UNION ALL SELECT id, 'subcategory', name, description FROM sentinel_subcategories
      UNION ALL SELECT id, 'control', id || ': ' || substr(objective_text, 1, 80), objective_text || ' ' || coalesce(implementation_guidance, '') || ' ' || coalesce(risk_statement, '') FROM sentinel_control_objectives
      UNION ALL SELECT id, 'glossary', term, definition FROM sentinel_glossary
    `);

    db.query("INSERT OR REPLACE INTO sentinel_meta (key, value) VALUES ('last_sync', ?)", [new Date().toISOString()]);
    db.execute("COMMIT");
  } catch (e) {
    db.execute("ROLLBACK");
    throw e;
  }
}
