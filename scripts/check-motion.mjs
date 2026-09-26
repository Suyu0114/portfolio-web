// Enforces SPEC.md §4.4 (v1.11): every motion value comes from
// lib/motion.ts. A raw duration, delay, easing or spring anywhere else fails
// `npm run check`, so a new component can't quietly pick its own rhythm.
//
// Scanned: .ts/.tsx under app, components and lib, plus app/globals.css.
// lib/motion.ts is the source, and lib/motionCss.ts only serialises it.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_DIRS = ["app", "components", "lib"];
const TOKEN_FILES = new Set(["lib/motion.ts", "lib/motionCss.ts"]);
const CSS = "app/globals.css";

/**
 * CSS rules left out on purpose, by selector:
 * - `.chat-think` is the chat widget's thinking indicator, SPEC-CHATBOT §6,
 *   outside v1.11's scope (SPEC_v1.11_amendment.md §12).
 * - The universal selector is the prefers-reduced-motion override, whose
 *   0.01ms is what switches motion off, not a rhythm.
 */
const CSS_EXEMPT = [/\.chat-think/, /^\s*\*\s*,/];

const errors = [];
const fail = (file, line, message) => errors.push(`${file}:${line}: ${message}`);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

// A time that isn't zero: 300ms, .3s, 1.2s. Zero is allowed, since it means
// "no animation" rather than a rhythm.
const TIME = /(?<![\w.-])(?!0+(?:\.0+)?m?s\b)\d*\.?\d+m?s\b/;

const TS_RULES = [
  // The lookbehinds skip the same words inside a variable name, such as
  // ease-(--motion-ease-out).
  [/(?<![\w-])(duration|delay)-(\d|\[)/, "Tailwind duration/delay with a literal value; use duration-(--motion-*) or a mo-* class"],
  [/(?<![\w-])ease-(in|out|in-out|linear|\[)/, "Tailwind easing keyword; use ease-(--motion-ease-*) or a mo-* class"],
  [/(?<![\w-])animate-(spin|ping|pulse|bounce|\[)/, "Tailwind animate-* utility; motion goes through lib/motion.ts"],
  [/cubic-bezier\(/, "cubic-bezier() outside lib/motion.ts"],
  [/\b(duration|delay|stiffness|damping|mass|bounce|visualDuration)\s*:\s*[\d.]/, "literal Motion timing; use a transition from lib/motion.ts"],
  [/\b(transition|animation)\w*\s*[:=]\s*["'`][^"'`]*/, null], // checked for TIME below
  [/import\s*\{[^}]*\bmotion\b[^}]*\}\s*from\s*["']motion/, "full `motion` components; use `m` under LazyMotion (MotionProvider)"],
  [/from\s*["']framer-motion["']/, "import from `motion`, not `framer-motion`"],
];

for (const dir of SOURCE_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const rel = path.relative(ROOT, file).replaceAll("\\", "/");
    if (TOKEN_FILES.has(rel)) continue;
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach((text, i) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(text)) return; // comments aren't code
      for (const [re, message] of TS_RULES) {
        const m = re.exec(text);
        if (!m) continue;
        if (message === null) {
          if (TIME.test(m[0])) fail(rel, i + 1, `literal time in a transition or animation string: ${m[0].trim()}`);
        } else {
          fail(rel, i + 1, `${message}: ${m[0].trim()}`);
        }
      }
    });
  }
}

// ------------------------------------------------------------ globals.css

const css = fs.readFileSync(path.join(ROOT, CSS), "utf8");
// Innermost blocks only (a selector and its declarations); @media wrappers
// hold no declarations of their own.
for (const block of css.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  const selector = block[1].replace(/\/\*[\s\S]*?\*\//g, "").trim();
  if (CSS_EXEMPT.some((re) => re.test(selector))) continue;
  const line = css.slice(0, block.index + block[1].length).split("\n").length;
  for (const decl of block[2].matchAll(/(?:^|;)\s*((?:transition|animation)[a-z-]*)\s*:\s*([^;]+)/g)) {
    const [, prop, value] = decl;
    if (TIME.test(value)) fail(CSS, line, `literal time in ${selector} { ${prop} }; use var(--motion-*)`);
    if (/cubic-bezier\(|(?<![-\w])(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)(?![-\w])/.test(value)) {
      fail(CSS, line, `literal easing in ${selector} { ${prop} }; use var(--motion-ease-*)`);
    }
  }
}

if (errors.length > 0) {
  console.error(`check-motion: ${errors.length} problem(s). Motion values come from lib/motion.ts (SPEC §4.4).`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log("check-motion: ok (every motion value comes from lib/motion.ts)");
