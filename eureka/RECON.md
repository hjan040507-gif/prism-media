# eureka(유레카 설비 & 누수탐지) 촬영 전 사전 조사 — RECON

조사 시각 2026-11-06 07:30~08:00Z · 읽기 전용(운영 GET/HEAD `curl` + 번들 정적 파일 GET + 이 서버 파일 이름·문서 읽기). 브라우저·로그인·폼 제출·POST 0, 비밀값 기록 0.
소스 저장소 없음(지시 확인). 근거는 운영 HTML(RSC 페이로드 포함)·JS 번들(GET)·브리프(`~/hongjun-journey/docs/CONTENT/briefs/eureka-leak.md`)·기존 캡처 1장. 번들 사본은 세션 scratchpad(임시)이고 이 폴더에는 두지 않았다. 번들 근거는 `파일명(번들 해시)` 로 적는다(소스 줄 번호 없음).

## 0. 먼저 알아야 할 것 (촬영 방식을 바꾸는 사실 7개)

1. **`leak-site.vercel.app` 은 죽었다.** 모든 경로가 404 「삭제된 이전 주소 — 노모어누수 공식 홈페이지로 이동」(링크 → `https://nomorenusu.com/`, `x-robots-tag: noindex`). 운영은 커스텀 도메인 **`nomorenusu.com`** 이다(canonical·og:url·sitemap 모두 이 도메인). 같은 프로젝트 근거: 이 서버 `~/easysite/public/portfolio/nomorenusu.png`(2026-06-24, 1280×748)가 「유레카 설비 & 누수탐지」 로고에 히어로 캐러셀 + 우측 LIVE 현황판 구성인데 라이브 도메인이 같은 `nomorenusu.com`(`~/easysite/src/config/portfolio.ts:113-121` `name:'유레카 누수탐지'`, `url:'https://nomorenusu.com'`). 브리프 §9 「vercel.app 링크 금지」는 해당 없어졌다(도메인이 이미 easysite 포트폴리오에 공개 링크).
2. **상호가 바뀌었다.** 라이브 HTML 전체에 「유레카」 0건, 상호는 「노모어누수」(`<title>`·로고·푸터·JSON-LD). 대표번호도 6월 캡처와 다르다(두 번호 모두 여기 적지 않는다). 지시·브리프의 「유레카」 표기와 화면 글자가 다르다 → 영상 자막 상호는 결정 필요(§10-1).
3. **라이브는 브리프가 설명한 Vercel+Next 빌드가 아니다.** `server: cloudflare`, `x-vinext-cache`·`/_next/static/chunks/vinext-*.js`(Next API 호환 Vite 런타임) — Cloudflare 위 Vinext. 브리프에 없는 기능이 있다: 동 단위 지역 랜딩(`/seoul/:district/:dong`), 자동 게시·IndexNow·카카오 연동 관리자, `llms.txt`, `feed.xml`. 이 사이트가 우리가 납품한 코드 그대로인지는 **미확인**(소유 이전·개편 가능).
4. **「실시간 작업 현황판」은 데모 모드다.** 번들에 `NEXT_PUBLIC_LIVE_BOARD_DEMO:"true"`(`business-BGkla3ba.js`), HTML 의 초기 행 34개 중 32개가 `id:"d001"~"d032"`(DB uuid 아님)이고 시각이 렌더 시점 기준으로 몇 초~며칠 전으로 깔려 있다. 나머지 2행만 uuid(2026-09-10, 이름 「카o트」). 게다가 클라이언트가 2.5초마다 초기 목록에서 행을 새로 끼우고(`NEW` 핀 2초) 1.5초마다 무작위 행의 상태를 한 단계 올린다(`LiveStatusTableClient-BoI8U-dm.js`, 호버하면 멈춤). → 자막에 「관리자가 상태를 바꾸면 공개 반영」·「실제 접수」라고 쓰면 화면과 다르다. 관리자 쪽에는 같은 보드용 수동 입력 편집기(`/admin/live-board`: 이름·지역·카테고리·증상)와 접수별 노출/숨김 토글(`BoardVisibilityToggle`)이 있다.
5. **관리자는 계정이 없다 → BLOCKED 후보.** 로그인은 비밀번호 한 칸(`/admin/login` 「한 번 로그인하면 같은 브라우저에서 30일 유지」), 값은 Cloudflare 쪽 env(`ADMIN_PASSWORD`, 이름만 번들 스키마에서 확인)이고 이 서버엔 이 프로젝트 env·계정 파일이 없다(§4). 기존 관리자 캡처도 없다.
6. **쓰기 위험은 브라우저가 보내는 POST 둘이다**(§5): `POST /api/analytics/event`(페이지뷰·스크롤·클릭마다) · 견적 서버 액션 `submitQuote`. 둘 다 `page.route` 로 가로채야 한다. GA4 는 라이브에서 **꺼져 있다**(§7).
7. **히어로 캐러셀은 JS 타이머(2.8초)라 `page.clock` 으로 제어 가능**(§3).

## 1. 스택·실행

| 항목 | 값 · 근거 |
|---|---|
| 호스팅·런타임 | Cloudflare 위 Vinext(Next 호환 · Vite/Rolldown 번들). 응답 헤더 `server: cloudflare` `x-vinext-cache` `x-nextjs-cache`, 청크 `vinext-CQkbclx9.js` `rolldown-runtime-*.js` |
| 프레임워크 | React 19 계열(`framework-*.js`), App Router 구조(라우트 표 `index-Dj7WVQLZ.js` 45개), Tailwind(`layout.BEvCr-a6.css` 토큰 `--color-brand-*`), 서버 액션(`fd26cd07cc37#submitQuote`) |
| DB·저장소 | Supabase(공개 URL·anon 키가 클라이언트 청크 `business-BGkla3ba.js` 에 인라인 — JWT role 디코드 결과 `anon` 1개, service_role 없음. 값은 기록하지 않음) |
| 로컬 실행 | **불가**(소스·env·마이그레이션 없음). 정적 HTML+청크 미러링으로 공개 화면 시뮬레이션은 가능하나 서버 액션·관리자는 안 된다 |
| env 이름(번들 스키마) | 공개: `NEXT_PUBLIC_SITE_URL` `_SITE_NAME` `_PHONE` `_KAKAO_CHANNEL(_URL)` `_BUSINESS_{LEGAL_NAME,REG_NO,ADDRESS,BIZ_TYPE,BIZ_CATEGORY,EMAIL}` `_EXPERIENCE` `_RESPONSE_TIME` `_SERVICE_AREA` `_SUPABASE_URL` `_SUPABASE_ANON_KEY` `_GA_ID` `_NAVER_VERIFICATION` `_GOOGLE_VERIFICATION` `_LIVE_BOARD_DEMO` · 서버: `SUPABASE_SERVICE_ROLE_KEY` `ADMIN_PASSWORD` `SESSION_SECRET` `GOOGLE_SITE_VERIFICATION` `NAVER_SITE_VERIFICATION` `KAKAO_REST_API_KEY` |
| 외부 요청(공개 화면) | 폰트 Pretendard `cdn.jsdelivr.net`(GET) · 카카오 오픈채팅 링크(클릭 금지) · Supabase 이미지(공개 GET). 픽셀·네이버 wcs·Meta 흔적 0(`fbq`·`wcs` 문자열 없음) |

## 2. 라이브 주소·상태 (`curl -sI/-s` GET/HEAD, 로그인 없음)

| URL | 결과 |
|---|---|
| `https://leak-site.vercel.app/` · `/robots.txt` · `/sitemap.xml` · `/apply` … | 404 「삭제된 이전 주소」(→ nomorenusu.com 안내) |
| `https://nomorenusu.com/` | 200, 348KB HTML, `s-maxage=3600 stale-while-revalidate` (캐시된 SSR) |
| `/?city=gangnam` · `/?city=seocho&utm_source=naver` | 200, **HTML 바이트가 `/` 와 동일**(§3) |
| `/posts` · `/posts/region/gangnam` · `/posts?page=N` | 200 (12건/쪽, 46쪽) |
| `/posts/20261031-october-extension-175` | 200, 157KB |
| `/seoul` · `/seoul/gangnam-gu` · `/seoul/gangnam-gu/daechi-dong` · `/seoul/dobong-gu/banghak-dong` | 200 |
| `/faq` `/privacy` `/terms` `/llms.txt` `/feed.xml` `/sitemap.xml` `/robots.txt` | 200 |
| `/admin` | 307 → `/admin/login`(200, `noindex`) |
| `/api/health` `/services` `/about` `/status` `/live` | 404(없음) |
| `/preview/cases/gangnam-floor-pipe`(라우트 표에는 있음) | 404 |

봇 확인·챌린지·403 없음. robots.txt: `/admin` `/api/` Disallow, Yeti·Googlebot 허용. sitemap 586 URL(홈 1 + `/posts` 1 + 지역 26 + 글 550 + `/seoul` 계열 8, 전부 `lastmod`).

## 3. 지시 항목 ↔ 실제 라우트·컴포넌트 (소스 줄 번호 없음 → 번들·HTML 근거)

| 지시 | 실제 | 촬영 메모 |
|---|---|---|
| 랜딩(지역명 파라미터 2종) | 단일 랜딩 `/`. **`?city=` 는 화면 글자를 바꾸지 않는다**(`/?city=gangnam` 응답이 `/` 와 바이트 동일). 값은 `sessionStorage['leak-site:utm']`(1시간)에 `utm_source·utm_campaign·city_code` 로만 저장돼 견적 폼 숨은 필드 `city_code`·`utm_source`·`utm_campaign` 으로 간다(`utm-CLNdrRNR.js`, `QuoteForm-CQd-VnOt.js`). **화면이 지역명으로 바뀌는 건 경로 방식**: `/seoul/<구>/<동>` 동 랜딩(제목 「대치동 누수탐지 …」, 「대치동 실제 시공사례」) | 예시 2개(경로형, 응답 확인): `/seoul/gangnam-gu/daechi-dong` · `/seoul/dobong-gu/banghak-dong`. 쿼리형은 `?city=gangnam`·`?city=seocho`(저장만, 허용 코드 목록은 미확인). 구 목록 `/posts/region/<slug>` 26개(서울 25구 + `bundang`) |
| 히어로 | 4장 슬라이드 `/about/{dispatch,rescue,estimate,consult}.png`(공개 GET 200), 하단 문구·해시태그는 DOM 텍스트. 우측(데스크톱)에 LIVE 현황판 | 브리프 §9: 히어로 일러스트는 클라이언트 제공·AI 생성물 → 캡션 처리 |
| 견적 신청 폼 | 홈 `#quote-form` 섹션(`section#quote-form`, 「30분 안에 회신 받기」). **단계 없는 한 장짜리 폼**: 이름(`#customer_name` 2~10자) · 연락처(`#phone`) · 지역(시·도 서울/인천/경기 → 시·구 2단 선택, `input[name=region]` 숨김) · 상세주소(`#apartment` ≤50자) · 증상(`#symptom` 10~500자) · 사진 첨부(`#images`, jpeg/png/webp, **선택·최대 3장·장당 5MB**, `capture=environment`, 썸네일은 objectURL) · 개인정보 동의 `input[name=agree]` · 제출 버튼. 성공 시 「신청 완료!」 상태 | 브리프의 「히어로 우측 sticky 리드폼」은 지금 없다(§10-3). **제출 = Next 서버 액션 `submitQuote`(id `fd26cd07cc37#submitQuote`)**: `POST <현재 페이지 URL>` + `Next-Action` 헤더, 본문 FormData(이미지 파일 포함). 가로챌 대상 = 홈 URL 로 가는 POST. 성공 화면은 서버 액션 RSC 응답으로만 바뀌므로 가짜 응답 형식을 먼저 가로막힌 상태(`route.fulfill`)에서 시험해야 한다 — 모든 POST 를 fulfill 하면 서버로 나가지 않아 시험이 안전하다 |
| 실시간 작업 현황판 | 데스크톱 히어로 우측 패널 + 모바일 하단(홈 `LiveStatusTableClient`, 5행 표시). 데이터는 **HTML 안에 내장된 초기 34행**(공개 GET API 없음, 별도 fetch 0). 컬럼: 분류(누수·변기·싱크대·난방·동파) · 시각(방금/N초 전/N분 전/오늘 HH:MM/어제/M월 D일) · 마스킹 이름(성+`o`+끝 글자) · 지역(시·구까지) · 상태 배지. 이름·지역 외 개인정보(전화·주소 상세) 노출 없음 | 데이터 소스 = 데모 32행 + DB 2행(§0-4). 시각이 `Date.now()` 기준이라 `page.clock.install` 로 고정 가능 |
| 게시판 목록·글 | 「작업사례」 = `/posts`(12건/쪽·46쪽·총 550건, 지역 칩 26개 `RegionChips`, 구별 `/posts/region/:region`), 글 `/posts/:slug`(제목·날짜·본문·공유·CTA) | 글 예시 `/posts/20261031-october-extension-175`(부천 심곡본동 옥상 누수). 글 본문에 카테고리가 영문 원문 `leak` 으로 보이는 곳이 있음(화면 표기 그대로) |
| 관리자(접수 목록·상태 4단계·상세) | `/admin/requests`(목록) · `/admin/requests/:id`(상세) · 상태 셀렉트 `RequestStatusSelect`(4단계) · 노출 토글 · `/admin/live-board` `/admin/posts(/new,/:id/edit,/:id/seo)` `/admin/reviews` `/admin/faq` `/admin/hero` `/admin/media` `/admin/calendar` `/admin/auto-post` `/admin/content` `/admin/search-visibility` `/admin/integrations/kakao` | **로그인 필요 → BLOCKED 후보**(§4) |
| seq: 히어로 캐러셀 | `HeroCarouselClient-BZLGeTaC.js`: 상태 `useState(index)` + `setInterval(…, 2800)`(홈에서 `intervalMs:2800` 전달), 슬라이드는 한 줄 flex 에 `translateX(-n*100%)` + `transition-transform duration-500 ease-in-out`. 마우스 진입·터치 시 일시정지. 화살표 버튼 있음 | 라이브러리(swiper) 아님 — 순수 CSS transition + JS 타이머. `page.clock.install()` 을 `goto` 전에 하고 `runFor(2800)` 으로 장면을 넘긴 뒤 실제 시간 600ms 대기하면 전환 중간·완료 프레임을 찍을 수 있다(추정: 시험 안 함). 같은 방식으로 현황판 2.5s/1.5s 타이머도 제어된다 |

## 4. 테스트·관리자 계정

| 역할 | 어디에 | 지금 쓸 수 있나 |
|---|---|---|
| 관리자 | 로그인 폼은 비밀번호 한 칸(`LoginForm-C20VbIzS.js`, `POST /admin/api/login`). 값은 서버 env `ADMIN_PASSWORD`(Cloudflare 쪽) | **없음.** 이 서버에서 이름으로 찾은 것: `~/secrets/{gongchinpon,jangu3-firebase-adminsdk.json,sinnae.env}` · `~/qa-creds/plangates-qa.json` — 전부 다른 프로젝트 이름. 파일명·내용 모두 eureka·nomorenusu·누수 관련 0(파일명 검색 `find ~ -maxdepth 4`, 일부 큰 폴더는 전문 검색이 시간 초과라 이름만 확인) |
| 소비자 | 없음(견적은 비로그인 제출) | 해당 없음 |

대안 자료(관리자): 기존 관리자 캡처 **없음** — `~/hongjun-journey`·`~/prism-portfolio`·`~/easysite`·`~/qa-archive`·`~/phase3-captures` 이미지 파일명 검색 0건(브리프 §7 의 관리자 목록·더미 8~10건도 문서 상 계획뿐). 존재하는 유일한 이 프로젝트 캡처는 `~/easysite/public/portfolio/nomorenusu.png`(공개 화면, 6월, 대표번호 노출 → 가림 필요).
관리자는 비밀번호 하나로 열리는 실고객 접수 화면이라 새 계정·로그인·열람이 모두 범위 밖이다. 사용자가 클라이언트 동의와 함께 비밀번호를 붙여 넣어 주는 경우에만 가능(그때도 실고객 이름·연락처·주소가 떠서 전 칸 가림 필수, 로그인 POST 가 세션을 만든다).

## 5. 쓰기 위험

**브라우저가 보내는 쓰기(가로챌 것)**
- `POST /api/analytics/event`(`traffic-analytics-upFxGuPJ.js`): 페이지뷰(`page_view`)·`click_call`·`click_kakao`·`cta_click`·`submit_quote`·`view_post`·`filter_region`·`scroll_50`·`scroll_90`·`click_post_cta` 마다 `{sessionId, eventName, path, acquisition, deviceCategory, metadata}` 를 보낸다(관리자 경로 제외). 서버 저장소(Supabase 추정)에 행이 쌓인다. 쿼리 `?analytics_test=1` 이면 `metadata.test=true` 가 붙는다(서버가 걸러 주는지는 미확인) → **`page.route('**/api/analytics/event', r => r.fulfill({status:204}))` 로 전부 막고**, 막기 전에는 페이지를 열지 않는다.
- `POST` 홈 URL + `Next-Action`(견적 `submitQuote`): 실제 신청 행 + 사진 업로드 + (관리자 카카오 연동 `dispatch` 가 있어) 대표에게 알림이 갈 수 있다 → 반드시 fulfill. 제출 버튼을 누르는 컷은 가로챈 뒤에만.
- 클릭 금지: `tel:`·카카오 오픈채팅 링크(`open.kakao.com/...`)·`/admin/api/*`.
**GET 이 서버에 쓰는지**: 홈·`/posts*`·글은 캐시된 SSR(`s-maxage=3600`)이고 코드로 볼 수 없어 **모름**(조회수 필드 호출은 `PostViewTracker` → 위 analytics POST 하나뿐, 서버 렌더가 쓰지는 않는 것으로 보임 — 추정). 현황판 데이터는 HTML 에 내장돼 있어 열람이 따로 쓰지 않는다.
**GA4·픽셀**: §7. 외부 유료 호출: 견적 제출 경로의 카카오 연동(추정) 말고 없음.

## 6. 가림 대상 (셀렉터 힌트 — 라이브 DOM 기준, 실제 촬영 때 다시 확인)
- 대표번호: 최상단 띠 「무료상담 365일…」 `a[href^="tel:"]`(헤더·히어로 CTA·플로팅 데스크톱·모바일 하단바·FAQ·견적 섹션·푸터), 푸터 「전화: …」, JSON-LD `LocalBusiness.telephone`(화면엔 안 보임).
- 사업자정보: 푸터 「사업자정보: …」(사업자등록번호), `/privacy`·`/terms` 의 상호·주소·번호. 주소는 번들·JSON-LD 에도 있음(화면 노출은 푸터/약관).
- 현황판 행: `ul[aria-live=polite] li` 안 이름 칸(`span.truncate`) + 지역 칸 — 마스킹돼 있지만 실행 2행(「카o트」)이 실제 고객일 수 있고, 후기 섹션의 「이o훈 님」「박o영 님」이 현황판 이름과 겹침 → 이름 칸은 전부 흐리게(지시 「현황판의 고객 정보」).
- 후기 카드의 이름·지역, 게시글 본문 속 구·동 지명은 마케팅 글이라 가림 대상 아님(판단 필요 시 구 단위만).
- 네이버 서치어드바이저 인증 메타 값, Supabase URL/anon 키, 카카오 채널 링크 — HTML 소스·개발자도구 캡처에서만 보이니 소스 보기 컷을 만들 때 가린다.
- 화면 속 주소 글자 `nomorenusu.com`(브라우저 주소창·og URL·소스 보기)는 가린다.

## 7. 사실 후보

| 사실 | 값 | 근거 |
|---|---|---|
| 상태 단계 | **4단계**: `pending 작업접수` → `quote 상담진행` → `active 작업출동` → `done 작업완료` | `database-CLYa9LSi.js`(`['pending','quote','active','done']` + 라벨), 관리자 `RequestStatusSelect-CKiDtga7.js`, 현황판 `LiveStatusTableClient`. 브리프의 「접수/견적발송중/작업중/작업완료」와 라벨이 다름 |
| GA4 이벤트 수 | 코드에 이벤트명 **10개 정의**, 호출처 있는 건 **9개**: `click_call` `click_kakao` `cta_click` `submit_quote` `view_post` `filter_region` `scroll_50` `scroll_90` `click_post_cta`(`outbound_click` 은 정의만, 호출 0). 계약서·브리프의 「5종」과 다름 | `analytics-BwsJN7lF.js`(상수표), 호출 청크 `CtaButtons`·`FloatingDesktop`·`MobileBottomBar`·`MobileMenu`·`PostCTABlock`·`RegionChips`·`PostViewTracker`·`QuoteForm`·`ScrollTracker`(`.X` 접근 개수 CLICK_CALL 5·CLICK_KAKAO 4·CTA_CLICK 4·나머지 1) |
| **GA4 가 실제로 켜져 있나** | **꺼져 있다**: `AnalyticsScript-Cr8dDt_u.js` 는 `NEXT_PUBLIC_GA_ID` 가 비면 아무것도 렌더하지 않는데 번들에 `NEXT_PUBLIC_GA_ID:{}.NEXT_PUBLIC_GA_ID`(= undefined)로 박혀 있고, 홈·글 HTML 에 `googletagmanager`·`gtag/js` 0건, `G-` 측정 ID 0건. 대신 자체 수집 `/api/analytics/event` 가 돈다 | 위 번들·HTML. 실제 브라우저 네트워크로 한 번 더 확인 필요(미검증) → 영상에 「GA4 N종 추적」을 쓰려면 결정 필요 |
| 게시글 수 | **550건**(`/posts` 46쪽 = 45×12+10, sitemap 글 URL 550 일치). 이 중 숫자 슬러그 일괄 생성형 약 444건(`october-extension-N` 175 · `october-pilot-N` 165 · `september-N` 62 · `september-boost-N` 42)·11월 4건, 나머지는 손으로 지은 슬러그. 게시 월: 9월 346 · 10월 195 · 11월 9(sitemap lastmod) | `/posts` 쪽수 실측 · `sitemap.xml`. 슬러그 날짜(예 `20261017-…`)가 lastmod(2026-10-10)보다 미래라 예약 게시로 보임 → 「사장이 직접 쓴 글」 같은 표현 근거 없음, `/admin/auto-post`·`/admin/api/schedule-week` 존재 |
| 게시글 검색 최적화 자동 적용 방식 | 글 한 편의 서버 렌더에 자동으로: `<title>`(지역·동 + 키워드 | 노모어누수) · `meta description` · `canonical` · `robots index,follow` · OG(`og:type=article`, `article:published_time/modified_time`, `og:image=/posts/<slug>/social-image` 동적 생성) · twitter 카드 · JSON-LD **`Article`·`BreadcrumbList`·`WebSite`**(글), 목록은 `ItemList`, 홈은 `LocalBusiness`·`FAQPage`(질문 15) · 지역 칩/지역 페이지 · `sitemap.xml`(586, lastmod 포함) · `feed.xml`(50건) · `llms.txt` · `robots.txt` · 관리자 `IndexNow` 핑 API(`/admin/api/indexnow`) · 글별 SEO 덮어쓰기 `/admin/posts/:id/seo` · 노출 점검 `/admin/search-visibility` | 글 `post.html`·홈·`/seoul/...` HTML 의 `<meta>`/`ld+json`, `index-Dj7WVQLZ.js` 라우트 표 |
| 지역 페이지 수 | 구 칩 26(서울 25구 + 분당) · 동 랜딩 sitemap 5(도봉 쌍문·방학·창·도봉동 + 강남 대치동) · `/seoul/:district(/:dong)` 라우트는 목록 밖 값도 응답할 수 있음(미시험) | sitemap, `index-*.js` |
| 서비스 목록 | 누수 4(누수탐지·변기·싱크대·동파) + 배관·고압세척 3(난방배관 청소·하수구 막힘·배관 고압세척) = 7, 후기 8, FAQ 15 | 홈 HTML |
| 히어로 슬라이드 | 4장, 2.8초 간격 | `HeroCarouselClient`, 홈 RSC `slides` 배열 |
| 첨부 규격 | 사진 선택·최대 3장·5MB·jpeg/png/webp | `QuoteForm` (`5242880`, `accept`) · 폼 문구 |

## 8. 브랜드
- 주색 파랑 `--color-brand-600 #2563eb`(700 `#1d4ed8`, 800 `#1e40af`, 950 `#172554`), 보조 주황 `--color-accent-500 #f55c2a`, 강조 노랑(히어로 `text-yellow-300`). 어두운 섹션 배경 `#071e3d`·`#04172e`. 근거: `layout.BEvCr-a6.css`.
- 폰트 Pretendard Variable(CDN `cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9`, `--font-sans`).
- 6월 캡처(유레카 시절)는 같은 파랑 계열 + 노랑 CTA 원형 전화 버튼, 로고는 파랑 마크 + 「유레카 설비 & 누수탐지」.

## 9. 다른 세션 점유
이 프로젝트의 레포·worktree·rc 세션 없음(소스 없음). `ps` 에 `nomorenusu|leak-site|eureka` 로 도는 프로세스 0(자기 일치 제외). `~/easysite`(우리 회사 사이트 레포)는 별도 세션 영역이고 이 조사는 읽기만 했다(파일 3개 읽기, 쓰기 0).

## 10. 지시와 코드가 다른 점
1. 상호: 지시·브리프 「유레카 설비 & 누수탐지」 ↔ 라이브 화면 「노모어누수」(「유레카」 0건). 같은 도메인·같은 레이아웃임은 6월 캡처와 `portfolio.ts:113-121` 로 확인, 상호 변경 시점·소유자는 미확인.
2. 주소: 지시 「leak-site.vercel.app」 ↔ 404 「삭제된 이전 주소」, 운영은 `nomorenusu.com`(Cloudflare·Vinext). 브리프 「Vercel 배포」도 사실과 다름.
3. 견적 폼: 브리프 「히어로 우측 sticky 리드폼」·지시 「사진 첨부 단계」 ↔ 홈 `#quote-form` 섹션의 단계 없는 한 장 폼(사진 첨부는 같은 폼 안의 선택 칸, 최대 3장).
4. 현황판: 지시·브리프 「관리자 상태 변경이 공개 반영」 ↔ 데모 모드(`NEXT_PUBLIC_LIVE_BOARD_DEMO:"true"`), 데모 32행 + 실제 2행, 클라이언트 시뮬레이션. 별도 페이지가 아니라 홈 히어로 안.
5. 상태 단계 이름: 브리프 접수/견적발송중/작업중/작업완료 ↔ 코드 작업접수/상담진행/작업출동/작업완료(4단계는 일치).
6. 지역명 파라미터: 지시 「지역명 파라미터 2종」·브리프 `?city=` 문구 치환 ↔ 쿼리는 저장만 하고 화면 불변. 화면이 바뀌는 건 `/seoul/<구>/<동>` 경로.
7. GA4 이벤트: 계약·브리프 5종 ↔ 코드 정의 10·호출 9, 그리고 라이브 GA 비활성.
8. 게시판 이름: 지시 「게시판」 ↔ 화면 「작업사례」(`/posts`), 글 550건 중 다수가 일괄 생성 패턴이라 「사장이 직접 작성」 서술은 근거 없음.
9. 관리자: 지시 「접수 목록·상태 4단계·접수 상세」 ↔ 라우트는 있으나(`/admin/requests`, `/:id`) 로그인 비밀번호가 서버에 없어 확인 불가.

## 추천 촬영 경로 (결정은 메인 세션)
- **A. 운영 공개 화면 + 전 POST 가로채기 — 기본안.** 대상: 랜딩 2종(`/seoul/gangnam-gu/daechi-dong`·`/seoul/dobong-gu/banghak-dong`, 쿼리형은 불변이라 1컷만), 견적 폼(작성 중·사진 3장 썸네일·제출 전, 제출은 `route.fulfill`), 현황판(데모 모드 사실 그대로, 캡션에 「실시간」 단정 금지), 게시판 `/posts`·`/posts/region/gangnam`·글 상세 + 소스 메타·JSON-LD 컷, seq 캐러셀(`page.clock`). 모든 컷 `page.route` 로 `/api/analytics/event`·홈 POST 막은 상태에서 시작, 번호·사업자정보·현황판 이름 가림. 상호가 노모어누수로 찍히는 점은 사용자 결정.
- **B. 기존 캡처 재사용(보조):** `~/easysite/public/portfolio/nomorenusu.png`(유레카 로고·6월·1280×748·번호 노출) — 해상도가 낮아 영상 주재료로는 부족, 「유레카」 상호 증거용.
- **C. 관리자 = BLOCKED**(계정 없음·기존 캡처 없음·소스 없어 로컬 재현 불가). 대안은 사용자가 비밀번호를 주는 경우뿐(실고객 데이터 전면 가림 필요). BLOCKED.md 후보 문구: 「관리자 비밀번호가 서버에 없고 로컬 소스가 없어 접수 목록·상태 4단계·상세는 촬영 못 함, 대신 4단계 라벨은 공개 현황판 배지와 번들 근거로 대체」.

## 막힌 것·미확인
관리자 전체(§4) · 소스 줄 번호 근거(소스 없음) · 상호 변경·운영 주체 · GA 실제 비활성(브라우저 네트워크 미확인) · `submitQuote` 응답 포맷(가짜 응답은 가로막힌 상태에서 시험) · `?city=` 허용 코드 · 서버 GET 쓰기 여부.
