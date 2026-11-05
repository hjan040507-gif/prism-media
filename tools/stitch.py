#!/usr/bin/env python3
"""세로로 나눠 찍은 PNG 를 하나로 잇는다. 사용: python3 -I tools/stitch.py <out.png> <part0.png> <part1.png> ..."""
import sys
from PIL import Image

out, parts = sys.argv[1], sys.argv[2:]
imgs = [Image.open(p).convert('RGB') for p in parts]
w = max(i.width for i in imgs)
h = sum(i.height for i in imgs)
canvas = Image.new('RGB', (w, h), 'white')
y = 0
for i in imgs:
    canvas.paste(i, (0, y))
    y += i.height
canvas.save(out, optimize=True)
