import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");

// Configuration
const MAX_WIDTH = 1200;
const WEBP_QUALITY = 85;

export default function coversIntegration() {
  const coversDir = path.join(projectRoot, "public", "covers");
  const contentDir = path.join(projectRoot, "src", "content", "blog");
  const processedCovers = new Set();

  return {
    name: "covers-optimization",
    hooks: {
      "astro:config:setup": () => {
        console.log("🖼️  Cover optimization plugin loaded");
      },
      "astro:build:start": async () => {
        console.log("\n🖼️  Optimizing cover images...");
        await optimizeCovers(coversDir, processedCovers);
        console.log("📝 Updating markdown cover references...");
        await updateMarkdownReferences(contentDir);
      },
      "astro:server:setup": async () => {
        // Also optimize in dev mode on first run
        await optimizeCovers(coversDir, processedCovers);
        await updateMarkdownReferences(contentDir);
      },
    },
  };
}

async function optimizeCovers(coversDir, processedCovers) {
  try {
    const files = await fs.readdir(coversDir);
    const imageFiles = files.filter(
      (f) => /\.(jpg|jpeg|png|gif|avif|tiff|webp)$/i.test(f) && !f.startsWith("_temp_")
    );

    if (imageFiles.length === 0) {
      console.log("   ✓ No covers to optimize");
      return;
    }

    let optimized = 0;
    let skipped = 0;

    for (const file of imageFiles) {
      const inputPath = path.join(coversDir, file);
      const ext = path.extname(file).toLowerCase();
      const baseName = path.basename(file, ext);

      // Skip if already processed in this session
      if (processedCovers.has(inputPath)) {
        skipped++;
        continue;
      }

      // Determine if we should convert to WebP
      const shouldConvert = ext !== ".webp";
      const outputPath = shouldConvert 
        ? path.join(coversDir, `${baseName}.webp`)
        : inputPath;

      // For conversions, check if WebP exists and is newer than source
      if (shouldConvert) {
        try {
          const [sourceStats, webpStats] = await Promise.all([
            fs.stat(inputPath),
            fs.stat(outputPath).catch(() => null),
          ]);

          // Skip if WebP exists and is newer
          if (webpStats && webpStats.mtime >= sourceStats.mtime) {
            processedCovers.add(inputPath);
            skipped++;
            continue;
          }
        } catch (e) {
          // WebP doesn't exist, we'll create it
        }
      } else {
        // For existing WebP files, check if they need re-optimization
        // Skip re-optimization to avoid unnecessary processing
        skipped++;
        continue;
      }

      // Process the image
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      // Resize if needed
      if (metadata.width > MAX_WIDTH) {
        image.resize(MAX_WIDTH, null, {
          withoutEnlargement: true,
          fit: "inside",
        });
      }

      // Convert to WebP
      await image.webp({ quality: WEBP_QUALITY }).toFile(outputPath);
      
      const action = ext === ".webp" ? "Optimized" : `${file} → ${baseName}.webp`;
      console.log(`   ✓ ${action}`);

      processedCovers.add(inputPath);
      optimized++;
    }

    if (optimized > 0) {
      console.log(`   🎉 Converted ${optimized} cover(s) to WebP, skipped ${skipped}\n`);
    } else {
      console.log(`   ✓ All covers already converted (${skipped} checked)\n`);
    }
  } catch (error) {
    console.error("   ❌ Error optimizing covers:", error.message);
  }
}

async function updateMarkdownReferences(contentDir) {
  try {
    const files = await fs.readdir(contentDir);
    const mdFiles = files.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

    let updated = 0;

    for (const file of mdFiles) {
      const filePath = path.join(contentDir, file);
      let content = await fs.readFile(filePath, "utf-8");
      let modified = false;

      // Replace cover references: /covers/something.png or .jpg or .jpeg → .webp
      const newContent = content.replace(
        /cover:\s*["']?(\/covers\/[^"'\s]+)\.(png|jpg|jpeg)["']?/gi,
        (match, _coverPath, ext) => {
          modified = true;
          return match.replace(`.${ext}`, ".webp");
        }
      );

      if (modified) {
        await fs.writeFile(filePath, newContent, "utf-8");
        updated++;
      }
    }

    if (updated > 0) {
      console.log(`   ✓ Updated ${updated} markdown file(s) to use .webp covers\n`);
    } else {
      console.log(`   ✓ All markdown files already use .webp references\n`);
    }
  } catch (error) {
    console.error("   ❌ Error updating markdown references:", error.message);
  }
}
