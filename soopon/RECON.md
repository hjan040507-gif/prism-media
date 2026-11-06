# soopon(숲ON페스타 2026) 촬영 전 사전 조사 — RECON

조사 2026-11-06 07:2x~07:3xZ · 읽기 전용(코드 읽기 + 운영 GET/HEAD 만 · 브라우저·서버·빌드·DB·로그인 0) · 비밀값 기록 0(`.env.local` 은 열지 않았다).
레포 = `/home/dev/Soopon` (HEAD `f1f890c` 브랜치 `main` = `origin/main`). 형제 폴더 `~/soopon-v24p-work` · `~/soopon-v25-work` 는 **git 저장소가 아니라 작업·증거 폴더**다(`.git` 없음 · package.json·tsx 없음 · 각 101M·281M) — 어느 쪽도 운영 기준이 아니다. 운영 기준 = `~/Soopon` 하나.

## 0. 먼저 알아야 할 것 (촬영 방식을 바꾸는 사실 7개)

1. **운영 = 레포 코드와 같다(화면 기준).** 운영 배포 `dpl_GuswuM2ZNQ5XYLtrLZKuK4tvLRSe` = main `198862c`(코드 끝 `78e48b6`, 네이버 소유 확인 meta, 10-13 02:2xZ) — `PROGRESS.md:18`. 레포 HEAD `f1f890c` 는 그 뒤 PROGRESS.md 한 줄만 추가(`git diff --stat 198862c HEAD` = `PROGRESS.md | 1 +`). 라이브 HTML 에 `naver-site-verification` meta 가 있어 그 커밋이 올라가 있음을 확인(Vercel API 는 토큰이 `.env.local` 이라 조회하지 않음 → 배포 id 자체는 PROGRESS 기록 기준, 미확인 부분).
2. **작업 트리 변경 92줄은 전부 추적 안 된 파일(`??`)** — `docs/design/scores/*.err`, `docs/research/candidates-v2/*.png` 같은 문서·시안 부산물. 수정된 추적 파일 0(`git status --short | grep -v '^??'` 빈 출력). 코드는 HEAD 와 운영이 같다. 건드리지 않았다.
3. **지시의 「처방전·고민·동반자·일정」 4단계 필터는 이 사이트에 없다.** 실제는 한 화면에서 동시에 고르는 **3축**: 누구와(6) · 어떤 경험(6) · 지역(9) = 21값(`lib/filters.ts:11-47`). 단계(step) 흐름·「일정」 축·「처방전」 글자 모두 없음(코드·라이브 홈/프로그램/비즈/소개 HTML 에서 「처방」 0건). 사이트 말은 「내게 맞는 숲 프로그램을 찾아보세요.」(`components/discovery.tsx:65-67`). → 매핑: 고민≈어떤 경험(exp), 동반자≈누구와(who), 지역=region, 일정=없음(§10).
4. **운영 공개 화면만으로 지시 화면이 전부 찍힌다 — 로그인 불필요**(메인·필터·결과·상세·비즈·상담 폼 모두 비로그인 200). 데이터는 운영 Supabase(공유 호스티드)에서 오고 로컬 DB 재생은 필요 없다.
5. **방문만으로 운영 GA4 가 오염된다.** 운영 빌드는 gtag(`G-7ZB6E51805`)를 로드하고 page_view·`view_program`·`click_booking`·`use_program_filter`·`submit_b2b_inquiry` 를 보낸다(`components/analytics.tsx:9`, `lib/analytics.ts`). 촬영 때 `googletagmanager.com` · `google-analytics.com` · `analytics.google.com` 요청을 모두 `page.route` 로 막아야 한다(서버 쓰기는 아니지만 고객 통계에 섞임).
6. **상담 제출은 REST API 가 아니라 Next 서버 액션**(`'use server'` `submitInquiry`, `app/(public)/b2b/actions.ts:26`) → 브라우저는 현재 페이지 URL(`/b2b` 또는 `/b2b/inquiry`)로 `POST` + `Next-Action` 헤더를 보낸다. 실제로 가면 `soopon_inquiries` insert + 메일(Resend) 알림 + 담당자에게 진짜 문의가 쌓인다. **POST 를 전부 가로채야 한다**(§5). 가짜 성공 응답은 RSC flight 형식(`text/x-component`)이 필요해 「제출 후」 완료 화면은 첫 시도에서 형식을 검증할 것(미검증).
7. **`/curation`(목록 없는 경로)은 404 가 정상**(`PROGRESS.md` NOW). 기획전은 `/campaigns` → `/curation/[id]`·`/event/[id]`.

## 1. 스택·실행

| 항목 | 값 · 근거 |
|---|---|
| 프레임워크 | Next `^16.3.4` App Router(`cacheComponents: true` `next.config.ts:10`) · React `^19.2.8` · TS `^7.0.2` · Tailwind `^4.3.3` · `@supabase/supabase-js ^2.116` · exceljs · jszip · sharp 0.35.4 (`package.json`) |
| node | 서버 v22.23.1 · `.nvmrc`·`engines` 없음 |
| 명령 | `npm run dev` = `next dev -p 3031` · `npm run build` = `next build` · `npm start` = `next start -p 3031` · `npm run verify` = 대비검사+tsc+build. dev 포트 3031 고정(`CLAUDE.md`). 촬영은 prod 빌드 권장하나 **운영 라이브를 찍으면 불필요** |
| env 이름(필수) | `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`.env.example:7-8`) |
| env 이름(선택·서버) | `SUPABASE_SERVICE_ROLE_KEY`(문의 저장·관리자) · `RESEND_API_KEY` · `SOOPON_INQUIRY_TO` · `SOOPON_INQUIRY_FROM`(메일) · `NEXT_PUBLIC_SITE_URL` · `NEXT_PUBLIC_GA_MEASUREMENT_ID`(없으면 gtag 안 뜸) · `NEXT_PUBLIC_HERO_SLOGAN` · `NEXT_PUBLIC_HERO_B2B_LINK` · `SOOPON_PREVIEW`(=1 이면 「시안」 띠 + 문의 저장 거부 + 어드민 404 + GA 끔) · `SOOPON_INDEX_VERCEL_APP` · `VERCEL` `VERCEL_ENV` `VERCEL_PROJECT_PRODUCTION_URL` (코드 grep) |
| DB | **운영과 공유하는 호스티드 Supabase**(mai-eventic 과 같은 프로젝트, `CLAUDE.md` 「시크릿 취급」). 테이블 `soopon_programs/companies/program_activities/curations/inquiries/admin_access_logs`. 마이그레이션 `supabase/soopon/001~016_*.sql` + `rollback/` 있으나 **`supabase/config.toml`·`supabase/migrations/` 없음** → 로컬 Supabase 는 `supabase start` 만으로 안 되고 SQL 16개 수동 재생 필요(010·016 관리자 정책의 auth 의존은 미확인). 로컬 시드 샘플 `seed/*.sample.json`(프로그램 14·기업 5·기획전 2)은 **옛 샘플**이라 실데이터와 다름(`seed/README.md`) |
| 로컬 비밀값 | `.env.local` 존재(내용 미열람). 로컬 실행 시 anon 값으로 운영 DB 를 **읽기만** 한다 — 단 service_role 도 들어 있으면 서버 액션이 운영에 쓴다 → 로컬로 갈 때는 service_role 을 비워 둔 임시 env 로(문의 저장 실패 처리됨) |
| 모바일 앱 | 없음(웹 전용) |
| 기존 캡처(재사용 후보) | `screenshots/live/*`(7장) · `screenshots/p1-*.png` · `deliver/*.zip`(395M, 10-0x 납품 캡처). 날짜가 10월 초라 운영과 다를 수 있다 → 새로 찍기 권장 |
| 기존 촬영 도구 | `scripts/capture.mjs`(`fullPageShot` — 지연 이미지 끝까지 로드, `PROGRESS.md:규칙`) · `scripts/route-capture.mjs` · `tests/all-pages.spec.ts` · `playwright.config.ts`(viewport 360/768/1280/1440 + iphone14·galaxys24 프리셋, `locale ko-KR`, `timezoneId Asia/Seoul`). 이 레포 의존성(@playwright/test 1.63)은 쓰지 않고 `prism-media/tools` 에서 |

## 2. 라이브 주소·상태 (`curl -sI` GET/HEAD 만, 2026-11-06 07:2xZ)

운영 도메인 = **`https://sooponfesta.com`**(200) · `www.sooponfesta.com` → 301 → apex · `https://soopon.vercel.app` 도 같은 배포(200). 어드민은 이 세 호스트와 로컬에서만 열린다(`CLAUDE.md` 「운영 규칙」, `lib/admin/host.ts`) — 이번 지시엔 어드민 없음.

| URL(soopon.vercel.app 기준) | 상태 |
|---|---|
| `/` · `/programs` · `/program/[slug]` · `/b2b` · `/b2b/inquiry` · `/about` · `/companies` · `/company/[slug]` · `/campaigns` · `/privacy` · `/sitemap.xml` · `/robots.txt` | 200 (비로그인) |
| `/curation` | 404(목록 경로 없음 — 정상) |
| `/admin/login` | 200 (공개 로그인 화면, 로그인은 안 함) |
| `/api/programs/count?…` | 200 `{"total":N}` (GET · 캐시된 읽기 · 필터 시트 숫자용) |

봇 차단·Vercel 챌린지 없음(`x-vercel-mitigated` 없음). `cache-control: public, max-age=0, must-revalidate`, `x-vercel-cache: HIT`. 이미지 원본은 `sfsmzzuznedkvobfzpua.supabase.co/storage/v1/object/public/soopon-public/…`(공개 GET).

## 3. 지시 화면 ↔ 실제 라우트·컴포넌트

뷰포트 경계: **1024px**(`lg:`). 1440 = 칩 패널, 390 = 3버튼+바텀시트.

| 지시 | 실제 | 파일:줄 · 셀렉터 · 비고 |
|---|---|---|
| 메인 | `/` → `HomeView`: Hero → Discovery → 추천 프로그램 → 기획전(Curation) → 숲ON비즈 배너 → 소개 6섹션 | `app/(public)/page.tsx` · `components/home-view.tsx:19-75`. 히어로 `components/hero.tsx`(352줄) · 인물 장면 `hero-scene.tsx` · 슬로건 「요즘, 숲에서 쉬는 법」(`lib/pending.ts:128`) |
| 필터 단계(고민·동반자·지역·일정) | **홈 탐색 `Discovery`**: 1024↑ 칩 패널 `[data-discovery-panel]`(행 3개, 칩 `button[aria-pressed]`, `discovery.tsx:149-262`) · 1023↓ 3버튼 `[data-discovery-pickers]` → 필터 시트 `[role=dialog][data-sheet]`(`discovery.tsx:76-146`, `programs/filter-sheet.tsx`). **/programs 의 필터**: 1024↑ `aside[data-filter-panel]`(`programs/toolbar.tsx:63`), 그룹 `[data-filter-group=who|exp|region]` | 일정 축 없음(§10). 칩 값은 URL 값(`who=`·`exp=`·`region=`)과 같다 |
| 결과 목록 | ① 홈 패널 결과 `ol[data-discovery-results]`(최대 4행 2×2, `discovery.tsx:253-261`) ② **`/programs`** 목록(12개/쪽, `lib/pending.ts:99`, `app/(public)/programs/page.tsx` 278줄, 총 개수 `toolbar.tsx:171` `총 N개의 프로그램`) · 정렬 4종 · 검색 · 필터 칩 | 예: `/programs?who=kids&exp=nature`(19건) · 0건 화면 `components/programs/empty-state.tsx`(예: `?region=jeju` 0건) |
| 프로그램 상세 | `/program/[slug]` | `app/(public)/program/[id]/page.tsx`(455줄): 핵심정보 `#quick-info`(`[data-facts]`) · 소개 `#intro` · 주요 활동 `#activities` · 이용안내 `#guide`(아코디언 5항목) · 운영기업 `#company` · 앵커 탭 `anchor-nav.tsx` · 1024↑ 오른쪽 sticky 예약 카드 `aside[aria-label=예약 정보]`(:349) · 767↓ 하단 고정 바 `DetailBottomBar` · 768~1023 상단 바 |
| B2B 비즈 페이지 | `/b2b`(「숲ON비즈」, 이름이 다름) | `app/(public)/b2b/page.tsx`(222줄): 히어로 h1 `#b2b-title` → 활용 목적 4카드 `#purpose-heading` → 추천 프로그램 `#recommend-heading` → 참여 산림복지전문업 `#partners-heading` → 상담 신청 `#inquiry`(`inquiry-heading`) + 모바일 고정 CTA `StickyCta` |
| 상담 신청 폼 | 같은 폼이 **`/b2b#inquiry`** 와 **`/b2b/inquiry`**(단독, `?program=slug`·`?company=slug` 로 관심 프로그램 미리 선택) | `components/b2b/inquiry-form.tsx`(필드 `[data-field=contact_name|department|email|phone|program_ids|purpose|headcount|preferred_period|message|privacy_agreed|optional_agreed|third_party_agreed]`, honeypot `input[name=homepage]` :442) · 검증 `lib/inquiry.ts` · 동의 표 `components/consent-table.tsx` · 완료 화면 `role=status` `INQUIRY_DONE_COPY`(`inquiry-form.tsx:117-133`) · **제출 = 서버 액션 `submitInquiry`**(`b2b/actions.ts:26`) |
| seq: 필터 고를 때 결과가 바뀌는 장면 | 후보 3개 — **A** 1440 홈 칩 클릭 → 결과 개수·행 즉시 갱신(서버 왕복 없음 · `useMemo` 거름, `discovery.tsx:151`) + 히어로 인물 컷 교체(`transition-[transform,opacity] duration-300`, `hero-scene.tsx:98`, `scene-layer.tsx:66` `duration-300`). **B** 390 필터 시트 열림 `sheet-in`(300ms 감속, `globals.css:753-766` · 840-880 keyframes) + 칩 선택 → 300ms 디바운스 후 `GET /api/programs/count` → 「결과 보기 (N개)」 갱신(`filter-sheet.tsx:104-125`). **C** `/programs` 칩 클릭 → `router.push`(스크롤 유지, `toolbar.tsx:21`) → 목록 교체 + 총 개수 `CountUp`(rAF, `count-up.tsx`) | **page.clock 으로 찍을 수 있다**: 움직임이 전부 CSS transition/animation + `setTimeout`(200·300ms) + rAF 이고 Web Animations 로 `document.getAnimations()` 에 잡힌다. 주의: ① B·C 는 실제 `fetch`/RSC 응답을 기다려야 하므로 clock 만 돌리지 말고 네트워크 완료를 실시간으로 await 후 다음 프레임 ② `prefers-reduced-motion` 은 꺼야 한다(켜면 즉시 교체, `globals.css:909-928`) ③ 히어로 진입 `hero-rise`(0/30/60/90ms 지연 stagger, 300ms)와 `img[data-fadein]` 페이드(`globals.css:720-745`, 이미지 load 이벤트 의존)도 대표 연출 후보 |

## 4. 테스트·관리자 계정

- 지시 화면은 **비로그인 공개**라 계정 불필요.
- 참고만(쓰지 않음): 관리자 로그인 `/admin/login`(Supabase Auth 이메일+비밀번호, `app/admin/login/actions.ts`). 계정 정의·QA 규칙 문서 `docs/admin-guide.md` · `docs/qa-accounts-ban-r1.md` · `CLAUDE.md` 「운영 규칙」(오픈 뒤 QA 계정으로 실제 문의 열람 금지, 열람은 접속 기록 `/admin/access-logs` 에 남음). 변수 이름·값은 읽지 않았다. 새 계정 없음.

## 5. 쓰기 위험

**GET 으로 서버가 쓰는 공개 경로: 없음(코드 확인).** 공개 코드의 DB 쓰기는 `app/(public)/b2b/actions.ts` 한 곳뿐(`insert` grep). 조회수·열람 기록·속도 제한 카운터 없음(IP 기록·접수 제한은 v20b D3 에서 뺌, `actions.ts:18-19`). `lib/data/*` 는 `'use cache'` 읽기. `app/og/[kind]/[id]/route.ts` 는 GET 이미지 생성. 크론 없음.
- 어드민 화면 GET 은 열람 시 `soopon_admin_access_logs` 에 남는다(`CLAUDE.md` 「접속 기록」) → **어드민은 열지 않는다**(지시 범위 밖).

**가로챌 것(브라우저 `page.route`)**
1. **`POST /b2b`·`POST /b2b/inquiry` + `Next-Action` 헤더** = `submitInquiry`(insert `soopon_inquiries` + `after()` 메일 `notifyInquiry`). 전부 abort 또는 fulfill. 페이지 내 다른 서버 액션 없음.
2. **GA/gtag**: `www.googletagmanager.com/gtag/js`, `*.google-analytics.com/g/collect`, `analytics.google.com` — 요청 자체를 막는다(§0-5). (`trackSubmitB2bInquiry` 등은 `window.gtag?.` 라 gtag 가 없으면 아무 일도 없다, `lib/analytics.ts`.)
3. 그 밖의 비-GET: `/api/admin/revalidate`(Bearer 필요, 브라우저가 안 부름). 외부 호스트로 나가는 POST 없음.
- 허용해도 되는 비-읽기 없음. GET 인 것: `/api/programs/count`(필터 시트) · RSC prefetch(`RSC:` 헤더 GET) · 이미지·폰트.

**유료·외부 호출**: AI·문자·알림톡·결제 없음. 메일(Resend)은 문의 저장 뒤에만 → 위 1번에서 막힘.

**건드리지 않을 것**: 외부 예약 링크 클릭(`target=_blank` → 네이버 예약 등 외부 사이트 — 열리면 외부 방문 기록·새 탭), `tel:` 링크, SNS 링크, 지도.
- 로컬 사본으로 갈 경우의 보호: `SOOPON_PREVIEW=1` 이면 문의 저장을 서버가 거부하고(`actions.ts:27-30`) GA 도 안 뜨지만, 응답이 **오류 문구**(「검수용 시안이라 …」)와 상단 「운영 사이트가 아닌 검수용 시안이에요」 띠가 생겨 화면이 달라지므로 완성 화면 촬영엔 부적합 → 라이브 + `page.route` 가 낫다.

## 6. 가림 대상 (셀렉터 힌트)

**화면에 글자로 보이는 개인정보·연락처**
| 대상 | 위치·셀렉터 | 비고 |
|---|---|---|
| 참여기업 담당자 **휴대전화 번호**(010-…) · 대표번호 | 프로그램 상세 `a[data-cta-kind="tel"]`(`<span class="tabular-nums">010-…</span>` `detail-cta.tsx:68-77`, 좁은 막대엔 `.sr-only`), 기업 상세 `/company/[slug]` 「연락처」 행 `a[href^="tel:"]`(`company/[id]/page.tsx:237-245`). 예: `/program/gajasoop-01` 이 전화가 **주 버튼**(010-****-**** 가 보임). 라이브 샘플 6개 중 4곳에 번호 있음 | 값은 `010-****-****`, `href` 도 `tel:` 값 지움. 지시 규칙상 「화면 속 전화」 지움 |
| 상담 폼 입력칸 | 이름·소속·이메일·전화 `[data-field=…]` | 우리가 입력하는 값은 **처음부터 가짜**(예: 김○○ / 가상기관 / `user***` / 010-****-**** — 단 전화 input type=tel 형식 검증 `lib/inquiry.ts` 통과 필요 → 규칙 통과 형식의 가짜 번호는 쓰되 화면 글자는 `010-****-****` 로 바꿔 찍을지 촬영 때 결정) |
| 푸터 연락처 | `FOOTER_CONTACT` = **null**(`lib/pending.ts:137-140`) → 푸터에 전화·이메일 줄 없음 | 가림 불필요(확인됨) |
| 도메인·URL 글자 | 화면 글자로 노출되는 URL 은 **없음** — 예약·홈페이지·SNS 는 라벨(「예약하기」「홈페이지」·인스타그램 아이콘)만 보이고 주소는 `href` 에만(`company-section.tsx` 주석 「주소를 글자로 보이지 않고 링크에만」, `detail-cta.tsx:45-66`). 단 상세 본문(`description_html`·`booking_guide`·`notice` 자유 글)에 URL 이 들어 있을 수 있음 → 저장 직전 `https?://·www\.·\.com·\.kr·naver\.me` 정규식 검사 | 샘플 6개 가시 텍스트엔 없었음 |

**지시한 「외부 예약 링크」**
- 위치: 프로그램 상세 주 버튼 `a[data-cta-kind="book"][target="_blank"]`(글자 「예약하기」 + `IconExternal` + `.sr-only (새 창 열림)`, 한 상세에 **4곳**: 인라인 `[data-detail-inline-cta]`·sticky 카드 `[data-cta-place="card"]`·하단 바·상단 바) · 버튼 위 안내 `CtaNote` 「참여기업 사이트가 새 창으로 열려요.」 · 홈페이지·SNS 링크 `a[target=_blank]`(기업 섹션·기업 상세).
- 외부 목적지 예: `cafe.naver.com/…`, `booking.naver.com/…?startDateTime=…`, `naver.me/…`, `pcmap.place.naver.com/…`, `smartstore.naver.com/…`, `instagram.com/…`, 기업 자체 사이트(`*.netlify.app` 등).
- 글자 가림: 화면에 주소 글자가 없으므로 **PNG 는 가릴 것 없음**. **`.json`(요소 사각형·글자·링크)에 들어가는 `href` 를 `[external]` 로 치환**하고 JSON-LD(`offers.url`)·`__next_f` 직렬화 데이터는 DOM 글자가 아니므로 저장 대상에서 제외. 지시 「주소 글자는 가린다」는 이 json·접근성 이름(`sr-only`)·`title` 속성까지 포함으로 해석.

**사진·인물**: 프로그램 사진·히어로 KV 인물은 공개 이미지(하이픈·클라이언트 제공). 얼굴이 보이는 사진 사용 여부는 지시에 제한 없음 → 촬영 때 그대로. 운영기업 로고·상호는 광고주 공개 상호라 가림 규칙상 **그대로 둔다**.

## 7. 사실 후보 (값 · 근거 · 측정 시각 — DB 값은 시점 값)

| # | 사실 | 값 | 근거 |
|---|---|---|---|
| 1 | **공개 프로그램 수** | **52개** | 운영 `GET /api/programs/count` → `{"total":52}` · `/programs` HTML `총 52개`(2026-11-06 07:3xZ). 코드 `lib/data/programs.ts` `base()`=published 만 · `countPrograms:293`. ※ 같은 시각 `sitemap.xml` 은 프로그램 39개를 나열(캐시 생성 시점 차) → **자막은 52(촬영 직전에 재측정)** |
| 2 | **참여기업 수** | **22곳** | 운영 `/companies` HTML 의 `/company/[slug]` 고유 링크 22(`listCompanies` published·slug 있는 행, `programs.ts:619`). sitemap 은 14곳(옛 캐시) |
| 3 | **필터 값 수** | **21개** = 누구와 6 · 어떤 경험 6 · 지역 9 | `lib/filters.ts:11-47`(주석 「03_Filter_Value 21종」 `:2`) |
| 4 | **필터 조합 수** | 한 축에서 1개씩 고르는 조합 **6×6×9 = 324**, 복수선택(같은 축 OR · 축 사이 AND, `discovery.tsx:47-52`·`programs.ts applyFilters`)까지 모두 세면 2^21 = **2,097,152**(선택 안 함 포함). **이 숫자는 사이트에 표시되지 않는 계산값** — 자막에 쓰면 「계산」임을 표시. 사이트가 보여 주는 값은 「여러 항목을 선택할 수 있어요」 | 산식: `lib/filters.ts` 축 크기 + `lib/query.ts:5-9` 정규화 규칙 |
| 5 | **지역 수** | **9** (서울·경기·인천·강원·충청·전라·경상·제주·기타). 공개 프로그램이 있는 지역은 **7**(강원·제주 0건) | `filters.ts:29-39` · 운영 count 실측: 서울10·경기19·인천3·강원0·충청10·전라7·경상2·제주0·기타1(합 52, 07:32Z). 강원 코드는 철자 `ganwon`(오타 유지, `filters.ts:3-5`) |
| 6 | **누구와·경험별 개수** | 누구와: 혼자17·친구연인17·가족25·아이와29·단체31·기업기관23 / 경험: 힐링22·웰니스17·자연체험30·아웃도어15·교육놀이28·문화예술11(복수 선택 값이라 합≠52) | 운영 `GET /api/programs/count?who=…` · `?exp=…`(07:32Z) |
| 7 | **조합 예시 결과 수** | 아이와+자연체험 19 · 가족+힐링+경기 6 · 친구연인+웰니스 6 | 운영 count GET(seq 장면용 조합) |
| 8 | 목록 한 쪽 12개 · 정렬 4종(추천·최신·가격 낮은·높은) · 검색 대상 3필드(프로그램명·한줄설명·상세지역) | 12 / 4 / 3 | `lib/pending.ts:99` · `:64-69` · `:51` |
| 9 | 상세 이용안내 항목 **5**(운영일정·준비물·유의사항·예약안내·취소환불) · 주요 활동 블록 최대 **5** | 5 / 5 | `lib/pending.ts:31-37` · `:44` `MAX_ACTIVITY_BLOCKS` |
| 10 | **B2B 도입 목적 4종**(임직원 복지·교육·조직문화·ESG) + 기타 = 선택지 5 | 4 / 5 | `lib/pending.ts:206-217` |
| 11 | 상담 폼 동의 **3**(필수 2 — 수집·이용, 제3자 제공 / 선택 1) · 동의 버전 `2026-10-09-hypn-r5` | 3 | `inquiry-form.tsx:373-414` · `lib/pending.ts:230-231` |
| 12 | 홈 구성 **6섹션**(KV·탐색·추천·기획전·비즈·소개) · 홈 추천 카드 6 · 탐색 패널 풀 최대 100(현재 52 전부) | 6 / 6 / 100 | `home-view.tsx:11-23,26` |
| 13 | 주최 산림청 · 주관 한국산림복지진흥원 · 슬로건 「요즘, 숲에서 쉬는 법」 | — | `lib/pending.ts:86-90` · `:128-131` |
| 14 | 방문 통계 쿠키 최대 400일 · Google 신호 끔 | 400일 | `lib/pending.ts:192` · `components/analytics.tsx:20`(처리방침 제7조) |
| 15 | 기획전 공개 현재 2건(`campaign-cur-02`·`campaign-cur-03`) | 2 | 운영 `/campaigns` HTML(sitemap 은 cur-01·evt-01 로 옛 값) |

## 8. 브랜드

- 주색 **`#006748`**(primary, 본문·버튼) · 진녹 `#05523a`(strong/푸터면) · 강조 주황 **`#faa634`**(예약 주 버튼 `bg-cta-accent-bg`) · 연두 `#5ebc5e` · 크림 `#f6f0da` · 민트면 `#edf5e4`(탐색 절). 근거 `DESIGN.md:6-25`, `app/globals.css:42-101`(`--color-cta-primary-bg #006748` :96, `--color-cta-accent-bg #faa634` :100).
- 폰트 **Pretendard Variable**(셀프호스트 `app/fonts-pretendard.css`, `public/fonts`) · 대체 `'Pretendard Fallback'`, `--font-sans` `globals.css:109`. 포인트 폰트 별도 없음(`--font-point: var(--font-sans)` :113).
- 로고 원본: `public/assets/logo/logo-full-color.svg`(+ `.webp` 컬러·검정·흰·모노그린, `symbol-tree-*.png`) · 주최·주관 로고 `public/assets/org/{kfs,fowi}-logo-horizontal-color.png` · 히어로·KV `public/assets/kv/kv-full-poster.webp` · `hero-v2/*` · 인물·자연 컷 `public/assets/{people,nature,background}/`. 목록 `public/assets/MANIFEST.md`.

## 9. 다른 세션 점유 (읽기만)

- rc 세션: `rc-list` → `Soopon inactive disabled`(`/home/dev/Soopon`). tmux·claude 프로세스에 soopon 없음.
- 서버·포트: `ps`·`ss -ltnp` 에서 3031~3035 점유 없음. soopon 관련 프로세스 0.
- worktree: `git worktree list` = 본체 하나(`/home/dev/Soopon  f1f890c [main]`). `PROGRESS.md` 에 적힌 `/home/dev/Soopon-wt-v28`·`-v28b` 는 이미 없음(`ls /home/dev` 에 없음).
- 로컬 브랜치 다수(`feat/about-v3·v4-live·v4r2·v4r3·campaign-preview·client-0929·consent-r3·r5·design-v2·naver-verify …`) — 전부 main 에 병합된 작업 브랜치로 보임, 이번엔 안 건드림.
- 작업 트리 92줄 = 전부 `??`(문서·시안 부산물), 형제 세션이 진행 중이라는 증거는 없음(rc 비활성).

## 10. 지시와 코드가 다른 점

1. **「숲ON 처방전」 없음** — 코드·라이브 4개 화면에서 「처방」 0건. 대응 화면은 홈 탐색 「내게 맞는 숲 프로그램을 찾아보세요.」(`components/discovery.tsx:65-67`).
2. **필터 「단계」(고민→동반자→지역→일정) 없음** — 단계 흐름이 아니라 3축 동시 선택: 누구와·어떤 경험·지역(`lib/filters.ts:41-45`), 홈은 1024↑ 칩 패널 / 1023↓ 3버튼+시트(`discovery.tsx:76,149`). 「고민」은 「어떤 경험」, 「동반자」는 「누구와」로 대응. **「일정」 축 없음**(프로그램 `operating_schedule` 글만 상세 이용안내에 있음 `pending.ts:32`, 날짜 검색·필터 없음). 단계 흐름 시퀀스(`states/<흐름>/NN`)는 「칩 선택 누적」(예: 아이와 → +자연체험 → +경기)으로 대신 구성해야 함.
3. **결과 목록이 두 곳**: 홈 탐색 패널(최대 4행 2×2, 1024↑만, `discovery.tsx:253`) vs `/programs`(12/쪽). 1023↓ 홈에는 결과 패널이 없고 「결과 보기 (N개)」로 `/programs?…` 로 이동(`discovery.tsx:138-141`).
4. **「B2B 비즈 페이지」 = 「숲ON비즈」 `/b2b`**(이름 다름) · **「상담 신청 폼」은 별도 화면이 아니라 `/b2b#inquiry` 절이자 `/b2b/inquiry` 단독 페이지**(같은 `InquiryForm`). **제출 API 는 없음 — 서버 액션**(`b2b/actions.ts:26`, 가로챌 대상은 `Next-Action` POST).
5. **「외부 예약 링크 주소 글자」가 화면에 없음** — 버튼 라벨 「예약하기」 뿐, 주소는 `href` 에만(`detail-cta.tsx:45-66`). 가림 대상은 json 의 링크 `href`.
6. **「캠페인 랜딩」이지만 다중 페이지 사이트**(프로그램 목록·상세·기획전·참여기업·소개·처리방침 + 비공개 어드민). 촬영 7화면은 전부 공개 라우트.
7. **sitemap(캐시)이 라이브보다 옛 값**: 프로그램 39·기업 14·기획전 cur-01/evt-01 ↔ 라이브 52·22·cur-02/03. 같은 `sitemap.xml` 으로 목록을 뽑지 말고 `/programs`·`/companies` 를 쓸 것.
8. 시드·샘플 문서(`seed/README.md` 프로그램 14·기업 5)와 런북 「공개 12건」(`lib/program-cta.ts:4`(주석) 실측 10-03)은 옛 값 — 현재 52.

## 추천 촬영 경로 (결정은 메인 세션)

1. **운영 공개 화면(sooponfesta.com) 직접 촬영 + `page.route` 로 GA 전부 차단, 비-GET 전부 가로채기** — 1순위. 지시 7화면이 전부 비로그인 공개이고 데이터(52·22)가 실물. 상담 「제출 후」 화면만 서버 액션 flight 응답을 fulfill(첫 시도 검증, 안 되면 BLOCKED 가 아니라 폼 입력 전·중·검증 오류 3단계로 대체).
2. 전화번호(010-…)는 상세 `a[data-cta-kind=tel]`·기업 상세 연락처를 촬영 직전 DOM 치환 + json `href` 치환. 예약 링크는 클릭 금지, json `href` 만 `[external]`. seq 는 §3 의 A(홈 칩 → 결과·히어로 인물)와 B(390 시트 → 개수) 를 `page.clock` + `getAnimations()` 방식으로.
3. 로컬 사본은 불필요(필요하면 `SOOPON_PREVIEW=1` 은 화면이 달라져 부적합 — service_role 비운 임시 env 로 prod 빌드).

## 막힌 것

- 없음. 미확인: 배포 id 직접 확인(Vercel 토큰이 `.env.local` 이라 조회 안 함 — PROGRESS 기록 + live meta 로 대체) · 서버 액션 가짜 응답 형식 · 상세 본문 자유 글 안 URL 전수(샘플 6개만 확인) · 로컬 Supabase 재생 가능 여부.
