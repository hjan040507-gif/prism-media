#!/usr/bin/env python3
"""엑셀 → soffice PDF → 첫 쪽 200dpi PNG(okjob/files/<이름>.png + json). byclick/capture/pdf-shots.py 방식:
pii_scan = pdftotext(전 쪽) 글자 × tools/ocr.py 의 PAT 정규식 — 0건이어야 저장.
사용: python3 okjob/capture/41-files.py   (tmp/okjob-xlsx/{day-sheet,worker-matrix}.xlsx 필요 — 40-export.mjs)"""
import os, re, json, subprocess, shutil, datetime
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
_src = open(os.path.join(ROOT, 'tools', 'ocr.py'), encoding='utf8').read()
_blk = _src[_src.index('PAT = {'):_src.index('\n}\n', _src.index('PAT = {')) + 3]
_ns = {'re': re}; exec(_blk, _ns); PAT = _ns['PAT']
X = os.path.join(ROOT, 'tmp', 'okjob-xlsx'); out = os.path.join(ROOT, 'okjob', 'files'); os.makedirs(out, exist_ok=True)
items = {
  'day-sheet': ('일별 배정표 엑셀', 'GET /api/reports/day/export?date=2026-11-03 (src/lib/domain/day-sheet.ts buildDaySheet)'),
  'worker-matrix': ('근로자별 매트릭스 엑셀', 'GET /api/reports/matrix/export?month=2026-11 (src/app/api/reports/matrix/export/route.ts)'),
}
for name, (title, source) in items.items():
    xlsx = os.path.join(X, name + '.xlsx')
    subprocess.run(['soffice', '--headless', '--convert-to', 'pdf:calc_pdf_Export:{"SinglePageSheets":{"type":"boolean","value":"true"}}', '--outdir', X, xlsx], check=True, capture_output=True, timeout=240)
    pdf = os.path.join(X, name + '.pdf')
    txt = subprocess.run(['pdftotext', '-layout', pdf, '-'], capture_output=True, text=True).stdout
    counts = {}
    for k, r in PAT.items():
        n = 0
        for m in r.finditer(txt):
            if k == 'account' and len(re.sub(r'\D', '', m.group(0))) < 10: continue
            n += 1
        counts[k] = n
    if sum(counts.values()):
        print('PII', name, counts); continue
    pages = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout).group(1))
    base = os.path.join(out, name)
    subprocess.run(['pdftoppm', '-r', '200', '-f', '1', '-l', '1', '-png', '-singlefile', pdf, base], check=True)
    json.dump({'file': name + '.png', 'kind': 'pdf', 'project': 'okjob', 'title': title, 'source': source + ' · 로컬 사본 앱 + 로컬 Supabase 가짜 데이터 · soffice --headless --convert-to pdf(SinglePageSheets) → pdftoppm',
               'pdf_pages': pages, 'dpi': 200, 'page': 1, 'capturedAt': datetime.datetime.utcnow().isoformat() + 'Z',
               'pii_scan': {'total': 0, 'by_pattern': counts, 'checked': 'pdftotext -layout (all pages) × tools/ocr.py PAT'},
               'intercepted': {'total': 0, 'note': '운영 접속 없음(로컬 가짜 DB)'}, 'viewport': {'name': 'pdf-200dpi'}}, open(base + '.json', 'w'), ensure_ascii=False, indent=1)
    print('saved', name, pages, 'pages')
