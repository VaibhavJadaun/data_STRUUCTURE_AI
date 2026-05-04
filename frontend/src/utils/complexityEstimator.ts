import { parse } from "acorn";
import * as walk from "acorn-walk";

export type ComplexityResult = {
  time: string;
  space: string;
  notes: string[];
  confidence: "low" | "medium";
};

type Parsed = ReturnType<typeof parse>;

function preprocessCodeForAcorn(input: string): string {
  // The calculator UI says "JS snippets", but users often paste TS-flavored JS.
  // Keep this conservative so we don't accidentally "rewrite" real JS semantics.
  let code = input;

  // Remove leading/trailing fences if user pasted Markdown code block.
  code = code.replace(/^\s*```[\w-]*\s*\n/, "").replace(/\n\s*```\s*$/, "");

  // Strip simple TypeScript annotations: `x: T`, `(x: T, y: U) =>`, `): R =>`
  // This is a heuristic and intentionally avoids trying to parse nested/complex types.
  code = code.replace(
    /([a-zA-Z_$][\w$]*)\s*:\s*[a-zA-Z_$][\w$<>, \t[\]\|&.]*/g,
    "$1"
  );

  // Strip `as Type` assertions.
  code = code.replace(/\s+as\s+[a-zA-Z_$][\w$<>, \t[\]\|&.]*/g, "");

  // Remove TS-only declarations that often appear at top-level.
  code = code.replace(/^\s*(export\s+)?interface\s+\w[\s\S]*?\n}\s*$/gm, "");
  code = code.replace(/^\s*(export\s+)?type\s+\w[\s\S]*?;\s*$/gm, "");
  code = code.replace(/^\s*(export\s+)?enum\s+\w[\s\S]*?\n}\s*$/gm, "");

  return code;
}

function tryParse(code: string, sourceType: "module" | "script"): Parsed {
  return parse(code, {
    ecmaVersion: "latest",
    sourceType,
    allowHashBang: true,
    allowAwaitOutsideFunction: true,
  }) as Parsed;
}

function safeParse(code: string): Parsed {
  const pre = preprocessCodeForAcorn(code);
  try {
    return tryParse(pre, "module");
  } catch {
    // Many snippets aren’t modules (no imports/exports). Fall back to script mode.
    return tryParse(pre, "script");
  }
}

function isLoopNode(node: any) {
  return (
    node?.type === "ForStatement" ||
    node?.type === "WhileStatement" ||
    node?.type === "DoWhileStatement" ||
    node?.type === "ForOfStatement" ||
    node?.type === "ForInStatement"
  );
}

function looksLikeLogLoop(testOrUpdate: any): boolean {
  // Heuristic: i *= 2, i /= 2, i >>= 1, i = i * 2, etc.
  const text = JSON.stringify(testOrUpdate ?? "");
  return (
    /(\*=|\/=|>>=|<<=)/.test(text) ||
    /(\* 2|\/ 2|>> 1|<< 1)/.test(text) ||
    /(Math\.floor\(|Math\.ceil\()/.test(text)
  );
}

function estimateFromText(code: string): ComplexityResult | null {
  const raw = code ?? "";
  const notes: string[] = [];
  const cleaned = raw
    .replace(/^\s*```[\w-]*\s*\n/, "")
    .replace(/\n\s*```\s*$/, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  // Very rough fallback for non-JS languages: look for loop keywords and common log patterns.
  const loopHits = (cleaned.match(/\b(for|while|foreach)\b/gi) ?? []).length;
  const logHits =
    /\b(i\s*[\/*]=\s*2|i\s*=\s*i\s*[\/*]\s*2|>>=|<<=|\/\s*2|\*\s*2)\b/.test(
      cleaned
    ) ||
    /\b(mid|low|high)\b/.test(cleaned); // binary search-ish variable names

  if (loopHits === 0) return null;

  let time = "O(n)";
  if (loopHits >= 2) time = "O(n^2)";
  if (loopHits >= 3) time = "O(n^3)";
  if (logHits && loopHits === 1) time = "O(log n)";
  if (logHits && loopHits >= 2) time = "O(n log n)";

  notes.push(
    "Could not fully parse as JavaScript; using a text-based heuristic from loop keywords."
  );
  notes.push(`Detected ~${loopHits} loop keyword(s).`);
  if (logHits) notes.push("Loop/update looks logarithmic (divide/multiply/shift).");
  notes.push(
    "Tip: for best results, paste JavaScript (or TS without heavy type syntax)."
  );

  return { time, space: "O(1)", confidence: "low", notes };
}

export function estimateComplexity(code: string): ComplexityResult {
  const notes: string[] = [];
  let time = "O(1)";
  let space = "O(1)";
  let confidence: ComplexityResult["confidence"] = "medium";

  let ast: Parsed;
  try {
    ast = safeParse(code);
  } catch (e: any) {
    const fallback = estimateFromText(code);
    if (fallback) return fallback;
    return {
      time: "Unknown",
      space: "Unknown",
      confidence: "low",
      notes: [
        "Could not parse code. Make sure you paste valid JavaScript/TypeScript-like syntax.",
        String(e?.message ?? e),
      ],
    };
  }

  // Track loop nesting and detect common patterns.
  let maxLoopDepth = 0;
  let sawLogLoop = false;
  let sawSortCall = false;
  let allocInsideLoop = false;

  // Track simple recursion signals.
  const functionStack: string[] = [];
  const recursionCalls: Record<string, number> = {};

  const visitors: Record<string, any> = {
    ForStatement(node: any, _state: any, ancestors: any[]) {
      if (!isLoopNode(node)) return;
      const loopDepth = ancestors.filter(isLoopNode).length + 1;
      maxLoopDepth = Math.max(maxLoopDepth, loopDepth);
      if (looksLikeLogLoop([node.test, node.update])) sawLogLoop = true;
    },
    WhileStatement(node: any, _state: any, ancestors: any[]) {
      const loopDepth = ancestors.filter(isLoopNode).length + 1;
      maxLoopDepth = Math.max(maxLoopDepth, loopDepth);
      if (looksLikeLogLoop(node.test)) sawLogLoop = true;
    },
    DoWhileStatement(node: any, _state: any, ancestors: any[]) {
      const loopDepth = ancestors.filter(isLoopNode).length + 1;
      maxLoopDepth = Math.max(maxLoopDepth, loopDepth);
      if (looksLikeLogLoop(node.test)) sawLogLoop = true;
    },
    ForOfStatement(_node: any, _state: any, ancestors: any[]) {
      const loopDepth = ancestors.filter(isLoopNode).length + 1;
      maxLoopDepth = Math.max(maxLoopDepth, loopDepth);
    },
    ForInStatement(_node: any, _state: any, ancestors: any[]) {
      const loopDepth = ancestors.filter(isLoopNode).length + 1;
      maxLoopDepth = Math.max(maxLoopDepth, loopDepth);
    },

    CallExpression(node: any) {
      // Detect Array.prototype.sort()
      if (node?.callee?.type === "MemberExpression") {
        const prop = node.callee.property;
        if ((prop?.name ?? prop?.value) === "sort") {
          sawSortCall = true;
        }
      }

      // Detect recursion: function calling itself by name
      if (node?.callee?.type === "Identifier") {
        const calleeName = node.callee.name;
        const currentFn = functionStack[functionStack.length - 1];
        if (currentFn && calleeName === currentFn) {
          recursionCalls[currentFn] = (recursionCalls[currentFn] ?? 0) + 1;
        }
      }
    },

    FunctionDeclaration(node: any) {
      if (node?.id?.name) functionStack.push(node.id.name);
    },
    "FunctionDeclaration:exit"() {
      functionStack.pop();
    },
    FunctionExpression(node: any) {
      if (node?.id?.name) functionStack.push(node.id.name);
      else functionStack.push("__anonymous__");
    },
    "FunctionExpression:exit"() {
      functionStack.pop();
    },
    ArrowFunctionExpression() {
      functionStack.push("__arrow__");
    },
    "ArrowFunctionExpression:exit"() {
      functionStack.pop();
    },

    NewExpression(_node: any, _state: any, ancestors: any[]) {
      if (ancestors.some(isLoopNode)) allocInsideLoop = true;
    },
    ArrayExpression(node: any, _state: any, ancestors: any[]) {
      if (node?.elements?.length && ancestors.some(isLoopNode)) allocInsideLoop = true;
    },
    ObjectExpression(node: any, _state: any, ancestors: any[]) {
      if (node?.properties?.length && ancestors.some(isLoopNode)) allocInsideLoop = true;
    },
  };

  // acorn-walk's TS types don't model the `"Foo:exit"` visitor keys well.
  // We keep this typed loosely since this is heuristic analysis code.
  walk.ancestor(ast as any, visitors as any);

  // Time complexity
  if (maxLoopDepth === 0 && Object.keys(recursionCalls).length === 0 && !sawSortCall) {
    time = "O(1)";
    notes.push("No loops detected; time may be constant (depends on library calls).");
  } else if (maxLoopDepth >= 1) {
    if (sawLogLoop) {
      time = maxLoopDepth === 1 ? "O(log n)" : `O(n^${maxLoopDepth - 1} log n)`;
      notes.push("Detected a loop that looks logarithmic (e.g., i *= 2 / i >>= 1).");
    } else {
      time = maxLoopDepth === 1 ? "O(n)" : `O(n^${maxLoopDepth})`;
      notes.push(`Detected nested loops up to depth ${maxLoopDepth}.`);
    }
  }

  if (sawSortCall) {
    // If there's already a higher polynomial, keep it; otherwise mark n log n.
    if (time === "O(1)" || time === "O(n)" || time === "O(log n)") {
      time = "O(n log n)";
    }
    notes.push("Detected `.sort()` call (typically O(n log n)).");
  }

  const recursiveFns = Object.entries(recursionCalls).filter(([, c]) => c > 0);
  if (recursiveFns.length) {
    confidence = "low";
    const worstCalls = Math.max(...recursiveFns.map(([, c]) => c));
    if (worstCalls >= 2) {
      time = "O(2^n)";
      notes.push("Detected recursion with multiple self-calls per function; may be exponential.");
    } else {
      if (time === "O(1)") time = "O(n)";
      notes.push("Detected recursion; complexity depends on recursion depth and branching.");
    }
  }

  // Space complexity
  if (allocInsideLoop) {
    space = "O(n)";
    notes.push("Detected allocations inside a loop; extra space may grow with n.");
  }
  if (recursiveFns.length) {
    // recursion stack
    if (space === "O(1)") space = "O(n)";
    notes.push("Recursion uses stack space proportional to depth.");
  }

  notes.push("This is an estimate (heuristic). Dynamic inputs, library calls, and hidden loops can change complexity.");

  return { time, space, notes, confidence };
}

