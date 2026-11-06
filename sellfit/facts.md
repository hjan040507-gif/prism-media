# sellfit facts — 자막용 사실 (근거 포함)

앱 성격: 쇼핑몰이 아니라 "스타일 탐색 기반 AI 매칭 + 중고 패션 교환 플랫폼"(`src/lib/brand.ts:6`). 앱 안에 결제·장바구니·주문이 없다.

## 1. 쎈셀샵(운영자가 직접 고른 공식 상품) 71개가 노출 중
- 근거: 운영 `https://sellfit.vercel.app/sensel` HTML 의 고유 `/products/<id>` 링크 71개(2026-11-06T00:07Z GET 재집계; 촬영한 `mobile/sensel-list-full.png` 에서 육안으로도 카드 전부 확인). 쿼리 상한 100(`src/app/sensel/page.tsx:46`, `owner_type='sensel'`). 이 숫자는 그 시각 스냅샷.

## 2. 거래 탭은 최근 등록 상품 60개를 보여 준다(쎈셀샵 + 유저 제품 혼합)
- 근거: `src/app/products/page.tsx:49` `.limit(60)`, 운영 `/products` 고유 링크 60개(2026-11-06T00:07Z). 현재 60개가 꽉 차 있어 전체 등록 상품 수는 아님 → 전체 수는 미확인.

## 3. 카테고리 7종: 상의·하의·아우터·신발·가방·모자·악세사리
- 근거: `src/lib/catalog.ts:11` `CATEGORIES`(주석: 5→7, products·codis·external_products DB CHECK 와 동일).

## 4. 상품 상태 4단계: 새상품 · 아주 좋은 상태 · 약간의 사용감 · 사용감 있음
- 근거: `src/lib/catalog.ts:15` `CONDITIONS`.

## 5. 교환 진행 상태 11단계, 운영자가 중개하는 3자 물류
- 근거: `src/lib/swaps/state-machine.ts:7-18` `SwapStatus` 11개(신청됨·입금 대기·입금 확인됨·신청자→중개인 발송·중개인 수령함·중개인→상대 발송·수령 확인됨·중개인→거래자2 발송·완료·반려됨·취소됨), 한글 라벨 `:84-96`. 마지막 안내 문구 "쎈셀핏이 안전하게 중개합니다." `src/lib/brand.ts:7`. 이 화면들은 로그인 서버 렌더라 촬영하지 못함(BLOCKED.md).

## 6. 최초 발송비는 거래자 각자 2,000원, 교환 추가금 상한 30만원
- 근거: `src/lib/swap-config.ts:10` `INITIAL_SHIPPING_FEE_PER_TRADER = 2000`, `:23` `EXTRA_FEE_MAX = 300000`. 중개인 최종 발송비는 양측 절반(`:13-16`).

## 7. 상품 상세는 사진 캐러셀(예: 베이프 샤크 후드 4장)과 "교환 가능" 표시를 지원
- 근거: 촬영 `states/detail-carousel/`(1/4→4/4), `src/app/products/[id]/page.tsx`(캐러셀 `components/image-carousel.tsx`). 교환·채팅·저장은 로그인 후 이용(화면 문구 "교환·채팅·저장은 로그인 후 이용할 수 있어요").

## 8. 코디 246개 · 활성 상품 101개 — 미확인
- 근거: 사이트맵 `sitemap.xml` 의 `/codi/` 246개·`/products/` 101개(2026-11-06 GET). 단 응답 `date` 헤더가 2026-09-12(캐시된 스냅샷)라 현재 수치 아님 → 자막에는 "미확인"으로 취급 권장. 회원 수·교환 건수는 관리자 대시보드/DB 쿼리라야 알 수 있어 미확인.

## 9. 관리자 메뉴 12개(운영 배포본 기준 11개)
- 근거: `src/app/admin/admin-nav.tsx:9-20` 12항목(대시보드·회원·유저·상품·쎈셀샵·외부상품·교환·코디·신고·네이버 화이트리스트·브랜드·스타일 태그). '회원' 메뉴(B109)는 미커밋·미배포(RECON) → 운영 기준 11. 관리자 화면은 계정이 없어 촬영 안 함.

## 10. 앱 이름 쎈셀핏(SELLFIT), PWA 로 설치 가능
- 근거: `src/lib/brand.ts:3-5`, `src/app/manifest.ts:13-21`(`display: 'standalone'`, 아이콘 192·512·maskable). 촬영 중 "홈 화면에 추가하면 앱처럼!" 설치 안내가 실제로 뜸(가리고 찍음).
