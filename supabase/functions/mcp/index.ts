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
  const { query: searchQuery, scope = "all" } = input as {
    query: string;
    scope?: string;
  };

  // Try exact ID match first (e.g. "GOVERN 1.1", "GV-1.1-001")
  const idUpper = searchQuery.toUpperCase().trim();

  // Check functions
  const { data: fnMatch } = await supabase
    .from("sentinel_functions")
    .select("id, name, description, is_crosscutting")
    .ilike("id", idUpper)
    .limit(1);
  if (fnMatch?.length) {
    const fn = fnMatch[0];
    const { data: cats } = await supabase
      .from("sentinel_categories")
      .select("id, name, description")
      .eq("function_id", fn.id)
      .order("sort_order");
    return { match_type: "function", function: fn, categories: cats };
  }

  // Check categories
  const { data: catMatch } = await supabase
    .from("sentinel_categories")
    .select("id, function_id, name, description")
    .ilike("id", idUpper)
    .limit(1);
  if (catMatch?.length) {
    const cat = catMatch[0];
    const { data: subs } = await supabase
      .from("sentinel_subcategories")
      .select("id, name, description")
      .eq("category_id", cat.id)
      .order("sort_order");
    return { match_type: "category", category: cat, subcategories: subs };
  }

  // Check subcategories
  const { data: subMatch } = await supabase
    .from("sentinel_subcategories")
    .select("id, category_id, name, description, suggested_actions")
    .ilike("id", idUpper)
    .limit(1);
  if (subMatch?.length) {
    const sub = subMatch[0];
    const { data: controls } = await supabase
      .from("sentinel_control_objectives")
      .select(
        "id, objective_text, adoption_stages, trustworthy_principle"
      )
      .eq("subcategory_id", sub.id)
      .order("sort_order");
    return {
      match_type: "subcategory",
      subcategory: sub,
      control_objectives: controls,
    };
  }

  // Check control objectives by ID
  const { data: ctrlMatch } = await supabase
    .from("sentinel_control_objectives")
    .select("*")
    .ilike("id", idUpper)
    .limit(1);
  if (ctrlMatch?.length) {
    return { match_type: "control", control: ctrlMatch[0] };
  }

  // Fall back to full-text search
  let scopeFilter = "";
  if (scope === "nist") {
    scopeFilter =
      " AND entity_type IN ('function','category','subcategory')";
  } else if (scope === "fs") {
    scopeFilter = " AND entity_type = 'control'";
  }

  const { data: searchResults, error } = await supabase.rpc(
    "sentinel_fts",
    { search_term: searchQuery, scope_filter: scope }
  );

  // If RPC doesn't exist, fall back to direct query via glossary + controls
  if (error) {
    // Search glossary
    const { data: glossaryHits } = await supabase
      .from("sentinel_glossary")
      .select("term, definition, source, category")
      .textSearch("search_vector", searchQuery, {
        type: "websearch",
        config: "english",
      })
      .limit(5);

    // Search controls by text
    const { data: controlHits } = await supabase
      .from("sentinel_control_objectives")
      .select("id, subcategory_id, objective_text, trustworthy_principle")
      .or(
        `objective_text.ilike.%${searchQuery}%,implementation_guidance.ilike.%${searchQuery}%`
      )
      .limit(10);

    // Search subcategories by text
    const { data: subHits } = await supabase
      .from("sentinel_subcategories")
      .select("id, category_id, description")
      .ilike("description", `%${searchQuery}%`)
      .limit(5);

    return {
      match_type: "search",
      query: searchQuery,
      scope,
      glossary_matches: glossaryHits || [],
      subcategory_matches: subHits || [],
      control_matches: controlHits || [],
    };
  }

  return { match_type: "search", query: searchQuery, scope, results: searchResults };
}

async function handleExplain(
  input: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
) {
  const { topic, depth = "detailed" } = input as {
    topic: string;
    depth?: string;
  };

  // Try to find the topic in our data
  const topicUpper = topic.toUpperCase().trim();

  // Check if it's a function name
  const { data: fnData } = await supabase
    .from("sentinel_functions")
    .select("*")
    .or(`id.ilike.%${topicUpper}%,name.ilike.%${topic}%`)
    .limit(1);

  if (fnData?.length) {
    const fn = fnData[0];
    const { data: cats } = await supabase
      .from("sentinel_categories")
      .select("id, description")
      .eq("function_id", fn.id)
      .order("sort_order");

    const catCount = cats?.length || 0;
    const { count: subCount } = await supabase
      .from("sentinel_subcategories")
      .select("id", { count: "exact", head: true })
      .in(
        "category_id",
        (cats || []).map((c: { id: string }) => c.id)
      );

    return {
      entity_type: "function",
      id: fn.id,
      name: fn.name,
      description: fn.description,
      is_crosscutting: fn.is_crosscutting,
      categories: cats,
      stats: { categories: catCount, subcategories: subCount },
      depth,
    };
  }

  // Check subcategory
  const { data: subData } = await supabase
    .from("sentinel_subcategories")
    .select("*, sentinel_categories!inner(name, function_id)")
    .or(`id.ilike.%${topicUpper}%,description.ilike.%${topic}%`)
    .limit(1);

  if (subData?.length) {
    const sub = subData[0];
    const { data: controls } = await supabase
      .from("sentinel_control_objectives")
      .select(
        "id, objective_text, adoption_stages, trustworthy_principle, risk_statement"
      )
      .eq("subcategory_id", sub.id)
      .order("sort_order");

    return {
      entity_type: "subcategory",
      id: sub.id,
      description: sub.description,
      suggested_actions: sub.suggested_actions,
      control_objectives: controls,
      depth,
    };
  }

  // Check glossary
  const { data: glossData } = await supabase
    .from("sentinel_glossary")
    .select("*")
    .or(`term.ilike.%${topic}%,definition.ilike.%${topic}%`)
    .limit(3);

  if (glossData?.length) {
    return {
      entity_type: "glossary",
      terms: glossData,
      depth,
    };
  }

  // Check controls
  const { data: ctrlData } = await supabase
    .from("sentinel_control_objectives")
    .select("*")
    .or(
      `id.ilike.%${topicUpper}%,objective_text.ilike.%${topic}%`
    )
    .limit(3);

  if (ctrlData?.length) {
    return {
      entity_type: "control",
      controls: ctrlData,
      depth,
    };
  }

  return {
    entity_type: "not_found",
    topic,
    suggestion:
      "Try searching with a framework ID (e.g. 'GOVERN 1.1'), a term (e.g. 'model risk'), or a control ID (e.g. 'GV-1.1-001').",
  };
}

async function handleGlossary(
  input: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
) {
  const { term, category } = input as { term?: string; category?: string };

  if (!term && !category) {
    // Return categories summary
    const { data } = await supabase
      .from("sentinel_glossary")
      .select("category");
    const cats: Record<string, number> = {};
    (data || []).forEach((r: { category: string }) => {
      cats[r.category] = (cats[r.category] || 0) + 1;
    });
    return {
      message: "Specify a term or category to search.",
      categories: cats,
      total_terms: data?.length || 0,
    };
  }

  let query = supabase
    .from("sentinel_glossary")
    .select("term, definition, source, related_terms, category");
  if (term) {
    // Try exact match first, then fuzzy
    query = query.ilike("term", `%${term}%`);
  }
  if (category) query = query.eq("category", category);
  const { data, error } = await query.order("term").limit(15);
  if (error) return { error: error.message };

  return {
    query: { term, category },
    results: data,
    count: data?.length || 0,
  };
}

async function handleQuiz(
  input: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  const { topic, type = "term", difficulty = 2 } = input as {
    topic?: string;
    type?: string;
    difficulty?: number;
  };

  // Check for existing flashcard due for review
  const { data: dueCard } = await supabase
    .from("sentinel_flashcards")
    .select("*")
    .eq("user_id", userId)
    .lte("next_review", new Date().toISOString())
    .order("next_review", { ascending: true })
    .limit(1);

  if (dueCard?.length) {
    const card = dueCard[0];
    return {
      mode: "review",
      card_id: card.id,
      card_type: card.card_type,
      question: card.front,
      hint: `Review #${card.review_count + 1}. Last interval: ${card.interval_days} days.`,
      instructions:
        "Answer the question, then call sentinel:quiz with answer_card_id and quality (0-5) to record your response.",
    };
  }

  // Generate a new question based on type
  let question: { front: string; back: string; source_id: string; source_table: string } | null = null;

  if (type === "term") {
    const query = supabase
      .from("sentinel_glossary")
      .select("id, term, definition, source, category");
    const { data: terms } = topic
      ? await query.or(`category.ilike.%${topic}%,term.ilike.%${topic}%`).limit(20)
      : await query.limit(50);
    if (terms?.length) {
      const t = terms[Math.floor(Math.random() * terms.length)];
      question = {
        front: `What is the definition of "${t.term}" in the context of ${t.source || "AI risk management"}?`,
        back: t.definition,
        source_id: t.id,
        source_table: "sentinel_glossary",
      };
    }
  } else if (type === "control") {
    const query = supabase
      .from("sentinel_control_objectives")
      .select("id, subcategory_id, objective_text, trustworthy_principle, adoption_stages");
    const { data: controls } = topic
      ? await query.ilike("subcategory_id", `%${topic}%`).limit(20)
      : await query.limit(50);
    if (controls?.length) {
      const c = controls[Math.floor(Math.random() * controls.length)];
      question = {
        front: `What control objective does ${c.id} (under ${c.subcategory_id}) address?`,
        back: c.objective_text,
        source_id: c.id,
        source_table: "sentinel_control_objectives",
      };
    }
  } else if (type === "scenario") {
    const { data: controls } = await supabase
      .from("sentinel_control_objectives")
      .select("id, subcategory_id, objective_text, risk_statement")
      .not("risk_statement", "is", null)
      .limit(30);
    if (controls?.length) {
      const c = controls[Math.floor(Math.random() * controls.length)];
      question = {
        front: `Scenario: ${c.risk_statement} Which control objective addresses this risk?`,
        back: `${c.id} (${c.subcategory_id}): ${c.objective_text}`,
        source_id: c.id,
        source_table: "sentinel_control_objectives",
      };
    }
  }

  if (!question) {
    return { error: "Could not generate a question for the given parameters." };
  }

  // Save as flashcard for spaced repetition tracking
  const { data: card, error } = await supabase
    .from("sentinel_flashcards")
    .insert({
      user_id: userId,
      card_type: type,
      front: question.front,
      back: question.back,
      source_id: question.source_id,
      source_table: question.source_table,
    })
    .select()
    .single();

  if (error) {
    // If insert fails (e.g. RLS), return question without tracking
    return {
      mode: "new",
      card_type: type,
      question: question.front,
      answer: question.back,
      tracking: "disabled",
    };
  }

  return {
    mode: "new",
    card_id: card.id,
    card_type: type,
    question: question.front,
    instructions:
      "Think about your answer, then call sentinel:quiz with answer_card_id and quality (0-5) to reveal the answer and record your response. Quality scale: 0=no recall, 3=correct with difficulty, 5=perfect recall.",
  };
}

async function handleProgress(
  _input: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  // Get all user's flashcards
  const { data: cards, error } = await supabase
    .from("sentinel_flashcards")
    .select("card_type, ease_factor, interval_days, review_count, next_review, last_reviewed")
    .eq("user_id", userId);

  if (error) return { error: error.message };
  if (!cards?.length) {
    return {
      message:
        "No learning progress yet. Use sentinel:quiz to start studying!",
      total_cards: 0,
    };
  }

  const now = new Date();
  const due = cards.filter(
    (c: { next_review: string }) => new Date(c.next_review) <= now
  ).length;

  const byType: Record<string, number> = {};
  let totalReviews = 0;
  let masteredCount = 0;

  cards.forEach(
    (c: {
      card_type: string;
      review_count: number;
      interval_days: number;
    }) => {
      byType[c.card_type] = (byType[c.card_type] || 0) + 1;
      totalReviews += c.review_count;
      if (c.interval_days >= 21) masteredCount++;
    }
  );

  return {
    total_cards: cards.length,
    cards_due: due,
    total_reviews: totalReviews,
    mastered: masteredCount,
    by_type: byType,
    mastery_rate:
      cards.length > 0
        ? Math.round((masteredCount / cards.length) * 100)
        : 0,
  };
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
