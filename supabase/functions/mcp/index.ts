// Sentinel MCP Server — NIST AI RMF / FS AI RMF Compliance Tool
// Supabase Edge Function entry point

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TOOLS = [
  {
    name: "sentinel:lookup",
    description: "Query any NIST AI RMF function, category, subcategory, or FS AI RMF control objective by ID or keyword. Use scope to filter: 'nist' for base framework, 'fs' for financial services controls, 'all' for everything.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search term, ID (e.g. 'GOVERN 1.1'), or keyword" },
        scope: { type: "string", enum: ["nist", "fs", "all"], default: "all", description: "Which framework to search" },
      },
      required: ["query"],
    },
  },
  {
    name: "sentinel:explain",
    description: "Get a plain-English explanation of any AI RMF concept, function, category, or control objective. Includes financial services context and OCC/SIFMU-relevant examples.",
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string", description: "What to explain" },
        depth: { type: "string", enum: ["brief", "detailed", "expert"], default: "detailed" },
      },
      required: ["topic"],
    },
  },
  {
    name: "sentinel:glossary",
    description: "Look up regulatory and AI risk management terms. Returns definition, source framework, and related terms.",
    inputSchema: {
      type: "object",
      properties: {
        term: { type: "string", description: "Term to look up" },
        category: { type: "string", description: "Filter by category: risk, governance, technical, regulatory" },
      },
    },
  },
  {
    name: "sentinel:quiz",
    description: "Generate a quiz question to test knowledge of the AI RMF frameworks. Tracks spaced repetition for learning.",
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string", description: "Optional topic to focus on" },
        type: { type: "string", enum: ["term", "scenario", "control", "acronym"], default: "term" },
        difficulty: { type: "integer", minimum: 1, maximum: 3, default: 2 },
      },
    },
  },
  {
    name: "sentinel:progress",
    description: "Show learning progress: cards reviewed, mastery levels, weak areas, streak.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "sentinel:assess",
    description: "Evaluate a plan, architecture doc, code snippet, or policy against relevant FS AI RMF control objectives. Returns compliance gaps with specific control IDs and recommendations.",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "The plan, doc, code, or policy text to assess" },
        type: { type: "string", enum: ["plan", "architecture", "code", "policy"], description: "What kind of content" },
        context: { type: "string", description: "Optional context (e.g. 'AI-assisted code review pipeline for a SIFMU')" },
      },
      required: ["content", "type"],
    },
  },
  {
    name: "sentinel:crosswalk",
    description: "Map a NIST AI RMF or FS AI RMF control to equivalent controls in other frameworks (ISO 42001, EU AI Act, SR 11-7, OWASP).",
    inputSchema: {
      type: "object",
      properties: {
        control_id: { type: "string", description: "Control or subcategory ID to map" },
        target: { type: "string", enum: ["iso42001", "eu_ai_act", "sr11_7", "nist_csf", "owasp_llm"] },
      },
      required: ["control_id", "target"],
    },
  },
  {
    name: "sentinel:adoption_stage",
    description: "Assess an organization's AI maturity stage (Initial, Minimal, Evolving, Embedded) based on questionnaire responses. Returns applicable controls for that stage.",
    inputSchema: {
      type: "object",
      properties: {
        responses: { type: "object", description: "Questionnaire answers as key-value pairs" },
      },
      required: ["responses"],
    },
  },
];

// Tool handler dispatch
const handlers: Record<string, (input: any, supabase: any) => Promise<any>> = {
  "sentinel:lookup": handleLookup,
  "sentinel:explain": handleExplain,
  "sentinel:glossary": handleGlossary,
  "sentinel:quiz": handleQuiz,
  "sentinel:progress": handleProgress,
  "sentinel:assess": handleAssess,
  "sentinel:crosswalk": handleCrosswalk,
  "sentinel:adoption_stage": handleAdoptionStage,
};

// === Tool Implementations (stubs — flesh out in Phase 3/4) ===

async function handleLookup(input: any, supabase: any) {
  const { query, scope = "all" } = input;
  // TODO: Search across functions, categories, subcategories, controls
  // Use full-text search view sentinel_search
  const { data, error } = await supabase.rpc("sentinel_lookup", { search_query: query, search_scope: scope });
  if (error) return { error: error.message };
  return { results: data };
}

async function handleExplain(input: any, supabase: any) {
  const { topic, depth = "detailed" } = input;
  // TODO: Fetch relevant data, format explanation with context
  return { topic, depth, explanation: "Not yet implemented — seed data needed first" };
}

async function handleGlossary(input: any, supabase: any) {
  const { term, category } = input;
  let query = supabase.from("sentinel_glossary").select("*");
  if (term) query = query.ilike("term", `%${term}%`);
  if (category) query = query.eq("category", category);
  const { data, error } = await query.limit(10);
  if (error) return { error: error.message };
  return { terms: data };
}

async function handleQuiz(input: any, supabase: any) {
  const { topic, type = "term", difficulty = 2 } = input;
  // TODO: Pick a card from flashcards table, apply spaced repetition
  return { type, difficulty, question: "Not yet implemented — seed data needed first" };
}

async function handleProgress(input: any, supabase: any) {
  // TODO: Aggregate flashcard stats
  return { message: "Not yet implemented" };
}

async function handleAssess(input: any, supabase: any) {
  const { content, type, context } = input;
  // TODO: Match content against control objectives, return findings
  // This will likely need an LLM call to do the matching intelligently
  return { type, controls_checked: 0, findings: [], message: "Not yet implemented — need control data seeded first" };
}

async function handleCrosswalk(input: any, supabase: any) {
  const { control_id, target } = input;
  const { data, error } = await supabase
    .from("sentinel_crosswalks")
    .select("*")
    .eq("source_id", control_id)
    .eq("target_framework", target);
  if (error) return { error: error.message };
  return { source: control_id, target_framework: target, mappings: data };
}

async function handleAdoptionStage(input: any, supabase: any) {
  const { responses } = input;
  // TODO: Score responses against adoption stage criteria
  return { stage: "Not yet implemented", applicable_controls: [] };
}

// === MCP Protocol Handler ===

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await req.json();
    const { method, params, id } = body;

    let result;

    switch (method) {
      case "initialize":
        result = {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "sentinel", version: "0.1.0" },
        };
        break;

      case "tools/list":
        result = { tools: TOOLS };
        break;

      case "tools/call": {
        const toolName = params?.name;
        const toolInput = params?.arguments ?? {};
        const handler = handlers[toolName];
        if (!handler) {
          return new Response(
            JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32601, message: `Unknown tool: ${toolName}` } }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const toolResult = await handler(toolInput, supabase);
        result = {
          content: [{ type: "text", text: JSON.stringify(toolResult, null, 2) }],
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32601, message: `Unknown method: ${method}` } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ jsonrpc: "2.0", id, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: err.message } }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
