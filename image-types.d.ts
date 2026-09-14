// Module types for static image imports, such as the photos in
// lib/siteContent.ts (`import portrait from "@/public/photos/portrait.jpg"`).
// next-env.d.ts carries the same reference, but it is gitignored and only
// exists once `next build` has run, while CI runs `npm run typecheck` before
// the build. Without this file the imports fail there with TS2307.
/// <reference types="next/image-types/global" />
