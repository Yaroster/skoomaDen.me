import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: "https://new-ui.com/templates/journal",
  trailingSlash: "never",

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },

  integrations: [
    mdx({
      syntaxHighlight: "shiki",
      shikiConfig: {
        theme: "github-light",
      },
    }),
    sitemap(),
    react(),
  ],

  output: "server",
  adapter: vercel(),
});