-- Sentinel CLI local SQLite schema
-- Mirrors Supabase tables for offline reference data

CREATE TABLE IF NOT EXISTS sentinel_functions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_crosscutting INTEGER DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sentinel_categories (
  id TEXT PRIMARY KEY,
  function_id TEXT NOT NULL REFERENCES sentinel_functions(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sentinel_subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES sentinel_categories(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_actions TEXT DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sentinel_control_objectives (
  id TEXT PRIMARY KEY,
  subcategory_id TEXT REFERENCES sentinel_subcategories(id),
  objective_text TEXT NOT NULL,
  implementation_guidance TEXT,
  adoption_stages TEXT DEFAULT '[]',
  risk_statement TEXT,
  trustworthy_principle TEXT,
  informative_references TEXT DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sentinel_trustworthy_characteristics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_foundational INTEGER DEFAULT 0,
  is_crosscutting INTEGER DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sentinel_glossary (
  id TEXT PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  source TEXT,
  related_terms TEXT DEFAULT '[]',
  category TEXT
);

CREATE TABLE IF NOT EXISTS sentinel_crosswalks (
  id TEXT PRIMARY KEY,
  source_framework TEXT NOT NULL,
  source_id TEXT NOT NULL,
  target_framework TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_name TEXT,
  relationship TEXT NOT NULL DEFAULT 'maps_to',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS sentinel_meta (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- FTS virtual table for search
CREATE VIRTUAL TABLE IF NOT EXISTS sentinel_fts USING fts5(
  id, entity_type, title, content,
  tokenize='porter unicode61'
);
