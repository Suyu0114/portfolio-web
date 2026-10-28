import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Resolve imports from Motion's barrel entries to the modules actually
    // used, so a page that uses `m` doesn't also ship every animation feature
    // at first load (SPEC §4.4, v1.11: features load after hydration).
    optimizePackageImports: ["motion", "framer-motion"],
    // One root layout per locale (SPEC v1.13), so unmatched URLs need
    // app/global-not-found.tsx; there is no single layout to build it from.
    globalNotFound: true,
  },
};

export default nextConfig;
