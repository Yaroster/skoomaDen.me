import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import remarkThumbnails from "./src/plugins/remark-thumbnails.mjs";
import thumbnailsIntegration from "./src/plugins/thumbnails-integration.mjs";

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
    thumbnailsIntegration(),
  ],
  output: "static",
  markdown: {
    remarkPlugins: [remarkThumbnails],
  },
  images: {
    sharp: {
      quality: 75,
      format: 'webp',
    },
  },
});
