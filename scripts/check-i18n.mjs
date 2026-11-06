// Enforces the locale rules of SPEC.md v1.13 (§7.5) that the build does
// not, and keeps CLAUDE.md rule 2's link gate whole.
//
// check-links.mjs reads link targets written as literals. Since v1.13 most
// page links are built by localePath(locale, "/path"), which it can't see,
// so this script checks those, in every locale. It also checks:
//   - route parity: every public English route has a /zh-tw twin, and every
//     /zh-tw route an English one;
//   - Chinese content links only to Chinese pages or to assets, so a visitor
//     reading Chinese is never bounced to an English page.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_DIRS = ["app", "components", "lib", "content"];
const DYN = ":dyn";

const errors = [];

function fail(message) {
  errors.push(message);
}

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const rel = (file) => path.relative(ROOT, file).split(path.sep).join("/");

// ------------------------------------------------- locales (lib/i18n.ts)

const i18nSource = fs.readFileSync(path.join(ROOT, "lib", "i18n.ts"), "utf8");
const localesMatch = /export const LOCALES = \[([^\]]*)\]/.exec(i18nSource);
if (!localesMatch) {
  console.error("check-i18n: could not read LOCALES from lib/i18n.ts — refusing to pass.");
  process.exit(1);
}
const LOCALES = [...localesMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
if (LOCALES[0] !== "en") {
  fail(`lib/i18n.ts: LOCALES must start with "en", the default; found ${LOCALES.join(", ")}`);
}

/** The URL prefix of each locale, as lib/i18n.ts's PREFIX must declare it. */
const prefixOf = (locale) => (locale === "en" ? "" : `/${locale}`);
for (const locale of LOCALES) {
  const declared = new RegExp(`"?${locale}"?:\\s*"${prefixOf(locale)}"`);
  if (!declared.test(i18nSource)) {
    fail(`lib/i18n.ts: PREFIX for "${locale}" must be "${prefixOf(locale)}"`);
  }
}

function localized(locale, target) {
  const prefix = prefixOf(locale);
  if (prefix === "") return target;
  return target === "/" ? prefix : `${prefix}${target}`;
}

// ------------------------------------------------- the route table

function routeFor(pageFile) {
  const parts = path
    .relative(path.join(ROOT, "app"), path.dirname(pageFile))
    .split(path.sep)
    .filter((segment) => segment !== "" && !/^\(.*\)$/.test(segment))
    .map((segment) => (/^\[.*\]$/.test(segment) ? DYN : segment));
  return "/" + parts.join("/");
}

const routes = new Set();
for (const file of walk(path.join(ROOT, "app"))) {
  if (/[\\/]page\.tsx?$/.test(file)) routes.add(routeFor(file));
}
if (routes.size === 0) {
  console.error("check-i18n: found no page.tsx under app/ — refusing to pass.");
  process.exit(1);
}

function routeExists(target) {
  const parts = target.split("/");
  return [...routes].some((route) => {
    const routeParts = route.split("/");
    if (routeParts.length !== parts.length) return false;
    return routeParts.every((seg, i) => seg === DYN || seg === parts[i]);
  });
}

const isLocaleRoute = (route, locale) => {
  const prefix = prefixOf(locale);
  return route === prefix || route.startsWith(`${prefix}/`);
};
const isPublic = (route) => !/^\/study(\/|$)/.test(route);

// ------------------------------------------------- 1. localePath() targets

function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

let localePathTargets = 0;
for (const dir of SOURCE_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    if (!/\.tsx?$/.test(file)) continue;
    const text = stripComments(fs.readFileSync(file, "utf8"));
    for (const m of text.matchAll(/localePath\(\s*[^,()]+,\s*(["'`])(\/[^"'`]*)\1\s*\)/g)) {
      const target = m[2].replace(/\$\{[^}]*\}/g, DYN).split(/[?#]/)[0];
      localePathTargets++;
      for (const locale of LOCALES) {
        const url = localized(locale, target);
        if (!routeExists(url)) {
          fail(`${rel(file)}: localePath target ${target} has no ${locale} route (${url}) (CLAUDE.md rule 2).`);
        }
      }
    }
  }
}

// ------------------------------------------------- 2. route parity

for (const locale of LOCALES.slice(1)) {
  const prefix = prefixOf(locale);
  for (const route of routes) {
    if (!isPublic(route)) continue;
    if (isLocaleRoute(route, locale)) {
      const english = route === prefix ? "/" : route.slice(prefix.length);
      if (!routes.has(english)) {
        fail(`${route} has no English route ${english} (SPEC.md v1.13: every page exists in both).`);
      }
    } else if (!LOCALES.slice(1).some((other) => isLocaleRoute(route, other))) {
      const twin = localized(locale, route);
      if (!routes.has(twin)) {
        fail(`${route} has no ${locale} route ${twin} (SPEC.md v1.13: every page exists in both).`);
      }
    }
  }
}

// ------------------------------------------------- 3. no hop back to English

/** Files whose links a visitor reads in a locale other than English. */
function localeOfFile(file) {
  const r = rel(file);
  for (const locale of LOCALES.slice(1)) {
    if (r.startsWith(`content/${locale}/`) || r.includes(`.${locale}.`)) return locale;
  }
  return null;
}

let localeLinks = 0;
for (const dir of ["content", "lib"]) {
  for (const file of walk(path.join(ROOT, dir))) {
    if (!/\.(tsx?|mdx?)$/.test(file)) continue;
    const locale = localeOfFile(file);
    if (locale === null) continue;
    const text = stripComments(fs.readFileSync(file, "utf8"));
    const targets = [
      ...[...text.matchAll(/href=\{?["'`](\/[^"'`]*)["'`]\}?/g)].map((m) => m[1]),
      ...[...text.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]),
    ];
    for (const raw of targets) {
      const target = raw.split(/[?#]/)[0];
      localeLinks++;
      if (/\.[a-z0-9]{2,5}$/i.test(target)) continue; // an asset: /resume.pdf, /screens/...
      if (!isLocaleRoute(target, locale)) {
        fail(`${rel(file)}: ${raw} leaves the ${locale} edition; link ${localized(locale, target)} instead.`);
      }
    }
  }
}

// ------------------------------------------------- report

if (errors.length > 0) {
  console.error(`check-i18n: ${errors.length} problem(s)\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `check-i18n: ok (${LOCALES.length} locale(s), ${localePathTargets} localePath target(s), ` +
    `${routes.size} route(s), ${localeLinks} non-English link(s))`,
);
