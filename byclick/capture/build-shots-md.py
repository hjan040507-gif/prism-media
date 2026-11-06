#!/usr/bin/env python3
"""byclick/shots.md 를 만든다 — 폴더의 모든 PNG·MP4·JPG·SVG·WEBP 를 한 줄씩(파일 이름 그대로). 설명은 아래 규칙표.
사용: python3 byclick/capture/build-shots-md.py"""
import os, re, json
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FOOT = '법정표시 푸터(상호·대표자·사업자번호·통신판매업·주소·전화·이메일)는 visibility:hidden + 숫자 조각 치환'
ZERO = '가로챈 비GET 0 · 운영 쓰기 0'

RULES = [
    (r'^mobile/landing-(full|view)\.png$', '운영 랜딩 `/`(모바일 390, 11-04 배포 sian-v9). 히어로·LIVE 경매 카드·HOW IT WORKS·판매 선택(즉시/위탁/반환)·FAQ. 가림: ' + FOOT + ', 후기 이름 「장O규」→「김○○」. LIVE 카드는 운영에서 진행 중이던 실제 경매 1건(대림 엠보이 125 · 정면 검수 사진, 번호판 안 보임을 육안 확인). 가짜 값 없음. ' + ZERO),
    (r'^mobile/apply-(full|view)\.png$', '운영 `/my/apply`(로그인 없이 열림) 1단계 「견적 확인」 — 제조사·모델·연식·주행거리·옵션·사고이력·바이크 사진 등록·신청자 정보·동의. 입력 전 상태. 가림: ' + FOOT + '. 전화 입력칸 안내문(010-0000-0000)은 자동으로 010-****-**** 로 치환됨. ' + ZERO),
    (r'^mobile/login-(full|view)\.png$', '운영 `/my/login`(내 신청 보기) 문자 인증 입력 화면, 입력 전. 인증번호 받기는 누르지 않음(문자 발송 방지). 가림: ' + FOOT + '. ' + ZERO),
    (r'^mobile/header\.png$', '운영 랜딩 고정 헤더(스크롤된 상태) 한 줄 — 로고·내 신청 보기·메뉴. 가림 없음. ' + ZERO),
    (r'^desktop/dealer-login-live-(full|view)\.png$', '운영 `/dealer/login`(데스크톱 1440) 매입업체 로그인 화면 — 「입찰은 밀봉 방식이며 업체마다 3번까지」 소개 글이 보임. 로그인은 하지 않음(입력·제출 0). 가림: ' + FOOT + '. ' + ZERO),
    (r'^desktop/dealer-signup-live-(full|view)\.png$', '운영 `/dealer/signup`(데스크톱 1440) 매입업체 가입 화면, 입력 전. 제출 안 함. 가림: ' + FOOT + '. ' + ZERO),
    (r'^desktop/admin-login-live-(full|view)\.png$', '운영 `/admin/login`(데스크톱 1440) 관리자 로그인 화면, 입력 전. 로그인·2단계 인증은 하지 않음. 가림: ' + FOOT + '. ' + ZERO),
    (r'^states/maker-autocomplete/01-closed\.png$', '상태 흐름 maker-autocomplete(모바일 390 · scrollY 300) 1/6: `/my/apply` 제조사 칸 닫힘. 운영 라이브, ' + ZERO),
    (r'^states/maker-autocomplete/02-sheet-open-all\.png$', '상태 흐름 maker-autocomplete 2/6: 제조사 선택 시트 열림 — 검색칸 + 전체 제조사 목록(운영 SSR 150개). ' + ZERO),
    (r'^states/maker-autocomplete/0([345])-typed-.+\.png$', '상태 흐름 maker-autocomplete: 검색칸에 한 글자씩 입력(야 → 야마 → 야마하), 목록이 거른 결과로 줄어듦. 실제 키 입력(pressSequentially). ' + ZERO),
    (r'^states/maker-autocomplete/06-maker-selected\.png$', '상태 흐름 maker-autocomplete 6/6: 「야마하」 선택 완료. ' + ZERO),
    (r'^states/bike-info-input/01-maker-selected\.png$', '상태 흐름 bike-info-input(모바일 390 · scrollY 300) 1/7: 제조사 선택 후 모델 입력 전. 운영 라이브. ' + ZERO),
    (r'^states/bike-info-input/0([2-5])-model-.+\.png$', '상태 흐름 bike-info-input: 모델 칸에 N → NM → NMA → NMAX 한 글자씩 입력. 운영 모델 칸은 직접 입력(자동완성 팝업 없음 — 확인함). ' + ZERO),
    (r'^states/bike-info-input/06-year-selected\.png$', '상태 흐름 bike-info-input 6/7: 연식 2023년 선택. ' + ZERO),
    (r'^states/bike-info-input/07-mileage-typed\.png$', '상태 흐름 bike-info-input 7/7: 주행거리 8,500 입력. 신청 제출·견적 요청은 누르지 않음. ' + ZERO),
    (r'^states/photo-register/01-photo-block\.png$', '상태 흐름 photo-register(모바일 390) 1/3: `/my/apply` 「바이크 사진 등록」 블록(필수 4장 · 추가 6장, 0/10장). 촬영 가이드에 가장 가까운 공개 화면(웹에 별도 촬영 가이드 화면 없음). ' + ZERO),
    (r'^states/photo-register/02-photo-sheet-open\.png$', '상태 흐름 photo-register 2/3: 「사진 등록하기」 시트 열림 — 좌측·우측·계기판·차량등록증 4슬롯(필수) + 추가 사진. 사진 선택·업로드는 누르지 않음. ' + ZERO),
    (r'^states/photo-register/03-photo-sheet-bottom\.png$', '상태 흐름 photo-register 3/3: 시트 안을 끝까지 내림 — 추가 사진 6칸 + 필수 사진 0/4장 + 「사진 등록 완료」. ' + ZERO),
    (r'^states/process-steps/01-estimate\.png$', '상태 흐름 process-steps(모바일 390) 1/4: 운영 랜딩 HOW IT WORKS 1단계 「모의견적」(예상 소요 0.5일). 6단계가 아니라 4단계 안내 — 6단계(신청 접수·픽업·차량 검수·경매 진행·판매 확정·정산 완료)는 로그인 뒤 `/my` 에만 있어 BLOCKED.md. ' + ZERO),
    (r'^states/process-steps/02-pickup\.png$', '상태 흐름 process-steps 2/4: 2단계 「무료픽업」(1일, 픽업 일정 선택 달력 예시). ' + ZERO),
    (r'^states/process-steps/03-inspection\.png$', '상태 흐름 process-steps 3/4: 3단계 「검수」(0.5일, 검수 리포트 화면 예시). ' + ZERO),
    (r'^states/process-steps/04-auction-and-choice\.png$', '상태 흐름 process-steps 4/4: 4단계 「전국최고가 경매 및 입금」(3일) — 상위 제안가 TOP 3(A모터스·B모터스·C모터스, 운영 화면의 시연용 예시 금액)과 판매 방식 선택(즉시판매·위탁판매·차량반환). 「화면과 금액은 시연용 예시」 문구 포함. ' + ZERO),
    (r'^seq/process-carousel\.mp4$', 'seq: 운영 랜딩 HOW IT WORKS 캐러셀이 2단계로 넘어가는 3초(모바일 390, 1170×2532). 방식 = page.clock 1/60초씩 runFor + getAnimations currentTime 동기화 프레임 180장 → H.264 CRF 12 · 60fps. 같은 화면 위쪽에 실시간 LIVE 카운트다운이 같이 흐름. ' + ZERO),
    (r'^seq/process-carousel-(first|last)\.png$', 'seq process-carousel 의 첫/끝 프레임 PNG. ' + ZERO),
    (r'^pdf/performance-record\.png$', 'PDF 「성능·상태 점검기록부」 첫 쪽(전 3쪽) 200dpi. 레포 `src/lib/pdf/data.ts loadPerformanceDoc` + `render.tsx renderPerformancePdf` 를 가짜 DB(mock-supabase)로 그대로 실행. 가짜 데이터(차량·주행거리·상태값 전부 지어낸 값, 차량번호는 「12가 ****」). 머리 회사 정보: 사본의 company-info 에서 대표자 「김○○」·사업자번호 「○○○」 자리·주소 시·구까지·이메일 제거로 치환(레포 원본 무변경). pdftotext 전체 글자 PII 정규식 0건.'),
    (r'^pdf/won-confirmation\.png$', 'PDF 「낙찰 확인서」 첫 쪽(1쪽) 200dpi. 레포 loadWonDoc + renderWonPdf 를 가짜 DB 로 실행. 가짜 값: 낙찰가 5,280,000원 · 운송료 155,000원 · 총 5,435,000원(그럴듯한 가짜), 딜러 「A모터스」·대표자 「김○○」, 입금 계좌는 「계좌 안내 준비 중」(환경변수 없음). 머리·꼬리 회사 정보 치환은 위와 같음. pdftotext PII 0건.'),
    (r'^pdf/settlement-statement\.png$', 'PDF 「판매 정산서」 첫 쪽(1쪽) 200dpi. 레포 loadSettlementDoc + renderSettlementPdf 를 가짜 DB 로 실행. 가짜 값: 판매금액·최종 지급액 5,280,000원(그럴듯한 가짜), 고객 「윤○○」, 차량번호 「65아 ****」. pdftotext PII 0건.'),
    (r'^media/live/logo\.png$', '미디어: 운영 로고 `https://byclick.co.kr/sian-v9/logo.png`(11-05 GET, 131,924B). 운영 sian-v9 소비자 화면의 로고.'),
    (r'^media/live/main_img\.jpg$', '미디어: 운영 히어로 `https://byclick.co.kr/sian-v9/main_img.jpg`(11-05 GET, 65,606B).'),
    (r'^media/live/process-bmw-2\.jpg$', '미디어: 운영 HOW IT WORKS 사진 `/sian-v9/process-bmw-2.jpg`(11-05 GET, 31,338B).'),
    (r'^media/repo/byclick-(wordmark|wordmark-dark|lockup|lockup-hero|mark-black|mark-graphite|mark-orange|app-icon-1024)\.(png|webp)$', '미디어: 레포 로고 원본 `public/brand/` 의 같은 이름 파일 복사(SVG 원본 없음 — PNG/WebP). 레포 HEAD 863d2c26.'),
    (r'^media/repo/(hero-bike|step-[1-4]-[a-z]+|og)\.jpg$', '미디어: 레포 `public/photos/`(또는 `public/og.jpg`) 복사 — 히어로·거래 4단계 사진. 레포 HEAD 863d2c26. 쓰기 전 `docs/ASSETS-LICENSES.md` 확인 필요.'),
    (r'^media/repo/(pickup|inspect|choose)\.svg$', '미디어: 레포 `public/media/consumer/pictogram/` 픽토그램 SVG 복사(무료픽업·검수·선택).'),
    (r'^contact\.jpg$', '이 프로젝트 전 캡처를 줄여 모은 한 장(`python3 tools/contact.py byclick`).'),
]

def describe(rel):
    for pat, d in RULES:
        if re.search(pat, rel):
            return d
    extra = os.path.join(ROOT, 'capture', 'shots-extra.json')
    if os.path.exists(extra):
        ex = json.load(open(extra, encoding='utf8'))
        for pat, d in ex:
            if re.search(pat, rel):
                return d
    return None

files = []
for dp, dn, fns in os.walk(ROOT):
    if '/capture' in dp or '/.git' in dp:
        continue
    for fn in fns:
        if fn.lower().endswith(('.png', '.mp4', '.jpg', '.svg', '.webp')):
            files.append(os.path.relpath(os.path.join(dp, fn), ROOT))
files.sort()
lines = ['# byclick shots', '',
         '운영(https://byclick.co.kr) 직접 촬영 = 소비자 모바일 화면(`mobile/` · `states/` 중 maker-autocomplete·bike-info-input·photo-register·process-steps · `seq/` · `desktop/*-live-*`). 로컬 사본+가짜 Supabase 촬영 = 딜러·관리자 화면과 PDF(`desktop/dealer-*`·`desktop/admin-*`·`states/sealed-bid`·`pdf/`) — 가짜 데이터.',
         '규격: 데스크톱 1440×900@2 · 모바일 390×844@3. 모든 PNG 옆 .json(요소 사각형·글자·scrollY·viewport·pii_scan·intercepted). 운영 접속은 전부 GET, 비GET 가로챔 합계는 json 의 intercepted.', '']
missing = []
for rel in files:
    d = describe(rel)
    if d is None:
        missing.append(rel); d = '(설명 추가 필요)'
    lines.append(f'- `{rel}` — {d}')
open(os.path.join(ROOT, 'shots.md'), 'w', encoding='utf8').write('\n'.join(lines) + '\n')
print('files', len(files), 'no-description', missing)
