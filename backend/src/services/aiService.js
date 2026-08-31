const config = require("../config/env");
const AppError = require("../utils/AppError");
const { TASK_PRIORITIES } = require("../db/store");

/**
 * Thin wrapper around the Google Gemini REST API. Kept as a single function
 * so every AI feature in this file goes through the same request shape,
 * error handling, and JSON-extraction logic.
 *
 * Throws AppError.serviceUnavailable-style errors (503) if the feature
 * isn't configured, or a 502 if the upstream call itself fails — neither
 * ever leaks the API key or raw upstream error bodies to the client.
 */
async function callGemini(systemPrompt, userPrompt, { maxTokens = 1024, responseMimeType } = {}) {
  if (!config.ai.apiKey) {
    throw new AppError(
      "AI features are not configured on this server. Set GEMINI_API_KEY in the environment to enable them.",
      503
    );
  }

  const model = config.ai.model || "gemini-3.6-flash";
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.ai.apiKey}`;

  const generationConfig = {
    maxOutputTokens: maxTokens,
  };

  // Enforce structured JSON mode when requested by specific features
  if (responseMimeType) {
    generationConfig.responseMimeType = responseMimeType;
  }

  let res;
  try {
    res = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig,
      }),
    });
  } catch (err) {
    throw new AppError("Could not reach the AI service. Please try again.", 502);
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = JSON.stringify(body, null, 2);
    } catch {
      // ignore — upstream didn't return JSON we can read
    }
    // eslint-disable-next-line no-console
    console.error(`[ai] Gemini API error (${res.status}):\n`, detail);
    throw new AppError("The AI service returned an error. Please try again in a moment.", 502);
  }

  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new AppError("The AI service returned an empty response. Please try again.", 502);
  }

  return text;
}

/**
 * Extracts the first JSON array or object found in a text blob. Models
 * occasionally wrap JSON in prose or code fences despite instructions not
 * to — this makes parsing robust to that instead of failing outright.
 */
function extractJson(text) {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : text.trim();

  try {
    return JSON.parse(candidate);
  } catch {
    const arrayMatch = candidate.match(/\[[\s\S]*\]/);
    const objectMatch = candidate.match(/\{[\s\S]*\}/);
    const jsonSlice = arrayMatch?.[0] || objectMatch?.[0];
    if (!jsonSlice) {
      throw new AppError("Could not parse the AI service's response. Please try again.", 502);
    }
    try {
      return JSON.parse(jsonSlice);
    } catch {
      throw new AppError("Could not parse the AI service's response. Please try again.", 502);
    }
  }
}

/**
 * Generates a list of suggested tasks for a project, given its name/
 * description and an optional free-text goal ("prepping for a security
 * audit next month"). Returns suggestions only — nothing is persisted
 * here; the caller (controller) decides what, if anything, to create.
 */
async function generateTaskSuggestions({ projectName, projectDescription, goal, count = 5 }) {
  const systemPrompt = `You are a project planning assistant for a software team's task tracker.
Given a project's name, description, and an optional goal, propose a list of concrete, actionable tasks.

Respond with ONLY a JSON array (no prose, no markdown fences) of exactly ${count} objects, each shaped like:
{"title": string (max 120 chars), "description": string (1-2 sentences), "priority": "low" | "medium" | "high"}

Titles should be specific and actionable (e.g. "Add rate limiting to the login endpoint", not "Improve security").
Vary priority realistically — not everything is "high".`;

  const userPrompt = [
    `Project name: ${projectName}`,
    projectDescription ? `Project description: ${projectDescription}` : null,
    goal ? `Current goal / focus: ${goal}` : null,
    `Generate exactly ${count} tasks.`,
  ]
    .filter(Boolean)
    .join("\n");

  // Pass responseMimeType to force JSON array rendering from Gemini
  const text = await callGemini(systemPrompt, userPrompt, {
    maxTokens: 1024,
    responseMimeType: "application/json",
  });
  const parsed = extractJson(text);

  if (!Array.isArray(parsed)) {
    throw new AppError("The AI service's response wasn't in the expected format. Please try again.", 502);
  }

  // Defensively sanitize/clamp every field rather than trusting model
  // output verbatim — this is the same discipline as validating any other
  // untrusted input, model-generated or not.
  return parsed.slice(0, count).map((t) => ({
    title: String(t.title || "Untitled task").slice(0, 160),
    description: String(t.description || "").slice(0, 500),
    priority: TASK_PRIORITIES.includes(t.priority) ? t.priority : "medium",
  }));
}

/**
 * Generates a short project description from a name and optional keywords —
 * used to help fill in the "description" field when creating a project.
 */
async function generateProjectDescription({ name, keywords = [] }) {
  const systemPrompt = `You write medium length, professional project descriptions for a software team's project tracker.
Respond with ONLY the description text — no quotes, no markdown, no preamble. 4-5 sentences, max 1000 characters.`;

  const userPrompt = [`Project name: ${name}`, keywords.length ? `Keywords: ${keywords.join(", ")}` : null]
    .filter(Boolean)
    .join("\n");

  const text = await callGemini(systemPrompt, userPrompt, { maxTokens: 150 });
  return text.replace(/^["']|["']$/g, "").slice(0, 240);
}

module.exports = { generateTaskSuggestions, generateProjectDescription };

