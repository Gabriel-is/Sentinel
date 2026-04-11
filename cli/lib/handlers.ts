import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";

export function lookup(db: DB, query: string, scope = "all"): Record<string, unknown> {
  const id = query.toUpperCase().trim();

  // Exact ID matches
  const fn = db.queryEntries<Record<string, unknown>>("SELECT * FROM sentinel_functions WHERE upper(id) = ?", [id]);
  if (fn.length) {
    const cats = db.queryEntries("SELECT id, name, description FROM sentinel_categories WHERE function_id = ? ORDER BY sort_order", [fn[0].id]);
    return { match_type: "function", function: fn[0], categories: cats };
  }

  const cat = db.queryEntries("SELECT * FROM sentinel_categories WHERE upper(id) = ?", [id]);
  if (cat.length) {
    const subs = db.queryEntries("SELECT id, name, description FROM sentinel_subcategories WHERE category_id = ? ORDER BY sort_order", [cat[0].id]);
    return { match_type: "category", category: cat[0], subcategories: subs };
  }

  const sub = db.queryEntries("SELECT * FROM sentinel_subcategories WHERE upper(id) = ?", [id]);
  if (sub.length) {
    const ctrls = db.queryEntries("SELECT id, objective_text, adoption_stages, trustworthy_principle FROM sentinel_control_objectives WHERE subcategory_id = ? ORDER BY sort_order", [sub[0].id]);
    return { match_type: "subcategory", subcategory: sub[0], control_objectives: ctrls };
  }

  const ctrl = db.queryEntries("SELECT * FROM sentinel_control_objectives WHERE upper(id) = ?", [id]);
  if (ctrl.length) return { match_type: "control", control: ctrl[0] };

  // FTS fallback
  const ftsResults = db.queryEntries(
    "SELECT id, entity_type, title, snippet(sentinel_fts, 3, '**', '**', '...', 32) as snippet FROM sentinel_fts WHERE sentinel_fts MATCH ? ORDER BY rank LIMIT 15",
    [query]
  );

  // Filter by scope
  const filtered = scope === "all" ? ftsResults
    : scope === "nist" ? ftsResults.filter((r: Record<string, unknown>) => r.entity_type !== "control")
    : ftsResults.filter((r: Record<string, unknown>) => r.entity_type === "control");

  return { match_type: "search", query, scope, results: filtered };
}

export function explain(db: DB, topic: string, depth = "detailed"): Record<string, unknown> {
  const upper = topic.toUpperCase().trim();

  const fn = db.queryEntries("SELECT * FROM sentinel_functions WHERE upper(id) = ? OR upper(name) LIKE ?", [upper, `%${upper}%`]);
  if (fn.length) {
    const cats = db.queryEntries("SELECT id, description FROM sentinel_categories WHERE function_id = ? ORDER BY sort_order", [fn[0].id]);
    return { entity_type: "function", ...fn[0], categories: cats, depth };
  }

  const sub = db.queryEntries("SELECT * FROM sentinel_subcategories WHERE upper(id) = ? OR description LIKE ?", [upper, `%${topic}%`]);
  if (sub.length) {
    const ctrls = db.queryEntries("SELECT id, objective_text, adoption_stages, trustworthy_principle, risk_statement FROM sentinel_control_objectives WHERE subcategory_id = ? ORDER BY sort_order", [sub[0].id]);
    return { entity_type: "subcategory", ...sub[0], control_objectives: ctrls, depth };
  }

  const gloss = db.queryEntries("SELECT * FROM sentinel_glossary WHERE term LIKE ? OR definition LIKE ? LIMIT 3", [`%${topic}%`, `%${topic}%`]);
  if (gloss.length) return { entity_type: "glossary", terms: gloss, depth };

  const ctrl = db.queryEntries("SELECT * FROM sentinel_control_objectives WHERE upper(id) LIKE ? OR objective_text LIKE ? LIMIT 3", [`%${upper}%`, `%${topic}%`]);
  if (ctrl.length) return { entity_type: "control", controls: ctrl, depth };

  return { entity_type: "not_found", topic, suggestion: "Try a framework ID (e.g. 'GOVERN 1.1'), term, or control ID (e.g. 'GV-1.1-001')." };
}

export function glossary(db: DB, term?: string, category?: string): Record<string, unknown> {
  if (!term && !category) {
    const cats = db.queryEntries<{ category: string; cnt: number }>("SELECT category, count(*) as cnt FROM sentinel_glossary GROUP BY category ORDER BY category");
    const total = db.queryEntries<{ c: number }>("SELECT count(*) as c FROM sentinel_glossary");
    return { message: "Specify a term or category.", categories: Object.fromEntries(cats.map(r => [r.category, r.cnt])), total_terms: total[0]?.c || 0 };
  }

  let sql = "SELECT term, definition, source, related_terms, category FROM sentinel_glossary WHERE 1=1";
  const params: unknown[] = [];
  if (term) { sql += " AND term LIKE ?"; params.push(`%${term}%`); }
  if (category) { sql += " AND category = ?"; params.push(category); }
  sql += " ORDER BY term LIMIT 15";

  const results = db.queryEntries(sql, params);
  return { query: { term, category }, results, count: results.length };
}

export function crosswalk(db: DB, controlId: string, target: string): Record<string, unknown> {
  const results = db.queryEntries(
    "SELECT * FROM sentinel_crosswalks WHERE source_id = ? AND target_framework = ?",
    [controlId, target]
  );
  if (!results.length) {
    // Try partial match
    const partial = db.queryEntries(
      "SELECT * FROM sentinel_crosswalks WHERE source_id LIKE ? AND target_framework = ? LIMIT 10",
      [`%${controlId}%`, target]
    );
    return { source: controlId, target_framework: target, mappings: partial, note: partial.length ? "Partial match" : "No mappings found" };
  }
  return { source: controlId, target_framework: target, mappings: results };
}

export function assess(db: DB, content: string, inputType: string, context?: string): Record<string, unknown> {
  const contentLower = content.toLowerCase();
  const keywords = extractKeywords(contentLower);

  const allControls = db.queryEntries<Record<string, unknown>>(
    "SELECT id, subcategory_id, objective_text, implementation_guidance, adoption_stages, risk_statement, trustworthy_principle FROM sentinel_control_objectives ORDER BY sort_order"
  );

  const scored = allControls.map(ctrl => {
    const ctrlText = ((ctrl.objective_text || "") + " " + (ctrl.implementation_guidance || "") + " " + (ctrl.risk_statement || "")).toString().toLowerCase();
    let score = 0;
    const matched: string[] = [];
    for (const kw of keywords) {
      if (ctrlText.includes(kw)) {
        score += kw.length > 5 ? 2 : 1;
        matched.push(kw);
      }
    }
    if (inputType === "code" && ctrlText.includes("technical")) score++;
    if (inputType === "policy" && ctrlText.includes("polic")) score++;
    return { ...ctrl, relevance_score: score, matched_keywords: matched };
  });

  const relevant = scored.filter(c => c.relevance_score > 0)
    .sort((a, b) => (b.relevance_score as number) - (a.relevance_score as number))
    .slice(0, 25);

  const findings = relevant.map(ctrl => {
    const addressed = (ctrl.matched_keywords as string[]).length >= 3;
    return {
      control_id: ctrl.id,
      subcategory_id: ctrl.subcategory_id,
      objective: ctrl.objective_text,
      status: addressed ? "partial" : "gap",
      relevance_score: ctrl.relevance_score,
      matched_keywords: ctrl.matched_keywords,
      risk_statement: ctrl.risk_statement,
      trustworthy_principle: ctrl.trustworthy_principle,
    };
  });

  const gaps = findings.filter(f => f.status === "gap").length;
  const partial = findings.filter(f => f.status === "partial").length;

  return {
    input_type: inputType, context: context || null,
    controls_assessed: allControls.length, relevant_controls: findings.length,
    gaps, partial,
    overall_score: findings.length > 0 ? Math.round((partial / findings.length) * 100) : 100,
    findings, keywords_extracted: keywords.slice(0, 20),
  };
}

export function adoptionStage(db: DB, responses: Record<string, string | number | boolean>): Record<string, unknown> {
  const dimensions: Record<string, string[]> = {
    governance: ["ai_policy_exists", "ai_roles_defined", "board_oversight", "risk_appetite_defined"],
    inventory: ["ai_inventory_complete", "risk_tiering_applied", "third_party_ai_tracked"],
    risk_management: ["risk_assessment_process", "model_validation_independent", "incident_response_defined"],
    monitoring: ["performance_monitoring_active", "bias_monitoring_active", "drift_detection_deployed"],
    culture: ["ai_training_program", "ethics_framework", "diverse_teams"],
  };

  const scores: Record<string, number> = {};
  let totalScore = 0, totalQuestions = 0;

  for (const [dim, questions] of Object.entries(dimensions)) {
    let dimScore = 0, dimCount = 0;
    for (const q of questions) {
      if (q in responses) {
        const val = responses[q];
        const numVal = typeof val === "boolean" ? (val ? 3 : 0) : typeof val === "number" ? Math.min(3, Math.max(0, val)) : val === "yes" ? 3 : val === "partial" ? 1 : 0;
        dimScore += numVal;
        dimCount++;
      }
    }
    scores[dim] = dimCount > 0 ? dimScore / (dimCount * 3) : 0;
    totalScore += dimScore;
    totalQuestions += dimCount;
  }

  const overall = totalQuestions > 0 ? totalScore / (totalQuestions * 3) : 0;
  const [stage, stageId] = overall < 0.25 ? ["Scoping", "scoping"] : overall < 0.5 ? ["Minimum Viable", "minimum_viable"] : overall < 0.75 ? ["Scaling", "scaling"] : ["Full Implementation", "full_implementation"];

  const applicable = db.queryEntries(
    "SELECT id, subcategory_id, objective_text, adoption_stages, trustworthy_principle FROM sentinel_control_objectives WHERE adoption_stages LIKE ? ORDER BY sort_order LIMIT 30",
    [`%${stageId}%`]
  );

  const weak = Object.entries(scores).filter(([, s]) => s < 0.5).sort(([, a], [, b]) => a - b).map(([d]) => d);

  return {
    stage, stage_id: stageId,
    overall_score: Math.round(overall * 100),
    dimension_scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.round(v * 100)])),
    weak_dimensions: weak,
    applicable_controls_count: applicable.length,
    applicable_controls: applicable,
  };
}

function extractKeywords(text: string): string[] {
  const stop = new Set(["the","a","an","is","are","was","were","be","been","have","has","had","do","does","did","will","would","could","should","may","might","to","of","in","for","on","with","at","by","from","as","into","through","during","before","after","between","out","off","over","under","then","once","when","where","why","how","all","each","every","both","few","more","most","other","some","such","no","nor","not","only","own","same","so","than","too","very","just","because","but","and","or","if","while","that","this","these","those","it","its","we","our","they","their","what","which","who","whom"]);
  const words = text.replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(w => w.length > 2 && !stop.has(w));
  const freq: Record<string, number> = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  return Object.entries(freq).sort(([, a], [, b]) => b - a).map(([w]) => w).slice(0, 50);
}
