// Sentinel MCP Server — NIST AI RMF / FS AI RMF Compliance Tool
// Supabase Edge Function entry point

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-sentinel-token",
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
 * Verify the caller's user token and return their user ID.
 *
 * Auth architecture (4 layers):
 *   Layer 1: HTTPS (Supabase-managed TLS)
 *   Layer 2: Supabase gateway verify_jwt — checks Authorization header
 *            contains a valid HS256 JWT (the anon key). This is the firewall
 *            that blocks garbage requests before they reach our code.
 *   Layer 3: This function — reads the user's ES256 auth token from
 *            X-Sentinel-Token header, validates via getUser() against
 *            the Supabase Auth server. This is the real auth.
 *   Layer 4: RLS policies on all tables.
 *
 * Why two headers:
 *   - Authorization: Bearer <anon_key> — satisfies the gateway (HS256)
 *   - X-Sentinel-Token: <user_jwt> — our app-level auth (ES256)
 *   The gateway can't verify ES256 user tokens, so we split the concerns.
 */
async function authenticateRequest(
  req: Request
): Promise<{ userId: string } | { error: string }> {
  // User token comes from X-Sentinel-Token header
  const userToken = req.headers.get("x-sentinel-token");
  if (!userToken) {
    return { error: "Missing X-Sentinel-Token header. Pass your Supabase auth JWT in this header." };
  }

  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: `Bearer ${userToken}` } } }
  );

  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(userToken);

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

  // Fall back to text search across tables
  // Sanitize search query for PostgREST filters (escape special chars)
  const sanitized = searchQuery.replace(/[%_.*,()]/g, " ").trim();
  if (!sanitized) return { match_type: "search", query: searchQuery, scope, glossary_matches: [], subcategory_matches: [], control_matches: [] };

  // Search glossary via full-text search
  const { data: glossaryHits } = await supabase
    .from("sentinel_glossary")
    .select("term, definition, source, category")
    .textSearch("search_vector", sanitized, { type: "websearch", config: "english" })
    .limit(5);

  // Search controls by ilike on objective text
  const { data: controlHits } = scope !== "nist" ? await supabase
    .from("sentinel_control_objectives")
    .select("id, subcategory_id, objective_text, trustworthy_principle")
    .ilike("objective_text", `%${sanitized}%`)
    .limit(10) : { data: [] };

  // Search subcategories
  const { data: subHits } = scope !== "fs" ? await supabase
    .from("sentinel_subcategories")
    .select("id, category_id, description")
    .ilike("description", `%${sanitized}%`)
    .limit(5) : { data: [] };

  return {
    match_type: "search",
    query: searchQuery,
    scope,
    glossary_matches: glossaryHits || [],
    subcategory_matches: subHits || [],
    control_matches: controlHits || [],
  };
}

async function handleExplain(
  input: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
) {
  const { topic, depth = "detailed" } = input as {
    topic: string;
    depth?: string;
  };

  // Sanitize topic for PostgREST filters
  const sanitized = topic.replace(/[%_.*,()]/g, " ").trim();
  const sanitizedUpper = sanitized.toUpperCase();

  // Check if it's a function name
  const { data: fnData } = await supabase
    .from("sentinel_functions")
    .select("*")
    .or(`id.ilike.%${sanitizedUpper}%,name.ilike.%${sanitized}%`)
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
    .select("id, category_id, name, description, suggested_actions")
    .or(`id.ilike.%${sanitizedUpper}%,description.ilike.%${sanitized}%`)
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
    .or(`term.ilike.%${sanitized}%,definition.ilike.%${sanitized}%`)
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
      `id.ilike.%${sanitizedUpper}%,objective_text.ilike.%${sanitized}%`
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

async function seedFlashcards(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<void> {
  // Build seed cards from the database content
  const seeds: Array<{ user_id: string; card_type: string; front: string; back: string; source_id: string; source_table: string }> = [];

  // Term cards from glossary (top terms, ordered by term for determinism)
  const { data: terms } = await supabase
    .from("sentinel_glossary")
    .select("id, term, definition, source")
    .order("term")
    .limit(30);
  if (terms) {
    for (const t of terms) {
      seeds.push({
        user_id: userId, card_type: "term",
        front: `What is "${t.term}" in the context of ${t.source || "AI risk management"}?`,
        back: t.definition, source_id: t.id, source_table: "sentinel_glossary",
      });
    }
  }

  // Function cards
  const { data: fns } = await supabase.from("sentinel_functions").select("id, name, description");
  if (fns) {
    for (const fn of fns) {
      seeds.push({
        user_id: userId, card_type: "term",
        front: `What is the ${fn.name} function in the NIST AI RMF?`,
        back: fn.description, source_id: fn.id, source_table: "sentinel_functions",
      });
    }
  }

  // Scenario cards from controls with risk statements
  const { data: ctrls } = await supabase
    .from("sentinel_control_objectives")
    .select("id, subcategory_id, objective_text, risk_statement")
    .not("risk_statement", "is", null)
    .limit(25);
  if (ctrls) {
    for (const c of ctrls) {
      seeds.push({
        user_id: userId, card_type: "scenario",
        front: `Scenario: ${c.risk_statement} Which control addresses this?`,
        back: `${c.id} (${c.subcategory_id}): ${c.objective_text}`,
        source_id: c.id, source_table: "sentinel_control_objectives",
      });
    }
  }

  // Control ID cards
  const { data: keyCtrls } = await supabase
    .from("sentinel_control_objectives")
    .select("id, subcategory_id, objective_text")
    .in("id", ["GV-1.1-001", "GV-1.2-001", "GV-1.6-001", "GV-2.1-001", "MP-1.1-001",
      "MS-2.5-001", "MS-2.11-001", "MS-2.6-001", "MG-1.1-001", "MG-2.4-001",
      "GV-1.7-001", "GV-1.3-001", "MS-2.7-001", "MS-2.10-001", "MP-3.2-001"]);
  if (keyCtrls) {
    for (const c of keyCtrls) {
      seeds.push({
        user_id: userId, card_type: "control",
        front: `What control objective does ${c.id} (under ${c.subcategory_id}) address?`,
        back: c.objective_text, source_id: c.id, source_table: "sentinel_control_objectives",
      });
    }
  }

  // Insert in batches of 25, skip duplicates via onConflict
  for (let i = 0; i < seeds.length; i += 25) {
    const { error } = await supabase
      .from("sentinel_flashcards")
      .upsert(seeds.slice(i, i + 25), { onConflict: "id", ignoreDuplicates: true });
    if (error) {
      console.error("Flashcard seed batch failed:", error.message);
    }
  }
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

  // Auto-seed flashcards for new users (null count = error, treat as no cards)
  const { count: cardCount } = await supabase
    .from("sentinel_flashcards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (!cardCount) {
    await seedFlashcards(supabase, userId);
  }

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

async function handleAssess(
  input: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
) {
  const { content, type: inputType, context } = input as {
    content: string;
    type: string;
    context?: string;
  };

  // Input validation
  const MAX_CONTENT_LENGTH = 100_000; // 100KB
  if (!content || content.length === 0) {
    return { error: "Content is required for assessment." };
  }
  const trimmedContent = content.slice(0, MAX_CONTENT_LENGTH);

  // Extract keywords from the input content
  const contentLower = trimmedContent.toLowerCase();
  const keywords = extractKeywords(contentLower);

  // Get all controls with their subcategory context
  const { data: allControls, error } = await supabase
    .from("sentinel_control_objectives")
    .select(
      "id, subcategory_id, objective_text, implementation_guidance, adoption_stages, risk_statement, trustworthy_principle"
    )
    .order("sort_order");

  if (error) return { error: error.message };
  if (!allControls?.length) return { error: "No controls loaded" };

  // Score each control against the content
  const scored = allControls.map(
    (ctrl: {
      id: string;
      subcategory_id: string;
      objective_text: string;
      implementation_guidance: string | null;
      adoption_stages: string[];
      risk_statement: string | null;
      trustworthy_principle: string | null;
    }) => {
      const ctrlText = (
        ctrl.objective_text +
        " " +
        (ctrl.implementation_guidance || "") +
        " " +
        (ctrl.risk_statement || "")
      ).toLowerCase();

      let score = 0;
      const matchedKeywords: string[] = [];

      for (const kw of keywords) {
        if (ctrlText.includes(kw)) {
          score += kw.length > 5 ? 2 : 1; // Longer keywords score higher
          matchedKeywords.push(kw);
        }
      }

      // Boost score for input type relevance
      if (inputType === "code" && ctrlText.includes("technical")) score += 1;
      if (inputType === "policy" && ctrlText.includes("polic")) score += 1;
      if (inputType === "architecture" && ctrlText.includes("design")) score += 1;
      if (inputType === "plan" && ctrlText.includes("plan")) score += 1;

      return { ...ctrl, relevance_score: score, matched_keywords: matchedKeywords };
    }
  );

  // Get top relevant controls (score > 0)
  const relevant = scored
    .filter((c: { relevance_score: number }) => c.relevance_score > 0)
    .sort(
      (a: { relevance_score: number }, b: { relevance_score: number }) =>
        b.relevance_score - a.relevance_score
    )
    .slice(0, 25);

  // Classify findings
  const findings = relevant.map(
    (ctrl: {
      id: string;
      subcategory_id: string;
      objective_text: string;
      relevance_score: number;
      matched_keywords: string[];
      risk_statement: string | null;
      trustworthy_principle: string | null;
    }) => {
      // Check if the content addresses the control (simple heuristic)
      const addressed = ctrl.matched_keywords.length >= 3;
      return {
        control_id: ctrl.id,
        subcategory_id: ctrl.subcategory_id,
        objective: ctrl.objective_text,
        status: addressed ? "partial" as const : "gap" as const,
        relevance_score: ctrl.relevance_score,
        matched_keywords: ctrl.matched_keywords,
        risk_statement: ctrl.risk_statement,
        trustworthy_principle: ctrl.trustworthy_principle,
        recommendation: addressed
          ? "Partially addressed. Review control objective for completeness."
          : "Gap identified. This control is relevant but not addressed in the content.",
      };
    }
  );

  const gaps = findings.filter(
    (f: { status: string }) => f.status === "gap"
  ).length;
  const partial = findings.filter(
    (f: { status: string }) => f.status === "partial"
  ).length;

  // Group by trustworthy principle
  const byPrinciple: Record<string, number> = {};
  findings.forEach(
    (f: { trustworthy_principle: string | null; status: string }) => {
      const p = f.trustworthy_principle || "unclassified";
      if (f.status === "gap") byPrinciple[p] = (byPrinciple[p] || 0) + 1;
    }
  );

  return {
    input_type: inputType,
    context: context || null,
    controls_assessed: allControls.length,
    relevant_controls: findings.length,
    gaps,
    partial,
    gap_by_principle: byPrinciple,
    overall_score:
      findings.length > 0
        ? Math.round((partial / findings.length) * 100)
        : 100,
    findings,
    keywords_extracted: keywords.slice(0, 20),
  };
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above",
    "below", "between", "out", "off", "over", "under", "again", "further",
    "then", "once", "here", "there", "when", "where", "why", "how", "all",
    "each", "every", "both", "few", "more", "most", "other", "some",
    "such", "no", "nor", "not", "only", "own", "same", "so", "than",
    "too", "very", "just", "because", "but", "and", "or", "if", "while",
    "that", "this", "these", "those", "it", "its", "we", "our", "they",
    "their", "what", "which", "who", "whom", "i", "me", "my", "he", "she",
  ]);

  const words = text
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // Count frequency
  const freq: Record<string, number> = {};
  words.forEach((w) => (freq[w] = (freq[w] || 0) + 1));

  // Return unique keywords sorted by frequency
  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .map(([word]) => word)
    .slice(0, 50);
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

async function handleAdoptionStage(
  input: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
) {
  const { responses } = input as {
    responses: Record<string, string | number | boolean>;
  };

  // Adoption stage questionnaire scoring
  // Questions map to maturity dimensions; responses are scored 0-3
  const dimensions: Record<string, string[]> = {
    governance: [
      "ai_policy_exists",
      "ai_roles_defined",
      "board_oversight",
      "risk_appetite_defined",
    ],
    inventory: [
      "ai_inventory_complete",
      "risk_tiering_applied",
      "third_party_ai_tracked",
    ],
    risk_management: [
      "risk_assessment_process",
      "model_validation_independent",
      "incident_response_defined",
    ],
    monitoring: [
      "performance_monitoring_active",
      "bias_monitoring_active",
      "drift_detection_deployed",
    ],
    culture: [
      "ai_training_program",
      "ethics_framework",
      "diverse_teams",
    ],
  };

  const scores: Record<string, number> = {};
  let totalScore = 0;
  let totalQuestions = 0;

  for (const [dim, questions] of Object.entries(dimensions)) {
    let dimScore = 0;
    let dimCount = 0;
    for (const q of questions) {
      if (q in responses) {
        const val = responses[q];
        const numVal =
          typeof val === "boolean"
            ? val
              ? 3
              : 0
            : typeof val === "number"
              ? Math.min(3, Math.max(0, val))
              : val === "yes"
                ? 3
                : val === "partial"
                  ? 1
                  : 0;
        dimScore += numVal;
        dimCount++;
      }
    }
    scores[dim] = dimCount > 0 ? dimScore / (dimCount * 3) : 0;
    totalScore += dimScore;
    totalQuestions += dimCount;
  }

  const overallScore =
    totalQuestions > 0 ? totalScore / (totalQuestions * 3) : 0;

  // Determine stage
  let stage: string;
  let stageId: string;
  if (overallScore < 0.25) {
    stage = "Scoping";
    stageId = "scoping";
  } else if (overallScore < 0.5) {
    stage = "Minimum Viable";
    stageId = "minimum_viable";
  } else if (overallScore < 0.75) {
    stage = "Scaling";
    stageId = "scaling";
  } else {
    stage = "Full Implementation";
    stageId = "full_implementation";
  }

  // Get controls applicable to this stage and the next
  const { data: applicableControls } = await supabase
    .from("sentinel_control_objectives")
    .select("id, subcategory_id, objective_text, adoption_stages, trustworthy_principle")
    .contains("adoption_stages", [stageId])
    .order("sort_order")
    .limit(30);

  // Identify weak dimensions for targeted recommendations
  const weakDimensions = Object.entries(scores)
    .filter(([, score]) => score < 0.5)
    .sort(([, a], [, b]) => a - b)
    .map(([dim]) => dim);

  return {
    stage,
    stage_id: stageId,
    overall_score: Math.round(overallScore * 100),
    dimension_scores: Object.fromEntries(
      Object.entries(scores).map(([k, v]) => [k, Math.round(v * 100)])
    ),
    weak_dimensions: weakDimensions,
    applicable_controls_count: applicableControls?.length || 0,
    applicable_controls: applicableControls || [],
    recommendations:
      weakDimensions.length > 0
        ? `Focus on: ${weakDimensions.join(", ")}. These dimensions scored below 50% maturity.`
        : "All dimensions are progressing well. Continue toward full implementation.",
    questionnaire_note:
      "Pass responses as key-value pairs. Keys: ai_policy_exists, ai_roles_defined, board_oversight, risk_appetite_defined, ai_inventory_complete, risk_tiering_applied, third_party_ai_tracked, risk_assessment_process, model_validation_independent, incident_response_defined, performance_monitoring_active, bias_monitoring_active, drift_detection_deployed, ai_training_program, ethics_framework, diverse_teams. Values: true/false, yes/partial/no, or 0-3.",
  };
}

// ── MCP Protocol Handler ─────────────────────────────────────

// ── Rate Limiting ────────────────────────────────────────────

const RATE_LIMITS: Record<string, { max: number; windowMinutes: number }> = {
  "tools/call": { max: 60, windowMinutes: 1 },
  "initialize": { max: 10, windowMinutes: 1 },
  "tools/list": { max: 10, windowMinutes: 1 },
};

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  action: string
): Promise<{ allowed: boolean; remaining: number }> {
  const limits = RATE_LIMITS[action] || { max: 30, windowMinutes: 1 };
  const windowStart = new Date();
  windowStart.setMinutes(windowStart.getMinutes() - limits.windowMinutes);

  const { count } = await supabase
    .from("sentinel_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("action", action)
    .gte("window_start", windowStart.toISOString());

  const current = count || 0;
  if (current >= limits.max) {
    return { allowed: false, remaining: 0 };
  }

  // Record this request
  await supabase.from("sentinel_rate_limits").insert({
    identifier,
    action,
    window_start: new Date().toISOString(),
  });

  return { allowed: true, remaining: limits.max - current - 1 };
}

// ── Audit Logging ────────────────────────────────────────────

async function logAudit(
  supabase: ReturnType<typeof createClient>,
  entry: {
    user_id: string | null;
    tool_name: string;
    input_summary?: string;
    ip_address?: string;
    user_agent?: string;
    response_status: string;
    error_message?: string;
    duration_ms?: number;
  }
): Promise<void> {
  // Fire and forget — don't block the response
  supabase.from("sentinel_audit_log").insert(entry).then(() => {});
}

// ── Main Handler ─────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  let body: { method?: string; params?: Record<string, unknown>; id?: string | number | null };
  try {
    body = await req.json();
  } catch {
    return jsonRpcError(null, -32700, "Parse error");
  }

  const { method, params, id = null } = body;

  // Rate limit all requests by IP
  const rateCheck = await checkRateLimit(supabase, ip, method || "unknown");
  if (!rateCheck.allowed) {
    await logAudit(supabase, {
      user_id: null, tool_name: method || "unknown",
      ip_address: ip, user_agent: userAgent,
      response_status: "rate_limited",
    });
    return jsonRpcError(id, -32000, "Rate limit exceeded. Try again shortly.", 429);
  }

  // initialize and tools/list don't require auth — they're discovery
  if (method === "initialize") {
    return jsonRpcResult(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "sentinel", version: "0.4.0" },
    });
  }

  if (method === "tools/list") {
    return jsonRpcResult(id, { tools: TOOLS });
  }

  // Everything else requires authentication
  const auth = await authenticateRequest(req);
  if ("error" in auth) {
    await logAudit(supabase, {
      user_id: null, tool_name: method || "unknown",
      ip_address: ip, user_agent: userAgent,
      response_status: "auth_failed", error_message: auth.error,
    });
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
      const duration = Date.now() - startTime;
      await logAudit(supabase, {
        user_id: auth.userId, tool_name: toolName,
        input_summary: JSON.stringify(toolInput).slice(0, 200),
        ip_address: ip, user_agent: userAgent,
        response_status: "success", duration_ms: duration,
      });
      return jsonRpcResult(id, {
        content: [
          { type: "text", text: JSON.stringify(toolResult, null, 2) },
        ],
      });
    } catch (err) {
      const duration = Date.now() - startTime;
      await logAudit(supabase, {
        user_id: auth.userId, tool_name: toolName,
        input_summary: JSON.stringify(toolInput).slice(0, 200),
        ip_address: ip, user_agent: userAgent,
        response_status: "error",
        error_message: (err as Error).message,
        duration_ms: duration,
      });
      return jsonRpcError(
        id, -32603, `Tool execution error: ${(err as Error).message}`
      );
    }
  }

  return jsonRpcError(id, -32601, `Unknown method: ${method}`);
});
