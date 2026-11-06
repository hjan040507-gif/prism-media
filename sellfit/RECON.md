# sellfit(SELLFIT / 쎈셀핏) 사전 조사 (RECON) — 2026-11-05 23:4xZ

읽기 전용 조사(코드 읽기 + 운영 사이트 GET/curl + 공개 이미지 GET). 서버·빌드·브라우저·DB 쿼리 없음. `.env.local` 값은 읽지 않았다(내용 확인 시도도 훅이 막음). 고객 레포 git 상태 변경 없음.

## 접근 판정: 부분 접근 가능 (공개 모바일 화면 = 가능 / 관리자·로그인 필요 화면 = 불가)

근거
1. **인계 완료 기록은 어디에도 없다.** `docs/HANDOVER.md`(양도 대비 마스터 문서, "제16조 양도 대비" 자산 표)와 `docs/OPERATIONS.md`는 양도할 때 할 일의 *절차서*다(GitHub·Vercel·Supabase·네이버·HF 소유자 이전 방법, "양도 시 토큰·service_role 재발급"). 계정이 실제로 고객에게 넘어갔다는 기록(커밋·PROGRESS·docs)은 없음. `git log --grep` 인계/handover/transfer/이관 = `490366f docs: STEP DOC-HANDOVER`(문서 작성 커밋)뿐. 마지막 커밋 `7e0cec6` 2026-08-03(B131), PROGRESS.md 는 B131 완료 기록(8줄)뿐.
2. **이 서버에 남은 권한(문서·파일 기준)**: `/home/dev/sellfit/.env.local` 존재(600, 1,032B, 2026-06-24). README·HANDOVER 가 정의한 변수 이름: `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY` · `SUPABASE_ACCESS_TOKEN` · `VERCEL_TOKEN` · `NEXT_PUBLIC_SITE_URL` · `NAVER_CLIENT_ID/SECRET` · `HF_TOKEN`. `deploy.sh`(VERCEL_TOKEN)·`db.sh`(SUPABASE_ACCESS_TOKEN) 래퍼가 있음. **토큰이 지금도 유효한지는 확인하지 않았다**(API 호출 = 값 사용이라 안 함, 파일 존재 ≠ 유효). 단 간접 증거: ① `git ls-remote origin HEAD` 성공 → GitHub(`anhongjun0507-bit/sellfit`, SSH alias gh-cla2) 접근 살아 있음, 원격 HEAD = 로컬 HEAD `7e0cec6`. ② 운영 사이트의 `sitemap.xml` 응답 날짜가 2026-09-12(마지막 커밋 8-03 이후)라 그 뒤에도 누군가 재배포했다(누가 했는지는 모름). 문서의 GitHub owner(`sellfit0914-dotcom`)와 실제 remote 가 달라 문서의 owner 표는 그대로 믿을 수 없다.
3. **운영 URL**: https://sellfit.vercel.app `curl -sI` = HTTP/2 200 (`server: Vercel`, `x-matched-path: /`, 봇 확인·Vercel 보호 없음). `/products` `/sensel` `/shop` `/login` 200, `/robots.txt`·`/sitemap.xml` 200. `/my` `/chats` `/admin` = 307 → `/login`.
4. **관리자·테스트 계정은 이 서버에서 쓸 수 있게 남아 있지 않다(문서 기준).** 로그인 = 이메일+비밀번호(`signInWithPassword`, `src/app/login/email-auth-form.tsx:105`) 또는 OAuth(구글·카카오·애플, 키 미활성 `HANDOVER F`). 관리자 = `profiles.role='admin'`(`src/lib/admin-guard.ts:21-28`), 계정 목록·비밀번호는 어떤 문서에도 없다(README:70-74 는 "만드는 법"만). 이 프로젝트의 세션 메모리(`~/.claude/projects/-home-dev-sellfit/memory/deploy-live-verify.md`)도 "라이브 검증은 관리자 로그인 없이(anon REST·SSR 공개 페이지)" 했다고 적음. 유일한 계정 정의는 `scripts/seed.mjs:19` 의 데모 시드 유저(이메일은 코드에 있고 비밀번호는 코드에서 파생 — 값 미기록). 이 유저는 일반 role 이고 운영 DB 에 지금 있는지 모름. 새 계정 금지 규칙이라 **로그인이 필요한 모든 화면은 찍을 수 없다.**

결론: **공개 화면(모바일 3~4개)은 라이브에서 GET 으로 찍을 수 있다.** 다음은 불가 → BLOCKED.md 후보: ① 데스크톱 관리자 상품·주문(교환) 관리(관리자 계정 없음) ② 장바구니·주문 단계(앱에 장바구니·주문·결제가 없음 — 아래 §2, 대체 흐름인 교환 신청도 로그인 필요).
처리 제안: 인계가 이미 진행 중일 수 있으니(계정 소유가 불명) 라이브는 **GET 만**(POST 전부 page.route 로 가로채기). 인계 상태가 걱정되면 사용자 확인 후 촬영.

## 1. 스택·실행
- Next.js **15.5.19** App Router · React 19.1 · Tailwind v4 · TypeScript 5 · `@supabase/ssr` · PWA(`src/app/manifest.ts`, `public/sw.js`). npm. `package.json:5-10`: dev=`next dev --turbopack`, build=`next build`, start=`next start`, test=`vitest run`.
- env 이름은 위 접근 판정 2. `NEXT_PUBLIC_` 로는 URL·anon·SITE_URL 만.
- **로컬 실행해도 DB = 운영 Supabase**(ref `lbxraaoonjilnjihflrz`, 메모리·이미지 URL 근거). 로컬 DB·스테이징 없음 → 로컬 이점 없음. 라이브 GET 이 더 안전. 데모 모드 없음. (포트 54321~ 은 다른 프로젝트의 로컬 Supabase.)
- 배포: Vercel Git 연동(`git push main`) — `deploy.sh` 는 작업 트리를 통째로 올리니(미커밋 포함) 쓰지 말 것. `vercel.json` 존재, `.vercel/` 폴더 없음.
- 봇 확인: 헤더·본문에 챌린지 없음(일반 UA 로 확인). 속도 제한 코드 없음(이 앱엔 rate-limit 모듈이 보이지 않음).
- **미커밋 변경 10개의 정체**(B109 멤버 모집 게이트): `src/app/page.tsx`(홈이 쿠키 없고 비로그인이면 `<MemberGate/>` 오버레이로 가입 funnel 먼저), `member-gate.tsx`, `lib/members/`, `admin/members/`, 마이그레이션 `20260629010000_members.sql`. **운영에는 아직 없다**(HEAD 7e0cec6 만 배포, 라이브 `/` 는 바로 피드). 라이브를 찍으면 이 화면은 안 나온다 — 찍지 말 것(수집 대상은 이름·전화 = 개인정보).

## 2. 명세 ↔ 실제 화면 (앱 성격: **교환 중개** 플랫폼, 쇼핑몰 아님)
앱 설명(`src/lib/brand.ts:6`): "스타일 탐색 기반 AI 매칭 + 중고 패션 교환 플랫폼". 거래 = 두 유저가 상품을 맞교환하고 운영자가 중개(3자 물류). 앱 내 결제·장바구니·주문 없음(`shop/page.tsx:12` "앱내 결제 없음", 코드에 cart/checkout 없음, `/cart` `/checkout` `/orders` = 404).

| 명세 화면 | 실제 | 라우트·파일 | 진입 조건 | 셀렉터 힌트 |
|---|---|---|---|---|
| 모바일 홈 | 있음 = **코디 피드**(2열 masonry, 클라이언트 fetch) | `/` `src/app/page.tsx`, `home-feed.tsx:47,202,242,279`(피드), 카드 `:557-562` | 공개(운영) | `a[href^="/codi/"]`, 검색 `input[aria-label="코디 검색"]`, 더보기 `button[aria-label="더보기"]`. **사람 사진 많음 → 제외** |
| 코디 목록 | 별도 목록 페이지 없음(홈 피드가 목록). 검색 결과 그리드 `home-feed.tsx:545-575` | `/` | 공개 | 코디 상세 `/codi/[id]` `codi/[id]/page.tsx:189` 도 사람 사진 → 제외 |
| 상품 목록 | 있음 = **거래** 탭(2열 3:4 카드, 최근 60개) | `/products` `products/page.tsx:46-49`, 카드 `products/products-grid.tsx:142-170` | 공개 | `a[href^="/products/"] img`, 하단 탭 `components/bottom-nav.tsx:22-25`(홈·거래·채팅·마이) |
| 쎈셀샵(운영자 공식 상품) | 있음, 상품 사진 위주(최대 100개, 현재 71개 노출) | `/sensel` `sensel/page.tsx:41-46` | 공개 | 상단 `SHOP` 링크 `components/global-nav.tsx:34-39`, 카드 `a[href^="/products/"]` |
| 상품 상세 | 있음 | `/products/[id]` `products/[id]/page.tsx:126`(캐러셀 정사각), `:265-271`(상세 이미지 세로 나열 `alt="<이름> 상세 이미지 N"`), `:226-233`(교환 버튼, `accepts_exchange`) | 공개 | 캐러셀 `components/image-carousel.tsx`, 교환 `a[href^="/swap/new"]`(로그인 상태에서만 활성, 비로그인은 `:202-203` 로그인 안내문) |
| 장바구니 | **없음** | — | — | — |
| 주문 단계 | **없음.** 대체 = 교환 진행: 신청 `/swap/new?to=<productId>`(`swap/new/page.tsx`, `:19` 비로그인 → /login), 진행 `/swap/[id]`(`swap/[id]/page.tsx`, `:59` → /login). 상태 11개(`lib/swaps/state-machine.ts:8-20`, 라벨 `:85-96`: 신청됨·입금 대기·입금 확인됨·신청자→중개인 발송…·완료·반려됨·취소됨) | `/swap/*` | 로그인 + 거래 당사자 | 불가 |
| 관리자 상품 관리 | 있음 `/admin/products`(`admin/products/page.tsx:9-17`, 최대 300행: 이름·owner_type·status·활성) + 쎈셀샵 `/admin/sensel` | `/admin/*` 레이아웃 `admin/layout.tsx` | `requireAdmin` | 불가(관리자 계정 없음) |
| 관리자 주문 관리 | 이름이 다름 = **교환 관리** `/admin/swaps`(`admin/swaps/page.tsx`, 교환 #id8·상태·t1/t2 id8·날짜, 최대 200) | | `requireAdmin` | 불가 |

관리자 메뉴 12개(`admin/admin-nav.tsx:9-20`): 대시보드·회원(미커밋)·유저·상품·쎈셀샵·외부상품·교환·코디·신고·네이버 화이트리스트·브랜드·스타일 태그. `/admin/members`·`/admin/users` 는 이름·전화·이메일(PII)이 그대로 나오는 화면(`admin/members/page.tsx:87-90`).

## 3. 사람 사진 문제
- **코디 사진 = 사람이 자주 나온다.** 사이트맵의 코디 12건을 표본(246건 중 매 20번째, 첫 이미지만)으로 실제 이미지를 내려받아 봤다: 12건 중 **5건에 사람**(전신·얼굴 일부(입 아래)·목/턱·거울셀카 가림·앉은 전신·여러 명 거리 사진), 나머지는 의류 단독·배경·제품 컷. 코디 이미지는 세로로 아주 긴 콜라주(300px 폭에서 높이 1,400~2,000)라 한 이미지 안에 사람 컷이 섞일 수 있다. 코디 전체를 뽑을 방법(전수 확인)은 DB 쿼리라 안 했다.
- **상품 사진 = 의류 단독 위주**(표본 12건 모두 얼굴·전신 없음; 상세 이미지 컷 일부에 손·팔 클로즈업, 한 장은 앱 캡처 이미지). 판매자가 올린 일반 유저 상품에 사람 착용 컷이 섞일 수 있어 `/sensel`(운영자 공식) 우선 권장.
- 촬영에 쓸 화면: **`/products`(거래), `/sensel`(쎈셀샵), `/products/[id]`(상품 상세, 쎈셀샵 상품 고르기)**. 홈(`/`)·`/codi/[id]`·`/users/[id]` 는 뺀다.
- 사람 사진이 들어갈 칸(가리거나 빼야 할 것):
  - `/products/[id]` **"비슷한 코디" 섹션** `components/related-codis-section.tsx:15-16`(`section` 안 `h2`="비슷한 코디", 코디 썸네일 = 사람 사진). 운영자가 연결한 상품에만 나옴 → 있으면 `section:has(> h2)` 중 텍스트 "비슷한 코디" 인 것을 `display:none`.
  - `/products/[id]` 판매자 아바타·닉네임 `a[href^="/users/"]`(`products/[id]/page.tsx:135-139`, `img[alt=""]`) → 아바타 숨기고 닉네임은 `user***`.
  - `/products` `/sensel` 상단 배너 캐러셀 `banner-carousel.tsx`(`sensel_banners` 이미지; 일부가 앱 캡처 형태) → 찍기 전에 한 번 눈으로 확인.
  - 상품 상세 이미지에 손·팔이 있는 상품은 고르지 않는다(상품 후보는 `/sensel` 에서 첫 이미지가 의류 단독인 것).
  - 썸네일 `alt=""` 만으로는 사람 여부를 알 수 없음(alt 는 상품명/코디 제목뿐) — 사람 여부는 위처럼 눈으로 확인.

## 4. 계정 정의 위치
- 관리자: `profiles.role='admin'` 컬럼(`src/lib/admin-guard.ts:21-28`); 부여는 `/admin/users`(`docs/OPERATIONS.md:13`) 또는 SQL(`README.md:70-74`). 현재 관리자 목록·비밀번호는 문서에 없음.
- 테스트: `scripts/seed.mjs:19`(시드 유저 이메일 상수), `:28`(비밀번호가 코드에서 파생 — 값은 기록 안 함), 롤백 `scripts/seed-rollback.mjs`. 운영 DB 에 존재하는지·관리자 권한이 있는지 모름(seed 는 닉네임만 갱신 `:38`).
- 로그인 방식: 이메일+비밀번호 폼(`login/email-auth-form.tsx`) + OAuth 버튼(`login/login-buttons.tsx:21`), 이메일 가입은 `mailer_autoconfirm=true`(`docs/handoff.md:§8`)라 즉시 가입됨 — **새 계정 금지라 쓰지 않는다**.

## 5. 쓰기 위험
- Route handler(`src/app/**/route.ts`): `POST /api/codi-cover-dims`(**공개**, 홈 피드 이미지 로드 때 자동 호출 — service_role 로 `codis.cover_w/h` 가 null 인 행만 채움, `api/codi-cover-dims/route.ts:34-38`), `POST /api/embed`(임베딩 생성), `POST /api/admin/embed-backfill`(관리자), `GET /api/cron/embed-missing`(크론, 쓰기 — **호출 금지**), `GET /auth/callback`(OAuth), `GET /admin/members/export`(회원 PII 내보내기 — 호출 금지).
- Server Action(POST, `'use server'`): `lib/{swaps,chats,codis,products,members,notifications,activity,admin,brands,tags,external,naver,url-preview,cache}-actions` 전부. 읽기인데 POST 인 것: **`recordActivity`**(`activity-ping.tsx:20`, 로그인 사용자만, 하루 1회 `user_activity_days` upsert — 비로그인 촬영에선 안 불림), `url-preview-actions`(외부 URL 미리보기 fetch, 등록 폼에서만), 네이버 검색 `naver/actions.ts`(`/shop`, 로그인 필요).
- GET 렌더 중 서버 쓰기: 공개 화면(`/products` `/sensel` `/products/[id]`)의 서버 컴포넌트에는 insert/update 없음(조회만, `products/page.tsx:46-60`, `[id]/page.tsx:72-100`). 미들웨어는 세션 쿠키 갱신만. 조회수·방문 기록 없음.
- 클라이언트 직접 쓰기(브라우저 → Supabase REST, anon key): 좋아요 `codi_likes` insert/delete(`home-feed.tsx:500-501`), 찜 `saved_products`, 알림 읽음 등 — 모두 로그인 필요. 비로그인 촬영에선 안 불리지만 `page.route('**/rest/v1/**')` 에서 GET 외 메서드를 가짜 성공(201/204)으로 막는다.
- **홈 피드 때문에** `/api/codi-cover-dims` POST 가 나갈 수 있으니 홈을 안 찍으면 이 위험도 없다. 찍는다면 `**/api/codi-cover-dims` 가로채기.
- 가로챌 URL 패턴(권장): 요청 메서드가 GET/HEAD/OPTIONS 가 아니면 전부 가짜 응답 + 카운트. 대상 호스트 `sellfit.vercel.app`(서버 액션은 같은 URL 로 POST + `Next-Action` 헤더) 및 `lbxraaoonjilnjihflrz.supabase.co`(`/rest/v1`, `/auth/v1`, `/realtime`).

## 6. 가짜 데이터로 장바구니·주문 단계 찍기
- 장바구니·주문은 **존재하지 않아 찍을 수 없다.** 대체 흐름인 교환 신청(`/swap/new`)·진행(`/swap/[id]`)은 **서버 렌더 + 로그인 필수**(`swap/new/page.tsx:17-19`, `swap/[id]/page.tsx:57-59`; DB 에서 상품·교환 행을 읽어 서버에서 그림). 클라이언트 상태만으로 만들 수 없고, 로그인 쿠키를 가짜로 만들어 넣는 것도 서버가 `supabase.auth.getUser()` 로 검증하므로 안 됨 → **불가**. 로컬에서 찍으려면 로컬 앱을 가짜 Supabase(응답 모킹 서버)에 붙이고 가짜 세션을 만들어야 하는데 고객 코드를 건드리지 않는 범위에서는 비용이 크다. 대안: 상태 흐름은 `lib/swaps/state-machine.ts`(11개 상태, 라벨 `STATUS_LABEL_KO`)를 사실로만 쓰고 화면 촬영은 BLOCKED.md.
- 결제 위젯 없음(PG 연동 코드 0). 가로챌 결제 요청 없음.
- 상태 흐름 대체 후보(공개 화면만): ① `/products` → 카드 → `/products/[id]` 진입(같은 뷰포트·스크롤 단계별) ② `/products/[id]` 캐러셀 이미지 넘기기(`ImageCarousel`) ③ `/sensel` 배너 캐러셀. 단계 3개 이상 흐름은 이 정도 — 명세의 "상태 흐름 2개·각 3단계" 가 채워질지는 촬영 때 판단.

## 7. 가림 대상
- 머리: 상단 바 `header.vt-header`(`global-nav.tsx:29`) = 로고·SHOP·검색·로그인 — 연락처 없음. 하단 탭 4개(홈·거래·채팅·마이) — 연락처 없음. 푸터 컴포넌트 없음(대표번호·이메일·주소·사업자정보·SNS·QR 코드 모두 소스에서 못 찾음: `grep` 사업자·대표번호·QR 미검출 — 촬영 때 DOM 정규식 검사로 재확인).
- 상품 상세: 판매자 닉네임·아바타 `a[href^="/users/"]` → `user***`/숨김. 화면 속 URL 글자: `external_url`(외부 상품 링크 `[id]/page.tsx:193`)·출처 라벨(`lib/source-label.ts`)이 외부 도메인 글자를 보여줄 수 있음 → 쎈셀샵 상품은 해당 없음, 일반/외부 상품은 출처 라벨 확인.
- 상품 설명(`p.description`) 안에 판매자가 쓴 전화번호·계좌가 있을 수 있음 → 정규식 검사.
- 주문자 정보: 해당 화면 없음. (관리자 `/admin/members`·`/admin/users`·`/admin/swaps` 의 이름·전화·이메일·유저 id 는 계정이 없어 찍지 않는다.)
- 도메인 `sellfit.vercel.app` 이 보이는 곳: 공유 시트(`share-sheet.tsx`)·OG — 일반 화면에는 안 보임.

## 8. 사실 후보 (자막용)
| # | 사실 | 근거 | 상태 |
|---|---|---|---|
| 1 | 쎈셀샵(운영자 공식) 노출 상품 71개 | `/sensel` HTML 의 고유 `/products/<id>` 링크 71개(2026-11-05 23:3xZ GET; 쿼리 상한 100, `sensel/page.tsx:46`) | 실측, 촬영 시 재확인 |
| 2 | 거래 탭은 최근 등록 60개를 노출(상한 60 = 현재 60개 꽉 참) | `/products` 링크 60개, `products/page.tsx:49` | 전체 상품 수는 미확인 |
| 3 | 사이트맵 기준 코디 246개·활성 상품 101개 | `sitemap.xml` `/codi/` 246, `/products/` 101 — 단 **응답 날짜 2026-09-12 의 스냅샷**(`sitemap.ts:23-24,31` 상한 500) | 이후 변동 가능 → 자막엔 "미확인" 취급 권장 |
| 4 | 카테고리 7종: 상의·하의·아우터·신발·가방·모자·악세사리 | `src/lib/catalog.ts:11` | 코드 |
| 5 | 상품 상태 4단계: 새상품·아주 좋은 상태·약간의 사용감·사용감 있음 | `catalog.ts:15` | 코드 |
| 6 | 교환은 운영자 중개 3자 물류, 진행 상태 11개 | `lib/swaps/state-machine.ts:8-20` | 코드 |
| 7 | 최초 발송비 각자 2,000원, 추가금 상한 30만원 | `lib/swap-config.ts:10,23` | 코드 |
| 8 | 소셜 로그인(구글·카카오·애플)·이메일 로그인 지원 | `login/login-buttons.tsx`, `email-auth-form.tsx` (OAuth 는 provider 키 미활성이라 실제 동작은 미확인 — `HANDOVER.md` F) | 이메일만 확실 |
| 9 | 관리자 메뉴 12개 | `admin/admin-nav.tsx:9-20`(회원 메뉴는 미커밋·미배포 → 운영 기준 11개) | 코드 |
| 10 | 마이그레이션 57개 | `supabase/migrations/` | 코드(`HANDOVER`는 26개로 오래됨) |
| 11 | 앱 내 결제 없음, 구매는 외부 이동만 | `shop/page.tsx:12` | 코드 |
숫자(회원 수·교환 건수)는 관리자 대시보드(`/admin`)나 DB 쿼리라야 알 수 있어 **미확인**.

## 9. 브랜드
- 앱 이름: `쎈셀핏`, 워드마크 `SELLFIT`(`src/lib/brand.ts:3-5`).
- UI 기본은 흑백: `--color-foreground #111111`, `--color-accent #000000`, `--color-background #ffffff`, `--color-border #e7e7ea`, `--color-muted-foreground #767680`(`src/app/globals.css:10-18`). 보조 브랜드 파랑 `--color-brand #2f6bff`(`globals.css:29`; 사용처 `notifications/page.tsx` 등 소수). **PWA·스플래시·아이콘의 노랑 `#F8C808`**(`src/app/manifest.ts:15` background_color, `theme_color #ffffff`) — 로고 이미지가 노란 배경.
- 폰트: Pretendard(동적 서브셋, jsdelivr CDN `layout.tsx:54`), 폴백 시스템 폰트(`globals.css:33`).
- 로고·아이콘 원본: `public/logo.png`(835×162 가로 워드마크), `/home/dev/sellfit/logo-full.png`(818×817 풀로고: 노랑 배경+지구본+SELL), `public/icon-192.png` `public/icon-512.png` `public/icon-512-maskable.png`, `public/splash/{globe,hanger,shoe,tee-purple,tee-red}.png`, `src/app/icon.png` `apple-icon.png` `favicon.ico`, `/home/dev/sellfit/emblem.png` `globe.png` `world-map.png`(레포 루트). 벡터(svg) 로고는 없음(`public/*.svg` 는 Next 기본 아이콘).
- 히어로·제품 원본 사진: 상품·코디 이미지는 Supabase Storage 공개 버킷(`products/`, `codis/`; 공개 GET 가능). 파일 재배포 시 쎈셀샵 상품 사진을 쓰되 사람 사진 제외.

## 10. 다른 세션 점유
- `git worktree list`: `/home/dev/sellfit 7e0cec6 [main]` 한 개(다른 worktree 없음). 작업 폴더는 미커밋 변경 10개(2 수정 + 8 신규: PROGRESS.md, db.sh, deploy.sh, references/, admin/members/, member-gate.tsx, lib/members/, 마이그레이션 sql). 건드리지 않음.
- sellfit 관련 프로세스·dev 서버 없음(`ps` 에 sellfit 없음, 리스닝 PID cwd 중 sellfit 없음).
- 사용 중 포트(`ss -ltnp` 확인만): 3311, 3312, 3475, 3491, 3493(다른 프로젝트 next-server), 8781, 8782, 17510, 5432x, 55xxx. **빈 포트 후보: 3611, 3612, 3613**.
- 자원: 메모리 가용 약 23GB(46GB 중), 디스크 83%(여유 66GB).
- 로컬 실행은 권하지 않는다(운영 DB 에 직접 연결되고 이점이 없음, §1). 라이브 GET 촬영 권장.

## 11. 명세와 코드가 다른 점
1. **장바구니·주문 단계 없음** — 이 앱은 교환 중개 PWA. 명세의 "장바구니·주문 단계"에 해당하는 화면이 없고 대체물(교환 신청·진행)은 로그인 필수 서버 렌더라 못 찍는다 → BLOCKED.
2. **"코디·상품 목록"** — 코디 전용 목록 페이지는 없고 홈 `/` 가 코디 피드(사람 사진 많아 제외). 상품 목록은 `/products`(거래 탭)와 `/sensel`(SHOP).
3. **"관리자 상품·주문 관리"** — 상품 관리 `/admin/products` 는 있고 주문 관리의 실제 이름은 "교환 관리" `/admin/swaps`. 둘 다 관리자 계정 필요 → 계정이 없어 못 찍는다 → BLOCKED(사유: 관리자 계정·비밀번호가 서버 문서에 없음, 새 계정 금지).
4. **명세의 "PWA"** — 설치 프롬프트·스플래시(`splash-screen.tsx`, 6초 타임아웃 `layout.tsx:69`)가 첫 진입에 전면으로 뜬다. 첫 화면 촬영 전 스플래시가 끝나길 기다리거나 `#splash-root` 를 숨겨야 함.
5. 데스크톱 레이아웃은 모바일 고정폭(`max-w-md`)을 중앙에 두는 방식이라 1440 폭에서도 폭 448px 컬럼으로 나온다(`products/page.tsx:22`, `global-nav.tsx:30`). 관리자 화면 정도만 넓은 레이아웃일 가능성.
6. 인계 요청이 걸린 프로젝트인데 실제 인계 기록은 문서 템플릿뿐이라 "계정이 넘어갔는지"는 코드·문서로는 판정 불가 → 라이브는 GET 만, 사용자에게 인계 상태 확인을 권한다.
7. 홈 멤버 모집 게이트(B109)는 미커밋이라 운영에 없음 → 촬영 대상 아님.
