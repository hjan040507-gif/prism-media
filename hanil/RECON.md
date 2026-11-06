# hanil(한일금속공업 홈페이지 + CMS) 촬영 전 사전 조사 — RECON

조사 시각 2026-11-06 07:2x–07:4xZ · 읽기 전용(코드 읽기 + 운영 GET 수 회 · 브라우저·서버·빌드·DB 쿼리 0 · 비밀값 기록 0).
레포 = `/home/dev/hanil` (HEAD `8a0ee85` 브랜치 `main` · 10-15 커밋 · worktree 는 본체 하나뿐 · 마지막 운영 배포 `dpl_7vzu3gAv6WieFr5MzKCAeWNKpFG4` = `PROGRESS.md:688-690` 부근).

## 0. 먼저 알아야 할 것 (촬영 방식을 바꾸는 사실 6개)

1. **사이트는 이미 오픈했다 — 지시·브리프의 "오픈 전/임시 주소" 는 낡았다.** 2026-10-02 커스텀 도메인 연결·검색 개방(`PROGRESS.md:649-656`), 라이브 실측 `https://www.hanil-pnk.com/` 200 · `hanil-pnk.com` → www 308 · robots `Allow /`(`Disallow /admin`·`/docs/`) · sitemap 28 URL. 임시 주소 `hanilmetal-liart.vercel.app` 은 아직 200 이지만 `X-Robots-Tag: noindex`(`next.config.ts` host 조건). `hanil-metal.md` 의 `status: preopen`·"오픈 전 임시 주소 비공개" 방침은 낡았다 → **공개 화면은 www 를 찍으면 되고 임시 주소는 쓸 일이 없다.** (포트폴리오 표기 결정은 메인 세션.)
2. **서버에 `.env.local` 이 있고(읽지 않음) 운영 DB 를 가리킨다.** 관리자는 운영 Supabase(서울) 하나뿐, 별도 스테이징 없음. 관리자 계정은 고객 1개뿐이고 비밀번호는 고객 소유(`docs/admin-account-handover.md:7-12`) → **운영 관리자 촬영 불가, 로컬 Supabase 로만.**
3. **로컬 Supabase 는 가능하다(이 서버가 준비돼 있음).** 마이그레이션 12개(`supabase/migrations/0001~0012`, 총 731줄)가 확장·cron 없이 순수 SQL + `storage.buckets` insert 만 쓴다. 단 레포에 `supabase/config.toml` 도 `seed.sql` 도 없다 → 레포 밖 사본에서 `supabase init` 하고 마이그레이션 폴더를 복사해야 한다(§1). docker 이미지(gotrue 2.196/2.197·postgrest·storage-api 1.72.1·kong·postgres 17.x·realtime·postgres-meta·mailpit)는 이미 캐시돼 있다.
4. **관리자 인증은 우회 없이 로컬에서 정상 로그인 가능하다.** `src/proxy.ts`(Next 16 proxy, matcher `/admin/:path*`)가 `supabase.auth.getUser()` 로 막고, 각 레이아웃·서버 액션이 `is_admin()`(= `admin_emails` 허용목록, `0004`)로 재검증한다(`src/lib/admin-guard.ts:14-36`). 로컬 DB 에 가짜 이메일로 계정을 만들고 `admin_emails` 에 넣으면 로그인 화면(`signInWithPassword`, `src/app/admin/login/page.tsx:17`)부터 그대로 간다. **`0004` 마이그레이션이 고객 실제 이메일을 `admin_emails` 에 insert 한다**(`0004_admin_allowlist.sql:24-26`) — 로컬 DB 라 새지 않지만 화면에 그 주소가 뜨지 않게 가짜 계정으로만 로그인한다.
5. **사진 슬롯 기본 사진은 Storage 가 아니라 코드·정적 파일에 있다.** 146자리 전부 `public/images/**` 정적 파일 + 코드 레지스트리(`product-media.ts`·`background-media.ts`). DB `media_overrides`(교체·초점·숨김만)와 Storage 버킷 `product-media` 는 "교체한 것만" 담는다 → **빈 로컬 DB 로도 사진 교체 목록·슬롯 카드·초점 지정 모달이 실제 사진으로 채워져 나온다.** 교체 시연(업로드 → 미리보기)만 로컬 Storage 가 필요.
6. **운영 라이브의 쓰기 경로는 폼 쪽 하나지만 크다.** 견적 폼에서 파일을 고르는 즉시 브라우저가 운영 Storage `attachments` 에 직접 업로드한다(`SupportForm.tsx:35`), 제출은 서버 액션이 service role 로 `inquiries` insert + Resend 알림 메일을 **고객 수신자에게 실발송**한다(`support/actions.ts:77-103`, `PROGRESS.md:673-680`). → 운영에선 폼을 채우는 장면까지만(파일 선택·제출 금지). 제출 단계는 로컬 사본에서(`RESEND_API_KEY` 없으면 기록만 `skipped_unverified`).

## 1. 스택·실행

| 항목 | 값 · 근거 |
|---|---|
| 프레임워크 | Next.js **16.2.12** App Router · React 19.2.4 · TS 5 · Tailwind v4 · `@supabase/ssr` ^0.7 · `@supabase/supabase-js` ^2.110.8 · dnd-kit(관리자 정렬) · `package.json` |
| 패키지 매니저·node | npm(`package-lock.json`). node 22.23.1 이 서버에 있음. `node_modules` 는 지금 없음(설치 필요 — 이 단계에선 안 함). `AGENTS.md` 가 "이 Next 는 학습 데이터와 다르다 — `node_modules/next/dist/docs/` 를 먼저 읽어라" 고 지시 |
| 명령 | `npm run build`(`next build`) · `npm start` · `npm run dev` · `npm run lint`. 테스트 러너 없음, 검증은 `scripts/verify-*.mjs` |
| 로컬 서버 규칙 | `PROGRESS.md:3` — 검증 서버는 `-H 127.0.0.1` 로만. 같은 레포의 오래된 `next start` 가 `.next` ISR 캐시를 덮을 수 있음(`:111` 근방). 레포가 쓰던 `3100·3101` 은 지금 쓰지 말고 빈 포트를 쓴다 |
| env 필수 | `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY`(접수 저장·크론·시드) |
| env 선택 | `NEXT_PUBLIC_SITE_URL`(기본 `https://www.hanil-pnk.com`, `src/lib/seo.ts:9`) · `CRON_SECRET` · `RESEND_API_KEY`·`NOTIFY_FROM`(없으면 알림 기록만) · `GOOGLE_SITE_VERIFICATION`·`NAVER_SITE_VERIFICATION` · 스크립트용 `SUPABASE_ACCESS_TOKEN`·`ADMIN_EMAIL`·`ADMIN_PASSWORD`·`BASE` 등. `.env.example` 은 없다 |
| 로컬 Supabase | 레포 `supabase/` 에는 `migrations/` 와 `.temp/linked-project.json`(운영 연결 표시)뿐, `config.toml`·`seed.sql` 없음. 방법: 레포 밖 폴더에서 `supabase init` → `migrations/*.sql` 12개 복사 → `supabase start`(CLI 2.117 `~/bin`). **포트 충돌 주의**: 이 서버에 junimal(`54811`·`54812`)·luvo-judge(`55931`·`55932`) supabase 컨테이너가 돌고 있고 `5432`·`3312`·`3475`·`3493`·`3494` 등이 점유 중 → `config.toml` 에서 다른 포트 지정. CLI 기본 이미지 태그가 캐시와 다르면 추가 pull(미확인) |
| 마이그레이션 의존 | `storage.buckets` 4개(`library`·`attachments`·`site`·`product-media`) insert, JWT 이메일 기반 `is_admin()`. 확장·`pg_cron` 없음 → 12개 전부 필요(`0006` 알림 로그·설정, `0010/0011` system_status, `0012` 보유 기간 트리거) |
| 로컬 사본 | `supabase init` 이 레포 안에 쓰므로 사본은 레포 밖(메인이 `git worktree add`/`git archive` 를 승인하는 방식은 메인 결정). 사본 `.env.local` 은 **운영 값을 복사하지 말고** 로컬 URL·로컬 anon/service 키로 새로 만든다 |
| 데모 데이터 | 없음. 가짜 접수·공지·자료는 로컬 DB 에 service role 로 직접 insert(`inquiries`·`notices`·`library_files`). 관리자 계정은 `scripts/seed-admin.mjs <가짜이메일> <10자+영문숫자>`(`.env.local` 의 URL·service 키를 읽음 — 사본에서만) |

## 2. 라이브 주소·상태 (`curl -sI`/GET 만 · 요청 사이 1초 이상)

| 주소 | 결과 |
|---|---|
| `https://www.hanil-pnk.com/` | 200 · Vercel · x-robots 없음(색인 개방) |
| `https://hanil-pnk.com/` | 308 → `https://www.hanil-pnk.com/` |
| `/robots.txt` | 200 · `Allow: /` · `Disallow: /admin` · `Disallow: /docs/` · sitemap 선언 |
| `/sitemap.xml` | 200 · `<loc>` 28개(`src/app/sitemap.ts:11-37`: 정적 16 + 공정 12) |
| `/api/health` | 200 · `{"ok":true,"cronLastRunAt":"2026-11-06T00:31:13Z","cronLastOk":true}` (읽기만. `cron/daily` 는 `CRON_SECRET` 필요) |
| `/admin/login` | 200(로그인 화면은 공개, 로그인은 금지) |
| `https://hanilmetal-liart.vercel.app/` | 200 · `x-robots-tag: noindex`(임시 주소 — 촬영·표기에 쓰지 않는다) |
| 홈 히어로 3장 | 라이브 HTML 에 `main-hero-1/p1-i2.webp`·`main-hero-2/hero-aircraft.webp`·`main-hero-3/hero-space.webp` = 레포 `content.ts` IMG 와 일치. `/product` 의 `<table>` 1개 = 체계도 표도 일치 → **라이브 = 레포 HEAD 로 보인다**(완전 일치는 촬영 때 확인) |
| 공지·자료 | `/support/notice` 에 "등록된 공지사항이 없습니다" 문구가 **없음** → 실제 공지가 올라 있을 가능성(제목·내용 미열람, 촬영 전 가림 판단) · `/support/library` 는 빈 상태 문구 있음(자료 0건) |

주의: 이 서버 IP 는 반복 요청 시 Vercel 체크포인트(헤드리스 Chrome 도 Code 21)에 약 10분 막힌 적이 있다(`PROGRESS.md:644`). 페이지 사이 간격을 두고, 막히면 우회 시도 없이 로컬 사본으로 전환.

## 3. 지시 항목 ↔ 실제 라우트·컴포넌트 (file:line)

| 지시 | 실제 | 근거 |
|---|---|---|
| 메인 히어로(크로스페이드·간격) | `/` · `HeroCrossfade` 3장, **6초 간격**(`interval = 6000`) · 불투명도 전환 **1400ms ease-out** · 장마다 `scale-[1.05]`·blur(1번 1.5px, 2·3번 0px) · 우하단 번호 `01 / 03` + 3칸 프로그레스바(자동재생 때만, 클릭으로 이동) · `prefers-reduced-motion` 이면 자동 전환 정지 | `src/app/(site)/page.tsx:80` · `src/components/site/HeroCrossfade.tsx:16,62` · `src/lib/background-media.ts` HOME_SLIDES |
| 인사말 | `/company/greeting` | `src/app/(site)/company/greeting/page.tsx` · `GreetingBody.tsx` · 내용 `content.ts:77` |
| 연혁 | `/company/history`(타임라인 18건) | `.../company/history/page.tsx` · `content.ts:137` |
| 인증 | `/company/certifications`(8종, 실스캔 도판) | `.../company/certifications/page.tsx` · `content.ts:181` |
| (같은 메뉴) | 회사현황 `/company/profile` · 조직도 `/company/organization` · 오시는 길 `/company/location` — 회사소개 6페이지 | `NAV` `content.ts:36` |
| PRODUCT 랜딩 · 공정 체계도 | `/product` · "표면처리 공정 체계도" = `ProcessMatrix`(데스크톱 rowSpan 표 + 행별 화살표 링크 / 모바일 카드 리스트) · 6대분류 · 상세 21행 | `src/app/(site)/product/page.tsx:54-67` · `components/site/ProcessMatrix.tsx` · `content.ts:1053` |
| 공정 상세 | `/product/[id]` · **12종**: `isonite-tf1`·`isonite-tf-plus`·`isonite-ls`·`gas-nitriding`·`defric`·`dlc`·`phosphate`·`td-coating`·`pvd-coating`·`vacuum-heat`·`gas-carburizing`·`vacuum-carburizing` · 본문 `ProcessSections` · 상단 `ProcessStepBar`(GUIDE+8소분류) | `src/app/(site)/product/[id]/page.tsx:16-18` · `content.ts:231`(PROCESSES)·`1184`(PRODUCT_CATEGORIES) |
| 설비현황 3탭 | `/facility` · `Tabs`(패널 전량 SSR, 비활성 `hidden`) · `주요 제조 설비(1)` 9행 / `주요 제조 설비(2)` 6행 / `주요 측정 기기` 9행 · 열 `설비명·형식·사양·능력·수량` | `src/app/(site)/facility/page.tsx:45-80` · `content.ts:624` · `components/site/Tabs.tsx` |
| R&D | `/rnd` — "차세대 표면처리 기술을 준비합니다" · 01 연구 방침 + 02 연구 분야 | `src/app/(site)/rnd/page.tsx:19-50` · `content.ts:678` |
| ESG | `/esg` · 3분야(환경 8·사회 7·지배구조 8 = 23항목) · 앵커 TOC | `src/app/(site)/esg/page.tsx` · `content.ts:715` |
| 문의 폼 | `/support/contact` · `SupportForm` · 필수 회사·이름·이메일·전화·내용 | `src/app/(site)/support/contact/page.tsx` · `components/site/SupportForm.tsx` |
| 견적 폼 | `/support/quote` · 공정 선택(12종 이름)·소재·수량·**첨부(10MB, 브라우저→Storage 직접 업로드)** | `src/app/(site)/support/quote/page.tsx:16,39` · `SupportForm.tsx:35` |
| **제출 API** | `/api/inquiries` 가 아니라 **서버 액션 `submitInquiry`**(허니팟 `website` · 최소 작성 3초 `_ts/_now` · 서버 검증 · service role insert · `after()` 알림). REST 직접 insert 는 `0007` 로 닫힘 | `src/app/(site)/support/actions.ts:27-103` · `0007_close_public_insert.sql` |
| 모바일 메인·공정 상세 | 같은 라우트의 390 뷰포트(별도 모바일 라우트 없음). 햄버거 메뉴·체계도 카드 리스트·공정 상세 도판 | `SiteHeader.tsx` · `ProcessMatrix.tsx` |
| 관리자 · 사진 교체 | **두 화면**: `/admin/backgrounds`("배경 사진" 23영역 39장 — 슬롯 카드 선택 → `PhotoDialog` → **`FocalPicker`**(십자선 드래그·방향키, 오른쪽에 데스크톱 16:9·휴대폰 9:16 실시간 미리보기)) / `/admin/product-photos` → `/admin/product-photos/[id]`("제품 사진" 12공정 본문 도판 107장 — 교체·추가·숨김·순서, 초점 없음) | `src/app/admin/(dash)/backgrounds/page.tsx` · `product-photos/page.tsx`,`[id]/page.tsx` · `components/admin/media/{PhotoDialog,FocalPicker,PhotoCard,GallerySection}.tsx` · 저장 `src/app/admin/media-actions.ts` |
| 관리자 · 문구 수정 | `/admin/content`(허브) → 하위 폼 17개: `home`(히어로 문구)·`greeting`·`company`·`profile`·`history`·`certifications`·`facility`·`rnd`·`esg`·`esg-text`·`organization`·`location`·`images`·`support`·`process`·`process/[id]`·`process-guide`. 저장은 `site_content`(jsonb) override, 공개 페이지는 SSG 유지 + 태그 재검증 | `src/app/admin/(dash)/content/**/page.tsx` · `components/admin/content/forms/*` · `src/app/admin/content-actions.ts` · `lib/content-live.ts` |
| 관리자 · 문의·견적 접수함 | `/admin/inquiries`(목록, 신규/답변완료 필터 `?status=`, 문의·견적 한 목록) + `/admin/inquiries/[id]`(상세, 접수일시 KST, 첨부 서명 URL, 상태 토글 `setInquiryStatus`) · AdminNav `접수함` 신규 뱃지 | `src/app/admin/(dash)/inquiries/page.tsx:13-65` · `[id]/page.tsx:13-50` · `components/admin/AdminNav.tsx:7-33` |
| (같이 있는 관리자) | 대시보드 · 공지 관리 `/admin/notices`(+`new`·`[id]/edit`) · 자료실 `/admin/library` · 알림 설정 `/admin/notifications` · 내 계정(비밀번호 변경) `/admin/account` | `AdminNav.tsx:7-15` |
| seq 1 히어로 크로스페이드 | `HeroCrossfade` — `setInterval(6000)` + CSS transition 1400ms. `page.clock` 으로 멈추고 6000ms 단위 `runFor` + `getAnimations()` 시간 맞춤으로 프레임화 가능(촬영 때 확인) | `HeroCrossfade.tsx:16,37-40,62` |
| seq 2 체계도 → 상세 이동 | `/product` 체계도 행 링크(`Link`) → `/product/<id>`. 21개 링크 전부 유효 라우트(`PROGRESS.md:104` 부근 기록) | `ProcessMatrix.tsx` |

## 4. 테스트·관리자 계정 (파일 경로와 변수 이름만)

- **운영 관리자 계정은 고객 1개**(`docs/admin-account-handover.md:7-12`, 개발·검증용 계정은 9월 14일 전부 삭제). 비밀번호는 고객이 정했고 인계 PDF(`outputs/한일금속공업_관리자가이드.pdf`, git 미추적)에만 있다. → **촬영에 쓰지 않는다.**
- **레포가 주는 방법**: `scripts/seed-admin.mjs <이메일> [비번]`(service role 필요, `admin_emails` 에도 등록) · 삭제 `scripts/remove-admin.mjs` · 변수 이름 `NEXT_PUBLIC_SUPABASE_URL`·`SUPABASE_SERVICE_ROLE_KEY`(`.env.local` 에서 읽음). **로컬 사본에서만** 쓴다 — 운영 `.env.local` 로 돌리면 운영에 계정을 만든다.
- 비밀번호 규칙(가짜 계정): 10자 이상·영문·숫자(`src/lib/password-rule.ts`, `seed-admin.mjs:36`).
- 공개 사이트에는 로그인이 없다(폼은 익명 제출).
- 기존 캡처 자산(재촬영 대신 참고 — 내용 미열람): `docs/admin-guide/*.png` 10컷(1440×1000·DSF 1, `file` 로 확인: 로그인·콘텐츠 허브·공정·이미지·자료실·제품 사진 3·배경 사진 2(`backgrounds-focal.png` 포함)), `_handoff/**`(gitignored 로컬 캡처 — `product-media/01-공정목록-375.png` 등, `notify-live-check/`·`open-intake-check/` 는 "[오픈 점검] 테스트 접수" 행이 찍혀 있을 수 있음). 운영 실제 관리자에서 찍은 것이라 실데이터 혼입 가능·DSF 2 규격 불일치 → 재촬영 권장.

## 5. 쓰기 위험 (GET 인데 서버가 쓰는 경로 · 외부 유료/실발송)

| 경로 | 위험 | 대응 |
|---|---|---|
| `GET /api/library/[id]/download` | `increment_download` RPC 로 **다운로드 수 +1**(`route.ts:13`). 운영 자료실은 지금 0건 | 열지 않는다 |
| 견적 폼 **파일 선택** | 선택 즉시 운영 Storage `attachments/quote/<uuid>.<ext>` 업로드(`SupportForm.tsx:35`). 제출 안 해도 고아 파일 남음 | 운영에선 파일 선택 금지 |
| 문의·견적 **제출** | `inquiries` insert + Resend 알림 **실발송**(`notify.ts`; 10-07 실측 `PROGRESS.md:673-680`) | 운영 제출 금지. 제출 흐름은 로컬 사본, 또는 운영에서 `page.route` 로 서버 액션 POST(`Next-Action` 헤더)를 가로채 성공 응답 반환 |
| `/api/cron/daily` | 하트비트(`system_status` upsert)·파기·재발송 — `CRON_SECRET` 없이는 401 | 호출 금지 |
| `/api/health` | 읽기만 | 괜찮음 |
| 공개 페이지 GET | `site_content`·`media_overrides`·공지·자료를 읽기만(anon, `unstable_cache`). 열람 기록·조회수 없음(코드 grep: 쓰기 호출은 `support/actions.ts:78`·`cron/daily:93`·`notify.ts:104-105`·`versioned-write.ts`·`download` RPC 뿐) | 괜찮음 |
| 관리자(운영) | 로그인 자체가 금지 | 로컬 사본만 |
| 유료 호출 | Resend 메일만 · AI 호출 없음 | 로컬은 `RESEND_API_KEY` 비워 둔다 |
| Vercel 체크포인트 | 연속 요청으로 IP 약 10분 차단(`PROGRESS.md:644`) | 요청 간격 두기 |

## 6. 가림 대상 (셀렉터 힌트)

- **공개 화면**: 회사 대표번호·팩스·주소·이메일은 회사 공개 정보(푸터 `SiteFooter.tsx`, `/company/profile`, `/company/location`, `/privacy`)라 원칙적으로 가림 불필요. 단 `hanil-metal.md` 가 "공정 도판·설비 사진은 클라 자산(개별 재배포 금지)" 이라고 적었으므로 **도판·설비 사진 노출 수준은 메인이 결정**. `/support/notice` 는 실제 공지가 있을 수 있어 제목·내용 확인 후 판단.
- **관리자(로컬)**: 가짜 계정이라 무방하나 **고객 실제 이메일이 화면에 뜨지 않게** 확인(`/admin/account` 의 현재 계정, `src/app/admin/(dash)/layout.tsx` 헤더, 대시보드). 접수함은 로컬 가짜 데이터만(회사명·이름·이메일·전화·내용 전부 `[촬영용]` 접두).
- 촬영 JSON 에는 DOM 사각형·글자만 저장(env 값·`<head>` 의 `google-site-verification`·`naver-site-verification` 메타 제외).

## 7. 사실 후보 (값 · 근거)

| 사실 | 값 | 근거 |
|---|---|---|
| 페이지 수(공개) | **28 URL**(sitemap) = 정적 16(홈 1·회사소개 6·PRODUCT 랜딩·설비현황·R&D·ESG·고객지원 4·개인정보처리방침) + 공정 상세 12. 공지 상세 `/support/notice/[id]` 는 동적·sitemap 제외. 라이브 `<loc>` 28 실측 | `src/app/sitemap.ts:11-37` + 라이브 curl |
| 페이지 수(라우트 파일) | `(site)` page.tsx **18개**(공정 12종은 `[id]` 1파일) · 관리자 page.tsx **31개**(로그인 1 포함) · API route.ts 3개 · 그 밖 `opengraph-image`·`icon`·`robots`·`sitemap`. 브리프의 "정적 라우트 33개(빌드 33/33)" 는 빌드 출력 기준이라 이 단계에서 **재현 미확인**(기록은 `PROGRESS.md:20` 32/32 → `:133` 33/33) | `find src/app -name page.tsx` |
| 공정 수 | **12종** · 체계도 6대분류·상세 21행 · IA 8소분류(`기타 PROCESS` 하위 5) | `content.ts:231,1053,1178,1184` |
| 사진 교체 슬롯 수 | **146자리 = 제품 본문 도판 107 + 상단 배경 39**. 도판: 슬롯 전체 111·렌더 107·미렌더 4(`isonite-tf-plus.image36·37·39·40`, 관리자 비노출) · 배경 23영역 39장 · **갤러리형 섹션 26개**(추가·삭제·순서 변경 가능)/전체 섹션 43개. 공정별 도판: TF1 6·TF+ 12·LS 15·가스질화 31·DEFRIC 6·DLC 8·화성처리 3·T.D 9·PVD 8·진공열처리 3·가스침탄 3·진공침탄 3(합성본 칸 6은 가스질화). 오늘 `scripts/report-slots.mjs` 읽기 전용 실행 결과이며 `PROGRESS.md:588`("제품 사진 107 + 배경 39 = 146")과 일치 | `scripts/report-slots.mjs` 출력 · `background-media.ts`(`BG_SLOT_COUNT`) · `product-media.ts` |
| 설비현황 | 3탭 24행(9+6+9). 브리프의 "49항목" 은 코드로 못 맞춤 → **미확인(24행이 코드 근거)** | `content.ts:624` 를 읽어 센 값 |
| 연혁·인증·ESG | 연혁 18 · 인증 8 · ESG 3분야 23항목(8+7+8) | `content.ts:137,181,715` |
| CMS 편집 섹션 | `/admin/content` 하위 폼 17 · 저장 키 `site_content`(key,jsonb) | `src/app/admin/(dash)/content/**` · `0002` |
| 기획서 원문 대조 결과 | 원문(클라 PPT 88슬라이드) **파일은 레포에 없다**(`assets/` 는 OG 폰트·로고·그래프 3장뿐, `docs/specs/` 비어 있음). 대조 기록은 `PROGRESS.md`: 2단계 "원문 누락 없음(연혁18·ESG23·공정12)"(`:20`) · 3차 감사 원문 정합 복원 6건(`:117-124`) · 2차 검토안 58p 전수 재대조 — 미이행 10건 적발·수정(`:213-219`) · 확인페이지 12건 원본 우선(`:220-228`). 브리프의 "문장 617개 대조 스크립트·누락 0" 은 `hanil-metal.md` 에만 있고 레포에서 스크립트·결과를 못 찾음 → **미확인**. 수치를 자막에 쓰려면 근거가 PROGRESS 서술 수준 | `PROGRESS.md:16,20,96-123,213-228` |
| 접근성 점수 | 기존 기록: **Lighthouse(모바일) Accessibility 100**(2026-07-27 오픈 전 QA, 푸터 대비 수정 후) · Best-Practices 100 · SEO 69(당시 noindex 때문, 오픈 후 해제) · Performance 25(레포가 "측정 호스트 CPU 스로틀 아티팩트"로 판정 — 쓰지 말 것). 8-10 디자인 변경 뒤 재측정 기록은 **없음** → 영상용 점수는 **촬영 때 라이브 재측정** 메모. 대비 실측 본문 8.6:1·보조 4.9:1·기능 블루 5:1·크림슨 9.7:1(8-10 기록) | `PROGRESS.md:76-79,130` |
| 이미지 용량 | `21.8MB → 3.7MB` 기록 있음(`PROGRESS.md:187`). "76매·83%" 는 미확인 | `PROGRESS.md:187` |
| 운영 상태 | 알림 메일 실발송 가동(2026-10-07 12/0) · 함수 리전 icn1 · 크론 하트비트 라이브 `ok:true` | `PROGRESS.md:673-680` · 라이브 health |
| 성능(선택) | 리전 iad1→icn1 후 health 761→110ms · 접수함 1891→391ms · 견적 액션 465→105ms(10회 중앙값) | `PROGRESS.md:641-645` |

## 8. 브랜드

| 항목 | 값 · 근거 |
|---|---|
| 팔레트(3색 체계) | 딥네이비 `#0B1B33`(navy2 `#0c1f3a`·navy3 `#12294a`·deep `#081527`) · 로고 블루 `#098FD6` · 버건디 `#990033`(**PRODUCT 영역 전용**, 타 페이지·대면적 금지) · 보조 `#8fb0da`·`#6f8bb3` — `src/components/site/ui.ts:33-46` |
| 서브/본문 | 흰 배경 본문 `#33445c`·`#1e2c40`, 표면 `#F7F8FA`·`#EEF2F7`, 보더 `#E3E8EF`, 기능 블루 `#0a6aa1` — `PROGRESS.md:125-139` · `page.tsx` 클래스 |
| 구조 | 헤더 네이비(상단 투명→스크롤 시 `#0B1B33/92`) · 히어로·CTA·푸터 다크, 중간 섹션 화이트 — `PROGRESS.md:133-139` |
| 폰트 | Pretendard Variable 자체호스팅(동적 서브셋 woff2, `pretendard-subset.css`) — `src/app/globals.css:2,6` |
| 로고 | `public/logo-mark.svg`(블루)·`logo-mark-white.svg`·`logo-mark-current.svg` — `PROGRESS.md:12` |
| 모션 | 외부 라이브러리 0 — CSS + IntersectionObserver(`Reveal.tsx`) + 히어로 크로스페이드 + `CountUp.tsx`. 촬영 땐 끝까지 스크롤해 `Reveal` 을 다 띄워야 한다(`PROGRESS.md:130` 주의 문구) |
| 관리자 UI | 사이트와 분리된 **다크 네이비 미니멀 셸**(`bg-white/[0.03]` 입력·`text-neutral-100`) — `admin/login/page.tsx:34` 부근 · `AdminNav.tsx` |
| DESIGN.md | 레포 `DESIGN.md` 는 **빈 템플릿**(`<프로젝트 이름>` 그대로) — 브랜드 근거로 못 쓴다 |

## 9. 다른 세션 점유 (읽기만 — `ps`·`ss -ltnp`·`rc-list`)

- `rc-list` 에서 `hanil  inactive  disabled  /home/dev/hanil` → **hanil 의 rc 세션은 꺼져 있다.**
- `/home/dev/hanil` 을 cwd 로 가진 리슨 프로세스 **없음**(listen 중 PID 의 cwd 전수 확인). `ss` 의 `next-server` 는 3312(127.0.0.1)·3417·3475·3493·3494·38791 — hanil 소유 없음(3494 는 Medimajor dev). supabase 컨테이너: junimal(`54811`·`54812`)·luvo-judge(`55931`·`55932`) — 건드리지 않았고 로컬 Supabase 를 띄울 땐 이 포트를 피한다.
- 레포 `.claude/` 에 `scheduled_tasks.lock`·`settings.local.json` 있음(세션 흔적) — 접근 안 함. git worktree 는 본체 1개.
- **내 실수 1건(원복 완료)**: `~/bin/supabase --version` 을 레포 cwd 에서 불렀더니 `supabase/.temp/cli-latest`(6바이트, 신버전 안내 캐시)가 생겼다. 같은 세션에서 발견해 그 파일 하나만 삭제 → `git status --short` 빈 출력 확인. 기존 `supabase/.temp/linked-project.json` 은 그대로. 메인 세션은 레포 cwd 에서 `supabase` CLI 를 부르지 않는다(항상 사본 폴더에서).
- `node --experimental-strip-types --import ./scripts/_ts-imports.mjs scripts/report-slots.mjs` 를 레포 cwd 에서 읽기 전용 1회 실행(콘솔 출력만, 파일·빌드·서버 없음) — `git status` 변화 없음.

## 10. 지시와 코드가 다른 점

1. **"오픈 전이면 임시 주소 — 임시 배포 주소 비공개"**: 이미 10-02 오픈, 실도메인 `https://www.hanil-pnk.com` 공개(`PROGRESS.md:649`, 라이브 200). 브리프 `hanil-metal.md` 의 `status: preopen` 은 낡음.
2. **"worktree 로컬 + 로컬 DB"**: 가능하나 레포에 `supabase/config.toml`·`seed.sql` 이 없어 추가 준비(사본에서 `supabase init`·가짜 계정·가짜 데이터 insert) 필요.
3. **"사진 교체(슬롯 선택→초점 지정 미리보기)"는 한 화면이 아니다**: 초점(FocalPicker)은 **배경 사진**(`/admin/backgrounds`)에만 있고 **제품 사진**(`/admin/product-photos`)은 교체·추가·숨김·순서만 — `PhotoDialog.tsx:222`(`focalX: isBg ? focal.x : null`).
4. **"문구 수정"**: 단일 화면이 아니라 `/admin/content` 허브 아래 폼 17개 — 찍을 폼을 정해야 함(추천: `home` 히어로 문구 또는 `greeting`).
5. **"문의·견적 접수함"**: 문의와 견적이 한 목록(`/admin/inquiries`, `type` 열)에 섞여 보임. 별도 화면 2개 아님.
6. **"고객지원(문의·견적 폼 — 제출 API)"**: REST API 가 아니라 **서버 액션**(`support/actions.ts:27`) — `/api/inquiries` 같은 고정 경로 없음(`PROGRESS.md:30` 의 옛 기록은 `0007` 로 폐기됨). 견적 첨부 업로드는 제출 전에 Storage 로 직접 나간다(`SupportForm.tsx:35`).
7. **"공정 상세 3종 이상"**: 12종 전부 있음 — 후보 `isonite-tf1`(6슬롯)·`gas-nitriding`(31슬롯·합성본 6칸·4응용, 가장 풍부)·`dlc`·`vacuum-carburizing`.
8. **"설비현황 3탭"**: 탭 이름은 `주요 제조 설비(1)`·`주요 제조 설비(2)`·`주요 측정 기기`(내부 id `manufacturing`·`manufacturing2`·`measuring`). 브리프 "49항목" 은 코드(24행)와 불일치.
9. **"기획서 원문 대조 결과(레포 docs 의 기획서·대조 기록 경로)"**: 레포 `docs/` 에 기획서 원문도 대조표도 없다 — 기록은 `PROGRESS.md`(§7)뿐. 원문 PPT 88슬라이드·617문장 스크립트는 레포 밖에만 있는 듯.
10. 지시에 없는 화면: `/privacy`·404(`not-found.tsx`)·`/admin/notifications`(알림 메일 상태 + 크론 하트비트 배지)·공지 관리·자료실 관리.

## 추천 촬영 경로 (결정은 메인 세션)

1. **공개 화면 전부 = 운영 `https://www.hanil-pnk.com`**(라이브 = 레포 HEAD 로 보임, GET 만, 페이지 간격 ≥1초). 폼은 채우기·검증 메시지까지만, 파일 선택·제출 금지. 공지 페이지는 내용 확인 후 가림.
2. **관리자 3종(사진 교체·문구 수정·접수함) = 로컬 Supabase + 레포 사본**: 사본에서 `supabase init`(포트 54811/54812/55931/55932·5432 회피) → 마이그레이션 12개 적용 → 가짜 관리자 계정(`admin_emails` 등록) + `[촬영용]` 가짜 접수 4~6건·공지 몇 건 insert → `next build && next start -H 127.0.0.1 -p <빈 포트>` → `/admin/login` 부터 실제 로그인. 폼 제출 → 접수함 도착 흐름도 같은 사본에서 이어 찍으면 운영 부작용 0.
3. **기존 캡처(`docs/admin-guide/*.png`·`_handoff`)는 쓰지 않는다**(DSF 1·실데이터 혼입 가능·규격 불일치) — 로컬이 막히면 BLOCKED.md. 접근성 점수는 라이브 재측정.

## 막힌 것
- 없음(막힌 조사 항목 0). 미확인: 설비 "49항목"·617문장 스크립트·라이브 공지 내용·supabase CLI 기본 이미지 태그와 캐시 일치 여부·무비밀값 `next build` 가능 여부(로컬 Supabase 로 가면 무관)·`next build` 라우트 수 33.
