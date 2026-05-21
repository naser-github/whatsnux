#!/usr/bin/env python3
"""Generate placeholder app icons for Whatsnux."""
from PIL import Image, ImageDraw
import os

SIZES = {
    'icon.png': 256,
    'icon-256.png': 256,
}

def create_icon(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background: rounded circle in WhatsApp-green-ish
    margin = size // 16
    circle_bbox = (margin, margin, size - margin, size - margin)
    draw.ellipse(circle_bbox, fill=(0, 168, 132, 255))

    # Letter "W" as a simple shape
    center = size // 2
    stroke_width = max(size // 16, 2)
    w_size = size // 3
    left = center - w_size
    right = center + w_size
    top = center - w_size // 2
    bottom = center + w_size // 2

    # Draw a simplified "W" using filled ellipses
    dot_radius = stroke_width
    # Four points of the W
    points = [
        (left, bottom),       # bottom-left
        (left + w_size//3, top),  # upper-left-middle
        (center, center),      # center dip
        (right - w_size//3, top), # upper-right-middle
        (right, bottom),       # bottom-right
    ]
    for px, py in points:
        draw.ellipse(
            [px - dot_radius, py - dot_radius, px + dot_radius, py + dot_radius],
            fill=(255, 255, 255, 255)
        )

    return img

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(script_dir, '..', 'assets', 'icons')
    os.makedirs(assets_dir, exist_ok=True)

    for filename, size in SIZES.items():
        img = create_icon(size)
        filepath = os.path.join(assets_dir, filename)
        img.save(filepath, 'PNG')
        print(f"Created {filepath} ({size}x{size})")

    # Also create a tray icon (smaller, simpler)
    tray_size = 22
    tray_img = Image.new('RGBA', (tray_size, tray_size), (0, 0, 0, 0))
    tray_draw = ImageDraw.Draw(tray_img)
    tray_draw.ellipse(
        [1, 1, tray_size - 2, tray_size - 2],
        fill=(0, 168, 132, 255)
    )
    tray_path = os.path.join(assets_dir, '..', 'tray', 'tray.png')
    os.makedirs(os.path.dirname(tray_path), exist_ok=True)
    tray_img.save(tray_path, 'PNG')
    print(f"Created {tray_path} ({tray_size}x{tray_size})")

if __name__ == '__main__':
    main()