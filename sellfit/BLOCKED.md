# sellfit BLOCKED / 보고할 것

접근 판정(RECON.md): **부분 접근** — 인계 완료 기록 없음, 관리자·테스트 계정이 이 서버에 없음. 운영 `https://sellfit.vercel.app` 공개 화면만, 로그인 없이, GET 만 찍었다. 새 계정 0, 로그인 0회.

## A. 못 채운 것
1. **관리자 상품·주문 관리(데스크톱)** — 실제 이름은 상품 `/admin/products`, 주문이 아니라 **교환 관리 `/admin/swaps`**
   - 사유: 관리자는 `profiles.role='admin'` 계정만(`src/lib/admin-guard.ts:21-28`). 계정·비밀번호가 서버 어느 문서에도 없고, 새 계정 금지. 비로그인 `/admin` 은 307 → `/login`.
   - 시도(2번): ① RECON 에서 문서·코드로 계정 탐색(없음) ② 비로그인 `/admin` 응답 확인(307 → /login).
   - 대안: 데스크톱 3페이지는 같은 공개 화면(쎈셀샵 목록·상품 상세 2종·로그인)으로 채움(`desktop/`). 관리자 메뉴 구성은 facts.md 9번(코드 근거)만. 계정을 받으면 `/admin/products`·`/admin/swaps` 를 이름·전화·유저 id 가림 규칙으로 촬영.
2. **장바구니·주문 단계** — 앱에 없음
   - 사유: 교환 중개 앱이라 앱 내 결제·장바구니·주문이 없다(`src/app/shop/page.tsx:12` "앱내 결제 없음", 코드에 cart/checkout 없음, `/cart`·`/checkout`·`/orders` 404). 대체 흐름인 교환 신청 `/swap/new`·진행 `/swap/[id]` 는 로그인 + 거래 당사자만, 서버 렌더(`swap/new/page.tsx:17-19`, `swap/[id]/page.tsx:57-59`)라 가짜 세션으로도 못 만든다.
   - 시도(2번): ① 코드·라우트 조사(cart/checkout/orders 없음) ② 비로그인 `/swap/*` → /login 확인.
   - 대안: 상태 흐름은 공개 화면 2종으로 대체 — `states/detail-carousel/`(상품 사진 1/4→4/4), `states/search-filter/`(거래 목록 검색어 한 글자씩 → 목록 필터). 교환 11단계는 사실로만(facts.md 5번).
3. **홈(코디 피드)·코디 상세 `/codi/[id]`** — 사람 사진 다수로 제외(지시)
   - 사유: 코디 사진에 얼굴·전신이 자주 나옴(RECON 표본 12건 중 5건). 홈 피드는 이미지 로드 때 공개 `POST /api/codi-cover-dims` 를 보내기도 함 → 홈을 아예 안 열어 그 요청도 0.
   - 대안: 사람이 없는 상품 사진 위주 화면(`/sensel`·`/products/[id]`)으로 대체.
4. **모바일 거래(`/products`) 목록 full·view 없음**
   - 헤더는 스크롤 위치와 무관하게 sticky 라 있는 곳에서 찍힘(`mobile/header.png`). `/products` 전체 목록은 첫 카드가 사람이 나온 '유저 제품'(얼굴 사진)이라 full·view 로 싣지 않고, 사람이 안 나오는 질의 결과만 상태 흐름(`states/search-filter/`)에 쓴다.
5. **`/shop`(신뢰 쇼핑몰 검색)** — "준비 중" 안내 화면이라 영상 재료로 부적합, 찍었다가 뺌.

## B. 운영 쓰기 가능성 — 정확히
- 가로챈 비GET: 0건(공개 화면 GET 만으로 충분, 가로챈 요청 수는 모든 json 의 `intercepted.total` 에 0 으로 기록). 허용한 비GET 0건. `POST /api/codi-cover-dims` 는 홈을 안 열어 발생 안 함(그래도 가짜 응답 규칙은 걸어 둠).
- 서버가 GET 렌더 중 쓰는 곳 없음(RECON 5: 공개 화면 서버 컴포넌트는 조회만). `GET /api/cron/embed-missing`·`/admin/members/export` 는 열지 않음.
- 일반 방문자와 같은 GET 이 나갔다: 상품 목록·상세 HTML, Supabase 공개 REST `GET /rest/v1/products`(거래 목록 검색 화면), Storage 이미지 GET. 방문 기록·조회수 쓰기 코드 없음.
- 로그인 0회 · 새 계정 0 · 비밀값 접근 0(`.env.local` 안 읽음).
- 사람 사진 확인: 촬영본 전부 직접 확인(shots.md 맨 위 한 줄). 상품 상세 3종의 사진에 손 클로즈업(베이프 샤크 후드 3·4번째 사진)은 있으나 얼굴·전신 없음.
- 인계 상태가 불명확한 프로젝트임(RECON §11-6) — 촬영은 일반 방문자 수준의 GET 뿐이었다.
