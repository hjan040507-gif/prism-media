#!/usr/bin/env python3
"""nowflix 태블릿 화면: 레포의 기존 CI 에뮬레이터 캡처(pixel_c, 2560x1688)를 복사해 가리고(지우기만) OCR 상자 json 을 만든다.
실행: cd ~/prism-media && python3 nowflix/capture/tablet-from-ci.py
- 원본(~/nowflix-kiosk/ci-viewer/screenshots/*.png)은 읽기만 한다. 새로 그리지 않는다.
- 가림: 메인 QR(01·02) · 관리자 화면 QR+도메인 글자(07) 를 주변 배경색 사각형으로 덮는다.
- 밀도: pixel_c 는 320dpi(밀도 2.0) 로 추정(미확인) → dp = px / 2, viewport 1280x844 dp, deviceScaleFactor 2.
- pii_scan: 가린 이미지를 tesseract(kor+eng) 로 읽어 tools/ocr.py 의 PAT 와 같은 표로 검사, total 0 일 때만 저장한다.
"""
import csv, datetime, hashlib, io, json, os, re, shutil, subprocess, sys
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'nowflix')
REPO = os.path.expanduser('~/nowflix-kiosk')
SRC = os.path.join(REPO, 'ci-viewer', 'screenshots')
DENSITY = 2.0
VIEWPORT = {'width': 1280, 'height': 844, 'deviceScaleFactor': 2, 'name': 'tablet'}
METHOD = 'existing CI emulator screenshot (pixel_c) + PIL mask + OCR boxes'
SOURCE_COMMIT = '8801048ad294c9eb96f29c49238d7932ef8c4097'  # ci-viewer/meta.txt
CAPTURED_AT = '2026-08-25T12:04:05Z'                        # ci-viewer/meta.txt

# tools/ocr.py 의 PAT 표를 그대로 읽어 온다(그 파일은 import 하면 main() 이 돈다)
_src = open(os.path.join(ROOT, 'tools', 'ocr.py'), encoding='utf-8').read()
_m = re.search(r'^PAT = \{.*?^\}\n', _src, re.S | re.M)
_ns = {'re': re}
exec(_m.group(0), _ns)
PAT = _ns['PAT']


def pii_scan(text):
    counts, samples = {}, []
    for k, rx in PAT.items():
        n = 0
        for m in rx.finditer(text):
            s = m.group(0)
            if k == 'account' and len(re.sub(r'\D', '', s)) < 10:
                continue
            n += 1
            samples.append(f'{k}:{s[:2]}***')
        counts[k] = n
    return {'total': sum(counts.values()), 'by_pattern': counts, 'samples': samples[:8],
            'at': 'tesseract kor+eng OCR text of the masked image (same PAT table as tools/ocr.py)', 'patterns': list(PAT)}


def bbox(mask, ox, oy, margin):
    ys, xs = np.where(mask)
    return (int(xs.min() + ox - margin), int(ys.min() + oy - margin), int(xs.max() + ox + margin + 1), int(ys.max() + oy + margin + 1))


def find_masks(name, a):
    """(설명, (x0,y0,x1,y1), 채움색 샘플 좌표) 목록. 좌표는 원본 px."""
    out = []
    if name in ('01_main_6parts', '02_main_8parts'):
        reg = a[0:300, 2100:2560]
        bg = a[10, 2100]
        b = bbox(np.abs(reg - bg).sum(2) > 60, 2100, 0, 6)
        out.append(('QR 코드(상단 빨간 밴드 우측)', b, (b[0] - 20, (b[1] + b[3]) // 2)))
    if name == '07_admin':
        reg = a[200:700, 2020:2500]
        b = bbox(reg.min(2) > 240, 2020, 200, 6)
        out.append(('QR 코드(관리자 웹 패널)', b, (b[0] - 12, (b[1] + b[3]) // 2)))
        bg = a[670, 2060]
        reg = a[650:720, 2030:2480]
        u = bbox(np.abs(reg - bg).sum(2) > 60, 2030, 650, 6)
        out.append(('도메인 글자(QR 아래 URL)', u, (u[0] - 12, (u[1] + u[3]) // 2)))
    return out


def ocr_tsv(png_bytes_path):
    r = subprocess.run(['tesseract', png_bytes_path, '-', '-l', 'kor+eng', 'tsv'], capture_output=True, text=True,
                       env={**os.environ, 'OMP_THREAD_LIMIT': '2'})
    if r.returncode != 0:
        sys.exit('tesseract 실패: ' + r.stderr[:200])
    return r.stdout


def parse_tsv(tsv):
    words, lines = [], {}
    for row in csv.DictReader(io.StringIO(tsv), delimiter='\t', quoting=csv.QUOTE_NONE):
        if row['level'] != '5':
            continue
        t = (row['text'] or '').strip()
        conf = float(row['conf'])
        if not t or conf < 30:
            continue
        x, y, w, h = (int(row[k]) for k in ('left', 'top', 'width', 'height'))
        rect = {'x': round(x / DENSITY, 1), 'y': round(y / DENSITY, 1), 'width': round(w / DENSITY, 1), 'height': round(h / DENSITY, 1)}
        words.append({'text': t, 'rect': rect, 'conf': round(conf), 'kind': 'ocr-word'})
        key = (row['block_num'], row['par_num'], row['line_num'])
        L = lines.setdefault(key, {'t': [], 'x0': x, 'y0': y, 'x1': x + w, 'y1': y + h})
        L['t'].append(t); L['x0'] = min(L['x0'], x); L['y0'] = min(L['y0'], y); L['x1'] = max(L['x1'], x + w); L['y1'] = max(L['y1'], y + h)
    ls = [{'text': ' '.join(L['t']), 'rect': {'x': round(L['x0'] / DENSITY, 1), 'y': round(L['y0'] / DENSITY, 1),
           'width': round((L['x1'] - L['x0']) / DENSITY, 1), 'height': round((L['y1'] - L['y0']) / DENSITY, 1)}, 'kind': 'ocr-line'} for L in lines.values()]
    return words, ls


# 원본 → tablet/ 이름 (화면 이름-view.png)
TABLET = [
    ('01_main_6parts', 'main-view', '메인(파트 6개)'),
    ('02_main_8parts', 'main-8parts-view', '메인(파트 8개, 가로 스크롤 변형)'),
    ('03_video_list', 'part-detail-view', '진료 파트(재생목록 정보+영상 목록 한 화면)'),
    ('04_player_controls_shown', 'player-view', '재생 화면(컨트롤 표시, 오른쪽 다음 동영상 목록)'),
    ('05_player_controls_hidden', 'player-controls-hidden-view', '재생 화면(ScreenshotTest 의 controlsHidden 캡처 — 04 와 다른 건 중앙 NOWFLIX 로딩 마크뿐, 하단 컨트롤은 그대로 보임)'),
    ('06_pin_pad', 'pin-pad-view', '관리자 PIN 패드(숫자 3자리 입력된 상태 = 점 3개)'),
    ('07_admin', 'admin-lock-view', '앱 관리자 화면(복귀 120초·잠금 모드 완전 잠금)'),
    ('08_player_fullscreen', 'player-fullscreen-view', '재생 화면 전체화면(작게 보기 버튼)'),
]
# 상태 흐름: (흐름, [(단계 설명, 원본 키)...], 노트)
FLOWS = [
    ('nav-main-part-player', [('main', '01_main_6parts'), ('part-detail', '03_video_list'), ('player', '04_player_controls_shown'), ('player-fullscreen', '08_player_fullscreen')],
     '화면 이동 흐름 메인→진료 파트→재생(→전체화면). 기존 CI 캡처 조합(같은 시점 연속 촬영 아님).'),
    ('lock-admin', [('main-hotspot', '01_main_6parts'), ('pin-pad-3digits', '06_pin_pad'), ('admin-full-lock', '07_admin')],
     '잠금 탈출구 흐름: 메인(우상단 숨은 핫스팟 3초 길게 누르기)→PIN 패드→관리자 화면 "완전 잠금(device owner)". 기존 CI 캡처 조합(같은 시점 연속 촬영 아님).'),
    ('auto-return', [('before-part-detail', '03_video_list'), ('before-player', '04_player_controls_shown'), ('after-main', '01_main_6parts')],
     '자동 복귀(유휴 120초 → 메인) 전(파트 상세·재생)과 후(메인). 같은 시점 연속 촬영이 아니라 기존 캡처 조합이다.'),
]


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def git_last(path):
    r = subprocess.run(['git', '-C', REPO, 'log', '-1', '--format=%h %cI', '--', path], capture_output=True, text=True)
    return r.stdout.strip()


def main():
    repo_head = subprocess.run(['git', '-C', REPO, 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
    now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    prepared = {}
    tmpdir = os.path.join(ROOT, 'tmp', 'nowflix-tablet')
    os.makedirs(tmpdir, exist_ok=True)
    keys = sorted({k for k, _, _ in TABLET} | {k for _, st, _ in FLOWS for _, k in st})
    for key in keys:
        src = os.path.join(SRC, key + '.png')
        im = Image.open(src).convert('RGB')
        a = np.array(im).astype(int)
        assert im.size == (2560, 1688), (key, im.size)
        masks = []
        for desc, (x0, y0, x1, y1), (sx, sy) in find_masks(key, a):
            col = tuple(int(v) for v in a[sy, sx])
            x0, y0, x1, y1 = max(0, x0), max(0, y0), min(2560, x1), min(1688, y1)
            im.paste(col, (x0, y0, x1, y1))
            masks.append({'what': desc, 'rect_px': [x0, y0, x1, y1], 'rect_dp': [x0 / DENSITY, y0 / DENSITY, x1 / DENSITY, y1 / DENSITY], 'fill_rgb': col})
        mp = os.path.join(tmpdir, key + '.png')
        im.save(mp, optimize=True)
        tsv = ocr_tsv(mp)
        words, lines = parse_tsv(tsv)
        text = '\n'.join(l['text'] for l in lines)
        scan = pii_scan(text)
        if scan['total'] != 0:
            sys.exit(f'{key}: OCR pii_scan {scan["total"]} {scan["samples"]} — 저장 안 함, 가림을 더한다')
        prepared[key] = {'png': mp, 'masks': masks, 'words': words, 'lines': lines, 'scan': scan, 'ocr_words': len(words),
                         'src': src, 'src_sha256': sha(src), 'src_git': git_last('ci-viewer/screenshots/' + key + '.png')}
        print(f'{key}: masks={len(masks)} ocr_words={len(words)} pii={scan["total"]}')

    def write(dest_png, key, kind, extra):
        p = prepared[key]
        os.makedirs(os.path.dirname(dest_png), exist_ok=True)
        shutil.copyfile(p['png'], dest_png)
        j = {
            'file': os.path.basename(dest_png), 'kind': kind, 'project': 'nowflix', 'viewport': VIEWPORT, 'scrollY': 0, 'scrollX': 0,
            'full': False, 'clip': None, 'capturedAt': now, 'method': METHOD,
            'density': {'value': DENSITY, 'basis': 'pixel_c 에뮬레이터 프로필 320dpi 로 추정(미확인) → dp = px ÷ 2; rect 는 dp', 'px_size': [2560, 1688]},
            'source': {'path': 'ci-viewer/screenshots/' + key + '.png', 'repo': '~/nowflix-kiosk', 'repo_head': repo_head, 'file_last_commit': p['src_git'],
                       'source_commit': SOURCE_COMMIT, 'captured_at': CAPTURED_AT, 'sha256_original': p['src_sha256'], 'original_modified': False},
            'masked': p['masks'],
            'elements': p['words'], 'lines': p['lines'],
            'elements_note': 'tesseract kor+eng TSV 단어 상자(conf≥30). 이미지·아이콘 같은 비문자 요소는 상자가 없다.',
            'pii_scan': {**p['scan'], 'before_mask': 'QR·도메인은 픽셀 가림 전 원본에만 있었다(원본 OCR 대조는 shots.md)'},
            'intercepted': {'total': 0, 'new': [], 'allowed_nonget': []},
            **extra,
        }
        json.dump(j, open(dest_png[:-4] + '.json', 'w'), ensure_ascii=False, indent=1)

    for key, name, desc in TABLET:
        write(os.path.join(OUT, 'tablet', name + '.png'), key, 'page', {'screen': desc})
    for flow, steps, note in FLOWS:
        for i, (sd, key) in enumerate(steps, 1):
            write(os.path.join(OUT, 'states', flow, f'{i:02d}-{sd}.png'), key, 'state', {'flow': flow, 'step': i, 'flow_note': note})
    shutil.rmtree(tmpdir, ignore_errors=True)
    print('done')


main()
