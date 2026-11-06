# medimajor RECON (촬영 전 사전 조사)

조사 시각 2026-11-05 22:5x UTC. 코드 근거는 `/home/dev/Medimajor` 의 **HEAD `ec3dd74d`(브랜치 design/v59)** 를 `git show HEAD:<경로>` 로 읽은 줄 번호(작업 폴더 미커밋 변경은 안 봄). 라이브는 curl GET 만. 라이브 응답이 HEAD 코드와 맞는지(제목·푸터·언어 경로)는 교차 확인했지만 배포 커밋 해시는 모른다("미확인").
작업 폴더·git 상태는 바꾸지 않았다. 브라우저·서버·DB 쿼리 0.

## 1. 스택·실행
- Next.js 16.2.9 App Router · React 19.2.4 · TypeScript 5 · Tailwind v4 · three 0.185 (package.json). Supabase SSR(`@supabase/ssr` 0.12, `supabase-js` 2.108.2, realtime-js 2.108.2). Node 22.23.1 이 이 서버에 있음.
- 패키지 매니저 npm(`package-lock.json`). `npm run build`(prebuild 로 `scripts/photo-swap-check.mjs`) / `npx next start -p <포트>` (CLAUDE.md §1: dev 는 헤드리스 하이드레이션이 안 돼 prod 빌드 필수). 프록시 파일은 `src/proxy.ts`(Next 16 규약).
- env '이름'(`.env.example` + `.env.local` 에 실제 있는 것): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ACCESS_TOKEN, VERCEL_TOKEN, NEXT_PUBLIC_PORTONE_STORE_ID, NEXT_PUBLIC_PORTONE_CHANNEL_KEY, PORTONE_API_SECRET, NTS_SERVICE_KEY, PAYMENTS_ENABLED(예시에만), ONBID_SERVICE_KEY, ONBID_PINNED_ITEMS(예시), NEXT_PUBLIC_ENABLE_KAKAO_LOGIN, NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, CRON_SECRET, ANTHROPIC_API_KEY, OPENAI_API_KEY. 코드 분기용: VERCEL_ENV, MM_FIXTURES.
- **로컬 실행의 DB 대상 = 운영 DB.** `.env.local` 의 SUPABASE URL 에 운영 ref `bkdszypustbzlnmehmxm` 가 들어 있다(값 미출력, 포함 여부만 확인). 로컬 `next start` 는 운영 DB 에 SSR 쿼리를 날리고 `SUPABASE_SERVICE_ROLE_KEY`·ANTHROPIC 키까지 있으면 서버 쓰기·유료 호출 경로가 열린다. 별도 스테이징/로컬 DB 는 Medimajor 용으로 없음(이 서버의 54321 등 supabase 컨테이너는 luvo-judge·gcp-test 소유).
- 데모/mock 모드: **없음**(앱 전체 mock 스위치 없음). 단 `/dev/fixture/*`(banner·cards·ds·gongmae-detail·price-stat·sell·seller-dash)는 `VERCEL_ENV!=="production" && MM_FIXTURES==="1"` 일 때만 열리고(예: `src/app/dev/fixture/ds/page.tsx:67`), `/dev/gallery` 는 `VERCEL_ENV==="production"` 이면 404(`src/app/dev/gallery/page.tsx`). 라이브에서 둘 다 404 확인. `/dev/mock/v2~v5`, `/dev/v51/[board]` 는 시안 보드(라이브 접근 미확인).
- **권고: 로컬 실행 대신 라이브(https://medimajor.com)를 대상으로 Playwright + page.route/routeWebSocket 가로채기.** 로컬은 npm ci(node_modules 약 830MB) + 빌드 + 운영 DB 연결이라 이득이 없다. 라이브가 접근 보호가 없다(아래 2).

## 2. 라이브 주소·상태 (curl -sI, 22:46Z)
- 운영 URL: **https://medimajor.com** (Vercel, region icn1, `x-matched-path` 정상). 시범 운영: 상단 띠에 "시범 운영 중 · 정식 오픈 2026년 12월".
- 홈 `/` 200 · `/auctions` 200 · `/listings` 200 · `/expo` 200 · `/sell` 200 · `/wanted` 200 · `/rfq/new` 200 · `/quote` 200 · `/categories` 200 · `/contact` 200 · `/about` 200 · `/gongmae` 200 · `/deals` 200 · `/parts` 200 · `/compare` 200 · `/login` 200.
- `/wanted/new` 307→`/login?next=%2Fwanted%2Fnew` · `/admin` 307→`/login?next=%2Fadmin` (로그인 벽).
- 접근 보호: **없음**. Vercel protection·basic auth·봇 확인 없음(www-authenticate·x-vercel-protection·set-cookie 헤더 0). `User-Agent: HeadlessChrome/…` 로도 200. `robots.txt` = `User-agent: * / Disallow: /`(시범 운영 비색인; 접근 차단 아님). 응답 `cache-control: private, no-store`(force-dynamic).
- 공개 매물 예시(2026-11-05 `/auctions` 목록에서 20개 노출, 홈 헤더 집계 경매 35·삽니다 9·공매 29):
  - https://medimajor.com/auctions/0ca69e33-a36d-4fa3-a9f9-bd991d7ebdc8 — 미래온 MQE-102 뇌파 검사기, 진행 중, 입찰 10건, 현재가 13,300,000원(시작가 12,500,000원), 마감 11.14(토) 22:25 KST. **입찰 4단계 재현 후보 1순위**(호가 단위 10만).
  - 같은 목록: 2013560e-e74a-44a4-a1fe-aaafcba791b9(도란메디 OCT-104 안저 OCT, 입찰 5, 25,000,000원 · 마감 11.06 19:11 KST로 곧 종료), 43af5d11-3663-4926-a7b6-11a6d00d6dea(가람진단 디지털 X-ray), 4844d104-17de-42eb-ad5b-1fdabbf14f42(청암메디텍 ICU 전동 침대, 입찰 7, 9,200,000원), 7f4952b5-ac4a-48c5-a02f-cce4c06a6b11(태온메디텍 IPL).
  - 매물은 전부 **시범 운영 샘플**: 화면에 "명세 견본 값입니다(시범 운영 매물)", 사진 크레딧 "MEDIMAJOR · 시안 자산(AI 생성)", 홈 "사진은 시범 운영용 대표 이미지". 제조사·상호가 가상(미래온·온새미바이오장비 등). 영상 자막에서 "실거래"처럼 쓰면 안 된다.

## 3. 명세 항목 ↔ 실제 라우트
공통: 모바일 390 은 별도 라우트가 아니라 **같은 페이지의 반응형**(컨테이너 쿼리 `.mm{container:page/inline-size}`, `src/v51/mm.css:21`; 폰 전용 헤더 `m-only`/`d-only` 클래스). 코드에 보드 이름만 `*Phone`(HomePhone·LotPhone·AuctionsPhone·SellNewPhone 등)으로 남아 있다. 뷰는 `src/v51/boards/*`, 라우트는 `src/app/**/page.tsx`.

| 명세 | 실제 URL | 파일:줄 | 진입 조건 | 셀렉터 힌트 |
|---|---|---|---|---|
| 홈(언어마다 1장) | `/`, `/en` `/zh-CN` `/ja` `/th` `/hi` (ko 는 `/` 또는 `/ko`) | `src/app/page.tsx` → `src/v51/boards/Main.tsx` | 공개 | `header.mm.hd`, `footer.mm.ft`, 배너 캐러셀 `[aria-roledescription=carousel]`(`src/v51/islands/HomeBanner.tsx:156`) |
| 경매장터 | `/auctions` ("전체 경매") 필터 `?category=imaging` 등 | `src/app/auctions/page.tsx`, `src/v51/boards/Auctions.tsx:23` | 공개 | 헤더 "중고 경매장터"는 `/auctions` 링크+팝업(CategoryMenu) |
| 매물 상세+실시간 입찰 패널 | `/auctions/<uuid>` | `src/app/auctions/[id]/page.tsx`, 패널 `src/v51/islands/BidPanel.tsx:794`(BidPanel) | 공개(입력창은 로그인 시) | `section.bid`, 가격 `.v[data-mo=roll]`, 이력 `.bh .bh-r(.top)`, 폰 하단 바 `.mbid`(BidBar `:1228`) |
| 전시관 | `/expo` ("전시관"), 부스 `/expo/<slug>` | `src/app/expo/page.tsx:23`, `src/v51/boards/Expo.tsx`, `Booth.tsx` | 공개 | 헤더 "신품 전시관"=`/expo` |
| 구매 요청 | **`/wanted`**(탭 제목 "삽니다", 홈 문구 "구매 요청"), 상세 `/wanted/<uuid>`, 등록 `/wanted/new`(로그인 벽) | `src/app/wanted/page.tsx:18`, `src/v51/boards/Wanted.tsx` | 목록 공개, 등록 307→login | 홈 "구매 요청 등록"(i18n `Main.023`)·"구매 요청 전체"(`Main.055`). 별개로 `/quote`·`/rfq/new`="견적 요청"(공개 폼) |
| 사진으로 판매 등록 | 공개 안내 `/sell`("장비 등록"), 마법사 `/sell?start=1`(로그인 필요) | `src/app/sell/page.tsx:32-52`(wantWizard=`start=1`\|\|`draft`), `src/v51/boards/Sell.tsx`·`SellNew.tsx` | 안내 공개 / 마법사는 `requireUser`(`:50`) | 헤더 버튼 "사진으로 판매 등록"=`/sell?start=1`(`Header.tsx:205` 데스크톱 `.hd-cta`, `:192` 폰 `.hd-cam`). 마법사 사진 단계 `PhotoUploader.tsx`, AI `AiPhotoDraft.tsx` |
| 관리자 | `/admin` (+`/admin/listings` `[id]`, `/stats`, `/bulk`, `/wanted`, `/quotes`, `/showroom`, `/directory`, `/announcements`, `/news`, `/reports`) | `src/app/admin/**`, `src/v51/boards/Admin.tsx` | `adminGate`(`src/v51/models/admin.ts:27`): 로그인 + `profiles.role='admin'`, 아니면 404. 국문 고정 | 로그인 계정 필요 |
| 모바일 홈 | `/` @390 | 위와 동일 | 공개 | 폰 헤더 `m-only`, 하단 탭 |
| 모바일 매물 상세 | `/auctions/<uuid>` @390 | 위와 동일 | 공개 | 하단 고정 입찰 바 `.mbid` |
| 모바일 판매 등록 | `/sell`(안내) 또는 `/sell?start=1`(마법사) @390 | `SellNewPhone.tsx` 보드 존재 | 마법사 로그인 | 폰 헤더 카메라 버튼 `.hd-cam` |

언어 목록·전환: `LANGS=["ko","en","zh-CN","ja","th","hi"]`(`src/lib/i18n-core.ts:27`), 자기 표기 한국어·English·中文·日本語·ไทย·हिन्दी(`:73`). 전환 방식 3가지:
1. **경로 prefix**: `/<lang>/...`(`zh-CN` 은 대소문자 무시, 예 `/zh-CN`)를 프록시가 내부 경로로 rewrite 하고 쿠키를 심는다(`src/proxy.ts:52-98`). 라이브 확인: `/en` `/th` `/zh-CN` `/ja` `/hi` 모두 200, `<html lang>` 이 해당 언어. `/api`·`/auth` 는 접두 불가(404).
2. **쿠키** `medimajor.lang=<코드>`(`i18n-core.ts:30`; 접두 없는 요청은 쿠키 → Accept-Language → ko 순, `proxy.ts:66-70`). 라이브에서 `Cookie: medimajor.lang=ja` 로 `lang="ja"` 확인. 쿼리 파라미터 방식은 없음.
3. UI 선택기: 헤더 언어 메뉴(`src/v51/islands/HeaderMenus.tsx:104,175`) → `LangProvider.setLang`(쿠키 쓰고 `router.refresh()`, `LangProvider.tsx:108`). 표시 통화는 별도 쿠키 `mm_cur`(`/api/currency`, GET).
촬영 권고: 홈은 `/<lang>` 직접 접속(가장 결정적). 예외: 비밀 `xx` 의사 로케일은 쿠키 전용·무시.
th·hi 는 카테고리명이 영문 폴백(`categories.ts:53-65`)이라 태국어·힌디어 홈에도 영어 분류명이 섞여 보일 수 있음.

## 4. 실시간 입찰 (코드 기준)
- **매물 상세 = Supabase Realtime `postgres_changes`**(WebSocket). `src/components/detail/AuctionLiveProvider.tsx:255-278`: `supabase.channel("auction-<auctionId>").on("postgres_changes",{event:"UPDATE",schema:"public",table:"auctions",filter:"id=eq.<auctionId>"}, cb).subscribe()`. 폴링 폴백 **없음**(상세).
- 콜백 처리(`:259-277`): `payload.new` 의 `current_price`→setCurrentBid, `bid_count`, `ends_at`, `extension_count`, `leading_bid_id`, `status==="ended"`면 `results_public` 재조회. 매 이벤트마다 `refetchHistory()`(`:231`)가 **GET** `/rest/v1/public_bids?select=id,amount,created_at,bidder_masked,is_mine,is_auto&auction_id=eq.<id>&order=created_at.desc` 를 한 번 더 부른다. 입찰 직후 `refetchAuction`(`:285`) 도 GET `/rest/v1/auctions?...&id=eq.<id>`.
- 입찰 쓰기: `supabase.rpc("place_bid",{p_auction_id,p_amount})`(POST `/rest/v1/rpc/place_bid`), 즉시구매 `rpc("buy_now")`. 입력값은 "최대 입찰가"(자동입찰)이고 판정은 서버(CLAUDE.md §2).
- 홈·목록의 "라이브 스트립/카드"(`src/v3/live/live-channel.ts`): 비공개 broadcast 채널 `live-events`(이벤트 bid·listed·sold·price, `:102-106`)가 1순위, 실패/8초 미연결 시 **20초 폴링** GET `/api/live/events`(`:55-75`). 첫 연결은 load 뒤 10초 지연(`:127`). 상세 입찰 패널과는 별개.
- 갱신 시 화면: `BidPanel.tsx` 의 `Mo`(`:61-66`)가 값이 바뀐 뒤에만 `data-mo="roll"` 을 달고 요소를 새로 세운다 → CSS 애니메이션 `mo-rise-in-1`(`src/v51/motion-lot.css:24-26`, 가격 `.v`/`.price` 에 배경 번쩍 pseudo). 사용 위치: 큰 가격 `:88`, 입찰 수 `:159`·`:734`, 상단 가격 띠 `BidSubbar :1163`, 폰 바 `BidBar :1190`; 연장 시 `pop`(`:121`). 이력 목록 `BidHistory :1289`(최근 5건, 최고가 행 `.top`). 스크린리더용 `role=status` 2.5초 디바운스 안내. 마감 시계 `Clock :33`(1초 틱). 시계 보정은 하이드레이션 뒤 `/api/time` 을 두 번 호출(`src/lib/clock.ts:36,57`).
- 입찰가가 오르는 4단계 이상을 **운영 DB 에 쓰지 않고** 만드는 방법:
  - (a) 테스트 경매: 공개 테스트 전용 경매는 **없음**(전부 시범 운영 샘플이고 실제 입찰이 걸린 상태, 미래온은 입찰 10건). 테스트 계정은 있으나(5번) 입찰은 `place_bid` 쓰기라 쓰지 않는다. 로컬 폐기 DB 는 CLAUDE.md 가 `verify:p5bid` 용으로 말하지만 이 서버에서 Medimajor 용으로 떠 있는 것은 확인 못 함 → "미확인".
  - **(b) WebSocket 가로채기 — 가능, 권고.** Playwright `page.routeWebSocket(/realtime\/v1\/websocket/, ws => …)` 로 서버에 연결하지 않고(`connectToServer()` 호출 안 함) 직접 응답. 호스트 `wss://bkdszypustbzlnmehmxm.supabase.co/realtime/v1/websocket?apikey=…&vsn=2.0.0`(라이브 HTML 에 URL 인라인 확인). realtime-js 2.108.2 의 vsn 2.0.0 텍스트 프레임은 JSON 배열 `[join_ref, ref, topic, event, payload]`(`node_modules/@supabase/realtime-js/dist/main/lib/serializer.js` encode/decode; 서버 쪽 바이너리 broadcast 는 안 씀).
    1. 클라 → `[jr, r, "realtime:auction-<id>", "phx_join", {config:{… postgres_changes:[{event:"UPDATE",schema:"public",table:"auctions",filter:"id=eq.<id>"}] …}, access_token}]`. 응답: `[jr, r, "realtime:auction-<id>", "phx_reply", {status:"ok", response:{postgres_changes:[{id:<임의 정수>, event:"UPDATE", schema:"public", table:"auctions", filter:"id=eq.<id>"}]}}]`(event·schema·table·filter 가 클라 바인딩과 하나라도 다르면 CHANNEL_ERROR, `RealtimeChannel.js:182-205`).
    2. 하트비트 `[null, r, "phoenix", "heartbeat", {}]` → `[null, r, "phoenix", "phx_reply", {status:"ok", response:{}}]`. `access_token` 이벤트는 무시해도 됨.
    3. 입찰 갱신 푸시: `[null, null, "realtime:auction-<id>", "postgres_changes", {ids:[<위 id>], data:{schema:"public", table:"auctions", commit_timestamp:"<ISO>", type:"UPDATE", columns:[], record:{id:"<id>", current_price:13400000, bid_count:11, ends_at:"<기존 ends_at>", extension_count:0, leading_bid_id:"<가짜 id>", status:"active"}, old_record:{id:"<id>"}, errors:null}}]` (`RealtimeChannel.js:664-672` 가 `payload.ids`·`data.type` 으로 라우팅, `:700-714` 가 `record`→`payload.new`). `status` 는 ended 가 아닌 값(진행 중 값 이름은 라이브 응답으로 확인 필요 — "미확인").
    4. 푸시마다 `refetchHistory` 가 GET `public_bids` 를 날리므로 `page.route("**/rest/v1/public_bids*")` 로 가짜 이력 배열(`[{id,amount,created_at,bidder_masked:"김○○",is_mine:false,is_auto:false},…]` 최신순)을 `200 application/json` 으로 주면 이력 줄도 같이 올라간다(안 막으면 운영 이력으로 덮어씀). 입찰 직후 GET `rest/v1/auctions?…id=eq.<id>` 도 쓰이지 않지만(로그인 입찰 시에만) 필요하면 같이 가로챈다.
    5. 4단계 예: 현재가 13,300,000 → 13,400,000 → 13,500,000 → 13,600,000 → 13,700,000, bid_count 10→14. 호가 단위는 2,000만 미만 구간 10만(`src/lib/bid-increment.ts` `getBidIncrement`: <500만 5만, <2,000만 10만, <5,000만 50만, 그 이상 100만).
    6. `page.clock.install` 로 시간을 멈춰도 WS 가 가짜라 문제없음. 하이드레이션 전에 푸시하지 말고 `phx_join` 응답 뒤, 각 단계 사이에 `runFor(1000/60)` 를 애니메이션 길이(`--mo-pop`)만큼 돌린다. 폰(390)에서는 `.mbid` 도 같은 값으로 갱신.
  - (c) polling 은 상세 입찰 패널에 없다. 홈 "라이브 스트립" 을 찍을 때만 GET `/api/live/events` 응답(`{events:[{kind:"bid",lotId,title,amount,at}],now}`, `live-channel.ts:60-67`) 가로채기가 유효(20초 폴링이라 시간 제어 필요).
  - 쓰기가 아닌 연출을 위해 로그인도 불필요: 비로그인 상세에도 가격·입찰 수·이력·시계가 보이고 입력창만 "로그인하고 입찰하기" 로 대체된다.

## 5. 테스트·관리자 계정 (값 기록 없음)
- 정의 위치: 레포 `.secrets/`(gitignored, 0600): `mm-test-accounts.json`(항목 2개, 키 slug·email·password — 판매자 1·구매자 1, `scripts/test-accounts.cjs` 가 생성/삭제, `app_metadata.test_account=true`, 데모 로트 비공개 정책), `medimajor-qa-admin.json`(email·password·at, 2026-09-17 `scripts/qa-admin-reset.cjs` — 기존 관리자 `qa-admin` 계정, 비밀번호만 재설정), `mm-sample-accounts.json`(14개, `scripts/samples/lib.cjs:53`). 관리자 감사 스크립트 `scripts/audit-admin.cjs` 는 `BASE_URL` `ADMIN_EMAIL` `ADMIN_PASSWORD` env 로만 받음(라이브 읽기 전용, 유일한 비-GET = 로그인 폼 제출).
- 한계: 이 계정들의 **현재 유효성은 미확인**(DB 조회 금지). `qa-admin` 의 role=admin 이 지금도 유지되는지 미확인(p6-admin-grant 로 승인 창 뒤 회수하는 방식도 있었음). 테스트 판매자의 `admin on|off` 는 DB 쓰기라 쓰지 않는다. 로그인 자체가 Supabase auth 토큰 POST(세션 생성)라 운영에 흔적이 남는다 — 지시의 "각 프로젝트에 이미 있는 계정만" 에 해당하지만 "쓰기 0" 의 예외로 보고해야 한다.
- 관리자 화면 없이 대체 증빙이 필요하면 `references/full-audit-2026-08/admin/shots/`(과거 실캡처, 레포 내)를 먼저 확인할 것(존재 여부 미확인).

## 6. 쓰기 위험
- **GET 만으로 서버 쓰기 2건**(둘 다 SSR, `page.route` 로 못 막음):
  1. 매물 상세 `/auctions/<id>` 가 `recordAndReadLotStats`(`src/app/auctions/[id]/page.tsx:80` → `src/lib/lot-stats.ts:19`)로 service_role `lot_view_stats` RPC 호출 = 조회 수 기록(방문자 해시×KST 하루 1회). **UA 가 `BOT=/bot|crawl|spider|slurp|headless|lighthouse|preview/i`(`lot-stats.ts:16`) 에 걸리면 기록 안 함**(건수는 읽음). → 촬영 UA 에 `HeadlessChrome` 또는 `bot` 문자열 유지(Playwright 헤드리스 기본 UA 는 `HeadlessChrome` 이지만 UA 를 직접 바꾸면 이 문자열을 넣을 것). 이 조사에서 매물 상세 1건(미래온 `0ca69e33…`)을 일반 UA(`Mozilla/5.0`)로 1회 GET 했으므로 그 로트 `lot_view_days` 에 1행이 생겼을 수 있음(기록 시점 이후 조회 수 79 표기). 이후 조사 요청은 모두 `HeadlessChrome` UA.
  2. 마감이 지났는데 결과 없는 로트를 열면 `finalizeDue`(`:121` → `src/lib/finalize.ts:16`)가 service_role `finalize_auction` 호출(멱등, 원래 cron 이 매분 하는 일). → **마감 임박·종료 로트는 피한다**: 도란메디 OCT-104(`2013560e…`)는 11.06 19:11 KST 마감, 이 파일 작성 후 곧 종료될 수 있음. 미래온(11.14 마감) 권장.
- 요청 가로채기 대상(촬영 중 `route.fulfill` 로 가짜 성공, 건수 json 에 기록):
  - POST/PATCH/DELETE `https://bkdszypustbzlnmehmxm.supabase.co/rest/v1/**`(예: rpc `place_bid`·`buy_now`·`create_listing_draft`·`update_listing_draft`·`update_listing_*`·`sync_listing_images_slots`·`submit_listing`·`get_listing_price_input` 는 읽기성 RPC 이지만 POST), 스토리지 POST `…/storage/v1/object/listing-images/**`(`PhotoUploader.tsx:79`), 서버 액션 POST(헤더 `next-action`, 대상 `src/lib/*-actions.ts` — 견적·삽니다 등록·문의·관심·알림·관리자 승인 등).
  - **읽기인데 POST**: 서버 액션과 `rpc("get_listing_price_input")`(`SellClient.tsx:372`) 가 POST 로 가지만 읽기. 이 둘은 가짜 응답 주면 화면이 깨질 수 있어 건별 확인 필요. `/api/*` 는 GET 만(`ai-listing/draft|vision`, `ai-quote`, `business/verify`, `identity/*`, `payments/deposit` 은 POST).
- **유료 AI 호출**: `/api/ai-listing/vision`(POST, `route.ts:35`)·`/api/ai-listing/draft`(POST)는 Anthropic(`AI_MODEL="claude-opus-4-8"`, `src/lib/ai-listing.ts:52`)을 부르고 `ANTHROPIC_API_KEY` 가 있으면 가동. `/api/ai-quote`(POST)도 같은 종류. 마법사 사진 업로드 후 `AiPhotoDraft.tsx:76` 이 vision 을 호출 → **`page.route("**/api/ai-listing/**")` 로 반드시 가로채 가짜 JSON**(`{result, model, usage, costKrw, logged}` 모양, route.ts:97) 반환. 로그인 상태에서만 호출됨(`getUser`).
- 마법사 `/sell?start=1` 진입 시 `rpc("create_listing_draft")`(`SellClient.tsx:637`)가 빈 초안을 만든다(서버가 `?start=1` 에서 빈 초안을 재사용하는 로직도 있음, `sell/page.tsx:20-31` 주석) → POST 가로채기 + 로그인 필요. 가짜 응답이면 draft id 가 없어 이후 단계가 안 열릴 수 있음 → BLOCKED 후보.
- 크론 GET(`/api/cron/*`, `/api/notify/dispatch`, `/api/price-ingest`)은 `CRON_SECRET` 없으면 401 — 호출하지 말 것. `/api/device-lookup`·`/api/business/verify` 는 로그인 필요.
- 문자·알림톡·결제·푸시: 결제는 `PAYMENTS_ENABLED` 로 닫혀 있음(`/api/payments/*` 503), 본인인증 키 없음(`bid_requires_identity` 플래그 끔).

## 7. 가림 대상 (라이브 확인)
- **회사 정보(머리·꼬리, 모든 페이지)**: 상단 띠 "고객센터 1899-2136"(`header` `.u-r a`), 홈 `ul.h7-rules` "고객센터 1899-2136", 푸터 `.ft-tel` "대표 전화 1899-2136", 푸터 상호/대표자(남궁 ○○ 실명)/사업자등록번호 127-86-63833/통신판매업 `2026-고양덕양구-2434`(`src/lib/legal-ids.ts:8`)/의료기기판매업 `2026-3940139-00041`(`:10`)/주소(경기도 고양시 덕양구 삼원로 63, 1423호 …)/팩스 031-8057-6493. 같은 값이 `<script type=application/ld+json>`(Organization)에도 있으나 비가시. 이메일 주소는 푸터에 없음(홈 폼 placeholder `name@hospital.kr`·`you@hospital.kr` 두 개는 예시 문자열, 가림 정규식에는 걸림). `/contact`·`/about` 에도 전화·팩스·사업자번호·대표자·주소. 가림 규칙 → 전화 '010-****-****' 형식 대신 대표번호는 **삭제**(명세: 머리·꼬리 대표번호·주소 지움), 사업자번호·신고번호·팩스·대표자 이름도 지우는 쪽이 안전. 푸터 링크 "사업자정보 확인"은 외부 URL 일 수 있음.
- **화면 속 도메인/URL 글자**: `/expo` 에 전시회 사이트 글자 `kimes.kr`·`kimesbusan.com`(공개 행사 링크, 규칙상 지움). 매물 상세 JSON-LD·공유 링크는 비가시. 홈 로고 alt 텍스트는 가시 아님.
- **판매자**(매물 상세 "온새미바이오장비 판매자 · 대전 유성구", 판매자 코드 `BDC8 · 대전`): 가상 시범 상호(공개 매물의 판매자 노출 상호). 명세 규칙상 "공개된 상호는 그대로" 로 볼 수 있지만 **실제 입점사가 아니라 샘플이라 문제 없음**. 확신이 없으면 'A메디칼' 식 치환. 시리얼 `MQE1-1•••64`(일부 가림 이미 적용). `/sellers/<id>` 판매자 프로필 페이지 있음(내용 미확인).
- **입찰자**: `public_bids.bidder_masked` 가 이미 마스킹(예 "홍**" 형식, `AuctionLiveProvider.tsx:35,40`; 표시는 `bidderLabel`). 요청자(삽니다 목록)도 "김** · 경기", "이** · 서울" 로 마스킹됨 + "메디메이저 · 서울"(운영자 자체 글). 규칙 형식('김○○')과 다르므로 한 번 더 치환 권장. 병원명·병원 연락처는 공개 화면에 없음("상대방 연락처는 어디에도 노출되지 않습니다" 안내 문구).
- **관리자 화면**: 판매자 신원·사업자 정보·문의가 열릴 수 있는 `/admin/listings/[id]`·`/admin/directory`·`/admin/quotes`·`/admin/wanted` 는 실제 가입자(시범 운영 참가자) 정보 가능성 → 전수 가림 또는 목록 화면(`/admin`, `/admin/stats`)만 촬영 권고. 현재 admin 화면에 무엇이 뜨는지는 로그인이 안 돼 미확인.
- **협력사·입점 부스**(홈 "협력사 BMR 비엠알 주식회사 BMR Co., Ltd.", `/expo` 의 라온이미징·세라온메디칼·한결바이오텍·블루포인트 및 "입점 준비 중" JBM·HDX·나인앤테크·한성의료기): 광고·입점사로 화면에 공개된 상호 → 규칙상 그대로.
- QR 코드 없음(확인한 공개 페이지 범위). 채팅 위젯·쿠키 배너 미관측(홈 HTML 기준; 개발 배지·Vercel 툴바 없음 — 운영 빌드).

## 8. 사실 후보 (facts.md 용)
1. **지원 언어 6개**: ko·en·zh-CN·ja·th·hi — `src/lib/i18n-core.ts:27`; 라이브 `/en /th /zh-CN /ja /hi` 200 + `<html lang>` 확인. (CLAUDE.md §3.1-6 도 "6언어"). 표시 통화도 6종 KRW·USD·CNY·JPY·THB·INR(헤더 통화 메뉴 라이브 확인); 입찰·결제는 원화.
2. **카테고리 대분류 25 × 소분류 102** (이 합산 127개 노드): `src/lib/categories.ts:74-352` `TAXONOMY` 를 직접 파싱해 센 값 25·102(소분류 키 102개 고유). 주석 `:11` "25 majors × 102 subs" 와 일치. 라이브 홈에도 "분야별 매물 25 진행 중".
3. **실시간 입찰 방식 = Supabase Realtime `postgres_changes`(WebSocket)**: 상세 `AuctionLiveProvider.tsx:255-278`(채널 `auction-<id>`, `auctions` UPDATE, 필터 `id=eq.<id>`); 홈 라이브 카드는 broadcast 채널 `live-events` + 20초 폴링 폴백(`live-channel.ts`). 
4. **자동입찰 + 5분 연장**: 입력은 "최대 입찰가", 서버 `place_bid` 트랜잭션이 선두·가격·연장·알림을 한 번에 판정(`CLAUDE.md §2`); 홈 문구 "마감 5분 전 입찰 시 5분 연장"(라이브 홈 `h7-rules`). 호가 단위 5만/10만/50만/100만(`src/lib/bid-increment.ts`).
5. 시범 운영 상태: 라이브 "시범 운영 중 · 정식 오픈 2026년 12월"(2026-11-05 확인), 매물 사진·명세는 "시범 운영 샘플". 자막에 쓰면 이 단서를 붙일 것.
6. 라이브 규모(2026-11-05 22:46Z 홈·헤더 SSR 집계): 진행 중 경매 35건 · 삽니다(구매 요청) 9건 · 공매 29건 · 전시관 4개 브랜드·신품 12종. "공매 29"는 한국자산관리공사 공고를 옮긴 외부 정보(푸터 문구). 실시각 질의 아님(읽기 전용 SSR HTML).
7. 호스팅/지역: Vercel `icn1`(`vercel.json`) · Supabase 프로젝트 ref `bkdszypustbzlnmehmxm`. 자동 마감 확정은 pg_cron 매분(`src/lib/finalize.ts` 주석).
8. 공매(온비드) 연동: `/gongmae`, 캠코/data.go.kr 공식 API 읽기 전용(`.env.example` ONBID_SERVICE_KEY 주석, 푸터 문구).
- 근거 없는 수치("거래액 N원" 등)는 쓰지 말 것: 정산·거래액 DB 값은 읽지 않았다(미확인).

## 9. 브랜드
- **실제 렌더 주색(라이브 CSS 청크 `.mm` 토큰 확인)**: `--brand #222F60`(남색, 로고 색), `--night #0E1838`, `--blue #2445C7`(CTA 파랑), `--sig #E5482D`(포인트 주황빨강), 배경 `--bg #F3F5F8`, 글자 `--ink #0B1530` — `src/v51/mm.css:8-14`(디자인 v55 이식, 라이브가 이 값을 서빙). 별도로 CLAUDE.md §3.2·`src/app/globals.css:70-128` 에는 `--color-primary #1150c8`, `--color-page #e8f1fb`, `--color-electric #2e7fff` 등 다른 팔레트가 있으나 v51 화면 `.mm` 범위에서는 위 값이 쓰인다 → **brand.json 은 `#222F60`(주) + `#2445C7`(보조) 로 쓰는 것을 권고, CLAUDE.md 의 #1150c8 은 레거시 award 층.**
- 폰트: 본문 **Pretendard Variable**(`src/v51/mm.css:3,15`, 파일 `/fonts/v51/PretendardVariable.woff2`), 숫자·모노 **JetBrains Mono**(`src/v51/fonts.css`), 전역 `MM Sans`(Pretendard 서브셋 개명, `src/app/fonts-m8.css:26`)도 일부 청크에서 로드. 언어별 폴백: ja Pretendard JP, zh-CN Noto Sans SC, th Noto Sans Thai, hi Noto Sans Devanagari(`public/fonts/m8/lang-*.css`).
- 로고 원본: `public/v51/logo-navy.svg`(헤더 사용, fill `#222F60`, 3750×918), `public/v51/logo-white.svg`(푸터), `public/ref/brand/mm-logo-client.svg`(fill `#222F60`, JSON-LD 로고), `mm-symbol-client.svg`·`mm-symbol-v2.svg`·`mm-symbol-180/32.png`·`icon-180/32.png`·`og-1200x630.png`. 라이브 `/v51/logo-navy.svg` 200 확인.
- 히어로/제품 이미지: 홈 첫 화면은 매물·배너 카드 위주이고 "히어로 사진" 은 협력사 BMR 배너 `public/v55/bmr/bmr-ad-hero.jpg`(웹용 `/v55/bmr/w/bmr-ad-hero-1280.webp` 라이브 200)와 부스 이미지 `public/v51/booth/w/*-720.webp`, 제품 `public/img/a3/products/*`. 매물 사진은 Supabase 스토리지(`listing-images/samples-v9/…`, "시안 자산(AI 생성)" 라벨 — CLAUDE.md §3.1-9 는 "시드 로트 사진은 스톡(Pexels)" 이라고 적었으나 라이브 크레딧은 AI 생성 시안, 불일치). 영상 재료로 쓸 때 사진 크레딧 문구 유지. 용량: `public/ref` 11MB, `public/img` 3.7MB.
- 모션 토큰: 가격 roll 등 `--mo-*`(`docs/specs/motion-v56.md`). 홈 캐러셀은 일시정지·화면 밖 정지·reduced-motion 정적 보장(CLAUDE.md §3.1-4).

## 10. 다른 세션 점유·자원
- `git worktree list`(읽기): `/home/dev/Medimajor` [design/v59 ec3dd74d], `/home/dev/Medimajor/.claude/worktrees/global-stock` [design/v60 8647f509], `…/v60-w18` [v60-w23], `…/v60-w19` [v60-w22], `…/v60-w4` (detached ac44c2c9), `/home/dev/medimajor-design` [design/3.15], `/home/dev/medimajor-v3` [design/v3]. `/home/dev/medimajor-qa` 는 폴더만 있고 worktree 목록에 없음(별도 clone 추정, 미확인).
- 점유 포트(`ss -ltnp` 확인만, Medimajor 소유): **3475**(v60-w4 next-server pid 320866), **3491**(v60-w19 pid 824524), **3493**(v60-w18 pid 1397019). 다른 프로젝트: 3311·3312 safefile, 38791 gochingphone, 8781·8782 node, 5xxxx supabase 컨테이너들. 이 세션은 아무것도 띄우지 않음.
- 빈 포트 후보(확인 시점): 3457(Medimajor 게이트 기본 포트, 현재 비어 있음이지만 다른 세션이 쓸 수 있으니 재확인), 3600·3601·3602·3700·3801·3850·3900 비어 있음. 라이브 대상 촬영이면 포트가 필요 없다.
- 로컬 실행 비용: `/home/dev/Medimajor/node_modules` 830MB(worktree 에는 안 따라옴 → `npm ci` 필요), `.next` 112MB(현재 작업 폴더 것은 건드리지 말 것), `.git` 4.0GB(clone 시 부담). 디스크 `/` 387G 중 73G 여유(82% 사용), 메모리 46G 중 가용 약 18G(조사 시점 `free -g`).
- 이 때문에 라이브 촬영을 권고한다: worktree·빌드·서버·운영 DB 연결 비용과 위험이 모두 사라진다.

## 11. 명세와 코드·라이브가 다른 점
1. 명세 "구매 요청" 은 화면 이름이 아니다 → 실제 **`/wanted`("삽니다")** 목록·상세, 등록 `/wanted/new` 는 로그인 벽(307). 공개 폼은 `/quote`·`/rfq/new`("견적 요청"). 홈 문구가 "구매 요청 / 구매 요청 등록 / 구매 요청 전체".
2. 명세 "사진으로 판매 등록" 은 헤더 버튼 이름이고 도착지는 **`/sell?start=1`**(로그인 필요, 마법사). 로그인 없이 찍을 수 있는 것은 공개 안내 `/sell`("장비 등록", 건수·검수 항목·예시 카드)와 `/login` 이다. 마법사 사진 단계·AI 인식 화면은 로그인 + `create_listing_draft`·스토리지·AI POST 가로채기가 모두 있어야 찍힘(BLOCKED 가능).
3. 명세 "전시관" = `/expo`("전시관", 헤더 "신품 전시관"). 일치.
4. 명세 "홈을 지원 언어마다" → 6장(ko 포함), URL `/` `/en` `/zh-CN` `/ja` `/th` `/hi`. 언어 전환은 경로 prefix + 쿠키(쿼리 아님).
5. 명세 "모바일 매물 상세/판매 등록/홈" 은 별도 URL 이 아니라 같은 URL 의 390 반응형이다.
6. 명세 "실시간 입찰 패널(입찰가가 오르는 4단계)": 비로그인에서도 가격·입찰 수·이력·마감 시계가 보이고 실시간 갱신된다(입력창만 로그인 필요). 운영 DB 에 쓰지 않고 만들려면 `page.routeWebSocket` 가짜 Realtime(4번 b) — 단, 상세 페이지 GET 자체가 조회 수를 기록할 수 있어 UA 에 `HeadlessChrome`/`bot` 필수(6번).
7. 명세 "테스트 경매" 는 공개 테스트 경매 없음(시범 운영 샘플만, 실제 입찰 이력이 있는 상태). 가로챈 실시간 응답이 유일한 현실 경로.
8. 관리자: 로그인 + `role=admin` 필요, 국문 전용. 테스트·관리자 계정은 `.secrets/*.json` 에 있으나 현 유효성 미확인, 로그인 자체가 운영 쓰기(세션) 1건.
9. 코드/문서 내부 불일치(영상 사실에 영향): CLAUDE.md 의 주색 #1150c8·MM Sans 는 레거시, 라이브 v51 은 #222F60·Pretendard Variable. 시드 로트 사진 출처도 CLAUDE.md "스톡(Pexels)" vs 라이브 크레딧 "시안 자산(AI 생성)".
10. 작업 폴더 HEAD(design/v59)와 라이브 배포 커밋의 일치는 미확인(제목·푸터·언어 경로·로고·가격 토큰은 일치).
11. 시범 운영 + 비색인(`robots Disallow: /`)이라 모든 촬영에 "시범 운영" 띠가 보인다. 가리지 않고 두는 편이 정직하다(숨고 영상 자막과 일관).
