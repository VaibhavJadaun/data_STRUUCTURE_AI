import { NextFunction, Request, Response } from "express";
import { OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { getChatAIConfiguration } from "../config/openai-config.js";

export type CodeReviewFeedback = {
  time_complexity: string;
  space_complexity: string;
  issues: string[];
  optimizations: string[];
  clean_code_suggestions: string[];
  improved_code: string;
};

type AxiosLikeError = {
  response?: {
    status?: number;
    data?: { error?: { message?: string } };
    headers?: Record<string, string>;
  };
  message?: string;
  isAxiosError?: boolean;
};

function isAxiosLike(err: unknown): err is AxiosLikeError {
  return (
    typeof err === "object" &&
    err !== null &&
    ("isAxiosError" in err || "response" in err)
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryAfterMs(err: unknown): number | null {
  if (!isAxiosLike(err)) return null;
  const raw = err.response?.headers?.["retry-after"];
  if (raw === undefined || raw === null) return null;
  const sec = Number(raw);
  if (!Number.isFinite(sec)) return null;
  return Math.min(Math.max(sec * 1000, 0), 60_000);
}

async function createChatCompletionWithRetry(
  openai: OpenAIApi,
  params: Parameters<OpenAIApi["createChatCompletion"]>[0]
) {
  const maxAttempts = 5;
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await openai.createChatCompletion(params);
    } catch (e) {
      lastError = e;
      if (!isAxiosLike(e) || e.response?.status !== 429) throw e;
      if (attempt === maxAttempts) break;
      const waitMs =
        getRetryAfterMs(e) ?? Math.min(1000 * 2 ** (attempt - 1), 16_000);
      await delay(waitMs);
    }
  }
  throw lastError;
}

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === "string").map((s) => s.trim()).filter(Boolean);
}

function normalizeFeedback(value: any): CodeReviewFeedback {
  return {
    time_complexity:
      typeof value?.time_complexity === "string" ? value.time_complexity.trim() : "",
    space_complexity:
      typeof value?.space_complexity === "string" ? value.space_complexity.trim() : "",
    issues: safeStringArray(value?.issues),
    optimizations: safeStringArray(value?.optimizations),
    clean_code_suggestions: safeStringArray(value?.clean_code_suggestions),
    improved_code:
      typeof value?.improved_code === "string" ? value.improved_code.trim() : "",
  };
}

function tryParseJsonObject(raw: string): any | null {
  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    // Try extracting the first JSON object in the string.
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    const candidate = trimmed.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }
}

function captureSection(raw: string, title: string): string {
  const re = new RegExp(`${title}\\s*[:\\-]\\s*(.+)`, "i");
  const m = raw.match(re);
  return (m?.[1] ?? "").trim();
}

function extractBulletsAfter(raw: string, heading: string): string[] {
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex((l) =>
    new RegExp(`^\\s*${heading}\\s*[:\\-]?\\s*$`, "i").test(l.trim())
  );
  if (start === -1) return [];
  const out: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (out.length > 0) break;
      continue;
    }
    if (/^[A-Za-z _]+:\s*$/.test(line) && out.length > 0) break;
    if (/^[-*]\s+/.test(line)) out.push(line.replace(/^[-*]\s+/, "").trim());
    else if (/^\d+\.\s+/.test(line)) out.push(line.replace(/^\d+\.\s+/, "").trim());
    else if (out.length > 0) out.push(line);
  }
  return out.filter(Boolean);
}

function extractImprovedCode(raw: string): string {
  const fenced = raw.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  if (fenced?.[1]) return fenced[1].trim();
  const marker = raw.match(/improved[_ ]code\s*[:\-]\s*([\s\S]*)/i);
  return (marker?.[1] ?? "").trim();
}

function buildFallbackFeedback(raw: string, originalCode: string): CodeReviewFeedback {
  const loopCount = (originalCode.match(/\b(for|while)\b/g) ?? []).length;
  const hasNestedLoop = loopCount >= 2;
  const hasSort = /\bsort\s*\(/i.test(originalCode);
  const inferredTime = hasNestedLoop
    ? "O(n^2)"
    : hasSort
    ? "O(n log n)"
    : loopCount === 1
    ? "O(n)"
    : "O(1)";

  return {
    time_complexity:
      captureSection(raw, "time_complexity") ||
      captureSection(raw, "time complexity") ||
      inferredTime,
    space_complexity:
      captureSection(raw, "space_complexity") ||
      captureSection(raw, "space complexity") ||
      "O(1)",
    issues:
      extractBulletsAfter(raw, "issues").length > 0
        ? extractBulletsAfter(raw, "issues")
        : [
            "Model returned non-JSON output; this is best-effort analysis.",
            hasNestedLoop
              ? "Nested loops may be expensive for large inputs."
              : "Review edge cases (empty input, duplicates, bounds).",
          ],
    optimizations:
      extractBulletsAfter(raw, "optimizations").length > 0
        ? extractBulletsAfter(raw, "optimizations")
        : [
            hasNestedLoop
              ? "Use hash map/set or better data structure to reduce repeated scans."
              : "Reduce repeated work and avoid redundant computations.",
            "Prefer early returns after validation checks.",
          ],
    clean_code_suggestions:
      extractBulletsAfter(raw, "clean code suggestions").length > 0
        ? extractBulletsAfter(raw, "clean code suggestions")
        : extractBulletsAfter(raw, "clean code tips").length > 0
        ? extractBulletsAfter(raw, "clean code tips")
        : [
            "Use descriptive variable/function names.",
            "Split large logic into smaller helper functions.",
          ],
    improved_code: extractImprovedCode(raw) || originalCode,
  };
}

function enrichFeedback(feedback: CodeReviewFeedback, originalCode: string): CodeReviewFeedback {
  const loopCount = (originalCode.match(/\b(for|while)\b/g) ?? []).length;
  const hasNestedLoop = loopCount >= 2;
  const hasSort = /\bsort\s*\(/i.test(originalCode);
  const inferredTime = hasNestedLoop
    ? "O(n^2)"
    : hasSort
    ? "O(n log n)"
    : loopCount === 1
    ? "O(n)"
    : "O(1)";

  const time_complexity =
    feedback.time_complexity && !/not clearly identified/i.test(feedback.time_complexity)
      ? feedback.time_complexity
      : inferredTime;
  const space_complexity =
    feedback.space_complexity && !/not clearly identified/i.test(feedback.space_complexity)
      ? feedback.space_complexity
      : "O(1)";

  const optimizations =
    feedback.optimizations.length > 0
      ? feedback.optimizations
      : [
          hasNestedLoop
            ? "Use hash-based lookup / better data structure to reduce nested scans."
            : "Avoid recomputing values inside loops.",
          "Handle edge cases early using guard clauses.",
        ];

  const clean_code_suggestions =
    feedback.clean_code_suggestions.length > 0
      ? feedback.clean_code_suggestions
      : [
          "Use clear and descriptive naming conventions.",
          "Break complex logic into small reusable functions.",
        ];

  const issues =
    feedback.issues.length > 0
      ? feedback.issues
      : [
          "Review edge-case handling (empty input, invalid values, bounds).",
          hasNestedLoop
            ? "Current approach may not scale for large input sizes."
            : "Verify correctness with boundary-focused tests.",
        ];

  return {
    ...feedback,
    time_complexity,
    space_complexity,
    issues,
    optimizations,
    clean_code_suggestions,
    improved_code: feedback.improved_code || originalCode,
  };
}

const REVIEW_SYSTEM_PROMPT: ChatCompletionRequestMessage = {
  role: "system",
  content:
    "You are a senior software engineer and DSA/code-review expert. Your job is to review the user's code and return ONLY valid JSON (no markdown, no backticks, no extra keys, no trailing commas).",
};

function buildReviewUserPrompt(code: string, language?: string): string {
  const lang = (language ?? "").trim();
  return [
    "Analyze the following code and return structured feedback in EXACTLY this JSON shape:",
    "",
    "{",
    '  "time_complexity": "",',
    '  "space_complexity": "",',
    '  "issues": [],',
    '  "optimizations": [],',
    '  "clean_code_suggestions": [],',
    '  "improved_code": ""',
    "}",
    "",
    "Requirements:",
    "- Detect time and space complexity (use Big-O, mention dominant term).",
    "- Identify inefficient logic or potential bugs/edge cases.",
    "- Suggest optimized approach (if any), including data structure improvements.",
    "- Improve readability and maintainability (naming, structure, early returns, etc.).",
    "- Provide corrected/optimized code in improved_code (same language as input if possible).",
    "- improved_code must be plain code text (no markdown fences).",
    "- Keep arrays concise but actionable; avoid generic fluff.",
    "",
    `Language (best effort): ${lang || "unknown"}`,
    "",
    "User code:",
    code,
  ].join("\n");
}

export const reviewCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = String(req.body?.code ?? "").trim();
    const language =
      typeof req.body?.language === "string" ? req.body.language.trim() : undefined;

    if (!code) {
      return res.status(422).json({ message: "code is required" });
    }

    const { configuration, model } = getChatAIConfiguration();
    const openai = new OpenAIApi(configuration);

    const messages: ChatCompletionRequestMessage[] = [
      REVIEW_SYSTEM_PROMPT,
      { role: "user", content: buildReviewUserPrompt(code, language) },
    ];

    const aiRes = await createChatCompletionWithRetry(openai, {
      model,
      messages,
      temperature: 0.2,
    });

    const content = aiRes.data.choices[0]?.message?.content ?? "";
    const parsed = tryParseJsonObject(content);
    if (!parsed) {
      // Avoid failing the UI when model drifts from strict JSON.
      return res.status(200).json(enrichFeedback(buildFallbackFeedback(content, code), code));
    }
    return res.status(200).json(enrichFeedback(normalizeFeedback(parsed), code));
  } catch (error) {
    console.error(error);

    if (isAxiosLike(error) && error.response) {
      const status = error.response?.status;
      const openaiBody = error.response?.data as
        | { error?: { message?: string } }
        | undefined;
      const detail =
        openaiBody?.error?.message ?? error.message ?? "AI request failed";

      if (status === 429) {
        return res.status(429).json({
          message:
            "Rate limit (429) after retries. Add GROQ_API_KEY in .env (free tier at console.groq.com) or wait and try again.",
        });
      }
      if (status === 401) {
        return res.status(502).json({
          message:
            "API rejected the key. Check GROQ_API_KEY or OPENAI_API_KEY in .env and restart the server.",
        });
      }
      return res.status(502).json({ message: detail });
    }

    const msg = error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ message: msg });
  }
};

