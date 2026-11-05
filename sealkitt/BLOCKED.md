# sealkitt BLOCKED / 보고할 것

## A. 못 채운 것(명세와 실제가 다른 것)
1. **입점 샵 페이지 — 공개 샵 0곳**
   - 사유: 라이브 `/shops` = "아직 공개된 검증샵이 없어요", 카드 상세 "이 카드 파는 검증샵" 도 빈 상태. 유일한 샵 `sealkitt-test-shop` 은 `is_test` 라 비로그인 404, 오너 로그인은 인증 세션 행을 남기는 쓰기라 하지 않았다(지시: 로그인 안 함). 코드 근거 `lib/queries.ts:541-550`(`status='live' and is_test=false`), `app/shops/[slug]/page.tsx:33,80`.
   - 시도(2번): ① `/shops`·`/market/box` 의 검증샵 영역 GET(전부 빈 상태) ② `/shops/sealkitt-test-shop` 은 RECON 시점에 404 로 확인돼 다시 열지 않음.
   - 대안(촬영함): `/for-shops` 입점 안내 랜딩(`desktop/for-shops-*`) + `/shops` 빈 상태(`desktop/shops-empty-*`). 샵 상호·샵 상세 화면은 없다 → 영상에서 "입점 샵 N곳" 자막 불가(facts 5번).
2. **시세 축(나라) 탭 전환** — 해결(대체 카드): RECON 의 100장에는 두 축이 켜진 카드가 없었으나 원피스 카드 1,450장 전수 확인에서 167장이 2축(facts 7번). `optcgapi-OP13-007`(국내+일본)으로 `states/axis-tabs-kr-jp/`(국내→일본→국내) 촬영. 3축이 전부 켜진 카드는 없다(원피스 전수 0장, 포켓몬·유희왕은 표본 197장 + 포켓몬 한글판 2,881장 확인에서 2축 이상 0장) → TCGplayer 탭까지 도는 3축 전환은 불가.
3. **모바일 header.png 없음** — 모바일 상단 헤더는 고정(fixed/sticky)이 아니라 스크롤되어 사라진다(도구가 고정 헤더를 못 찾음). 데스크톱은 `desktop/header.png` 있음.
4. **관심 카드 목록의 '목표가'·알림 목록 화면은 로그인 전용 기능 일부**: 시트의 "켜 둔 알림" 목록은 가짜 POST 응답이 기기 토큰을 주지 않아(`token:null`) 다음 GET 이 `rules:[]` 로 돌아오므로 채워지지 않는다(RECON 5-2 예상대로). 알림 생성 후 안내 문구까지만 촬영(`states/watch-alert/04-created.png`).

## B. 운영 쓰기 가능성 — 정확히 (보고할 것)
- **가로챈 비GET**: `POST /api/watch`(가짜 `{id:1,token:null,signedIn:false}`) 1 + `PATCH /api/watch`(가짜 200) 1 = 2건(`states/watch-alert/*.json` `intercepted`). 그 밖의 가로챔 0건. 사이트가 `navigator.webdriver` 면 `/api/engage`·`/api/shop-events`·조회 기록 비콘을 스스로 건너뛰어 요청이 나가지 않았다(`lib/session.ts:36-40`). 서버 액션 쓰기(`requestPriceRefresh`·`requestBrgPop`·`reportPrice`)와 `알림 끄기`·`목표가` 버튼은 누르지 않았다.
- **허용한 비GET(읽기)**: `POST {supabase}/rest/v1/rpc/get_wishlist_preview`(관심 목록 읽기 RPC) · Next 서버 액션 `POST /my/wishlist`(헤더 `Next-Action`, 본문 `[]`, 비로그인이라 `getMyEntryPoints` 류가 사용자 없음으로 일찍 반환 — 읽기). `/api/revisit` 는 허용했지만 호출되지 않음.
- **검색 로그(`log_search_term`·`log_search_event`)**: 동일 출처(sealkitt.com) 요청에만 `x-sealkitt-verify: 1` 을 붙여 서버가 건너뜀(`app/search/actions.ts:25`, `app/api/search/route.ts` 의 `verify`). supabase.co 요청에는 헤더를 붙이지 않았다.
- **속도 제한 카운터는 DB 에 쓴다 (헤더로 못 피함)**: `/api/search`·`/api/suggest` 는 요청마다 `rpc api_rate_take` 로 `public.api_rate_hits` 를 upsert(`supabase/migrations/0190_api_rate_limit.sql:40-41` `insert … on conflict do update`, 호출부 `lib/rate-limit.ts:207`, `app/api/search/route.ts:25`, `app/api/suggest/route.ts:57`). 키는 IP(HMAC) 단위 슬라이딩 윈도(2칸·60초), 24시간 지난 행은 삭제(`0224_api_rate_hits_ttl.sql:37`). 한도 search 150/분 · suggest 70/분 — 이 촬영은 한도에 한참 못 미침(아래 호출 수). 우회 헤더(`x-sealkitt-rl-bypass`)는 비밀값이라 쓰지 않았다.
- **호출 수(세션 합계, `tmp/sk-tally.jsonl`)**: `/api/suggest` GET: 자동완성 상태 흐름 데스크톱 6 + 모바일 6 + seq 자동완성 3 = 15, 입력이 매번 달라 같은 입력 반복 없음 · 검색어 3개(데스크톱 `ㄹㅈㅁ`·`OP01-120`, 모바일 `ㄹㅈㅁ`) 각각 `/search?q=` 문서 GET 1 + `/api/search` GET 1 = 6요청(둘 다 속도 제한 카운터 대상). `/api/suggest-dict`(정적 사전) GET 2.
- **eBay·스니덩 GET(캐시 미스 때 서버가 캐시·예산 행을 쓸 수 있음)**: 카드 상세를 열면 클라이언트가 `/api/ebay-*`·`/api/snkr-*` GET 을 자동 호출한다(일반 방문자와 같은 동작, 6시간 공유 캐시). 막으면 화면의 eBay 섹션이 비므로 막지 않았다. 카드 상세를 연 횟수: 스크립트별 합산 — 데스크톱 페이지 3·관심/알림 7·상태 흐름 10·seq 1·모바일 2·알림 시트 1 (총 24회, 같은 카드 반복). 캐시 히트면 쓰기 없음, 미스는 `ebay_cache_put`·`ebay_budget_take` 쓰기 가능성(미확인, `EBAY_V2_ENABLED` 상태 미확인).
- **Supabase Realtime presence**(카드 상세 `LiveViewers`): 웹소켓 `card-presence:<id>` 접속(DB 행 아님, 접속자 수 표시에 우리 브라우저가 잠시 집계됨).
- **로그인**: 하지 않음(0회). 새 계정·비밀번호 변경 없음.
