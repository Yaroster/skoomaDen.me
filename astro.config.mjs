import { defineConfig, sharpImageService } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import remarkEleventyImage from "astro-remark-eleventy-image";

export default defineConfig({
  site: "https://skoomaden.me",
  trailingSlash: "never",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  output: "static",
  integrations: [
    mdx({
      syntaxHighlight: "shiki",
      shikiConfig: {
        theme: "github-light",
      },
      remarkPlugins: [remarkEleventyImage],
    }),
    sitemap(),
    react(),
  ],
  vite: {
    ssr: {
      external: ["@11ty/eleventy-img"], // required for eleventy image SSR support
    },
  },
  images: {
    service: sharpImageService(),   // <-- add this line to enable sharp as image service
    sharp: {
      quality: 70,
      formats: ["avif", "webp"],
    },
  },
});
