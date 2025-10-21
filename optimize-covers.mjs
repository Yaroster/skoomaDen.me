import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coversDir = path.join(__dirname, "public", "covers");
const backupDir = path.join(__dirname, "public", "covers-backup");

// Configuration
const MAX_WIDTH = 1200; // Max width in pixels
const WEBP_QUALITY = 85; // WebP quality (0-100)
const JPEG_QUALITY = 90; // JPEG quality for files that should stay as JPEG

async function optimizeCovers() {
  try {
    // Create backup directory
    await fs.mkdir(backupDir, { recursive: true });
    console.log(`📁 Created backup directory: ${backupDir}\n`);

    // Get all image files
    const files = await fs.readdir(coversDir);
    const imageFiles = files.filter((f) =>
      /\.(jpg|jpeg|png|webp)$/i.test(f)
    );

    console.log(`🖼️  Found ${imageFiles.length} images to optimize\n`);

    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    for (const file of imageFiles) {
      const inputPath = path.join(coversDir, file);
      const backupPath = path.join(backupDir, file);
      const ext = path.extname(file).toLowerCase();
      const baseName = path.basename(file, ext);
      
      // Backup original
      await fs.copyFile(inputPath, backupPath);

      // Get original size
      const originalStats = await fs.stat(inputPath);
      totalOriginalSize += originalStats.size;

      // Decide output format (convert PNG to WebP, optimize JPEG/WebP)
      const shouldConvertToWebP = ext === ".png";
      const outputExt = shouldConvertToWebP ? ".webp" : ext;
      const outputPath = path.join(coversDir, `${baseName}${outputExt}`);

      // Process image
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      // Resize if needed
      if (metadata.width > MAX_WIDTH) {
        image.resize(MAX_WIDTH, null, {
          withoutEnlargement: true,
          fit: "inside",
        });
      }

      // Convert/optimize based on format
      if (shouldConvertToWebP) {
        // PNG → WebP: output to new file
        await image.webp({ quality: WEBP_QUALITY }).toFile(outputPath);
      } else if (ext === ".jpg" || ext === ".jpeg") {
        // JPEG: optimize to temp, then replace
        const tempPath = path.join(coversDir, `_temp_${baseName}${ext}`);
        await image.jpeg({ quality: JPEG_QUALITY, progressive: true }).toFile(tempPath);
        await fs.copyFile(tempPath, outputPath);
        await fs.unlink(tempPath);
      } else if (ext === ".webp") {
        // WebP: optimize to temp, then replace
        const tempPath = path.join(coversDir, `_temp_${baseName}${ext}`);
        await image.webp({ quality: WEBP_QUALITY }).toFile(tempPath);
        await fs.copyFile(tempPath, outputPath);
        await fs.unlink(tempPath);
      }

      // Get new size
      const optimizedStats = await fs.stat(outputPath);
      totalOptimizedSize += optimizedStats.size;

      const savedBytes = originalStats.size - optimizedStats.size;
      const savedPercent = ((savedBytes / originalStats.size) * 100).toFixed(1);

      console.log(
        `✅ ${file} → ${baseName}${outputExt}`,
        `\n   ${(originalStats.size / 1024).toFixed(1)}KB → ${(
          optimizedStats.size / 1024
        ).toFixed(1)}KB`,
        `(saved ${savedPercent}%)`
      );
    }

    const totalSaved = totalOriginalSize - totalOptimizedSize;
    const totalSavedPercent = ((totalSaved / totalOriginalSize) * 100).toFixed(
      1
    );

    console.log(`\n🎉 Optimization complete!`);
    console.log(
      `   Original: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(
      `   Optimized: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(
      `   Saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB (${totalSavedPercent}%)`
    );
    console.log(`\n💾 Originals backed up to: ${backupDir}`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

optimizeCovers();
