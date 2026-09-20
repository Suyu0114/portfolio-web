# Notice

## What the MIT licence covers

[`LICENSE`](LICENSE) applies to the **source code** of this repository:
everything under `app/`, `components/`, `lib/`, `scripts/`, `supabase/`,
and the configuration at the repository root. Take it, learn from it,
reuse it.

## What it does not cover

The following are **all rights reserved**. They are published so the
work can be read, not so it can be reused:

| Path | What it is |
|---|---|
| `public/photos/*` | Personal photographs, including a portrait |
| `public/resume.pdf` | A résumé |
| `content/*.mdx` | Case-study writing |
| `content/chatbot/*.md` | Biographical notes used as the assistant's knowledge base |
| `lib/siteContent.ts` | Site copy (the prose constants, not the code around them) |
| `public/screens/*` | Screenshots of other projects |

The hand-drawn visual identity (the paper palette, the sketch borders,
the wobble and doodle treatments) is also reserved. The code that draws
it is MIT; the design itself is not offered for reuse.

If you want to use any of it, just ask.

## Third-party material

Dependencies keep their own licences. The direct ones are MIT, with two
exceptions worth naming:

- `@google/genai` and `typescript` are Apache-2.0.
- `next-mdx-remote` is MPL-2.0. MPL-2.0 is per-file copyleft, so it
  reaches only its own files and not the source in this repository.

Fonts are loaded through `next/font/google`. Caveat and JetBrains Mono
are both SIL Open Font License 1.1.

`public/screens/bluejays-fan-web-*.png` are screenshots of
[BlueJaysFanWeb](https://github.com/Suyu0114/BlueJaysFanWeb), a personal
project built on public Statcast data from Baseball Savant. That project
is not affiliated with, endorsed by, or sponsored by Major League
Baseball or the Toronto Blue Jays. Team names, logos and player imagery
visible in those screenshots remain the property of their owners.
