#!/usr/bin/env python3
import argparse
import pathlib
from typing import Iterable

from PIL import Image, ImageOps


def process_image(path: pathlib.Path, max_width: int, quality: int) -> bool:
    """Resize `path` in-place if it exceeds `max_width`. Return True when updated."""
    with Image.open(path) as base_img:
        img = ImageOps.exif_transpose(base_img)

        if img.width <= max_width:
            return False

        ratio = max_width / float(img.width)
        new_size = (max_width, int(img.height * ratio))
        resized = img.resize(new_size, Image.Resampling.LANCZOS)

        suffix = path.suffix.lower()
        if suffix in {".jpg", ".jpeg"}:
            output = resized.convert("RGB")
            output.save(path, format="JPEG", quality=quality, optimize=True, progressive=True)
        else:
            # Preserve alpha for PNGs.
            if "A" in resized.getbands():
                output = resized.convert("RGBA")
            else:
                output = resized.convert("RGB")
            output.save(path, format="PNG", optimize=True, compress_level=9)

        return True


def iter_images(root: pathlib.Path, exts: Iterable[str]) -> Iterable[pathlib.Path]:
    for entry in root.rglob("*"):
        if entry.is_file() and entry.suffix.lower() in exts:
            yield entry


def main() -> None:
    parser = argparse.ArgumentParser(description="Resize large blog images in-place.")
    parser.add_argument(
        "--root",
        default="src/content/blog",
        type=pathlib.Path,
        help="Root directory to scan for images.",
    )
    parser.add_argument(
        "--max-width",
        default=1600,
        type=int,
        help="Maximum width for images (pixels).",
    )
    parser.add_argument(
        "--quality",
        default=80,
        type=int,
        help="Output quality for JPEG/WebP.",
    )
    parser.add_argument(
        "--extensions",
        nargs="+",
        default=[".jpg", ".jpeg", ".png"],
        help="File extensions to process.",
    )
    args = parser.parse_args()

    updated = 0
    extensions = {ext.lower() for ext in args.extensions}
    for image_path in iter_images(args.root, extensions):
        try:
            if process_image(image_path, args.max_width, args.quality):
                print(f"Resized {image_path}")
                updated += 1
        except Exception as exc:
            print(f"Skipping {image_path}: {exc}")

    print(f"Done. Updated {updated} file(s).")


if __name__ == "__main__":
    main()
