"""Remove light backgrounds from product images -> transparent PNG."""
import json
import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "images" / "products"
OUT_DIR = ROOT / "images" / "products" / "nobg"
DATA = ROOT / "data" / "products.json"

THRESHOLD = 232
FEATHER = 18


def remove_background(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            brightness = (r + g + b) / 3
            if brightness >= THRESHOLD:
                pixels[x, y] = (r, g, b, 0)
            elif brightness >= THRESHOLD - FEATHER:
                alpha = int((brightness - (THRESHOLD - FEATHER)) / FEATHER * 255)
                pixels[x, y] = (r, g, b, 255 - alpha)
    return img


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    exts = {".jpg", ".jpeg", ".png", ".webp"}
    files = [f for f in SRC_DIR.iterdir() if f.is_file() and f.suffix.lower() in exts and f.parent == SRC_DIR]

    mapping = {}
    done = 0
    for src in files:
        out_name = src.stem + ".png"
        out_path = OUT_DIR / out_name
        if not out_path.exists():
            try:
                img = Image.open(src)
                remove_background(img).save(out_path, "PNG", optimize=True)
            except Exception as e:
                print(f"FAIL {src.name}: {e}")
                continue
        mapping[src.stem] = f"images/products/nobg/{out_name}"
        done += 1
        if done % 50 == 0:
            print(f"  {done}/{len(files)}")

    if DATA.exists():
        data = json.loads(DATA.read_text(encoding="utf-8"))
        updated = 0
        for p in data.get("products", []):
            img_path = p.get("image", "")
            stem = Path(img_path).stem
            if stem in mapping:
                p["image"] = mapping[stem]
                updated += 1
        data["imagesProcessed"] = done
        DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Updated {updated} product image paths in products.json")

    print(f"Done — {done} transparent PNGs in {OUT_DIR}")


if __name__ == "__main__":
    main()
