# okjob(오케이잡 제주) 촬영 전 사전 조사 — RECON

조사 시각 2026-11-06 · 읽기 전용(코드·문서 읽기 + 운영 `curl -sI`/`/api/health` GET 만 · 로그인 0 · 브라우저·서버·빌드·도커 실행 0 · 비밀값 읽기·기록 0).
레포 = `/home/dev/Okjob` (브랜치 `main` · HEAD `ea28ba3` 2026-11-05 · 커밋 336개 · 마이그레이션 78개). 지시 원문 = `docs/specs/portfolio-capture-2.md` 1번.

## 0. 먼저 알아야 할 것 (촬영 방식을 바꾸는 사실 7개)

1. **레포에 `supabase/config.toml` 이 없다.** `supabase/` 에는 `migrations/`(78개)·`seeds/base.sql` 뿐이다. 로컬 Supabase 는 worktree 안에서 `supabase init` 으로 config 를 새로 만들어야 하고, `project_id`·포트를 우리가 정한다. 이 서버에는 이미 다른 프로젝트의 로컬 Supabase 가 돈다(`supabase_*_junimal` 54811/54812, `supabase_*_luvo-judge` 55931/55932). 기본 포트(54321~)와 이름 충돌은 안 나지만 **포트·project_id 를 고유하게** 잡아야 한다(§1).
2. **레포의 DB 스크립트는 전부 운영만 건드린다. 로컬을 가리킬 방법이 없다.** `npm run db:apply` · `db:seed:base` · `db:types` · `scripts/sql.ts` · `./db.sh` 는 모두 Supabase Management API(`api.supabase.com`)에 `SUPABASE_ACCESS_TOKEN`·ref(`.env.local`)로 요청한다(`scripts/sql.ts:60`, `apply-migration.ts:67`, `db.sh:17-27`). 로컬 DB 에 쓰려면 `supabase db reset --local` / `supabase migration up --local` 을 써야 하고, 이 스크립트들은 **worktree 에 `.env.local`·토큰이 없으면 "SUPABASE_ACCESS_TOKEN 이 없다"로 exit 1** 한다(안전한 실패). → worktree 로 `.env.local`·`.vercel`·`.auth` 를 **복사하지 않는 것**이 첫 번째 안전장치.
3. **`db:seed:dev`(개발 가짜 데이터 시드)는 지금 맨 위 두 줄로 막혀 있다.** `scripts/seed-dev.ts:1-2` = `console.error("막힘(STEP 44 A2)…"); process.exit(1)` (알림톡이 켜진 뒤 실제 농가에 쓸까봐 34개 스크립트를 막음, 커밋 `0f23640`). worktree 사본에서 그 두 줄을 지우면 돈다. 시드 자체는 **가짜 데이터**다(§1 시드 표). 단 마지막 실행이 9월 이전이라 **그 뒤 늘어난 마이그레이션(step41~84)과 호환되는지는 미확인**(새 컬럼은 대부분 `default` 가 있어 insert 는 될 가능성이 높다). 안 되면 worktree 에서 SQL 시드를 직접 쓰는 것이 대안.
4. **엑셀은 서버(Next 라우트)가 만든다. 클라이언트 생성이 아니다.** `GET /api/reports/day/export` · `/api/reports/matrix/export` 가 `write-excel-file/node` 로 만들고 **로그인 세션(쿠키)이 없으면 401**(`day/export/route.ts:32-34`, `matrix/export/route.ts:44-46`). 로컬 Supabase + 로그인한 Playwright 컨텍스트의 `request.get` 으로 받으면 된다. 파일 → PNG 는 이 서버에 `soffice`(LibreOffice) 가 있어 변환 가능(`/usr/bin/soffice`). 대안: 순수 함수 `buildDaySheet`(`src/lib/domain/day-sheet.ts:36`)를 가짜 행으로 직접 호출.
5. **"중복 배정 경고"는 지시 문구와 다르게 동작한다.** 같은 날 같은 근로자를 두 건 배정하는 것은 고객 확정 사양으로 **허용**이고(`20260803130000_step3_multi_booking_hours.sql:1-12`, `docs/계약-대조-근거.md` 17번), 화면은 "이미 배정된 근로자입니다 · 오늘 이미 N건 배정돼 있습니다 · [추가로 배정]" **확인창**을 띄운다(`assign-client.tsx:1036-1100`). 완전 동일 조합(날짜·근로자·농가·작업·픽업시각)만 저장이 막힌다(`assignment_worker_no_identical` 트리거, 저장 시 서버 문구 `assign-client.tsx:673`). → 촬영 대상은 "경고 확인창"이며 "차단"이 아니다. CLAUDE.md 의 "DB 제약으로 막는다"는 옛 문구다.
6. **운영은 로그인하지 않는다 — 로그인 자체가 운영에 쓴다.** 로그인 성공·실패 모두 `access_logs` 에 한 행(`src/app/login/actions.ts:53-69`, 서비스 롤). 읽기 화면 GET 은 쓰지 않는다(§5). 운영 `GET /api/health` 는 200 이고 `ref` 를 그대로 돌려주므로 "이 주소가 운영인지" 판별에 쓸 수 있다(§1 확인 명령).
7. **로컬 `.env.local` 이 이미 운영을 가리킨다.** `~/Okjob/.env.local`(600)은 운영 URL·service_role·Management 토큰·Vercel 토큰을 담는다(이름만 확인, 값은 안 읽음). 그 폴더에서 `npm run dev`·`node scripts/*.mjs` 를 돌리면 운영에 붙는다. rc 세션 `Okjob`(pid 3996883, tmux `rc-Okjob`)이 `~/Okjob` 에서 쉬고 있고 listening 포트는 없다(§9).

## 1. 스택·실행

| 항목 | 값 · 근거 |
|---|---|
| 프레임워크 | Next.js 15.5.22 App Router(`next dev --turbopack`) · React 19.1 · TS 5 · Tailwind 4 · `@supabase/ssr` 0.12 · `write-excel-file` 4.1 · `solapi` 6 · `package.json` |
| 패키지 매니저 | npm(`package-lock.json`) · node 버전 고정 파일 없음(`.nvmrc`·`engines` 없음, 확인) |
| 명령 | `npm run dev`(포트 미지정 → 3000, 우리는 고정 포트를 명시) · `npm run build` = `next build` · `npm start` · `npm test` = `vitest run` |
| env 이름(필수) | `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY`(`.env.example`) |
| env 이름(알림톡 · 로컬에선 비워야 함) | `NOTIFY_PROVIDER`(기본 `mock`) · `ALIMTALK_TEMPLATES_APPROVED` · `CONFIRM_BASE_URL` · `SOLAPI_*` · `CRON_SECRET` — 자물쇠 둘이라 `NOTIFY_PROVIDER` 를 안 주면 mock(`src/lib/notify/index.ts:32-41`) |
| 도구용(앱 런타임 아님 · worktree 에 넣지 않는다) | `SUPABASE_ACCESS_TOKEN` · `SUPABASE_PROJECT_REF` · `VERCEL_TOKEN` · `SEED_ADMIN_HEAD_*`/`SEED_ADMIN_STAFF_*` |
| 로컬 Supabase | **가능성 높음, 미실행 확인 못 함.** CLI 2.117(`~/bin/supabase`), docker 사용 가능(dev 가 docker 그룹). 필요: ① worktree 에서 `supabase init` → `config.toml` 의 `project_id`(예 `okjob-capture`)·`[api] port`·`[db] port`·`[studio]`·`[inbucket]` 포트를 **빈 포트로**(서버에서 54811·54812·55931·55932 사용 중, `ss -ltn` 으로 재확인) ② `[db.seed] sql_paths = ["./seeds/base.sql"]` ③ `supabase start -x studio,imgproxy,edge-runtime,logflare,vector` 로 가볍게. 확장: 마이그레이션이 `pgcrypto`·`pg_trgm`·`pg_net`·`pg_cron`·**Vault**(`worker_identity`)를 쓰는데 Supabase 로컬 이미지에 다 있다. 과거에 빈 클라우드 프로젝트에서 순서대로 적용해 성공한 기록 있음(`PROGRESS.md` ~1142행, 당시 마이그레이션 23개) — 지금 78개 전체를 빈 DB 에 재생한 기록은 **미확인**. |
| 메모리·디스크 | 서버 가용 메모리 ~6GB(46GB 중 36 사용) · 디스크 49GB 여유 — 로컬 Supabase 스택(db+auth+rest+kong)은 약 1.5~2GB, `heavy-run` 규칙 적용 |
| pg_cron 안전 | `20260726122000` 이 `okjob-notify-dispatch`(5분마다 `notify_dispatch_tick()`)를 등록하지만 Vault 에 `okjob_dispatch_url`·`okjob_cron_secret` 이 없으면 아무것도 보내지 않는다(`:34-45`). **`scripts/setup-cron.ts` 는 절대 돌리지 않는다**(Vault 에 운영 주소를 심는다). |

### 시드·마이그레이션 위험 (질문 항목에 대한 답)

| 파일 | 내용 | 운영에서 돌면 |
|---|---|---|
| `supabase/seeds/base.sql`(8,149B) | 기수 3 · 숙소 3 · 호실 8 · 작업 5 · 스프레이 고정단가 · 시간×성별 단가 14×3행. **고객이 확정한 운영 설정이지 가짜가 아니다**(실명·여권 없음 — 확인). 헤더에 "프로덕션에도 그대로 들어간다" | 고정 UUID upsert → **고객이 설정 화면에서 바꾼 기수·숙소·단가가 명세 기본값으로 되돌아간다**(`CLAUDE.md` "고객 설정값" · 파일 상단 주석) |
| `scripts/seed-dev.ts`(791줄) | 관리자 2계정 + 농가 20곳(성+이름 조합, 지역 12개, 전화 `064-7xx-xxxx` 가짜, 주소 `서귀포시 …로 N`) + 근로자 40명(영문 이름 풀: Juan·Maria·Nguyen·Sok 등, 필리핀 20·베트남 16·캄보디아 4, 남 24·여 16) + 휴무 + 배정(오늘 KST 기준 생성, 고정 시드 → 같은 날 같은 결과). **여권·외국인등록번호·계좌 없음**(`set_worker_identity` 호출 0 — grep 확인) | **배정·근로자 전량 삭제**(`:306-315`). 막는 장치: 운영 ref 목록 가드(`:42-67` · `PRODUCTION_REFS` 에 운영 ref) + `ALLOW_DEV_SEED_ON_PROD=yes` 강제 스위치 + 5초 카운트다운 + 지금은 1-2행 `process.exit(1)` |
| `scripts/seed-extend-horizon.ts` | 같은 계열(가드 동일, 파일 상단 막힘) | 위와 동일 계열 |
| 이관·보정 스크립트 `import-excel.ts` · `migrate-*-4b/4d.ts` · `merge-farms.ts` 등 | `.env.local` 로 운영에 REST/Management 호출 | 운영 데이터 삭제·이관 — **로컬 촬영에 쓰지 않는다** |

- **시드 가드의 사각지대**: 가드는 URL 에서 `https://<ref>.supabase.co` 정규식으로 ref 를 뽑아 목록과 비교한다(`seed-dev.ts:34-36`). 로컬 URL(`http://127.0.0.1:…`)은 ref 가 `""` 라 통과한다 — 즉 **가드는 "운영 URL 이면 막고, 그 밖이면 통과"**다. 거꾸로 `NEXT_PUBLIC_SUPABASE_URL` 이 운영 주소면 막히지만 그것을 믿지 말고 아래 출력 확인을 쓴다.
- 마이그레이션 78개 중 **파괴적 변경은 `drop index`·`drop policy` 류(재생 가능)이고 데이터를 지우는 마이그레이션은 확인 못 함**(전수 읽지 않음 — 미확인). 운영 적용은 `apply-migration.ts` 로 이미 끝나 있다.

### "접속 주소가 로컬인지 출력으로 확인하는 방법" — 제안 명령 (worktree 에서, 시드·마이그레이션 직전마다)

1. **주소 문자열**(값 전체를 출력하지 않고 호스트만): 
   `node -e 'const u=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);console.log(u.hostname,u.port);process.exit(["127.0.0.1","localhost"].includes(u.hostname)?0:1)'` — 종료 코드 0 이 아니면 중단.
2. **운영 흔적이 env 파일에 없음**: `grep -c 'supabase\.co' .env.local` → 반드시 `0`(개수만 출력되고 값은 안 나온다). 그리고 `test ! -e .vercel && test ! -e .auth && echo no-prod-link`.
3. **DB 컨테이너가 우리 것**: `docker ps --format '{{.Names}} {{.Ports}}' | grep okjob-capture`(또는 정한 project_id) 로 우리 컨테이너의 포트 확인 → `supabase status -o env | grep -E '^(API_URL|DB_URL)=' | sed -E 's#//[^@/]*@#//***@#'` 가 `127.0.0.1:<우리 포트>` 인지.
4. **내용이 비어 있음**: `docker exec supabase_db_<project_id> psql -U postgres -tAc "select (select count(*) from public.workers),(select count(*) from public.farms),(select count(*) from public.assignments)"` — 시드 전엔 `0|0|0`. 운영은 근로자 수백 명·농가 수백 곳이라 한 눈에 구별된다(농가는 `base.sql` 이 안 넣으므로 0 이어야 정상).
5. **앱이 붙은 곳**: 로컬 서버 기동 후 `curl -s localhost:<포트>/api/health` → `"ref":null`(정규식이 `https://<ref>.` 만 잡는다 `api/health/route.ts:17-18`)이어야 한다. 운영은 `"ref":"eabwdgamuqxvxbuynffa"`(실측 200).
6. 시드 스크립트는 지우기 전에 `현재 DB — 배정 N건 · 농가 M곳 · 근로자 K명` 을 출력하고 5초 기다린다(`seed-dev.ts:83-102`) — **로컬 시드 전이면 `0건·0곳·0명`**. 0 이 아니면 즉시 Ctrl+C. `--dry-run` 으로 거기까지만 먼저 돌릴 수 있다.

## 2. 라이브 주소·상태 (`curl -sI` GET/HEAD)

`https://okjob-jeju.kr`(www → 308 → apex, README). 모든 화면이 로그인 뒤라 비로그인으로 볼 수 있는 것은 로그인 화면뿐.

| URL | 상태 |
|---|---|
| `/` · `/dashboard` | 307 → `/login?redirect=…` |
| `/login` | 200 (좌측 현무암 브랜드 패널 + 폼, `src/app/login/page.tsx`) |
| `/manifest.json` | 200 (PWA, `start_url=/dashboard`) |
| `/api/health` | 200 `{"ok":true,"ref":"eabwdgam…","checks":{serviceRole ok, anon ok}}` — DB 읽기 1회 외 쓰기 없음 |

봇 확인: 없음(`x-vercel-mitigated` 없음). 운영에서 찍을 수 있는 것은 **로그인 화면 + PWA manifest/아이콘**뿐 — 본 화면은 전부 로컬.
운영 유의: 소장이 지금도 쓴다(PROGRESS.md NOW = 11-05 STEP 84 배포, 알림톡은 mock 상태 · 실발송 0).

## 3. 지시 항목 ↔ 라우트·컴포넌트

공통: 레이아웃 `src/app/(app)/` · 사이드바·모바일 서랍 `src/components/app-shell.tsx`(메뉴 `:46-73`) · 날짜는 전부 KST(`src/lib/domain/date.ts`). 데스크톱 1440 · 모바일 390 둘 다 같은 라우트(반응형, `md:` 분기 `app-shell.tsx:287,410`).

### 3-1. 데스크톱

| 지시 | 실제 라우트 · 컴포넌트 | 필요 데이터 · 비고 |
|---|---|---|
| 월간 대시보드(가동률 히트맵) | `/dashboard`(메뉴명 **「월간 현황」**) · `dashboard/dashboard-client.tsx` — 달력 날짜 셀마다 `<CapacityBar size="mini">`(`:426`, `components/ui/capacity-bar.tsx:11` "달력 전체가 가동률 히트맵") · 만료 점 `:405-414` · KPI 4칸(이번 달 배정 건수·인원·등록 농가·만료 임박) · 우측 「그날 배정」·「만료 임박」 카드(`:559`·`:686`) | 이번 달에 배정이 흩어져 있어야 히트맵이 의미 있음 → 시드가 "오늘 기준 ±"로 생성 |
| 배정하기: 가용 인원 자동 계산 | `/assign` → `assign/assign-shell.tsx`(하루 배정 / 기간 배정 토글 `:15-51`) → `assign-client.tsx`(2,352줄). 가용 판정 `src/lib/domain/availability.ts`, 상단 CapacityBar(`:374` 선택해도 움직이지 않게 미배정 기준) · 칩 그리드 `assign/worker-chip-grid.tsx`(칩 3종 open/flag/lock `:42-60`) | 날짜 선택 → 칩 가용/배정됨/휴무 |
| 자동 추천 | `RecommendCard`(`assign-client.tsx:1933`, 「자동 추천」 Sparkles) · 계산 `src/lib/domain/recommend.ts`(`recommendAssignment`, `assign-client.tsx:410-467`; 우선순위 = 그 농가 경험자 → 같은 숙소 → 연속근무 적은 순 → 성별) | **농가를 고르고 그 농가 희망 인원(`want_male`/`want_female`)이 있어야** 카드가 뜬다(`:927`) — 시드 농가는 희망 2~6/0~3 |
| 중복 배정 경고 | `MultiBookConfirm`(`assign-client.tsx:1036-1100`) — §0-5. 이미 배정된 칩을 누르면 뜸(`:440`) | 같은 날 이미 배정된 근로자 필요 |
| 기간 배정 | `/assign` 토글 「기간 배정」 → `assign/batch-client.tsx`(1,019줄) · 방식 두 가지(같은 사람으로 계속 / 날짜마다 교대 — `docs/manual/screens.md` §5) | 시작·끝 날짜, 남·여 인원 |
| 저장된 배정 4탭 | `/assignments` → `assignments/assignments-client.tsx` 탭 `:497-500` = **일별 · 월별 · 근로자별 · 기간 배정**(내부 view `day|range|worker|batch` `:63`; 들어오면 기본은 「근로자별」 `:80`). 일별 = 같은 파일 · 월별 = `:1099` 날짜별 한 줄 목록 · **근로자별 매트릭스** = `assignments/worker-matrix-view.tsx`(930줄) · 기간 = `assignments/batch-view.tsx`(489줄) | ※ 지시의 "기간" 탭 이름은 화면에서 「기간 배정」, "월별"은 매트릭스가 아니라 날짜 목록 |
| 급여 계산기 | `/payroll` → `payroll/payroll-client.tsx`(1,505줄, h1 「급여 계산」 `:509`) · 탭 근로자별/농가별 `:752-770` · 명세서 `payroll/payslip.tsx` · 호실별 근무표 `/payroll/rooms` · 이체 패널 `payroll/nh-transfer-panel.tsx`·`nh-group-sheet.tsx`(**계좌번호가 보임 — 가림**) | 기간 선택 + 배정 스냅샷. 이체 관련은 관리자(`canTransfer`)만 |
| 입금 확인 | `/payments` → `payments/payments-client.tsx`(h1 「입금 확인」 `:253`) · 별도 `/unpaid`(입금 미확인 농가) · `/verify`(입금·지급 검증) | 농가별 입금 기록 |
| 알림톡 발송 관리 | `/notifications`(메뉴 「알림톡 발송」) → `notifications/notifications-client.tsx` 탭 확인 현황 · 예약 · 이력(`TABS :64-67`) · 상태 필터 전체/발송됨/실패/거둠 `:807-810` | mock 이라 이력이 비어 있다 → 시드만으로는 "발송됨" 행이 안 생김(행 직접 insert 필요 — 아래 §5 주의) |
| 설정(단가표) | `/settings` → `settings/settings-client.tsx` 탭 `:16-21` = **시간 단가**(`tabs/wage-hours.tsx`) · **일당 단가**(`tabs/wages.tsx`) · 숙소와 호실 · 급여명세서 · 작업 종류 · 기수. 지시의 "단가표" = 시간 단가 + 일당 단가 | `base.sql` 이 채움(단가 14×기수 3 + 스프레이). 「급여명세서」 탭은 `payslip_rates` 가 별도라 시드에 없을 수 있음(미확인) |

### 3-2. 모바일(PWA)

| 지시 | 실제 | 비고 |
|---|---|---|
| PWA 홈 | `public/manifest.json` `start_url=/dashboard`(`display: standalone`, `theme #1A1D21`, `background #F6F6F4`) → 모바일 390 의 `/dashboard`. 모바일은 사이드바 대신 헤더 햄버거 서랍(`app-shell.tsx:307-349`) | 달력 셀은 `sm:` 미만에서 "농가·배정" 글자를 숨김(`dashboard-client.tsx:416-420`) |
| 배정하기 | `/assign` 390. 하단 저장 바 관련 참고 `references/모바일-하단바-안전영역.md` | 소장 기본 폭이 360(CLAUDE.md) |

### 3-3. 상태 흐름·hover·엑셀

| 지시 | 실제 |
|---|---|
| 배정하기: 농가 선택 → 작업·시간 → 근로자 칩 선택 → 저장 직전 | `assign-client.tsx`: 농가 검색 `aria-label="농가 이름 검색"`(`:1502`) · 날짜 `aria-label="날짜"`(`:1206`) · 픽업 시각(`:1216`) · 작업(`:1226`) · 작업 시간(`:1250`) · 근로자 칩 · 우측 「배정 요약」 → 저장 버튼 「배정 저장」. **저장하면 DB 에 쓰고 `/api/notify/send-on-save` 를 부른다**(`:699-702`, mock 이라 기록만) → 저장 직전에서 멈추거나 로컬 DB 에서만 저장 |
| 매트릭스 hover 행·열 강조 | `worker-matrix-view.tsx:177-241` — 데이터 칸 hover 시 날짜 머리(열)·사번 머리(행) 크로스헤어, `@media (hover: hover)` 에서만 동작(터치 기기는 꺼짐). Playwright `page.hover()` 로 재현 가능, 마우스 이탈·스크롤 시 해제 `:241` |
| 엑셀: 일별 배정표 | 버튼 → `GET /api/reports/day/export?date=YYYY-MM-DD`(`assignments-client.tsx:255-275`, 파일명 `OK잡제주_일별배정표_YYYYMMDD.xlsx`) · 3열(농가명·번호·인원) · 맨 윗줄 제목 병합 · 헤더색 `#F8CBAD`(`domain/day-sheet.ts:15`) |
| 엑셀: 근로자별 매트릭스 | `worker-matrix-view.tsx:448` → `GET /api/reports/matrix/export?month=…` · 파일명 `matrix_YYYYMM.xlsx`(`route.ts:127`) · 사번×날짜 칸 |
| (참고) 일별 이미지 공유 | `assignments/day-image-share.tsx` + `src/lib/day-image-canvas.ts`(캔버스로 일별 배정표 PNG 생성 — 지시엔 없음) |

## 4. 테스트·관리자 계정 (값은 읽지도 출력하지도 않음)

- **로컬에서 들어가는 법 = 시드의 개발 계정.** `scripts/seed-dev.ts:246-285` 가 관리자 2명을 `auth.admin.createUser` 로 만들고 `profiles` 에 upsert 한다: ① 소장 계정(`can_view_sensitive=true`) ② 직원 계정(`false`). 이메일·비밀번호는 환경변수 `SEED_ADMIN_HEAD_EMAIL/_PASSWORD`·`SEED_ADMIN_STAFF_EMAIL/_PASSWORD` 가 있으면 그것을, **없으면 코드에 하드코딩된 기본값**을 쓴다(`:248-255` — 값은 이 문서에 옮기지 않는다. 읽는 법: `sed -n 246,258p scripts/seed-dev.ts`). 로컬 DB 에서는 새 값을 환경변수로 줘서 쓰는 게 낫다.
- 로그인 방식: 이메일 + 비밀번호(`supabase.auth.signInWithPassword`, 서버 액션 `src/app/login/actions.ts:34`). 2단계 인증 없음. 로그인 폼은 하이드레이션을 기다린 뒤 입력(STEP 36, `scripts/_browser.mjs` 주석).
- 권한: `profiles.can_view_sensitive`(여권·ARC 조회) · `can_save_identity`(기본 false, 로그인 계정이 스스로 못 바꿈 — 트리거, `20260929100100`). 촬영은 **직원 권한 계정**이 안전(신분정보 "가려진 상태"만 보임). 급여 이체 패널은 관리자(소장급)에서만 → 이체 화면을 찍으려면 소장 권한 계정 필요(로컬 가짜 데이터라 무방).
- 운영용 점검 계정 스크립트 `scripts/create-verify-account.mjs`(`--apply`)는 운영에 계정을 만든다 — **쓰지 않는다**. 운영 소장 계정으로 로그인 금지(CLAUDE.md "검수 절차").
- 세션 파일 `~/Okjob/.auth/` 가 있다(소장 세션일 수 있음, gitignore) — 읽지 않았고 worktree 로 복사하지 않는다.

## 5. 쓰기 위험

**읽기 라우트의 서버 쓰기: 없음(코드 기준).** `src/lib/queries/*.server.ts`·`(app)/layout.tsx`·`lib/auth.ts` 에서 insert/update/upsert/rpc 0건(grep). 쓰는 곳은 아래뿐.

| 경로 | 쓰는 것 | 촬영 때 |
|---|---|---|
| 로그인 `login/actions.ts:53-69` | `access_logs` 성공·실패 한 행(서비스 롤) | 운영 로그인 금지 사유. 로컬 DB 는 무방 |
| 근로자 상세의 신분정보 보기 `workers/worker-detail.tsx:297` `rpc("get_worker_identity")` | 조회 때마다 `access_logs`(법정 보관, append-only 트리거로 못 지움) | **클릭할 때만 발생.** 로컬 시드엔 신분정보가 없어 "가려진 상태"만 찍는다 |
| 배정 저장 `assign-client.tsx:699-702` → `POST /api/notify/send-on-save` | 알림 행 생성(예약) · 발송 시도 | `NOTIFY_PROVIDER` 미설정이면 mock. 로컬 `.env.local` 에 `SOLAPI_*`·`ALIMTALK_TEMPLATES_APPROVED`·`CONFIRM_BASE_URL` 을 넣지 않는다 — 넣으면 유료 알림톡이 실제 나갈 수 있다(`notify/index.ts` 자물쇠 4겹: provider·approved·`CONFIRM_BASE_URL==운영 주소`·템플릿 ID) |
| 알림톡 화면의 [지금 발송]·[다시 발송]·거두기 `notifications-client.tsx:221,293` · 대시보드 `dashboard-client.tsx:185` | `/api/notify/send-now` | 누르지 않는다(mock 이어도 로컬 DB 알림 행이 바뀜) |
| 취소 확인창·삭제 | 배정 취소/삭제 | 상태 흐름 촬영에서 "열기"만, 확정 버튼은 누르지 않는다 |
| pg_cron `notify_dispatch_tick` | Vault 값 없으면 no-op | 위 §1 |
| `/api/cron/*`·`/api/notify/dispatch`·`/api/webhook/solapi` | `CRON_SECRET`/웹훅 시크릿 없으면 거절 | 호출하지 않는다 |

외부 유료 호출: 알림톡/SMS(솔라피) 한 곳뿐. 앱 코드에 AI·지도 호출은 없다(`package.json` 의존성에 없음).
운영 DB 는 **KST 10:00~15:00·18:00~20:00 외에는 쓰기 금지 창**이 있다(`README.md` DB 절) — 운영에 쓰지 않으므로 무관.

## 6. 가림 대상 (셀렉터 힌트)

찍기 직전 DOM 글자를 바꾸는 방식. 이 앱은 Tailwind 유틸 클래스라 안정 셀렉터가 거의 없고 `aria-label`·`role`·`.num`(JetBrains Mono 숫자) 이 단서다. **촬영 때 로컬 DOM 으로 다시 뽑는다.**

| 대상 | 어디 | 힌트 |
|---|---|---|
| **농가 이름**(개인 이름 — 농장주명이 농가명) | 배정하기 농가 검색·자동완성, 대시보드 「그날 배정」, 저장된 배정 전 탭, 입금 확인, 알림톡, 급여 농가별 탭 | 가림 규칙 "이름 → 김○○". **시드 농가 20곳 이름이 실제 고객 농가와 겹친다**: 첫 농가 `김○○(실제 고객 농가와 같은 이름 — 문서에서도 가림)`(= 실제 농가, `_dev-phone.ts:3-6` 에 같은 사례 기록 · CLAUDE.md 알림톡 예시에도 등장). 시드 이름이라도 **가린다** |
| 농가 전화 | 농가 조회·알림톡 | 시드는 `064-7xx-xxxx` 가짜지만 형식상 `010-****-****` 로 통일 권장 |
| 근로자 이름 | 근로자 조회 이름 열 · 칩 title/aria-label(`worker-chip-grid.tsx`) · 매트릭스 행 머리 · 급여 · 엑셀 | 시드는 영문 이름(Juan·Maria 등). 외국인 실명은 아니지만 "이름 → 가림" 규칙 대상. 사번(55M)은 `.num` — 유지 |
| 계좌·예금주·은행 | 급여 이체 패널·NH 그룹이체 시트(`payroll/nh-*.tsx`) · 근로자 상세(관리자만) · 급여명세서 | 시드엔 없음 → 이체 화면은 빈/가짜. 값이 보이면 지움 |
| 여권·외국인등록번호 | 근로자 상세 신분정보(클릭해야 보임) | 클릭하지 않음 |
| 관리자 이름·이메일 | 사이드바 하단 프로필(「진소장 · 관리자」 `app-shell.tsx` 하단), 로그인 폼 이메일 | 실명이 아니라 역할명이지만 시드 기본 이메일이 화면에 뜨면 지운다 |
| 도메인·URL | 알림톡 확인 버튼 링크 `okjob-jeju.kr/confirm/…`(알림톡 미리보기·이력) · `/confirm/<토큰>` 주소 | 글자 지움 |
| 대표번호·SNS·주소 | 로그인 화면 하단 "서귀포시 · 오케이잡 제주" 정도뿐 — 연락처 없음 | 확인 필요 시 가림 |

## 7. 사실 후보

| 항목 | 값 | 근거 | 확신 |
|---|---|---|---|
| **계약 기능 수** | **31개**(농가 관리 6 · 근로자 관리 8 · 배정 5 · 카카오 알림톡 3 · 알림과 리포트 4 · 공통과 데이터 3 · 근무일수와 급여 2) | `docs/완료-확인표.md`(번호 01~31, `grep -c "^| [0-9][0-9] |"` = 31) · `PROGRESS.md:505` "고객용 기능 완료 확인표 31개 항목" · `docs/계약-대조-근거.md`(계약 대조표 "주의 4건 02·06·17·23" — 같은 번호 체계). 계약서·견적서 **원문 파일은 레포·`~`(깊이 3)에 없음**(`*계약*`·`*견적*` 검색 → `계약-대조-근거.md` 하나뿐). 따라서 "계약 31항목"은 완료 확인표 기준이고 계약서 원문 대조는 **미확인** | 중 |
| **엑셀에서 옮긴 배정 건수** | **미확인 — 명확한 단일 값 없음, 오히려 전제가 틀릴 수 있음.** 실제로 파일에서 옮긴 것은 **근로자 187명**(1기 68 · 2기 68 · 3기 51)과 **농가**(병합 377 → 502). 배정은 2기·3기 모두 **앱에서 손입력**(`PROGRESS.md:304` "2기 배정은 파일 이관이 아니라 08-06~08-10 에 앱에서 손입력") · `import-excel.ts` 는 샘플로만 실증(샘플 배정 7건, `PROGRESS.md:1550`) · 라이브 배정 2,477건(전부 2기, 8월 중순 기준, `PROGRESS.md:596`)은 이관이 아니라 입력 누적 | 지시 문구를 "엑셀에서 옮긴 근로자 187명" 등으로 바꿔야 할지 메인 세션 결정 | 낮음(배정) / 높음(근로자 187: `PROGRESS.md:1642`, `:785`) |
| **알림톡 템플릿 수** | **3종**: `OKJEJU_ASSIGN_01`(배정 안내) · `OKJEJU_ASSIGN_SPRAY_01`(스프레이) · `OKJEJU_CANCEL_01`(취소) · 3종 모두 `status: APPROVED` | `docs/alimtalk-templates.md:5-9` · `src/lib/notify/approved-templates.json`(`"code"` 3개, `dateUpdated 2026-08-17`) · `완료-확인표.md` 20번 "카카오 채널 연결과 안내문 세 가지 심사가 모두 통과" | 높음 |
| **자동 시험 수** | 단위 시험 파일 **66개**(`src/**/*.test.ts`) · `it/test` 호출 정적 집계 883회 · **마지막 실행 결과 vitest 980/980 통과**(2026-11-05 STEP 84 기록) | `PROGRESS.md:13`("vitest 980/980(nh-group 16)") · `vitest.config.ts:10`(`include src/**/*.test.ts`) · 별도로 Playwright 검증 스크립트 `scripts/verify-*.mjs` 52개(+`_verify-*` 포함 185개)는 단위 시험이 아님. 실행은 이번 단계에서 안 했다 → 재현: `cd <worktree> && npx vitest run 2>&1 | tail -8`(노출 수는 `Tests  980 passed (980)` 줄) · 파일 수 `find src -name '*.test.ts' | wc -l` | 높음(980) |
| 그 밖의 숫자(영상용 후보) | 농가 246곳·누적 근로자 289명·기수당 60~90명·일 최대 70명대(`CLAUDE.md` "규모" — 명세 기준 · 실측 아님) · 기수 3개(1기 2024.9~2025.8 / 2기 / 3기 2026.9~2027.8, `base.sql`·`CLAUDE.md`) · 작업 종류 5(일반작업·선과·파쇄·스프레이·기타) · 숙소 3·호실 8(`base.sql`) · 마이그레이션 78 · 배포 후 커밋 336 | 파일 각각 | 중 |
| 규모 표기 주의 | `CLAUDE.md`(농가 246곳)와 `README.md`(농가 377곳 병합)와 `PROGRESS.md`(농가 502 유지, 등록 농가 935곳 수치가 `home-desktop.png` 에 찍혀 있음)가 **서로 다르다** — 영상 자막에 농가 수를 쓰려면 운영 DB 조회(읽기)로 확정 필요, 지금은 **미확인** | | — |

## 8. 브랜드

- 주색: **감귤 `#E8722C`**(액션·선택 상태 전용, `src/app/globals.css:16` `--color-tangerine`) · 보조 `#FDF1E8`(tangerine-w, `:17`) · 사이드바·헤더 **현무암 `#1A1D21`**(`CLAUDE.md` 디자인 토큰, `manifest.json` `theme_color`) · 배경 `#F6F6F4` · 가능/완료 **바다 `#0B6E63`** · 주의 모래 `#B8862B` · 앰버 `#A86808` · 경고 `#C6362F`(`CLAUDE.md` "디자인 시스템" 토큰 표 — `globals.css` 에 나머지 토큰 정의 확인은 안 함).
- 폰트: 한글 UI **Pretendard Variable**(`src/fonts/PretendardVariable.woff2`, `src/app/layout.tsx:6-10`) · 숫자·코드 **JetBrains Mono**(`src/fonts/JetBrainsMono.woff2`, `layout.tsx:14-17`, `.num` 클래스).
- 로고·아이콘: 별도 로고 파일 없음 — 앱 아이콘 `public/icons/icon.svg`·`icon-192/512.png`·`icon-maskable-*`·`apple-touch-icon.png`(`manifest`·`layout.tsx:34-39`). 워드마크는 텍스트 「OK잡 제주」(`login/page.tsx`, 사이드바). `media/` 에 낼 로고 원본 = 위 icon.svg + 폰트 woff2 2개.
- 디자인 방향(영상 카피 참고): "제주 현무암과 감귤 · 새벽 6시 30분에 쓰는 운영 콘솔" · 시그니처 = 가용 인원 게이지(CapacityBar) — 달력 셀에 축소돼 히트맵이 됨(`CLAUDE.md` 126~).
- 금지 요소(그대로 지킬 것): 이모지·그라데이션 남발·파이차트·3D·부트스트랩 파란 버튼.

## 9. 다른 세션 점유 (`ps`·`ss`·`git worktree list` 읽기만)

- rc 세션 `Okjob`: tmux `rc-Okjob` → `rc-session.sh Okjob`(pid 3371576) → `claude --remote-control Okjob … --resume c3ea70dd…`(pid 3996883, cwd `/home/dev/Okjob`, 3일 가동). 쉬는 중이며 **이 레포에서 listening 포트 0개**(`ss -ltnp` 의 node/next 8개 중 cwd 가 `~/Okjob` 인 것 없음 — 각각 safefile·Medimajor worktree 2·Medimajor scratch·claude-ops-pwa·gochingphone worktree·그 외).
- `git worktree list` = `/home/dev/Okjob [main]` 하나뿐 · `.claude/worktrees/` 없음 · 작업 트리 상태: untracked `docs/diag/step67-1021/live/`·`docs/handoff/`(메인 세션 쪽 변경, 건드리지 않음).
- 서버의 다른 점유(우리와 충돌하는 것만): 로컬 Supabase 두 벌(junimal 54811·54812, luvo-judge 55931·55932), next 서버 포트 3312·3417·3475·3493·3494·38791·8781·8782. **okjob 로컬 서버·Supabase 는 이들과 겹치지 않는 포트를 `ss -ltn` 확인 후 고른다.**
- 이 조사는 `~/Okjob` 에 파일을 쓰지 않았고 git 상태를 바꾸지 않았다(`git status` 는 읽기, worktree add·fetch·checkout 0).

## 10. 지시와 코드가 다른 점

1. 「월간 대시보드 가동률 히트맵」 → 화면 이름은 **「월간 현황」**(`/dashboard`, `app-shell.tsx:46`). 히트맵은 별도 화면이 아니라 달력 셀 안의 미니 게이지(`dashboard-client.tsx:426`, `capacity-bar.tsx:11`).
2. 「중복 배정 경고」 → **차단이 아니라 확인창**(「이미 배정된 근로자입니다 · 추가로 배정」). 같은 날 2건은 고객 확정 허용(`assign-client.tsx:1036-1100`, `step3_multi_booking_hours.sql:1-12`, `계약-대조-근거.md` 17). 완전 동일 조합만 서버가 거부(`assign-client.tsx:673`). CLAUDE.md "DB 제약으로 막는다"는 이후 사양 변경으로 낡음.
3. 「저장된 배정 4탭 일별·월별·근로자별 매트릭스·기간」 → 탭 라벨은 **일별 · 월별 · 근로자별 · 기간 배정**(`assignments-client.tsx:497-500`). **"월별"은 매트릭스가 아니라 날짜별 한 줄 목록**(`:1099`), 매트릭스는 「근로자별」 탭. 기본 선택 탭은 「근로자별」(`:80`).
4. 「설정 단가표」 → 단일 표가 아니라 **「시간 단가」**(시간×성별 14행/기수)와 **「일당 단가」**(카드 제목 「고정 단가」, 스프레이) 두 탭(`settings-client.tsx:16-17`). 설정 탭은 지시 암묵의 4개가 아니라 6개(시간 단가·일당 단가·숙소와 호실·급여명세서·작업 종류·기수, `screens.md` N-1).
5. 「알림톡 발송 관리」 → 메뉴명 **「알림톡 발송」**(`/notifications`, 탭 확인 현황·예약·이력).
6. 「모바일 PWA 홈」 → 별도 모바일 홈 화면은 없다. `/dashboard` 의 반응형 모바일 뷰가 PWA `start_url`(`manifest.json:8`).
7. 「입금 확인」은 `/payments`(h1 일치, `payments-client.tsx:253`)지만 관련 화면이 둘 더 있다: `/unpaid`(입금 미확인 농가)·`/verify`(입금·지급 검증).
8. 「엑셀에서 옮긴 배정 건수」 → 배정은 이관된 적이 없고 손입력이다(§7). 지시의 사실 항목이 성립하지 않을 수 있다.
9. 「엑셀을 열어 첫 화면을 PNG로」 → 파일은 클라이언트가 아니라 서버 라우트가 만들고 로그인이 필요하다(§0-4). 이 서버에는 LibreOffice 가 있어 렌더 가능.
10. 지시는 "로컬 Supabase(도커)에 마이그레이션과 개발 시드를 넣어" 라고 하지만 레포에 `config.toml` 이 없고(§0-1), 개발 시드(`db:seed:dev`)는 `process.exit(1)` 로 막혀 있으며(§0-3), `db:apply`·`db:seed:base`·`sql.ts` 는 로컬 대상이 불가능하다(§0-2). 로컬 재생은 `supabase db reset --local` 이 정답.
11. 지시 「시드·마이그레이션 명령은 운영에서 돌면 3기 근로자 데이터가 지워진다」 → 지워지는 것은 `seed-dev.ts`(배정·근로자 전량 삭제)이고, `base.sql` 은 지우지 않지만 **고객 설정값(기수·단가·숙소)을 되돌린다**. 둘 다 운영에서 돌리면 안 된다.
12. `docs/manual/screens.md` 는 "캡처 30종 60장"이라 하지만 `docs/manual/shots/` 에는 **36장**만 있다(`ls | wc -l` = 36, 모바일 390·데스크톱 1280 혼재, 홈 모바일 `home-mobile.png` 없음). 아래 대안 표 참고.

### 로컬이 안 될 때 대안 — `docs/manual` 원본 캡처

폴더 `docs/manual/`: `OK잡-제주-사용설명서.pdf`(7.4MB, 9-28) · `manual.html`(11MB, 이미지 인라인) · `screens.md` · `handover-notes.md` · `shots/`(36 PNG, 7-31~8-13 촬영). 전부 **옛 UI(2기 4월 달력 기준, STEP 84 이전)** 이고 데스크톱은 폭 1280·DSF 2(2560px), 모바일 390.

| 파일 | 어떤 화면 |
|---|---|
| `home-desktop.png` · `menu-desktop.png`(동일 크기·같은 내용) | 월간 현황 2026년 4월 달력(히트맵) + 그날 배정 목록. **농가 이름·「등록 농가 935곳」이 실데이터일 수 있다 — 가림 필요**(육안 확인: 한국 이름 농가명이 그대로 나열) |
| `menu-mobile.png` | 모바일 메뉴 서랍 |
| `login-desktop.png` · `login-mobile.png` | 로그인 |
| `assign-empty-mobile.png` · `assign-empty-capability-mobile.png` · `assign-selecting-mobile.png` · `assign-saved-mobile.png` | 배정하기 모바일: 빈 상태 · 작업 가능자 미지정 · 근로자 고르는 중 · 저장 직후 |
| `batch-fixed-desktop.png` | 기간 배정 「같은 사람으로 계속」 (`batch-rotate` 는 없음) |
| `assignments-mobile.png` · `assignments-cancel-mobile.png` | 저장된 배정(명단 펼침) · 취소 확인창 — **옛 일별 탭**, 매트릭스·월별 없음 |
| `farms-desktop.png` | 농가 조회 |
| `workers-desktop.png` · `workers-edit-desktop.png` · `workers-absence-desktop.png` · `workers-month-mobile.png` | 근로자 조회(시드 영문 이름 40명, 2기 69명) · 수정 · 휴무 · 월 근무표 모바일 |
| `notifications-mobile.png` · `notifications-pending-mobile.png` | 알림톡 발송 확인 현황 · 예약 |
| `payroll-desktop.png` · `payroll-mobile.png` | 급여 계산 |
| `payments-desktop.png` | 입금 확인 |
| `settings-wage-hours-*` · `settings-wages-*` · `settings-dorms-*` · `settings-work-types-*` · `settings-terms-*` · `settings-spray-zero-*` · `settings-crush-zero-*`(각 desktop·mobile) | 설정 탭 6종 |

**없는 것(원본으로 대체 불가)**: 월별 목록·근로자별 매트릭스·hover 강조·기간 배정 탭·자동 추천 카드·중복 확인창·엑셀 파일·호실별 근무표·NH 그룹이체·모바일 홈. 그 밖에 `docs/diag/step67-1021/live/`(1440·360 캡처 7장, **운영 실데이터 가능성, 10-21 촬영·untracked** — `PROGRESS.md` 에 "삭제 여부 결정 남음")와 `.shots/`·`.import/shots/` 는 **쓰지 않는다**(실데이터). `.import/` 에는 원장 엑셀·신분정보가 있다(gitignore, 읽지 않음).

## 추천 촬영 경로 (결정은 메인 세션)

1. **1순위 = 로컬 Supabase(도커) + worktree + 시드 사본.** worktree 에서 `supabase init` → 고유 포트 → `supabase db reset --local`(마이그레이션 78 + `base.sql`) → `seed-dev.ts` 사본(1-2행 제거, 로컬 URL/키를 환경변수로 줌, §1 확인 명령 6단계 통과 후) → `next build && next start -p <고정 포트>`(prod 빌드) → 직원/소장 시드 계정으로 로그인. 시드 호환이 깨지면 worktree 에 SQL 시드를 직접 작성. **새로 만들거나 없는 기능을 그리지 않는다**(시드는 데이터일 뿐 화면은 실제 코드).
2. **엑셀 2종**은 같은 로컬 세션으로 `/api/reports/{day,matrix}/export` 를 받아 `soffice --headless --convert-to png`(또는 pdf→png)로 첫 화면 캡처.
3. **로컬이 막히면** `docs/manual/shots` 의 §10 표 화면만 쓰고 `BLOCKED.md` 에 "매트릭스·hover·자동추천·중복확인창·엑셀·모바일 홈 불가" 를 적는다. 운영 로그인은 어떤 경우에도 하지 않는다.

## 막힌 것 · 미확인

- 로컬 Supabase 로 마이그레이션 78개 전체 재생 가능 여부(과거 23개 시점 기록만 있음) · 시드 호환 · 알림톡 `발송됨` 이력 행 생성 방법 — 실행 금지 단계라 **미확인**.
- 계약서·견적서 원문 파일(계약 31항목 대조) · 엑셀 이관 배정 건수 · 농가 수 정본 — 근거 없음/상충(§7).
- `docs/manual/shots` 의 실데이터 포함 여부는 홈·근로자 2장만 육안 확인(나머지 34장 미확인).
