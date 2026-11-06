# maieventic(마이이벤틱) 촬영 전 사전 조사 — RECON

조사 시각 2026-11-05 22:3x~22:55Z · 방법: 코드 읽기 + 운영 GET(curl)만. 서버 기동·빌드·브라우저·DB 쿼리·AI/문자 호출 0. 비밀값 미기록(변수 이름만).
레포 `/home/dev/maimai-event-builder` (main, HEAD e41d61e2). 경로는 모두 이 레포 기준 `src/…`.

## 1. 스택·실행
- Next.js 16.2.9 App Router · React 19.2.4 · TS · Tailwind 4 · npm(`package-lock.json`) — `package.json:6-12,34,49`. 프록시 파일은 `src/proxy.ts`(Next16 middleware 대체).
- build: `node scripts/copy-pdf-worker.mjs && gen-event-css && gen-r100-art && gen-r100-thumb && next build` / start: `next start` / dev: 같은 gen 3개 + `next dev` (`package.json:6-9`). Vercel `framework: nextjs`, region icn1, cron 1개(`vercel.json`).
- 주 의존성: `@anthropic-ai/sdk`, `@supabase/ssr`, framer-motion/gsap/lenis/lottie, three/r3f, qrcode.react, qr-scanner, pdf-lib, sharp(서버 라우트 금지 규칙).
- env 이름(`.env.local.example` + `process.env.*` grep): `NEXT_PUBLIC_SUPABASE_URL` `NEXT_PUBLIC_SUPABASE_ANON_KEY` `SUPABASE_SERVICE_ROLE_KEY` `SUPABASE_ACCESS_TOKEN` `ANTHROPIC_API_KEY` `AI_CHAT_*`(MODEL·DAILY_CAP·PER_IP_*…) `AI_IMAGE_*` `OPENAI_API_KEY` `RECRAFT_API_KEY` `SENS_SERVICE_ID/ACCESS_KEY/SECRET_KEY/FROM`(문자) `RESEND_API_KEY` `NAVER_CLIENT_ID/SECRET/REDIRECT_URI` `AUTH_GOOGLE_ENABLED` `AUTH_KAKAO_ENABLED` `GATING_*` `PLANNER_TENANTS` `NEXT_PUBLIC_SITE_URL` `VERCEL_TOKEN` `VOUCHER_SECRET` `CRON_SECRET` `ADMIN_INQUIRY_EMAILS` `PUBLIC_CHAT_IP_SALT` `POSCO_*`. `.env.local` 은 레포 루트에 있음(내용 미열람 — 읽기 거부 규칙).
- 로컬 실행 DB 대상: **호스티드 Supabase = 운영 DB 하나**(`db.sh`·`supabase/migrations`만 있고 로컬 supabase 설정 없음, `db.sh:1-20`). worktree 에 `.env.local` 을 복사하면 로컬 서버도 운영 DB 를 읽고 쓴다 → 로컬 이점 없음. **운영 URL 에 page.route 가로채기로 촬영하는 쪽이 안전**(아래 4·6). 서버 컴포넌트 읽기(관리자·`/e`)는 운영 데이터를 그대로 읽는다.
- 서버 호스트의 54321/54322 등은 다른 프로젝트의 로컬 supabase — 이 레포와 무관, 건드리지 말 것.
- mock/데모 모드: (a) `/e/demo-*` 시연 이벤트(운영 DB 에 발행돼 있음, 아래 2) (b) 빌더 미리보기·"테스트 참여"는 서버 호출 0(`components/game/playTest.tsx:10`, `playEvent.tsx` `preview` 분기) (c) 문자 인증 mock 코드 `123456` 은 **SENS 키 없을 때만**(`playEvent.tsx:467-470`, `lib/auth/sms.ts:12-22`) — 운영은 `sms:true`라 mock 안 탐. (d) `/demo/posco-ox`(포스코 데모, 대상 아님).

## 2. 라이브 주소와 상태 (curl 기본 UA, GET/HEAD 만)
- 운영 URL: `https://mai-eventic.com` (apex 대표, www 308 → apex — `DOMAIN_SETUP.md:40`). 서버 Vercel(hnd1). **봇 확인 화면 없음**(전부 정상 HTML, `x-vercel-challenge`/mitigated 헤더 없음).
- 상태: `/` 200 · `/pricing` 200 · `/showcase` 200 · `/login` 200 · `/consult` 사이트맵 포함 · `/create` 307→`/login?redirect=%2Fcreate` · `/admin` 307→login · `/invite/<code>` 307→login · `/welcome` 307→login · `/create-v2` 307→`/create` · `/demo` 404 · `/guide` 404 · `/trial` 307→`/trial/intro`.
- 완성 이벤트 페이지(전부 200, `force-dynamic` DB 읽기):
  - `/e/summer-roulette-2026` — 랜딩 "데모 보기" 링크 대상(`app/page.tsx:169`), 룰렛 8칸·경품 "스타벅스 아메리카노/편의점 5천원 상품권/꽝". 기본 샘플(`lib/config/sample.ts`).
  - `/e/demo-roulette-mz-bright` · `/e/demo-scratch-premium` · `/e/demo-quiz-minimal` · `/e/demo-stamp-mz-bright` — 랜딩 추천 4종(`app/page.tsx:24-31`). 테넌트명 "maimai-showcase"(`lib/showcase/demos.ts`). 사이트맵에 `showcase/demo-*` 62건(게임4×톤8 + 테마 + 목적 + 업종 템플릿, `demos.ts`)이나 **`/showcase/<slug>` 상세는 /create 로 redirect**(`app/showcase/[slug]/page.tsx:60`, `lib/config/templates.ts:LEGACY_TEMPLATES_VISIBLE=false`). `/e/demo-*` 는 살아 있음.
  - `/e/qa-d1-moto-roulette` — 디자인 완성도 높은 v4 실사형(대전모터스 가을 정비 룰렛, 1/2/3등+다음 기회, 114KB). QA 발행물(robots Disallow `/e/qa-`, noindex — `app/e/[slug]/page.tsx:36`). 촬영 가능하나 우리 QA 자산이라는 점 인지.
  - `/e/qa-q1c2r-bbbrand-…` 는 종료 화면(종료일 2026-10-11)이라 비추천.
  - 이벤트 시작 시 **문자 인증/폼은 서버 HTML 에 없음**(휴대폰 입력칸 0건) — "시작" 클릭 뒤 EntrySheet 로 클라 렌더.
- 실제 제작 사례(정적, 이벤트 아님): `/showcase/case/{gobongmin-kimbap,marra-gongbang,mg-saemaul,tops-popup,vdoc}` (`lib/showcase/cases.ts`). `/showcase` 는 현재 사례 목록만(`app/showcase/page.tsx:104-140`).
- 사이트 공통: 챗 위젯(FAB `aria-label="문의하기"`, `components/public-chat/PublicChatWidget.tsx:529`)은 `/ /pricing /showcase /login` 등 마케팅 경로에 뜸 — **숨김 필수**. `/e/ /preview/ /create /admin /demo /posco-ox /consent` 에서는 자동 숨김(`hidePrefixes.ts:15`). 쿠키 배너·개발 배지 없음(`grep cookie` 은 참여 로직뿐). GTM 헤드는 허용 화면에서만(`components/marketing/GtmHead.tsx`, `lib/marketing/gtm.ts`).
- 운영 `GET /api/auth/methods` → `{"phone":true,"sms":true,"email":true,"kakao":false}` — **운영에서 문자 인증은 실제 SENS 발송**(`/api/auth/send-code`). 반드시 가로챌 것.

## 3. 명세 ↔ 실제 라우트/컴포넌트 표

로그인 필요 화면은 테스트 계정(5) 필요. 빌더는 두 갈래: **새 흐름(create_v2)** 과 **예전 흐름(classic)** — 어느 쪽이 뜨는지는 계정 플래그 `app_metadata.project==="maieventic" && create_v2===true` 또는 전역 `feature_flags.create_v2` (`lib/flags/server.ts:52-60`, `app/(builder)/create/page.tsx:135-140`). `?classic=1` 로 예전 흐름 강제, 새로 시작(`?draft` 없음)해야 AI 대화 진입. 어느 쪽이 켜졌는지는 로그인해 `/create` 를 열어 확인(읽기).

| 명세 항목 | 실제 | URL · 파일:줄 | 진입 조건 | 셀렉터 힌트 |
|---|---|---|---|---|
| 랜딩 | 있음 | `/` · `app/page.tsx:141`(히어로) `:201`(무엇을 할 수 있나요 벤토 4카드 `FEATURES :56-61`) `:226`(CinemaJourney 저니) `:231`(제작 사례) `:358`(요금제 요약) | 공개 | `[data-hero]` `[data-hero-title]` `[data-reveal]`(등장 애니, 스크롤로 전부 띄움) · 마퀴 게임명 `:46` · `html.motion` 클래스 3초 안전장치(`:75-80`) |
| AI 대화 기획 (입력→답 채움→기획안) | 있음. 예전 흐름의 `BriefChat`(대화형 브리프) | `/create`(새로 시작) · `components/builder/BriefChat.tsx:424`(브랜드명 게이트) `:462`(대화) · 진입 2분기 카피 `lib/builder/brief.ts:56-68`("AI와 함께 만들기"/"이미 준비된 기획·디자인이 있어요") | 로그인 + 새 세션 + 예전 흐름(`briefEligible` `create/page.tsx:124`) | `[data-brief-chat]` `[data-brief-chat-brandname]` `[data-brief-chat-brandname-next]` `[data-brief-stream]` `[data-brief-chip=<값>]` `[data-brief-rail=<슬롯>]` `[data-brief-wrap]` `[data-brief-wrap-confirm]` (기획안=wrap 요약). 가짜 스트리밍 30ms/2자(`brief.ts:340`). 폼 폴백 `BriefWizard.tsx` |
| (새 흐름) 입력→만드는 중→3안 고르기 | 있음(46v2). "AI 대화"가 아니라 입력 폼 + 엔진 3안 | `/create`(플래그 계정) · `components/create-v2/StepInput.tsx` → `Making.tsx` → `Picks.tsx` → `Review.tsx` → `Done.tsx`, 상태기계 `flow.ts:12-17`(input·making·pick·view·more·review·done) | 로그인 + create_v2 | 단계 phase 로 구분. 3안 카드 정지화면 `/create-v2/view/<draftId>/<slot>/still` (`app/create-v2/view/[draftId]/[slot]/`) |
| 디자인 자동 생성 결과 | 있음, 2종: (a) 새 흐름 3안 `Picks.tsx` (b) 예전 흐름 디자인 스텝 `StepDesign.tsx` + `DesignProposalDeck.tsx`(3안, `GET /api/design/proposals`, 화이트리스트 `PLANNER_TENANTS` — `lib/planner/access.ts`, 계정 밖이면 404) + "AI로 완성하기" `CreateClient.tsx:943-996` | `/create?draft=<id>&step=<디자인 순번>` | 로그인 + (b)는 planner 허용 | 스텝 키 `brand·game·(quiz)·(stamp)·entry·prizes·design·content·review`(`CreateClient.tsx:99-112`); `?step=N` 1-based |
| 빌더 편집 | 있음 | 예전: `CreateClient.tsx`(1959줄) 좌 입력 + `components/builder/PreviewPane.tsx` 미리보기, `CopyEditor/ColorEditor/DesignKnobs/GameVisualEditor`; 새 흐름: `Review.tsx` 편집 시트(`draftEdit.ts`) | 로그인 | 자동저장 `POST /api/draft`(가로채기) |
| 게임 4종 | **룰렛 · 스크래치 · OX 퀴즈 · 스탬프·출석** = 4종 (`lib/config/schema.ts:470` `z.enum(["roulette","scratch","quiz","stamp"])`, `lib/showcase/demos.ts:80`). 랜딩 마퀴엔 "퍼즐(예정)·브랜드게임(예정)" 2개가 더 있으나 미출시(`app/page.tsx:46`) | 실제 게임 화면 = `/e/demo-{roulette-mz-bright,scratch-premium,quiz-minimal,stamp-mz-bright}`. 컴포넌트 `components/game/{Roulette,Scratch,Quiz,Stamp}.tsx` | 공개 | 스탬프 `[data-stamp-board]` `[data-stamp-cell=filled|empty]`(`StampBoard.tsx:164,249,307,382`) · 게임 선택 스텝 `StepGame.tsx` |
| 경품 확률·재고 | 있음 | 빌더 `components/builder/StepPrizes.tsx`: `[data-prob-input=<키>]`(`:523`) `[data-prob-total]`(`:542`) `[data-prob-fix]` `[data-prize-stock-zero]` `[data-prize-lose-row]` `[data-free-limit="prizes"]`(`:602`); 관리자 "경품별 현황" `app/admin/events/[slug]/page.tsx:284`(`/api/admin/prize-stats`); 공개 `/e/…` 하단 "경품 안내 … 총 50개" | 빌더=로그인, 관리자=소유 이벤트 | 확률 입력은 pro 게이트(`manualProb`는 전 등급 개방, `plans.ts`). 재고 소진→꽝 귀속 확정 정책(CLAUDE.md 성역) |
| 매장별 QR 스탬프 | 있음, 단 데모 이벤트엔 매장 없음(`demos.ts`에 stores 0). 빌더 `StepStamp.tsx`(`aria-label="매장 수"`/`매장 <키> 이름`/`QR 개수` `:196,215,250,269`) + QR 발급 모달 `PublicQrButton.tsx`(`[data-store-qr-print]` `:214`, 관리자 이벤트 행 `EventRowActions.tsx:73`) + 착지 `/s/<slug>/<key>?v=&sig=` → `/e/<slug>?st=` (`app/s/[slug]/[key]/route.ts`) | 빌더 미리보기(서버 0)로 만들 수 있음. 서명 QR 은 `GET /api/stamp/store-qr?slug=`(**GET 이지만 DB 쓰기**, 6) | 소유 스탬프 이벤트 | QR 캔버스는 **가림 대상** |
| 참여 데이터 관리자 | 있음 | `/admin`(관리 홈 `app/admin/page.tsx:117`, 이벤트 목록 `:248`, 초안 `[data-drafts-section]`) · `/admin/events/<slug>`: 참여 통계 `:253` · 경품별 현황 `:284` · 운영 제어 `:301` · 날짜별 참여 로그 `:342` · 당첨자 명단 `#winners :388`(`components/admin/ui.tsx:209 WinnerTable` — 전화·이름 등 PII) · 블랙리스트 · 추첨 패널 · `/admin/events/<slug>/report` | 로그인 + 소유 이벤트. **진입 시 "관리자가 맞습니까?" 모달**(`AdminEntryGate.tsx`; 주소창 직접 진입이면 비밀번호 재확인 `POST /api/admin/reauth`) | 가림: WinnerTable 셀 · CSV 링크 |
| 관리자 초대 | 있음. **이메일 초대가 아니라 초대 링크 발급**(메모 label 입력 → `POST /api/invite` → `/invite/<code>`, 7일 만료) | `/admin/members` · `app/admin/members/page.tsx:66`(내 이메일 헤더) `:116`(관리자 목록 `m.email` `:133`) · `components/admin/InvitePanel.tsx`(`#invite-label` `:124`, 플레이스홀더 "예) 매장 매니저 김OO") · 수락 화면 `app/invite/[code]/page.tsx` | owner 계정만(추가 admin 은 403) | 가림: `sess.user.email`, 목록 이메일, 발급된 `/invite/…` URL 글자 |
| 요금제 | 있음 | `/pricing` · `app/pricing/page.tsx` + `PricingCards`(단일 소스 `lib/config/plans.ts`) · 랜딩 요약 `app/page.tsx:358` | 공개 | 4카드 Free/One-Time/Pro/Business. 라이브 실측 ₩300,000/건 · ₩200,000/월 일치 |
| 모바일: 완성된 이벤트 페이지 + 게임 진행(룰렛 등) | 있음 | `/e/<slug>` 390×844. 결과 `components/game/ResultStage.tsx`. 게임 시작 `play_event` = **PostgREST 직호출** `POST ${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/play_event`(`lib/game/playRpc.ts:19-24`) — 앱 `/api` 가 아님 | 공개 | 시작 버튼 `aria-label`=startLabel(`playEvent.tsx:1424`) |
| 모바일: 문자 인증 | 있음 | 시작 클릭 → EntrySheet → `input[placeholder="휴대폰 번호"]` `button:"인증번호"`(재전송 시 "재전송") → `input[placeholder="인증번호 6자리"]` `button:"확인"` → "인증 완료"(`playEvent.tsx:1310-1360`). 동의 체크박스 `[필수] 개인정보 수집·이용`·`[선택] 마케팅` | 공개, 단 `config.auth.phone` 켜진 이벤트(데모 4종·summer 는 `phone:true`) | 가림: 입력한 번호는 가짜(010-****-****)로 표시 |

없음/이름 다름: "AI 대화 기획"은 대화(BriefChat)가 예전 흐름에만 있고 새 흐름은 폼+엔진안. "디자인 자동 생성"은 AI 생성이 아니라 결정론 플래너/엔진(`GET /api/design/proposals` 머리말 "AI 호출 0", `lib/create-v2/server/propose.ts`). "관리자 초대"는 이메일 아님(링크). "경품 확률·재고"는 별도 화면 아님(빌더 스텝 + 관리자 현황 섹션).

## 4. AI 생성·문자 유료 호출과 주입 방법

호출 목록(전부 POST, 가로채기 대상):
| 용도 | 경로 | 응답 | 유료 |
|---|---|---|---|
| AI 대화 브리프 한 턴 | `POST /api/brief-chat` (`app/api/brief-chat/route.ts:132`) | JSON `{ok:true, reply, slots:{brandName,industry,goal,prize,entry,…}, done, derived:{goal,gameType}, usage}`; 실패 시 `{ok:false,code:"ai_unavailable"}` 200 → 클라가 폼 위저드로 폴백. 스트리밍 아님(클라가 30ms/2자 가짜 스트리밍, `BriefChat.tsx`) | Claude sonnet-4-6 (`lib/ai/briefChat.ts:30`) |
| 브리프 요약 | `POST /api/brief` `{answers}` → `{ok, summary}` (`BriefWizard.tsx:66-78`) | JSON | Claude (`lib/ai/brief.ts:18`) |
| AI로 완성하기(카피+디자인) | `POST /api/generate` body=`assembleBuilderInput(draft)` (`CreateClient.tsx:949`) | JSON `GenResult` = `{ok:true, config:EventConfig, copy:Copy, publishable, usage?}` (`lib/ai/types.ts:28-38`). `content-type: application/json` 필수(`CreateClient.tsx:955`) | Claude (`lib/ai/generate.ts:16`), 최대 300초 |
| 빌더 챗 편집 | `POST /api/chat` (`ChatPanel.tsx:177`) / `POST /api/design/chat-edit` (`DesignKnobs.tsx:107`) / `POST /api/suggest-copy` (`CopySuggest.tsx:40`) | JSON | Claude |
| AI 이미지 | `POST /api/ai-image` (`ChatPanel.tsx:221`) | JSON(URL) | Pollinations flux(`lib/ai/image.ts:39`) 외 |
| 공개 문의 챗(랜딩 위젯) | `POST /api/public-chat` | JSON | Claude(`lib/public-chat/ai.ts`) — 위젯 숨기면 불필요 |
| 새 흐름 공개 전 검사 | `POST /api/create-v2/gate {draftId}` 접수 → `GET /api/create-v2/gate?job=` 폴링 (`api.ts:75-80`) | `{ok:true,state:"queued|running"|"done"+lines+pass|"failed"}` (`contract.ts:81-83,142`) | `asset_jobs` 큐 워커(외부) |
| 새 흐름 안 만들기 | `POST /api/create-v2/{propose,more,pick,refit}` | JSON `{ok:true,draftId,updatedAt,draft}`(`contract.ts:123`) — **AI 호출 없음**(엔진=미리 만든 에셋 `lib/r100/*`) 이지만 초안을 DB 에 **저장** | 무료, DB 쓰기 |
| 문자 인증 발송/확인 | `POST /api/auth/send-code {slug,method:"phone",identifier}` → `{ok:true,ttlSec}`(`:231`) · `POST /api/auth/verify-code {slug,method,identifier,code}` → `{ok:true,verified:true}`+Set-Cookie(`:51-57`) | JSON | **SENS 실발송**(`lib/auth/sms.ts`, 운영 `sms:true`) |
| 당첨 문자 | `POST /api/notify-win` (`playEvent.tsx:247`, fire-and-forget, 당첨 시 자동) → `{ok,sent,status}` (`notify-win/route.ts:20,110`) | JSON | SENS(이벤트가 winnerSms 켠 경우) |
| 관리자 문자 | `POST /api/platform/testers/sms` | — | 플랫폼 관리자 전용, 촬영 대상 아님 |

**저장된 결과가 있는 곳**
- DB(운영, 읽기 전용으로만 접근): `event_drafts`(테스트 계정 테넌트의 초안 — AI 브리프/생성 결과가 `BuilderDraft` JSON 으로 저장; 관리 홈 `[data-drafts-section]` 에서 `/create?draft=<id>` 링크로 열림, `app/admin/page.tsx:309-339`), `event_configs`(발행본 config+copy), `generate_usage`, `asset_jobs`.
- 레포: 실제 `/api/brief-chat` 운영 응답 원문 `docs/design/p12d2/step0/briefchat-live-after.json`(2026-09-18, reply·slots·derived·usage 키 전부 포함 — 그대로 fulfill 본문으로 사용 가능), `…/briefchat-live-before.json`, `…/briefchat-hf-local.json`, 텍스트 요약 `docs/design/p12d6/live/brief-chat.txt`. `/api/generate` 응답 원문 저장본은 **찾지 못함**(미확인). EventConfig 픽스처 `scripts/fixtures/01~06-*.ts`·`event-qa-d1-maieventic.json`(+ `lib/config/sample.ts`). 빌더 실캡처 참고용 `public/howto/ai-{name,industry,game,prizes,entry,design,content,review,confirm,answers}.webp`, `public/journey/ui/0{1..5}-*.webp`(랜딩 저니에 쓰는 실제 /create 캡처), `public/landing-gallery/{roulette,scratch,quiz,stamp}-{main,game,result}.webp`.
- `scratch/q2-7`(120MB)·`docs/mvp/q2-7`: 46v2 새 흐름 QA 캡처·산출(원문 JSON 목록은 미조사).

**촬영 때 구체적 주입(새로 부르지 않고 채우기)**
1. AI 대화 기획: `page.route('**/api/brief-chat', r => r.fulfill({status:200, contentType:'application/json', body})` 에 위 `briefchat-live-after.json` 의 `reply/slots/done/derived/usage` 를 그대로(턴마다 `done:false`… 마지막 턴 `done:true` 와 5슬롯 `brandName,industry,goal,prize,entry` 가 차야 `[data-brief-wrap]` 기획안 요약이 뜸 — 마지막 턴 본문은 원본이 `done:false` 이므로 턴 2~3개를 slots 누적해 합성하고 `sms` 아닌 칩 경로는 요청 0 이라 가로채기 불필요, `BriefChat.tsx` 머리말). 합성한 응답은 shots.md 에 '재구성' 으로 표기.
2. `/api/brief` → `{ok:true, summary:"…"}`(요약 문장은 위 reply 에서 인용).
3. 디자인 자동 생성 결과: **새 흐름은 실제로 AI 호출이 없어 가로챌 것이 `POST /api/draft` 자동저장뿐**. 단, `propose` 응답의 `draftId` 는 서버 렌더 iframe `/create-v2/view/<draftId>/<slot>` 이 DB 에서 다시 읽으므로 **가짜 draftId 로는 3안 카드가 안 그려진다**. 해결: 테스트 계정 `/admin` 의 기존 v2 초안(`draft.createV2` 있는 것)의 `?draft=<id>` 를 열면 phase=pick/review 로 바로 복원(읽기 전용, `create/page.tsx:83-90,139`·`flow.ts initialFlow`). "입력→만드는 중" 연출이 필요하면 `propose` POST 를 가로채 그 초안의 `{ok:true,draftId,updatedAt,draft}` 를 돌려주고 `draft` 본문은 복원된 페이지의 RSC 초안(또는 `GET /api/draft?id=` 응답이 있으면 그것)에서 채취. `draft` JSON 형태 = `BuilderDraft & {createV2:{input,proposals,picked…}}`(`contract.ts:90,123`).
4. 예전 흐름 "AI로 완성하기": `/api/generate` 를 가로채 `{ok:true, config, copy, publishable:true}` — `config`/`copy` 는 `draftToPreview(draft)`(`lib/builder/draftPreview.ts`, AI 0 결정론 재조정)로 만든 값 또는 `scripts/fixtures` 의 EventConfig + 발행본 `copy`(운영 `/e/<slug>` 의 서버 렌더에서 확인 불가 — event_configs 는 anon 차단). 안전하게는 `lib/config/sample.ts` 의 `sampleEventConfig` + 그에 맞는 `Copy`(`lib/ai/types.ts` copySchema) 작성.
5. 문자: `GET /api/auth/methods` 는 그대로(sms:true) 두고 `POST /api/auth/send-code`→`{ok:true,ttlSec:300}`, `POST /api/auth/verify-code`→`{ok:true,verified:true}`(+Set-Cookie 불필요), `POST /api/notify-win`→`{ok:true,sent:0,status:"skipped"}`, `POST /api/auth/session-verify`→`{ok:true,identifier:"<입력번호>"}`. 클라가 `realVerify=true`(`methodsAvail.sms`)로 "인증번호 6자리" UI 를 그림.
6. 게임 결과: `page.route('**/rest/v1/rpc/play_event', …)` 에 `PlayResult`(`playEvent.tsx:117-152`) = 당첨 `{result:"스타벅스 아메리카노", already_participated:false, reward_id:"x", slot_number:n, participant_id:"x"}` / 꽝 `{result:"lose", already_participated:false}`. `result` 문자열은 해당 이벤트 경품명과 **정확히 일치**해야 룰렛이 그 칸에 멈춤(서버 권위·니어미스 없음, CLAUDE.md). 퀴즈는 `POST /api/quiz/check`→`{ok:true,correct:true,explanation:null}`, `/api/quiz/attempt`→`{ok:true,attempt_id:"x",expires_at:…}`, `/api/quiz/score`→`{ok:true,passed:true,score:{correct,total}}`; 스탬프는 `POST /api/stamp/accrue`→`StampAccrueResult`(`lib/game/stamp.ts:439-454`, `progress` 필요), 진행도 조회 `GET /api/stamp/status`(읽기라 통과 가능), 발행번호 `POST /api/issue-code`→`{ok:true,code:"…"}`, 수집 `POST /api/collect`.
7. Supabase 인증은 막지 말 것: 로그인은 브라우저가 `…/auth/v1/token` 으로 POST 함 — 가로채면 로그인 불가. 허용 목록에 두고, 앱 `/api` 쓰기만 가로챈다.

## 5. 테스트·관리자 계정
- **QA 고정 풀 5계정**: 이메일 규칙 `EMAIL_OF(n)` = `qa-pool-q1b1-<n>@example.com`(n=1..5, 6번은 가입 리허설용·평소 정지) — `scripts/mvp-q1-qa.mjs:67-75`. 이메일·userId·tenantId·plan 은 `docs/design/p13/mvp-q1b1/0/qa-pool.json`(레포, 비밀번호 없음). **#1·#2·#3 = pro 등급**(`PRO_SET`, `mvp-q1-qa.mjs:71`), 나머지 free. 비밀번호는 레포 밖 `~/.q1r/qa-pool.json`(존재 확인: 모드 600, 2026-10-02 갱신) — 값 미열람. 풀은 `scripts/mvp-q1b1-qa-pool.mjs` 가 보장(풀 계정은 정지 해제, 풀 밖 QA 3개는 876000h 정지 — `docs/design/p13/mvp-q1b1/0/QA-정지-적용.json`).
- 구 하드코딩 QA 계정(`qa-artdirector-20260711`: `scripts/verify-step3-live.mts:25-26`, 또 `QA_EMAIL/QA_PASS` env 를 쓰는 스크립트 18개)은 정지됐을 수 있음(풀 밖) — 풀 계정 사용 권장.
- 플랫폼 관리자(`/platform/*`)와 일반 사업자 관리자(`/admin`)는 다름. 촬영은 풀 #1(pro)로 `/admin`·`/create`·`/admin/members`·`/admin/events/<slug>` 가능. 새 흐름 여부는 계정 `app_metadata.create_v2` (풀 계정 설정은 미확인 → 로그인 후 `/create` 로 판별).
- **이벤트 보유 확인 방법(읽기만)**: 로그인 후 `GET /admin` 이벤트 목록(`app/admin/page.tsx:248`)과 초안 섹션 `[data-drafts-section]`(`:309`)을 본다. 서버 쿼리 금지이므로 DB 직접 조회는 하지 않음 → **풀 계정이 이벤트·초안을 가졌는지는 미확인**(로그인 필요). 풀 계정이 이벤트가 없으면 관리자 화면 촬영용 데이터가 비어 있음 → BLOCKED 후보(대안: 빌더 미리보기·`/e/demo-*` 를 소유 이벤트가 없는 관리 화면 대신 사용, 또는 `/admin/events/<slug>` 는 소유 이벤트만 열려 불가).
- 로그인 폼은 `/login`(`components/auth/AuthForm.tsx`, `input[name=email]`, 회원가입엔 `name`·`tel` 필드 — **가입은 하지 말 것**).

## 6. 쓰기 위험
- **GET 인데 서버 쓰기**:
  - `GET /create`(페이지) → `recordAnalyticsAfter create_event`(`app/(builder)/create/page.tsx:151`, 유저·KST일 1행 디듀프) · 최초 로그인 시 `provision_tenant_for_user` RPC(`lib/auth/requireUser.ts:101`). 풀 계정은 이미 테넌트가 있어 후자는 없음.
  - `GET /api/stamp/store-qr?slug=`(소유자) → `event_stores` upsert/update, `qr_secret` 재생성 가능(`app/api/stamp/store-qr/route.ts:83,95,102`). **QR 모달을 여는 것만으로 운영 DB 에 씀 → 이 요청은 가로채야 함**(가짜 `{ok:true,slug,version,stores:[{key,name,v,sig}]}`).
  - `/e/<slug>` 진입 시 클라가 `navigator.sendBeacon('/api/beacon')` page_view·cta_click 전송(`src/instrumentation-client.ts:20-35`) → `beacon_events` 행. 헤드리스 UA 라도 DNT/GPC 가 켜져 있으면 안 보냄. 가로채거나 `navigator.doNotTrack="1"` 로 막고 보낸 수를 json 에 적을 것. `window "mai:ev"` 이벤트(게임 시작·결과·폼 제출, 빌더 단계)도 같은 비콘 경로. 별도 `POST /api/analytics/beacon` 존재.
  - 세션 갱신 `proxy.ts` `updateSession` 은 쿠키만.
- **쓰기 API(POST/PATCH/DELETE) — 모두 가로채기**: `play_event` RPC(PostgREST, 참여·재고 차감 `reward_inventory.issued_count`), `/api/stamp/accrue`, `/api/quiz/{attempt,score}`, `/api/collect`, `/api/auth/{send-code,verify-code,session-verify}`, `/api/notify-win`, `/api/draft`(자동저장 POST/PATCH/DELETE), `/api/publish`, `/api/consents`, `/api/preview`(미리보기 토큰 발급), `/api/invite`, `/api/members`, `/api/create-v2/*`, `/api/admin/{draw,prize-draw,redeem,blocklist,event-edit,event-republish,set-password,report-share,request-edit-help}`, `/api/assets/*`, `/api/feedback`, `/api/public-inquiry`, `/api/payments/{create-order,confirm}`, `/api/upload`, `/api/me/*`.
- **읽기인데 POST**(가로챌 때 예외 — 응답을 직접 채워야 화면이 진행): `POST /api/quiz/check`(쓰기 0, `{ok,correct,explanation}`), `POST /api/issue-code`(쓰기 0), `POST /api/admin/reauth`(비밀번호 재확인, 쓰기 0 — 관리자 진입 모달 통과용, 가로채면 응답 형태는 `app/api/admin/reauth/route.ts:47` 에서 확인 필요(미확인)), `POST /api/auth/methods` 아님(GET). `POST /api/create-v2/gate` 는 잡 접수(쓰기 있음).
- 가로채지 말아야 할 것: Supabase auth(`/auth/v1/*`) — 로그인. `GET /api/stamp/status`·`/api/auth/methods`·`/api/admin/{stats,prize-stats,winners}`·`/api/design/proposals` 는 읽기라 통과.
- 서버 컴포넌트가 읽는 데이터는 모두 실데이터: 관리자 화면 PII 는 DOM 에서 가림(7).

## 7. 가림 대상 (DOM 텍스트 치환, 규칙 `portfolio-capture.md` 가림 규칙)
- 푸터 사업자 정보(전 마케팅·빌더 페이지): 상호·대표자·사업자번호·통신판매업신고·주소·**대표전화**·**이메일**·개인정보책임자 — `lib/company.ts:13-35`(`COMPANY`), 렌더 `components/SiteFooter.tsx:25-72`. 규칙상 전화·이메일·주소는 지움(그 외 항목은 판단). 랜딩 본문에 `mai-eventic@…` 이메일 문자열 노출 확인.
- 화면 속 도메인·URL: 브라우저 주소창은 어차피 안 찍힘. 본문엔 `mai-eventic.com`, 공개 링크 `/e/<slug>` 표시·복사 문구, `BRAND.contactEmail`(`lib/config/brand.ts` — 문의 폴백).
- 참여자 전화·이름: 문자 인증 입력칸(`input[placeholder="휴대폰 번호"]`), 당첨자 명단(`components/admin/ui.tsx:209 WinnerTable`), 참여 로그, CSV 링크, 발행번호 코드(가짜화 권장), 결과 화면의 수집 폼(이름·인스타그램).
- 관리자 이메일: `/admin/members`(`page.tsx:66,133`), `AdminForbidden email`, 헤더 내 계정/마이페이지 메뉴(`MyPageLink`), 로그인 폼 입력값. 테넌트 표시명이 이메일 꼴이면 `invite/[code]` 가 마스킹(`:23`).
- 초대 링크 URL(`/invite/<code>` — 토큰, 가림 필수), 메모 "매장 매니저 김OO" 류 이름.
- QR: 배포용 QR `PublicQrButton`, 매장 QR 인쇄 시트(`[data-store-qr-print]`), 빌더 `MobilePreviewButton`/`PreviewLinkButton` 모달의 QR 캔버스 → 전부 삭제/가림. 랜딩 `public/journey/ui/05-live.webp` 등 정적 이미지 안에 QR·연락처가 있는지 별도 확인 필요(미확인).
- 챗 위젯 FAB, 빌더 챗 독(`BuilderChatDock.tsx`)은 필요시 숨김.
- 쿠폰/경품 문구 "스타벅스 아메리카노" 등은 상표명이지만 데모 데이터(공개 상호 아님). 판단 필요.

## 8. 사실 후보 (자막용)
1. **게임 4종**(룰렛·스크래치·OX퀴즈·스탬프·출석) — `lib/config/schema.ts:470`, `lib/showcase/demos.ts:80`, Free 카드 `plans.ts` "게임 4종". (랜딩 마퀴 "퍼즐·브랜드게임"은 예정 `app/page.tsx:46` — 자막에 쓰지 말 것.)
2. **요금제 4종·가격**: Free 무료 / One-Time ₩300,000(건) / Pro ₩200,000(월) / Business 상담 후 견적 — `lib/config/plans.ts:229-232,308-313,386-389,445-448`; 라이브 `/pricing` HTML 에서 ₩200,000·₩300,000 확인(22:5xZ). 단 Pro "월" 표기는 코드 주석에 "K6 대표 확인 대기"(`plans.ts:311-312`).
3. **AI 모델 = Claude Sonnet 4.6** (`claude-sonnet-4-6`): `lib/ai/generate.ts:16` `briefChat.ts:30` `brief.ts:18` `chat.ts:34` `suggestCopy.ts:15`. 이미지 `flux`(`lib/ai/image.ts:39`).
4. **Free 한도**: 발행 1회·AI 질문 10회·디자인 중간 수정 3회·경품 총 100개·종류 4가지·기간 14일·방문자 일 100명/이벤트 전체 1,000명 — `plans.ts:229-262,285-295`. 카드 문구는 "디자인 1회 무료"(`:269`), 상세는 "중간 수정 3회"(`:295`)로 **서로 다름** → 자막에는 쓰지 말 것.
5. **Pro 한도**: 월 발행 20(백스톱)·AI 챗 월 50·방문자 일 2,000/총 10,000·추가 관리자 3인 — `plans.ts:313-320`.
6. **"5분 만에 자동 생성"**(기획·디자인·퍼블리싱) — `app/page.tsx:61` 카피(마케팅 주장, 실측 아님). 진입 카드 배지 "약 2분 · 대화로 완성"·"3분이면 끝나요"(`brief.ts:60,67`).
7. **빌더 스텝 = 기획·만들기·퍼블리싱 3페이즈 / 최대 9스텝**(brand·game·quiz·stamp·entry·prizes·design·content·review) — `lib/builder/phases.ts:10-13`, `CreateClient.tsx:99-112`.
8. **경품 소진 시 꽝 귀속**·**서버 결과 확정(니어미스 0)** — CLAUDE.md 성역(제품 원칙). 코드: `lib/event/exhaustion.ts`, `Roulette` 서버 권위.
9. **시연 데모 이벤트 62종**(톤8×게임4 + 테마 + 목적 + 업종)이 사이트맵에 있으나 `/showcase/*` 는 숨김 상태 — `lib/showcase/demos.ts`, `templates.ts:20`. 자막용으로는 비추.
10. 발행물 176건 전수 파싱 성공 — `app/e/[slug]/page.tsx:124` 주석(날짜 불명, 시점 값). **미확인**(운영 DB 읽기 쿼리 금지라 현재 수 못 셈). 참여자·이벤트 수 등 실데이터 수치는 전부 **미확인**.
11. 보안·품질 수치(자막 비추천): Lighthouse 등은 `docs/` 에 있으나 이번엔 미확인.

## 9. 브랜드
- 주색 **포인트 레드 `#C81E3A`**(`--mai-red-600`, `src/app/tokens.css:16-17`; 토큰 `--color-point: var(--mai-red-600)` `globals.css:42`), hover `#9F1239`(`tokens.css:17`), 옅은 배경 `#FDECEE`, 본문 잉크 `#191F28`, 회색 `#4E5968/#E5E8EB/#F9FAFB`, 성공 `#047857`. 로고는 워드마크 텍스트 "mai-eventic"(`lib/config/brand.ts:13`, `components/marketing/SiteHeader.tsx:56` `font-display text-lg font-black`) — **별도 SVG/PNG 로고 원본 없음**. 슬로건 "딸깍, 이벤트는 AI가"(`brand.ts:19`).
- 폰트: 마케팅 헤딩·본문 **Paperlogy**(`public/fonts/Paperlogy-{4Regular,5Medium,6SemiBold,8ExtraBold,9Black}.subset.woff2`, `.font-display`/`.font-paper` `globals.css:1770-1776`); 빌더·관리자 **Pretendard Variable**(+Geist 폴백, `.builder-ui` `globals.css:124`); `/e` 발행물은 Paperlogy Dyn·Pretendard dyn 등(`public/fonts/{paperlogy-dyn-v2,pretendard-dyn,…}`).
- 아이콘·파비콘: `public/brand/{favicon.ico,icon-192.png,icon-512.png,kakao-app-icon-128/640.png}`, `public/apple-touch-icon.png`.
- 히어로·제품 이미지(원본 파일): `public/journey/ui/01-game…05-live.webp`(실제 /create 캡처 5장), `public/landing-gallery/*.webp`(게임별 main/game/result + @2x), `public/howto/*.webp`(빌더 AI 흐름 캡처 21장), `public/showcase/cases/*`, 히어로 룰렛은 코드 렌더(`components/landing/HeroRoulette.tsx`), 저니 Lottie `public/journey/lottie/phone.json`. 히어로 영상 파일은 없음(코드 애니메이션). 갑 자산(대표 손제작 포트폴리오) 픽셀은 레포에 없음(성역 규칙).

## 10. 다른 세션 점유
- `git worktree list`(maimai-event-builder): 본체 `/home/dev/maimai-event-builder [main]` + `.claude/worktrees/agent-*` 8개(전부 locked, 서브에이전트 사본) + 형제 `/home/dev/maimai-jipyeong [jipyeong]`. 이 레포에 현재 **마이이벤틱 dev/start 서버 없음**(ss·ps 기준).
- `git status`(촬영 시작 전 기준, 7줄): `?? HANDOFF.md`, `?? docs/design/p13/hf1b1/`, `?? docs/mvp/t1/3/gate-t1b-10210638/`, `?? docs/specs/hf1b1-live-gates.md`, `?? install.pid`, `?? scripts/cwv-probe.mjs`, `?? scripts/m5a/.probe-h.mjs` (modified 0, 전부 untracked). 이 상태가 합격 기준 4)의 기준선. PROGRESS.md 상단 NOW 로 보아 이 세션이 계속 작업 중(46v2 추가 15b·GTM)이라 변경 가능성 있음.
- 점유 포트(ss, 읽기만): 3311·3312(safefile next start), 3475·3491·3493(Medimajor worktree next-server), 38791(gochingphone), 8781·8782(sealkitt harness), 54321/54322/54324/55421-55424/55931/55932(다른 프로젝트 로컬 supabase 추정), 5432, 17510·34867·44351(java). 이 레포 포트 없음.
- 빈 포트 후보(확인 시점): 3000 3001 3100 3200 3300 4100 4200 4300 5100 5200 6100 6200 7100. 메모리 가용 14GB(총 46GB, 빌드 안 함).
- 권고: 로컬 서버 불필요(운영에 가로채기 촬영). 로컬이 꼭 필요하면 worktree + 위 빈 포트, 단 `.env.local` 이 운영 DB 를 가리키므로 위 가로채기 목록 동일 적용.

## 11. 명세 ↔ 코드 차이 요약
1. "AI 대화 기획"은 예전 흐름 `BriefChat` 에만 있고, 새 흐름(create_v2)은 입력 폼+엔진 3안. 계정 플래그로 갈림 — 어느 쪽인지 로그인해야 확인.
2. "디자인 자동 생성 결과"는 LLM 생성이 아니라 결정론 엔진·플래너 3안(AI 호출 0). `/api/generate`("AI로 완성하기")는 카피·디자인 디테일을 Claude 로 채우는 별도 기능(예전 흐름).
3. "게임 4종" = 룰렛·스크래치·OX퀴즈·스탬프(출석) — 일치. 랜딩에 "퍼즐(예정)·브랜드게임(예정)" 문구가 더 있음(미출시).
4. "경품 확률·재고"는 별도 화면이 아니라 빌더 경품 스텝 + 관리자 이벤트 상세 "경품별 현황" 섹션.
5. "매장별 QR 스탬프": 데모 이벤트엔 매장 모드 없음. 빌더 `StepStamp` 매장 입력 + QR 모달(서명 발급 GET 이 DB 에 씀)로만 보임.
6. "참여 데이터 관리자"는 `/admin/events/<slug>` 의 통계·참여 로그·당첨자 명단(PII 포함), 로그인+소유 이벤트+진입 확인 모달 필요. 풀 계정의 이벤트 보유는 미확인.
7. "관리자 초대"는 이메일 초대가 아니라 **초대 링크 발급**(`/admin/members`, owner 전용).
8. "요금제" 일치(`/pricing`·랜딩 요약). 가격은 코드·라이브 일치.
9. "문자 인증"은 운영에서 실제 SENS 연동(`sms:true`) — 가로채기 필수. 폼은 서버 HTML 에 없고 "시작" 클릭 뒤 뜸. `play_event` 는 앱 API 가 아니라 Supabase PostgREST 직호출(`**/rest/v1/rpc/play_event` 로 가로채야 함).
10. `/showcase/<demo-slug>` 상세·`/showcase` 데모 갤러리는 현재 비노출(redirect → `/create`). 데모 이벤트는 `/e/demo-*` 로 직접 접근.
11. GET 인데 서버 쓰기: `/create` 진입 분석 행, `/api/stamp/store-qr`, `/e` 비콘(POST).
12. 로고 원본 SVG 없음(텍스트 워드마크) — media/ 에는 `public/brand/icon-*.png` 와 워드마크 스크린샷으로 대체해야 함. 히어로 영상 없음.
