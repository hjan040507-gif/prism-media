#!/usr/bin/env python3
"""shots.md 생성: 파일마다 한 줄. 파일 목록은 디스크에서 읽고 설명은 아래 표에서 붙인다(없으면 실패)."""
import os, re, sys, json

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)

REDACT_DESK = "가린 것: 푸터 운영자 정보 dl(상호·대표자·사업자번호·주소·전화·이메일) visibility:hidden, 도메인·URL 글자 자동 제거"
PAGES = {
    'desktop/home': ('홈 데스크톱 1440 — IntroSplash 가 사라진 뒤(히어로·시장별 최고가·시세 순위)', ''),
    'desktop/search-chosung': ("초성 검색 결과 `/search?q=ㄹㅈㅁ` (리자몽 계열 20건)", ''),
    'desktop/search-code': ("카드 번호 검색 결과 `/search?q=OP01-120` (2건)", ''),
    'desktop/card-jp': ("카드 상세 일본판 `pokemon-card-jp-32317` 리자몽EX — 야후옥션 실거래·낙찰 내역·시세 차트", ''),
    'desktop/card-kr': ("카드 상세 한글판 `pokemoncard-ko-BS2014001001` 이상해꽃 EX — 번개장터 호가·언어판 비교 스트립(한·일·영)", ''),
    'desktop/card-multi-axis': ("카드 상세 `optcgapi-OP13-007` 에이스&사보&루피 — 국내 호가·일본 실거래·미국 eBay 호가·시세 차트(국내+일본 2축)", ''),
    'desktop/market-box': ("마켓 목록 `/market/box`(← `/market` 307) 시세 있는 밀봉 박스·팩·싱글 탭", ''),
    'desktop/for-shops': ("입점 안내 `/for-shops` — 공개 입점 샵이 0곳이라 입점 샵 페이지 대체(BLOCKED.md 1번)", ''),
    'desktop/shops-empty': ("검증샵 목록 `/shops` 빈 상태(\"아직 공개된 검증샵이 없어요\") — BLOCKED.md 1번", ''),
    'desktop/wishlist': ("관심 목록 `/my/wishlist` — 카드 상세에서 하트 3번 눌러 localStorage `sk_wish` 에 3장 담은 뒤(로그인 없음)", ''),
    'desktop/watch-sheet': ("카드 상세 '알림' 시트(가격 알림) 열린 화면 — 시세 소스 3개 선택·조건·목표가·받는 방법", ''),
    'mobile/home': ("홈 모바일 390 — IntroSplash 뒤, 하단 탭바 포함", ''),
    'mobile/search': ("시세 탭 `/search` 비검색 상태(전체 카드 둘러보기·가격대별·인기 검색어)", ''),
    'mobile/search-results': ("모바일 초성 검색 결과 `/search?q=ㄹㅈㅁ`", ''),
    'mobile/card-jp': ("모바일 카드 상세 `pokemon-card-jp-32317`", ''),
    'mobile/card-multi-axis': ("모바일 카드 상세 `optcgapi-OP13-007`", ''),
}
lines = []
files = []
for dp, dns, fns in os.walk('.'):
    if dp.startswith('./capture/node_modules'):
        continue
    for fn in fns:
        files.append(os.path.relpath(os.path.join(dp, fn), '.'))
files.sort()

def pg(f):
    for base, (desc, _) in PAGES.items():
        if f.startswith(base + '-full.') or f.startswith(base + '-view.'):
            which = 'full(끝까지 스크롤한 전체)' if '-full.' in f else 'view(첫 화면 스크롤 0)'
            ext = '' if f.endswith('.png') else ' 곁 json(요소 사각형·글자·pii_scan)'
            return f'{desc} · {which}{ext}'
    return None

STATE = {
    'states/search-autocomplete': ('데스크톱 홈 검색창 한 글자씩 입력 → 자동완성 — 단계 {step}. 같은 뷰포트 1440×900·scrollY 0', None),
    'states/search-autocomplete-mobile': ('모바일 홈 검색창 한 글자씩 입력 → 자동완성 — 단계 {step}. 390×844·scrollY 0', None),
    'states/chart-period': ('카드 상세(OP13-007) 시세 차트 기간 탭 전환 — 단계 {step}. scrollY 고정(차트 카드 상단 맞춤)', None),
    'states/axis-tabs-kr-jp': ('카드 상세(OP13-007) 시세 축(나라) 탭 국내↔일본 — 단계 {step}. scrollY 고정', None),
    'states/wish-register': ('카드 상세(리자몽EX) 관심 카드 등록 — 단계 {step}: before=누르기 전, pressed=마우스 누름(hover+mousedown), registered=등록됨(하트 채움·"관심"). scrollY 0', None),
    'states/watch-alert': ('카드 상세(OP13-007) 시세 알림 만들기 — 단계 {step}. POST/PATCH /api/watch 는 가짜 성공으로 가로챔(알림은 생성되지 않음). scrollY 0', None),
}

def state_desc(f):
    for base, (desc, _) in STATE.items():
        if f.startswith(base + '/'):
            n = os.path.basename(f)
            step = re.sub(r'\.(png|json)$', '', n)
            return desc.format(step=step) + (' 곁 json' if f.endswith('.json') else '')
    return None

SEQ = {
    'home-intro-splash': '홈 IntroSplash 연출(한 획 그리기→스탬프→워드마크→페이드→홈) 4.0s 60fps · 방식: page.clock 가상 시간 1/60s runFor + getAnimations 동기화(gsap 은 rAF 가 가상 시간에 묶임), 데스크톱 1440×900@2',
    'chart-period-switch': '카드 상세 시세 차트 기간 전환(7일→90일→전체) 선 그려지는 애니메이션 3.6s 60fps · 방식: page.clock 1/60s runFor(프레임 100·170 에서 탭 클릭)',
    'home-search-autocomplete': '홈 검색 자동완성 펼침(ㅍ→ㅍㅋ→ㅍㅋㅊ) 3.0s 60fps · 방식: page.clock 1/60s runFor(프레임 20·70·120 에서 글자 입력)',
}

MEDIA = {
    'media/logo-symbol.svg': '로고 심볼 원본 SVG(틸 #14B8A6 사각 + 씰 한 획) ← 레포 app/icon.svg',
    'media/wordmark.svg': 'SEALKITT 워드마크 SVG — 레포에 독립 파일이 없고 컴포넌트(components/brand/Wordmark.tsx)로 그려져, 라이브 헤더의 렌더된 <svg> outerHTML 을 추출(currentColor→#e6edf3)',
    'media/card-back-sealkitt.png': '씰킷 카드 뒷면 이미지 ← 레포 public/cards/backs/sealkitt.png',
    'media/wordmark-ligature.png': '워드마크 디자인 레퍼런스 PNG ← 레포 public/brand-ref/wordmark-ligature.png',
}

out = ['# sealkitt shots — 파일마다 한 줄', '',
       '촬영: Playwright 1.64.1(chromiumSandbox), 운영 https://sealkitt.com, 로그인 없음. 모든 요청은 guard 로 비GET 가로챔·`x-sealkitt-verify: 1`(동일 출처만)로 검색 로그 생략. 가짜 값 사용 0(실서비스 화면 그대로, 가짜 응답은 알림 생성 POST 의 `{id:1}` 뿐). ' + REDACT_DESK + '. 사람 이름·닉네임이 보이는 화면 없음(커뮤니티 닉네임 selector 가림 규칙 적용). 모든 PNG 곁 .json 의 pii_scan.total = 0.', '']
miss = []
for f in files:
    if f in ('shots.md', 'contact.jpg', 'BLOCKED.md', 'RECON.md', 'facts.md', 'brand.json', 'ocr-report.txt') or f.startswith('capture/'):
        continue
    d = None
    if f.startswith(('desktop/', 'mobile/')):
        if f.endswith('header.png') or f.endswith('header.json'):
            d = ('고정 헤더(GlobalHeader sticky) 스크롤된 상태 — header.png' if f.endswith('.png') else 'header.png 곁 json')
            d += ' · ' + f.split('/')[0]
        else:
            d = pg(f)
    elif f.startswith('states/'):
        d = state_desc(f)
    elif f.startswith('seq/'):
        b = os.path.basename(f)
        m = re.match(r'(.+?)(-first\.(png|json)|-last\.(png|json)|\.mp4)$', b)
        if m and m.group(1) in SEQ:
            kind = '첫 프레임' if '-first' in b else '끝 프레임' if '-last' in b else '영상'
            d = f'{SEQ[m.group(1)]} · {kind}' + (' 곁 json' if b.endswith('.json') else '')
    elif f.startswith('media/'):
        if f in MEDIA:
            d = MEDIA[f]
        elif f.startswith('media/hero/'):
            d = '히어로 배경 변형 ' + f.split('/')[2].upper() + ' 원본(' + os.path.basename(f) + ') ← 레포 public/hero/' + '/'.join(f.split('/')[2:])
        elif f.startswith('media/icons/'):
            d = '앱 아이콘 ← 레포 public/icons/' + os.path.basename(f)
        elif f.startswith('media/brand/'):
            d = '앱 아이콘 ← 레포 public/brand/' + os.path.basename(f)
    if d is None:
        miss.append(f)
        continue
    out.append(f'- `{f}` — {d}')
if miss:
    print('설명 없는 파일:', *miss, sep='\n  ')
    sys.exit(1)
open('shots.md', 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('shots.md', len(out) - 3, '줄')
