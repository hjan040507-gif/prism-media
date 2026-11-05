#!/usr/bin/env python3
"""프로젝트 폴더의 모든 캡처 PNG 를 축소해 contact.jpg 한 장으로 모은다.
사용: python3 -I tools/contact.py <project_dir>
- 대상: desktop/ mobile/ tablet/ states/ seq/(first·last) pdf/ 아래 PNG (media/ 는 제외)
- 칸: 가로 260px, 세로는 최대 520px(긴 전체 화면은 비율대로 줄여 칸 안에), 아래에 파일 경로
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

root = sys.argv[1]
SUBS = ['desktop', 'mobile', 'tablet', 'states', 'seq', 'pdf', 'admin']
files = []
for sub in SUBS:
    base = os.path.join(root, sub)
    for dp, _, fns in os.walk(base):
        for fn in sorted(fns):
            if fn.endswith('.png') and '.part' not in fn:
                files.append(os.path.join(dp, fn))
files.sort()
if not files:
    sys.exit('캡처 PNG 없음')

CW, CH, LH, COLS = 260, 520, 30, 10
font = None
for f in ['/usr/share/fonts/truetype/nanum/NanumGothic.ttf', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
    if os.path.exists(f):
        font = ImageFont.truetype(f, 11)
        break
font = font or ImageFont.load_default()
rows = (len(files) + COLS - 1) // COLS
sheet = Image.new('RGB', (COLS * CW, rows * (CH + LH)), (40, 40, 40))
d = ImageDraw.Draw(sheet)
for idx, fp in enumerate(files):
    r, c = divmod(idx, COLS)
    x0, y0 = c * CW, r * (CH + LH)
    try:
        im = Image.open(fp)
        im.draft('RGB', (CW * 2, CH * 2))
        im = im.convert('RGB')
        s = min((CW - 6) / im.width, CH / im.height)
        im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
        sheet.paste(im, (x0 + (CW - im.width) // 2, y0))
    except Exception as e:
        d.text((x0 + 4, y0 + 4), f'ERR {e}', fill=(255, 80, 80), font=font)
    rel = os.path.relpath(fp, root)
    d.text((x0 + 3, y0 + CH + 2), rel[-44:], fill=(230, 230, 230), font=font)
    if len(rel) > 44:
        d.text((x0 + 3, y0 + CH + 15), rel[:-44][-44:], fill=(160, 160, 160), font=font)
out = os.path.join(root, 'contact.jpg')
sheet.save(out, quality=82, optimize=True)
print(f'{out} {len(files)}장 {sheet.width}x{sheet.height}')
