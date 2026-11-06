#!/usr/bin/env python3
"""okjob/shots.md 를 만든다 — 파일 이름이 그대로 들어간 한 줄 설명(check.py 가 대조). 사용: python3 okjob/capture/60-shots-md.py"""
import os, glob, json
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
P = os.path.join(ROOT, 'okjob')

HEAD = """# okjob shots — 오케이잡 제주(계절근로자 배정·급여) 2차 촬영 2026-11-06

## 촬영 방식 (먼저 읽기)
- **운영에는 접속하지 않았다.** 운영 주소(okjob-jeju.kr · supabase.co)로 가는 요청은 0건이다(`capture/common.mjs` assertLocal 이 로컬 아닌 호스트 요청을 즉시 멈춘다). 운영 로그인 0회.
- 사본 `git -C ~/Okjob archive HEAD`(ea28ba36) → `tmp/okjob-src` + 로컬 Supabase(project_id pm-okjob · 포트 57010~57016, 도커) + 앱 `127.0.0.1:3611`. 마이그레이션 78개 전부 적용, 시드는 `supabase/seeds/base.sql`(기수·숙소·작업·단가) + 사본의 `scripts/seed-dev.ts`(막힘 2줄 제거 · 이름을 가림 꼴로 바꿈) + `capture/seed-extra.sql`·`seed-extra2.sql`(입금·알림톡 이력·기간 배정). 접속 주소 확인 출력은 `capture/local-db-check.txt`.
- **로컬 로그인 계정은 로컬 Supabase auth 에만 만든 가짜 계정**이다(운영 계정 아님, 이름은 「김○○」·「이○○」). 로그인은 로컬 앱에서 1번(POST /login 을 guard 로 허용, 로컬 DB 인증 행).
- 앱은 `next dev`(webpack, 로컬 사본)로 띄웠다 — 서버가 다른 세션 부하로 `heavy-run` 빌드 자리가 1시간 넘게 안 열려 prod 빌드(`next build`) 대신 dev 로 찍었다. 개발 배지·오버레이는 도구가 숨긴다. 화면(Tailwind·폰트·구성)은 prod 와 같지만 번들이 다르다.
- **가짜 값**: 농가·근로자·배정·입금·청구액·알림톡 이력·단가 전부 시드가 만든 지어낸 값이다. 농가 이름은 「김○○」「이○○」(성+○○, 실제 시드 농가명과 겹치지 않게 바꿈), 근로자 이름은 「J○○ S○○」꼴, 전화는 화면에서 `010-****-****`. 단가표는 `base.sql` = 고객 확정 기준값이라 가짜가 아니라 **실제 설정값 그대로**(영업 수치가 아니라 공개 가능한 단가표인지는 주 세션 판단 필요 — facts.md 끝 참고).
- 알림톡·SOLAPI·CONFIRM_BASE_URL 등 발송 env 는 앱에 넣지 않았다(`NOTIFY_PROVIDER` 없음 = mock). 알림톡 화면 위의 「지금은 예약만 쌓입니다… mock」 안내와 「실제 발송 꺼짐」 배지는 이 상태에서 앱이 실제로 그리는 문구다(지우지 않음, 영상에서 자르면 된다). 발송 라우트(`/api/notify/send-on-save`·`send-now`)는 guard 로 가로챈다.
- 가로챈 요청 합계 0(촬영 중 비GET 은 로그인 외 발생하지 않음 — 저장·확정·발송 버튼은 한 번도 누르지 않았다). 허용한 비GET = 로컬 앱 로그인 1회 + Supabase 읽기 전용 RPC(STABLE 함수 — `farm_assignment_history`·`assignment_batch_list` 등, 조회 POST) — 각 json 의 allowed_nonget 에 기록.
- 전체 화면(`*-full.png`)의 왼쪽 사이드바는 화면 높이(100vh)에 붙어 있어 긴 페이지에서는 첫 화면 높이까지만 그려진다(실제 서비스 구조 그대로, 영상에서는 콘텐츠 영역만 쓰거나 사이드바를 첫 화면 것으로 겹치면 된다).

## 지시와 실제 화면 이름이 다른 곳 ('지시의 ○○ = 실제 △△')
- 지시의 '월간 대시보드(가동률 히트맵)' = 실제 「월간 현황」(`/dashboard`) — 히트맵은 별도 화면이 아니라 달력 날짜 칸 안의 미니 가동률 게이지.
- 지시의 '중복 배정 경고' = 실제 차단이 아니라 확인창(「이미 배정된 근로자입니다 · 추가로 배정」). 같은 날 2건은 고객 확정 사양이라 허용된다.
- 지시의 '저장된 배정 4탭(일별·월별·근로자별 매트릭스·기간)' = 실제 탭 「일별」「월별」「근로자별」「기간 배정」. 「월별」은 매트릭스가 아니라 날짜별 한 줄 목록이고, 매트릭스는 「근로자별」 탭.
- 지시의 '설정(단가표)' = 실제 「시간 단가」·「일당 단가」 두 탭(설정 탭은 모두 6개).
- 지시의 '알림톡 발송 관리' = 실제 메뉴 「알림톡 발송」(`/notifications`, 탭 확인 현황·예약·이력).
- 지시의 '모바일 PWA 홈' = 별도 모바일 홈 화면은 없고 PWA 시작 주소 `/dashboard`(`public/manifest.json` start_url)의 390px 반응형 화면.
- 지시의 '배정 건수(엑셀 이관)' = 전제 불성립 — 엑셀에서 옮긴 것은 근로자 187명·농가이고 배정은 앱에서 손입력(facts.md 4번).

## 파일
"""

DESC = {
 'desktop/dashboard': '데스크톱 월간 현황(`/dashboard`) — KPI 4칸 + 달력 칸마다 미니 가동률 게이지(히트맵) + 우측 유휴 인원·그날 배정·만료 임박. 가림 꼴 이름, 가짜 데이터.',
 'desktop/assign': '데스크톱 배정하기 하루 배정(`/assign`) 빈 상태 — 날짜·픽업·작업·시간 + 가용 인원 자동 계산 게이지 + 근로자 칩 그리드.',
 'desktop/assign-batch': '데스크톱 기간 배정(`/assign` 「기간 배정」 토글) — 농가를 고른 뒤 기간·요일·작업 조건과 근로자 선택 영역.',
 'desktop/assignments-day': '저장된 배정 「일별」 탭(`/assignments?date=2026-11-06`) — 그날 농가별 명단.',
 'desktop/assignments-month': '저장된 배정 「월별」 탭 — 날짜별 한 줄 목록(농가 수·인원·남여·미발송·발송됨·농가 확인·취소).',
 'desktop/assignments-worker': '저장된 배정 「근로자별」 탭 = 근로자×날짜 매트릭스(칸마다 농가명, 휴무 REST, 도시락 .도, 스프레이 S).',
 'desktop/assignments-batch': '저장된 배정 「기간 배정」 탭 — 기간 배정 묶음 목록(로컬 RPC create_assignment_batch 로 만든 2건, 가짜).',
 'desktop/payroll': '급여 계산(`/payroll`) — 지난달(10월) 기준 근로자별 근무일수·지급액·실수령액. 가짜 단가 스냅샷 계산.',
 'desktop/payments': '입금 확인(`/payments`) — 이번 달 청구액·입금액·미수금, 날짜별 농가 입금 표시(입금 금액은 청구 합계와 같게 넣은 가짜).',
 'desktop/notifications': '알림톡 발송(`/notifications`) 「확인 현황」 탭 — 내일 배정 농가의 확인·미확인·발송 전. 이력 행은 provider=mock 가짜(실제 발송 0).',
 'desktop/settings-hours': '설정 「시간 단가」 탭 — 기수별 시간×성별 단가표(`base.sql` 고객 확정 기준값).',
 'desktop/settings-wages': '설정 「일당 단가」 탭 — 고정 단가(스프레이 지급·청구액, `base.sql` 값).',
 'mobile/dashboard': '모바일 390 월간 현황 = PWA 시작 주소 `/dashboard`(헤더 햄버거 서랍, KPI 2×2, 달력).',
 'mobile/assign': '모바일 390 배정하기(`/assign`) — 빈 상태.',
}
FLOW = {
 'assign-flow': '배정하기 데스크톱(scrollY 0 고정, 1440) — ',
 'assign-duplicate-confirm': '중복 배정 확인(데스크톱, scrollY 0) — ',
 'matrix-hover': '근로자별 매트릭스 hover 행·열 강조(데스크톱, scrollY 0, 가로 스크롤 영역 안 칸 3곳 이상을 차례로 hover) — ',
 'm-assign-flow': '모바일 390 배정하기(scrollY 200 고정) — ',
}
STEP = {
 'empty-form': '1단계 빈 폼(농가 선택 전).',
 'farm-search': '2단계 농가 검색 입력 중(후보 목록).',
 'farm-selected-auto-recommend': '3단계 농가 선택 — 희망 인원·이력 + 「자동 추천」 카드(경험자 우선 5명).',
 'farm-selected': '3단계 농가 선택 후.',
 'task-and-hours': '4단계 작업 「선과」·6시간으로 바꿔 단가·가용 인원 재계산.',
 'recommend-applied': '5단계 「추천 그대로 적용」 — 칩 5명 선택, 요약 5/5 충족(저장 전).',
 'before-save': '6단계 저장 직전(「배정 저장」 활성, 버튼 위에 마우스만 올림 — 누르지 않음).',
 'recommend-applied': '4단계 「추천 그대로 적용」 — 위쪽 요약 줄이 「선택 4명」으로 바뀌고 이미 배정 수가 늘어남(칩 그리드는 화면 아래, 저장 전).',
 'farm-selected-dotted-chips': '1단계 농가 선택 — 점 표시 칩 = 이미 다른 농가에 배정된 근로자.',
 'hover-assigned-chip': '2단계 이미 배정된 칩 위에 마우스.',
 'confirm-dialog': '3단계 중복 배정 확인창(「추가로 배정」 / 「취소」) — 확정 버튼은 누르지 않음.',
 'dialog-cancelled': '4단계 「취소」로 닫은 뒤.',
 'matrix-idle': '1단계 hover 전 매트릭스.',
}
SEQ = {
 'assign-auto-recommend': 'seq 4.0초 60fps — 빈 폼에서 농가 이름 입력 → 후보 선택 → 자동 추천 카드 → 「추천 그대로 적용」으로 칩이 채워지는 장면. 방식 page.clock 1/60초 runFor + getAnimations 동기화(recordSeq).',
 'dashboard-day-select': 'seq 3.0초 60fps — 월간 현황 달력에서 12일 → 17일을 눌러 오른쪽 「유휴 인원·그날 배정」이 바뀌는 장면. 방식 page.clock 1/60초 runFor + getAnimations 동기화(recordSeq).',
}
FILES = {
 'day-sheet': '파일 — 일별 배정표 엑셀(2026-11-03, `GET /api/reports/day/export` 로컬 라우트)을 soffice PDF(SinglePageSheets) 첫 쪽 200dpi PNG. 이름은 가림 꼴(「김○○」), 근로자는 사번만.',
 'worker-matrix': '파일 — 근로자별 매트릭스 엑셀(2026-11, `GET /api/reports/matrix/export` 로컬 라우트)을 soffice PDF(SinglePageSheets) 첫 쪽 200dpi PNG(가로로 긴 한 장 6592×1888). 이름은 가림 꼴.',
}
MEDIA = {
 'icon.svg': '앱 아이콘 원본 `public/icons/icon.svg`(별도 로고 파일은 없음).',
 'icon-192.png': '앱 아이콘 `public/icons/icon-192.png`.',
 'icon-512.png': '앱 아이콘 `public/icons/icon-512.png`.',
 'PretendardVariable.woff2': '한글 UI 폰트 원본 `src/fonts/PretendardVariable.woff2`.',
 'JetBrainsMono.woff2': '숫자·코드 폰트 원본 `src/fonts/JetBrainsMono.woff2`.',
}
HDR = '고정 헤더(사이드바·상단 검색줄)가 없는 페이지는 만들어지지 않는다. header.png 는 스크롤된 상태의 상단 줄.'

lines = [HEAD]
def add(rel, text):
    lines.append(f'- `{rel}` — {text}')
for f in sorted(glob.glob(P + '/desktop/*.png')):
    rel = os.path.relpath(f, P); stem = rel[:-4]
    if stem.endswith('-full') or stem.endswith('-view'):
        base = stem.rsplit('-', 1)[0]; kind = '끝까지 스크롤한 전체' if stem.endswith('full') else '첫 화면(scrollY 0)'
        add(rel, f'{DESC.get(base, base)} [{kind}]')
    elif stem.endswith('header'):
        add(rel, '데스크톱 상단 고정 줄(스크롤된 상태의 헤더만).')
for f in sorted(glob.glob(P + '/mobile/*.png')):
    rel = os.path.relpath(f, P); stem = rel[:-4]
    if stem.endswith('-full') or stem.endswith('-view'):
        base = stem.rsplit('-', 1)[0]; kind = '끝까지 스크롤한 전체' if stem.endswith('full') else '첫 화면(scrollY 0)'
        add(rel, f'{DESC.get(base, base)} [{kind}]')
    elif stem.endswith('header'):
        add(rel, '모바일 상단 고정 줄(스크롤된 상태).')
for f in sorted(glob.glob(P + '/states/*/*.png')):
    rel = os.path.relpath(f, P); flow = rel.split('/')[1]; step = os.path.basename(f)[3:-4]
    d = STEP.get(step)
    if d is None and step.startswith('hover-cell-'):
        parts = step.split('-')  # hover-cell-N-workerX-MM-DD
        d = f'{parts[2]}번째 hover — 근로자 {parts[3].replace("worker", "")}번 행 × {parts[4]}월 {parts[5]}일 열이 강조(날짜 머리·사번 머리 현무암색 + 같은 행·열 옅은 밴드).'
    add(rel, FLOW.get(flow, flow) + (d or step))
for f in sorted(glob.glob(P + '/seq/*.mp4')):
    rel = os.path.relpath(f, P); add(rel, SEQ[os.path.basename(f)[:-4]])
for f in sorted(glob.glob(P + '/seq/*-first.png')) + sorted(glob.glob(P + '/seq/*-last.png')):
    rel = os.path.relpath(f, P); add(rel, '위 seq 의 ' + ('첫' if f.endswith('first.png') else '끝') + ' 프레임 PNG.')
for f in sorted(glob.glob(P + '/files/*.png')):
    rel = os.path.relpath(f, P); add(rel, FILES[os.path.basename(f)[:-4]])
for f in sorted(glob.glob(P + '/media/*')):
    rel = os.path.relpath(f, P); add(rel, MEDIA.get(os.path.basename(f), '원본'))
lines.append('- `brand.json` — 주색 #E8722C(감귤)·보조 #1A1D21(현무암)·폰트 Pretendard Variable / JetBrains Mono, 근거 file:line.')
lines.append('- `contact.jpg` — 프로젝트 전 캡처를 축소한 모음(`python3 tools/contact.py okjob`).')
lines.append('- `capture/` — 촬영 스크립트(dbcheck.sh·env.sh·common·00-login·10-desktop·20-flows·30-mobile·40-export·41-files·50-seq·60-shots-md)·시드 SQL(seed-extra·seed-extra2)·`local-db-check.txt`(시드 직전 접속 주소 확인 출력). 비밀값 없음(계정 값은 tmp 의 환경 파일에서 읽음).')
open(P + '/shots.md', 'w', encoding='utf8').write('\n'.join(lines) + '\n')
print('shots.md lines', len(lines))
