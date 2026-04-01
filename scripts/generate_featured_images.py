#!/usr/bin/env python3
"""
generate_featured_images.py — gregmaxfield-site
================================================
Scans blog content for posts missing a heroImage frontmatter field and
generates a featured image via Imagen 4 for each.

Usage:
    python scripts/generate_featured_images.py
    python scripts/generate_featured_images.py --dry-run
    python scripts/generate_featured_images.py --api-key YOUR_KEY

Generated images are saved to src/assets/images/blog/ so Astro's
image optimization pipeline can process them.

Dependencies: google-genai, Pillow
"""

import argparse
import io
import os
import re
import sys
from pathlib import Path

from google import genai
from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SITE_ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = SITE_ROOT / "src" / "content" / "blog"
OUTPUT_DIR = SITE_ROOT / "src" / "assets" / "images" / "blog"
IMAGEN_MODEL = "imagen-4.0-generate-001"
DEFAULT_API_KEY_ENV = "GEMINI_API_KEY"

# Image dimensions — 1020x510 matches BlogPost.astro's <Image width={1020} height={510}>
IMG_WIDTH = 1020
IMG_HEIGHT = 510


def parse_frontmatter(filepath: Path) -> dict:
    """Extract YAML frontmatter from a markdown file."""
    text = filepath.read_text(encoding="utf-8")
    match = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return {}
    fm = {}
    for line in match.group(1).split("\n"):
        if ":" in line:
            key, val = line.split(":", 1)
            fm[key.strip()] = val.strip().strip('"').strip("'")
    return fm


def scan_posts_missing_hero() -> list[dict]:
    """Find blog posts that don't have a heroImage in frontmatter."""
    missing = []
    if not CONTENT_DIR.exists():
        print(f"  Content directory not found: {CONTENT_DIR}")
        return missing
    for md_file in sorted(
        list(CONTENT_DIR.glob("**/*.md")) + list(CONTENT_DIR.glob("**/*.mdx"))
    ):
        fm = parse_frontmatter(md_file)
        if not fm.get("heroImage"):
            missing.append({
                "file": md_file,
                "title": fm.get("title", md_file.stem),
                "description": fm.get("description", ""),
                "slug": md_file.stem,
            })
    return missing


def generate_hero_image(title: str, description: str, api_key: str) -> Image.Image:
    """Generate a featured image using Imagen 4 based on post content."""
    prompt = (
        f"Professional author website hero image for a blog post titled "
        f"'{title}'. Cinematic wide shot, elegant and literary, "
        f"muted earth tones with dramatic lighting, no text overlays, "
        f"no people's faces, atmospheric and evocative. "
        f"Context: {description[:200]}"
    )
    client = genai.Client(api_key=api_key)
    response = client.models.generate_images(
        model=IMAGEN_MODEL,
        prompt=prompt,
        config=genai.types.GenerateImagesConfig(
            number_of_images=1,
            aspect_ratio="16:9",
            output_mime_type="image/png",
        ),
    )
    if not response.generated_images:
        raise RuntimeError(f"Imagen returned no images for '{title}'")
    img_bytes = response.generated_images[0].image.image_bytes
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    return img.resize((IMG_WIDTH, IMG_HEIGHT), Image.LANCZOS)


def main():
    parser = argparse.ArgumentParser(
        description="Generate featured images for blog posts missing heroImage"
    )
    parser.add_argument("--api-key", default=None, help="Gemini API key")
    parser.add_argument(
        "--dry-run", action="store_true",
        help="List posts that need images without generating",
    )
    args = parser.parse_args()

    api_key = args.api_key or os.environ.get(DEFAULT_API_KEY_ENV)
    if not api_key and not args.dry_run:
        print(f"Error: No API key. Pass --api-key or set {DEFAULT_API_KEY_ENV}")
        sys.exit(1)

    print("Scanning blog posts for missing heroImage...")
    missing = scan_posts_missing_hero()

    if not missing:
        print("All posts have hero images. Nothing to do.")
        return

    print(f"Found {len(missing)} post(s) missing heroImage:\n")
    for post in missing:
        print(f"  - {post['title']} ({post['file'].name})")

    if args.dry_run:
        print("\n(Dry run — no images generated)")
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    generated = []

    for post in missing:
        output_path = OUTPUT_DIR / f"{post['slug']}-hero.png"
        if output_path.exists():
            print(f"\n  Skipping {post['slug']} — image already exists")
            continue
        print(f"\n  Generating image for: {post['title']}...")
        try:
            img = generate_hero_image(post["title"], post["description"], api_key)
            img.save(str(output_path), "PNG", optimize=True)
            size_kb = output_path.stat().st_size // 1024
            print(f"  Saved: {output_path.relative_to(SITE_ROOT)} ({size_kb} KB)")
            generated.append(post["slug"])
        except Exception as e:
            print(f"  ERROR generating for {post['slug']}: {e}")

    # Summary
    print(f"\n{'='*50}")
    print(f"Generated {len(generated)} image(s).")
    if generated:
        print("\nNext steps:")
        print("  1. Review generated images in src/assets/images/blog/")
        print("  2. Add heroImage to each post's frontmatter, e.g.:")
        print('     heroImage: "../../../assets/images/blog/<slug>-hero.png"')
        print("  3. Rebuild the site: npm run build")
    print(f"\nEstimated API cost: ~${len(generated) * 0.04:.2f}")


if __name__ == "__main__":
    main()
