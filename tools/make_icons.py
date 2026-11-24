#!/usr/bin/env python3
"""Generate PWA icons for Kettlebell Workouts.

Design: amber kettlebell on a dark slate rounded tile.
Output: icon-512.png, icon-192.png, apple-touch-icon.png (180x180, opaque).
"""
from PIL import Image, ImageDraw, ImageFilter
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'icons')
os.makedirs(OUT, exist_ok=True)


def kb_master(size=512, cy_offset=0.0, tile=True):
    s = size / 512.0
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ins, rad = (14 * s, 104 * s) if tile else (0.0, 0.0)

    # slate rounded-tile with a subtle vertical gradient
    grad = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    top_rgb = (38, 53, 88, 255)
    bot_rgb = (12, 19, 36, 255)
    for y in range(size):
        u = y / (size - 1)
        r = int(top_rgb[0] + (bot_rgb[0] - top_rgb[0]) * u)
        g = int(top_rgb[1] + (bot_rgb[1] - top_rgb[1]) * u)
        b = int(top_rgb[2] + (bot_rgb[2] - top_rgb[2]) * u)
        gd.line([(0, y), (size, y)], fill=(r, g, b, 255))
    mask = Image.new('L', (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([ins, ins, size - ins, size - ins], radius=rad, fill=255)
    img.paste(grad, (0, 0), mask)

    d = ImageDraw.Draw(img)
    cx, cy = 256 * s, (312 * s + cy_offset * s)
    r = 96 * s

    # handle band (tips tucked behind the body)
    hw = 76 * s
    bot = cy - 24 * s
    top = bot - 148 * s
    band = 30 * s
    d.arc([cx - hw, top, cx + hw, bot], start=180, end=360, fill=(251, 191, 36, 255), width=int(band))

    # bell body (drawn over the handle tips)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(251, 191, 36, 255))

    # handle inner shadow line
    d.arc([cx - hw, top, cx + hw, bot], start=200, end=340, fill=(217, 154, 24, 255), width=int(9 * s))

    # rim light along the top edge of the bell
    d.arc([cx - r * 0.82, cy - r * 0.92, cx + r * 0.82, cy + r * 0.08], start=205, end=335,
          fill=(253, 230, 138, 255), width=int(10 * s))

    # highlight
    hr = 20 * s
    d.ellipse([cx - r * 0.42 - hr, cy - r * 0.40 - hr, cx - r * 0.42 + hr, cy - r * 0.40 + hr],
              fill=(253, 243, 203, 255))

    # soft floor shadow under the bell (clipped to the tile)
    floor = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(floor).ellipse([cx - r * 0.80, cy + r * 0.62, cx + r * 0.80, cy + r * 1.38],
                                  fill=(0, 0, 0, 120))
    floor = floor.filter(ImageFilter.GaussianBlur(14 * s))
    img.paste(floor, (0, 0), Image.composite(floor.split()[3], Image.new('L', (size, size), 0), mask))

    return img


m = kb_master(512)
m.save(os.path.join(OUT, 'icon-512.png'))
m.resize((192, 192), Image.LANCZOS).save(os.path.join(OUT, 'icon-192.png'))

# maskable: full-bleed, opaque, glyph centered in the safe zone
mm = kb_master(512, cy_offset=-40.0, tile=False)
bg = Image.new('RGBA', (512, 512), (15, 23, 42, 255))
mask = Image.new('L', (512, 512), 255)
mm = Image.composite(mm, bg, mask)
mm.save(os.path.join(OUT, 'icon-maskable-512.png'))

# apple-touch-icon: opaque tile, no transparent margins
apple = Image.new('RGBA', (180, 180), (15, 23, 42, 255))
scaled = m.resize((180, 180), Image.LANCZOS)
apple.paste(scaled, (0, 0), scaled)
apple.convert('RGB').save(os.path.join(OUT, 'apple-touch-icon.png'))
print('icons written to', os.path.abspath(OUT))
