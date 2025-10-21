import path from "node:path";

const assets = new Map();

const normalizePath = (value) => path.normalize(value);

export const registerGeneratedAsset = (absolutePath, publicPath) => {
  if (!absolutePath || !publicPath) return;
  const normalized = normalizePath(absolutePath);
  assets.set(normalized, {
    absolutePath: normalized,
    publicPath,
  });
};

export const listGeneratedAssets = () => Array.from(assets.values());

export const clearGeneratedAssets = () => {
  assets.clear();
};
