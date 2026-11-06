# sy-motors(SY모터스 카카오톡 접수 챗봇) 촬영 전 사전 조사 — RECON

조사 시각 2026-11-06 07:3x~07:4xZ · 읽기 전용(코드 읽기 + 공개 쇼핑몰 홈 GET 1회) · 서버·빌드·npm·docker 실행 0 · 비밀값 읽기·기록 0 · **스킬 서버(운영) 요청 0(curl 포함)**.
레포 = `/home/dev/kakaoauto` (HEAD `8788360` 2026-09-28 12:51Z, 브랜치 `main` = origin/main, 커밋 71개, 작업 트리 clean). 표기는 「SY모터스」(코드·문서는 「에스와이모터스」, 아래 10번). 스킬 서버 URL 은 이 문서에 적지 않는다(브리프 §9). 레포 안 경로·줄은 모두 `~/kakaoauto/` 기준.

## 0. 먼저 알아야 할 것 (촬영 방식을 바꾸는 사실 6개)

1. **실단말 카카오톡 캡처가 서버 어디에도 없다.** 레포(이미지·영상 파일 0개) · `~/qa-archive`(byclick 전용, `kakaoauto`·`SY-` 문자열 0건) · `~/Downloads`(빈 폴더) · `~/hongjun-journey`(`docs/CONTENT/assets/shots-log.json:53` 이 sy-motors-bot 을 「카카오톡 채널 안의 챗봇이라 공개 웹 화면이 없다」로 제외 기록) · `~/prism-media` 를 뒤졌다. 파일명 키워드(kakao·카카오·알림톡·sy-·symotors)로 `~` 6단계 깊이까지 찾은 이미지 20여 장은 전부 다른 프로젝트 것(Okjob 알림톡 등). 서버 전체 `find /` 는 시간 초과(미완) — 그래도 위 경로 밖에 있을 근거는 없다. 09-28 실기기 테스트(`PROGRESS.md:46`)는 사용자가 폰으로 보고 판정만 기록했고 캡처 파일은 남지 않았다. → **기존 캡처 사용 불가, 응답 JSON 3흐름이 주 재료.**
2. **레포가 곧 "봇 엔진"이고, 로컬 실행은 가짜 DB 없이는 한 턴도 이어지지 않는다.** 세션이 Supabase `chat_sessions` 에만 저장된다(`src/lib/state/session.ts:15,37,51`). DB 가 없으면 `loadSession`/`saveSession` 이 에러를 삼키고(throw 없음) 매 턴 첫 화면으로 돌아간다(= 09-xx 「DB 정지」 증상). 별도 개발·스테이징 DB 도 없다(sim 전부가 `.env.local` 로 운영 DB 를 직접 읽고 지운다: `scripts/sim-4a.ts:14-31,54-57`).
3. **`~/kakaoauto` 에서 `npm run dev`·`sim:*`·`test:*-live`·`db:verify`·`setup:storage` 를 돌리면 운영 DB 에 쓰고, 최악엔 대표 폰으로 실발송된다.** 근거: `.env.local`(600, 변수 목록은 `.env.example`)이 운영 Supabase·Solapi·카카오 키를 가진다. 전례 = 2026-09-28 `npm start`(NODE_ENV=production) 대상 `sim:all` 로 **실발송 31건**(카카오 메모 28 + 솔라피 알림톡 3, `PROGRESS.md:11`). → worktree(`.env.local`·`node_modules` 안 따라옴)에서 **SUPABASE_URL 을 로컬 가짜 서버로** 돌려야 안전.
4. **지시의 「문자」는 코드에 없다.** 접수 알림은 알림톡(사고만)·카카오 「나에게 보내기」 메모(그 외 6종)뿐이고, 문자(SMS)는 keep-alive 워크플로 실패 시 운영자에게만 간다(`src/app/api/cron/alert-sms/route.ts:37`). 알림톡도 **가게 대표 폰으로 가는 것**이지 고객 카톡에 오는 게 아니다 — 고객 대화창에 알림톡 말풍선은 없다. 템플릿 본문은 레포에 없다(솔라피 콘솔 승인본, 변수 6개만 `alimtalk.ts:47-54`) → 「알림톡 화면」은 템플릿 변수 JSON(드라이런 로그) 외엔 재료가 없다.
5. **라이브(prod)와 로컬 응답이 다른 부분(env 때문)**: ① 웰컴 맨 위 4줄 `PILOT_NOTICE`(prod Vercel env, 원문 레포에 없음 — `PROGRESS.md:84-85` 는 「시범운영·24시간 접수·순차 안내·급하면 사고/긴급」 요지만) ② 장애 문의 완료 카드의 「자가 점검 영상 보기」 버튼(prod `YOUTUBE_CHANNEL_URL` 설정, `PROGRESS.md:95-99`; 로컬은 env 안 주면 버튼 없음) ③ 사진 첨부 `📷 사진 첨부하기` 블록 버튼(`KAKAO_SECUREIMAGE_BLOCK_ID`, prod 설정 여부 미확인 — `docs/HANDOVER.md:49,63` 는 선택·미설정 시 숨김) ④ 사고/긴급 완료 요약의 「🚨 긴급 건이라 담당자에게 알림이 바로 전달돼요」 줄(`engine.ts:128` — 알림톡 env 5개가 전부 있어야 켜짐). 어느 값을 흉내 낼지는 메인 세션 결정(blockId·URL·번호는 가림 대상이라 가짜 값을 쓴다).
6. **응답 JSON 은 개인정보 검사에 걸리는 값을 일부러 넣어야 나온다.** 전화 검사가 `01[016789]\d{7,8}` 라(`flows.ts:162`) `010-****-****` 는 통과하지 못한다 → 입력은 가짜 유효 번호(예 `010-0000-0000`)로 하고 저장 JSON 에서 마스킹 후 `pii_scan` 을 남기는 순서가 필요. 차량번호도 같다(`flows.ts:97`, 단 2회차부터 아무 값이나 통과 `:131`).

## 1. 스택·실행

| 항목 | 값 · 근거 |
|---|---|
| 프레임워크 | Next.js 16.2.9 App Router(Route Handlers 만, 화면 페이지 없음 — `src/app/page.tsx` 는 안내 문구) · React 19.2.4 · TS · `@supabase/supabase-js` 2.108.2 · `@anthropic-ai/sdk` 0.106 · `solapi` 6.x · `package.json`, `package-lock.json:5215,1800` |
| node | 서버 v22.23.1. `engines`·`.nvmrc` 없음 |
| node_modules | **없음**(`~/kakaoauto/node_modules` 부재). 로컬 실행 = worktree 에서 `npm ci` 필요(이 단계에선 안 함) |
| 명령 | `npm run dev` · `npm run build`(`next build`) · `npm start`. 코드 룰: `AGENTS.md` 「Next.js 가 다르니 `node_modules/next/dist/docs/` 를 읽고 쓸 것」. `CLAUDE.md` 는 낡았다(「skeleton only」 — 10번) |
| env 이름(필수) | `SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY`(`src/lib/supabase/admin.ts:12-13`, `server-only` import 로 클라이언트 번들 차단) |
| env 이름(기능별) | `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL`(`ai/claude.ts:13,31`) · `KAKAO_REST_API_KEY`/`KAKAO_REDIRECT_URI`(OAuth) · `SOLAPI_API_KEY`·`SOLAPI_API_SECRET`·`SOLAPI_PF_ID`·`SOLAPI_ACCIDENT_TEMPLATE_ID`·`ACCIDENT_ALERT_PHONES`(5개 전부 있어야 알림톡 켜짐 `alimtalk.ts:18-25`) · `OWNER_MEMO_BACKUP`(off 로 메모 끔) · `PILOT_NOTICE` · `KAKAO_SECUREIMAGE_BLOCK_ID` · `KAKAO_HANDOFF_BLOCK_ID`(코드 미사용, 롤백용 `responses.ts` 주석) · `YOUTUBE_CHANNEL_URL` · `FAQ_ENABLED`(`on` 일 때만 FAQ 즉답 `faq.ts:57`, prod 는 09-28 on) · `CRON_SECRET`·`SOLAPI_SMS_FROM`·`OPS_ALERT_PHONES`(크론) · `NOTIFY_DRY_RUN`·`FORCE_SEND`(발송 가드 `notify/guard.ts:14-18`) |
| 실발송 가드 | `isDryRun()` = `FORCE_SEND` 아니고 (`NOTIFY_DRY_RUN=true` 또는 `NODE_ENV!==production`) → 카카오 메모(`kakao/message.ts:27`)·솔라피 알림톡(`notify/alimtalk.ts:101`)이 호출 대신 로그(`[DRY-RUN] would send: …`)만 남긴다. `next dev` 는 항상 드라이런, `next start` 는 `NOTIFY_DRY_RUN=true` 필수. `GET /api/health` 가 `notifyDryRun` 을 알려 준다(`api/health/route.ts:7-13`) |
| DB | Supabase Postgres, 테이블 7개: `customers`·`intakes`·`intake_media`·`chat_sessions`·`owner_tokens`·`youtube_manuals`(0001) + `bot_events`(0003, 0004·0005 로 check·컬럼 추가). 전부 RLS on·정책 0(service-role 전용). 스토리지 버킷 `intake-media`(비공개, `media/store.ts:13`) |
| 로컬 Supabase | `supabase/migrations/0001~0005` 있음(SQL 만). **`supabase/config.toml`·seed 없음** → `supabase start` 하려면 `supabase init` 이 필요(레포 쓰기 → worktree 사본에서만). 운영 적용은 CLI 가 아니라 Management API 로 했다(`PROGRESS.md:25,34,49`). `~/bin/supabase` 있음, docker 있음 — 단 지금 docker 에 형제 프로젝트 컨테이너(`supabase_rest_junimal`)가 돌고 5432 도 누가 쓰는 중이라 기본 포트 스택은 부딪힐 수 있다 |
| 배포 | Vercel(프로젝트 `kakaoauto`, `.vercel/project.json`), 서울(icn1) 함수. 웜업·keep-alive 는 GitHub Actions(`.github/workflows/warmup.yml`, `supabase-keepalive.yml`) |
| 테스트 | `npm run sim:all`(12단계: repair·4a·4b·media·ai·edge·routing·accident·check-notify·complete·followup·faq, `scripts/sim-all.ts:34-45`). **전부 HTTP 로 서버를 때리고 운영 DB 를 직접 쓴다**(3번) — 순수 단위 시험 프레임워크 없음. 순수 함수만 부르는 건 `scripts/check-notify.ts`(text.ts·message.ts import). `check-notify.ts` 머리 주석: `notifyOwner` 는 `admin`(server-only)을 거쳐 tsx 단독 실행 시 throw 한다 |

## 2. 라이브 주소·상태

**조사하지 않음.** 지시(운영 스킬 주소 요청 금지·curl 포함)에 따라 스킬 서버는 GET/HEAD 도 보내지 않았다. 스킬 서버는 POST 전용 웹훅이라 브라우저로 볼 화면도 없다(`GET /` 는 안내 문구 한 페이지 `src/app/page.tsx`, `GET /api/health` 는 JSON). 상태 근거는 `PROGRESS.md` 기록(마지막 prod 검증 2026-09-28, 배포 READY)뿐 — 이후 변화는 **미확인**.
참고로 같은 업체의 공개 쇼핑몰(`src/lib/shop/info.ts` 의 `LINKS.mall`)만 HEAD/GET 1회: 200, `<title>` 「에스와이모터스 | 믿음의 차량 관리」(카페24 몰). 챗봇 재료와 무관.

## 3. 지시 항목 ↔ 실제 라우트·코드 (file:줄)

| 지시 | 실제 | 비고 |
|---|---|---|
| 스킬 라우트 | `POST /api/kakao/skill`(`src/app/api/kakao/skill/route.ts:15`) 와 `POST /api/kakao/ai`(`ai/route.ts:14`)는 **같은 `handleKakaoRequest` 를 부른다**(`kakao/handleKakao.ts:38`). 웰컴 블록→skill, 폴백 블록→ai 로 연결(`docs/GO-LIVE.md` §2). 둘 다 try/catch 로 항상 200 | 로컬 요청은 skill 하나로 충분 |
| 요청 본문 형식 | `SkillRequest`(`kakao/types.ts`): `userRequest.utterance`(발화) · `userRequest.user.id`(= botUserKey, 세션 키) · `userRequest.callbackUrl`(콜백 블록만) · `userRequest.user.properties.isFriend`·`userRequest.params.surface`(계측만 `botEvents.ts:58-59`) · `action.params`·`action.detailParams`(사진 URL, `kakao/media.ts:14-72`). 실제 쓰는 필드는 이게 전부 — 최소 본문 `{"userRequest":{"utterance":"…","user":{"id":"<키>","type":"botUserKey"}},"action":{"params":{}}}`(sim 들이 이 모양 `scripts/sim-4a.ts:30-36`). **`user.id` 가 없으면 세션 없이 웰컴만 돌려준다**(`dispatch.ts:36`) | 진짜 오픈빌더 본문(intent·bot·block 등)을 흉내 낼 이유는 없다 |
| 전역 명령 | `취소`·`처음으로`·`그만`·`메뉴` → 세션 삭제 후 웰컴(`dispatch.ts:21,39-42`) | 장면 1(웰컴)은 `메뉴` 한 번이면 나옴 |
| 웰컴 | `buildWelcome()`(`kakao/menu.ts:17-18,30`): simpleText(「안녕하세요, 에스와이모터스입니다 🚗 …」, `PILOT_NOTICE` 있으면 맨 위에 붙음 `:25-28`) + quickReplies 7개 | |
| 접수 카테고리 7종 | `CATEGORY_LABELS`(`menu.ts:7-15`): 사고/긴급·부품 구매·방문 정비·용품 시공·차량 장애 문의·쇼핑몰 문의·기타. 흐름 정의 `FLOWS`(`state/flows.ts:247-312`, 키 repair·install·parts·etc·trouble·accident·shop). 라벨 별칭 `사고 문의`→`사고/긴급`(`:315`) | |
| 방문 정비 흐름 | `flows.ts:248,230-245`: 차량(통합 질문)→차량번호→연식(차량 입력에 연식 있으면 건너뜀 `:196,118-121`)→성함→연락처→요청 내용(선택·`건너뛰기`)→사진(선택·`사진 없이 진행`)→**추가 정보 게이트**(`추가 입력`/`바로 접수`)→차대번호·색상·지역(선택)→**곧바로 접수 확정**(확인 단계 없음, `engine.ts:176`) | 접수 확정 = DB 쓰기 + 완료 카드 |
| 사고/긴급 흐름 | `flows.ts:287-300`: 차량→차량번호→연식→성함→연락처→사고 경위(필수 `:295`)→보험 처리(퀵리플 `보험 처리`/`자비(일반) 처리`/`아직 미정` `:296`)→사진→확정 | 사고만 알림톡(7번) |
| 차량 장애 문의 흐름 | `flows.ts:272-284`: 증상(필수)→차량→차량번호→연식→성함→연락처→사진→확정. 진단·조치 안내는 일절 안 함(`:270`). 완료 카드에 `YOUTUBE_CHANNEL_URL` 있으면 「자가 점검 영상 보기」 버튼 덧붙음(`engine.ts:132-134`) | |
| 재방문 인식 | `startFlow`(`state/start.ts:11-60`): `customers` 에 같은 botUserKey 가 있으면 「○○님, 안녕하세요! 😊 지난번 정보로 접수 도와드릴까요?」 + `네, 그대로`/`새로 입력`(`engine.ts:70-83`) | 4번째 장면 후보(가짜 DB 에 고객 행을 미리 넣어야 나옴) |
| 완료 요약(말풍선) | `buildDoneSummary`(`notify/text.ts:169`) → `📝 접수 내용이 저장되었어요 (접수번호 SY-XXXXXX)` · 호명 · [접수 내용] 블록 · `접수 시각`(`nowKST()` `:48`, 실행 시각) · 정정·전달 안내. 접수번호 = `'SY-'+intakes.id 앞 6자 대문자`(`intake/save.ts:103`) | 접수번호·시각은 실행 때마다 바뀜(영상 장면엔 무해, 값은 가짜 DB 가 만든 것) |
| 담당자 전달 버튼 | **`textCard` 한 장 + `operator` 버튼 「담당자에게 전달하기」**(`kakao/responses.ts:10,98,109-122`; 카드 제목 「버튼 누른 뒤 '접수했어요'라고 보내주세요」 `:13`, 본문 2단계 안내 `:22`). 완료 응답 = `doneReply`(simpleText + textCard, `responses.ts:128`; `engine.ts:135`). `operator` 탭은 스킬 서버를 안 거치고 카카오가 상담 모드로 전환한다(`PROGRESS.md:46`) | JSON 으로는 `{"action":"operator","label":"담당자에게 전달하기"}` 까지만 보임 — 탭 뒤의 「현재 상담원과 채팅 중입니다」는 카카오 앱 UI 라 재료 없음 |
| 알림톡 | 발송 코드 `notify/alimtalk.ts:85-125`(솔라피 SDK 동적 import), 변수 6개 `#{접수번호}·#{성함}·#{연락처}·#{차량정보}·#{사고경위}·#{보험여부}`(`:47-54`) | 7번 참조 |
| 사진 첨부 | 사진 스텝 `engine.ts:223-257`. `secureimage` 플러그인이 `action.params` 로 URL 을 줌(키 형태 불문 재귀 수집 `media.ts:25-57`). 받자마자 Storage 재저장(URL 10분 만료) → 「사진 N장 받았어요 📷 …」 + `다음으로`/`사진 없이 진행`(`engine.ts:234-239`) | 로컬에선 가짜 이미지 서버 URL 을 params 에 넣으면 됨(`scripts/sim-media.ts` 가 이미 그렇게 한다) |
| 접수 후 재발화 | 24시간 안에 접수가 있는 고객의 자유발화 → 「SY-… 접수는 정상 저장되어 있어요 …」 + 전달 카드 + `처음으로`(`intake/followup.ts:66-73`, 조회 1.5초 제한 `:13-14`) | |
| FAQ 즉답 | `FAQ_ENABLED=on`: 영업시간·위치(textCard+지도 버튼)·전화(phone 버튼)·예약·쇼핑몰·가격·유튜브(`faq/faq.ts`, 호출 `dispatch.ts:69-78`) | 지시엔 없음 — 보너스 장면 후보 |
| AI 자유응답 | `askShopAssistant`(`ai/claude.ts:30`, 기본 `claude-haiku-4-5`, 8초 제한, 키 없으면 고정 안내문). `callbackUrl` 이 있을 때만 호출(`handleKakao.ts:61-76`) — 라이브에선 콜백 미승인으로 사실상 미가동(`PROGRESS.md:36-39` 판정) | 세 흐름엔 AI 호출 없음. 촬영하지 않는 게 안전(유료) |

## 4. 테스트·관리자 계정

없음 — 화면이 없고 로그인 개념이 없다. 접근 제어 = 카카오가 보내는 `userRequest.user.id`(botUserKey) 뿐. 웹훅 검증 시크릿은 코드에 없다(브리프 §9: 「초기 기록상 비어 있었음, 현재 미확인」). 사장 알림 토큰은 DB `owner_tokens`(role=owner·assignee_a) — 값은 읽지 않았다. 운영 테스트 키 관례: `test-…`·`verify-…`·`sim-…` 접두어 botUserKey 를 쓰고 끝에 지운다(`PROGRESS.md` 여러 곳) — **이번 촬영은 운영에 키를 만들지 않는다.**

## 5. 쓰기 위험

| 경로 | 쓰는 것 | 로컬 가짜 서버로 바꾸는 지점 |
|---|---|---|
| 모든 턴 | `chat_sessions` upsert/delete(`session.ts:37,51`), 접수 확정 시 `customers` upsert(`save.ts:61`)·`intakes` insert(`:71`)·`intake_media` insert, `bot_events` insert + **30일 지난 행 삭제**(`botEvents.ts:65,81`) | `SUPABASE_URL`(env 이름만 바꾸면 됨, `admin.ts:12`). 코드 수정 불필요 |
| 접수 확정(`finalize` `engine.ts:98-136`) | `after()` 로 응답 뒤 `notifyOwner`: accident+알림톡 설정 → Solapi 5개 번호 각 1건(`notifyOwner.ts:49`, `alimtalk.ts:115-123`); 그 외·미설정 → 카카오 메모 API(`kapi.kakao.com`, `message.ts:32`) + 토큰 갱신(`kauth.kakao.com`, `:62`). 운영은 둘 다 **대표 폰 실발송** | env 로 차단: `next dev`(드라이런 자동) 또는 `next start` + `NOTIFY_DRY_RUN=true`. 드라이런이면 `[DRY-RUN] would send: solapi/alimtalk — to=[…] template=… vars={…}` 로그만 나옴(`alimtalk.ts:101-106`). 로컬 가짜 DB 에는 `owner_tokens` 가 비어 메모 경로는 토큰 없음 → 스킵 로그(`notifyOwner.ts:64-72`) |
| 사진 단계 | 첨부 URL 을 서버가 `fetch`(`store.ts:41`, 10초·10MB) → 스토리지 업로드(`:55`) → 알림 때 `createSignedUrl`(`:80`) | URL 을 가짜 로컬 이미지 서버로, 스토리지 엔드포인트도 가짜 서버가 받아야 함 |
| AI 자유발화(`callbackUrl` 있을 때) | Anthropic 유료 호출(`claude.ts:35-47`) + 콜백 POST(`callback.ts:7`) | 세 흐름은 안 탐. `ANTHROPIC_API_KEY` 를 비워 두면 호출 없이 고정 안내문(`claude.ts:32`) |
| GET 중 쓰는 곳 | `GET /api/kakao/oauth/callback` 이 `owner_tokens` 에 토큰 저장(`oauth/callback/route.ts:20,65`) — 열지 말 것. `GET /api/health`·`/` 는 읽기 전용 | |
| 그 밖 | 크론 `POST /api/cron/alert-sms`(Solapi **문자** 발송, `CRON_SECRET` 필요 `:37`), `POST /api/cron/refresh-owner-token` | 부르지 않음 |
| npm 스크립트 | `sim:*`(운영 DB insert·**delete** 32곳), `test:notify-live`·`test:alimtalk-live`(`FORCE_SEND=true`, 실발송), `db:verify`·`setup:storage`·`report:handoff`(읽기·쓰기 혼재) | **`~/kakaoauto` 에서 실행 금지.** `.env.local` 없는 worktree 에서도 가짜 서버 지정 없이 돌리지 않는다 |

## 6. 가림 대상

화면이 카카오톡 말풍선이라 DOM 셀렉터는 없고 **JSON 필드 값**이 대상이다.
- 사용자 입력이 에코되는 곳: 완료 요약 `simpleText.text` 안의 `{성함} 고객님`·`성함:`·`연락처:`·`차량: {차종 차량번호 연식}`·`접수번호: SY-…`(`text.ts:169-210`); 재방문 확인 문구(`engine.ts:70-83`); 접수 후 재발화(`followup.ts:67`).
- 가짜 입력 지침(메인 세션 결정): 이름 `김○○`(검증 통과: 숫자만 아니면 됨 `flows.ts:152-158`), 전화 유효 형식의 가짜 번호 → 저장 직전 `010-****-****` 로 치환, 차량번호 `12가 ****` 로 치환, 접수번호는 로컬 가짜 DB 가 만든 값이라 실제 접수번호 아님(그래도 `SY-` 형식이라 가림 여부는 브리프 §9 「실제 접수번호 금지」에 맞춰 결정).
- 레포가 직접 내보내는 업체 정보: 알림 안내 말풍선·FAQ 에 가게 **대표번호·주소·SNS/카페/쇼핑몰/유튜브 URL**(`shop/info.ts`, FAQ `textCard` 버튼 `faq.ts:94,114`) — 가림 규칙(머리·꼬리 대표번호·URL 글자)에 걸리므로 FAQ 장면은 쓰지 않거나 가린다. 사고/긴급 카드·완료 카드에는 번호·URL 없음(장애 문의의 유튜브 버튼 URL 만 예외).
- 코드·응답에 나오면 안 되는 것: blockId(`quickReplies[].blockId`, 사진 첨부 블록 버튼), 발신프로필·템플릿 ID, 알림 수신 번호 — JSON 에는 안 실리지만 서버 드라이런 로그(`to=[…] template=…`)엔 실린다 → 로그를 증거로 남길 때 가짜 env 값만 쓸 것.

## 7. 사실 후보 (자막용)

| # | 사실 | 값 | 근거 |
|---|---|---|---|
| 1 | 접수 카테고리 수 | **7종**(사고/긴급·부품 구매·방문 정비·용품 시공·차량 장애 문의·쇼핑몰 문의·기타) | `src/lib/kakao/menu.ts:7-15`, `src/lib/state/flows.ts:247-312`(7개 키) |
| 2 | 전화번호 검사 규칙 | 숫자만 남긴 뒤 `/^01[016789]\d{7,8}$/` 통과해야 함(휴대폰 010·011·016·017·018·019, 10~11자리). 통과 시 `010-1234-5678`(11자리)/`011-123-4567`(10자리) 형식으로 저장. 실패 시 「연락처 형식을 확인해 주세요. 예: 010-1234-5678」 재질문(횟수 제한 없음) | `src/lib/state/flows.ts:160-170`(정규식 `:162`) |
| 3 | 사진 최대 장수 | **5장**(세션에 누적 5장까지 보관, 한 번에 받는 URL 도 5개 상한). 장당 10MB·10초 다운로드 제한, 이미지 아닌 파일은 버림 | `src/lib/state/engine.ts:232`, `src/lib/kakao/media.ts:11,72`, `src/lib/media/store.ts:13-14,24,48-49`. 영상 첨부는 카카오 플러그인 미지원(`docs/HANDOVER.md` 「알려진 한계」) |
| 4 | 알림 분기(누구에게 어떤 조건으로) | 접수 확정 때마다(7종 전부 대상 `notify/text.ts:26-37`) 응답을 보낸 뒤 발송. **사고/긴급 + 알림톡 env 5개 설정 → 솔라피 알림톡을 `ACCIDENT_ALERT_PHONES` 각 번호로 1건씩**(문자 대체발송 끔 `disableSms:true`). **그 외 6종(또는 사고인데 알림톡 미설정) → 카카오 「나에게 보내기」 메모**: 방문 정비·용품 시공·장애 문의는 담당자(`assignee_a`) 토큰 우선, 토큰 없으면 사장(`owner`), 나머지는 사장. 6종 메모는 `OWNER_MEMO_BACKUP=off` 로 끌 수 있고(사고는 항상 발송) 본문 200자 이내. 고객에겐 알림톡·문자가 가지 않는다 — 고객이 받는 건 대화창의 완료 요약 + 「담당자에게 전달하기」 카드 | `notify/notifyOwner.ts:18-24,49-52,56-60,64-67`, `notify/alimtalk.ts:18-25,115-123,119`, `notify/text.ts:26-46,97`, `kakao/responses.ts:109-122`. 알림톡 승인 템플릿 본문은 **미확인**(레포에 없음) |
| 5 | 사고/긴급 알림 안내 문구 | 알림톡이 설정돼 있으면 완료 요약에 「🚨 긴급 건이라 담당자에게 알림이 바로 전달돼요.」 | `engine.ts:128`, `text.ts:199` |
| 6 | 세션 유지 시간 | 30분(경과 시 삭제 후 처음부터) | `state/session.ts:10,22-26` |
| 7 | 접수 후 재발화 인식 기간 | 24시간 | `intake/followup.ts:13` |
| 8 | 영업시간(FAQ·AI) | 평일 09:00–18:00 · 토 09:00–16:00(사전 예약 고객만, 당일 예약 불가) · 일·공휴일 휴무 | `shop/info.ts` `HOURS` |
| 9 | 비코드 근거(브리프 기준, 코드로 확인 못 함) | 응답 시간 콜드 1.80s→웜 0.99s, 회귀 9종, 오픈빌더 블록 5개, 약 6주 — `~/hongjun-journey/docs/CONTENT/briefs/sy-motors-bot.md` §2. **sim 단계는 현재 12개**(`scripts/sim-all.ts:34-45`)라 「9종」은 낡았다. 누적 접수 건수는 **미확인**(집계 없음) | 브리프 §2 · 자막에 쓰려면 Vercel 로그·DB 읽기 쿼리 근거가 먼저 필요 |

## 8. 브랜드

**미확인.** 레포에 SY모터스 주색·폰트·로고 근거가 없다: `src/app/page.tsx` 는 인라인 `system-ui` 안내 페이지, `globals.css`·`page.module.css` 는 Next 스캐폴드 회색 기본값(`#fafafa`·`#000` 등), `public/` 은 Next 기본 svg 5개. 챗봇 화면의 색은 **카카오톡 UI(카카오 소유)** 라 SY 주색이 아니다. 업체 공개 쇼핑몰(카페24)·채널 프로필 이미지에서 따올 수는 있으나 이번 조사에선 열어 보지 않았다(필요하면 사용자에게 채널 프로필 이미지·주색 확인). `brand.json` 은 `primary: null` + `source: "미확인"` 로 둘 것을 권한다.

## 9. 다른 세션 점유 (읽기)

- `rc-list`: `kakaoauto` inactive/disabled(세션 안 돎). `ps` 에 `kakaoauto` 경로 프로세스 0.
- `git worktree list` = `main` 하나뿐(작업 트리 clean, 브랜치 `feat/faq` 로컬만 남음, 스태시 없음).
- 서버 포트(`ss -ltn`): 사용 중 3312·3417·3475·3494·5432·8443·8781·8782 외 다수. 레포 기본 sim 포트 3000·3107 은 비어 있었으나 형제 세션이 쓸 수 있으니 **찍기 직전에 `ss -ltn` 으로 빈 포트(예 3281)를 다시 확인**하고 이 세션이 띄운 PID 만 종료.
- docker: 형제 프로젝트 컨테이너 `supabase_rest_junimal`(postgrest) 가동 중 — junimal 소유, 건드리지 않는다. 이 조사의 docker 사용 0.

## 10. 지시와 코드가 다른 점

1. **「문자」 알림 없음** — 접수 알림은 알림톡(사고만) + 카카오 메모(6종). SMS 는 운영 알림(keep-alive 실패)뿐: `cron/alert-sms/route.ts:37`, `notify/alimtalk.ts:82`(`disableSms`).
2. **「알림톡」은 고객 화면에 없다** — 가게 대표 폰으로 가는 푸시. 고객 대화창에는 완료 요약 + 「담당자에게 전달하기」 카드만(`engine.ts:135`).
3. **「담당자 전달 버튼」 이름**: 브리프 §7 은 「[상담직원 연결]」 인데 현재 코드는 **「담당자에게 전달하기」**(`responses.ts:10`, 09-28 변경 `PROGRESS.md:46`). 장면 설명은 현재 이름으로.
4. **「접수 흐름」에 확인 단계가 없다** — 옛 「요약 → 이대로 접수할까요?」 화면은 폐지, 마지막 질문 직후 곧바로 저장·완료(`engine.ts:8,176,202-208` 는 구 세션 하위호환 전용). 영상에 「요약 확인 → 네, 접수할게요」 장면을 넣으면 현재 라이브와 다르다.
5. **방문 정비만 「추가 정보」 게이트가 있다**(`flows.ts:239`); 사고/긴급·장애 문의는 사진 다음에 바로 확정.
6. **카테고리 수 표기가 낡은 문서가 많다** — `CLAUDE.md`(「6 quick replies」·「skeleton only」·「Supabase·AI·OAuth 는 future steps」), `dispatch.ts:44` 주석 「카테고리 진입(6종)」, `docs/GO-LIVE.md` 스모크 표 「6개 카테고리」. 실제 7종(1번 사실).
7. **상호 표기 불일치**: 코드·알림톡 안내 「에스와이모터스」(`menu.ts:18`, `shop/info.ts`), 접수번호 접두 「SY-」(`save.ts:103`), 지시·표기 방침 「SY모터스」(사용자 결정, 브리프 §1). 화면에 코드 문구가 그대로 나오는 웰컴(「에스와이모터스입니다」)은 사용자 결정과 다르게 보인다 → 가림이 아니라 표기 결정 필요.
8. **「worktree 에서 로컬로 돌린다」의 전제**: 레포는 `node_modules` 없음 + `supabase/config.toml` 없음 + 개발 DB 없음 → 가짜 DB 서버가 필요(추천 경로).
9. **지시 3흐름의 이름**: 방문 정비=`repair`, 사고/긴급=`accident`, 장애 문의=`trouble`(`flows.ts:248,287,272`) — 이름 불일치 없음.

## 추천 촬영 경로 (결정은 메인 세션)

**1순위 — 로컬 사본 + 가짜 DB(코드 수정 0)**: worktree(또는 임시 clone, `.env.local` 없이)에서 `npm ci` → `NODE_ENV` 드라이런 서버(`next dev` 또는 `next start` + `NOTIFY_DRY_RUN=true`)를 빈 포트에 띄우고, `SUPABASE_URL` 을 **이 세션이 `~/prism-media/sy-motors/capture/` 에 두는 메모리 속 PostgREST 흉내 서버**로, `SUPABASE_SERVICE_ROLE_KEY` 는 아무 가짜 문자열로 준다. 흉내 서버가 받아야 하는 요청은 `chat_sessions`·`customers`·`intakes`(+`name:payload->>name` 별칭, 재발화 장면만)·`intake_media`·`bot_events`·`owner_tokens` 의 select/insert/upsert/delete(`eq`·`gte`·`lt`·`order`·`limit`·`on_conflict`, `Accept: application/vnd.pgrst.object+json`, `Prefer: return=representation`)와 사진 장면용 `/storage/v1/object/intake-media/*`. 선례: sim 들이 이미 로컬 이미지 서버·콜백 서버를 코드 수정 없이 쓴다(`scripts/sim-media.ts`, `sim-edge.ts:294`). 그 위에서 `POST /api/kakao/skill` 로 아래 순서를 보내고 **응답 JSON 원문을 단계마다 저장**(`states/<흐름>/NN-….json` + 말풍선 글·버튼·카드 요약):
- 방문 정비(9요청): `메뉴`→`방문 정비`→`어코드 2.4 2017`(연식 질문 건너뜀)→`12가3456`→성함→연락처→요청 내용→`사진 없이 진행`→`바로 접수`(완료 요약 + 담당자 전달 카드).
- 사고/긴급(9요청): `사고/긴급`→`CRV 2.4 AWD 2016`→차량번호→성함→연락처→`주차 중 접촉사고`→`보험 처리`(퀵리플)→`사진 없이 진행`(→완료, 알림톡 env 를 가짜 5개로 주면 「🚨 긴급」 줄이 켜지고 서버 로그에 `[DRY-RUN] solapi/alimtalk` 변수 JSON 이 남음 = 알림 분기 증거).
- 장애 문의(9요청): `차량 장애 문의`→`시동이 안 걸려요`→`파일럿 3.5 엘리트 2020`→차량번호→성함→연락처→`사진 없이 진행`(→완료; 가짜 `YOUTUBE_CHANNEL_URL` 을 주면 카드에 영상 버튼).
- 선택: 재방문 확인(가짜 DB 에 고객 행 미리 삽입)·사진 수신(가짜 이미지 URL 을 `action.params.secureimage` 로)·FAQ(`FAQ_ENABLED=on`, 연락처 가림 필요). 모든 입력은 가짜 값, 저장 전 마스킹 + `pii_scan`. 서버 기동 직후 `GET /api/health` 의 `notifyDryRun===true` 와 localhost 를 확인(sim-guard 와 같은 규칙, `scripts/sim-guard.ts`), 끝나면 이 세션 PID 만 종료.
**2순위**: 로컬 Postgres+PostgREST 도커(역할·JWT 설정 필요, 스토리지 없음 → 사진 장면 제외) 또는 `supabase init`+`supabase start`(포트 충돌·이미지 용량 부담). **비추천**: 엔진을 tsx 로 직접 import — `engine.ts`→`save.ts`→`admin.ts` 의 `server-only` 때문에 `--conditions=react-server` 가 필요하고, `finalize`/`dispatch` 의 `next/server` `after()` 는 요청 범위 밖에서 호출 불가(Next 규칙상 던질 것으로 추정, 미실행)라 대역을 만들게 되면 새로 그리는 것과 같아진다. 순수 모듈(`flows.ts`·`notify/text.ts`·`kakao/responses.ts`·`kakao/menu.ts`·`notify/alimtalk.ts` 의 변수 빌더)은 tsx 로 안전하게 직접 부를 수 있어 **검증용**(전화·번호판 정규식, 완료 요약 문구)으로만 쓴다.
**기존 캡처**: 없음(0번). 화면 대신 응답 JSON 3흐름을 합격 기준으로 인정하는 지시(sy-motors 예외)에 따라 BLOCKED.md 는 「실단말 캡처·알림톡 수신 화면·카카오 앱 UI 없음」 항목만 사유·대안과 함께 적으면 된다.

## 막힌 것
- 실단말 캡처 0, 알림톡 템플릿 본문 미확인, 브랜드 주색·로고 미확인, 운영 라이브 상태 미확인(요청 금지). 서버 전체 `find /` 시간 초과(경로 한정 탐색만 완료).
- 로컬 실행은 `npm ci`(+가짜 DB 서버 작성)가 선행이라 이번 단계에선 실행하지 않았다.
