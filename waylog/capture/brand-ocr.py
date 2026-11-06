#!/usr/bin/env python3
"""waylog 공개 표기 검사 — 화면 PNG 의 글자를 tesseract(kor+eng)로 읽어 제품 회사·브랜드명이 0 인지 본다.
사용: python3 -I waylog/capture/brand-ocr.py waylog [-j 3] [--all]   (기본: view·states·seq·media, --all 이면 full 도)
brand 목록은 RECON.md §6 「브랜드명 문자열 목록」. 일반어와 겹치는 「종가」「인텐시브」「본작」「스페셜 케어」「뉴트리션」은 제외(제품 이름 줄에서만 의미).
OCR 은 글자 사이 공백·오인식이 있어 공백을 뺀 글자도 같이 본다. 결과: <root>/brand-ocr-report.txt, 걸리면 종료 코드 1.
"""
import argparse, concurrent.futures as cf, os, re, subprocess, sys

BRANDS = ['암웨이', 'Amway', 'amway', '뉴트리라이트', '뉴트리라면', 'Nutrilite', '아티스트리', 'Artistry', '퀸Ti', '암웨이홈', '더블엑스',
          '바디키', 'BodyKey', 'BODYKEY', '원포원', '화이버비츠', '푸로틴', '더마아키텍트', '하이드라매틱스', '셀렉트팩', '시그니처셀렉트',
          '스튜디오스킨', '아이디얼래디언스', '엣모스피어', '글리스터', '이스프링', '까페드다몬', 'XS에너지', 'LAB224', '정기품', '노브스갈라',
          '라임트리', '행복한아름', '웰로스', '아이쿡', '굿모닝', 'gutmorning', '바이오퀘스트', '디쉬드랍스', '프라임펫']
NORM = lambda s: re.sub(r'\s+', '', s)


def targets(root, all_):
    for dp, _, fns in os.walk(root):
        if '/capture' in dp or '/.git' in dp:
            continue
        for fn in fns:
            if not fn.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')) or fn == 'contact.jpg' or '.part' in fn:
                continue
            if fn.endswith('-full.png') and not all_:
                continue
            yield os.path.join(dp, fn), os.path.relpath(os.path.join(dp, fn), root)


def ocr(fp):
    r = subprocess.run(['tesseract', fp, '-', '-l', 'kor+eng', '--psm', '3'], capture_output=True, text=True, env={**os.environ, 'OMP_THREAD_LIMIT': '1'})
    return r.stdout


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('root'); ap.add_argument('-j', type=int, default=3); ap.add_argument('--all', action='store_true')
    a = ap.parse_args()
    items = list(targets(a.root, a.all))
    hits = []
    with cf.ThreadPoolExecutor(a.j) as ex:
        for (fp, rel), txt in zip(items, ex.map(lambda t: ocr(t[0]), items)):
            flat = NORM(txt)
            for b in BRANDS:
                if NORM(b).lower() in flat.lower():
                    hits.append(f'{rel}\t{b}')
    rep = os.path.join(a.root, 'brand-ocr-report.txt')
    with open(rep, 'w') as f:
        f.write(f'# 브랜드 글자 OCR(tesseract kor+eng) · 대상 {len(items)}장 · 걸림 {len(hits)}\n')
        f.write('\n'.join(hits) + ('\n' if hits else ''))
    print(f'{os.path.basename(a.root.rstrip("/"))}: 브랜드 OCR {len(items)}장 · 걸림 {len(hits)} → {rep}')
    for h in hits[:40]:
        print('HIT', h)
    sys.exit(1 if hits else 0)


main()
