#!/usr/bin/env python3
"""PDF 첫 쪽 → 200dpi PNG + 곁 json(kind:'pdf'). pii_scan = pdftotext 글자에 tools/ocr.py 의 PAT 정규식 — 0건이어야 저장.
사용: python3 byclick/capture/pdf-shots.py <pdfDir>   (pdfDir 에 낙찰확인서.pdf · 판매정산서.pdf · 성능상태점검기록부.pdf)"""
import sys, os, re, json, subprocess, importlib.util, datetime, shutil
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
_src = open(os.path.join(ROOT, 'tools', 'ocr.py'), encoding='utf8').read()
_blk = _src[_src.index('PAT = {'):_src.index('\n}\n', _src.index('PAT = {')) + 3]
_ns = {'re': re}; exec(_blk, _ns)
PAT = _ns['PAT']
src = sys.argv[1]
out = os.path.join(ROOT, 'byclick', 'pdf'); os.makedirs(out, exist_ok=True)
names = {'성능상태점검기록부.pdf': ('performance-record', '성능·상태 점검기록부'), '낙찰확인서.pdf': ('won-confirmation', '낙찰 확인서'), '판매정산서.pdf': ('settlement-statement', '판매 정산서')}
for fn, (name, title) in names.items():
    pdf = os.path.join(src, fn)
    txt = subprocess.run(['pdftotext', '-layout', pdf, '-'], capture_output=True, text=True).stdout
    first_page = txt.split('\f')[0]
    counts = {}
    for k, r in PAT.items():
        n = 0
        for m in r.finditer(txt):
            if k == 'account' and len(re.sub(r'\D', '', m.group(0))) < 10: continue
            n += 1
        counts[k] = n
    total = sum(counts.values())
    if total:
        print('PII', fn, counts); continue
    pages = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout).group(1))
    base = os.path.join(out, name)
    subprocess.run(['pdftoppm', '-r', '200', '-f', '1', '-l', '1', '-png', '-singlefile', pdf, base], check=True)
    json.dump({'file': name + '.png', 'kind': 'pdf', 'project': 'byclick', 'title': title, 'source': 'src/lib/pdf/documents.tsx render*Pdf (사본 tmp/byclick-src) · 가짜 데이터(mock-supabase)', 'pdf_pages': pages, 'dpi': 200, 'page': 1,
               'capturedAt': datetime.datetime.utcnow().isoformat() + 'Z', 'pii_scan': {'total': 0, 'by_pattern': counts, 'checked': 'pdftotext -layout (all pages) × tools/ocr.py PAT'},
               'intercepted': {'total': 0, 'note': '운영 접속 없음(로컬 가짜 DB)'}, 'viewport': {'name': 'pdf-200dpi'}}, open(base + '.json', 'w'), ensure_ascii=False, indent=1)
    shutil.copy(pdf, os.path.join('/home/dev/prism-media/tmp', 'byclick-last-' + name + '.pdf'))
    print('saved', name, pages, 'pages')
