# sealkitt 사전 조사 (RECON) — 2026-11-05 22:5xZ

읽기 전용 조사(코드 읽기 + 운영 사이트 GET/curl). 서버 기동·빌드·브라우저 없음. `.env.local` 값은 읽지 않았다(변수 이름은 코드의 `process.env.*` 에서 추출). 레포 `/home/dev/sealkitt` 는 다른 세션(rc `sealkitt`)이 쓰는 폴더라 `git status` 도 안 돌렸다(인덱스 갱신 방지).

## 0. 결론 먼저 (촬영 계획에 영향 큰 것)
1. 운영 사이트는 봇 확인 없이 200 (헤드리스 UA 포함). 방화벽·worktree 로컬 실행 불필요 — 라이브를 찍으면 된다.
2. **공개된 입점(검증)샵이 0곳**이다. `/shops` = "아직 공개된 검증샵이 없어요", `/market/box|pack` 의 검증샵 매물 = "아직 올라온 박스(팩) 매물이 없어요", 카드 상세의 "이 카드 파는 검증샵" = 비어 있음. 명세의 "입점 샵 페이지" 는 공개 URL 이 없다. 유일한 샵 `sealkitt-test-shop` 은 `is_test` 라 비로그인 404.
3. **나라 탭 전환·차트 기간 전환**: 시세 차트는 축 탭(국내/일본/TCGplayer) + 기간 탭(7·30·90일·전체)이 있으나, 한 카드에서 두 축 이상 활성인 카드를 못 찾았다(인기 검색 100장 스윕). 축 탭 전환 장면은 라이브로 불가 가능성이 높다 → 대체: 언어판 탭(한/일/영, 다른 카드로 이동) 또는 기간 탭만.
4. 관심 카드·알림은 **로그인 없이** 된다(localStorage + 기기 토큰). 테스트 계정이 필요 없다. 단 알림 만들기는 서버 POST → 가로채기 필수.
5. Playwright(`navigator.webdriver=true`)면 사이트가 조회 기록·샵 이벤트·engage 비콘을 스스로 건너뛴다(`lib/session.ts:36-40`). 그래도 GET 으로 서버 쪽 DB 쓰기가 나는 경로가 있다(5절).

## 1. 스택·실행
- Next.js **16.2.10** App Router · React 19.2.4 · Tailwind 4 · TypeScript 5 (`package.json:36-39`). 패키지 매니저 **npm** (`package-lock.json`). 이 박스의 lhci/playwright 의존성은 `playwright 1.61.1`(devDep) — 촬영 도구는 따로(prism-media/tools).
- 명령: `npm run build` → `npm run start` (`package.json:6-9`). dev = `next dev`.
- 프록시: `proxy.ts`(Next16 middleware 대체) — 세션 쿠키 갱신 + 병합 카드 301. 비로그인엔 쓰기 없음.
- 필요 env 이름(코드 사용): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`(서버 전용), `RATE_LIMIT_BYPASS_SECRET`, `RATE_LIMIT_HMAC_SECRET`, `CRON_SECRET`, `REVALIDATE_SECRET`, `EBAY_V2_ENABLED`, `EBAY_APP_ID`, `EBAY_CERT_ID`, `EPN_CAMPAIGN_ID`, `NTS_SERVICE_KEY`, `SWEETTRACKER_API_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `ADMIN_EMAILS`, `ADMIN_USER_IDS`, `BUNJANG_DISPLAY`, `TCGPLAYER_DISPLAY`, `KR_SHOP_PRICE_DISPLAY`, `NEXT_PUBLIC_SHOWCASE_ENABLED`, `NEXT_PUBLIC_PORTFOLIO_VALUE_AXIS`, `VERCEL_AUTOMATION_BYPASS_SECRET`; GA/애드센스는 `GA_MEASUREMENT_ID`·`ADSENSE_PUBLISHER_ID`(`lib/site-config.ts:19-22`). 전체 목록은 `grep -rhoE 'process\.env\.[A-Z_0-9]+' app lib components proxy.ts`.
- **로컬 실행 시 DB = 운영 Supabase**. 프로젝트는 ref `brpkvdtcddxgxkorkrla`(서울) 하나뿐이고 스테이징 DB 가 없다(`CLAUDE.md` 인프라 절 · 이미지도 `brpkvdtcddxgxkorkrla.supabase.co/storage/.../card-images/` 공개 URL). worktree 에 `.env.local` 을 넣으면 그대로 운영 DB 를 가리킨다 → 로컬로 띄워도 쓰기 방어(page.route)는 똑같이 필요하다. 로컬 실행의 이점은 방화벽 회피뿐인데 그게 필요 없다.
- 배포는 `scripts/tools/deploy.sh` 전용, `vercel.json` = `{"regions":["icn1"]}` 만 (크론 없음 — 수집은 서버 crontab).

## 2. 라이브 주소·상태
- 운영: **https://sealkitt.com** (`CLAUDE.md` 인프라 "alias sealkitt.com"). `server: Vercel`, 리전 icn1.
- curl 결과(22:45Z, 일반 UA + `HeadlessChrome/131` + 모바일 UA): `/` 200 (198,928B) · `/cards` 200 · `/cards/pokemon-card-jp-32317` 200 (224KB) · `/cards/pokemoncard-ko-BS2014001001` 200 · `/search?q=…` 200 · `/market` **307 → /market/box** · `/market/box|pack|single` 200 · `/market/shops` 307 → `/shops` · `/shops` 200 · `/for-shops` 200 · `/my/wishlist` 200 · `/watch` 404(라우트 없음, 알림은 시트).
- 봇 확인: 본문에 challenge/checkpoint/just-a-moment 문구 0건, `x-vercel-mitigated`·`cf-*` 헤더 없음 → **봇 확인 화면 안 뜸**. 과거 기록: GitHub 러너 IP 에서만 429 bot challenge 가 났다(`PROGRESS.md:9`). 이 서버 IP 는 통과. Bot Protection 은 log 모드(`PROGRESS.md:28`).
- 속도 제한: `/api/search`·`/api/suggest` 는 IP 슬라이딩 윈도(`lib/rate-limit.ts`) → 429 가능. 스크립트로 연타하지 말고 단계 사이에 간격을 둘 것. 우회 헤더(`x-sealkitt-rl-bypass`)는 비밀값이라 쓰지 않는다.
- `robots.txt`: `/`·카드 상세 허용, `/my`·`/api`·`/lab` 등 Disallow(촬영과 무관).
- 홈은 `IntroSplash`(불투명 오버레이, 하드 로드 시 첫 방문 ~2.0s·재방문 ~1.2s, 최대 4s 후 사라짐; 클릭/키로 스킵) — `components/brand/IntroSplash.tsx:34-40`. 캡처 전 오버레이가 사라질 때까지 대기하거나 클릭으로 스킵. localStorage 키 `sealkitt_intro_v2`.

## 3. 명세 ↔ 실제 라우트

예시 URL(공개 페이지에서 확인):
- 카드 한글판(KR 호가·차트 8일): `/cards/pokemoncard-ko-BS2014001001` (이상해꽃 EX, 언어판 3종 탭, 번개장터 호가 ₩12,400, 영문판 TCGplayer $7.03 비교 스트립)
- 카드 일본판(JP 실거래·낙찰 내역·스니덩·차트 5일): `/cards/pokemon-card-jp-32317` (리자몽EX, 야후옥션 실거래 ¥952,551, 최근 낙찰 5건 표)
- 원피스(변형칩·변형 분리 마커): `/cards/optcgapi-OP01-120_p5`
- 카드번호 검색: `/search?q=OP01-120` (2건) · 초성: `/search?q=ㄹㅈㅁ` (자동완성 API 가 `ㄹㅈㅁ`→리자몽 확인)
- 샵 slug: 공개 없음. 비공개 테스트 샵 `sealkitt-test-shop` (`PROGRESS.md:1953`).

| 명세 항목 | 실제 경로 | 컴포넌트 | 촬영 셀렉터 힌트 |
|---|---|---|---|
| 데스크톱 홈 | `/` | `app/page.tsx:25` → `components/home/HomeShell.tsx`, 히어로 `HeroStage.tsx`·`hero/HeroCopy.tsx`, 순위 `MarketRankings.tsx` | 검색 input `#home-search`(히어로, `HeroStage.tsx:24`); 홈 B 안은 `#home-search-b`. IntroSplash 먼저 지나야 함 |
| 초성 검색 | 홈·`/search` 입력창에 `ㄹ→ㄹㅈ→ㄹㅈㅁ` | `components/home/HomeSearch.tsx:99-125`, `components/search/SearchHub.tsx:421-446`, 드롭다운 `SuggestDropdown.tsx`, 훅 `hooks/useSuggest.ts`, 초성 `lib/chosung.ts` | input `[role=combobox][aria-label="카드 시세 검색"]`(홈) / `[aria-label="시세 통합 검색"]`(/search). 목록 `[role=listbox]`(body 로 포털), 행 `[role=option]` |
| 카드번호 검색 결과 | `/search?q=OP01-120` | `SearchHub.tsx`, `CardHitRow.tsx`/`CardHitTile.tsx`; 코드형 판정 `lib/suggest.ts:19` `isCodeLike` | 보기 전환 `[aria-label="리스트 보기"|"그리드 보기"]`(`SearchHub.tsx:976-988`) |
| 검색 결과(초성/이름) | `/search?q=리자몽` (홈 Enter → `router.push('/search?q=')`) | 동일 | 결과 링크 `a[href^="/cards/"]` |
| 카드 상세 | `/cards/[id]` | `app/cards/[id]/page.tsx`(ISR 3600s) → `CardDetailPage.tsx` → `components/cards/CardDetailView.tsx`·`CardDetailBody.tsx` | 관심 `button[aria-label="관심 추가"]`(해제 시 "관심 해제", `WishButton.tsx` panel), 알림 `WatchButton`("알림" 칩, `components/watch/WatchButton.tsx:41`) |
| 한·미·일 시세 | 같은 페이지: 국내 `KrPriceStrip.tsx`(번개장터 호가) · 일본 `JpPriceStrip.tsx`(야후옥션 실거래·SNKRDUNK PSA10) · 미국 `GlobalPriceStrip.tsx`/`EbaySection.tsx`(eBay 호가, 클라 fetch) · 언어판 비교 "같은 카드 · 다른 언어판 시세" | `CardDetailBody.tsx:144-170` | 섹션 제목 텍스트로 찾기("국내 시세"·"일본 시세"·"시세 추이") |
| 실거래/호가 구분 | 성격 라벨이 값마다 붙음: 호가 · 실거래 중앙값 · 마켓가 · 감정품 | `MarketTrendChart.tsx:46` `READOUT_NATURE = {kr:"호가", jp:"실거래 중앙값", us:"마켓가"}`; 홈의 "각 값은 무엇인가요" 설명 | 홈 순위 행 "호가/실거래" 칩. 일본 실거래 표는 행 클릭 → 차트 날짜 짚기 |
| 시세 차트 | 카드 상세 "시세 추이" | `components/cards/MarketTrendChart.tsx`(SVG, visx) | 축 탭 `[role=tablist][aria-label="시세 축 선택"] [role=tab]` (국내/일본/TCGplayer), 기간 탭 `[role=tablist][aria-label="기간 선택"] [role=tab]` = 7일·30일·90일·전체(`:50-54,469-483`). 비활성 축 `disabled`. 차트 `svg[aria-label*="시세 그래프"]` |
| **나라 탭 전환** | 시세 축 탭(`:302-322`)은 존재하나 **한 카드에서 2축 이상 활성인 카드를 못 찾음**(스윕 100장: 전부 1축 or 0축). 데이터가 쌓이면 달라질 수 있음 | — | 언어판 탭 `nav[aria-label="언어판 전환"]`(`EditionLangTabs.tsx:35`)은 한/일/영 **다른 카드로 이동하는 링크**(같은 화면 전환 아님). `pokemoncard-ko-BS2014001001` 은 일어판·영문판 링크 보유 |
| 마켓 목록 | `/market`→`/market/box`, `/market/pack`, `/market/single` | `app/market/box/page.tsx` → `components/market/MarketBrowse.tsx`·`ProductCard.tsx`; 탭 `MarketTabs.tsx:48`(`[role=tablist][aria-label="마켓 종류"]`: 박스·팩·싱글·검증샵·발매 캘린더) | 박스/팩 = "시세 있는 밀봉" 카드 목록(실데이터 있음, 박스 2,796·팩 1,293). 검증샵 매물 영역은 빈 상태. `/market/single` 은 본문 렌더 거의 비어 있음(미확인) |
| 입점 샵 페이지 | `/shops`(목록=빈 상태), `/shops/[slug]`, 입점 안내 `/for-shops`, 신청 `/shops/apply` | `app/shops/page.tsx:34-47`, `app/shops/[slug]/page.tsx`(is_test 면 주인·운영자만, `:33,80`), `components/shops/ShopCard.tsx`, `ShopInfoSheet.tsx` | **공개 샵 없음**. 대체 후보 ① `/for-shops`(입점 소개 랜딩, 200 · 연락처 없음) ② 테스트 샵 `/shops/sealkitt-test-shop` 은 오너 로그인 필요 → 아래 4절 |
| 관심 카드 | 등록 = 카드 상세 하트 → localStorage `sk_wish` (로그인 없이). 목록 `/my/wishlist` | `components/market/WishButton.tsx:29-80`, `lib/personal-store.ts`, `app/my/wishlist/WishlistView.tsx` | `button[aria-label="관심 추가"]` → `[aria-pressed=true]`. 목록 화면은 비로그인이면 `rpc get_wishlist_preview`(POST, 읽기) 호출 |
| 시세 알림 | 카드 상세 "알림" 칩 → 시트("시세 알림 받기") | `components/watch/WatchButton.tsx`, `WatchSheet.tsx`(목표 가격 `[aria-label="목표 가격"]`, 라디오 `[role=radio]`, 제출 "알림 만들기" `:332`), 클라 `lib/watch/client.ts` | 로그인 불필요(기기 토큰 `x-watch-token`). 열 때 `GET /api/watch?kind=card&id=…` 로 현재 값 읽음. **"알림 만들기" = POST /api/watch → 반드시 가로채기** |
| 모바일 홈 | `/` (390) | 동일 + 하단 탭바 `MobileTabBar.tsx:19` `nav[data-mobile-tabbar]` | 하단 고정 탭바(홈·시세·등급·마켓·마이) — 전체 캡처 시 가림 주의 |
| 모바일 검색 | `/search` | `SearchHub.tsx` | 모바일은 `/search` 가 탭바 "시세" |
| 모바일 카드 상세 | `/cards/[id]` | 동일 | 하단 탭바·`data-mobile-tabbar` |
| 상태: 검색 한 글자씩 | 홈 `#home-search` 에 `type` 지연 입력 | `useSuggest`(로컬 사전 0ms + 서버 롱테일 `/api/suggest`) | 4단계 예: `ㄹ` → `ㄹㅈ` → `ㄹㅈㅁ` → `리자몽`. 라이브 `/api/suggest?q=ㄹㅈㅁ` 에서 "리자몽·리자몽 ex·…" 반환 확인 |
| 상태: 차트 기간 전환 | 기간 탭 7일→30일→90일→전체 | `MarketTrendChart.tsx:469-483` | 일본 카드 `pokemon-card-jp-32317`(5일치, 점 5개)·한글 `…BS2014001001`(8일치). 데이터가 적어 7일 이후 차이 작을 수 있음 |
| 상태: 관심 등록 | 하트 클릭 | `WishButton.tsx` | `aria-pressed` false→true, 하트 스케일 펄스 260ms(`:62-71`) |

기타 메모: 모바일/데스크톱 상단 `GlobalHeader` 는 sticky(`AppShell.tsx:30`) → header.png 대상. 데스크톱 주요 nav 는 `nav[aria-label="주요 내비게이션"]`(시세·커뮤니티·장터·등급·마이).

## 4. 테스트 계정
- 일반 구매자 계정: **없음**(필요도 없음 — 관심·알림이 비로그인으로 동작).
- 대표 테스트 샵: 샵 `sealkitt-test-shop`(status=live·is_test·verified·seal A), 오너 계정 이메일 변수 **`SHOP_TEST_EMAIL` / `SHOP_TEST_PASSWORD`**, 위치 `/home/dev/sealkitt/.env.local`(비출력·미커밋). 근거 `PROGRESS.md:1953`, 사용처 `scripts/verify-f5d.mjs:114-115`(로그인 폼 `#identifier`·`#password`). 이 값이 실제로 .env.local 에 있는지는 값을 읽지 않아 미확인.
- 관리자: 환경변수 `ADMIN_EMAILS`·`ADMIN_USER_IDS`(이름만). 별도 문서화된 관리자 테스트 계정은 못 찾음.
- 주의: 로그인(`POST {SUPABASE}/auth/v1/token`)은 인증 스키마에 세션 행을 남긴다(운영 DB 쓰기). 샵 페이지를 찍으려면 이 쓰기를 예외로 허용할지 결정 필요. 샵 페이지가 필수가 아니면 `/for-shops` 로 대체 권장.

## 5. 쓰기 위험

### 5-1. GET 만 해도 서버에서 운영 DB 쓰기가 나는 경로
| 경로 | 쓰기 내용 | 근거 | 회피 |
|---|---|---|---|
| `/search?q=<검색어>` (페이지 GET) | `rpc log_search_term`(검색어 집계) | `app/search/page.tsx`(`logSearchTerm(q)`), `app/search/actions.ts:21-39` | 요청 헤더 `x-sealkitt-verify: 1` 이면 건너뜀(`actions.ts:25`) |
| `GET /api/search?q=` | `rpc log_search_event`(응답 뒤 `after()`) + 속도 제한 카운터 `rpc api_rate_take` | `app/api/search/route.ts:25,50-66`, `lib/rate-limit.ts:207` | 헤더 `x-sealkitt-verify: 1` 이면 log_search_event 만 건너뜀. **속도 제한 카운터는 못 피함** |
| `GET /api/suggest?q=` | `rpc api_rate_take`(카운터) | `app/api/suggest/route.ts:57` | 못 피함(서버→DB). 로컬 사전(`/api/suggest-dict` 로 받은 IndexedDB 사전)이 1차 응답이라 서버 호출은 롱테일일 때만 |
| `GET /api/ebay-quote?cardId=`, `/api/ebay-listings`, `/api/ebay-sealed-quote`, `/api/snkr-sealed` (카드·밀봉 상세가 클라에서 호출) | 캐시 미스 때만 `ebay_cache_put`·`ebay_budget_take`·`ebay_quote_snapshots.insert`·`snkr_refresh_claim` | `app/api/ebay-quote/route.ts:61,105,156,167`, `app/api/ebay-sealed-quote/route.ts:93-141`, `app/api/snkr-sealed/route.ts:41,68` | 일반 방문자와 같은 동작(6h 공유 캐시). 막으려면 해당 GET 을 abort 하거나 빈 응답으로 fulfill — 단 화면에서 eBay 섹션이 비게 됨(`EBAY_V2_ENABLED` 가 꺼져 있으면 아무 쓰기 없음, 미확인) |
| 카드 상세 `RecordCardView`(`rpc record_card_view`, supabase-js POST) · 밀봉 상세 `RecordProductView`(`record_product_view`) · `RecordRecentView` | 열람 집계 1행 | `components/cards/RecordCardView.tsx:14-28` | `navigator.webdriver` 이거나 UA 에 headless/playwright 면 **사이트가 스스로 안 보냄**(`lib/session.ts:36-40`). 그래도 `page.route('**/rest/v1/rpc/record_*')` 로 가짜 204 권장 |
| `LiveViewers`(카드 상세) | Supabase Realtime presence 채널 `card-presence:<id>` track(웹소켓, DB 행 아님) | `components/cards/LiveViewers.tsx:28-44` | DB 쓰기 아님. 막으려면 `**/realtime/**` 웹소켓 차단(접속자 수 표시가 사라짐) |
| 홈 `ReturningStrip` | 로컬 목록 있을 때만 `POST /api/revisit` (읽기 전용, 5-2) | `components/home/ReturningStrip.tsx:41` | — |
| 서버 쪽 `proxy.ts` | 세션 쿠키 갱신(비로그인 무쓰기) | `proxy.ts` | — |
- 그 밖의 페이지 렌더(홈·카드 상세·마켓·`/shops`)에는 DB 쓰기를 확인하지 못했다(`app/cards`, `app/shops`, `app/market`, `components/home` 의 insert/upsert/update/rpc grep 결과 비어 있음. `app/cards/actions.ts:217 reportPrice`·`:67 requestPriceRefresh`·`:128 requestBrgPop` 는 버튼 클릭 때만).

### 5-2. 가로채야 하는 쓰기(POST/PATCH/PUT/DELETE) — 촬영 중 나올 수 있는 것
- `POST /api/watch`(알림 만들기), `DELETE /api/watch`, `PATCH /api/watch`, `POST /api/watch/push`, `POST /api/watch/open`(`app/api/watch*/route.ts`) — 응답 예: `{"id":1,"token":null,"signedIn":false}`; push 는 204/`{ok:true}`. 가짜 응답이 `{token}` 을 안 주면 클라가 토큰 없이 다음 GET 에서 `rules:[]` 로 돌아간다 — 시트에는 "켜 둔 알림" 목록이 안 채워질 수 있으니 장면 설계 때 확인.
- `POST /api/engage`(`lib/engage.ts:15`, wish_add 등 비콘 — webdriver 면 자체 스킵), `POST /api/shop-events`(`lib/market/events-client.ts:19` — webdriver 면 스킵), `POST /api/coverage-request`(`SearchHub` 결과 없음의 "추가 요청" 버튼), `POST /api/newsletter`(`NewsletterForm`), `POST /api/shops/listing-photo`·`/api/shops/eval-photos`(샵 전용).
- supabase-js 직접 쓰기(로그인 시): `rest/v1/user_wishes`(insert/delete)·`rpc/wish_merge`(`lib/wishlist.ts:16-55`), `rpc record_card_view|record_product_view`, `auth/v1/*`. 서버 액션 쓰기: `requestPriceRefresh`·`requestBrgPop`·`reportPrice`(`app/cards/actions.ts`).

### 5-3. 읽기인데 POST 인 요청 — 가로채기에서 **예외(통과)** 로 둘 목록
| 요청 | 어디서 | 읽기 근거 |
|---|---|---|
| `POST /api/revisit` | 홈 `ReturningStrip`(내 관심·최근 본 상품의 대표 시세) | `app/api/revisit/route.ts:1-30` — "개인 목록을 서버에 저장하지 않는다 · 요청마다 계산", DB select 뿐 |
| `POST {supabase}/rest/v1/rpc/get_wishlist_preview` / `get_my_wishlist` | `/my/wishlist`(비로그인·로그인) | `app/my/wishlist/WishlistView.tsx:90,99`, 이름이 get_*, 읽기 RPC |
| Next 서버 액션 POST(헤더 `Next-Action`): `loadCards`·`loadCardFacets`·`loadSetsForGame`·`loadSetGroupsForGame`(카드 목록 `/cards`·세트 선택 시트), `resolveRecentCards`(검색 제로 상태), `getPriceRefreshState`·`getBrgPopState`(카드 상세 버튼 마운트, 비로그인은 `rpc` 호출 전에 중립값 반환 `app/cards/actions.ts:42-52,103-113`) | `/cards`, `/search`, 카드 상세 | 읽기. 서버 액션은 URL 이 같아서 **함수 이름을 URL 로 구분 못 한다** → 일괄 차단하면 목록·최근 본 카드가 비어 버린다. 쓰기 액션(`requestPriceRefresh`·`requestBrgPop`·`reportPrice`)은 버튼을 누를 때만 호출되므로 촬영 시나리오에서 그 버튼을 누르지 않는 것으로 막는 편이 안전(액션 id 는 빌드마다 바뀌어 화이트리스트 불가) |
- GET 으로 나가는 읽기(`/api/suggest`, `/api/suggest-dict`, `/api/search`, `/api/printings`, `/api/market-preview`, `/api/nav-signals`, `/api/watch?kind=&id=`)는 POST 가로채기 대상이 아님.
- 같은 원본 호출을 막지 않고 통과시켜도 되는 서드파티: 폰트·이미지(`/_next/image`, `*.supabase.co/storage/v1/object/public/card-images/...`, `/storage/v1/render/image/...`).

## 6. 가림 대상
- **푸터(모든 페이지, 맨 아래)** `components/layout/Footer.tsx`:
  - 운영자 정보 `dl[aria-label="운영자 정보"]`(`:78-92`) 통째로 숨기기/지우기 — 항목: 상호·대표자(이름)·사업자등록번호·통신판매업 신고·주소·전화·이메일(`support@…`)·호스팅 (`components/legal/OperatorInfo.tsx:21-39`, 값 출처 `lib/operator.ts`). 사업자 정보 확인(공정위) 링크도 같은 dl 안.
  - 푸터 링크(이용약관 등)와 문구는 유지 가능. `footer` 자체를 `visibility:hidden` 으로 해도 되지만 전체-캡처에서 하단 빈 공간 생김 → dl 만 제거 권장.
- 푸터 외: 화면 속 도메인·URL 글자 — 홈/카드의 출처 링크 텍스트, "KREAM에서 보기"류 외부 링크 문구(도메인 글자 직접 노출은 확인 못 함), `/for-shops` 의 예시 카톡 문구. 저장 전 DOM 정규식 스캔(전화·이메일·도메인)으로 확인할 것.
- 샵 정보 시트(`ShopInfoSheet.tsx:29-33`): 대표자·사업자등록번호·사업장 주소·사업장 전화 — 공개 샵이 없어 라이브에는 안 나옴(테스트 샵을 찍을 때만).
- 커뮤니티 글(`/community`, 카드 상세의 `CardCommunityPosts`): 작성자 닉네임 `p.author?.nickname`(`components/community/CardCommunityPosts.tsx:35`) → `user***`.
- 채팅 위젯·알림 벨: **비로그인 땐 아예 렌더 안 됨**(`GlobalHeader.tsx:117-118`, `ChatSlot.tsx:80`). 로그인했다면 숨김.
- 쿠키 배너: 운영에서 **안 뜸**(`GA_MEASUREMENT_ID`·`ADSENSE_PUBLISHER_ID` 미설정 → `ConsentRoot` null, `ConsentRoot.tsx:50`; 라이브 HTML 에 '쿠키' 0건).
- 토스트: `components/compare/Toaster.tsx`(비교 담기·복사 등 동작 뒤에만), 하단 비교 바 `components/compare/CompareBar.tsx`("비교 담기" 클릭 때만), 하단 탭바(모바일 고정, `nav[data-mobile-tabbar]`) — 필요 시 숨김. iOS 설치 안내 시트(`IosInstallSheet`)는 iOS Safari UA 에서 관심 첫 추가 때만 뜸.
- Vercel 툴바·dev 배지: 운영 도메인엔 없음. `next dev` 로컬이면 `[data-nextjs-toast]`·개발 오버레이 숨김 필요(로컬 안 쓰면 무관).
- 스크롤바 숨김은 촬영 도구 쪽 처리(사이트에 별도 훅 없음).

## 7. 사실 후보 (자막용)
라이브 확인값은 2026-11-05 22:4xZ 기준. 근거 없는 건 '미확인'.

1. **지원 게임 3종**: 포켓몬·원피스·유희왕 — `lib/types.ts:969-973` `GAME_LABEL`.
2. **언어(나라) 3종**: 한글판·일어판·영문판 → 한·미·일 시세 축 — `lib/types.ts:9-13` `LANGUAGE_LABEL`, 차트 축 `MarketTrendChart.tsx:301` (kr/jp/us). 사이트맵 카드 분할: pokemon ko/ja/en · onepiece ko/ja/en · yugioh ko/en(8개) — `https://sealkitt.com/sitemap-index.xml`.
3. **카드 수**:
   - 확정 총수: **미확인**. 읽기 전용 쿼리(실행 안 함): `select count(*) from cards where merged_into is null;` 및 `select game, language, count(*) from cards where merged_into is null group by 1,2;` (`merged_into` 는 `proxy.ts` 병합 카드 구분 컬럼).
   - 참고(오래됨): 코드 주석 "프리렌더 목록 비우고(77,068장)" `app/cards/[id]/page.tsx:13`, 2026-07-30 재베이크 77,068장(`PROGRESS.md:1675`) — **2026-07 시점 수치, 현재와 다를 수 있음**.
   - 공개 확인 가능한 하한: 사이트맵에 올라 있는 색인 대상 카드 URL **30,622개**(8개 사이트맵 합, 2026-11-05 curl; 색인 제외 카드는 빠짐 → "총 카드 수" 라고 쓰면 틀림) · 밀봉 상품 사이트맵 2,616개.
4. **시세 수집 주기: 매일(일 1회) 자동 수집** — 서버 crontab(UTC): 국내 번개장터 `30 22 * * *`(df4-kr-bunjang), 일본 야후옥 `0 21 * * *`·유유테이 `0 12 * * *`, 미국 TCGplayer `30 18 * * *`(tcg-price-refresh)·`0 21 * * *`(tcgcsv-sync), 환율 `0 18 * * *`, eBay 호가 `40 19 * * *`(+ GitHub Actions `.github/workflows/ebay-snapshot.yml:17` `40 18 * * *`), 박스 EV `40 21 * * *`. 근거 `crontab -l`(이 서버, `cron-guard.sh <이름>` 로 감싼 줄들). `vercel.json` 에는 cron 없음. 화면 근거: 홈 "11월 4일 기준 · 직전 스냅샷 대비" 문구, 카드 상세 "11월 4일 기준".
5. **입점(검증)샵 수: 공개 0곳** — `/shops` "아직 공개된 검증샵이 없어요"(라이브 HTML), `lib/queries.ts:541-550` `getShops()` = `status='live' and is_test=false`. 검증 쿼리(실행 안 함): `select count(*) from shops where status='live' and is_test=false;`. 자막에 "입점 샵 N곳" 으로 쓰지 말 것.
6. **마켓 규모(화면에 표시되는 수)**: `/market/box` 상단 "번개장터 매물 카드 8,733 · 스니덩 출품 136,622"(씰킷 검증샵 아님 문구 동반), "시세 있는 밀봉" 박스 **2,796개**·팩 **1,293개**(`/market/box`, `/market/pack` HTML, 2026-11-05).
7. **환율 기준**: 1엔≈8.46원 · 1달러≈1,340원(11/5) — 홈·마켓·카드 상세 표시. 자막용이면 날짜 병기.
8. **시세 소스(코드 규약)**: US = eBay v2 호가 + TCGplayer 마켓가, KR = 번개장터, JP = 야후옥·遊々亭·SNKRDUNK(스니덩), PriceCharting 미사용 — `CLAUDE.md` "시세 소스(2026-09-23 대표 결정)". 화면 근거: 카드 상세 "다른 곳 매물 · 스니덩(일본) 판매 중 25건".
9. 검색 속도·자동완성: 홈 검색은 로컬 사전 0ms + 서버 롱테일 2티어(`components/home/HomeSearch.tsx:19-21`) — 초성(ㄹㅈㅁ→리자몽) 지원은 라이브 `/api/suggest` 로 확인.

## 8. 브랜드
- 주색(다크 기본): `app/globals.css:46-62` — bg `#0b0f14`(:47), surface `#151b24`, surface-2 `#1b2330`, border `#232b36`, text `#e6edf3`, muted `#8b98a5`, **accent(Seal Teal) `#14b8a6`**(:57), accent-hover `#0fa093`, 상승(레드) `#f5455c`(:61), 하락(블루) `#3b82f6`(:62). 라이트 테마는 `:root[data-theme="light"]`(`:200`) 별도 정의 — 라이브 기본은 다크(홈 SSR `sk_theme` 쿠키 의존, 미확인).
- 폰트(`globals.css:82-83`): 본문 **Pretendard**(`public/fonts/PretendardVariable.woff2`, 서브셋 `public/fonts/sk/pretendard-{brand,kr,kana,latin}.*.woff2`), 디스플레이 **Space Grotesk**(`public/fonts/SpaceGrotesk-Variable.woff2`, `sk/space-grotesk-latin.*.woff2`).
- 로고 원본: 심볼 SVG `/home/dev/sealkitt/app/icon.svg`(틸 사각 + 씰 한 획, fill `#14B8A6`·stroke `#0B0F14`) · 앱 아이콘 PNG `public/brand/app-icon-{120,512,1024}.png`, `public/icons/{icon-192,icon-512,maskable-512,apple-touch-icon-180}.png` · 워드마크는 SVG **컴포넌트로 그려짐**(`components/brand/Wordmark.tsx`, `SealGlyph.tsx`의 `SEAL_PATH`) — 독립 svg 파일 없음(촬영으로 대체하거나 컴포넌트에서 outerHTML 추출). 참고 이미지 `public/brand-ref/{seal-gemini,wordmark-ligature,wordmark-outline,wordmark-stamp}.png`(디자인 레퍼런스).
- 히어로·제품 이미지: 히어로 배경 `public/hero/{a,b,c}/{dark,light}-{390,768,1024,1440}.{avif,webp}`(홈 히어로 변형은 DB 스위치 `getHomeHeroVariant`, 현재 변형 미확인 — 라이브 홈 히어로는 시세 단 카드 팬(card-images 이미지)). 카드 뒷면 `public/cards/backs/sealkitt.{png,webp}`. 카드·밀봉 이미지는 Supabase Storage 공개 URL(`brpkvdtcddxgxkorkrla.supabase.co/storage/v1/object/public/card-images/...`) — 저작권은 각 권리자(푸터 문구) → media/ 에 카드 원본을 넣는 것은 신중히.

## 9. 다른 세션 점유
- `git worktree list`: 본체 `/home/dev/sealkitt` [feat/sh-1-shop-platform ceedfdd3] + `.claude/worktrees/` 5개(`w21-f8cbrej`, `w21-pokejp2`, `w21-w341-other33`, `w21-w341-ratio`, `w21-w341-snkr43`). 건드리지 말 것.
- rc 세션: tmux `-L rc-sealkitt` 세션 `sealkitt`(pid 1485). **sealkitt 의 next dev/start 서버는 지금 없음**. 포트 8781·8782 에 node 2개가 떠 있는데 cwd 가 `/tmp/sealkitt/run/w338/bundle-v24`(8781)·`/home/dev/sealkitt/references/design/seal-slab-2026-10-26`(8782) 인 sealkitt 세션 소유 정적/미리보기 서버 — 건드리지 말 것.
- 다른 프로젝트 next-server 점유 포트: 3311·3312(Medimajor worktree), 3475·3491·3493·38791(safefile·gochingphone 등) — 건드리지 말 것.
- 로컬 띄운다면 빈 포트 후보(확인 시각 22:5xZ): 3000, 3100, 3101, 3200, 4173, 5173, 8791, 8792, 9101, 9102 (띄우기 직전 `ss -ltn` 재확인). 단 1절 결론대로 로컬 실행은 필요성이 낮다.
- 서버 crontab 의 야간 수집 창(UTC 12:00·16:30–22:30 등)이 라이브 DB 를 문다. 라이브 촬영은 큰 영향 없지만, 레포 규약상 "라이브 DB 를 무는 검증 배터리는 수집 창과 겹치지 말 것"(`CLAUDE.md` 리소스 규약 v2 ②) — 촬영 트래픽이 가벼우므로 참고만.

## 10. 명세와 코드가 다른 점 (요약)
1. "입점 샵 페이지": 공개 샵 0곳, `/shops` 는 빈 상태, `/shops/[slug]` 는 live·비테스트 샵이 없어 공개 URL 없음. 테스트 샵은 로그인한 오너/운영자만. 명세의 "화면 속 공개된 상호는 그대로 둔다" 에 해당하는 샵 상호가 없다.
2. "한·미·일 시세, 나라 탭 전환": 한 카드의 "나라 탭" 은 시세 추이 차트의 축 탭이고(이름 "시세 축 선택": 국내/일본/TCGplayer), 두 축 이상 활성인 카드가 확인되지 않았다. 한국·일본·미국 값이 함께 보이는 화면은 카드 상세의 "같은 카드 · 다른 언어판 시세" 스트립(언어판별 한 시장 값)이고, 언어판 전환 UI 는 같은 화면 탭이 아니라 다른 카드 URL 로 가는 링크(`nav[aria-label="언어판 전환"]`).
3. "관심 카드·시세 알림(테스트 계정)": 관심은 비로그인 localStorage, 알림은 비로그인 기기 토큰으로 동작 → 테스트 계정 불필요(알림 생성 POST 만 가로채기). `/watch` 라우트 없음(알림 = 시트).
4. "실거래/호가 구분": 별도 탭이 아니라 값마다 붙는 성격 라벨(호가·실거래(중앙값)·마켓가·감정품)과 홈의 "각 값은 무엇인가요" 안내.
5. "마켓 목록": `/market` 은 `/market/box` 로 307 리다이렉트. 라이브 데이터가 있는 것은 "시세 있는 밀봉"(박스·팩)이고, 검증샵 매물 영역은 전부 빈 상태 문구. `/market/single` 은 본문이 거의 비어 있음.
6. "시세 알림" UI 이름: 칩 "알림", 시트 제목 "시세 알림 받기", 제출 버튼 "알림 만들기"; "관심" = 하트 `관심 추가`.
7. "초성 검색·카드 번호 검색": 별도 화면이 아니라 같은 검색창(홈 히어로 `#home-search` / `/search`)이 초성·카드번호를 모두 처리하며 결과는 `/search?q=`.
8. "봇 확인 화면이 뜨면 로컬 실행": 라이브에서 안 뜸 → 로컬 불필요(로컬은 어차피 운영 DB 를 가리킴).
9. "사실: 입점 샵 수": 공개 0 — 자막 근거로는 "입점 무료·수수료 0%" 문구(`/for-shops`)가 가능하나 수치는 없음.
10. 명세의 안전 문구 "운영 DB에 아무것도 남기지 않는다": POST 가로채기만으로는 부족 — GET 검색·eBay 조회가 서버에서 로그·캐시·속도 제한 카운터를 쓴다(5-1). `x-sealkitt-verify: 1` 헤더(동일 출처 요청에만 `page.route` 로 추가, supabase.co 에는 붙이지 말 것 — CORS 사전 요청 실패)로 검색 로그는 막을 수 있으나 속도 제한 카운터는 못 막는다 → "가로챈 POST 외 쓰기 0" 합격 기준은 이 카운터를 예외로 보고해야 한다.

## 부록: 촬영 권장 URL 세트 (조사 결과 기반)
- 데스크톱: `/`, `/search?q=ㄹㅈㅁ`(초성) · `/search?q=OP01-120`(번호), `/cards/pokemon-card-jp-32317`(JP 실거래·낙찰 표·차트), `/cards/pokemoncard-ko-BS2014001001`(KR 호가·차트·언어판 비교), `/market/box`, `/for-shops`(샵 대체), `/my/wishlist`(관심 담은 뒤).
- 모바일: `/`, `/search`, `/cards/pokemon-card-jp-32317`.
- 상태 흐름: 홈 `#home-search` 입력 4단계, 기간 탭 4단계(7→30→90→전체), 관심 하트(+ `/my/wishlist` 결과), 알림 시트(열기→목표가 입력→만들기 가짜 성공).
