#!/usr/bin/env python3
"""json 의 pii_scan 을 믿지 않고 이미지 글자를 따로 읽어 보는 독립 검사(tesseract kor+eng).
사용: python3 tools/ocr.py <project_dir> [-j 4] [--all]
- 기본 대상: *-view.png · header.png · states/**.png · seq/*-first|last.png · pdf/*.png · tablet/*.png · media/ 이미지
  (--all 이면 *-full.png 도 — 길어서 느리다)
- 걸린 줄은 파일·패턴·가린 미리보기(앞 2글자+***)만 출력한다. 값 전체는 출력하지 않는다.
- 결과: <project_dir>/ocr-report.txt, 걸린 게 있으면 종료 코드 1 (사람이 그 장면을 열어 보고 판정)
"""
import argparse, concurrent.futures as cf, os, re, subprocess, sys

PAT = {
    'phone': re.compile(r'(?<!\d)(?:\+82[-\s]?\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4}|0\d{1,2}[-.\s)]{0,2}\d{3,4}[-.\s]?\d{4}|1[5-9]\d{2}[-.\s]\d{4})(?!\d)'),
    'email': re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'),
    'rrn': re.compile(r'(?<!\d)\d{6}\s?-\s?[1-8]\d{6}(?!\d)'),
    'account': re.compile(r'(?<![\d-])\d{2,6}(?:-\d{2,7}){2,4}(?![\d-])'),
    'url': re.compile(r'https?://|www\.|(?<![@\w.-])(?:[A-Za-z0-9-]+\.)+(?:com|net|org|kr|io|app|dev|me|ai|xyz|shop|site|store|link|ly|gg|tv|jp|biz|info)(?![\w])', re.I),
    'plate': re.compile(r'(?<!\d)\d{2,3}\s?[가나다라마바사아자거너더러머버서어저고노도로모보소오조구누두루무부수우주하허호배]\s?\d{4}(?!\d)'),
}

def targets(root, all_):
    for dp, _, fns in os.walk(root):
        if '/capture' in dp or '/.git' in dp:
            continue
        for fn in fns:
            if not fn.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')) or fn == 'contact.jpg':
                continue
            rel = os.path.relpath(os.path.join(dp, fn), root)
            if fn.endswith('-full.png') and not all_:
                continue
            if '.part' in fn:
                continue
            yield os.path.join(dp, fn), rel

def ocr(fp):
    r = subprocess.run(['tesseract', fp, '-', '-l', 'kor+eng', '--psm', '3'], capture_output=True, text=True,
                       env={**os.environ, 'OMP_THREAD_LIMIT': '1'})
    return r.stdout

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('root'); ap.add_argument('-j', type=int, default=4); ap.add_argument('--all', action='store_true')
    a = ap.parse_args()
    items = list(targets(a.root, a.all))
    hits = []
    with cf.ThreadPoolExecutor(a.j) as ex:
        for (fp, rel), txt in zip(items, ex.map(lambda t: ocr(t[0]), items)):
            for k, re_ in PAT.items():
                for m in re_.finditer(txt):
                    s = m.group(0)
                    if k == 'account' and len(re.sub(r'\D', '', s)) < 10:
                        continue
                    hits.append(f'{rel}\t{k}\t{s[:2]}***')
    rep = os.path.join(a.root, 'ocr-report.txt')
    with open(rep, 'w') as f:
        f.write(f'# OCR(tesseract kor+eng) 독립 검사 · 대상 {len(items)}장 · 걸림 {len(hits)}\n')
        f.write('\n'.join(hits) + ('\n' if hits else ''))
    print(f'{os.path.basename(a.root.rstrip("/"))}: OCR {len(items)}장 · 걸림 {len(hits)} → {rep}')
    for h in hits[:30]:
        print('HIT', h)
    sys.exit(1 if hits else 0)

main()
