#!/usr/bin/env python3
"""촬영용 가짜 기프티콘(600x1164 — CouponBlock.tsx:18-19 의 규격 비율). 실쿠폰이 아니다.
출력: tmp/posco-fake-coupon.png (프로젝트 폴더 밖 — 입력용 가짜 자산이라 촬영 산출물이 아니다)  (브랜드·실제 핀·실제 바코드 없음, '샘플' 표기)"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 600, 1164
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tmp', 'posco-fake-coupon.png')
FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
BOLD = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
def f(size, bold=False):
    return ImageFont.truetype(BOLD if bold else FONT, size, index=1 if False else 0)

im = Image.new('RGB', (W, H), '#ffffff')
d = ImageDraw.Draw(im)
d.rectangle([0, 0, W, 150], fill='#13294b')
d.text((40, 52), '모바일 쿠폰', font=f(44, True), fill='#ffffff')
d.text((W - 40, 62), 'SAMPLE', font=f(28, True), fill='#9fb4d4', anchor='ra')
# 음료 컵 모양(단순 도형)
d.rounded_rectangle([210, 230, 390, 520], radius=26, fill='#e8edf4', outline='#c3cedd', width=4)
d.rectangle([196, 210, 404, 246], fill='#c3cedd')
d.rectangle([232, 330, 368, 440], fill='#13294b')
d.text((300, 385), 'COFFEE', font=f(26, True), fill='#ffffff', anchor='mm')
d.text((300, 600), '아메리카노', font=f(50, True), fill='#13294b', anchor='mm')
d.text((300, 660), 'HOT / ICED 택1', font=f(26), fill='#6b7a90', anchor='mm')
d.line([40, 720, W - 40, 720], fill='#dbe2ec', width=2)
# 장식용 줄무늬(실제 바코드 아님)
x = 70
import random
rnd = random.Random(7)
while x < W - 70:
    w = rnd.choice([3, 5, 7, 4])
    d.rectangle([x, 760, x + w, 900], fill='#13294b')
    x += w + rnd.choice([4, 6, 8])
d.text((300, 940), '7391 4826 5517', font=f(36, True), fill='#13294b', anchor='mm')
d.text((300, 1000), '유효기간 2026.11.09 까지', font=f(26), fill='#6b7a90', anchor='mm')
d.text((300, 1090), '촬영용 가짜 쿠폰 · 사용 불가', font=f(24), fill='#9aa6b8', anchor='mm')
im.save(OUT, optimize=True)
print(OUT, os.path.getsize(OUT))
