import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import remarkThumbnails from "./src/plugins/remark-thumbnails.mjs";
import thumbnailsIntegration from "./src/plugins/thumbnails-integration.mjs";
import coversIntegration from "./src/plugins/covers-integration.mjs";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

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
      remarkPlugins: [remarkThumbnails, remarkMath],
      rehypePlugins: [rehypeKatex],
      extendMarkdownConfig: true,
    }),
    sitemap(),
    react(),
    thumbnailsIntegration(),
    coversIntegration(),
  ],
  output: "static",
  markdown: {
    remarkPlugins: [remarkThumbnails, remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  images: {
    sharp: {
      quality: 75,
      format: 'webp',
    },
  },
});
