import {
  assertEquals,
  assertExists,
  assert,
  assertArrayIncludes,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts";
import {
  lookup,
  explain,
  glossary,
  crosswalk,
  assess,
  adoptionStage,
} from "../lib/handlers.ts";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const SCHEMA = Deno.readTextFileSync(
  fromFileUrl(new URL("../db/schema.sql", import.meta.url)),
);

/** Create an in-memory SQLite DB with schema applied and minimal seed data. */
function createTestDb(): DB {
  const db = new DB();
  db.execute("PRAGMA foreign_keys=ON");
  db.execute(SCHEMA);
  seedTestData(db);
  return db;
}

function seedTestData(db: DB): void {
  db.execute("BEGIN");

  // --- Functions ---
  db.query(
    "INSERT INTO sentinel_functions (id, name, description, is_crosscutting, sort_order) VALUES (?, ?, ?, ?, ?)",
    ["GOVERN", "Govern", "Policies, processes, procedures, and practices across the organization related to the mapping, measuring, and managing of AI risks.", 0, 1],
  );
  db.query(
    "INSERT INTO sentinel_functions (id, name, description, is_crosscutting, sort_order) VALUES (?, ?, ?, ?, ?)",
    ["MAP", "Map", "Establish context to frame risks related to an AI system.", 0, 2],
  );

  // --- Categories ---
  db.query(
    "INSERT INTO sentinel_categories (id, function_id, name, description, sort_order) VALUES (?, ?, ?, ?, ?)",
    ["GOVERN 1", "GOVERN", "Govern 1", "Policies, processes, procedures, and practices are in place and operating effectively to govern AI risks.", 1],
  );
  db.query(
    "INSERT INTO sentinel_categories (id, function_id, name, description, sort_order) VALUES (?, ?, ?, ?, ?)",
    ["GOVERN 2", "GOVERN", "Govern 2", "Accountability structures are in place so that the appropriate teams and individuals are empowered.", 2],
  );
  db.query(
    "INSERT INTO sentinel_categories (id, function_id, name, description, sort_order) VALUES (?, ?, ?, ?, ?)",
    ["MAP 1", "MAP", "Map 1", "Context is established and understood.", 1],
  );

  // --- Subcategories ---
  db.query(
    "INSERT INTO sentinel_subcategories (id, category_id, name, description, suggested_actions, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
    ["GOVERN 1.1", "GOVERN 1", "Govern 1.1", "Legal and regulatory requirements involving AI are understood, managed, and documented.", "[]", 1],
  );
  db.query(
    "INSERT INTO sentinel_subcategories (id, category_id, name, description, suggested_actions, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
    ["GOVERN 1.2", "GOVERN 1", "Govern 1.2", "The characteristics of trustworthy AI are integrated into organizational policies.", "[]", 2],
  );
  db.query(
    "INSERT INTO sentinel_subcategories (id, category_id, name, description, suggested_actions, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
    ["MAP 1.1", "MAP 1", "Map 1.1", "Intended purposes, potentially beneficial uses, context of use, and the design of an AI system are understood and documented.", "[]", 1],
  );

  // --- Control Objectives ---
  db.query(
    `INSERT INTO sentinel_control_objectives
     (id, subcategory_id, objective_text, implementation_guidance, adoption_stages, risk_statement, trustworthy_principle, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "GV-1.1-001", "GOVERN 1.1",
      "The organization identifies applicable legal and regulatory requirements related to AI bias and fairness.",
      "Maintain a register of applicable laws and regulations. Conduct bias testing procedures. Technical validation required.",
      '["scoping","minimum_viable","scaling","full_implementation"]',
      "Failure to comply may result in regulatory penalties and bias in AI systems.",
      "Fair with Harmful Bias Managed",
      1,
    ],
  );
  db.query(
    `INSERT INTO sentinel_control_objectives
     (id, subcategory_id, objective_text, implementation_guidance, adoption_stages, risk_statement, trustworthy_principle, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "GV-1.1-002", "GOVERN 1.1",
      "The organization establishes policy governance for AI risk management.",
      "Define policy lifecycle management. Ensure policy covers monitoring and drift detection.",
      '["minimum_viable","scaling","full_implementation"]',
      "Lack of policy governance may lead to unmanaged AI risks.",
      "Accountable and Transparent",
      2,
    ],
  );
  db.query(
    `INSERT INTO sentinel_control_objectives
     (id, subcategory_id, objective_text, implementation_guidance, adoption_stages, risk_statement, trustworthy_principle, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "GV-1.2-001", "GOVERN 1.2",
      "Trustworthy AI characteristics are documented in organizational policies.",
      "Integrate transparency, explainability, and fairness requirements into existing policy frameworks.",
      '["scaling","full_implementation"]',
      "Without policy integration, trustworthy AI principles may not be consistently applied.",
      "Accountable and Transparent",
      3,
    ],
  );
  db.query(
    `INSERT INTO sentinel_control_objectives
     (id, subcategory_id, objective_text, implementation_guidance, adoption_stages, risk_statement, trustworthy_principle, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "MP-1.1-001", "MAP 1.1",
      "Intended purposes and context of use for the AI system are documented.",
      "Document use cases, stakeholders, and deployment context. Review for potential misuse.",
      '["scoping","minimum_viable","scaling","full_implementation"]',
      "Undocumented context may lead to AI misuse or unintended consequences.",
      "Valid and Reliable",
      4,
    ],
  );

  // --- Glossary ---
  db.query(
    "INSERT INTO sentinel_glossary (id, term, definition, source, related_terms, category) VALUES (?, ?, ?, ?, ?, ?)",
    ["g1", "AI Risk Management Framework", "A framework for managing risks related to AI systems.", "NIST", '["risk","AI"]', "framework"],
  );
  db.query(
    "INSERT INTO sentinel_glossary (id, term, definition, source, related_terms, category) VALUES (?, ?, ?, ?, ?, ?)",
    ["g2", "Bias", "Systematic and unfair prejudice in AI system outputs.", "NIST", '["fairness","discrimination"]', "trustworthiness"],
  );
  db.query(
    "INSERT INTO sentinel_glossary (id, term, definition, source, related_terms, category) VALUES (?, ?, ?, ?, ?, ?)",
    ["g3", "Transparency", "The extent to which information about an AI system is available to individuals.", "NIST", '["explainability"]', "trustworthiness"],
  );
  db.query(
    "INSERT INTO sentinel_glossary (id, term, definition, source, related_terms, category) VALUES (?, ?, ?, ?, ?, ?)",
    ["g4", "Model Validation", "Independent assessment of model soundness and fitness for purpose.", "SR 11-7", '["testing","verification"]', "risk_management"],
  );

  // --- Crosswalks ---
  db.query(
    "INSERT INTO sentinel_crosswalks (id, source_framework, source_id, target_framework, target_id, target_name, relationship, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    ["cw1", "FS-AI-RMF", "GV-1.1-001", "ISO42001", "6.1.1", "Actions to address risks and opportunities", "maps_to", "Both address risk identification."],
  );
  db.query(
    "INSERT INTO sentinel_crosswalks (id, source_framework, source_id, target_framework, target_id, target_name, relationship, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    ["cw2", "FS-AI-RMF", "GV-1.1-001", "EU_AI_ACT", "Art. 9", "Risk management system", "maps_to", "EU AI Act risk management."],
  );
  db.query(
    "INSERT INTO sentinel_crosswalks (id, source_framework, source_id, target_framework, target_id, target_name, relationship, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    ["cw3", "FS-AI-RMF", "GV-1.2-001", "ISO42001", "5.2", "AI policy", "maps_to", "Policy alignment."],
  );

  // --- Rebuild FTS ---
  db.execute("DELETE FROM sentinel_fts");
  db.execute(`
    INSERT INTO sentinel_fts (id, entity_type, title, content)
    SELECT id, 'function', name, description FROM sentinel_functions
    UNION ALL SELECT id, 'category', name, description FROM sentinel_categories
    UNION ALL SELECT id, 'subcategory', name, description FROM sentinel_subcategories
    UNION ALL SELECT id, 'control', id || ': ' || substr(objective_text, 1, 80), objective_text || ' ' || coalesce(implementation_guidance, '') || ' ' || coalesce(risk_statement, '') FROM sentinel_control_objectives
    UNION ALL SELECT id, 'glossary', term, definition FROM sentinel_glossary
  `);

  db.execute("COMMIT");
}

// =========================================================================
// lookup tests
// =========================================================================

Deno.test("lookup - exact function ID match returns function + categories", () => {
  const db = createTestDb();
  try {
    const result = lookup(db, "GOVERN");
    assertEquals(result.match_type, "function");
    assertExists(result.function);
    const fn = result.function as Record<string, unknown>;
    assertEquals(fn.id, "GOVERN");
    assertEquals(fn.name, "Govern");
    const cats = result.categories as Array<Record<string, unknown>>;
    assertEquals(cats.length, 2);
    assertEquals(cats[0].id, "GOVERN 1");
    assertEquals(cats[1].id, "GOVERN 2");
  } finally {
    db.close();
  }
});

Deno.test("lookup - case-insensitive function ID match", () => {
  const db = createTestDb();
  try {
    const result = lookup(db, "govern");
    assertEquals(result.match_type, "function");
    const fn = result.function as Record<string, unknown>;
    assertEquals(fn.id, "GOVERN");
  } finally {
    db.close();
  }
});

Deno.test("lookup - exact subcategory ID match returns subcategory + controls", () => {
  const db = createTestDb();
  try {
    const result = lookup(db, "GOVERN 1.1");
    assertEquals(result.match_type, "subcategory");
    assertExists(result.subcategory);
    const sub = result.subcategory as Record<string, unknown>;
    assertEquals(sub.id, "GOVERN 1.1");
    const ctrls = result.control_objectives as Array<Record<string, unknown>>;
    assertEquals(ctrls.length, 2);
    assertEquals(ctrls[0].id, "GV-1.1-001");
    assertEquals(ctrls[1].id, "GV-1.1-002");
  } finally {
    db.close();
  }
});

Deno.test("lookup - exact control ID match returns control detail", () => {
  const db = createTestDb();
  try {
    const result = lookup(db, "GV-1.1-001");
    assertEquals(result.match_type, "control");
    assertExists(result.control);
    const ctrl = result.control as Record<string, unknown>;
    assertEquals(ctrl.id, "GV-1.1-001");
    assert(typeof ctrl.objective_text === "string");
    assert((ctrl.objective_text as string).includes("legal and regulatory"));
  } finally {
    db.close();
  }
});

Deno.test("lookup - FTS search for 'bias' returns search results", () => {
  const db = createTestDb();
  try {
    const result = lookup(db, "bias");
    assertEquals(result.match_type, "search");
    const results = result.results as Array<Record<string, unknown>>;
    assert(results.length > 0, "Expected at least one FTS result for 'bias'");
    // The glossary term 'Bias' should appear in the results
    const ids = results.map((r) => r.id);
    assertArrayIncludes(ids, ["g2"]);
  } finally {
    db.close();
  }
});

Deno.test("lookup - unknown ID falls through to search (not error)", () => {
  const db = createTestDb();
  try {
    const result = lookup(db, "NONEXISTENT_XYZ");
    assertEquals(result.match_type, "search");
    assertExists(result.results);
    // Should not throw, just return empty or low results
    assert(Array.isArray(result.results));
  } finally {
    db.close();
  }
});

Deno.test("lookup - scope 'nist' filters out controls from FTS", () => {
  const db = createTestDb();
  try {
    const result = lookup(db, "policy", "nist");
    assertEquals(result.match_type, "search");
    assertEquals(result.scope, "nist");
    const results = result.results as Array<Record<string, unknown>>;
    for (const r of results) {
      assert(r.entity_type !== "control", "nist scope should exclude controls");
    }
  } finally {
    db.close();
  }
});

Deno.test("lookup - scope 'fs' filters to controls only from FTS", () => {
  const db = createTestDb();
  try {
    const result = lookup(db, "policy", "fs");
    assertEquals(result.match_type, "search");
    const results = result.results as Array<Record<string, unknown>>;
    for (const r of results) {
      assertEquals(r.entity_type, "control", "fs scope should only return controls");
    }
  } finally {
    db.close();
  }
});

// =========================================================================
// explain tests
// =========================================================================

Deno.test("explain - function topic returns function data with categories", () => {
  const db = createTestDb();
  try {
    const result = explain(db, "GOVERN");
    assertEquals(result.entity_type, "function");
    assertEquals(result.id, "GOVERN");
    assertEquals(result.name, "Govern");
    const cats = result.categories as Array<Record<string, unknown>>;
    assert(cats.length >= 1, "Should include categories");
    assertEquals(result.depth, "detailed");
  } finally {
    db.close();
  }
});

Deno.test("explain - function matched by name substring", () => {
  const db = createTestDb();
  try {
    const result = explain(db, "Govern");
    assertEquals(result.entity_type, "function");
    assertEquals(result.id, "GOVERN");
  } finally {
    db.close();
  }
});

Deno.test("explain - subcategory topic returns subcategory with controls", () => {
  const db = createTestDb();
  try {
    const result = explain(db, "GOVERN 1.1");
    assertEquals(result.entity_type, "subcategory");
    assertEquals(result.id, "GOVERN 1.1");
    const ctrls = result.control_objectives as Array<Record<string, unknown>>;
    assert(ctrls.length >= 1, "Should include control objectives");
  } finally {
    db.close();
  }
});

Deno.test("explain - glossary topic returns matching terms", () => {
  const db = createTestDb();
  try {
    const result = explain(db, "Bias");
    assertEquals(result.entity_type, "glossary");
    const terms = result.terms as Array<Record<string, unknown>>;
    assert(terms.length >= 1);
    assert(terms.some((t) => t.term === "Bias"));
  } finally {
    db.close();
  }
});

Deno.test("explain - respects depth parameter", () => {
  const db = createTestDb();
  try {
    const result = explain(db, "GOVERN", "expert");
    assertEquals(result.depth, "expert");
  } finally {
    db.close();
  }
});

Deno.test("explain - unknown topic returns not_found with suggestion", () => {
  const db = createTestDb();
  try {
    const result = explain(db, "xyzzy_nonexistent_topic_42");
    assertEquals(result.entity_type, "not_found");
    assertEquals(result.topic, "xyzzy_nonexistent_topic_42");
    assertExists(result.suggestion);
    assert(typeof result.suggestion === "string");
    assert((result.suggestion as string).length > 0);
  } finally {
    db.close();
  }
});

// =========================================================================
// glossary tests
// =========================================================================

Deno.test("glossary - no args returns category summary", () => {
  const db = createTestDb();
  try {
    const result = glossary(db);
    assertExists(result.categories);
    assertExists(result.total_terms);
    assertEquals(result.total_terms, 4);
    const cats = result.categories as Record<string, number>;
    // We seeded 'framework', 'trustworthiness', 'risk_management'
    assertExists(cats["framework"]);
    assertExists(cats["trustworthiness"]);
    assertExists(cats["risk_management"]);
    assertEquals(cats["framework"], 1);
    assertEquals(cats["trustworthiness"], 2);
    assertEquals(cats["risk_management"], 1);
  } finally {
    db.close();
  }
});

Deno.test("glossary - term search returns matching terms", () => {
  const db = createTestDb();
  try {
    const result = glossary(db, "Bias");
    const results = result.results as Array<Record<string, unknown>>;
    assertEquals(result.count, 1);
    assertEquals(results[0].term, "Bias");
    assert(typeof results[0].definition === "string");
  } finally {
    db.close();
  }
});

Deno.test("glossary - partial term search works", () => {
  const db = createTestDb();
  try {
    const result = glossary(db, "Transp");
    const results = result.results as Array<Record<string, unknown>>;
    assert(results.length >= 1);
    assert(results.some((r) => r.term === "Transparency"));
  } finally {
    db.close();
  }
});

Deno.test("glossary - category filter works", () => {
  const db = createTestDb();
  try {
    const result = glossary(db, undefined, "trustworthiness");
    const results = result.results as Array<Record<string, unknown>>;
    assertEquals(results.length, 2);
    for (const r of results) {
      assertEquals(r.category, "trustworthiness");
    }
  } finally {
    db.close();
  }
});

Deno.test("glossary - term + category filter combined", () => {
  const db = createTestDb();
  try {
    const result = glossary(db, "Bias", "trustworthiness");
    const results = result.results as Array<Record<string, unknown>>;
    assertEquals(results.length, 1);
    assertEquals(results[0].term, "Bias");
    assertEquals(results[0].category, "trustworthiness");
  } finally {
    db.close();
  }
});

Deno.test("glossary - no results returns empty", () => {
  const db = createTestDb();
  try {
    const result = glossary(db, "zzz_nonexistent_term_999");
    const results = result.results as Array<Record<string, unknown>>;
    assertEquals(results.length, 0);
    assertEquals(result.count, 0);
  } finally {
    db.close();
  }
});

// =========================================================================
// crosswalk tests
// =========================================================================

Deno.test("crosswalk - valid source + target returns mappings", () => {
  const db = createTestDb();
  try {
    const result = crosswalk(db, "GV-1.1-001", "ISO42001");
    assertEquals(result.source, "GV-1.1-001");
    assertEquals(result.target_framework, "ISO42001");
    const mappings = result.mappings as Array<Record<string, unknown>>;
    assertEquals(mappings.length, 1);
    assertEquals(mappings[0].target_id, "6.1.1");
    assertEquals(mappings[0].target_name, "Actions to address risks and opportunities");
  } finally {
    db.close();
  }
});

Deno.test("crosswalk - same source, different target", () => {
  const db = createTestDb();
  try {
    const result = crosswalk(db, "GV-1.1-001", "EU_AI_ACT");
    const mappings = result.mappings as Array<Record<string, unknown>>;
    assertEquals(mappings.length, 1);
    assertEquals(mappings[0].target_id, "Art. 9");
  } finally {
    db.close();
  }
});

Deno.test("crosswalk - unknown source returns empty mappings", () => {
  const db = createTestDb();
  try {
    const result = crosswalk(db, "NONEXISTENT-999", "ISO42001");
    const mappings = result.mappings as Array<Record<string, unknown>>;
    assertEquals(mappings.length, 0);
    assertEquals(result.note, "No mappings found");
  } finally {
    db.close();
  }
});

Deno.test("crosswalk - unknown target framework returns empty mappings", () => {
  const db = createTestDb();
  try {
    const result = crosswalk(db, "GV-1.1-001", "UNKNOWN_FRAMEWORK");
    const mappings = result.mappings as Array<Record<string, unknown>>;
    assertEquals(mappings.length, 0);
  } finally {
    db.close();
  }
});

Deno.test("crosswalk - partial match on source_id works", () => {
  const db = createTestDb();
  try {
    // "GV-1.1" is a partial match for both GV-1.1-001 and possibly GV-1.2-001
    const result = crosswalk(db, "GV-1.1", "ISO42001");
    const mappings = result.mappings as Array<Record<string, unknown>>;
    assert(mappings.length >= 1, "Partial match should return at least one result");
    assertEquals(result.note, "Partial match");
  } finally {
    db.close();
  }
});

// =========================================================================
// assess tests
// =========================================================================

Deno.test("assess - content with relevant keywords returns findings", () => {
  const db = createTestDb();
  try {
    const result = assess(
      db,
      "Our organization has a policy for managing AI bias and fairness. We conduct regulatory compliance reviews and maintain a register of applicable laws.",
      "policy",
    );
    const findings = result.findings as Array<Record<string, unknown>>;
    assert(findings.length > 0, "Should return at least one finding");
    assertEquals(result.input_type, "policy");
  } finally {
    db.close();
  }
});

Deno.test("assess - each finding has control_id, status, relevance_score", () => {
  const db = createTestDb();
  try {
    const result = assess(
      db,
      "We need to address bias in our AI models. Regulatory requirements must be documented. Our policy governance framework needs updating.",
      "plan",
    );
    const findings = result.findings as Array<Record<string, unknown>>;
    assert(findings.length > 0);
    for (const f of findings) {
      assertExists(f.control_id, "Finding must have control_id");
      assertExists(f.status, "Finding must have status");
      assert(
        f.status === "gap" || f.status === "partial",
        `Status must be 'gap' or 'partial', got '${f.status}'`,
      );
      assertExists(f.relevance_score, "Finding must have relevance_score");
      assert(
        typeof f.relevance_score === "number" && (f.relevance_score as number) > 0,
        "relevance_score must be a positive number",
      );
    }
  } finally {
    db.close();
  }
});

Deno.test("assess - empty content returns no findings", () => {
  const db = createTestDb();
  try {
    const result = assess(db, "", "plan");
    const findings = result.findings as Array<Record<string, unknown>>;
    assertEquals(findings.length, 0);
    assertEquals(result.relevant_controls, 0);
  } finally {
    db.close();
  }
});

Deno.test("assess - context parameter is captured", () => {
  const db = createTestDb();
  try {
    const result = assess(db, "bias policy fairness", "plan", "Banking sector deployment");
    assertEquals(result.context, "Banking sector deployment");
  } finally {
    db.close();
  }
});

Deno.test("assess - context defaults to null when not provided", () => {
  const db = createTestDb();
  try {
    const result = assess(db, "bias policy fairness", "plan");
    assertEquals(result.context, null);
  } finally {
    db.close();
  }
});

Deno.test("assess - returns controls_assessed count", () => {
  const db = createTestDb();
  try {
    const result = assess(db, "bias", "plan");
    assertEquals(result.controls_assessed, 4); // We seeded 4 controls
  } finally {
    db.close();
  }
});

Deno.test("assess - overall_score is 100 when no findings", () => {
  const db = createTestDb();
  try {
    const result = assess(db, "", "plan");
    assertEquals(result.overall_score, 100);
  } finally {
    db.close();
  }
});

Deno.test("assess - keywords_extracted is populated", () => {
  const db = createTestDb();
  try {
    const result = assess(
      db,
      "We review AI bias regularly. Model validation ensures fairness. Transparency reports are published.",
      "policy",
    );
    const keywords = result.keywords_extracted as string[];
    assert(keywords.length > 0, "Should extract keywords from content");
  } finally {
    db.close();
  }
});

// =========================================================================
// adoptionStage tests
// =========================================================================

Deno.test("adoptionStage - all 'yes' responses returns Full Implementation", () => {
  const db = createTestDb();
  try {
    const responses: Record<string, string> = {
      ai_policy_exists: "yes",
      ai_roles_defined: "yes",
      board_oversight: "yes",
      risk_appetite_defined: "yes",
      ai_inventory_complete: "yes",
      risk_tiering_applied: "yes",
      third_party_ai_tracked: "yes",
      risk_assessment_process: "yes",
      model_validation_independent: "yes",
      incident_response_defined: "yes",
      performance_monitoring_active: "yes",
      bias_monitoring_active: "yes",
      drift_detection_deployed: "yes",
      ai_training_program: "yes",
      ethics_framework: "yes",
      diverse_teams: "yes",
    };
    const result = adoptionStage(db, responses);
    assertEquals(result.stage, "Full Implementation");
    assertEquals(result.stage_id, "full_implementation");
    assertEquals(result.overall_score, 100);
  } finally {
    db.close();
  }
});

Deno.test("adoptionStage - all 'no' responses returns Scoping", () => {
  const db = createTestDb();
  try {
    const responses: Record<string, string> = {
      ai_policy_exists: "no",
      ai_roles_defined: "no",
      board_oversight: "no",
      risk_appetite_defined: "no",
      ai_inventory_complete: "no",
      risk_tiering_applied: "no",
      third_party_ai_tracked: "no",
      risk_assessment_process: "no",
      model_validation_independent: "no",
      incident_response_defined: "no",
      performance_monitoring_active: "no",
      bias_monitoring_active: "no",
      drift_detection_deployed: "no",
      ai_training_program: "no",
      ethics_framework: "no",
      diverse_teams: "no",
    };
    const result = adoptionStage(db, responses);
    assertEquals(result.stage, "Scoping");
    assertEquals(result.stage_id, "scoping");
    assertEquals(result.overall_score, 0);
  } finally {
    db.close();
  }
});

Deno.test("adoptionStage - mixed responses returns intermediate stage", () => {
  const db = createTestDb();
  try {
    // ~half yes, half no -> overall around 50% -> Scaling
    const responses: Record<string, string> = {
      ai_policy_exists: "yes",
      ai_roles_defined: "yes",
      board_oversight: "yes",
      risk_appetite_defined: "yes",
      ai_inventory_complete: "yes",
      risk_tiering_applied: "yes",
      third_party_ai_tracked: "yes",
      risk_assessment_process: "yes",
      model_validation_independent: "no",
      incident_response_defined: "no",
      performance_monitoring_active: "no",
      bias_monitoring_active: "no",
      drift_detection_deployed: "no",
      ai_training_program: "no",
      ethics_framework: "no",
      diverse_teams: "no",
    };
    const result = adoptionStage(db, responses);
    // 8 yes out of 16 = 50% -> Scaling (>= 0.5, < 0.75)
    assert(
      result.stage === "Scaling" || result.stage === "Minimum Viable",
      `Expected intermediate stage, got '${result.stage}'`,
    );
    const score = result.overall_score as number;
    assert(score > 0 && score < 100, `Expected intermediate score, got ${score}`);
  } finally {
    db.close();
  }
});

Deno.test("adoptionStage - returns applicable controls", () => {
  const db = createTestDb();
  try {
    const responses: Record<string, string> = {
      ai_policy_exists: "yes",
      ai_roles_defined: "yes",
      board_oversight: "yes",
      risk_appetite_defined: "yes",
      ai_inventory_complete: "yes",
      risk_tiering_applied: "yes",
      third_party_ai_tracked: "yes",
      risk_assessment_process: "yes",
      model_validation_independent: "yes",
      incident_response_defined: "yes",
      performance_monitoring_active: "yes",
      bias_monitoring_active: "yes",
      drift_detection_deployed: "yes",
      ai_training_program: "yes",
      ethics_framework: "yes",
      diverse_teams: "yes",
    };
    const result = adoptionStage(db, responses);
    const controls = result.applicable_controls as Array<Record<string, unknown>>;
    assertExists(controls);
    assert(Array.isArray(controls));
    // Full implementation controls should exist (we seeded controls with full_implementation)
    assert(controls.length > 0, "Should find applicable controls for full_implementation stage");
    assertExists(result.applicable_controls_count);
    assertEquals(result.applicable_controls_count, controls.length);
  } finally {
    db.close();
  }
});

Deno.test("adoptionStage - boolean responses work (true/false)", () => {
  const db = createTestDb();
  try {
    const responses: Record<string, boolean> = {
      ai_policy_exists: true,
      ai_roles_defined: true,
      board_oversight: false,
      risk_appetite_defined: false,
    };
    const result = adoptionStage(db, responses);
    assertExists(result.stage);
    assertExists(result.dimension_scores);
    const dimScores = result.dimension_scores as Record<string, number>;
    // governance: 2 true (6) + 2 false (0) = 6/12 = 50%
    assertEquals(dimScores["governance"], 50);
  } finally {
    db.close();
  }
});

Deno.test("adoptionStage - numeric responses work (0-3 scale)", () => {
  const db = createTestDb();
  try {
    const responses: Record<string, number> = {
      ai_policy_exists: 3,
      ai_roles_defined: 3,
      board_oversight: 3,
      risk_appetite_defined: 3,
    };
    const result = adoptionStage(db, responses);
    const dimScores = result.dimension_scores as Record<string, number>;
    assertEquals(dimScores["governance"], 100);
  } finally {
    db.close();
  }
});

Deno.test("adoptionStage - identifies weak dimensions", () => {
  const db = createTestDb();
  try {
    const responses: Record<string, string> = {
      // governance all yes
      ai_policy_exists: "yes",
      ai_roles_defined: "yes",
      board_oversight: "yes",
      risk_appetite_defined: "yes",
      // monitoring all no -> weak
      performance_monitoring_active: "no",
      bias_monitoring_active: "no",
      drift_detection_deployed: "no",
      // culture all no -> weak
      ai_training_program: "no",
      ethics_framework: "no",
      diverse_teams: "no",
    };
    const result = adoptionStage(db, responses);
    const weak = result.weak_dimensions as string[];
    assertArrayIncludes(weak, ["monitoring"]);
    assertArrayIncludes(weak, ["culture"]);
    assert(!weak.includes("governance"), "Governance should not be weak");
  } finally {
    db.close();
  }
});

Deno.test("adoptionStage - empty responses defaults to Scoping", () => {
  const db = createTestDb();
  try {
    const result = adoptionStage(db, {});
    assertEquals(result.stage, "Scoping");
    assertEquals(result.overall_score, 0);
  } finally {
    db.close();
  }
});
