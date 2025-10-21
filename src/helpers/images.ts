import { getImage, type ImageMetadata } from "astro:assets";

const DEFAULT_WIDTHS = [480, 840, 1280] as const;
const DEFAULT_FORMATS = ["avif", "webp"] as const;

const resolveStaticPath = (imagePath: string) => {
  if (!imagePath.startsWith("/")) {
    return null;
  }

  return new URL(`../../public${imagePath}`, import.meta.url);
};

type GetCoverOptions = {
  widths?: number[];
  formats?: string[];
};

export const getOptimizedImage = async (
  imagePath: string | undefined,
  { widths = DEFAULT_WIDTHS, formats = DEFAULT_FORMATS }: GetCoverOptions = {},
) => {
  if (!imagePath) {
    return null;
  }

  const resolved = resolveStaticPath(imagePath);
  if (!resolved) {
    return null;
  }

  try {
    const result = await getImage({
      src: resolved as ImageMetadata | URL,
      widths,
      formats,
    });

    return result;
  } catch {
    return null;
  }
};
