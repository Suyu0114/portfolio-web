// Enforces CLAUDE.md rules 4, 5 and 6 against app/globals.css.
//
// Rule 4 freezes the SPEC.md §4.1 token set: a new color or font is a spec
// change, not a code change. Rule 5 says there is no sans face. Rule 6 says
// the site is light-only. None of those fail the build on their own, so this
// script is the gate.
//
// Values below are the CURRENT ones (SPEC.md v1.3 darkened muted/accent/
// accent-2 for WCAG AA). Do not "restore" the pre-v1.3 hexes.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CSS = path.join(ROOT, "app", "globals.css");

/** SPEC.md §4.1, frozen. Spec name -> Tailwind v4 variable name. */
const FROZEN_TOKENS = {
  "--color-paper": "#fbf6ea",
  "--color-card": "#fffdf4",
  "--color-ink": "#2b2620",
  "--color-ink-soft": "#5c5546",
  "--color-muted": "#777063",
  "--color-accent": "#b45628",
  "--color-accent-2": "#657744",
  "--color-rule": "#d8cfbb",
};

/** SPEC.md §4.2: mono is the body face, display is Caveat. No third face. */
const ALLOWED_FONT_VARS = ["--font-mono", "--font-display"];

/** Directories scanned for the rule 6 (no dark mode) check. */
const SOURCE_DIRS = ["app", "components", "lib", "content"];

const errors = [];

function fail(message) {
  errors.push(message);
}

// ---------------------------------------------------------------- rule 4

const css = fs.readFileSync(CSS, "utf8");

const declared = new Map();
// `*` is in the character class on purpose: the palette reset is written
// `--color-*: initial` and must be seen by this scan, not silently skipped.
for (const match of css.matchAll(/(--color-[a-z0-9*-]+)\s*:\s*([^;]+);/g)) {
  declared.set(match[1], match[2].trim().toLowerCase());
}

// `--color-*: initial` clears the default Tailwind palette. It is a reset,
// not a token, so it must be present but is not part of the frozen set.
if (declared.get("--color-*") !== "initial") {
  fail(
    "app/globals.css must keep `--color-*: initial;` so the default Tailwind " +
      "palette stays cleared and no off-token color can be referenced.",
  );
}
declared.delete("--color-*");

for (const [name, expected] of Object.entries(FROZEN_TOKENS)) {
  if (!declared.has(name)) {
    fail(`Frozen token ${name} is missing from app/globals.css (SPEC.md §4.1).`);
    continue;
  }
  const actual = declared.get(name);
  if (actual !== expected) {
    fail(
      `Frozen token ${name} is ${actual}, expected ${expected}. ` +
        "Changing a token is a spec change (CLAUDE.md rule 4), not a code change.",
    );
  }
  declared.delete(name);
}

for (const [name, value] of declared) {
  fail(
    `Unknown color token ${name}: ${value}. Only the eight tokens in ` +
      "SPEC.md §4.1 may exist (CLAUDE.md rule 4).",
  );
}

// Any hex outside the token block is an off-token color by definition.
const hexes = css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
const expectedHexCount = Object.keys(FROZEN_TOKENS).length;
if (hexes.length !== expectedHexCount) {
  fail(
    `app/globals.css contains ${hexes.length} hex colors, expected exactly ` +
      `${expectedHexCount} (the frozen tokens and nothing else). Found: ${hexes.join(", ")}`,
  );
}

// ---------------------------------------------------------------- rule 5

const fontVars = [...css.matchAll(/(--font-[a-z0-9-]+)\s*:/g)].map((m) => m[1]);
const unexpectedFonts = fontVars.filter((v) => !ALLOWED_FONT_VARS.includes(v));
if (unexpectedFonts.length > 0) {
  fail(
    `Unexpected font variable(s): ${unexpectedFonts.join(", ")}. ` +
      "Body, tags, labels and code are all JetBrains Mono; there is no sans " +
      "face (CLAUDE.md rule 5).",
  );
}
for (const required of ALLOWED_FONT_VARS) {
  if (!fontVars.includes(required)) {
    fail(`Font variable ${required} is missing from app/globals.css.`);
  }
}

// ---------------------------------------------------------------- rule 6

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

for (const dir of SOURCE_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    if (!/\.(tsx?|css|mdx?)$/.test(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    if (text.includes("prefers-color-scheme")) {
      fail(
        `${path.relative(ROOT, file)} references prefers-color-scheme. ` +
          "The paper aesthetic is light-only by design (CLAUDE.md rule 6).",
      );
    }
  }
}

// ---------------------------------------------------------------- report

if (errors.length > 0) {
  console.error(`check-tokens: ${errors.length} problem(s)\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `check-tokens: ok (${expectedHexCount} frozen tokens, ` +
    `${ALLOWED_FONT_VARS.length} font faces, no dark mode)`,
);
