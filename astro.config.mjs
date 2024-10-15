import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: "https://skoomaden.me",
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
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
});
