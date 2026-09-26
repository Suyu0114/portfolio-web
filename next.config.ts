import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Resolve imports from Motion's barrel entries to the modules actually
    // used, so a page that uses `m` doesn't also ship every animation feature
    // at first load (SPEC §4.4, v1.11: features load after hydration).
    optimizePackageImports: ["motion", "framer-motion"],
  },
};

export default nextConfig;
