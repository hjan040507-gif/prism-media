#!/usr/bin/env python3
"""shots.md 생성: 파일마다 한 줄. 파일 목록은 디스크에서 읽고 설명은 아래 표에서 붙인다(없으면 실패)."""
import os, re, sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)

PAGES = {
    'desktop/landing': '랜딩 `/` 데스크톱 1440 — 히어로(룰렛)·기능 4카드·만드는 순서 4단계(빌더 실캡처 이미지)·요금제 요약',
    'desktop/pricing': '요금제 `/pricing` — Free·One-Time ₩300,000·Pro ₩200,000·Business 상담 후 견적',
    'desktop/showcase': '쇼케이스 `/showcase` — 제작 사례 5건(고봉민김밥인·마라공방·VDOC·TOPS·새마을금고) 카드. 사례 이미지 alt 의 "QR" 단어에 자동 QR 가림이 걸려 이 페이지만 자동 QR 가림을 껐다(QR 이미지 없음)',
    'desktop/game-roulette': '게임 ① 룰렛 `/e/demo-roulette-mz-bright` 를 데스크톱 1440 에서(시연 이벤트, 이벤트 화면은 모바일 우선 열 레이아웃)',
    'desktop/game-scratch': '게임 ② 스크래치 `/e/demo-scratch-premium` 데스크톱 1440',
    'desktop/game-quiz': '게임 ③ OX 퀴즈 `/e/demo-quiz-minimal` 데스크톱 1440',
    'desktop/game-stamp': '게임 ④ 스탬프·출석 `/e/demo-stamp-mz-bright` 데스크톱 1440',
    'desktop/admin-home': '[로그인·QA 풀 계정] 관리 홈 `/admin` — 이벤트 목록 40개·초안 영역. 관리자 이메일은 자동 지움, "관리자가 맞습니까?" 확인 모달은 클라이언트 전용 버튼으로 통과. QA 워크스페이스라 슬러그가 qa-…',
    'desktop/admin-event': '[로그인·QA 풀 계정] 참여 데이터·경품 확률/재고 `/admin/events/qa-chromium-roulette` — 참여 통계·경품별 현황(가중치 17%·재고·소진율)·운영 제어(가중치 수정·일 한도)·날짜별 참여 로그·당첨자 명단. 발행번호 `E0J27JHV`→`A7K2M9QX` 가짜 값(textMap), 당첨자 이름은 원래 "—"·번호 "기기 참여"',
    'desktop/admin-event-control': '[로그인] 위 이벤트 상세에서 "운영 제어"(이벤트 상태·대체 경품·가중치(확률) 수정·경품별 일 당첨 한도) 구간으로 스크롤한 첫 화면 — 확률·재고 입력 UI',
    'desktop/admin-qr-modal': '[로그인] "배포용 QR 내보내기" 모달 — 공개 URL QR. QR 캔버스는 가림(qrSelectors canvas)이라 빈 사각형',
    'desktop/admin-members': '[로그인·QA 풀 계정] 관리자 초대 `/admin/members` — 좌석 "4석 중 1석", 초대 링크 만들기·보낸 초대·관리자 목록. 이메일은 자동 지움',
    'mobile/landing': '랜딩 `/` 모바일 390',
    'mobile/pricing': '요금제 `/pricing` 모바일 390',
    'mobile/event-roulette': '완성 이벤트 ① 룰렛 `/e/demo-roulette-mz-bright` 모바일 390 — 가린 것 없음(공개 시연 이벤트)',
    'mobile/event-scratch': '완성 이벤트 ② 스크래치 `/e/demo-scratch-premium` 모바일 390',
    'mobile/event-quiz': '완성 이벤트 ③ OX 퀴즈 `/e/demo-quiz-minimal` 모바일 390',
    'mobile/event-stamp': '완성 이벤트 ④ 스탬프·출석 `/e/demo-stamp-mz-bright` 모바일 390',
    'mobile/event-roulette-sms': '문자 인증 칸이 보이는 룰렛 이벤트(휴대폰 번호·인증번호 버튼) 모바일 390 — **응답 가공**: 운영 시연 이벤트는 auth.phone=false 로 발행돼 칸이 없어, 문서 응답의 config.auth.phone 한 값만 true 로 바꿈(코드 lib/showcase/demos.ts:94 의 값)',
}
HEADER = {
    'desktop/header.png': '고정 헤더(마케팅 SiteHeader sticky) 스크롤된 상태 · desktop',
    'mobile/header.png': '고정 헤더 스크롤된 상태 · mobile',
}

def pg(f):
    for base, desc in PAGES.items():
        if f.startswith(base + '-full.') or f.startswith(base + '-view.'):
            which = 'full(끝까지 스크롤한 전체)' if '-full.' in f else 'view(첫 화면 스크롤 0 — 스크롤한 구간 화면은 위 설명대로)' if base.endswith('control') else 'view(첫 화면 스크롤 0)'
            ext = '' if f.endswith('.png') else ' 곁 json(요소 사각형·글자·pii_scan)'
            return f'{desc} · {which}{ext}'
    return None

STATE = {
    'states/roulette-play': ('룰렛 참여 상태 흐름(모바일 390, scrollY 380) — 단계 {step}. play_event(Supabase RPC) 응답을 가짜로 채움(당첨 "스타벅스 아메리카노"; spinning 은 응답을 잡아 둔 "돌리는 중…")', 'POST /rest/v1/rpc/play_event 가짜 1건'),
    'states/sms-verify': ('문자 인증 상태 흐름(모바일 390, scrollY 420) — 단계 {step}: 번호 입력→인증번호 받기→인증번호 6자리→인증 완료. send-code·verify-code 응답 가짜(문자 미발송), 응답 가공(auth.phone=true)·입력 번호는 가짜 1000000000 을 010-****-**** 로 표시', 'send-code·verify-code·session-verify 가짜'),
    'states/scratch-play': ('스크래치 참여 상태 흐름(모바일 390, scrollY 250) — 단계 {step}. play_event 가짜 응답(당첨 "스타벅스 1만원권"), 은박은 마우스 드래그로 실제로 긁음', 'play_event 가짜 1건'),
    'states/quiz-play': ('OX 퀴즈 참여 상태 흐름(모바일 390, scrollY 150) — 단계 {step}. 문항·정답 판정은 라이브 코드대로, 마지막 play_event 응답(quiz_passed·score 3/3·해설)은 가짜', 'play_event 가짜 1건'),
    'states/stamp-collect': ('스탬프·출석 상태 흐름(모바일 390, scrollY 200) — 단계 {step}. 하루 1번 적립이라 단계마다 새 방문을 가정해 GET /api/stamp/status·POST /api/stamp/accrue 응답을 가짜로 채움(1→3→4→5칸, 완주 시 당첨 연출). 가짜 값: 도장 개수', 'stamp accrue·status 가짜'),
    'states/admin-invite': ('관리자 초대 상태 흐름(데스크톱 1440, scrollY 0) — 단계 {step}. POST /api/invite 가짜 응답(링크 미발급·DB 쓰기 없음). 발급 링크 글자는 URL 가림 규칙으로 지워져 입력칸이 빈 상태', 'POST /api/invite 가짜 1건'),
}

def state_desc(f):
    for base, (desc, _) in STATE.items():
        if f.startswith(base + '/'):
            step = re.sub(r'\.(png|json)$', '', os.path.basename(f))
            return desc.format(step=step) + (' 곁 json' if f.endswith('.json') else '')
    return None

SEQ = {
    'roulette-spin-win': '룰렛 회전→당첨 6.0s 60fps(모바일 1170×2532) · 방식: page.clock 가상 시간 1/60초씩 runFor + getAnimations currentTime 동기화(회전 애니메이션은 시계에 묶임 — 확인함), 프레임마다 스크린샷 → H.264 CRF 12. play_event 가짜 응답(당첨). 시작은 영상 0프레임에 "룰렛 시작" 클릭',
    'scratch-reveal': '스크래치 긁기→당첨 공개 6.0s 60fps(모바일 1170×2532) · 방식: page.clock 가상 시간 1/60초씩 + 프레임마다 마우스 한 걸음(실제 포인터 이벤트로 은박을 긁음), H.264 CRF 12. play_event 가짜 응답. "스크래치 시작" 클릭은 영상 시작 전(응답이 먼저 도착)',
}

MEDIA = {
    'media/wordmark-header.png': '헤더 워드마크 "mai-eventic"(Paperlogy 900) 라이브 렌더 원본(DSF2). 별도 로고 SVG/PNG 원본이 없다 — components/marketing/SiteHeader.tsx:56',
}

out = ['# maieventic shots — 파일마다 한 줄', '',
       '촬영: Playwright 1.64.1(chromiumSandbox), 운영 https://mai-eventic.com. 공개 화면은 비로그인, 관리자 화면은 QA 풀 계정(~/.q1r/qa-pool.json — 값 미출력)으로 **로그인 POST 1회**(`POST …supabase.co/auth/v1/token` 허용, 이후 세션 재사용). 모든 비GET 요청은 guard 가 가로챔·`/e` 진입 비콘 가로채기·DNT 신호. 서버가 GET 렌더 중 쓰는 `/create` 와 `/api/stamp/store-qr` 는 열지 않았다(BLOCKED.md). 문자(send-code·verify-code·notify-win·session-verify)·play_event·AI 는 전부 가짜 응답(운영 호출 0). 가린 것: 푸터 사업자 정보 블록(상호·대표자·사업자번호·통신판매업·주소·대표전화·이메일·책임자)·사업자정보확인 링크 visibility:hidden, 챗 위젯 FAB·오류/의견 FAB 숨김, 이메일·도메인·URL 글자 자동 제거, 관리자 QR 캔버스 가림. 가짜 값: 발행번호 1개(관리자 이벤트 상세)·게임 결과/적립 개수·입력 번호 표시(010-****-****). 모든 PNG 곁 .json 의 pii_scan.total = 0.', '']
files = []
for dp, dns, fns in os.walk('.'):
    if dp.startswith(('./capture', './tmp')):
        continue
    for fn in fns:
        files.append(os.path.relpath(os.path.join(dp, fn), '.'))
files.sort()
miss = []
for f in files:
    if f in ('shots.md', 'contact.jpg', 'BLOCKED.md', 'RECON.md', 'facts.md', 'brand.json', 'ocr-report.txt'):
        continue
    d = None
    if f.startswith(('desktop/', 'mobile/')):
        if os.path.basename(f) in ('header.png', 'header.json'):
            key = f.replace('.json', '.png')
            d = HEADER[key] + ('' if f.endswith('.png') else ' · 곁 json')
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
        b = os.path.basename(f)
        if f in MEDIA:
            d = MEDIA[f]
        elif f == 'media/wordmark-header.json':
            d = '워드마크 렌더 곁 json'
        elif f.startswith('media/icons/'):
            src = 'public/apple-touch-icon.png' if b == 'apple-touch-icon.png' else 'public/brand/' + b
            d = '앱 아이콘·파비콘 원본 ← 레포 ' + src
        elif f.startswith('media/fonts/'):
            d = '마케팅 서체 Paperlogy 서브셋 woff2 원본 ← 레포 public/fonts/' + b
        elif f.startswith('media/landing-gallery/'):
            d = '랜딩 게임 갤러리 실캡처(게임별 main·game·result, @2x 포함) 원본 ← 레포 public/landing-gallery/' + b
        elif f.startswith('media/builder-captures/'):
            if b.startswith('journey-'):
                d = '랜딩 "만드는 순서"에 쓰는 실제 /create 빌더 캡처 원본 ← 레포 public/journey/ui/' + b[len('journey-'):] + ('(2880×1800)' if b[8:10] in ('01', '02', '03', '04') else '(폰 화면)')
            else:
                d = '빌더 "만드는 방법" 가이드용 실제 /create 화면 조각(AI 대화·질문·디자인·경품 등) 원본 ← 레포 public/howto/' + b + ' — /create 를 운영에서 열 수 없어 이것이 빌더 화면의 대체 원본(BLOCKED.md)'
    if d is None:
        miss.append(f)
        continue
    out.append(f'- `{f}` — {d}')
if miss:
    print('설명 없는 파일:', *miss, sep='\n  ')
    sys.exit(1)
open('shots.md', 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('shots.md', len(out) - 3, '줄')
