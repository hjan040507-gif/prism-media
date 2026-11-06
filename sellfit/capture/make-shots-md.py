#!/usr/bin/env python3
"""sellfit shots.md 생성: 파일마다 한 줄. 파일 목록은 디스크에서 읽고 설명은 아래 표에서 붙인다(없으면 실패)."""
import os, re, sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)

REDACT = "가린 것: 판매자 아바타(remove, 자리 유지)·판매자 닉네임→user***, 스플래시·'홈 화면에 추가' 안내 hide, 화면 속 도메인·URL 글자 자동 제거('비슷한 코디' 섹션은 이 상품들엔 없음, 규칙은 적용)"
PAGES = {
    'sensel-list': "쎈셀샵 `/sensel` — 배너 + 운영자 공식 상품 71개 2열 그리드(전부 의류 단독 컷, 사람 사진 없음)",
    'product-bape-shark': "상품 상세 `/products/62610461…` 베이프 샤크 후드 — 사진 캐러셀 1/4·판매자·가격 168,000원·교환 가능·설명",
    'product-polo-italy': "상품 상세 `/products/26582015…` 폴로 빅포니 이탈리아 집업 — 캐러셀 1/4·280,000원·교환 가능·실측",
    'product-palace-knit': "상품 상세 `/products/e275d237…` 팔라스 니트집업 — 캐러셀 1/4·380,000원·교환 가능·실측",
    'login': "로그인 `/login` — 이메일 로그인/회원가입 탭·Google 로 계속하기(빈 폼)",
}
VPS = {'desktop': '데스크톱 1440×900@2(앱이 모바일 폭 448px 컬럼을 중앙에 둠)', 'mobile': '모바일 390×844@3'}
STATE = {
    'states/detail-carousel': "상품 상세(베이프 샤크 후드) 사진 캐러셀 넘기기 — {step}. 390×844·scrollY 0 고정, 스와이프 대신 컨테이너 scrollLeft 를 사진 폭 단위로 이동(scroll-snap 위치와 같음), 카운터 1/4→4/4 갱신 확인",
    'states/search-filter': "거래 `/products` 검색창 입력 → 목록 필터 — {step}. 390×844·scrollY 300 고정. 앱은 2글자부터 필터(1글자는 60개 그대로). 클라이언트 필터 + Supabase 공개 REST GET 1회, 비GET 0. 빈 입력 단계는 첫 카드가 얼굴 사진이라 찍지 않음",
}
SEQ = {
    'detail-carousel-swipe': "상품 상세 사진 캐러셀 1→2→3→4 전환 5.0s 60fps · 방식: page.clock 가상 시간 1/60s runFor + 프레임마다 스크린샷(300프레임, 프레임 40·130·220 에서 36프레임 동안 easeInOutCubic). 캐러셀이 CSS scroll-snap 이라 브라우저 smooth scroll 이 가상 시계에 안 묶여, 전환 동안만 scroll-snap-type:none 으로 두고 scrollLeft 를 프레임마다 직접 지정(위치 보간만 스크립트, 렌더는 실제 앱). 390×844@3",
}
MEDIA = {
    'media/logo-wordmark.png': "SELLFIT 가로 워드마크 835×162 ← 레포 public/logo.png (앱 헤더·스플래시에 쓰는 로고)",
    'media/logo-full.png': "풀 로고 818×817(노랑 배경+지구본+SELL) ← 레포 루트 logo-full.png",
    'media/emblem.png': "엠블럼 500×500 RGBA ← 레포 루트 emblem.png",
    'media/icon-192.png': "PWA 아이콘 192 ← 레포 public/icon-192.png",
    'media/icon-512.png': "PWA 아이콘 512 ← 레포 public/icon-512.png",
    'media/icon-512-maskable.png': "PWA maskable 아이콘 512 ← 레포 public/icon-512-maskable.png",
    'media/apple-icon.png': "Apple touch 아이콘 180 ← 레포 src/app/apple-icon.png",
}
SEQ_FILES = {'-first': '첫 프레임', '-last': '끝 프레임'}

files = []
for dp, dns, fns in os.walk('.'):
    for fn in fns:
        files.append(os.path.relpath(os.path.join(dp, fn), '.'))
files.sort()
SKIP = ('shots.md', 'contact.jpg', 'BLOCKED.md', 'RECON.md', 'facts.md', 'brand.json', 'ocr-report.txt')

def desc(f):
    ext = ' · 곁 json(요소 사각형·글자·scrollY·pii_scan)' if f.endswith('.json') else ''
    m = re.match(r'(desktop|mobile)/(.+?)-(full|view)\.(png|json)$', f)
    if m and m.group(2) in PAGES:
        which = 'full(끝까지 스크롤한 전체)' if m.group(3) == 'full' else 'view(첫 화면 스크롤 0)'
        return f"{PAGES[m.group(2)]} · {VPS[m.group(1)]} · {which}{ext}"
    m = re.match(r'(desktop|mobile)/header\.(png|json)$', f)
    if m:
        return f"고정(sticky) 헤더(로고·SHOP·검색·로그인) 스크롤된 상태 header.png · {VPS[m.group(1)]}" + ext
    for base, d in STATE.items():
        if f.startswith(base + '/'):
            step = re.sub(r'\.(png|json)$', '', os.path.basename(f))
            return d.format(step=step) + ext
    m = re.match(r'seq/(.+?)(-first|-last)?\.(mp4|png|json)$', f)
    if m and m.group(1) in SEQ:
        if f.endswith('.mp4'):
            return SEQ[m.group(1)]
        return f"seq {m.group(1)}.mp4 의 {SEQ_FILES[m.group(2)]}" + ext
    if f in MEDIA:
        return MEDIA[f]
    return None

HEAD = [
    '# sellfit shots — 파일마다 한 줄', '',
    '촬영: Playwright 1.64.1(chromiumSandbox), 운영 https://sellfit.vercel.app 공개 화면, 로그인 0회·새 계정 0, 비GET 가로챔 0건·허용 0건(GET 만). 가짜 값 사용 0(실서비스 화면 그대로). ' + REDACT + '. 모든 PNG 곁 .json 의 pii_scan.total = 0.', '',
    '**사람 사진 확인 결과**: 촬영한 모든 장면(쎈셀샵 목록 71개 카드 전체, 상품 상세 3종의 캐러셀 사진 12장, 검색 필터 4단계, 캐러셀 4단계, 영상 프레임)을 직접 확인 — 얼굴·전신이 보이는 사진 0장(상품 상세 사진 중 손 클로즈업만 있음). 거래 `/products` 첫 카드(얼굴 사진인 유저 제품)는 촬영에서 제외했고 홈·코디 상세는 열지 않음.', '',
]
out = list(HEAD)
miss = []
for f in files:
    if f in SKIP or f.startswith('capture/'):
        continue
    d = desc(f)
    if d is None:
        miss.append(f); continue
    out.append(f'- `{f}` — {d}')
if miss:
    print('설명 없는 파일:', miss); sys.exit(1)
open('shots.md', 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('shots.md', len(out) - len(HEAD), 'lines')
