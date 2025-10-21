import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clearGeneratedAssets, listGeneratedAssets } from "./thumbnail-registry.mjs";

const toForwardSlash = (value) => value.replace(/\\/g, "/");
const projectRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const contentBlogDir = path.join(projectRoot, "src", "content", "blog");

const thumbnailsIntegration = () => ({
  name: "remark-thumbnails-static-assets",
  hooks: {
    "astro:config:setup": ({ updateConfig, command }) => {
      updateConfig({
        vite: {
          plugins: [
            {
              name: "remark-thumbnails-static-assets-emitter",
              apply: "build",
              async buildStart() {
                // Pre-scan all .md files and trigger thumbnail generation by importing
                // the remark plugin dynamically and processing the files
                if (command === "build") {
                  console.log("[remark-thumbnails] Pre-generating thumbnails from .md files...");
                  try {
                    // Dynamically import the thumbnail generator
                    const { default: remarkThumbnails } = await import("./remark-thumbnails.mjs");
                    // Import unified/remark from node_modules
                    const { remark } = await import("remark");
                    
                    const files = await fs.readdir(contentBlogDir);
                    const mdFiles = files.filter(f => f.endsWith(".md"));
                    const processor = remark().use(remarkThumbnails);
                    
                    let processed = 0;
                    for (const file of mdFiles) {
                      const filePath = path.join(contentBlogDir, file);
                      try {
                        const content = await fs.readFile(filePath, "utf-8");
                        // Process through remark to trigger thumbnail generation
                        await processor.process({ value: content, path: filePath, history: [filePath] });
                        processed++;
                      } catch (err) {
                        console.warn(`[remark-thumbnails] Failed to process ${file}:`, err.message);
                      }
                    }
                    console.log(`[remark-thumbnails] Pre-processed ${processed} .md files`);
                    
                    const assetsCount = listGeneratedAssets().length;
                    console.log(`[remark-thumbnails] Total assets registered: ${assetsCount}`);
                  } catch (error) {
                    console.error("[remark-thumbnails] Error during pre-processing:", error);
                  }
                }
              },
              // Try to emit whatever assets exist at bundle time. Some assets may be generated
              // later in the build process, so we also emit again in buildEnd.
              async generateBundle() {
                const assets = listGeneratedAssets();
                const seen = new Set();
                let emitted = 0;

                for (const asset of assets) {
                  const { absolutePath, publicPath } = asset;
                  if (!absolutePath || !publicPath) {
                    continue;
                  }

                  const fileName = toForwardSlash(publicPath.replace(/^\/+/, ""));
                  if (seen.has(fileName)) {
                    continue;
                  }

                  try {
                    const source = await fs.readFile(absolutePath);
                    this.emitFile({
                      type: "asset",
                      fileName,
                      source,
                    });
                    seen.add(fileName);
                    emitted++;
                  } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    this.warn(`remark-thumbnails: failed to include ${fileName}: ${message}`);
                  }
                }

                this.info && this.info(`remark-thumbnails: generateBundle emitted ${emitted} assets`);
              },
              async buildEnd() {
                // Emit again at build end to catch assets generated late in the pipeline.
                const assets = listGeneratedAssets();
                const seen = new Set();
                let emitted = 0;

                for (const asset of assets) {
                  const { absolutePath, publicPath } = asset;
                  if (!absolutePath || !publicPath) continue;
                  const fileName = toForwardSlash(publicPath.replace(/^\/+/, ""));
                  if (seen.has(fileName)) continue;
                  try {
                    const source = await fs.readFile(absolutePath);
                    this.emitFile({ type: "asset", fileName, source });
                    seen.add(fileName);
                    emitted++;
                  } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    this.warn(`remark-thumbnails: buildEnd failed to include ${fileName}: ${message}`);
                  }
                }

                this.info && this.info(`remark-thumbnails: buildEnd emitted ${emitted} assets`);
              },
              closeBundle() {
                clearGeneratedAssets();
              },
            },
          ],
        },
      });
    },
  },
});

export default thumbnailsIntegration;
