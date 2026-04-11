// Sentinel MCP Server — NIST AI RMF / FS AI RMF Compliance Tool
// Supabase Edge Function entry point

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonRpcError(
  id: string | number | null,
  code: number,
  message: string,
  status = 200
) {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function jsonRpcResult(id: string | number | null, result: unknown) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Auth ──────────────────────────────────────────────────────

/**
 * Verify the caller's JWT and return their user ID.
 * Uses Supabase's built-in auth — the caller must pass
 * `Authorization: Bearer <access_token>` from a Supabase auth session.
 *
 * The edge function itself uses the service role key for DB access,
 * but the *caller* must prove they are a real authenticated user.
 */
async function authenticateRequest(
  req: Request
): Promise<{ userId: string } | { error: string }> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing or malformed Authorization header" };
  }

  const token = authHeader.replace("Bearer ", "");

  // Create a client with the user's token to verify it
  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token);

  if (error || !user) {
    return { error: "Invalid or expired token" };
  }

  return { userId: user.id };
}

// ── Tool Definitions ─────────────────────────────────────────

const TOOLS = [
  {
    name: "sentinel:lookup",
    description:
      "Query any NIST AI RMF function, category, subcategory, or FS AI RMF control objective by ID or keyword. Use scope to filter: 'nist' for base framework, 'fs' for financial services controls, 'all' for everything.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search term, ID (e.g. 'GOVERN 1.1'), or keyword",
        },
        scope: {
          type: "string",
          enum: ["nist", "fs", "all"],
          default: "all",
          description: "Which framework to search",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "sentinel:explain",
    description:
      "Get a plain-English explanation of any AI RMF concept, function, category, or control objective. Includes financial services context and OCC/SIFMU-relevant examples.",
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string", description: "What to explain" },
        depth: {
          type: "string",
          enum: ["brief", "detailed", "expert"],
          default: "detailed",
        },
      },
      required: ["topic"],
    },
  },
  {
    name: "sentinel:glossary",
    description:
      "Look up regulatory and AI risk management terms. Returns definition, source framework, and related terms.",
    inputSchema: {
      type: "object",
      properties: {
        term: { type: "string", description: "Term to look up" },
        category: {
          type: "string",
          description:
            "Filter by category: risk, governance, technical, regulatory",
        },
      },
    },
  },
  {
    name: "sentinel:quiz",
    description:
      "Generate a quiz question to test knowledge of the AI RMF frameworks. Tracks spaced repetition for learning.",
    inputSchema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "Optional topic to focus on",
        },
        type: {
          type: "string",
          enum: ["term", "scenario", "control", "acronym"],
          default: "term",
        },
        difficulty: {
          type: "integer",
          minimum: 1,
          maximum: 3,
          default: 2,
        },
      },
    },
  },
  {
    name: "sentinel:progress",
    description:
      "Show learning progress: cards reviewed, mastery levels, weak areas, streak.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "sentinel:assess",
    description:
      "Evaluate a plan, architecture doc, code snippet, or policy against relevant FS AI RMF control objectives. Returns compliance gaps with specific control IDs and recommendations.",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description:
            "The plan, doc, code, or policy text to assess",
        },
        type: {
          type: "string",
          enum: ["plan", "architecture", "code", "policy"],
          description: "What kind of content",
        },
        context: {
          type: "string",
          description:
            "Optional context (e.g. 'AI-assisted code review pipeline for a SIFMU')",
        },
      },
      required: ["content", "type"],
    },
  },
  {
    name: "sentinel:crosswalk",
    description:
      "Map a NIST AI RMF or FS AI RMF control to equivalent controls in other frameworks (ISO 42001, EU AI Act, SR 11-7, OWASP).",
    inputSchema: {
      type: "object",
      properties: {
        control_id: {
          type: "string",
          description: "Control or subcategory ID to map",
        },
        target: {
          type: "string",
          enum: [
            "iso42001",
            "eu_ai_act",
            "sr11_7",
            "nist_csf",
            "owasp_llm",
          ],
        },
      },
      required: ["control_id", "target"],
    },
  },
  {
    name: "sentinel:adoption_stage",
    description:
      "Assess an organization's AI maturity stage (Initial, Minimal, Evolving, Embedded) based on questionnaire responses. Returns applicable controls for that stage.",
    inputSchema: {
      type: "object",
      properties: {
        responses: {
          type: "object",
          description: "Questionnaire answers as key-value pairs",
        },
      },
      required: ["responses"],
    },
  },
];

// ── Tool Handlers ────────────────────────────────────────────

type ToolHandler = (
  input: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  userId: string
) => Promise<unknown>;

const handlers: Record<string, ToolHandler> = {
  "sentinel:lookup": handleLookup,
  "sentinel:explain": handleExplain,
  "sentinel:glossary": handleGlossary,
  "sentinel:quiz": handleQuiz,
  "sentinel:progress": handleProgress,
  "sentinel:assess": handleAssess,
  "sentinel:crosswalk": handleCrosswalk,
  "sentinel:adoption_stage": handleAdoptionStage,
};

async function handleLookup(
  input: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
) {
  const { query, scope = "all" } = input;
  // TODO: Full-text search via sentinel_search view
  const { data, error } = await supabase.rpc("sentinel_lookup", {
    search_query: query,
    search_scope: scope,
  });
  if (error) return { error: error.message };
  return { results: data };
}

async function handleExplain(input: Record<string, unknown>) {
  const { topic, depth = "detailed" } = input;
  // TODO: Fetch relevant data, format explanation with context
  return {
    topic,
    depth,
    explanation: "Not yet implemented — seed data needed first",
  };
}

async function handleGlossary(
  input: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
) {
  const { term, category } = input as { term?: string; category?: string };
  let query = supabase.from("sentinel_glossary").select("*");
  if (term) query = query.ilike("term", `%${term}%`);
  if (category) query = query.eq("category", category);
  const { data, error } = await query.limit(10);
  if (error) return { error: error.message };
  return { terms: data };
}

async function handleQuiz(input: Record<string, unknown>) {
  const { type = "term", difficulty = 2 } = input;
  // TODO: Pick a card from flashcards table, apply spaced repetition
  return {
    type,
    difficulty,
    question: "Not yet implemented — seed data needed first",
  };
}

async function handleProgress() {
  // TODO: Aggregate flashcard stats
  return { message: "Not yet implemented" };
}

async function handleAssess(input: Record<string, unknown>) {
  const { type } = input;
  // TODO: Match content against control objectives, return findings
  return {
    type,
    controls_checked: 0,
    findings: [],
    message: "Not yet implemented — need control data seeded first",
  };
}

async function handleCrosswalk(
  input: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
) {
  const { control_id, target } = input as {
    control_id: string;
    target: string;
  };
  const { data, error } = await supabase
    .from("sentinel_crosswalks")
    .select("*")
    .eq("source_id", control_id)
    .eq("target_framework", target);
  if (error) return { error: error.message };
  return { source: control_id, target_framework: target, mappings: data };
}

async function handleAdoptionStage(input: Record<string, unknown>) {
  const { responses } = input;
  // TODO: Score responses against adoption stage criteria
  return { stage: "Not yet implemented", applicable_controls: [], responses };
}

// ── MCP Protocol Handler ─────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Service role client for DB operations (bypasses RLS)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  let body: { method?: string; params?: Record<string, unknown>; id?: string | number | null };
  try {
    body = await req.json();
  } catch {
    return jsonRpcError(null, -32700, "Parse error");
  }

  const { method, params, id = null } = body;

  // initialize and tools/list don't require auth — they're discovery
  if (method === "initialize") {
    return jsonRpcResult(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "sentinel", version: "0.1.0" },
    });
  }

  if (method === "tools/list") {
    return jsonRpcResult(id, { tools: TOOLS });
  }

  // Everything else requires authentication
  const auth = await authenticateRequest(req);
  if ("error" in auth) {
    return jsonRpcError(id, -32000, auth.error, 401);
  }

  if (method === "tools/call") {
    const toolName = params?.name as string;
    const toolInput = (params?.arguments ?? {}) as Record<string, unknown>;
    const handler = handlers[toolName];
    if (!handler) {
      return jsonRpcError(id, -32601, `Unknown tool: ${toolName}`);
    }
    try {
      const toolResult = await handler(toolInput, supabase, auth.userId);
      return jsonRpcResult(id, {
        content: [
          { type: "text", text: JSON.stringify(toolResult, null, 2) },
        ],
      });
    } catch (err) {
      return jsonRpcError(
        id,
        -32603,
        `Tool execution error: ${(err as Error).message}`
      );
    }
  }

  return jsonRpcError(id, -32601, `Unknown method: ${method}`);
});
