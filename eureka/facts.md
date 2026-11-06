# eureka facts (운영 상호 「노모어누수」 — nomorenusu.com)

소스 저장소가 없어 근거는 운영 공개 HTML·JS 번들·CSS·sitemap 의 GET 결과다(줄 번호 없음, 번들 파일명은 해시 포함). 조회 시각: HTML·번들·sitemap 2026-11-06T07:55Z, 브라우저 네트워크 확인 2026-11-06T07:59Z(데스크톱)·08:00Z(모바일). 해시가 바뀌면 같은 근거를 다시 조회해야 한다.

## 1. 접수 상태는 4단계다: 작업접수 → 상담진행 → 작업출동 → 작업완료
- 근거: `https://nomorenusu.com/_next/static/chunks/database-CLYa9LSi.js` — `['pending','quote','active','done']` 와 라벨 `{pending:'작업접수',quote:'상담진행',active:'작업출동',done:'작업완료'}`. 같은 4단계를 현황판 `LiveStatusTableClient-BoI8U-dm.js`(배지·다음 단계 함수)가 쓴다. 화면 배지로도 4가지가 모두 보인다: `states/live-board-progress-desktop/04-t30s.png`(작업접수·상담진행·작업완료 …), `01-t0-initial.png`. 조회 2026-11-06T07:55Z.
- 자막 메모: 지시·브리프의 「접수/견적발송중/작업중/작업완료」는 코드 라벨과 다르다 — 화면 글자(작업접수·상담진행·작업출동·작업완료)를 쓴다.

## 2. 이벤트 추적 코드는 이벤트 10개를 정의하고 9개가 호출된다(`outbound_click` 만 호출 0)
- 근거: `analytics-BwsJN7lF.js` 상수표 `click_call, click_kakao, cta_click, submit_quote, view_post, filter_region, scroll_50, scroll_90, outbound_click, click_post_cta` = 10개. 호출하는 청크 9개: `CtaButtons`·`FloatingDesktop`·`MobileBottomBar`·`MobileMenu`·`PostCTABlock`·`PostViewTracker`·`QuoteForm`·`RegionChips`·`ScrollTracker`(각 `.CLICK_CALL`… 접근 합계 CLICK_CALL 5·CLICK_KAKAO 4·CTA_CLICK 4, 나머지 1씩). 호출 함수는 이벤트를 자체 수집 `traffic-analytics-upFxGuPJ.js`(`POST /api/analytics/event`)로 보내고, `window.gtag` 가 함수일 때만 gtag 로도 보낸다. 조회 2026-11-06T07:55Z.
- 자막 메모: 「5종」(계약서·브리프 표기)은 코드와 다르다. 「10종 정의·9종 사용」이 근거 있는 숫자다.

## 3. GA4 는 운영에서 꺼져 있다 — 브라우저 네트워크에 gtag 요청 0건
- 근거: 실제 브라우저(Playwright)로 홈·지역 2종·작업사례·글 상세를 열어 요청을 센 결과 — 데스크톱 총 566건 중 `googletagmanager`·`google-analytics`·`gtag`·`analytics.google` 0건(`eureka/capture/pages.mjs` 실행 로그, 2026-11-06T07:59:08Z), 모바일 566건 중 0건(08:00:11Z). 홈·글 HTML 에도 `googletagmanager`·`gtag/js` 0건, `G-` 측정 ID 0건. 번들 `AnalyticsScript-Cr8dDt_u.js` 는 `NEXT_PUBLIC_GA_ID` 가 비면 렌더하지 않고 `business-BGkla3ba.js` 에 그 값이 `undefined` 로 박혀 있다. 대신 자체 수집 `POST /api/analytics/event` 만 돈다(촬영에서는 전부 가로챔).
- 자막 메모: 「GA4 로 N종 추적」은 쓰면 안 된다(켜져 있지 않다). 쓰려면 「자체 방문·클릭 수집 이벤트 9종」.

## 4. 작업사례(게시글)는 550건, 목록 46쪽(쪽당 12건)
- 근거: `https://nomorenusu.com/sitemap.xml` 의 `<loc>` 586개 중 글(`/posts/<slug>`) 550개·지역 목록(`/posts/region/<구>`) 26개·`/seoul` 계열 8개·그 밖 2개. `/posts?page=46` 200 · 글 링크 10개(= 45×12+10 = 550), `/posts?page=47` 404. 조회 2026-11-06T07:55Z. 목록 첫 쪽 글 링크 12개.
- 자막 메모: 화면 이름은 「작업사례」(지시의 「게시판」). 글 다수가 일괄 생성 패턴 슬러그(`october-extension-N` 등)라 「사장이 직접 쓴 글」 표현은 근거가 없다.

## 5. 글 한 편의 검색 최적화는 서버 렌더에 자동으로 붙는다 — 메타·JSON-LD·sitemap·robots·llms.txt
- 근거: `https://nomorenusu.com/posts/20261031-october-extension-175` HTML(조회 2026-11-06T07:55Z, 157KB) — `<title>`(동 이름 + 키워드 | 노모어누수) · `meta description` · `link rel=canonical` · `robots index, follow`(+ `googlebot max-image-preview:large`) · `og:title/description/url/site_name/type=article/locale` · `article:published_time`·`modified_time` · `og:image` = `/posts/<slug>/social-image`(글마다 동적 이미지) · `twitter:card summary_large_image` · JSON-LD 4블록: `WebSite` / `Article`(+ImageObject·Organization·Place) / `BreadcrumbList` / `ItemList`(관련 글). 사이트 단위: `sitemap.xml`(586 URL, `lastmod`) · `robots.txt`(`/admin`·`/api/` Disallow, Yeti·Googlebot 허용) · `llms.txt`(200) · `feed.xml`(200, 간헐 503 한 번 관찰) · 홈 JSON-LD `LocalBusiness`·`FAQPage`(질문 15개)·`WebSite`. 관리자 쪽에는 글별 SEO 덮어쓰기(`/admin/posts/:id/seo`)·IndexNow 핑 경로가 라우트 표에 있으나 로그인이 필요해 화면은 못 찍었다(BLOCKED.md).
- 자막 메모: 「글을 올리면 검색용 메타·구조화 데이터·사이트맵이 자동 적용」까지가 근거 있는 표현. 검색 순위·노출 효과는 근거 없음.

## 6. 「실시간 작업 현황판」은 데모 모드다 — 자막에 「실시간」·「실제 접수」를 쓰면 안 된다
- 근거: `business-BGkla3ba.js` 에 `NEXT_PUBLIC_LIVE_BOARD_DEMO:'true'`(기본값도 `true`). 홈 HTML 의 초기 목록 34행 중 32행이 `id:"d001"~"d032"`(DB uuid 아님)이고 나머지 2행만 uuid. `LiveStatusTableClient-BoI8U-dm.js`: 2.5초(`intervalMs=2500`)마다 초기 목록에서 행을 복제해 `created_at=지금`·`status=pending` 으로 맨 위에 끼우고(NEW 핀 2초), 1.5초마다 완료 아닌 무작위 한 행의 상태를 한 단계 올린다(마우스를 올리면 멈춤). 가상 시계로 6·15·30초 진행해 상태가 올라가는 것을 확인(`eureka/capture/flows.mjs live`, `states/live-board-progress-*`). 조회 2026-11-06T07:55Z, 촬영 2026-11-06T08:02Z.
- 자막 메모: 「작업 신청이 들어오는 모습(예시 화면)」처럼 쓴다. 화면 속 이름은 촬영 때 전부 김○○ 로 바꿨다.

## 7. 화면의 상호는 「노모어누수」이고, 지시의 「유레카 설비 & 누수탐지」와 같은 프로젝트다
- 근거: 운영 HTML 에 「유레카」 0건, `<title>`·로고·푸터·JSON-LD 가 「노모어누수」. 같은 프로젝트라는 증거: `~/easysite/src/config/portfolio.ts:113-121` (`id:'nomorenusu'`, `name:'유레카 누수탐지'`, `url:'https://nomorenusu.com'`)와 `~/easysite/public/portfolio/nomorenusu.png`(2026-06-24, 유레카 로고에 같은 히어로 캐러셀 + 우측 LIVE 현황판 구성). `leak-site.vercel.app` 은 모든 경로 404(「삭제된 이전 주소」). 조회 2026-11-06T07:55Z.
- 결정 필요(메인 세션): 영상 자막의 상호 표기(화면은 노모어누수 그대로 둠).

## 8. 견적 신청은 단계 없는 한 장 폼이고, 사진은 선택·최대 3장·장당 5MB(jpeg·png·webp)이며 선택만으로는 요청이 나가지 않는다
- 근거: `QuoteForm-CQd-VnOt.js` — `j=3`(최대 장수), `P=5242880`(5MB), `F='image/jpeg,image/png,image/webp'`, 이름 `minLength:2, maxLength:10`, 증상 최대 500자(`M=500`)·최소 10자(`N=10`), 제출은 서버 액션 `fd26cd07cc37#submitQuote`. 사진 선택 직후 새 네트워크 요청 0건(가짜 이미지 3장 `setInputFiles`, `eureka/capture/flows.mjs quote` 실행 로그 3회 모두 `사진 선택 직후 새 요청: 0`, 2026-11-06T08:02Z). 제출 버튼은 누르지 않았다.
- 자막 메모: 폼 항목 = 이름·연락처·지역(시·도 → 구)·상세주소·증상·사진(선택)·개인정보 동의.

## 9. 지역 페이지는 경로형이다 — 쿼리 `?city=` 는 화면을 바꾸지 않는다
- 근거: `/?city=gangnam`·`/?city=seocho&utm_source=naver` 응답 HTML 이 `/` 와 바이트 동일(321,919B, curl GET, 2026-11-06T08:04Z). 화면이 지역명으로 바뀌는 것은 `/seoul/<구>/<동>`(예 `/seoul/gangnam-gu/daechi-dong` → 제목 「대치동 누수탐지 | 아파트·배관 누수 상담 | 노모어누수」). sitemap 의 `/seoul` 계열 8개 = `/seoul`·`/seoul/dobong-gu`·`/seoul/gangnam-gu` + 동 5개(쌍문·방학·창·도봉·대치). 작업사례 지역 칩 26개(서울 25구 + 분당). 조회 2026-11-06T07:55Z.

## 10. 히어로는 일러스트·사진 4장이 2.8초마다 넘어가는 캐러셀이다
- 근거: `HeroCarouselClient-BZLGeTaC.js` — `intervalMs=2800`, `setInterval` 로 다음 슬라이드, `transition-transform duration-500 ease-in-out` + `translateX(-n×100%)`. 슬라이드 이미지 `/about/{dispatch,rescue,estimate,consult}.png`(1254×1254, 공개 GET 200) → `media/`. 촬영: `seq/hero-carousel.mp4`(page.clock).

## 11. 브랜드: 주색 파랑 #2563eb · 보조 주황 #f55c2a · 폰트 Pretendard
- 근거: `https://nomorenusu.com/_next/static/css/layout.BEvCr-a6.css` — `--color-brand-600:#2563eb`(700 `#1d4ed8`, 950 `#172554`), `--color-accent-500:#f55c2a`, `--color-highlight-300:#fde047`, `--font-sans:"Pretendard Variable", Pretendard …`. 어두운 섹션 `#071e3d`·`#04172e`·`#061b35`. 조회 2026-11-06T07:55Z. 자세한 값은 `brand.json`.
