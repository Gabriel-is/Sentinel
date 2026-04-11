#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-env --unstable-ffi

import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { openDb, isSeeded } from "./db/local.ts";
import { syncFromRemote } from "./commands/sync.ts";
import { lookup, explain, glossary, crosswalk, assess, adoptionStage } from "./lib/handlers.ts";

const VERSION = "0.3.0";

const HELP = `
sentinel — NIST AI RMF / FS AI RMF compliance tool

USAGE
  sentinel <command> [args] [options]

COMMANDS
  lookup <query>          Search by ID or keyword (e.g. "GOVERN 1.1", "bias")
  explain <topic>         Explain a concept, function, or control
  glossary [term]         Look up terms (--category to filter)
  crosswalk <id> <target> Map control to another framework
  assess <file|->         Assess content against 230 controls
  stage                   AI maturity stage assessment (interactive)
  sync                    Pull latest data from Supabase
  stats                   Show local database stats
  version                 Show version

OPTIONS
  --scope <nist|fs|all>   Filter lookup scope (default: all)
  --depth <brief|detailed|expert>  Explanation depth (default: detailed)
  --category <cat>        Filter glossary by category
  --type <plan|architecture|code|policy>  Assessment content type
  --json                  Output raw JSON instead of formatted text
  --help, -h              Show this help

EXAMPLES
  sentinel lookup "GOVERN 1.1"
  sentinel explain "model risk management" --depth expert
  sentinel glossary "bias" --category risk
  sentinel crosswalk "GOVERN 1.1" sr11_7
  sentinel assess policy.md --type policy
  sentinel assess - --type plan < my_plan.txt
  cat architecture.md | sentinel assess - --type architecture
`;

async function main() {
  const args = parse(Deno.args, {
    string: ["scope", "depth", "category", "type", "context"],
    boolean: ["json", "help", "version"],
    alias: { h: "help", v: "version", j: "json" },
    default: { scope: "all", depth: "detailed" },
  });

  if (args.version) {
    console.log(`sentinel v${VERSION}`);
    return;
  }

  if (args.help || args._.length === 0) {
    console.log(HELP.trim());
    return;
  }

  const command = String(args._[0]).toLowerCase();
  const db = openDb();

  // Auto-seed on first run
  if (!isSeeded(db) && command !== "sync") {
    console.error("First run — syncing data...");
    await syncFromRemote(db);
  }

  const output = args.json;

  try {
    switch (command) {
      case "lookup": {
        const query = args._.slice(1).join(" ");
        if (!query) { console.error("Usage: sentinel lookup <query>"); Deno.exit(1); }
        const result = lookup(db, query, args.scope);
        print(result, output);
        break;
      }

      case "explain": {
        const topic = args._.slice(1).join(" ");
        if (!topic) { console.error("Usage: sentinel explain <topic>"); Deno.exit(1); }
        const result = explain(db, topic, args.depth);
        print(result, output);
        break;
      }

      case "glossary": {
        const term = args._.length > 1 ? args._.slice(1).join(" ") : undefined;
        const result = glossary(db, term as string | undefined, args.category);
        print(result, output);
        break;
      }

      case "crosswalk": {
        const id = String(args._[1] || "");
        const target = String(args._[2] || "");
        if (!id || !target) {
          console.error("Usage: sentinel crosswalk <control_id> <target>");
          console.error("Targets: iso42001, eu_ai_act, sr11_7, nist_csf, owasp_llm");
          Deno.exit(1);
        }
        const result = crosswalk(db, id, target);
        print(result, output);
        break;
      }

      case "assess": {
        const source = String(args._[1] || "");
        if (!source) {
          console.error("Usage: sentinel assess <file|-> --type <plan|architecture|code|policy>");
          Deno.exit(1);
        }
        const contentType = args.type || "plan";
        let content: string;
        if (source === "-") {
          // Read from stdin — collect all chunks
          const chunks: Uint8Array[] = [];
          const reader = Deno.stdin.readable.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          const total = chunks.reduce((s, c) => s + c.length, 0);
          const merged = new Uint8Array(total);
          let offset = 0;
          for (const chunk of chunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }
          content = new TextDecoder().decode(merged);
        } else {
          content = Deno.readTextFileSync(source);
        }
        const result = assess(db, content, contentType, args.context);
        print(result, output);
        break;
      }

      case "stage": {
        console.log("AI Maturity Stage Assessment");
        console.log("Answer each question: yes / partial / no\n");

        const questions: Record<string, string> = {
          ai_policy_exists: "Does your organization have a formal AI governance policy?",
          ai_roles_defined: "Are AI risk management roles clearly defined?",
          board_oversight: "Does the board receive regular AI risk reporting?",
          risk_appetite_defined: "Is AI risk appetite formally documented?",
          ai_inventory_complete: "Do you maintain a complete AI system inventory?",
          risk_tiering_applied: "Are AI systems classified by risk tier?",
          third_party_ai_tracked: "Are third-party/vendor AI systems tracked?",
          risk_assessment_process: "Is there a formal AI risk assessment process?",
          model_validation_independent: "Is model validation performed independently?",
          incident_response_defined: "Are AI incident response procedures defined?",
          performance_monitoring_active: "Is ongoing AI performance monitoring active?",
          bias_monitoring_active: "Is bias/fairness monitoring in production?",
          drift_detection_deployed: "Is data/model drift detection deployed?",
          ai_training_program: "Does the organization have AI training programs?",
          ethics_framework: "Is there an AI ethics framework?",
          diverse_teams: "Are AI teams diverse and cross-functional?",
        };

        const responses: Record<string, string> = {};
        for (const [key, question] of Object.entries(questions)) {
          const answer = prompt(`  ${question} (yes/partial/no)`);
          responses[key] = (answer || "no").toLowerCase().trim();
        }

        const result = adoptionStage(db, responses);
        print(result, output);
        break;
      }

      case "sync": {
        await syncFromRemote(db);
        break;
      }

      case "stats": {
        const tables = ["sentinel_functions", "sentinel_categories", "sentinel_subcategories", "sentinel_control_objectives", "sentinel_trustworthy_characteristics", "sentinel_glossary", "sentinel_crosswalks"];
        console.log("Sentinel Local Database Stats\n");
        for (const t of tables) {
          const [[count]] = db.query<[number]>(`SELECT count(*) FROM ${t}`);
          const name = t.replace("sentinel_", "");
          console.log(`  ${name.padEnd(30)} ${count}`);
        }
        const meta = db.queryEntries<{ key: string; value: string }>("SELECT * FROM sentinel_meta");
        if (meta.length) {
          console.log("\nMetadata:");
          for (const m of meta) console.log(`  ${m.key.padEnd(30)} ${m.value}`);
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}\nRun 'sentinel --help' for usage.`);
        Deno.exit(1);
    }
  } finally {
    db.close();
  }
}

function print(data: Record<string, unknown>, json: boolean) {
  if (json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  // Human-readable formatted output
  formatOutput(data);
}

function formatOutput(data: Record<string, unknown>, indent = 0) {
  const pad = "  ".repeat(indent);

  if (data.match_type === "function") {
    const fn = data.function as Record<string, unknown>;
    console.log(`\n${pad}${fn.id} — ${fn.name}`);
    console.log(`${pad}${fn.description}`);
    console.log(`${pad}Crosscutting: ${fn.is_crosscutting ? "Yes" : "No"}\n`);
    const cats = data.categories as Array<Record<string, unknown>>;
    if (cats?.length) {
      console.log(`${pad}Categories:`);
      for (const c of cats) console.log(`${pad}  ${c.id}: ${c.description}`);
    }
    return;
  }

  if (data.match_type === "category") {
    const cat = data.category as Record<string, unknown>;
    console.log(`\n${pad}${cat.id} (${cat.function_id})`);
    console.log(`${pad}${cat.description}\n`);
    const subs = data.subcategories as Array<Record<string, unknown>>;
    if (subs?.length) {
      console.log(`${pad}Subcategories:`);
      for (const s of subs) console.log(`${pad}  ${s.id}: ${s.description}`);
    }
    return;
  }

  if (data.match_type === "subcategory") {
    const sub = data.subcategory as Record<string, unknown>;
    console.log(`\n${pad}${sub.id} (${sub.category_id})`);
    console.log(`${pad}${sub.description}\n`);
    const ctrls = data.control_objectives as Array<Record<string, unknown>>;
    if (ctrls?.length) {
      console.log(`${pad}Control Objectives (${ctrls.length}):`);
      for (const c of ctrls) {
        console.log(`${pad}  ${c.id} [${c.trustworthy_principle}]`);
        console.log(`${pad}    ${c.objective_text}`);
      }
    }
    return;
  }

  if (data.match_type === "control") {
    const ctrl = data.control as Record<string, unknown>;
    console.log(`\n${pad}${ctrl.id} (${ctrl.subcategory_id})`);
    console.log(`${pad}Principle: ${ctrl.trustworthy_principle}`);
    console.log(`${pad}Stages: ${ctrl.adoption_stages}\n`);
    console.log(`${pad}Objective: ${ctrl.objective_text}\n`);
    if (ctrl.implementation_guidance) console.log(`${pad}Guidance: ${ctrl.implementation_guidance}\n`);
    if (ctrl.risk_statement) console.log(`${pad}Risk: ${ctrl.risk_statement}`);
    return;
  }

  if (data.match_type === "search") {
    const results = data.results as Array<Record<string, unknown>>;
    if (!results?.length) {
      console.log(`\nNo results for "${data.query}"`);
      return;
    }
    console.log(`\n${results.length} result(s) for "${data.query}":\n`);
    for (const r of results) {
      console.log(`  [${r.entity_type}] ${r.id}: ${r.title || r.snippet || ""}`);
    }
    return;
  }

  if (data.entity_type === "glossary" || data.results) {
    const terms = (data.terms || data.results) as Array<Record<string, unknown>>;
    if (!terms?.length) {
      if (data.categories) {
        console.log("\nGlossary Categories:");
        for (const [cat, count] of Object.entries(data.categories as Record<string, number>)) {
          console.log(`  ${cat.padEnd(20)} ${count} terms`);
        }
        console.log(`\nTotal: ${data.total_terms} terms`);
      } else {
        console.log("\nNo results.");
      }
      return;
    }
    console.log("");
    for (const t of terms) {
      console.log(`  ${t.term} [${t.category || t.source || ""}]`);
      console.log(`    ${t.definition}\n`);
    }
    return;
  }

  if (data.input_type) {
    // Assessment result
    console.log(`\nAssessment (${data.input_type})`);
    console.log(`Controls assessed: ${data.controls_assessed}`);
    console.log(`Relevant: ${data.relevant_controls} | Gaps: ${data.gaps} | Partial: ${data.partial}`);
    console.log(`Score: ${data.overall_score}%\n`);
    const findings = data.findings as Array<Record<string, unknown>>;
    if (findings?.length) {
      console.log("Findings:");
      for (const f of findings.slice(0, 15)) {
        const icon = f.status === "gap" ? "✗" : "~";
        console.log(`  ${icon} ${f.control_id} [${f.trustworthy_principle}] — ${(f.objective as string || "").slice(0, 100)}`);
      }
      if (findings.length > 15) console.log(`  ... and ${findings.length - 15} more`);
    }
    return;
  }

  if (data.stage) {
    console.log(`\nAI Maturity Stage: ${data.stage}`);
    console.log(`Overall Score: ${data.overall_score}%\n`);
    const dims = data.dimension_scores as Record<string, number>;
    if (dims) {
      console.log("Dimension Scores:");
      for (const [dim, score] of Object.entries(dims)) {
        const bar = "█".repeat(Math.round(score / 5)) + "░".repeat(20 - Math.round(score / 5));
        console.log(`  ${dim.padEnd(20)} ${bar} ${score}%`);
      }
    }
    const weak = data.weak_dimensions as string[];
    if (weak?.length) console.log(`\nFocus areas: ${weak.join(", ")}`);
    console.log(`\nApplicable controls: ${data.applicable_controls_count}`);
    return;
  }

  // Fallback: pretty print JSON
  console.log(JSON.stringify(data, null, 2));
}

main();
