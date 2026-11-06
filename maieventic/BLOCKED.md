# maieventic BLOCKED / 보고할 것 (2026-11-06)

## A. 못 채운 것

### 1. 빌더 화면 전부 — AI 대화 기획 · 디자인 자동 생성 3안 · 빌더 편집 · 경품 확률 입력 · 매장 QR 스탬프 빌더
- 사유: 이 화면들은 모두 `/create` 안에 있고(`BriefChat` 는 `app/(builder)/create/CreateClient.tsx` 에서만 쓰임, 3안은 `components/create-v2/*`), **`GET /create` 가 서버에서 DB 에 쓴다**. `app/(builder)/create/page.tsx:150-164` 가 `sess.tenantId` 가 있으면 `recordAnalyticsAfter({eventName:"create_event", … dedupeKey:"create_event:<user>:<KST일>"})` 를 부르고, 구현은 `lib/analytics/record.ts:35-52` 의 `analytics_events` insert(service_role). 그 쓰기를 건너뛰는 조건(봇 UA·헤더·플래그)은 코드에 **없다**(조건은 `sess.tenantId` 뿐). `app/(builder)/layout.tsx:45` 의 `recordVisit`(테스트 기간 activity_log)도 같은 그룹에서 돈다. → 지시대로 운영에서 `/create` 를 열지 않았다(브라우저로 연 횟수 0).
- 시도한 것(코드 확인 2회): ① `create/page.tsx`·`lib/analytics/record.ts` 의 쓰기 조건 확인 ② `(builder)/layout.tsx`·`lib/auth/requireUser.ts` 확인 — 둘 다 건너뛰기 조건 없음.
- 대안(이번에 넣은 것):
  - `media/builder-captures/` — 레포가 랜딩·도움말에 쓰는 **실제 `/create` 화면 캡처 원본** 26장: `ai-name→ai-industry→ai-game→ai-prizes→ai-entry-step→ai-design→ai-content→ai-review→ai-confirm`(AI와 함께 만들기 단계별), `ai-answers`(AI 질문 정리), `mine-*`(내 기획으로 만들기), `journey-01~04`(2880×1800 빌더 전체 화면: 게임 고르기·디자인·편집+미리보기·퍼블리싱), `journey-05-live`(폰 화면). 영상에서 단계 컷으로 겹쳐 쓸 수 있다. 랜딩 full 캡처(`desktop/landing-full.png`)에도 같은 빌더 캡처 4장이 들어 있다.
  - 경품 확률·재고는 빌더가 아니라 관리자 이벤트 상세의 "경품별 현황·운영 제어(가중치 수정·일 한도)"로 촬영(`desktop/admin-event-*`, `admin-event-control-view.png`).
  - AI 대화 응답 재사용 계획(`docs/design/p12d2/step0/briefchat-live-after.json`)은 `/create` 가 필요해 실행하지 못했다 — 가로채기 스크립트는 없다.
- 풀려면(결정 필요): ① 운영 `/create` 를 QA 계정으로 1회 여는 것(analytics 행 1개 쓰기 · 사용자·KST일 디듀프)을 승인하거나, ② 고객 레포 사본을 가짜 인증/DB 로 띄우는 별도 작업(현재 지시는 로컬 실행 금지 — 로컬도 `.env.local` 이 운영 DB).

### 2. 매장별 QR 스탬프 화면
- 사유: (a) 시연 이벤트 4종에는 매장 설정이 없다(`lib/showcase/demos.ts` stamp config 에 stores 없음), (b) QA 풀 계정의 이벤트 40개는 전부 룰렛류(관리 홈 목록 `desktop/admin-home-full.png`)라 스탬프 이벤트·매장 QR 이 없다, (c) 서명 QR 은 `GET /api/stamp/store-qr` 가 DB upsert 라 가로채야 하는데(가드 blockGet 설정함) 보여줄 매장 이벤트가 없다, (d) 매장 입력 빌더(`StepStamp.tsx`)는 `/create` 안(1번).
- 대안: 스탬프 게임 자체의 상태 흐름 `states/stamp-collect/`(0→1→3→4→5칸·완주 당첨), 스탬프 데모 `mobile/event-stamp-*`·`desktop/game-stamp-*`, 관리자 "배포용 QR 내보내기" 모달 `desktop/admin-qr-modal-view.png`(공개 URL QR — QR 가림).

### 3. 디자인 자동 생성 결과(결정론 엔진 3안)·AI 대화 기획 상태 흐름
- 1번과 같은 사유. 상태 흐름은 ≥2 조건을 다른 6개로 채웠다(룰렛 참여·문자 인증·스크래치·퀴즈·스탬프·관리자 초대). "AI 대화 기획 턴 진행" 흐름만 없음.

### 4. 제작 사례 상세 화면 `/showcase/case/marra-gongbang` — 찍었다가 폐기
- 사유: 사례 이미지(고객사 마케팅 이미지) 3번째 장에 고객 도메인이 보이는 브라우저 주소창이 찍혀 있어(`maragongbang…` 글자) 가림 규칙(도메인 글자)을 이미지 안에서는 지킬 수 없다. 데스크톱 쇼케이스 목록(`desktop/showcase-*`)은 썸네일에 주소창이 없어 유지.

### 5. 참고(못 채움은 아님) — 확인해 둔 명세와의 차이
- 문자 인증 화면: 라이브 시연 이벤트 4종(+`summer-roulette-2026`·`qa-d1-moto-roulette`)은 전부 `auth.phone:false` 로 발행돼 문자 칸이 없다. 코드의 시연 정의(`lib/showcase/demos.ts:94`)는 `phone:true`. 그래서 `mobile/event-roulette-sms-*`·`states/sms-verify/` 는 **문서 응답의 `auth.phone` 한 값만 true 로 바꿔** 실제 UI 를 띄웠다(화면 코드·문구는 그대로, 문자는 가짜 응답). 라이브 그대로의 화면이 필요하면 이 장면은 쓰지 말 것.
- 로고 SVG/PNG 원본 없음(텍스트 워드마크) → `media/wordmark-header.png`(라이브 렌더). 히어로 영상 파일 없음(코드 애니메이션 `components/landing/HeroRoulette.tsx`).
- 관리자 화면의 데이터는 QA 계정의 테스트 워크스페이스(슬러그 `qa-…`·경품명 `QA경품N-chromium`)다. 실서비스 화면 같은 데이터가 필요하면 별도 시연 계정이 필요.
- 모바일 상단 헤더는 `mobile/header.png` 있음.

## B. 운영 쓰기 가능성 — 정확히
- **로그인 POST 1회**: QA 풀 계정 #1(`qa-pool-q1b1-1@…`, pro·소유자)로 `POST …supabase.co/auth/v1/token`(비밀번호 로그인) **성공 1회**(`capture/login-save-state.mjs`) — 인증 세션 행이 남는 쓰기. 실패 0(잠금 카운터 영향 없음), `/api/auth/login-hint` 호출 0. 이후 `desktop-admin.mjs` 는 저장한 세션을 재사용했고 세션 갱신 POST 도 허용 목록에 0건(`allowed_nonget` 비어 있음). 세션 파일(`tmp/maieventic-auth/state.json`)은 끝나고 삭제함. 비밀번호는 출력·기록하지 않음(파일을 스크립트가 읽어 메모리로만 사용).
- **가로챈 요청(가짜 응답, 운영 호출 0)**: 흐름별 — roulette-play 1(`play_event`) · sms-verify 3(`session-verify`·`send-code`·`verify-code`) · scratch-play 1 · quiz-play 1 · stamp-collect 7(`stamp/accrue` 4 + `stamp/status` 3, 방문별 가짜) · admin-invite 1(`/api/invite` — 초대 링크는 발급되지 않음) · seq 룰렛 1·스크래치 1 · 문자 칸 페이지 1(`session-verify`). 합계 17건(고유). 그 밖에 촬영 시행착오용 탐색 스크립트에서도 같은 가드로 `play_event` 가짜 응답이 몇 번 있었고 전부 가로챔. **허용한 비GET: 로그인 POST 외 0**(json `allowed_nonget` 전부 `[]`).
- **가로채기로 막은 것(발생 0)**: `/e` 진입 비콘(`/api/beacon`·`/api/analytics/beacon`) blockAll + `navigator.doNotTrack="1"` — 촬영 중 비콘 요청 0건. `GET /api/stamp/store-qr` blockGet(열지도 않음). 문자 발송(`send-code`)·당첨 문자(`notify-win`) 실제 호출 0.
- **서버 렌더 GET 중 쓰기 확인**: 열어 본 로그인 화면은 `/admin`·`/admin/events/qa-chromium-roulette`·`/admin/members` 뿐. `app/admin/layout.tsx`(세션·동의 조회)·각 `page.tsx`·`lib/admin/*`·`lib/auth/requireUser.ts getSessionAdmin`(풀 계정은 `admin_users` 매핑이 이미 있어 `provision_tenant_for_user` 안 탐 — `requireUser.ts:122-123`)에서 insert/update/rpc 쓰기를 찾지 못했다. 관리자 첫 진입 "관리자가 맞습니까?" 확인은 클라이언트 sessionStorage 뿐. (`/admin/events/<slug>/report` 는 열지 않음.) **미확인 가능성**: 관리자 클라이언트 컴포넌트가 부르는 `GET /api/me`·`/api/admin/*` 읽기 라우트의 내부 쓰기(감사 로그 등)는 코드 전부를 추적하지 않았다.
- **공개 읽기 GET**: `/`·`/pricing`·`/showcase`·`/e/demo-*`(4)·`/api/auth/methods` 읽기. 이벤트 페이지 서버 렌더가 조회수를 쓰는지는 코드 근거(RECON: 비콘만 쓴다)로 판단 — 실측으로 확인하지 못함.

## C. OCR 판정
- `python3 tools/ocr.py maieventic -j 4` → 109장 중 걸림 1: `desktop/admin-event-view.png` phone `03***` — 제목 아래 "수집항목 name, phone · 당첨 후 수집" 글줄을 OCR 이 숫자로 잘못 읽은 **오탐**(화면에 번호 없음, DOM pii_scan 0). 조치 없음.
- 미디어 원본(`media/**/*.webp` 26+26장)은 변환해 OCR 로 전화·이메일·URL 을 따로 검사 → 0건.
