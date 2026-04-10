import { parse } from "acorn";
import * as walk from "acorn-walk";

export type ComplexityResult = {
  time: string;
  space: string;
  notes: string[];
  confidence: "low" | "medium";
};

type Parsed = ReturnType<typeof parse>;

function safeParse(code: string): Parsed {
  return parse(code, {
    ecmaVersion: "latest",
    sourceType: "module",
    allowHashBang: true,
  }) as Parsed;
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

export function estimateComplexity(code: string): ComplexityResult {
  const notes: string[] = [];
  let time = "O(1)";
  let space = "O(1)";
  let confidence: ComplexityResult["confidence"] = "medium";

  let ast: Parsed;
  try {
    ast = safeParse(code);
  } catch (e: any) {
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
  let currentLoopDepth = 0;
  let maxLoopDepth = 0;
  let sawLogLoop = false;
  let sawSortCall = false;
  let allocInsideLoop = false;

  // Track simple recursion signals.
  const functionStack: string[] = [];
  const recursionCalls: Record<string, number> = {};

  walk.ancestor(ast as any, {
    ForStatement(node: any, ancestors: any[]) {
      if (!isLoopNode(node)) return;
      currentLoopDepth++;
      maxLoopDepth = Math.max(maxLoopDepth, currentLoopDepth);
      if (looksLikeLogLoop([node.test, node.update])) sawLogLoop = true;
    },
    WhileStatement(node: any) {
      currentLoopDepth++;
      maxLoopDepth = Math.max(maxLoopDepth, currentLoopDepth);
      if (looksLikeLogLoop(node.test)) sawLogLoop = true;
    },
    DoWhileStatement(node: any) {
      currentLoopDepth++;
      maxLoopDepth = Math.max(maxLoopDepth, currentLoopDepth);
      if (looksLikeLogLoop(node.test)) sawLogLoop = true;
    },
    ForOfStatement(node: any) {
      currentLoopDepth++;
      maxLoopDepth = Math.max(maxLoopDepth, currentLoopDepth);
    },
    ForInStatement(node: any) {
      currentLoopDepth++;
      maxLoopDepth = Math.max(maxLoopDepth, currentLoopDepth);
    },
    "ForStatement:exit"() {
      currentLoopDepth = Math.max(0, currentLoopDepth - 1);
    },
    "WhileStatement:exit"() {
      currentLoopDepth = Math.max(0, currentLoopDepth - 1);
    },
    "DoWhileStatement:exit"() {
      currentLoopDepth = Math.max(0, currentLoopDepth - 1);
    },
    "ForOfStatement:exit"() {
      currentLoopDepth = Math.max(0, currentLoopDepth - 1);
    },
    "ForInStatement:exit"() {
      currentLoopDepth = Math.max(0, currentLoopDepth - 1);
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
    "FunctionDeclaration:exit"(node: any) {
      if (node?.id?.name) functionStack.pop();
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

    NewExpression(node: any) {
      if (currentLoopDepth > 0) allocInsideLoop = true;
    },
    ArrayExpression(node: any) {
      if (node?.elements?.length && currentLoopDepth > 0) allocInsideLoop = true;
    },
    ObjectExpression(node: any) {
      if (node?.properties?.length && currentLoopDepth > 0) allocInsideLoop = true;
    },
  });

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

