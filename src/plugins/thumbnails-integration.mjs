import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const publicRoot = path.join(projectRoot, "public");
const GENERATED_FOLDERS = ["articles/thumbnails", "articles/optimized"];

const copyFolder = async (fromDir, toDir) => {
  try {
    const stats = await fs.stat(fromDir);
    if (!stats.isDirectory()) {
      return false;
    }
  } catch {
    return false;
  }
  await fs.rm(toDir, { recursive: true, force: true });
  await fs.mkdir(path.dirname(toDir), { recursive: true });
  await fs.cp(fromDir, toDir, { recursive: true, force: true });
  return true;
};

const thumbnailsIntegration = () => ({
  name: "remark-thumbnails-static-assets",
  hooks: {
    "astro:build:done": async ({ dir, logger }) => {
      const outDir = fileURLToPath(dir);

      for (const relative of GENERATED_FOLDERS) {
        const sourceDir = path.join(publicRoot, relative);
        const targetDir = path.join(outDir, relative);

        const copied = await copyFolder(sourceDir, targetDir);
        if (copied) {
          const relSource = path.relative(projectRoot, sourceDir);
          const relTarget = path.relative(projectRoot, targetDir);
          logger.info(`[remark-thumbnails] copied ${relSource} -> ${relTarget}`);
        }
      }
    },
  },
});

export default thumbnailsIntegration;
