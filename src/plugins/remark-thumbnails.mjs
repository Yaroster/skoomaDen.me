import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const publicRoot = path.join(projectRoot, "public");
const thumbnailsDir = path.join(publicRoot, "articles", "thumbnails");
const optimizedDir = path.join(publicRoot, "articles", "optimized");

const THUMBNAIL_WIDTH = 360;
const FULL_WIDTH = 1200;
const THUMBNAIL_QUALITY = 55;
const FULL_QUALITY = 70;
const WEBP_EFFORT = 5;

const cache = new Map();
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const existingFile = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const generateVariants = async (absolutePath) => {
  if (cache.has(absolutePath)) {
    return cache.get(absolutePath);
  }

  const { name } = path.parse(absolutePath);
  const sanitizedBase =
    name
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase() || "image";
  const hashInput = JSON.stringify({
    path: absolutePath,
    thumb: { width: THUMBNAIL_WIDTH, quality: THUMBNAIL_QUALITY },
    full: { width: FULL_WIDTH, quality: FULL_QUALITY },
  });
  const hash = createHash("md5").update(hashInput).digest("hex").slice(0, 8);
  const thumbFileName = `${sanitizedBase}-${hash}-thumb.webp`;
  const fullFileName = `${sanitizedBase}-${hash}-full.webp`;
  const thumbOutPath = path.join(thumbnailsDir, thumbFileName);
  const fullOutPath = path.join(optimizedDir, fullFileName);

  await ensureDir(thumbnailsDir);
  await ensureDir(optimizedDir);

  if (!(await existingFile(thumbOutPath))) {
    try {
      await sharp(absolutePath)
        .rotate()
        .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
        .webp({ quality: THUMBNAIL_QUALITY, effort: WEBP_EFFORT })
        .toFile(thumbOutPath);
    } catch {
      cache.set(absolutePath, null);
      return null;
    }
  }

  if (!(await existingFile(fullOutPath))) {
    try {
      await sharp(absolutePath)
        .rotate()
        .resize({ width: FULL_WIDTH, withoutEnlargement: true })
        .webp({ quality: FULL_QUALITY, effort: WEBP_EFFORT })
        .toFile(fullOutPath);
    } catch {
      cache.set(absolutePath, null);
      return null;
    }
  }

  const thumbPublicPath = `/articles/thumbnails/${thumbFileName}`;
  const fullPublicPath = `/articles/optimized/${fullFileName}`;

  const result = {
    thumb: thumbPublicPath,
    full: fullPublicPath,
  };

  cache.set(absolutePath, result);
  return result;
};

const decodeLocalUrl = (value) => {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
};

const resolveAbsolutePath = (nodeUrl, currentDir) => {
  if (nodeUrl.startsWith("/")) {
    return path.join(publicRoot, nodeUrl);
  }

  return path.resolve(currentDir, nodeUrl);
};

const walk = async (node, iteratee) => {
  await iteratee(node);

  if (Array.isArray(node?.children)) {
    for (const child of node.children) {
      await walk(child, iteratee);
    }
  }
};

const remarkThumbnails = () => async (tree, file) => {
  const currentPath = file?.path ?? (Array.isArray(file?.history) ? file.history[0] : undefined);
  if (!currentPath) return;

  const currentDir = path.dirname(currentPath);

  await walk(tree, async (node) => {
    if (!node || node.type !== "image" || !node.url) {
      return;
    }

    const rawSrc = node.url.trim();

    if (!rawSrc || /^https?:\/\//i.test(rawSrc) || rawSrc.startsWith("data:")) {
      return;
    }

    const decodedSrc = decodeLocalUrl(rawSrc);
    const absolutePath = resolveAbsolutePath(decodedSrc, currentDir);

    if (!(await existingFile(absolutePath))) {
      return;
    }

    if (!supportedExtensions.has(path.extname(absolutePath).toLowerCase())) {
      return;
    }

    const generated = await generateVariants(absolutePath);
    if (!generated) {
      return;
    }

    const { thumb, full } = generated;

    node.url = thumb;
    node.data = node.data ?? {};
    node.data.hProperties = {
      ...(node.data.hProperties ?? {}),
      src: thumb,
      "data-fullsrc": full,
      "data-thumbnail": "true",
    };
  });
};

export default remarkThumbnails;
