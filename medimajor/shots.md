# medimajor shots — 모든 파일 한 줄 (운영 https://medimajor.com 을 Playwright 1.64.1 가로채기로 촬영, 로컬 실행 없음)

## 공통
- 촬영 시각 2026-11-05T23:40Z ~ 2026-11-06T00:2xZ. 데스크톱 1440×900 @2(2880×1800), 모바일 390×844 @3(1170×2532, isMobile·hasTouch). 모든 PNG 옆 같은 이름 .json(요소 사각형·글자·scrollY·뷰포트·pii_scan·intercepted).
- **조회수 쓰기 방지**: 매물 상세 SSR 이 조회수를 기록하는 조건은 UA 가 BOT 정규식에 안 걸릴 때다 — 레포 `src/lib/lot-stats.ts:16` `const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview/i`(작업 폴더 파일과 HEAD ec3dd74d 동일 줄). 데스크톱·모바일 컨텍스트 모두 userAgent 를 직접 지정해 `HeadlessChrome` 이 들어가게 했고(capture/ua-test.mjs, 실행 결과: 데스크톱 `Mozilla/5.0 (X11; Linux x86_64) … HeadlessChrome/156.0.8078.4 Safari/537.36` → BOT.test = true, 모바일 `Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) … Safari/604.1 HeadlessChrome` → true; 종료 코드 0) 컨텍스트를 만들 때 한 번 더 검사해 안 걸리면 중단한다(capture/common.mjs `mk`). 추가 방어: 상세 URL(`/auctions/<uuid>`, Next prefetch 포함)은 허용 목록 1건(미래온 MQE-102 `0ca69e33-a36d-4fa3-a9f9-bd991d7ebdc8`)만, 그리고 그 요청의 UA 가 BOT 에 걸릴 때만 통과, 나머지는 abort(`common.mjs` 두 번째 route). 실제로 연 상세 문서 요청: 이 매물 1건 × 총 8회(탐색 probe 3·desktop 2·mobile 1·seq-bid 1·media 1), 매번 `BOT.test(요청 UA)=true`(스크립트가 기록한 lotUA=[true]), 허용 목록 밖으로 막힌 요청 0.
- **마감 매물 금지**: 연 매물은 공개 목록(`/auctions`)에서 마감 2026-11-14(토) 22:25 KST — 촬영 시점(2026-11-06 08:3x KST)으로부터 8일 이상 남은 1건뿐. 마감 임박(도란메디 OCT-104, 11.06 19:11 KST) 등 다른 매물은 열지 않았다(finalize_auction 호출 경로 회피).
- **가림**: 머리 고객센터 번호(`.u-r a[href=/contact]`)·푸터 대표 전화(`.ft-tel`)·푸터 상호/대표/사업자번호/통신판매업/의료기기판매업/주소/팩스 블록(`.ft-biz`)·홈 거래 원칙 줄의 번호(`.h7-rules li:last-child`)는 remove(visibility:hidden, 자리는 남음). 서버가 이미 가려 내려주는 표시명(`홍**` 꼴)은 한 번 더 바꿈: 입찰 이력·삽니다 요청자 = `user***`(아바타 글자도 u). 화면 속 도메인·URL 글자(예: /expo 의 전시회 사이트 주소)는 lib 자동 규칙이 지움. 이메일·전화·주민번호·계좌 정규식 검사(pii_scan) 모든 캡처 0건.
- **판매자·협력사 상호 판단**: 매물 상세의 판매자 '온새미바이오장비', 목록의 '리메드솔루션·하람메디컬장비·파랑새메디트레이드' 등은 `scripts/samples/accounts.cjs:10` 의 시범 운영 샘플 계정 상호(가상, 실제 입점사·고객사 거래처 아님)라 biz 치환하지 않고 그대로 뒀다. 홈 협력사 'BMR 비엠알 주식회사'·/expo 의 라온이미징·세라온메디칼·한결바이오텍·블루포인트 등은 화면에 공개된 광고·입점 상호라 그대로. 병원명·병원 연락처는 공개 화면에 없음.
- 가로챈 요청: 비GET 은 lib guard 가 전부 가짜 200. 공개 페이지 캡처 중 비GET 발생 0건(json intercepted.total 0). 판매 마법사 캡처(sell-wizard·states/sell-photos)에서 가로챈 요청: `POST rpc/get_listing_price_input`(읽기성 RPC) ×3 · `POST rpc/sync_listing_images_slots` ×3 · `POST storage/v1/object/listing-images/…` ×3(사진 업로드) — 전부 가짜 200, 운영 DB·스토리지 쓰기 0. `create_listing_draft`·`/api/ai-listing/*`·입찰·구매 요청은 한 번도 호출되지 않음(마법사가 기존 빈 초안을 재사용하고 AI 는 버튼을 안 눌렀다). 허용한 비GET: 로그인 POST `medimajor.com/login`(서버 액션) 2회(테스트 판매자 1·관리자 1, capture/login.mjs) — BLOCKED.md '보고할 것'.

## desktop/ (1440, 한국어)
- desktop/home-ko-full.png · desktop/home-ko-view.png (+ .json) — 홈(ko, `/ko`) — 히어로 캐러셀 1/5(BMR 협력사)·경매장터/전시관/구매 요청 3타일·분야별 25. 가린 것: 머리 고객센터 번호·푸터 연락처·사업자정보. full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/home-en-full.png · desktop/home-en-view.png (+ .json) — 홈 English(`/en`) 같은 구성, 표시 통화 USD. full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/home-zh-CN-full.png · desktop/home-zh-CN-view.png (+ .json) — 홈 中文(`/zh-CN`). full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/home-ja-full.png · desktop/home-ja-view.png (+ .json) — 홈 日本語(`/ja`). full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/home-th-full.png · desktop/home-th-view.png (+ .json) — 홈 ไทย(`/th`, 분류명은 영문 폴백). full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/home-hi-full.png · desktop/home-hi-view.png (+ .json) — 홈 हिन्दी(`/hi`, 분류명은 영문 폴백). full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/auctions-full.png · desktop/auctions-view.png (+ .json) — 경매장터(`/auctions`) 전체 경매 35건 목록·필터. 판매자는 샘플 상호 그대로. full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/lot-detail-full.png · desktop/lot-detail-view.png (+ .json) — 매물 상세 미래온 MQE-102 뇌파 검사기(`/auctions/0ca69e33…`) 초기 상태 13,300,000원·입찰 10건 — 실시간 입찰 패널(우측 `section.bid`)·입찰 이력. 입찰자 표시 user***. full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/expo-full.png · desktop/expo-view.png (+ .json) — 전시관(`/expo`) 4개 브랜드 부스. 전시회 사이트 주소 글자는 자동 삭제. full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/wanted-full.png · desktop/wanted-view.png (+ .json) — 구매 요청 '삽니다'(`/wanted`) 목록 — 요청자 표시 user*** · 지역. full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/sell-full.png · desktop/sell-view.png (+ .json) — 판매 등록 안내(`/sell`, 공개) — '사진으로 판매 등록 시작' 안내·건수·검수 항목. full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/sell-wizard-full.png · desktop/sell-wizard-view.png (+ .json) — 사진 판매 등록 마법사(`/sell?start=1`, 테스트 판매자 로그인 세션 · 기존 빈 초안 재사용) 1단계 사진·기본 정보. 머리의 계정 표시는 user***, 초안 사진 1장은 테스트 계정의 기존 초안 사진. full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/admin-dashboard-full.png · desktop/admin-dashboard-view.png (+ .json) — 관리자 대시보드(`/admin` 검토 대기, qa-admin 세션) — 검토 대기 1·게시 중 35 등. 판매자 칸은 앱이 이미 ○○○○ 로 가림. 검토 대기 1건 '매물 ddd'는 시범 운영 중 테스트 초안. full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/admin-stats-full.png · desktop/admin-stats-view.png (+ .json) — 관리자 거래·매출 통계(`/admin/stats`) — 건수는 실제 DB 값, **낙찰 총액·평균 낙찰가는 가짜 값**(×1.137 반올림: 366,910,000→417,180,000 · 평균 13.59M→15,450,000). full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/admin-showroom-full.png · desktop/admin-showroom-view.png (+ .json) — 관리자 전시관 관리(`/admin/showroom`) — 브랜드 8(게시 4·입점 준비 4), 공개된 협력사 상호. full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).
- desktop/admin-listings-full.png · desktop/admin-listings-view.png (+ .json) — 관리자 매물 심사(`/admin/listings`) — 심사 대기 1건(테스트 초안 ddd). full=끝까지 스크롤해 지연 로딩 후 전체, view=첫 화면(scrollY 0).

## mobile/ (390, 같은 URL 의 반응형 — 폰 전용 헤더·하단 탭/입찰 바)
- mobile/home-full.png · mobile/home-view.png (+ .json) — 모바일 홈(`/ko`) — 하단 탭바 포함, full 은 하단 고정 요소를 문서 바닥으로 옮겨 찍음(lib 수정 2026-11-05 반영본).
- mobile/lot-detail-full.png · mobile/lot-detail-view.png (+ .json) — 모바일 매물 상세 미래온 MQE-102 — 하단 고정 입찰 바(`.mbid`) 13,300,000원 초기 상태.
- mobile/sell-full.png · mobile/sell-view.png (+ .json) — 모바일 판매 등록 안내(`/sell`).
- mobile/sell-wizard-full.png · mobile/sell-wizard-view.png (+ .json) — 모바일 사진 판매 등록 마법사(`/sell?start=1`, 로그인 세션).
- mobile/auctions-full.png · mobile/auctions-view.png (+ .json) — 모바일 경매장터.

## states/ (같은 뷰포트·같은 scrollY, 단계마다 한 장)
- states/bid-live/01-start-13300000.png … 05-bid-13700000.png (+ .json) — **실시간 입찰 패널 5장(시작 + 갱신 4단계), 데스크톱, scrollY 0**. 13,300,000→13,400,000→13,500,000→13,600,000→13,700,000원, 입찰 10→14건, 이력 맨 위 '최고' 행이 새 입찰로 이동. **가짜 값**: Supabase Realtime WebSocket(`wss://bkdszypustbzlnmehmxm.supabase.co/realtime/v1/websocket`)을 `page.routeWebSocket` 으로 받아 서버 연결 없이 phx_join 응답 + `postgres_changes`(auctions UPDATE) 푸시 프레임을 직접 보냄(capture/realtime.mjs), 푸시마다 나가는 `GET rest/v1/public_bids` 는 진짜 이력(GET 읽기)에 가짜 입찰 행(user***)을 얹어 응답. 입찰 요청 0.
  - states/bid-live/01-start-13300000.png
  - states/bid-live/02-bid-13400000.png
  - states/bid-live/03-bid-13500000.png
  - states/bid-live/04-bid-13600000.png
  - states/bid-live/05-bid-13700000.png
- states/bid-live-mobile/01-start-13300000.png … 05-bid-13700000.png (+ .json) — 같은 흐름의 모바일(scrollY 0, 하단 입찰 바 `.mbid` 가격·입찰 수 갱신). 가짜 값 동일.
  - states/bid-live-mobile/01-start-13300000.png
  - states/bid-live-mobile/02-bid-13400000.png
  - states/bid-live-mobile/03-bid-13500000.png
  - states/bid-live-mobile/04-bid-13600000.png
  - states/bid-live-mobile/05-bid-13700000.png
- states/lang-switch/01-ko.png · 02-en.png · 03-ja.png · 04-th.png · 05-hi.png (+ .json) — **언어 전환 흐름**: 홈(접두 없는 `/`, 헤더 언어 메뉴 UI 클릭 → 쿠키 `medimajor.lang` 쓰기 + router.refresh, 접두 경로 `/ko` 는 refresh 때 프록시가 쿠키를 되돌려 쓰지 않음), 히어로 배너는 일시정지(`.h7-bn-pause` 사용자 정지)로 고정, scrollY 0. 통화 표시는 언어에 따라 KRW→USD→JPY→THB→INR 로 같이 바뀜(실제 동작).
- states/sell-photos/01-draft-1-photo.png · 02-photo-2-added.png · 03-photo-3-added.png · 04-photo-4-added.png · 05-info-filled.png (+ .json) — **사진 판매 등록 단계**(데스크톱, 테스트 판매자 세션, scrollY 380): 기존 초안 사진 1장 → 실제 업로더에 파일 선택 ×3(스토리지 POST·rpc 가로챔, 이미지는 공개 샘플 매물 '저슬메디칼 USX-100 초음파' 사진 3장을 로컬 사본으로 응답) → 분류·장비명·제조사·모델·연도 입력(우측 미리보기 카드와 등록 품질 점수가 3→6→10→13→38점으로 변함). 업로더가 고른 파일은 '선택한 사진' 그대로이며 새로 그린 화면 아님. 일부 컴포넌트(사진에서 정보 채우기·구동 영상·파일 선택 버튼)는 라이브에서 스타일이 안 입혀진 기본 모양 그대로다(고치지 않고 실제 그대로 찍음).

## seq/ (60fps · H.264 CRF 12 · 방식: page.clock.install + pauseAt, 1/60초씩 runFor + getAnimations currentTime 동기화, 프레임마다 가림·PII 검사 후 스크린샷)
- seq/bid-update.mp4 · bid-update-first.png · bid-update-last.png (+ .json) — **입찰 갱신 연출 6초 360프레임 2880×1800**: 매물 상세에서 0.8·2.1·3.4·4.7초에 가짜 Realtime 푸시 4번(perFrame 에서 전송) → 현재가 `[data-mo=roll]` 가격 번쩍/롤링, 상단 가격 띠·입찰 수·이력 동시 갱신, 마감 시계 가상 시간으로 1초씩 감소. 가짜 값(위와 동일).
- seq/home-hero.mp4 · home-hero-first.png · home-hero-last.png (+ .json) — **홈 배너 자동 전환 5초 300프레임**: 캐러셀(AUTO_MS 6000, `HomeBanner.tsx:15`)이 2/5(태온메디텍 IPL-103 매물)에서 3/5(자동 입찰 안내)로 넘어가는 장면, 진행 막대 포함. 가짜 값 없음(실제 라이브 슬라이드).

## media/ (레포 파일 원본 복사 — `git show HEAD:<경로>`, 라이브 공개 파일)
- media/logo-navy.svg — public/v51/logo-navy.svg 헤더 로고 원본(fill #222F60, 3750×918)
- media/logo-white.svg — public/v51/logo-white.svg 푸터 로고(fill #FFFFFF)
- media/mark-white.svg — public/v51/mark-white.svg
- media/mm-logo-client.svg — public/ref/brand/mm-logo-client.svg JSON-LD 로고
- media/mm-symbol-client.svg — public/ref/brand/mm-symbol-client.svg
- media/mm-symbol-180.png — public/ref/brand/mm-symbol-180.png 앱 심볼 180px
- media/og-1200x630.png — public/ref/brand/og-1200x630.png OG 이미지
- media/bmr-ad-hero.jpg — public/v55/bmr/bmr-ad-hero.jpg 홈 히어로 협력사 배너 원본(BMR 광고 이미지)
- media/raon-imaging.jpg — public/v51/booth/raon-imaging.jpg 전시관 부스
- media/seraon-medical.jpg — public/v51/booth/seraon-medical.jpg 전시관 부스
- media/hangyeol-biotech.jpg — public/v51/booth/hangyeol-biotech.jpg 전시관 부스
- media/bluepoint-healthtech.jpg — public/v51/booth/bluepoint-healthtech.jpg 전시관 부스
- media/lot-mqe102-1.webp — 공개 스토리지 샘플 매물 미래온 MQE-102 사진 01(…/listing-images/samples-v9/0ca69e33…/01.webp, GET). 라이브 크레딧 'MEDIMAJOR · 시안 자산(AI 생성)', 시범 운영 사진
- media/lot-mqe102-2.webp — 같은 매물 사진 02
- media/lot-mqe102-3.webp — 같은 매물 사진 03
- media/lot-usx100-1.webp — 샘플 매물 저슬메디칼 USX-100 초음파 사진 01(samples-v9/d20696ca…/01.webp) — states/sell-photos 업로드 대역으로도 사용
- media/lot-usx100-2.webp — 같은 매물 사진 02
- media/lot-usx100-3.webp — 같은 매물 사진 03

## 그 밖의 파일
- brand.json — 주색 #222F60·보조 #2445C7·폰트 MM Sans(라이브 computed)/Pretendard Variable/JetBrains Mono, 레포 CLAUDE.md(#1150c8)와 다른 점과 출처 file:line.
- facts.md — 자막용 사실 10개(근거 file:line·화면). contact.jpg — 전 캡처 축소 모음. BLOCKED.md — 못 한 것·보고할 것. RECON.md — 사전 조사.
- capture/*.mjs — 이 폴더의 촬영 스크립트(비밀값 없음, 로그인은 환경변수 LOGIN_KIND·LOGIN_EMAIL·LOGIN_PASSWORD 로만): ua-test.mjs · common.mjs · realtime.mjs · desktop.mjs · langs.mjs · mobile.mjs · seq-bid.mjs · seq-hero.mjs · login.mjs · sell-wizard.mjs · admin.mjs · media.mjs.
