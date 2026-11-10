#!/usr/bin/env python3
"""Generate PWA icons for Kettlebell Workouts (amber bell on dark slate)."""
from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'icons')
os.makedirs(OUT, exist_ok=True)


def kb_master(size=512):
    s = size / 512.0
    img = Image.new('RGBA', (size, size), (15, 23, 42, 255))
    d = ImageDraw.Draw(img)
    cx, cy = 256 * s, 298 * s          # bell center
    r = 96 * s                          # bell radius
    # handle: upper-half arc thick stroke
    hw, top, bot = 74 * s, cy - 150 * s, cy - 30 * s
    d.arc([cx - hw, top, cx + hw, bot], start=180, end=360, fill=(251, 191, 36), width=int(30 * s))
    # bell body
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(251, 191, 36))
    # highlight
    hr = 26 * s
    d.ellipse([cx - r * 0.45 - hr, cy - r * 0.45 - hr, cx - r * 0.45 + hr, cy - r * 0.45 + hr], fill=(253, 230, 138))
    return img


m = kb_master(512)
m.save(os.path.join(OUT, 'icon-512.png'))
m.resize((192, 192), Image.LANCZOS).save(os.path.join(OUT, 'icon-192.png'))
m.resize((180, 180), Image.LANCZOS).save(os.path.join(OUT, 'apple-touch-icon.png'))
print('icons written to', os.path.abspath(OUT))
