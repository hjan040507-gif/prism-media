# byclick(바이클릭) 촬영 전 사전 조사 — RECON

조사 시각 2026-11-05 22:5xZ · 읽기 전용(코드 읽기 + 운영 GET 만 · 브라우저·서버·빌드·DB 쿼리 0) · 비밀값 기록 0.
레포 = `/home/dev/bikeclickofficial` (HEAD `863d2c26` 브랜치 `feat/paid-42` · origin/main = `e3d18e0a`(11-03) · 운영 배포 커밋 `92d2d827` = `docs/deploy-chain.md:5` 「지금」 표). 형제 폴더 `/home/dev/byclick-{alim,ops,play,req1021,sound}` 는 git 저장소가 아니라 문서·증거 폴더다(코드 없음). worktree 는 레포 본체 하나뿐(`git worktree list`).

## 0. 먼저 알아야 할 것 (촬영 방식을 바꾸는 사실 6개)

1. **운영 사이트는 레포 코드와 다르다.** 11-04 15:26 KST 에 회사가 `dpl_8o7Q…`(브랜치 `feat/sian-v9`, 소비자 화면 재디자인)를 운영에 올렸다(`docs/measurements/paid-42-decisions-1104.md:13`, 받은 소스는 11-05 지움). 라이브 랜딩·소비자 화면의 글자·클래스(`by-live-section`, `/sian-v9/logo.png`, 「내 바이크 모의견적」 「전문 검수 리포트」)는 레포 어느 ref 에도 없다(`git grep` main·HEAD 0건, `git log --all -S` 0건). 반대로 딜러·관리자 로그인 화면 글자는 레포와 같다(`DealerLoginIntro.tsx:8`, `admin/login/LoginForm.tsx:25`). → 소비자 화면은 **운영 라이브를 찍어야** 실제와 같다. 레포를 로컬 빌드하면 옛(v3) 디자인이 나온다.
2. **서버에 비밀값이 없다.** 11-05 인계 마무리에서 `.env.local`·`mobile/.env`·`.vercel`·인계 7z·qa 증거 753 파일을 지웠다(`PROGRESS.md:3`). 레포엔 `.env.example` 만 있다. 로컬 실행은 가짜 값 빌드만 가능(`CLAUDE.md` 「비밀값 없이 빌드」 — 랜딩 DB 조회는 빈 값 처리).
3. **고정 테스트 계정이 없다.** 10-28 운영 DB 를 비웠고(`scripts/lib/run-accounts.mjs:3`), 이후 게이트 러너가 service_role 로 시험 계정을 만들고 지우는 방식이다 — 그 키가 지금 서버에 없다. 새 계정은 범위 밖. → 딜러·관리자 로그인 화면(운영)은 사실상 못 찍는다(§4).
4. **스테이징 DB 가 없다.** 로컬 실행도 DB 는 운영을 가리킨다(`.env.example`; QA 저장소 `byclick-qa` 는 증거 업로드용 · `CLAUDE.md` 디스크 규칙 1). 로컬 DB 는 `supabase/migrations` 182개를 docker 로 재생하는 수밖에 없다(`docker`·`supabase` CLI 는 서버에 있음 · 이미지 유무·소요 미확인).
5. **로그인만으로 운영에 쓰기가 남는다**(서버 쪽이라 page.route 로 못 막는다): 관리자 로그인 `admin_sessions` upsert(`src/lib/admin-session.ts:56`), 관리자 화면 GET 의 열람 기록 `admin_access_logs` insert(§5), 소비자 첫 로그인 `consumers` insert(`src/lib/consumer-auth.ts:46,125`).
6. **운영에 진행 중 경매 1건이 실제로 돈다**(2026-11-05 22:5xZ `GET /api/public/live-auctions` → 카드 1장: 대림 엠보이 125 · 2020 · 10,500km · 마감 2026-11-06T05:37Z). 실제 딜러가 입찰 중일 수 있다 — 입찰·알림 경로를 절대 누르지 않는다.

## 1. 스택·실행

| 항목 | 값 · 근거 |
|---|---|
| 프레임워크 | Next.js 16.3.0 App Router · React 19.2.8 · TS 5 · Tailwind 4 · Supabase(`@supabase/ssr` 0.12.4) · `@react-pdf/renderer` 4.6 · exceljs · web-push · `package.json` |
| 패키지 매니저 | npm (`package-lock.json`) |
| 명령 | `npm run build` = `next build && node scripts/build-sw.mjs` · `npm start` = `next start` · 하네스 기준은 `next build && next start -p 3260`(`CLAUDE.md`) · 레포가 로컬 포트로 3260(충돌 시 3263~3269)을 정해 둠 |
| env 이름(필수) | `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY` (`.env.example:7-14`) |
| env 이름(선택) | `NEXT_PUBLIC_SITE_URL` · `CRON_SECRET` · `SEND_SMS_HOOK_SECRET` · `NCP_*` · `SENS_*` · `ALIMTALK_SEND_ENABLED` · `APP_PUSH_ENABLED` · `VAPID_*` · `PORTONE_*` · `ANTHROPIC_API_KEY` · `RECOGNITION_MODEL`/`RECOGNITION_MOCK` · `KAKAO_*REST_KEY` · `COMPANY_BANK_ACCOUNT`(입금 계좌 · 화면에 뜸) · 로컬시험용 `ADMIN_MFA_SCHEDULE_OVERRIDE` `ADMIN_SINGLE_SESSION` `BC_TEST_SWITCHES` `SHOWCASE_INCLUDE_FIXTURES` `DISTANCE_MOCK_METERS` |
| DB 대상 | `.env.local` 의 `NEXT_PUBLIC_SUPABASE_URL` = 운영 Supabase(ap-northeast-2, `/api/health` → `"db":"ap-northeast-2"`). 별도 개발·스테이징 없음 |
| 데모·시드·목업 | ① `app_settings.demo_mode`(DB 값 · `src/lib/demo.ts:1-13`) ② 시드 스크립트 `scripts/seed-demo.mjs`·`seed-vehicles-passo.mjs`(라이브 쓰기 — 실행 금지) ③ `RECOGNITION_MOCK`(차량 사진 AI 인식 목업) ④ `scripts/lib/fake-db.mjs`(자가시험용 JSON DB, 앱 화면용 아님) ⑤ `/admin/styleguide`(관리자 컴포넌트 데모 — 로그인 필요) ⑥ 디자인 시안 HTML `docs/design/fb14b-mock/*.html` · `docs/feedback/fb13-4-ref/auction-ref.html` · `docs/feedback/fb13-5-ref/market-ref.html`(정적 시안 — 실제 서비스 화면 아님) |
| 모바일 앱 | `mobile/`(Expo) 별도 — 이 서버는 에뮬레이터 불가라 촬영 대상 아님 |

## 2. 라이브 주소·상태 (`curl -sI`, UA 지정·무지정 모두 동일)

도메인 하나 `https://byclick.co.kr` 에 경로로 갈린다(소비자 `/`·`/my/*`, 딜러 `/dealer/*`, 관리자 `/admin/*`, 공개 정책 `/terms` `/privacy` `/notices` `/support`). `www` → 308 → apex.

| URL | 상태 |
|---|---|
| `/` · `/my/login` · `/my/apply` · `/dealer/login` · `/dealer/signup` · `/admin/login` · `/terms` · `/privacy` · `/notices` · `/support` · `/sitemap.xml` | 200 (로그인 없이) |
| `/dealer` | 307 → `/dealer/login` |
| `/my` | 307 → `/my/login` |
| `/api/health` | 200 `{"ok":true,"reachable":true,"service":true,"db":"ap-northeast-2"}` |
| `/api/time` | 200 `{"now":…}` (서버 시각 — 카운트다운이 이걸로 맞춘다) |
| `/api/public/live-auctions` | 200 JSON `{cards:[…]}` — **레포에 없는 라이브 전용 공개 API**(랜딩 「LIVE 전국 경매 진행 중」이 부름 · 사진은 서명 URL 포함 → 값 기록 금지) |

봇 확인: 없음(Vercel 챌린지·403 없음, `x-vercel-mitigated` 없음). robots.txt: `/admin` `/dealer` `/my` `/api/` Disallow(크롤러용, 접근 차단 아님).
공개 정적 자산(GET 가능): `/sian-v9/logo.png`(131,924B) · `/sian-v9/main_img.jpg`(65,606B) · `/sian-v9/process-bmw-2.jpg`(31,338B) · `/brand/byclick-wordmark.png` · `/photos/hero-bike.jpg` · `/og.jpg`.

## 3. 명세 항목 ↔ 라우트·컴포넌트

표기: 「레포」 = HEAD 코드 근거, 「라이브」 = 운영에서 확인한 것. 라이브 소비자 화면은 레포와 달라 셀렉터는 **촬영 때 라이브 DOM 으로 다시 뽑아야** 한다. 딜러·관리자는 라이브 내부 화면을 못 봤다(로그인 불가) — 로그인 화면이 레포와 같으므로 레포 기준으로 보되 미확인.

### 3-1. 소비자 모바일

| 명세 | 실제 | 진입 조건 · 필요 데이터 · 셀렉터 |
|---|---|---|
| 판매 신청 시작 | 랜딩 히어로 `src/components/landing/HeroWidget.tsx` · CTA 「내 바이크 최고가 확인하기」(`data-testid="hero-widget"` `hero-cta` :327,371, 레포) → `/my/apply`. 라이브는 `/my/apply` 가 **비로그인 200**(제목 「내 바이크 최고가 확인하기 · 바이클릭」) | 공개. 라이브 DOM 은 sian-v9 라 testid 미확인 |
| 차종 자동완성 입력 | 레포: 제조사·모델 콤보 `InfoStep.tsx`(`wz-suggest-manufacturer`/`wz-suggest-model` :414-455) + 랜딩 위젯(`HeroWidget.tsx:302` 첫 포커스에 `vehicle_catalog()` RPC). 라이브 `/my/apply` 는 SSR 로 제조사 목록 「제조사 찾기」 칩(혼다·야마하·스즈키…)을 그리고 모델·연식·주행거리 칸이 이어짐 | 공개(익명). 데이터 = 운영 DB 활성 제조사·모델(§7) |
| 촬영 가이드 단계 | **웹 레포엔 없음**: 위저드 사진 스텝은 꺼짐(`Wizard.tsx:65` 「사진 스텝은 없다」, 앱 `mobile/src/lib/pure.ts:91` `PHOTO_STEP_ENABLED=false`). 촬영 가이드 문구 6슬롯은 `src/lib/photo-slots.ts`(`SLOT_GUIDES` :25 — 관리자 검수 `PhotoGrid.tsx:255` 에만 쓰임)·앱 `pure.ts:80`. **라이브엔 있음**: `/my/apply` 1단계 「견적 확인」 안에 「바이크 사진 등록 — 좌측·우측·계기판·차량등록증/폐지증명서 필수 + 추가 6장」 + 「사진 등록하기」 | 라이브 `/my/apply` 로 찍는다(사진 업로드는 쓰기 — 누르지 않고 화면만) |
| 진행 6단계 | **6단계 맞음**: 신청 접수 · 픽업 · 차량 검수 · 경매 진행 · 판매 확정 · 정산 완료(`src/lib/stage-table.ts:24-31`, `consumer-status.ts:13`; 위탁도 같은 6단계 `:25`). 화면: `/my`(내 신청 카드 가로 트랙 `consumerStepTrack` `consumer-status.ts:42`) · `/my/[id]` `DetailTimeline`(`data-testid="detail-timeline"`, `timeline-row`) | 로그인 소비자 + **신청 1건 이상 필요**. 시험 번호 0001·0002 는 신청 0건(`docs/measurements/paid-41.md:365`) → 새 신청을 만들지 않으면 데이터 없음 |
| 최고가 확인 뒤 판매·위탁 선택 | `/my/[id]` 의 `DecidePanel`(`src/components/product/DecidePanel.tsx`): 선택지는 **3개** `sell`·`consign`·`return`(판매·위탁·반환 `:43`), `data-testid="decide-panel"` `decide-winner` `decide-choices` `decide-card-sell/consign/return` `decide-open-*` `decide-go` | 신청 상태 `awaiting_decision`(경매 마감 + 낙찰 후보 있음) 필요. 운영에서 만들 수 없음 |
| (참고) 검수 결과 보기 | `/my/[id]/bike`(`(consumer)/my/[id]/bike/page.tsx`) 검수 사진·등급·성능기록부 | 검수 완료 신청 필요 |
| (참고) 판매 정산서 PDF | `/my/[id]` 의 `data-testid="settlement-pdf"` 링크(`page.tsx:834`) → `/api/docs/settlement/{id}` | 정산 `net_payout` 있는 건 |

### 3-2. 매입업체(딜러) 데스크톱 — 로그인 `/dealer/login`(이메일+비밀번호, 승인된 딜러만)

| 명세 | 실제 | 필요 데이터 · 셀렉터 |
|---|---|---|
| 경매 목록 | `/dealer/auctions`(`(dealer)/dealer/auctions/page.tsx` → `AuctionWorkspace scope="all"`). 형제: 찜차 `/dealer/interests`(scope favorites), 관심차 `/dealer/interest-models`(scope interests), 내 입찰 `/dealer/bids` | 진행 중(`auctions.status='live'`) 경매 ≥1. 카드 `AuctionCard.tsx`(`auction-card-thumb` `card-my-amount`) |
| 매물 상세(검수 리포트) | `/dealer/auctions/[id]`(601줄). 검수 리포트 = `PerformanceRecordView`(성능·상태 점검기록부) + `PhotoGallery` + `SignatureBlock` | 경매 id. 차량번호·차대번호는 낙찰 전엔 가려짐(`api/docs/performance/[inspectionId]/route.ts:14-19`) |
| 밀봉 입찰 입력 전·중·제출 후 | 같은 페이지의 `BidPanelV2.tsx`: 남은 입찰 기회 `data-testid="bid-quota"`(:267, 「남은 입찰 기회 N회」), 입력 `bid-amount`(:340, `bid-dec`/`bid-inc` ±1만원), 제출 `bid-submit`(:389), 확인창 `bid-confirm-amount` `bid-confirm-remaining` `bid-confirm`(:418), 내 입찰 `my-top-bid`·`my-bid-status`, 마감 카운트다운 `AuctionTimeBand`(`auction-time-remaining`)·`HMCountdown`(`hm-countdown`). **입력 전**=빈칸·3회 / **중**=금액 입력 + 확인창 / **제출 후**=토스트 「입찰을 접수했습니다.」 + `router.refresh()`(:239) 로 서버가 내 입찰·남은 횟수를 다시 그림 | 제출은 클라이언트 RPC `place_bid_v2`(:217)라 가로채 `{ok:true,ends_at,remaining}` 를 줄 수 있으나, 「제출 후」 횟수·내 입찰 표시는 refresh 가 서버에서 가져오므로 가로챈 응답만으론 안 바뀐다(DOM 값 치환 또는 RSC 응답 가로채기 필요 — 가짜 값으로 shots.md 기록) |
| 낙찰·출고 신청 | `/dealer/wins`(`wins/page.tsx`, 제목 「낙찰·대금」) + `DealActions.tsx`: 대금 `fee-block` `deal-total` `deal-remaining` `fee-account`(회사 입금 계좌 — 가림 대상), 낙찰확인서 링크 `won-doc-link`(:385), 출고 신청 서버 액션 `requestRelease`(`wins/actions.ts:28` → `release_requests` insert :66), 구매확정 `confirmPurchase`(:97) | 낙찰 건(입금 확인 후 출고 신청 활성) 필요 |
| 관심 차종 알림 | 「관심차」 `/dealer/interest-models` + 「관심차 조건」 창 `InterestManager.tsx`(`interest-tags` `interest-model-count`, 서버 액션 `addInterest` `interests/actions.ts:7` / `removeInterest`). 실제 알림 = 새 경매가 조건과 맞으면 웹푸시 `interest_match`(`src/lib/auction-open-push.ts:12`, 구독 `POST /api/push/subscribe`) — **푸시 알림은 화면 캡처 불가** | 관심 조건 행 필요(쓰기) |
| (참고) 딜러 로그인 | `/dealer/login`(공개, 라이브 확인됨) — 「입찰은 밀봉 방식이며 업체마다 3번까지 입찰할 수 있습니다.」 소개 글 `DealerLoginIntro.tsx:8` | 공개 |

### 3-3. 관리자 데스크톱 — 로그인 `/admin/login`(이메일+비밀번호 + **인증 앱 6자리 2단계 인증**)

| 명세 | 실제 | 비고 |
|---|---|---|
| 대시보드 | `/admin`(제목 「오늘 할 일」, `(admin)/admin/page.tsx:13` — 접수·지연·픽업·검수·결정·정산 카운트 카드) | 어느 역할이든 |
| 접수·배차 | 접수 목록 `/admin/requests`(PII 열람 기록 `requests/page.tsx:123`), 접수 상세 `/admin/requests/[id]`(배차 정보 `:391`, 열람 기록 `:97`), 픽업·입고 `/admin/requests?status=pickup_scheduled`(`navConfig.tsx:33`). 배차 등록은 서버 액션(`RequestActions.tsx`) | 이름·연락처·주소가 뜸(가림). 신청 데이터 필요 |
| 검수 입력 | 목록 `/admin/inspections`, 입력 `/admin/inspections/[saleRequestId]`(`InspectionForm` `PhotoGrid` `PerformanceSection` `SignPanel`) — 사진 6슬롯 안내문 `PhotoGrid.tsx:255` | 열람 기록 `page.tsx:76` |
| 경매 운영 | `/admin/auctions`(목록) · `/admin/auctions/[id]`(`AuctionActions`) · `/admin/auctions/new`(경매 개설). 서버 액션 `openAuction`(`auctions/actions.ts:89` — **개설 시 딜러에게 푸시 발송 가능**) `relistAuction`(:238) `forceEndAuction`(:297) `runCloseSweep`(:320). 진행 중 경매 금액은 최고관리자도 못 봄(`admin-permissions.ts:27-30`) | 개설 화면은 열기만, 제출 금지 |
| 정산 장부 | `/admin/settlements`(`settlements/page.tsx:136` h1 「정산」, 장부 + `PayoutActions`) · 엑셀 `GET /api/admin/settlements/export`(xlsx) · 연관: `/admin/payments`(대금) `/admin/releases`(출고) `/admin/transactions`(거래 내역) `/admin/decisions`(결정·위탁) | 정산 금액·계좌 → 가짜 값 치환. finance·owner 만(`settlement.read`) |
| 관리자 역할 | `/admin/settings/roles`(`roles/page.tsx`, 최고관리자 전용 `role.manage`) — 역할 4종 설명 `ADMIN_ROLE_DESC`(`admin-permissions.ts:61`) | 관리자 이메일 목록이 뜸(가림) |

### 3-4. PDF (GET 으로 받음 — 세션 쿠키 필요, 새 계정 없이는 못 받음)

| 문서 | 라우트 · 파일 | 접근 · 링크 |
|---|---|---|
| 검수 리포트(성능·상태 점검기록부) | `GET /api/docs/performance/[inspectionId]`(`src/app/api/docs/performance/[inspectionId]/route.ts:23`) → `renderPerformancePdf` | 관리자/본인 소비자/승인 딜러(공개 매물). **화면 안에 다운로드 링크가 없다**(`grep api/docs/performance` src 0건) — 주소 직접 입력 |
| 낙찰 확인서 | `GET /api/docs/won/[auctionId]`(`won/[auctionId]/route.ts:13`) → `renderWonPdf` | 관리자(MFA 통과) 또는 낙찰한 승인 딜러 본인. 링크 `DealActions.tsx:385`·관리자 `decisions/[id]/page.tsx:326` |
| 정산서(판매 정산서, 소비자용) | `GET /api/docs/settlement/[saleRequestId]`(`settlement/[saleRequestId]/route.ts:13`) → `renderSettlementPdf` | 관리자 또는 본인 소비자(쿠키·Bearer). 링크 소비자 `my/[id]/page.tsx:834`·관리자 `decisions/[id]/page.tsx:317` |
| 렌더 코드 | `src/lib/pdf/{render.tsx,documents.tsx,data.ts,fonts.ts,theme.tsx,company.ts}` — `@react-pdf/renderer`. `render*Pdf(data)` 는 순수 함수라 **가짜 데이터로 로컬 렌더 가능**(DB 조회는 `loadWonDoc`/`loadSettlementDoc`/`loadPerformanceDoc` 뿐). 회사 정보(`pdf/company.ts`)가 머리·꼬리에 들어감 → 가림 필요 | 로컬 렌더 시 폰트 파일은 `public/fonts`(`fonts.ts:5`) |

PDF 첫 쪽 200dpi 변환은 렌더된 PDF → pdftoppm 류가 필요(이 서버에 있는지 미확인).

## 4. 테스트 계정 (값 기록 없음)

| 역할 | 어디에 정의 | 로그인 방식 | 지금 쓸 수 있나 |
|---|---|---|---|
| 소비자 | 시험 번호 0001(`scripts/lib/run-accounts.mjs` `TEST_CONSUMER_PHONE`) · 0002(구글 심사 계정, `docs/measurements/paid-41.md:342,365`) · 옛 데모 번호 `scripts/set-demo-otp.mjs`. 고정 인증번호는 **Supabase Auth 설정 `sms_test_otp`**(레포 밖 DB 설정 · `set-demo-otp.mjs` 가 Management API 로 넣음) | 휴대폰 문자 인증(`signInWithOtp`→`verifyOtp` `(auth)/my/login/actions.ts:27,40`). 라이브 로그인 화면은 「성함 + 연락처 → 인증번호 받기」 | 시험 번호는 문자 안 나가는 고정 인증번호 방식이지만 번호·인증번호를 이 세션이 알 방법이 없다(비밀·삭제됨). 로그인 시 소비자 행 생성 가능(쓰기). 신청 0건이라 보여줄 데이터도 없음 |
| 딜러 | **없음**(고정 계정 폐지 — `run-accounts.mjs:3` · `check-fixed-accounts.mjs`). 게이트 러너가 `gate-dealer-N@omaedan.test` 를 만들었다 지움 | 이메일+비밀번호(`signInWithPassword` `(auth)/dealer/login/actions.ts:19`) | 불가(만들려면 service_role 필요 · 새 계정은 범위 밖) |
| 관리자 | **없음**(`ADMIN_SEED_*` 는 `.env.local` 에만 있었고 삭제됨; 러너가 `gate-admin@example.test` 를 임시 생성) | 이메일+비밀번호 + TOTP 인증 앱(`scripts/lib/admin-login.mjs` · MFA 필수 `mfa-gate.ts`) | 불가 |

→ **운영 로그인이 필요한 화면(소비자 내부·딜러·관리자·PDF)은 BLOCKED 후보.** 대안 B(§0-4): 로컬 Supabase(docker)에 마이그레이션 재생 + 가짜 시드 + 임시 계정(로컬이라 새 계정 제약 밖) — 단, 소비자 화면은 레포(v3) 디자인이 나와 라이브 sian-v9 와 다름. 대안 C: 인계용 매뉴얼 캡처 재사용 `/home/dev/qa-archive/paid-42-1103/handover/{admin-manual/img(106장), user-guide/img(46장)}` · `final/`(243장) — 11-03 라이브(PAID-42, 표식 픽스처) 캡처로 해상도·가림 상태 미확인, sian-v9 이전 디자인.

## 5. 쓰기 위험

**GET 만으로 서버 쓰기가 일어나는 곳**(서버 쪽 service_role — `page.route` 로 못 막음):
- 관리자 열람 기록 `admin_access_logs` insert(`src/lib/audit.ts:98-117` `logPiiAccess`): `/admin/requests`(`page.tsx:123`) · `/admin/requests/[id]`(`:97`) · `/admin/listings/[id]`(`:44`) · `/admin/notifications`(`:91`) · `/admin/decisions`(`:202`) · `/admin/decisions/[id]`(`:82`) · `/admin/inspections/[saleRequestId]`(`:76`) · `/admin/dealers/[id]`(`:67`) · `GET /api/admin/search`(`src/lib/search.ts:102`).
- 관리자 로그인 시 `admin_sessions` upsert(`admin-session.ts:56`).
- 소비자 첫 로그인·익명 세션 시 `consumers` update/insert(`consumer-auth.ts:40,46,125`). `/my/apply` 가 익명 초안을 만드는지는 라이브(sian-v9) 코드가 없어 미확인 → 첫 방문에서 네트워크 POST 를 로그부터 보고 진행.
- 크론 `GET /api/cron/*`(sweep·purge·notify-outbound·webpush)는 `CRON_SECRET` 필요 — 건드리지 않는다.
- 그 밖 SSR 의 `.rpc()`(`dealer_my_bids` `dealer_market_records` `dealer_auction_result` `dealer_sees_listing` 등)는 읽기 함수.

**쓰기 API(가로챌 것)**
- 입찰: 클라이언트 RPC `POST {supabase}/rest/v1/rpc/place_bid_v2`(`BidPanelV2.tsx:217`).
- 모든 Next 서버 액션 = `POST <현재 페이지 URL>` + `Next-Action` 헤더. 쓰기: 출고 신청 `requestRelease`(`wins/actions.ts:28`) · 구매확정 `confirmPurchase` · 관심차 `addInterest`/`removeInterest` · 찜 `toggleWatch`(`auctions/actions.ts:8`) · 신청 `createDraft` `saveDraft` `submitApplication` `startPhonePromotion` `verifyPhoneAndSubmit` `discardDraft` `createRequestUploadUrl` `saveRequestPhoto` `recognizeVehicleFromPhoto`(AI 유료) `confirmRecognition`(`my/apply/actions.ts:76-489`) · 결정·위탁(`my/[id]/actions.ts`) · 관리자 `openAuction`(푸시 발송) `relistAuction` `forceEndAuction` `runCloseSweep` · 정산 `markPayoutPaid` `revertPayout` `holdPayout` `releasePayoutHold`(`settlements/actions.ts`) · 관리자 접수·검수·역할 액션 전부 · 로그인/로그아웃 액션.
- `POST /api/push/subscribe` · `DELETE /api/push/subscribe`(`route.ts:18,57`) — 푸시 구독.
- Supabase Auth: `POST /auth/v1/otp`(문자 발송) · `/auth/v1/verify` · 소비자 `signInWithOtp`(**실제 SMS 가능 — 시험 번호가 아니면 문자 발송**).
- `POST /api/auth/send-sms`(Supabase Auth 훅이 부르는 곳 — 브라우저가 부르지 않음, 비밀값 필요).
- 비용 발생: `estimateReturnTransport`(`apply/actions.ts:114`, 거리 API) · `recognizeVehicleFromPhoto`(AI).

**읽기인데 POST 라 예외로 둘 것**
- `POST {supabase}/rest/v1/rpc/vehicle_catalog`(차종 자동완성 데이터 · STABLE 읽기 함수 `supabase/migrations/20260914120000_data1_vehicle_catalog.sql:13-44` · 호출처 `HeroWidget.tsx:302` `InfoStep` `VehicleBasicsSection.tsx:55`) — **막으면 자동완성이 비어 버린다.** 가로채지 말고 통과(또는 저장 응답 재생).
- 서버 액션 `listModelsByManufacturer`(`interests/actions.ts:45` — 제조사별 모델 읽기).
- Supabase 토큰 갱신 `POST /auth/v1/token?grant_type=refresh_token`(세션 유지) — 막으면 로그아웃 상태가 됨.
- 구분법: 서버 액션은 이름이 요청에 안 보이므로 `Next-Action` 해시를 첫 호출 때 로그로 찍어 (읽기 허용 목록 = vehicle_catalog·listModels·refresh) 외 전부 차단 권장. 가로챈 수는 json 에 기록.

**운영 DB 에 진행 중 경매·테스트 매물이 있는지 확인(GET 만)**
- `GET https://byclick.co.kr/api/public/live-auctions` → `cards[]`(진행 중 경매 공개 요약, 비로그인) — 지금 1건(§0-6).
- `GET /api/time`(서버 시각), `GET /api/health`.
- 로그인 없는 쪽에서 `sale_requests`/`bids` 등은 RLS 로 안 보임(익명 REST 확인은 하지 않음).

## 6. 가림 대상 (셀렉터 힌트 · 라이브 소비자는 DOM 재확인)

| 대상 | 위치 · 힌트 |
|---|---|
| 머리·꼬리 회사 정보(상호 주식회사 원스톱바이크 · 대표자 · 사업자번호 · 통신판매업 신고번호 · 주소 · 대표번호 · 이메일 · 운영시간 · 「지도 보기」 · 호스팅 사업자) | 라이브 `/my/login`·`/dealer/login`·`/my/apply` 등 하단 법정표시(`<footer>`) — 레포 `landing-footer`(`LandingFooter.tsx:11`) · `ProductShell.tsx:38` · `COMPANY_INFO`(`src/lib/company-info.ts`) 사용처: `(consumer)/page.tsx` `support/page.tsx` `account-deletion/page.tsx` `Wizard.tsx` `PickupStep.tsx` `ConsentCards.tsx` `DeleteMyInfo.tsx` `RestrictionNotice.tsx`. 법정 푸터는 **통째로 숨김 또는 문구 치환**. 도메인 글자 `byclick.co.kr`·`info@byclick.co.kr` 도 |
| 소비자 이름·전화·주소 | 로그인 폼 「성함」「연락처」(라이브) · 신청 위저드 `InfoStep.tsx`/`PickupStep.tsx`(이름·전화·`AddressSearch`) · `/my/account` · `/my/[id]` 내 신청 요약 · 문자 인증 `PhoneVerifySheet.tsx` |
| 차량번호 | 소비자 `/my/[id]/bike`·검수 리포트·PDF(`vehicle.plate`) · 관리자 접수·검수·매물 · 딜러는 낙찰 전엔 안 보임, 낙찰 후 `wins` 화면·PDF 에 나옴 → 「12가 ****」 |
| 딜러(매입업체) 상호·대표·사업자번호·연락처·계좌 | `/dealer/account` · 딜러 레이아웃 상단 배지(`(dealer)/dealer/layout.tsx` — 딜러 이름) · 관리자 `/admin/dealers`·`/admin/dealers/[id]` · 관리자 `payments`·`decisions`(낙찰 딜러) → 「A모터스」식 치환(정산 역할은 상호가 안 보임 `ADMIN_ROLE_DESC.finance`) |
| 회사 입금 계좌(PAID-4) | 딜러 `wins` `data-testid="fee-account"`(`DealActions.tsx:126`) · 소비자/관리자 `CopyAccountButton` — 계좌 → 지움 |
| 정산 금액·대금·수수료 합계 | `data-testid="deal-total"`(:116) `deal-remaining`(:120) `fee-block` · 관리자 `/admin/settlements` `/admin/payments` `/admin/transactions` · 낙찰·정산 PDF → 가짜 값 + shots.md 「가짜 값」 |
| 입찰 금액 | 낙찰 후 `my-top-bid`·`card-my-amount`·결정 패널 금액 — 경매 중 타사 금액은 원래 비공개 |
| 관리자 본인 | 관리자 상단바 표시 이름·이메일(`Topbar.tsx`) · `/admin/settings/roles` 목록 · 감사 로그 |
| 팝업·QR | 코드·라이브 랜딩 HTML 에 QR·채팅위젯·쿠키배너 없음(`grep channel.io|cookie` src 0건, 라이브 랜딩 0건). 개발 배지는 prod 빌드에 없음. `InstallPrompt`(PWA 설치 안내 `src/components/pwa/InstallPrompt.tsx`)·`PushPrompt` 팝업은 숨길 것 |
| 라이브 공개 경매 카드 | 랜딩 「LIVE」 카드 사진은 실제 검수 사진 서명 URL — 번호판이 찍혔는지 확인 필요(`/api/public/live-auctions` photoUrl) |

## 7. 사실 후보 (자막용 · 근거)

| # | 사실 | 근거 · 상태 |
|---|---|---|
| 1 | **차종 자동완성: 제조사 150 · 모델 3,713** | 운영 `GET /rest/v1/rpc/vehicle_catalog`(공개 키, 읽기, 2026-11-05T22:53Z) 응답을 세어 제조사 150(모델 있는 제조사 149) · 모델 3,713. 원본 데이터 파일 `src/lib/passo-models.ts`(155줄, 헤더 `:2` 「제조사 150 · 모델 3704」)를 직접 세어도 제조사 150 · 모델 3,704(중복 제거 이름 3,646). 차이 9 = 기존 DB 행(`20260914120000_data1_vehicle_catalog.sql:4` 「3,713행」). **자막은 3,713(운영 실측)** |
| 2 | **관리자 역할 4종**: 최고관리자(owner)·운영(ops)·검수(inspector)·정산(finance) | `src/lib/admin-permissions.ts:50-58`, DB enum `supabase/migrations/20260911010000_w10_rbac.sql:27`(이후 `alter type` 없음). 권한 이름 40여 개(`:3-48`) |
| 3 | **입찰 규칙: 밀봉 · 업체당 3회 · 1만원 단위 · 고정 마감** | 업체당 최대 3회 `auction-engine-v2.ts:29`(폴백) · DB 설정 `max_bids_per_dealer {"count":3}` `20260908180000_w3_engine_v2_expand.sql:57` · **운영 화면 공개 문구 확인됨**: 「입찰은 밀봉 방식이며 업체마다 3번까지 입찰할 수 있습니다.」(라이브 `/dealer/login`, `DealerLoginIntro.tsx:8`). 단위 1만원 `auction-engine-v2.ts:27` · `…w3…sql:56` `bid_step_amount {"amount":10000}`. 마감: 고정 마감 시각 `ends_at`, 마감 임박 연장(소프트클로즈) v2 꺼짐 `20260909016000_step1_5_soft_close_v2_off.sql:22-23`. 남은 횟수·마감 카운트다운은 입찰 패널에 표시(`BidPanelV2.tsx:259-269`). 현재가·타사 금액 비공개(`auction-engine-v2.ts:11-13`). **주의: 값은 DB 설정이라 운영 현재값은 관리자 `/admin/settings/auction` 로그인 전엔 확인 불가** — 코드 기본값 + 공개 문구로 근거를 대고 「3번」은 공개 문구가 직접 뒷받침 |
| 4 | **경매 시간 기본 48시간, 금요일 시작은 72시간** | `auction-schedule.ts:25-27`(기본 48 · 금요일 72) · 레포 랜딩 통계 `landing-copy.ts:277` 「48 시간 전국 경매 진행」 · 라이브 랜딩 「영업일 기준 평균 5~7일」. 금요일 규칙 = 마이그레이션 `20261029090000`(DB 함수 `auction_duration_hours`), 마지막 적용 마이그레이션 `20261103100000`(`docs/deploy-chain.md:9`)이라 적용됨. DB 현재 값은 미확인 |
| 5 | **진행 6단계**(신청 접수·픽업·차량 검수·경매 진행·판매 확정·정산 완료) | `stage-table.ts:24-31` — 판매·위탁 모두 같은 6단계 |
| 6 | **소비자 선택지 3택**(판매·위탁·반환) | `DecidePanel.tsx:43`. 명세의 「판매·위탁」 둘이 아니라 반환 포함 |
| 7 | 거래 흐름: 무료 픽업 → 검수 → 전국 매입업체 경매 → 입금(영업일 평균 5~7일, 0.5/1/0.5/3일) | 라이브 `/` 「HOW IT WORKS」 문구(GET 2026-11-05) |
| 8 | 낙찰 → 대금·입고운송료 입금 확인 → 출고 신청 → 출고 완료 | `DealerLoginIntro.tsx:9` · `wins/actions.ts:28` |
| 9 | 거래 문서 PDF 3종(성능·상태 점검기록부·낙찰 확인서·판매 정산서) | §3-4 |
| 참고 | 운영 중 실서비스: 랜딩 「LIVE 전국 경매 진행 중」(지금 진행 중 경매 1건) | 라이브 `/api/public/live-auctions` — 숫자 자막 근거로는 약함 |
| 미확인 | 총 입찰·거래 건수, 딜러 수 | 운영 DB 로그인 불가(공개 API 없음) → 「미확인」 |

## 8. 브랜드

| 항목 | 값 · 근거 |
|---|---|
| 주색(레포 토큰) | 오렌지 `#e8560a`(`src/app/globals.css:31` `--color-accent` · `consumer-v3.css:117` `--c-orange`) · 버튼용 진한 오렌지 `#be4406`(`globals.css:32`) · 소프트 `#fdeee3`(:33) · 잉크 `#14161a`(:20) · 로고 원본 오렌지 `#f84000`(`docs/BRAND-LANGUAGE.md:39`, 토큰과 다름) |
| **주색(운영 라이브 랜딩 sian-v9 실측)** | 라이브 CSS(`/_next/static/immutable/chunks/185lexi3z-g9s.css`) 최빈 주황 `#f45108`(22회) · 강조 `#f45112`(`.by-live-kicker` 등) · hover `#e65110` · 연한 면 `#fff4ec`/`#fff1e7` · 회색 면 `#f7f8fa` `#fafbfc`. **영상용 brand.json 은 라이브 값 기준 권장**(레포 값과 다름) — 둘 다 적고 어느 쪽인지 표시 |
| 폰트 | 소비자(레포): Wanted Sans Variable(디스플레이) + Pretendard Variable(본문) — `src/app/(consumer)/fonts.ts`, `consumer-v3.css:72-79`. 딜러·관리자: Pretendard Variable(`globals.css:61`·`fonts.css:10`). **라이브 랜딩**: `Pretendard Variable, Pretendard, Noto Sans KR, Apple SD Gothic Neo` + 히어로 제목 Wanted Sans 서브셋(`WantedSansVariable_hero_…woff2` preload) |
| 로고 원본 | 레포 PNG(SVG 원본 없음): `public/brand/byclick-wordmark.png`(1040×213, 199,737B) · `byclick-wordmark-dark.png` · `byclick-lockup.png` · `byclick-lockup-hero.png`(323,529B) · `byclick-mark-black.png` · `byclick-mark-graphite.png` · `byclick-mark-orange.webp` · `byclick-app-icon-1024.png`(197,406B) · `public/brand/legacy/*`. 라이브 로고 `/sian-v9/logo.png`(131,924B, 공개 GET 가능). 인트로 `public/intro/byclick-intro-bike.webp`. 픽토그램 SVG 3종 `public/media/consumer/pictogram/{pickup,inspect,choose}.svg` |
| 히어로 | 레포: `public/photos/hero-bike.jpg`(422,343B) · `public/photos/step-{1-pickup,2-inspection,3-lineup,4-handoff}.jpg` · `public/media/consumer/{product,street,workshop,detail,screens,gen}/` · OG `public/og.jpg`. 라이브: `/sian-v9/main_img.jpg`(65,606B) · `/sian-v9/process-bmw-2.jpg`(31,338B) |
| 슬로건 | 레포 확정 `landing-copy.ts:13-25` 「내 바이크의 최고가, 클릭 한 번으로 확인. / 오토바이 경매 플랫폼」. 라이브 히어로 「내 바이크, 얼마까지 받을 수 있을까?」「바이크 판매의 시작, 바이클릭」 |
| 라이선스 | `docs/ASSETS-LICENSES.md`(폰트·이미지 라이선스 — 영상에 쓰기 전 확인) |

## 9. 다른 세션 점유 (읽기)

- `git worktree list`: `/home/dev/bikeclickofficial  863d2c26 [feat/paid-42]` 하나뿐. 다른 worktree 없음. 이 레포 작업 트리는 변경 0(`git status --short` 0줄) — 우리도 건드리지 않았다.
- `ss -ltnp`(22:5xZ): 3000~5999 대역 LISTEN 없음. 보이는 건 `127.0.0.1:8781`,`8782`(node pid 1208821·1208824 — 남의 프로세스, 건드리지 않음), `127.0.0.1:5432`(postgres), `8443`(tailscale). byclick 레포 dev 서버 없음.
- 빈 포트 후보: **3260**(레포 기본) → 점유 시 3263~3269(`CLAUDE.md`가 정한 범위). 점유 확인은 `lsof` 와 `ss` 둘 다(`CLAUDE.md`: lsof 가 비어도 ss 에 남은 서버가 있던 전례).
- 메모리: 가용 약 21GB(`free -g`), 6GB 기준 충족.

## 10. 명세와 코드가 다른 점

1. **운영 ≠ 레포(최대 이슈)**: 소비자 화면은 회사 배포 sian-v9(11-04 15:26 KST)로 레포에 없다. 랜딩·로그인·신청 화면 글자·구성·셀렉터가 다름. 딜러·관리자는 레포와 같은 것으로 보이나 내부 미확인.
2. 「촬영 가이드 단계」: 웹 레포에 소비자 촬영 가이드 화면 **없음**(사진 스텝 꺼짐). 라이브 `/my/apply` 1단계 안의 「바이크 사진 등록」(필수 4 + 추가 6)이 가장 가깝다. 슬롯별 안내 문구(「앞에서 정면으로」 등)는 관리자 검수 화면·앱 코드에만 있음.
3. 「최고가 확인 뒤 판매·위탁 선택」: 선택지가 판매·위탁·**반환** 3개.
4. 「진행 6단계」: 6단계 맞음(§3-1).
5. 「밀봉 입찰 제출 후」: 제출은 가로챌 수 있지만 남은 횟수·내 입찰 표시가 서버 재렌더(`router.refresh`)라 가로챈 응답만으로는 안 바뀐다.
6. 「관심 차종 알림」: 화면에서 찍을 수 있는 건 「관심차」 조건 등록 화면. 알림 자체는 웹푸시라 캡처 불가.
7. 「검수 리포트 PDF」: 정식 이름은 「성능·상태 점검기록부」, 화면에 다운로드 링크 없음(주소로만). 「정산서」는 소비자용 「판매 정산서」(딜러용 정산서 PDF 없음; 관리자 정산 장부는 xlsx 내보내기).
8. 「관리자 역할 수」: 코드·DB 모두 4(owner·ops·inspector·finance).
9. 「정산 장부」: 화면 이름은 「정산」(`/admin/settlements`), 메뉴 그룹 「거래 관리」.
10. 「접수·배차」: 메뉴 이름은 「접수」와 「픽업·입고」; 배차 등록은 접수 상세 안 버튼(서버 액션).
11. 「경매 운영」: 메뉴 「경매 관리 > 경매」. 개설 시 딜러에게 푸시가 나간다(찍기만, 제출 금지).
12. 안전 규칙과 충돌: 「운영 DB 에 아무것도 남기지 않는다」는 관리자·소비자 로그인 자체가 서버 쪽 쓰기를 남겨(§0-5) 운영 로그인으론 지킬 수 없다. 그리고 로그인할 테스트 계정이 서버에 없다.

## 추천 촬영 경로 (결정은 메인 세션)

- **A. 운영 공개 화면(익명 GET, 쓰기 0)**: 소비자 `/`(랜딩, 라이브 sian-v9)·`/my/login`·`/my/apply`(자동완성·사진 등록 칸·픽업) · `/dealer/login`·`/dealer/signup` · `/admin/login` · `/terms` `/privacy` `/notices` `/support`. 모든 비-GET 은 `page.route` 차단, 단 `vehicle_catalog` RPC 와 토큰 갱신은 통과. 법정 푸터·계좌·도메인 가림. 첫 방문에서 비-GET 목록을 로그부터 확인(`/my/apply` 익명 초안 생성 여부 미확인).
- **B. 로컬 레포 + 로컬 Supabase(docker)**: 딜러·관리자·소비자 내부·PDF(`render*Pdf` 가짜 데이터). 레포(v3) 디자인이라 소비자는 라이브와 다름 → shots.md 에 명시. 새 계정은 로컬 DB 에 만든 것이라 제약 밖(단 소요가 큼: 마이그레이션 182개 + 시드).
- **C. 기존 인계 캡처 재사용**(`/home/dev/qa-archive/paid-42-1103/handover/*`): 해상도·가림 상태 확인 필요.
- 실제 진행 중 경매 1건이 있으니 운영 로그인 경로(딜러)는 설령 계정이 생겨도 입찰·알림 위험이 크다.
