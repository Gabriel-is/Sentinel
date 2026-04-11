-- Sentinel Schema v1
-- NIST AI RMF + FS AI RMF compliance learning and checking tool

-- ============================================================
-- Core Taxonomy (NIST AI RMF structure)
-- ============================================================

CREATE TABLE sentinel_functions (
  id TEXT PRIMARY KEY,                    -- 'GOVERN', 'MAP', 'MEASURE', 'MANAGE'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_crosscutting BOOLEAN DEFAULT FALSE,  -- true for GOVERN
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE sentinel_categories (
  id TEXT PRIMARY KEY,                    -- 'GOVERN 1', 'MAP 2', etc.
  function_id TEXT NOT NULL REFERENCES sentinel_functions(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE sentinel_subcategories (
  id TEXT PRIMARY KEY,                    -- 'GOVERN 1.1', 'MAP 2.3', etc.
  category_id TEXT NOT NULL REFERENCES sentinel_categories(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_actions JSONB DEFAULT '[]',   -- From NIST Playbook
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- FS AI RMF Extension (230 Control Objectives)
-- ============================================================

CREATE TABLE sentinel_control_objectives (
  id TEXT PRIMARY KEY,                    -- Control objective ID from RCM
  subcategory_id TEXT REFERENCES sentinel_subcategories(id),
  objective_text TEXT NOT NULL,
  implementation_guidance TEXT,
  adoption_stages TEXT[] NOT NULL DEFAULT '{}',  -- Which stages this applies to
  risk_statement TEXT,
  trustworthy_principle TEXT,             -- Which of the 7 principles
  informative_references JSONB DEFAULT '{}',    -- Links to ISO, EU AI Act, etc.
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Index for filtering by adoption stage
CREATE INDEX idx_controls_adoption ON sentinel_control_objectives USING GIN (adoption_stages);

-- ============================================================
-- Trustworthiness Characteristics
-- ============================================================

CREATE TABLE sentinel_trustworthy_characteristics (
  id TEXT PRIMARY KEY,                    -- 'valid_reliable', 'safe', etc.
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_foundational BOOLEAN DEFAULT FALSE,  -- true for Valid & Reliable
  is_crosscutting BOOLEAN DEFAULT FALSE,  -- true for Accountable & Transparent
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- Glossary
-- ============================================================

CREATE TABLE sentinel_glossary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  source TEXT,                            -- 'NIST AI RMF', 'FS AI RMF', 'ISO', etc.
  related_terms TEXT[] DEFAULT '{}',
  category TEXT,                          -- 'risk', 'governance', 'technical', 'regulatory'
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', term || ' ' || definition || ' ' || COALESCE(source, ''))
  ) STORED
);

CREATE INDEX idx_glossary_search ON sentinel_glossary USING GIN (search_vector);
CREATE INDEX idx_glossary_term ON sentinel_glossary (term);

-- ============================================================
-- Learning / Spaced Repetition
-- ============================================================

CREATE TABLE sentinel_flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  card_type TEXT NOT NULL,                -- 'term', 'control', 'function', 'scenario', 'acronym'
  front TEXT NOT NULL,                    -- Question / prompt
  back TEXT NOT NULL,                     -- Answer
  source_id TEXT,                         -- FK to glossary term, control ID, or subcategory ID
  source_table TEXT,                      -- Which table source_id refers to
  -- Spaced repetition fields (SM-2 algorithm)
  ease_factor NUMERIC NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 1,
  next_review TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  review_count INTEGER NOT NULL DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flashcards_next_review ON sentinel_flashcards (user_id, next_review);
CREATE INDEX idx_flashcards_type ON sentinel_flashcards (card_type);

-- ============================================================
-- Compliance Assessments
-- ============================================================

CREATE TABLE sentinel_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT,                             -- Optional name for the assessment
  input_type TEXT NOT NULL,               -- 'plan', 'architecture', 'code', 'policy'
  input_summary TEXT NOT NULL,            -- Brief description of what was assessed
  input_hash TEXT,                        -- SHA256 for dedup
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  findings JSONB NOT NULL DEFAULT '[]',   -- Array of finding objects
  -- Each finding: { control_id, status: 'met'|'partial'|'gap'|'na', gap_description, recommendation, severity }
  controls_assessed INTEGER NOT NULL DEFAULT 0,
  controls_met INTEGER NOT NULL DEFAULT 0,
  controls_partial INTEGER NOT NULL DEFAULT 0,
  controls_gap INTEGER NOT NULL DEFAULT 0,
  overall_score NUMERIC,                  -- 0-100
  adoption_stage TEXT,                    -- Assessed adoption stage
  notes TEXT
);

CREATE INDEX idx_assessments_date ON sentinel_assessments (assessed_at DESC);

-- ============================================================
-- Framework Crosswalks
-- ============================================================

CREATE TABLE sentinel_crosswalks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_framework TEXT NOT NULL,         -- 'nist_ai_rmf', 'fs_ai_rmf'
  source_id TEXT NOT NULL,                -- ID in source framework
  target_framework TEXT NOT NULL,         -- 'iso42001', 'eu_ai_act', 'sr11_7', 'nist_csf', 'owasp_llm'
  target_id TEXT NOT NULL,                -- ID in target framework
  target_name TEXT,                       -- Human-readable name of target control
  relationship TEXT NOT NULL DEFAULT 'maps_to', -- 'maps_to', 'partially_maps', 'related'
  notes TEXT
);

CREATE INDEX idx_crosswalks_source ON sentinel_crosswalks (source_framework, source_id);
CREATE INDEX idx_crosswalks_target ON sentinel_crosswalks (target_framework, target_id);

-- ============================================================
-- Full-text search view across all content
-- ============================================================

CREATE OR REPLACE VIEW sentinel_search AS
  SELECT
    id, 'function' AS entity_type, name AS title, description AS content,
    to_tsvector('english', name || ' ' || description) AS search_vector
  FROM sentinel_functions
  UNION ALL
  SELECT
    id, 'category', name, description,
    to_tsvector('english', id || ' ' || name || ' ' || description)
  FROM sentinel_categories
  UNION ALL
  SELECT
    id, 'subcategory', name, description,
    to_tsvector('english', id || ' ' || name || ' ' || description)
  FROM sentinel_subcategories
  UNION ALL
  SELECT
    id, 'control', id || ': ' || LEFT(objective_text, 80), objective_text,
    to_tsvector('english', id || ' ' || objective_text || ' ' || COALESCE(implementation_guidance, '') || ' ' || COALESCE(risk_statement, ''))
  FROM sentinel_control_objectives
  UNION ALL
  SELECT
    id::TEXT, 'glossary', term, definition,
    search_vector
  FROM sentinel_glossary;

-- ============================================================
-- RLS — enabled on all tables
-- ============================================================

-- User-scoped tables: users can only access their own data
ALTER TABLE sentinel_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY flashcards_user_policy ON sentinel_flashcards
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY assessments_user_policy ON sentinel_assessments
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reference tables: read-only for authenticated users
ALTER TABLE sentinel_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_control_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_trustworthy_characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_crosswalks ENABLE ROW LEVEL SECURITY;

CREATE POLICY functions_read ON sentinel_functions FOR SELECT TO authenticated USING (true);
CREATE POLICY categories_read ON sentinel_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY subcategories_read ON sentinel_subcategories FOR SELECT TO authenticated USING (true);
CREATE POLICY controls_read ON sentinel_control_objectives FOR SELECT TO authenticated USING (true);
CREATE POLICY characteristics_read ON sentinel_trustworthy_characteristics FOR SELECT TO authenticated USING (true);
CREATE POLICY glossary_read ON sentinel_glossary FOR SELECT TO authenticated USING (true);
CREATE POLICY crosswalks_read ON sentinel_crosswalks FOR SELECT TO authenticated USING (true);
