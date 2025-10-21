import fs from "node:fs/promises";
import { clearGeneratedAssets, listGeneratedAssets } from "./thumbnail-registry.mjs";

const toForwardSlash = (value) => value.replace(/\\/g, "/");

const thumbnailsIntegration = () => ({
  name: "remark-thumbnails-static-assets",
  hooks: {
    "astro:config:setup": ({ updateConfig }) => {
      updateConfig({
        vite: {
          plugins: [
            {
              name: "remark-thumbnails-static-assets-emitter",
              apply: "build",
              async generateBundle() {
                const assets = listGeneratedAssets();
                const seen = new Set();

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
                  } catch (error) {
                    const message =
                      error instanceof Error ? error.message : String(error);
                    this.warn(`remark-thumbnails: failed to include ${fileName}: ${message}`);
                  }
                }
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
