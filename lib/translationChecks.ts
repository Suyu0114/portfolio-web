/**
 * Build-time checks that a translation keeps what its English source
 * states — SPEC.md §7.5 (v1.13). CLAUDE.md rules 1 and 9 are the two whose
 * breach is silent, and a translation is the easiest place for one, so the
 * part a machine can check fails the build (rule 2). Every check throws.
 *
 * What is checked: digits (every number the English writes in digits is in
 * the translation; a number only the translation has must be explained),
 * shape (same keys, same list lengths, the same images), and the em dash
 * (rule 10). What isn't: number words ("six" → 六) and meaning, which is
 * Suyu's review.
 */

/** A number's English source word, for each number only the translation writes. */
export type ExtraNumbers = Readonly<Record<string, string>>;

const EM_DASH = "—";

/**
 * The digit runs in `text`, with thousands separators dropped so "1,181"
 * and "1181" count as one number. "16×20" is two, "C(12,8)" is one ("12,8").
 */
export function digitTokens(text: string): string[] {
  return [...text.matchAll(/\d+(?:[.,]\d+)*/g)].map((m) =>
    m[0].replace(/,(?=\d{3}(?!\d))/g, ""),
  );
}

export function assertSameNumbers(
  en: string,
  translated: string,
  where: string,
  extra: ExtraNumbers = {},
): void {
  const pool = digitTokens(translated);
  const missing: string[] = [];
  for (const token of digitTokens(en)) {
    const i = pool.indexOf(token);
    if (i === -1) missing.push(token);
    else pool.splice(i, 1);
  }
  const unexplained = pool.filter((token) => !(token in extra));
  if (missing.length > 0 || unexplained.length > 0) {
    throw new Error(
      `${where}: the translation's numbers don't match the English.` +
        (missing.length > 0 ? ` Missing: ${missing.join(", ")}.` : "") +
        (unexplained.length > 0
          ? ` Only in the translation: ${unexplained.join(", ")} (if each renders an English word, say which in its extra numbers).`
          : ""),
    );
  }
  const unused = Object.keys(extra).filter((token) => !pool.includes(token));
  if (unused.length > 0) {
    throw new Error(`${where}: extra numbers ${unused.join(", ")} are listed but not used; remove them.`);
  }
}

/**
 * Rule 10 for translated copy: no em dash, apart from text the caller
 * names (a fixed sentence quoted verbatim, a "Suyu — …" name separator).
 */
export function assertNoEmDash(
  translated: string,
  where: string,
  allowed: readonly string[] = [],
): void {
  let text = translated;
  for (const phrase of allowed) text = text.split(phrase).join("");
  if (text.includes(EM_DASH)) {
    throw new Error(`${where}: an em dash (—) in translated copy (CLAUDE.md rule 10); use a full-width colon, comma or parentheses.`);
  }
}

/** True for a statically imported image, which every locale shares. */
function isImage(value: object): boolean {
  return "src" in value && "width" in value && "height" in value;
}

/**
 * Walks an English copy object and its translation in step: each string
 * pair through the number and em-dash checks, lists the same length, keys
 * the same, images the very same import. `extras` maps a string's path
 * ("about.bio.1") to the numbers only its translation writes; `nameSeparated`
 * lists the paths whose strings may open with "Suyu — ".
 */
export function assertTranslatedCopy(
  en: unknown,
  translated: unknown,
  where: string,
  options: {
    extras?: Readonly<Record<string, ExtraNumbers>>;
    nameSeparated?: readonly string[];
  } = {},
  at = "",
): void {
  const here = at === "" ? where : `${where}: ${at}`;
  const child = (key: string | number) => (at === "" ? String(key) : `${at}.${key}`);

  if (typeof en === "string") {
    if (typeof translated !== "string") throw new Error(`${here} is not a string in the translation`);
    assertSameNumbers(en, translated, here, options.extras?.[at]);
    const separator = options.nameSeparated?.includes(at) ? ["Suyu — "] : [];
    assertNoEmDash(translated, here, separator);
    return;
  }
  if (Array.isArray(en)) {
    if (!Array.isArray(translated) || translated.length !== en.length) {
      throw new Error(`${here}: the translation has a different number of entries`);
    }
    en.forEach((item, i) => assertTranslatedCopy(item, translated[i], where, options, child(i)));
    return;
  }
  if (typeof en === "object" && en !== null) {
    if (typeof translated !== "object" || translated === null) {
      throw new Error(`${here} is missing from the translation`);
    }
    if (isImage(en)) {
      if (en !== translated) throw new Error(`${here}: the translation shows a different image`);
      return;
    }
    const enKeys = Object.keys(en).sort();
    const translatedKeys = Object.keys(translated).sort();
    if (enKeys.join("\0") !== translatedKeys.join("\0")) {
      throw new Error(`${here}: keys differ (${enKeys.join(", ")} vs ${translatedKeys.join(", ")})`);
    }
    for (const key of enKeys) {
      assertTranslatedCopy(
        (en as Record<string, unknown>)[key],
        (translated as Record<string, unknown>)[key],
        where,
        options,
        child(key),
      );
    }
    return;
  }
  if (en !== translated) throw new Error(`${here}: ${String(en)} became ${String(translated)}`);
}
