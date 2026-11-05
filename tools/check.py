#!/usr/bin/env python3
"""프로젝트 폴더 합격 검사(명세 [합격 기준] 1~3 의 파일 쪽). FAIL 줄만 보면 된다.
사용: python3 -I tools/check.py <project_dir> [--tablet]   (nowflix 는 --tablet: 태블릿 4화면 이상)
검사:
 - 데스크톱 페이지(full+view 쌍) ≥3, 모바일 ≥2 (--tablet 이면 tablet/ 화면 ≥4)
 - states/<흐름> ≥2개, 각 ≥3단계, 한 흐름 안의 scrollY·뷰포트 같음
 - 모든 PNG 옆 json, json pii_scan.total == 0, PNG 크기 = 뷰포트×DSF(view·state)
 - facts.md 항목 ≥5, shots.md 에 모든 파일 이름이 있음, contact.jpg 있음
 - 파일 < 95MB, 폴더 < 400MB
 - seq/*.mp4: H.264 · 60fps · ≤6초 · first/last PNG
 - 가로챈 요청 합계와 allowed_nonget 목록 요약(운영 쓰기 검토용)
"""
import json, os, re, subprocess, sys
from PIL import Image

root = sys.argv[1].rstrip('/')
tablet = '--tablet' in sys.argv
fails, oks = [], 0
def ok(msg):
    global oks
    oks += 1
def fail(msg):
    fails.append(msg)

def pages(sub):
    d = os.path.join(root, sub)
    if not os.path.isdir(d):
        return set()
    names = set()
    fs_ = set(os.listdir(d))
    for f in fs_:
        m = re.match(r'(.+)-full\.png$', f)
        if m and f'{m.group(1)}-view.png' in fs_:
            names.add(m.group(1))
    return names

if tablet:
    t = os.path.join(root, 'tablet')
    n = len([f for f in os.listdir(t) if f.endswith('.png')]) if os.path.isdir(t) else 0
    (ok if n >= 4 else fail)(f'tablet 화면 {n}장 (≥4)')
else:
    dp, mp = pages('desktop'), pages('mobile')
    (ok if len(dp) >= 3 else fail)(f'desktop 페이지 {len(dp)} (≥3): {sorted(dp)}')
    (ok if len(mp) >= 2 else fail)(f'mobile 페이지 {len(mp)} (≥2): {sorted(mp)}')

sdir = os.path.join(root, 'states')
flows = [f for f in os.listdir(sdir) if os.path.isdir(os.path.join(sdir, f))] if os.path.isdir(sdir) else []
good_flows = 0
for fl in sorted(flows):
    pngs = sorted(p for p in os.listdir(os.path.join(sdir, fl)) if p.endswith('.png'))
    sy, vps = set(), set()
    for p in pngs:
        j = os.path.join(sdir, fl, p[:-4] + '.json')
        if os.path.exists(j):
            d = json.load(open(j))
            sy.add(d.get('scrollY'))
            v = d.get('viewport', {})
            vps.add((v.get('width'), v.get('height'), v.get('deviceScaleFactor')))
    if len(pngs) >= 3:
        good_flows += 1
    else:
        fail(f'states/{fl}: {len(pngs)}단계 (<3)')
    if len(sy) > 1 or len(vps) > 1:
        fail(f'states/{fl}: 스크롤/뷰포트가 단계마다 다름 {sy} {vps}')
(ok if good_flows >= 2 else fail)(f'상태 흐름(≥3단계) {good_flows}개 (≥2)')

total_bytes, inter_total, allowed = 0, 0, set()
inter_sum = 0
all_files = []
for dp_, dns, fns in os.walk(root):
    if '/.git' in dp_ or '/capture/node_modules' in dp_:
        continue
    for fn in fns:
        fp = os.path.join(dp_, fn)
        rel = os.path.relpath(fp, root)
        sz = os.path.getsize(fp)
        total_bytes += sz
        all_files.append(rel)
        if sz >= 95 * 1024 * 1024:
            fail(f'{rel}: {sz/1048576:.1f}MB ≥ 95MB')
        if fn.endswith('.png') and not rel.startswith('media/'):
            j = fp[:-4] + '.json'
            if not os.path.exists(j):
                fail(f'{rel}: json 없음')
                continue
            d = json.load(open(j))
            ps = d.get('pii_scan')
            if not ps or ps.get('total', 1) != 0:
                fail(f'{rel}: pii_scan {ps and ps.get("total")}')
            it = d.get('intercepted') or {}
            inter_total = max(inter_total, it.get('total', 0))
            inter_sum += len(it.get('new') or [])
            allowed.update(it.get('allowed_nonget') or [])
            v = d.get('viewport') or {}
            if d.get('kind') in ('page', 'state') and not d.get('full') and not d.get('clip'):
                try:
                    w, h = Image.open(fp).size
                    ew, eh = round(v['width'] * v['deviceScaleFactor']), round(v['height'] * v['deviceScaleFactor'])
                    if (w, h) != (ew, eh):
                        fail(f'{rel}: {w}x{h} ≠ {ew}x{eh}')
                except Exception as e:
                    fail(f'{rel}: 크기 확인 실패 {e}')
        if fn.endswith('.mp4'):
            try:
                out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries',
                                      'stream=codec_name,r_frame_rate,nb_read_frames,width,height:format=duration', '-of', 'json', fp],
                                     capture_output=True, text=True).stdout
                info = json.loads(out)
                s = info['streams'][0]
                dur = float(info['format']['duration'])
                if s['codec_name'] != 'h264': fail(f'{rel}: codec {s["codec_name"]}')
                if s['r_frame_rate'] != '60/1': fail(f'{rel}: fps {s["r_frame_rate"]}')
                if dur > 6.05: fail(f'{rel}: {dur:.2f}s > 6s')
                base = fp[:-4]
                for w in ('first', 'last'):
                    if not os.path.exists(f'{base}-{w}.png'): fail(f'{rel}: {w} PNG 없음')
            except Exception as e:
                fail(f'{rel}: ffprobe 실패 {e}')
(ok if total_bytes < 400 * 1024 * 1024 else fail)(f'폴더 {total_bytes/1048576:.1f}MB (<400MB)')

facts = os.path.join(root, 'facts.md')
if os.path.exists(facts):
    items = [l for l in open(facts, encoding='utf-8') if re.match(r'^\s*(\d+\.|[-*])\s+\S', l) and '근거' in l or re.match(r'^##\s+\d+', l)]
    n = len(items)
    (ok if n >= 5 else fail)(f'facts.md 항목 {n} (≥5, 항목 줄에 "근거" 포함 또는 "## n" 머리)')
else:
    fail('facts.md 없음')
shots = os.path.join(root, 'shots.md')
if os.path.exists(shots):
    txt = open(shots, encoding='utf-8').read()
    miss = [f for f in all_files if (f.endswith(('.png', '.mp4', '.jpg', '.svg', '.webp', '.webm')) and os.path.basename(f) not in txt and f not in txt and f != 'contact.jpg')]
    (ok if not miss else fail)(f'shots.md 누락 {len(miss)}: {miss[:8]}')
else:
    fail('shots.md 없음')
(ok if os.path.exists(os.path.join(root, 'contact.jpg')) else fail)('contact.jpg')
(ok if os.path.exists(os.path.join(root, 'brand.json')) else fail)('brand.json')

print(f'{os.path.basename(root)}: PASS {oks} · FAIL {len(fails)} · 폴더 {total_bytes/1048576:.1f}MB · 가로챈 요청 합계 {inter_sum} · 허용한 비GET {sorted(allowed)}')
for f in fails:
    print('FAIL', f)
sys.exit(1 if fails else 0)
