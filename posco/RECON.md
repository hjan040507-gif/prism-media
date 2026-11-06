# posco 사전 조사 (RECON) — 2026-11-05 · 읽기 전용 조사

- 대상 레포: `/home/dev/maimai-posco` (main `27e9e64d`, 조사 시 working tree 깨끗). origin = `sdi0433-svg/maimai-event-builder` (posco 는 maimai-event-builder 모노레포 안의 한 기능이다. 별도 앱이 아니다).
- 조사 범위: 코드·docs 읽기, 운영 URL `curl` GET/HEAD 만. 서버·빌드·브라우저·DB 쿼리·`.env*` 읽기 0 (`.env.local` 은 deny 규칙으로 막혀 있어 env 이름은 코드의 `process.env.*` 로만 수집).
- 비밀값·PIN 값·전화번호 기록 0.

## 0. 한 줄 결론

1. **화면은 거의 전부 클라이언트 fetch 구조**라서 `page.route` 로 `/api/posco/*` 를 가로채 가짜 JSON 을 주입하면 **운영과 픽셀 동일한 실서비스 UI**(`/posco-ox`)를 가짜 데이터로 찍을 수 있다. 예외 1곳: 운영 현황판 `/posco-ox/ops` 첫 화면만 서버 컴포넌트가 DB 를 읽는다(§1-4).
2. 운영 `/posco-ox` 는 **행사 종료(closed) 안내 화면**만 나온다. 참여 흐름 화면은 라이브에서 찍을 수 없다 → **로컬 임시 clone 에서 띄워야 한다**.
3. 레포에 **데모 모드가 이미 있다**: `/demo/posco-ox`(mock 어댑터, 서버·DB 접점 0, 라이브에도 배포돼 200). 단 데모는 `isDemo=true` 라 "시안" 문구·인증번호 토스트·3탭 등급 강제시트가 끼어 **실서비스와 픽셀이 다르다**. 촬영 본선은 `/posco-ox`(live 어댑터) + 요청 가로채기, 데모 경로는 비교·보조용.

## 1. 스택·실행

### 1-1. 스택
| 항목 | 값 | 근거 |
|---|---|---|
| 프레임워크 | Next.js **16.2.9** App Router, React **19.2.4**, TS, Tailwind 4 | `package.json` dependencies |
| 패키지 매니저 | **npm** (`package-lock.json`) | 레포 루트 |
| 빌드/실행 | `npm run build` = `copy-pdf-worker.mjs` → `gen-event-css.mjs` → `next build` / `npm start` = `next start` / dev = `gen-event-css.mjs && next dev` | `package.json` scripts |
| 주의 | `AGENTS.md`: "이 Next.js 는 다르다 — `node_modules/next/dist/docs/` 먼저 읽을 것" | `AGENTS.md:1-5` |
| node_modules | **이 폴더엔 없음**. 임시 clone 에서 `npm ci` 필요. maimai-event-builder·jipyeong 과 lock 해시가 달라 node_modules 공유는 위험 | md5 비교 |
| 빌드 외부망 | `next/font/google`(Geist) 사용 → `next build` 시 외부망 필요. posco 화면 폰트는 로컬 woff2 | `src/app/layout.tsx:2` |
| 모션 | framer-motion 12(화면 전환·카드 spring) + CSS keyframes(스캔·블룸) + setTimeout 타이머 | §3 |

### 1-2. env 변수 이름만 (posco 가 읽는 것)
- DB: `POSCO_SUPABASE_URL`, `POSCO_SUPABASE_SERVICE_ROLE_KEY` (`src/lib/posco/db.ts:11-12`) — posco 전용 Supabase(ref 는 `RUNBOOK.md:7`), maimai 본 DB 와 격리.
- 서명·해시: `POSCO_SESSION_SECRET`(세션·운영 쿠키 JWT, `session.ts:15`·`ops.ts:83`), `POSCO_OTP_PEPPER`(`otp.ts:30`), `POSCO_STAFF_PIN_HASH`(`staff.ts:18`), `POSCO_OPS_PIN_HASH`(`ops.ts:93`).
- 문자: `POSCO_SMS_LIVE`, `POSCO_SMS_DAILY_CAP`, `POSCO_NCP_ACCESS_KEY`, `POSCO_NCP_SECRET_KEY`, `POSCO_SENS_SMS_SERVICE_ID`, `POSCO_SENS_CALLING_NUMBER` (`sens.ts:29-47`).
- 기타: `POSCO_TEST_REENTRY`(`reentry.ts:22`), 하네스용 `POSCO_TEST_OPS_PIN`·`POSCO_TEST_STAFF_PIN`·`POSCO_BASE_URL`·`POSCO_QA_RESET_OK`·`POSCO_ZIP_PW`.
- 클라이언트로 나가는 `NEXT_PUBLIC_*` 중 posco 가 쓰는 것 없음.

### 1-3. 로컬 실행 시 DB
- `.env.local` 이 있으면 **운영 posco Supabase 를 가리킨다**(과거 `scripts/shot-posco-ops.mjs:10-30` 은 운영 DB 에 시드 후 촬영했다). 이번 촬영은 **이 방식 금지**.
- `.env.local`·`node_modules` 는 clone/worktree 에 따라오지 않는다(.gitignore). 즉 **env 없이 clone 하면 기본이 안전**하다.
- **권장 안전 구성(fail-closed)**: 임시 clone 에서 env 를 전부 **가짜·도달 불가 값**으로 준다.
  - `POSCO_SUPABASE_URL=http://127.0.0.1:<닫힌 포트>` + 임의 service key → 가로채기를 놓친 요청이 있어도 운영 DB 에 닿지 않고 실패만 한다.
  - `POSCO_SESSION_SECRET`/`POSCO_OTP_PEPPER` 는 로컬에서 새로 만든 임의 문자열, `POSCO_SMS_LIVE` 는 미설정.
  - `/posco-ox`·`/demo/posco-ox` 는 `src/proxy.ts` matcher 에 없고(`proxy.ts:15-38`) 서버에서 env 를 안 읽으므로 이 값만으로 뜬다.

### 1-4. 가짜 데이터로 채우는 방법 (핵심)
| 화면 | 서버가 DB 를 읽나 | 가짜 데이터 주입 방법 |
|---|---|---|
| `/posco-ox` 참여 흐름 전체 | **아니오**: 페이지는 정적 셸, 데이터는 전부 클라 `fetch('/api/posco/...')`(`demo/posco-ox/data/live.ts:30-38` `post()`, `:148` `getStatus`) | `page.route('**/api/posco/**')` 로 §5 목록 가로채기. 단계 상태는 메모리 state 뿐(`PoscoOxDemo.tsx:50-57`). 서버 세션 쿠키 `posco_sess` 는 `getStatus` 응답으로만 의미가 있어 **쿠키 불필요** |
| `/posco-ox/claim/{token}` | **아니오**: `page.tsx` 는 token 만 넘기고 `ClaimView.tsx:89-150,171` 에서 fetch 3종 | token 은 16자 이상 임의 문자열(서버가 길이만 검사, `claim/[token]/route.ts:11`). §5 의 claim 3종 가로채기 |
| `/demo/posco-ox/claim?tier=&coupon=&claimed=&day=` | **아니오, fetch 0**(`demo/posco-ox/claim/page.tsx`, props 주입) | URL 쿼리로 tier(gold/blue/steel)·쿠폰(on/exhausted/none)·수령완료·일차 전환. 쿠폰 이미지는 인라인 SVG "기프티콘 (예시)"(`claim/mock-coupon.ts`). 같은 `ClaimView` 컴포넌트라 레이아웃 동일. 단 스탭 확인 버튼은 데모에서도 `POST /api/posco/claim/demo/confirm` 을 호출(`ClaimView.tsx:171`; 토큰 4자라 서버가 DB 전에 404) → 가로채기 필요 |
| `/posco-ox/ops` 현황판 | **예, 첫 렌더만**: `ops/page.tsx:19-20` 서버가 `getOpsSession()` 후 `getOpsSnapshot(poscoDb())` 를 SSR 로 `<OpsBoard initial=…>` 에 넣는다. 이후 갱신은 **30초 `setInterval`** 로 `GET /api/posco/ops/stats`(`OpsBoard.tsx:47-58`, 마운트 즉시 호출은 아님) | ① 운영 쿠키 `posco_ops` 를 **로컬 임의 `POSCO_SESSION_SECRET` 으로 jose HS256 JWT `{ops:true}`** 로 직접 발급해 심는다(형식 `ops.ts:103-128`; 로그인 API 안 부름 → DB·PIN 불필요). ② DB 가 닫혀 있으면 SSR 스냅샷은 전부 0(`.data ?? 기본값`, `ops-stats.ts:144-146`, 크래시 없음). ③ `page.clock.install` 후 `runFor(30000)` 으로 폴링을 발화시키고 `/api/posco/ops/stats` 를 가로채 §5 스냅샷 주입. (대안: 임시 clone 안에 `<OpsBoard initial={가짜}/>` 를 그리는 하네스 라우트 추가 — 고객 repo 가 아니라 임시 clone 이라 허용되나 URL 이 달라진다) |
| `/posco-ox/ops/winners`·`/survey`·`/coupons` | 게이트(쿠키)만 서버, 데이터는 전부 클라 fetch(`WinnersView.tsx:47`, `SurveyView.tsx:25`, `CouponsView.tsx:23`) | 위 쿠키 + 해당 `/api/posco/ops/*` 가로채기 |
- **운영 DB 쓰기 0 보장**: (a) 도달 불가 DB URL, (b) `page.route` 로 `/api/posco/**` 전체 가로채기(미등록 요청은 `route.abort`), (c) 가로챈 수를 json 에 기록.
- 보조(참고): `/demo/posco-ox`(mock 어댑터)는 `PoscoApiProvider mode="demo"`(`demo/posco-ox/page.tsx:51`). `?state=sold_out|closed|not_open&day=1|2|3` 로 차단 안내 3종 미리보기(`data/mock.ts:14-25`). 이 3종은 라이브 데모 URL 로 찍어도 문구가 실서비스와 같다(`phases/Blocked.tsx`). 단 데모엔 `PhoneStep.tsx:220` "본 화면은 시안이며…" 문구가 있다.

## 2. 라이브 주소와 상태 (2026-11-05 22:47Z, GET/HEAD 만)

운영 도메인 `https://mai-eventic.com` (`RUNBOOK.md:6`).

| 경로 | 결과 |
|---|---|
| `/posco-ox` | HTTP 200. HTML 은 부팅 점 3개 셸(`불러오는 중`), JS 가 `GET /api/posco/session` 후 종료 안내로 전환 |
| `GET /api/posco/session` | 200 `{"ok":true,"authed":false,"hasSurvey":false,"hasAward":false,"event":{"state":"closed","dayNo":null}}` → 참여 화면은 **`Blocked`(행사 종료 · "이벤트가 종료되었습니다")** 만 노출(`PoscoOxDemo.tsx:119-127`, `content.ts:518-528`) |
| `/posco-ox/ops`, `/posco-ox/ops/winners` | 200, **운영 PIN 게이트**("운영자 전용 화면입니다…") HTML. 데이터·PII 0 |
| `/posco-ox/claim/0123456789abcdef0123`(가짜 토큰) | 200 셸. 데이터 호출은 JS 가 하므로 브라우저로 열지 말 것(`POST …/coupon` 은 **쓰기**, §5) |
| `/demo/posco-ox`, `/demo/posco-ox/claim` | 200, 데모 정상 로드("시안" 문구 포함) |
| `robots.txt` | `Disallow: /demo/`, `/posco-ox`; 페이지 meta noindex |
- 결론: 운영 화면은 **닫혀 있음**. 참여 흐름·claim·ops 데이터 화면은 **로컬 가짜 데이터로 채워야 한다**. 종료 상태 스크린샷은 레포에 이미 있다(`docs/posco/day3-evidence/landing-closed-375.png`, `…-1440.png`).
- 라이브 `/api/posco/session` GET 은 읽기 전용이지만 DB 를 읽는다. 촬영 중 라이브 호출은 피할 것.

## 3. 명세 ↔ 실제 라우트/컴포넌트

공통: 참여 흐름은 **한 URL(`/posco-ox`) 안에서 메모리 state(phase)로 넘어간다**(라우터 이동 없음). 새로고침하면 `GET /api/posco/session` 으로 복원(우선순위 hasAward→result > state≠open→blocked > hasSurvey→result > authed→zoning > verify; `PoscoOxDemo.tsx:119-137`). 루트 컴포넌트 `src/app/demo/posco-ox/PoscoOxDemo.tsx`(라이브 `/posco-ox/page.tsx` 와 데모가 공유). 하이드레이션 센티넬 `main[data-px-ready="1"]`(`:101`). 채팅 위젯은 `/posco-ox`·`/demo` 접두사에서 자동 숨김(`components/public-chat/hidePrefixes.ts:12`). 이하 `D/` = `src/app/demo/posco-ox/`.

| # | 명세 항목 | 실제 | 진입 조건 | 호출 API | 근거 |
|---|---|---|---|---|---|
| 1 | 모바일 랜딩 | **별도 랜딩 화면 없음.** `verify` 단계의 `PhoneStep` 이 히어로(지구본 이미지+"포스코 K-GX / OX 퀴즈 챌린지")와 **이름+휴대폰+동의+CTA("참여 시작하기")를 한 화면**에 가짐 | `/posco-ox` 첫 진입, `event.state=open`, 미인증 | `GET /api/posco/session`(부팅) | `D/phases/verify/PhoneStep.tsx:77-212`, `D/content.ts:11-17,87-103`; 합친 결정 `docs/posco-xd-0803-spec.md:50` |
| 2a | 문자 인증: 번호 입력 | 같은 화면. `data-px="name-input"`(`PhoneStep:128`)·`phone-input`(`:151`)·`consent`(`:180`)·`consent-open`(보기 시트)·CTA `send`(`:209`) | 이름·번호 유효 + 동의 체크 | `POST /api/posco/otp/send {phone}` | `D/phases/Verify.tsx:83`, `D/data/live.ts:56-76`, `api/posco/otp/send/route.ts:22` |
| 2b | 인증번호 입력 | `CodeStep`: 6자리 숫자 `CodeCells`(`D/ui/CodeCells.tsx:58-65`), 카운트다운 `mmss`, 재발송 `resend`, `edit-phone`, 문구 `content.ts:119`("… 로 보냈어요") | 발송 성공 시 `stage="code"`(`Verify.tsx:108`) | `POST /api/posco/otp/verify {phone,code,name}` | `Verify.tsx:119-127`, `live.ts:79-91`. 성공 후 `success`/`joined` 단계(이미 당첨자면 `JoinedStep`) |
| 3 | 전시 존 안내 | `Zoning`: 5개 존 카드 + 평면도 `floorplan`(탭하면 확대 `FloorplanViewer`) + 고정 CTA "퀴즈 시작하기"(`ZoningDock`, `data-px="zoning-start"`) | 인증 직후 | 없음 | `D/phases/Zoning.tsx:27`, `PoscoOxDemo.tsx:213-230`, `content.ts:272-296`, `src/lib/posco/zones.ts` |
| 4 | OX 퀴즈 문항·선택·정/오답 | `Quiz`(5문항, 문항당 20초 타이머, O/X 패드 `OxPad`, 판정 시트 `Verdict`: 정답 "정답입니다"+다음 / 오답·시간초과 "아쉬워요/시간 초과"+힌트+"다시 풀기") | zoning CTA | `POST /api/posco/quiz/answer {qNo,answer}` (fire-and-forget, 채점은 클라 `content.ts` 즉시) | `D/phases/Quiz.tsx:29,85`, `quiz/Verdict.tsx:124-180`, `quiz/OxPad.tsx:144`, `content.ts:182-237`. 정답키 O·X·O·O·O(`src/lib/posco/quiz.ts:9`) |
| (명세에 없음) | **미션 완료** 인터스티셜(다크, "5 / 5") | 퀴즈 5문 완료 직후 → 설문 | 없음 | | `D/phases/Mission.tsx:23`, `content.ts:298-318` |
| 5 | 설문 | `Survey` 5문항을 한 문항씩: Q1 방문 계기(선택)·Q2 만족도(5점)·Q3 인상 깊은 컨텐츠(존)·Q4 K-GX 이해도(5점)·Q5 자유 소감(주관식 필수) + 진행 `segments`, 마지막 "제출하고 추첨하기" | mission 다음 | `POST /api/posco/survey/submit {motive,q1,q2,q3,q5}` | `D/phases/Survey.tsx:42,132`, `phases/survey/*Step.tsx`, `content.ts:320-377`, `api/posco/survey/submit/route.ts:25` |
| 6 | 경품 추첨 연출 | `Result` → `ResultStage`. **마운트 즉시 `POST /draw` 호출**(결과를 먼저 받아 둠) → 대기 `draw-base`(동심원+?+진행바) → 사용자가 **[당첨 결과 확인] 탭**(`draw-confirm`, `ResultStage.tsx:364`, `Result.tsx:273 onArm`) → 스캔 → 블룸 → 플래시 → 카드 | survey 제출 후 | `POST /api/posco/draw` | `D/phases/Result.tsx:91-260`, `phases/result/ResultStage.tsx:335-412` |
| 6a | **연출 방식·길이** | **등급과 무관한 통일 리빌**(`Result.tsx:125 cfg=REVEAL.blue`): ①스캔 **1300ms**(setTimeout `Result.tsx:196-199`; 링 3겹 CSS `px-scan-contract` 0.7/0.82/0.96s 무한 반복 `posco.css:701`) ②블룸 **500ms**(CSS `px-bloom-expand .5s` `posco.css:744`, `BLOOM_MS` `Result.tsx:38`) ③끝 **120ms 화이트 플래시**(`FLASH_MS`, `data-px="flash"`) ④결과 카드 = **framer-motion spring**(stiffness 240·damping 20, `phases/result/PrizeCard.tsx:72-75`)+확인코드 글자별 CSS `px-codechar .16s`(`posco.css:959`)+카드 광택 `px-card-sheen`. 총 약 **1.8초 + spring 안착**. 단계 전환은 전부 **setTimeout**(주석 `Result.tsx:33-34`) → `page.clock` 으로 결정론 가능. CSS 애니메이션은 `document.getAnimations()` currentTime 동기 필요, framer 는 rAF(`page.clock` 이 rAF·performance.now 도 가짜화) | | | |
| 7 | 당첨 결과 | `PrizeCard`(`data-px="prize-card"`: win-title·prize-name·경품 이미지·`code` 확인코드 "AAA-0000"형·수령 안내 `claim-guide/claim-place`). **등수·금액 비노출**(XD 0810), 경품명만: gold 경량5단 양우산 / blue 탁상 미니선풍기 / steel 아메리카노 커피 | 추첨 응답 tier 로 결정 | (이미 받은 draw 응답) | `D/phases/result/PrizeCard.tsx:65-183`, `content.ts:34-66` |
| 7b | 경품 받으러 가기 → 문자 안내 | CTA `claim`(`PrizeCard.tsx:183`) → `notifyWin()`(낙관적 전환) → `EndScreen`(`data-px="end"`: 문자 안내·`end-code`·커피는 `coupon-open` 버튼, 문자 실패 시 `sms-failed/sms-retry`, 문자 미도착 `no-sms` 링크, `next`=[다음 참가자]) | 카드에서 탭 | `POST /api/posco/notify-win`; EndScreen 이 `GET /api/posco/session` 을 다시 불러 `claimToken` 으로 링크 구성 | `Result.tsx:250-260`, `phases/result/EndScreen.tsx:45-135`. **재조회 응답에 claimToken 이 없으면 링크 버튼이 안 그려진다** |
| 8 | **개인 링크 쿠폰** | `/posco-ox/claim/{token}`(`ClaimView`). **쿠폰(기프티콘)은 steel=커피 전용.** 미수령 `data-px="unclaimed"` → prize-image·`CouponBlock`(기프티콘 이미지·쿠폰번호 복사·이미지 저장·유효기간)·`claim-code`·`claim-place`; 수령 후 `claimed` | 문자 링크 또는 EndScreen 링크. token ≥16자 | `GET /api/posco/claim/{t}` + 동시에 `POST /api/posco/claim/{t}/coupon`(**쓰기**; 마운트 시 1회, 만료 60초 전 재발급) | `src/app/posco-ox/claim/[token]/ClaimView.tsx:67-246,248-364`, `CouponBlock.tsx:8-14`, `content.ts:540-617` |
| 9 | 스탭 PIN 수령 확인 | `StaffConfirm`(스탭 확인 토글 → PIN 6자리 → **1초 길게 눌러 수령 확인**, `HOLD_MS=1000` `StaffConfirm.tsx:17`) → 성공 시 전체화면 `ClaimPopup`("경품 수령이 확인되었습니다"). **gold·blue(실물) 와 쿠폰 못 받은 커피(폴백)에서만 나온다**(`ClaimView.tsx:242-243 showStaff`, 렌더 `:383`). 커피+쿠폰 정상 경로엔 PIN 단계 없음(쿠폰 배정 = 수령) | tier≠steel 또는 쿠폰 miss | `POST /api/posco/claim/{t}/confirm {pin}` | `claim/[token]/StaffConfirm.tsx`, `ClaimPopup.tsx`, `api/posco/claim/[token]/confirm/route.ts:13` |
| 10 | 데스크톱 실시간 운영 현황판 | `/posco-ox/ops` — **운영 PIN 게이트**(`OpsGate`: `data-px="ops-gate"`/`ops-pin`/`ops-login`) → `OpsBoard`(`data-px="ops-board"`): DAY 배지, 참여·완주(오늘/누적), 수령/미수령, 설문 요약, 문자 사용량 `sms-usage`+최근 오류, 쿠폰 재고 `coupon-stock-*`. **"실시간" = 30초 폴링**(WebSocket/Realtime 아님, `OpsBoard.tsx:35,55`). 레이아웃은 max-w 560(md 760) 중앙 정렬 **모바일 우선 카드 UI**라 1440 에선 좁은 가운데 칼럼(`ops/layout.tsx:21`) | 쿠키 `posco_ops`(JWT, 12시간) | `GET /api/posco/ops/stats` (SSR 초기값은 DB 직접) | `src/app/posco-ox/ops/page.tsx`, `OpsBoard.tsx`, `OpsGate.tsx` |
| 11 | 일자별 경품 배분 | **별도 화면 없음.** 현황판 안의 **재고 그리드(티어 3 × 일차 3)** `data-px="stock-{gold\|blue\|steel}-{main\|extra}-d{1\|2\|3}"`, 당일 마감 배지 `stock-badge-soldout`/`stock-badge-extra`(`OpsBoard.tsx:125-195`). 일차별 당첨 목록은 `/posco-ox/ops/winners`(일차·티어·수령 필터 카드 목록) | 위와 같음 | `GET /api/posco/ops/stats`, `GET /api/posco/ops/winners?day=&tier=&claimed=&q=` | `ops/winners/WinnersView.tsx:47`, `src/lib/posco/ops-cms.ts:46-60` |
| 보너스 | 설문 집계 `/posco-ox/ops/survey`(주관식 **원문 목록** = 실제 참여자 글), 쿠폰 배치 `/posco-ox/ops/coupons`(재고·업로드 마법사·회수 목록) | | `GET /api/posco/ops/survey`·`/ops/coupons` | `SurveyView.tsx:25`, `CouponsView.tsx:23` |
| 보너스 | 차단 안내 3종(시작 전/소진/종료) | `Blocked`(`data-px="blocked"`) | `event.state≠open` | `GET /session` | `D/phases/Blocked.tsx:70-123`, `content.ts:518-538` |

## 4. 테스트·관리자 계정·스탭 PIN — 어디에 정의돼 있나 (값은 기록 안 함)
- **참여자 계정 개념 없음**(전화 OTP 만). 로그인이 필요한 건 운영 현황판(운영 PIN)과 claim 스탭 확인(스탭 PIN) 둘뿐. 이번 촬영은 **PIN 을 쓰지 않는 방식**(쿠키 직접 발급 + 가로채기)이 가능하므로 실제 PIN 값 불필요.
- 운영 PIN: env `POSCO_OPS_PIN_HASH` = HMAC-SHA256(`POSCO_SESSION_SECRET`, PIN) (`src/lib/posco/ops.ts:89-100`, `RUNBOOK.md:20,30-45`). 평문은 레포 밖 `~/.posco-secure/`(`pins-20260914.txt`, 600) — **열지 않음**.
- 스탭 PIN: env `POSCO_STAFF_PIN_HASH`(`staff.ts:14-20`). 하네스용 평문은 로컬 `.env.local` 에만 `POSCO_TEST_STAFF_PIN`/`POSCO_TEST_OPS_PIN`(`RUNBOOK.md:237`, `docs/posco/step43-report.md:64-66`). 프로덕션엔 TEST 키 없음.
- 레포 내 PIN 값 0건(`PROGRESS.md:3-9` 배너, STEP 54 grep). **단 실쿠폰 핀번호 1개(assigned)가 추적 파일 2곳에 예시로 커밋돼 있다**(`PROGRESS.md:9` 별건, `docs/posco/event-final-report.md` §8) → 레포 안 기존 캡처(`docs/posco/step42-shots/claim-steel-*.png`, `step43-shots/*`, `step45-shots/*`)는 실쿠폰·운영 데이터일 수 있으니 **재료로 쓰지 말 것**.

## 5. 쓰기 위험·가로챌 요청 목록과 가짜 응답

### 5-1. GET 만으로 서버 쓰기가 일어나는 곳
- **없음.** 검사: `api/posco/**` 의 GET 핸들러(`session`, `claim/[token]`, `ops/stats`, `ops/winners`, `ops/survey`, `ops/coupons`, `ops/export/[kind]`)에 insert/update/upsert/delete/rpc 없음.
- 단 **페이지 로드가 쓰기를 부른다**: `/posco-ox/claim/{token}` 은 마운트 때 `POST …/coupon` 으로 **실제 쿠폰을 배정**한다(`ClaimView.tsx:136`; 첫 호출이 배정, 주석 `claim/[token]/coupon/route.ts:6-18`). 운영 토큰으로 열면 안 된다.
- `ops/export/[kind]` GET 은 쓰기는 없으나 **쿠폰 핀·확인코드가 든 xlsx** 를 내려준다 → 호출 금지.

### 5-2. 문자 발송·추첨 API
- 문자: `POST /api/posco/otp/send`(`otp/send/route.ts:22`; 행사 중 `POSCO_SMS_LIVE=true` 실발송 `RUNBOOK.md:22`), `POST /api/posco/notify-win`(`notify-win/route.ts:16`).
- 추첨: `POST /api/posco/draw` → `db.rpc("draw_prize",…)` 가 **서버에서 당첨 결정·재고 차감**(`draw/route.ts:46-48`, 멱등; 소진 시 409 `sold_out`). 클라는 tier·claimCode 만 받는다(`:60`).

### 5-3. `page.route` 로 가로챌 목록 (전부. 미등록 `/api/posco/**` 는 abort)
응답 형식: 성공 `{ok:true,…}` / 실패 `{ok:false,error,code}` (`src/lib/posco/errors.ts:6-23`).

참여 흐름(`/posco-ox`):
| 요청 | 가짜 성공 응답 | 근거 |
|---|---|---|
| `GET /api/posco/session` | **호출 순서별 상태 저장**: 부팅 시 `{ok:true,authed:false,hasSurvey:false,hasAward:false,event:{state:"open",dayNo:2}}` (dayNo 1·2·3 임의, claim 수령 안내 시간 표기용), EndScreen 재조회 시 `{ok:true,authed:true,hasSurvey:true,hasAward:true,claimToken:"<16자 이상 가짜 hex>",name:"김○○",winNotified:true,event:{state:"open",dayNo:2}}` | `session/route.ts:34-44`, `D/data/live.ts:148-170` |
| `POST /api/posco/otp/send` | `{ok:true,ttlSec:180}` | `otp/send/route.ts:117`, `live.ts:56-62` |
| `POST /api/posco/otp/verify` | `{ok:true,verified:true,joined:false}` (이미 당첨자 화면은 `joined:true`; 오답 화면은 `400 {ok:false,code:"mismatch",error:"…(4회 남음)"}`) | `otp/verify/route.ts:95,43`, `live.ts:79-91` |
| `POST /api/posco/quiz/answer` | `{ok:true,correct:true}` (응답은 안 읽음) | `quiz/answer/route.ts:40` |
| `POST /api/posco/survey/submit` | `{ok:true,saved:true}` | `survey/submit/route.ts:62` |
| `POST /api/posco/draw` | `{ok:true,tier:"gold"\|"blue"\|"steel",claimCode:"KXM-4821"}` (형식 "영문3-숫자4", 0·O·1·I 제외; 가짜 값) | `draw/route.ts:60`, `live.ts:118-125` |
| `POST /api/posco/notify-win` | `{ok:true,status:"ok"}` | `notify-win/route.ts:48`, `live.ts:127-139` |
| `POST /api/posco/session/end` | `{ok:true,ended:true}` | `session/end/route.ts:24` |

claim(`/posco-ox/claim/{가짜 토큰}`):
| 요청 | 가짜 성공 응답 | 근거 |
|---|---|---|
| `GET /api/posco/claim/{t}` | `{ok:true,tier:"blue",dayNo:2,claimCode:"KXM-4821",claimed:false,claimedAt:null}` | `claim/[token]/route.ts:20-26`, `ClaimView.tsx:91-112` |
| `POST /api/posco/claim/{t}/coupon` | steel: `{ok:true,coupon:{code:"1234-5678-9012-3456"(가짜),imageUrl:"data:image/…"(가짜 이미지),expiresAt:"2026-11-09",prizeLabel:"아메리카노 커피",urlTtlSec:900}}` / 실물 티어: `{ok:true,coupon:null,miss:"not_configured"}` | `CouponBlock.tsx:8-14`, `src/lib/posco/coupons.ts:67`, `ClaimView.tsx:136-160`. **실쿠폰 이미지·핀 금지**(보관소 `~/.posco-secure/coupons/` 에 실제 600장). 가짜 이미지: 데모 인라인 SVG `D/claim/mock-coupon.ts` 또는 `scripts/posco-testkit.mjs:107` 더미 PNG 생성 로직(600×1164 비율, `CouponBlock.tsx:18-19`) |
| `POST /api/posco/claim/{t}/confirm` | `{ok:true,claimed:true,tier:"blue",claimCode:"KXM-4821",claimedAt:"<ISO>"}`; 오입력 `403 {ok:false,code:"bad_pin",remaining:4}`, 잠금 `429 {ok:false,code:"locked",retryAfterSec:600}` | `confirm/route.ts:100,70,57`, `ClaimView.tsx:171-196` |

운영(`/posco-ox/ops*`, 쿠키 `posco_ops` 선발급):
| 요청 | 가짜 응답 | 근거 |
|---|---|---|
| `GET /api/posco/ops/stats` | `{ok:true,snapshot:<OpsSnapshot>}` — 타입 `src/lib/posco/ops-stats.ts:14-77`(day·participants·completed·claim·survey·inventory 9행·coupons·sms·recentErrors). `recentErrors` 는 `[]`(원문 error 에 번호가 섞일 수 있음) | `ops/stats/route.ts:15-16` |
| `GET /api/posco/ops/winners?…` | `{ok:true,rows:WinnerRow[],total:n}` — `WinnerRow` `ops-cms.ts:46-60` | `ops/winners/route.ts:31` |
| `GET /api/posco/ops/survey` | `{ok:true,survey:<snapshot.survey>,comments:[{seq,createdAt,text}]}` — **주관식은 실제 참여자 글이라 반드시 가짜 문구로 교체** | `ops/survey/route.ts:22`, `ops-cms.ts:274` |
| `GET /api/posco/ops/coupons?returns=1` | `{ok:true,batches:BatchRow[],totals:{available,assigned},returnCount?}` | `ops/coupons/route.ts:26`, `ops-cms.ts:335-354` |
| `POST /api/posco/ops/winners/{code}/coupon`·`…/replace`, `ops/coupons/status|commit|upload-urls|parse`, `ops/login` | **절대 호출 금지(abort)**: 쓰기·쿠폰 이미지/핀 열람. 당첨자 상세 패널(`WinnerDetail`)은 열지 않는다 | `WinnerDetail.tsx:73,114` |
- 운영 쓰기 API 는 `x-posco-ops: 1` 헤더 필수(`ops.ts` `OPS_WRITE_HEADER`).
- 가로챈 수는 shot json 의 `intercepted` 필드에 기록(명세 안전 항목).

## 6. 가림 대상
| 항목 | 어디에 보이나 | 처리 |
|---|---|---|
| 이름 | PhoneStep 이름 입력칸(촬영 시 직접 입력하는 값), 재진입 `name` 응답 | '김○○' 입력. DOM 검사 대상 |
| 전화번호 | PhoneStep `phone-input`, CodeStep "010-… 로 보냈어요"(`content.ts:119`) | '010-****-****' 로 치환(입력값·텍스트 둘 다). 가짜 번호만 입력 |
| 확인코드 `AAA-0000` | PrizeCard `code`, EndScreen `end-code`, claim `claim-code`(42px 대형), 당첨자 목록 | 가짜 코드 주입(실코드 아님) → shots.md 에 '가짜 값' |
| 쿠폰 번호·바코드·이미지 | claim `CouponBlock` | 가짜 이미지·번호 주입. 실제 값 금지 |
| 개인 링크 토큰 | claim URL·EndScreen 링크 `href`, `getStatus.claimToken` | 글자로는 안 나오나 URL 은 가짜 토큰만 |
| QR 코드 | **참여·claim·ops 화면 안에 QR 렌더 없음**(QR 은 현장 포스터로 진입). 코드상 확인 못 함 → 촬영 시 DOM 검사로 재확인 | 해당 없음(재확인) |
| 머리·꼬리 연락처 | 참여/claim/ops 화면에 **머리·꼬리 대표번호·이메일·주소·SNS 없음**(헤더 `PxHeader` 는 POSCO 로고+진행). 화면 속 도메인 글자 없음(OG/metadata 만) | DOM 정규식 검사만 |
| 주관식 소감(실참여자 글) | ops survey `comments` | 가짜 문구 주입 |
| 문자 오류 원문 | ops 보드 `recentErrors[].error` | `[]` |
- 현황판 스냅샷엔 이름·전화·claim_token **없음**(`ops-stats.ts:10`, `WinnersView.tsx:12-14`). 집계 숫자(961·960 등)는 실제 값 → §11 결정 A.

## 7. 사실 근거 (자막용)
기본 근거 문서: `docs/posco/event-final-report.md`(STEP 54, 스냅샷 2026-09-19 12:31 KST, DB 쓰기 0 보고서). 아래 `R:` = 이 파일.

| 사실 | 값 | 근거 파일:줄 |
|---|---|---|
| 참여 | **961** (1일차 380·2일차 380·3일차 201) | `R:114`, 요약 `R:408`; `PROGRESS.md:5` |
| 완주(설문) | 961 (100.0%) | `R:115` |
| 경품(당첨) | **960**, 재고 **960/960 전량 소진** (gold 180·blue 180·steel 600) | `R:117-120,124-139,408`. 참여 961−당첨 960=1은 소진 직후 409 1건(`R:122,50,70-80`) |
| 경품 실수령 | 922/960 (96.0%): 실물 340/360, 커피 쿠폰 582/600 | `R:168-174`. **"경품 960"은 당첨·소진 수치이지 수령 수치가 아니다.** 자막은 "경품 960개 소진"이 안전 |
| 문자 | **1,950건**(OTP 1,005 + 당첨안내 945), **실패 0·드라이런 0·한도차단 0**, 추정 37,395원 | `R:196-204`, 요약 `R:409`; `PROGRESS.md:5` |
| 사고 0 | **"사고 0" 문구 자체는 어디에도 없음 → 미확인(문구).** 뒷받침 사실: 정합 8종 결함성 이탈 0 · SMS 실패·한도차단 0 · 쿠폰 교체·파기 0 · PIN 잠금 0 | `R:409-410`, `R:47-52` |
| (주의) 추첨 409 | 행사 통틀어 **1건**(마지막 1장 소진 2.7초 뒤 설문 완료한 참여자; 로그가 아닌 시각 추론) | `R:50,70-80,359`, `PROGRESS.md:13` → "사고 0" 자막은 사용자 판단 필요 |
| 행사 기간·장소 | 2026-09-16~18(3일), 벡스코, 기후산업국제박람회 포스코그룹관 | `R:3,17`; `RUNBOOK.md:4`; `content.ts:12` |
| 전시 존 수 | **5개** | `src/lib/posco/zones.ts:15-21`, `content.ts:272-296` |
| 퀴즈 | **5문항**, 문항당 제한 20초 | `content.ts:227-237`, `src/lib/posco/quiz.ts:9-11` |
| 설문 | 5문항(주관식 필수), 응답 961, 만족도 평균 4.79·K-GX 이해 4.78 | `content.ts:320-377`, `R:211-245`, `PROGRESS.md:13` 요약 |
| 경품 구성·일일 상한 | 양우산 180·탁상 미니선풍기 180·아메리카노 커피 쿠폰 600 / 일 상한 380·380·200 | `R:117-120`, `content.ts:34-66`, `PROGRESS.md:66` |
| 소진 시각 | 1일차 14:41:26 · 2일차 15:08:29 · 3일차 13:01:13 | `PROGRESS.md:3777,22,13` |
| 퀴즈 시도 총 | 5,023회 | `R:116` |
- 원본 증거: `docs/posco/day3-evidence/audit-day3.json`·`audit-day3-supplement.json`(집계 결과 JSON), `docs/posco/day2-evidence/audit-day2.json`, `docs/posco/day1-evidence/audit-pre-transition.json`, 일일 보고 `docs/posco/day1-report.md`·`day2-report.md`. 집계 스크립트 `scripts/posco-day-audit.mjs`(실행 안 함).
- 위 표는 사실 5개 이상 충족. 보고서 기준 시각 2026-09-19 → 자막에 스냅샷 시각 병기 권장(쿠폰 배치가 아직 active 라 미개봉 18건이 이후 열리면 582→최대 600 변동 가능, `PROGRESS.md:7`).

## 8. 브랜드
| 항목 | 값 | 근거 |
|---|---|---|
| 포스코 블루(CI 단일 스왑 포인트, 주석상 "코퍼레이트 블루 근사치") | **#005eb8** `--px-posco-blue` | `D/posco.css:22` |
| 액센트 블루 | `--px-blue` #0072ce(`:23`; 라이트 월드 #0077c8 `:1025`), `--px-lit` #3aa0f0(`:24`; 라이트 #005e9e `:1026`) | `posco.css` |
| 무대(다크 네이비) | `--px-abyss` #001233, `--px-navy` #001d42, `--px-steel` #0d2c52, cyan #00a6d8 | `posco.css:14-18` |
| 의미색·티어 | O #00c471(`:26`), X #ff5a5f, gold #f5c451(`:29`), silver #cdd9ea | `posco.css:25-33` |
| 라이트 월드 | 배경 ice #eaf5f8, ink #102338 | `posco.css:1019-1040` |
| CTA 그라디언트 | `#0c78c2 → var(--px-blue)`(`:252`), 결과 카드 `#0a6fd0 → #005eb8`(`:1208`) | `posco.css` |
| 폰트 | 본문 **Pretendard Variable**(`posco.css:45`), 디스플레이 **Paperlogy Dyn 800**(`.px-display` `:81-85`), 숫자·코드 Geist Mono(`:89`) | 서브셋 woff2 `public/fonts/paperlogy-dyn/*`, 선언 `src/components/event/event-fonts.css` |
| 로고 원본 | `public/posco/posco-logo.svg`(공식 POSCO SVG 1024×277, 원본색 #00588a; `D/ui/PxHeader.tsx:42-46`, `posco.css:94`) | 헤더에 월드별 색을 입혀 사용 |
| 히어로 | `public/posco/img/hero-globe.webp`(1535×1024) | `D/images.ts:15-16` |
| 존 썸네일/헤더 | `public/posco/img/zone-{kgx,carbon,steel,hyrex,synergy}.webp`, `zone-*-header.webp`(3:1 1170×390; synergy 는 `-v2`) | `D/images.ts:22-52`, `public/posco/img/README.md` |
| 평면도 | `public/posco/img/floorplan.webp`(1370×1649) | `D/images.ts:77` |
| 경품 컷(투명 누끼) | `prize-umbrella-v2.webp`·`prize-fan-v2.webp`·`prize-coffee-v2.webp` | `D/images.ts:62-64` |
| 공유 OG | `src/app/posco-ox/opengraph-image.png`·`twitter-image.png` | 파일 컨벤션 |
- 로고·경품 이미지는 고객(포스코) 자산·상표 → media/ 복사는 명세 허용 범위이나 shots.md 에 3자 상표임을 기록.

## 9. 다른 세션 점유 (2026-11-05 22:49Z 확인만)
- `git worktree list`(maimai-posco): **`/home/dev/maimai-posco` 하나뿐**. 이 폴더에 `.claude/worktrees` 없음. 형제 `maimai-event-builder` 에는 `.claude/worktrees/agent-*` 8개(locked)가 있으나 별개 폴더.
- 이 레포의 dev/start 서버: **없음**(`ss -ltnp` 에 cwd 가 maimai-posco 인 프로세스 0). 점유 중인 남의 포트(건드리지 말 것): 3311·3312(safefile), 3475·3491·3493(Medimajor worktrees), 38791(gochingphone), 54321~54324·55421~55424·55931·55932·5432(DB류), 8443, 8781·8782 등.
- **빈 포트 후보**: 3207, 3208, 3721, 3722 (3200 도 비었으나 과거 posco 로컬 prod 포트라 헷갈리기 쉬움). 사용 직전 재확인.
- 자원: nproc 8, 가용 메모리 약 18GB, 디스크 여유 73GB(82%).
- 브라우저: Playwright 크로미움 `~/.cache/ms-playwright/chromium-12xx`, `~/.cache/chrome-for-testing/154.0.8037.57`(AppArmor 허용 경로). `chromiumSandbox:true` 명시.
- **임시 clone 권고**: `git worktree add` 는 원본 `.git/worktrees` 메타데이터를 건드린다. 원본을 바꾸지 않으려면 `git clone --local /home/dev/maimai-posco <임시 경로>`(원본은 읽기만)가 더 안전. 임시 clone 에서 `npm ci`(큼, nice 10) → `npm run build` → `npx next start -p <빈 포트>`(dev 서버는 개발 배지·HMR 오염이라 쓰지 않음). 끝나면 서버 PID·임시 경로 삭제.

## 10. 명세와 코드가 다른 점 (요약)
1. **랜딩과 문자 인증이 별개 화면이 아니다.** 히어로+이름+번호+동의+CTA 한 화면(`PhoneStep`). `LANDING.cta`("지금 도전하기")·경품/참여방법 소개는 렌더되지 않는다. 입력칸이 번호 외에 **이름**도 있다.
2. **명세에 없는 화면**: 미션 완료(Mission), 평면도 확대 뷰어, 차단 안내 3종, 이미 당첨자 `JoinedStep`, [다음 참가자] 확인 시트, 문자 실패 안내.
3. **추첨 연출은 등급별이 아니라 통일 1종**(등수·금액 비노출). 스캔 1300ms+블룸 500ms+플래시 120ms+카드 spring. 추첨 API 는 연출 시작 전에 이미 호출되고, 연출은 사용자의 [당첨 결과 확인] 탭으로 시작(자동 아님).
4. **개인 링크 쿠폰과 스탭 PIN 은 같은 참여자에게 둘 다 나오지 않는다**: 쿠폰=steel(커피)만, PIN=gold/blue(실물)와 쿠폰 폴백만. 두 화면을 찍으려면 tier 를 달리한 두 흐름이 필요.
5. **쿠폰은 문자(또는 EndScreen 보조 링크)로만 전달**되고, 링크를 여는 것이 곧 쿠폰 배정(쓰기)이다.
6. **"실시간 운영 현황판"은 30초 폴링**, **"일자별 경품 배분"은 독립 화면이 아니라 현황판 재고 그리드(티어×일차)**. 운영 레이아웃은 데스크톱 전용이 아니라 모바일 우선 카드(최대 폭 760)라 1440 뷰포트에서 가운데 좁은 칼럼.
7. **현황판 첫 렌더는 서버 SSR(DB 직접)**이라 요청 가로채기만으로는 안 채워진다 → 쿠키 직접 발급 + 30초 폴링 발화 + stats 가로채기(§1-4).
8. **운영 라이브는 종료 화면뿐**: 참여 흐름을 라이브로 찍을 수 없다.
9. **"사고 0" 은 문서에 그 문구가 없다**(§7). "경품 960"은 당첨/재고 소진 수치이고 수령은 922. 문자 1,950(실패 0)과 참여 961 은 보고서와 정확히 일치.
10. 퀴즈는 **5문항**(옛 시안 문서의 4문제와 다름).
11. 데모 라우트(`/demo/posco-ox`)가 이미 있어 "가짜 데이터 모드"는 존재하나 실서비스와 픽셀이 다르다(시안 문구·인증번호 토스트·3탭 등급 강제시트·발송 시뮬 토스트). 촬영은 live 어댑터 + 가로채기 권장.

## 11. 촬영 때 주의·결정 필요
- **결정 필요 A**: 현황판 수치를 실제 집계(961·960 등, PII 아님)로 보일지, 가림 규칙("정산 합계 같은 고객사 영업 수치는 가짜 값")대로 가짜 값으로 바꿀지. 추천: 자막 숫자와 화면이 모순되지 않게 §7 의 실제 집계값을 쓰고 shots.md 에 "집계값 = 보고서 인용, 개인정보 0" 명기(참여·당첨·재고는 행사 결과 수치이고 금액은 현황판에 없음).
- 확인코드는 가짜 주입이어도 실제 발급 규칙(혼동글자 제외 영문 3자+숫자 4)을 따를 것.
- 쿠폰 이미지: 실쿠폰 금지. 더미 PNG 필요.
- 추첨 연출 seq: `page.clock.install` 후 [당첨 결과 확인] 클릭 → `runFor(1000/60)` 반복. setTimeout·framer(rAF)·CSS 애니메이션(`getAnimations`) 3종이 섞여 CSS 쪽은 currentTime 동기가 필요. 영상 길이 약 2.5~3초(스캔 1.3+블룸 .5+카드 spring).
- 퀴즈 타이머 20초는 Date 기반 → `page.clock` 으로 멈춰 두면 만료되지 않는다.
- 모바일 390×844 `isMobile`. 앱 본문 폭은 `max-w-[430px]` 중앙(`PoscoOxDemo.tsx:154`) → 1440 데스크톱에서 참여 화면은 가운데 좁은 칼럼. 조닝 CTA `ZoningDock` 은 `position:fixed`(`PoscoOxDemo.tsx:213-230`)라 full-page 캡처에서 하단 고정 위치 확인 필요.
- 선택자: `main[data-px-ready]`, `[data-px="name-input|phone-input|consent|send|zoning-start|judge|verdict-cta|mission-next|q5-text|q5-submit|draw-confirm|scan-stage|prize-card|code|claim|end|coupon-open|next|ops-board|ops-gate|ops-pin"]`.
