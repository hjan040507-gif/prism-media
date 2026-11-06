# matchsat(매치샛) 촬영 전 사전 조사 — RECON

조사 시각 2026-11-06 07:3xZ · 읽기 전용(코드 읽기 + 운영 GET/HEAD + DNS 조회 + `docker ps/images`·`ss`·`ps` 읽기) · 브라우저·서버·빌드·도커 실행·DB 쿼리 0 · 비밀값 기록 0 (`.env.local` 은 열지 않았다).
레포 = `/home/dev/satorder` (HEAD `6aa098e` = 2026-06-29 「주문 수정 P3」, 브랜치 `main`, 커밋 77개, 원격 `origin` = 고객 GitHub 계정의 `satorder`). 작업 트리의 「변경 2줄」은 형제 세션의 편집이 아니라 **추적 안 되는 파일 2개 `db.sh`·`deploy.sh`**(`git status --short` → `?? db.sh`, `?? deploy.sh`, 추적 파일 변경 0). 건드리지 않았다.

## 0. 먼저 알아야 할 것 (촬영 방식을 바꾸는 사실 6개)

1. **운영 Supabase 프로젝트가 지금 응답하지 않는다(일시정지 추정).** `qqqoaejplefafjbupcto.supabase.co` 가 DNS 에서 풀리지 않는다(`getent hosts` rc=2, `curl` → `Could not resolve host`, `supabase.com` 은 정상). 레포 프로젝트 메모리(`~/.claude/projects/-home-dev-satorder/memory/supabase-project-pause.md`)의 「무료 플랜 약 1주 미사용 시 자동 정지 → NXDOMAIN」 증상과 같다. 영향: ① 운영 로그인 불가(테스트·관리자 계정이 있어도 못 들어간다) ② 운영 `/suppliers` 가 「등록된 참여업체가 아직 없습니다」로 나오지만 **진짜 0건이 아니라 조회 실패**(`packages/shared/src/queries/suppliers.ts:13-14` 가 오류를 버리고 빈 배열을 돌려줌). 복원은 Management API 토큰으로만 되고(고객 프로젝트 설정 변경) 범위 밖 — 시도하지 않았다.
2. **모든 데이터 화면이 서버 렌더(SSR)라 `page.route` 로 가짜 응답을 못 넣는다.** 페이지 쿼리는 Next 서버가 Supabase 를 부른다(`createSupabaseServerClient`). 브라우저에서 가로챌 수 있는 건 서버 액션 POST(`Next-Action` 헤더)와 일부 클라이언트 쓰기뿐이고, 입찰·주문·관리자 액션은 전부 서버 액션이다. → 「로컬 사본 + 가짜 응답」은 사실상 불가, 실제 DB 가 필요하면 **로컬 Supabase**(§1)가 유일한 현실적 경로.
3. **비로그인으로 찍을 수 있는 건 정적 소개 화면뿐**: `/`, `/guide`, `/auth`, `/terms`, `/privacy`, (`/suppliers`, `/suppliers/[id]` 는 공개이지만 지금은 DB 정지로 빈 목록). 수요 등록·입찰·매칭·관리자는 전부 로그인 + 역할 + 승인(approved) 필요하고, 예시 데이터(입찰 있는 주문, 거절된 지정 매칭)가 있어야 보인다.
4. **고정 계정·시드가 레포에 없다.** `supabase/seed.sql`·`[db.seed]` 없음, `scripts/` 는 브랜드 이미지 생성 하나. 데모 계정 정보는 레포 어디에도 없다(`git grep demo` → `supabase/README.md`·metro 설정뿐, 계정 값 아님). 브리프(`briefs/matchsat.md:§2,§4`)는 운영에 데모 계정·데모 주문 4건이 있다고 하나 자격 증명 위치는 이 서버에서 못 찾았다(`.env.local` 은 열지 않음; 값은 대화 기록이나 고객 쪽).
5. **로컬 Supabase 는 가능해 보인다**: 마이그레이션 23개가 `supabase/migrations/` 에 순서대로 있고 `supabase` CLI 2.117 + 도커 29.1 + 필요한 이미지(postgres 17.x · gotrue · postgrest · realtime · storage-api · kong · postgres-meta · mailpit)가 이미 서버에 있다. 단 `config.toml` 이 `project_id` 한 줄뿐이고 그 값이 **운영 프로젝트 ref** 라서 그대로 `supabase link`/`db push`/`db.sh` 를 쓰면 운영으로 간다(§1·§5). 사본에서 `project_id`·포트를 바꿔 띄워야 한다.
6. **푸터에 자리표시자 연락처가 있어 pii_scan 정규식에 걸린다**: `contact@satorder.example`(이메일 형태) · `02-0000-0000`(전화 형태) · `000-00-00000`(사업자번호 형태) · `(주)○○○`/`대표 ○○○` (`app/_components/layout/footer.tsx:24-38`, 전 페이지 하단). 실제 값은 아니지만 촬영 전에 푸터 `<dl>` 통째로 지우거나 치환해야 pii_scan 0건.

## 1. 스택·실행

| 항목 | 값 · 근거 |
|---|---|
| 구조 | **웹 앱이 레포 루트**(`app/` `lib/` `middleware.ts` `next.config.mjs`). `apps/mobile` 은 Expo 앱(촬영 대상 아님, 이 서버는 에뮬레이터 불가), `packages/shared` 는 웹·앱 공용 코드(`@shared/*` 별칭으로 웹이 재노출: `lib/constants.ts:2`, `lib/validation/rfq.ts:2`, `lib/rfq/queries.ts:7`) |
| 패키지 매니저 | **npm** (`package-lock.json`, lockfileVersion 3). `pnpm-workspace.yaml` 은 Expo 모노레포 감지용 표식이며 npm 이 무시한다고 주석에 명시(`pnpm-workspace.yaml:1-9`) — 지시의 「pnpm 모노레포」와 다름 |
| 버전(락 파일) | next 15.5.19 · react 19.2.7 · tailwindcss 3.4.19 · typescript 5.9.3 · zod 3.25.76 · @supabase/ssr 0.5.2 · @supabase/supabase-js 2.107.0 (`package-lock.json`) |
| 명령 | `next dev` / `next build` / `next start` (`package.json` scripts, 린트·테스트 스크립트 없음) |
| 현재 상태 | `node_modules`·`.next` 없음 → 사본에서 `npm ci` 필요. node 22.23.1 (서버) |
| env 이름(웹, 필수) | `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`lib/supabase/server.ts:18-19`, `lib/supabase/middleware.ts`, 빌드 시점에도 필요) |
| env 이름(선택) | `NEXT_PUBLIC_SITE_URL`(없으면 `https://satorder.kr`, `app/layout.tsx:22`) · `SUPABASE_SERVICE_ROLE_KEY`(서버 전용, `lib/supabase/admin.ts` — 결제 confirm 에서만) · `NEXT_PUBLIC_TOSS_CLIENT_KEY` · `TOSS_SECRET_KEY` · `NOTIFY_DISPATCH_SECRET` · `RESEND_API_KEY` · `RESEND_FROM` · `SMS_API_KEY` · `KAKAO_ALIMTALK_API_KEY` · `KAKAO_ALIMTALK_SENDER_KEY` · `NTS_BUSINESS_API_KEY` · 앱용 `EXPO_PUBLIC_SUPABASE_URL`/`_ANON_KEY` |
| 운영 도구 env 이름 | `db.sh`: `SUPABASE_ACCESS_TOKEN`·`SUPABASE_PROJECT_REF`(선택) · `deploy.sh`: `VERCEL_TOKEN` · `supabase/apply.mjs`: `SUPABASE_ACCESS_TOKEN`·`SUPABASE_PROJECT_REF` — 전부 `.env.local` 을 `source` 한다 |
| Vercel | `vercel.json`: `regions: ["icn1"]` (framework 고정 없음 — 이 레포 설정, 변경 안 함) |
| Supabase | `supabase/config.toml` = **`project_id = "qqqoaejplefafjbupcto"` 한 줄뿐**(포트·`[api]`·`[db]` 설정 없음 → `supabase start` 는 기본 포트 54321~54324 사용). 이 값은 운영 프로젝트 ref 와 같다(`supabase/README.md:5`, region ap-northeast-2, Postgres 17) |
| 마이그레이션 | **23개**, 2026-06-05 ~ 06-29 (`20260605090000_init_satorder_schema.sql` … `20260629010000_update_rfq.sql`). README 말대로 **멱등**(재실행 안전) · forward-only. 익스텐션 생성 없음. `realtime.send`·`realtime.messages` 정책·`storage.buckets`(chat-media 비공개 버킷, `20260607220000_chat_media_close.sql:121`)를 쓰므로 로컬 Supabase 의 realtime·storage 컨테이너가 필요 |
| 시드 | **없음**(`seed.sql` 없음, config 에 `[db.seed]` 없음) |
| 로컬 시드에 쓰는 스크립트의 원격 기본 위험 | 시드 스크립트 자체가 없다. 대신 **DB 를 건드리는 기존 도구 3개가 전부 운영 전용**: ① `supabase/apply.mjs` 는 `https://api.supabase.com/v1/projects/${ref}/database/query` 로만 보낸다(로컬 모드 없음, `apply.mjs:10-12,26`) ② `db.sh` 는 `.env.local` 을 source 하고 `--project-ref $SUPABASE_PROJECT_REF` 를 붙여 `supabase "$@"` 를 실행(`db.sh:14-24`) ③ `deploy.sh` 는 `vercel --prod`(`deploy.sh:13`). → 사본에는 `.env.local` 을 가져오지 말고, 위 3개를 쓰지 말고, `supabase start` 같은 CLI 는 직접 호출한다. `.gitignore` 첫 줄이 `.env.local` |
| 로컬 Supabase 가능 여부 | **가능(미실행·미검증)**: CLI `~/bin/supabase` 2.117.0 · docker 29.1.3 · 이미지 보유(postgres 17.11.0.011·17.6.1.167, gotrue 2.196/2.197, postgrest 14.18, realtime 2.151, storage-api 1.72.1, kong 2.8.1, postgres-meta, edge-runtime, mailpit). studio·imgproxy·vector·analytics 이미지는 확인 못 함 → `supabase start -x …` 로 제외 권장. 이미 다른 프로젝트 스택이 떠 있다: `junimal`(kong 54811, db 54812) · `luvo-judge`(kong 55931, db 55932) — **건드리지 않는다**. 가용 메모리 약 17GB, 디스크 49GB 여유 |
| 로컬 사본 절차(제안, 결정은 메인) | `git worktree add`/임시 clone 에서(원본 `~/satorder` 무변경) ① `supabase/config.toml` 을 사본에서 `project_id="matchsat-cap"` + 포트 54421~54429 대역으로 바꿈 ② `supabase start`(새 볼륨이면 마이그레이션 23개 자동 적용) — 접속 URL 이 `127.0.0.1` 인지 출력으로 확인 ③ `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY` 를 로컬 값으로 환경변수로만 주고 `npm ci` → `next build` → `next start -p 3330`(3330~3333 비어 있음) ④ 계정: 로컬 GoTrue 에 이메일 가입(로컬은 이메일 확인 기본 꺼짐) → 가입 트리거 `handle_new_user` 가 `profiles` 를 `pending` 으로 만듦(`direct_trade_pivot.sql:37-69`) → 승인·관리자 지정은 로컬 DB 에 SQL 로(`profiles.role/status` 는 일반 사용자 변경 불가 — `profiles_guard` `init:389-406`, `is_privileged()` = JWT 없음/service_role `init:293-297`; 로컬 postgres 직접 접속은 허용) ⑤ 데모 데이터(주문 open·입찰·낙찰·지정 매칭 pending/rejected·신고)는 앱 화면으로 만들거나 로컬 SQL 로 삽입 ⑥ 끝나면 `supabase stop --no-backup`·사본 삭제. 가짜 계좌·가짜 기관명으로 시드하므로 가림 부담이 거의 없다 |

## 2. 라이브 주소·상태 (`curl -sI`/GET, 로그인 없음)

도메인 `https://satorder.kr`(apex canonical), `www` → 308 → apex. Vercel, 봇 확인·챌린지 없음(`x-vercel-mitigated` 없음). `robots.txt`·`sitemap.xml` 404.

| URL | HEAD | GET 본문으로 본 실제 |
|---|---|---|
| `/` · `/guide` · `/suppliers` · `/auth` · `/terms` · `/privacy` | 200 | 정상 렌더. 하단 푸터 포함. `/` 는 비로그인 헤더(참여업체·사용법·로그인) |
| `/rfqs` · `/rfqs/new` · `/admin` · `/matches` · `/mypage` · `/supplies` · `/chat` | 200 | **HEAD 200 은 믿으면 안 된다**: `loading.tsx` 때문에 셸이 먼저 스트리밍되고, GET 본문에 `NEXT_REDIRECT;replace;/auth?next=…;307` 이 들어 있다(`/rfqs`·`/rfqs/new`·`/admin` 확인). 즉 실제로는 로그인으로 보냄 |
| `/opengraph-image.png` | 200 | OG 이미지(1200×630) |

운영 DB 정지(§0-1) 때문에 지금은 로그인 폼이 열려도 로그인은 되지 않는다(서버 액션이 Supabase 를 못 부른다). 정지가 풀려도 로그인은 운영 DB 에 세션을 남긴다(§5).

## 3. 지시 항목 ↔ 실제 라우트·컴포넌트

공통: 헤더 `app/_components/site-header.tsx`, 모바일(md 미만) 하단 탭바 `app/_components/mobile-tab-bar.tsx:17-30,36-76`(수요자: 내 주문·제공목록·매칭·채팅 / 공급자: 주문 입찰·제공목록·매칭·채팅, **관리자·비로그인은 탭바 없음**, `/rfqs/new` 에서는 숨김 `:39`). 모든 역할 가드는 페이지 안에서 처리(`lib/supabase/middleware.ts` 는 세션 갱신만).

| 지시 | 실제 라우트 · 파일:줄 | 로그인 · 역할 · 필요 데이터 |
|---|---|---|
| 메인 | `/` → `app/page.tsx:4-39`(히어로 「위성영상, 주문부터 납품까지」 + 「로그인 / 가입」·「사용법 보기」 + 카드 2장 「위성영상주문 (Sat-order)」「위성제공목록 (Sat-list)」). 사용법 `/guide` `app/guide/page.tsx`(공개, 58KB) | **비로그인 OK**. 로그인해도 메인은 같다(역할별 분기 없음) |
| 수요 등록 단계 | `/rfqs/new` → `app/rfqs/new/page.tsx:12-98` + 폼 `rfq-form.tsx`. **4단계** `STEPS = ["무엇을","어디·언제","조건","예산·확정"]` `:37`, 진행바·「n / 4」 `:145-150`, 스텝 블록 `:158`(1: 주문유형·제목·촬영수단·[해상도]) `:198`(2: 촬영지점·범위·요청일시) `:218`(3: 제공시간·분석보고서) `:250`(4: 예산·[특별주문 지정]), 하단 이전/임시저장/다음/제출 `:288-300`. 스텝 전환은 **CSS `hidden` 만**(필드는 DOM 에 계속 존재, `:158` 등) → 같은 뷰포트·스크롤에서 단계마다 한 장 찍기 쉽고, 다음/이전은 클라이언트 동작이라 서버 쓰기 없음 | 수요자(`requester`) + `approved`. 공급자는 `/rfqs` 로 리다이렉트(`page.tsx:22`), 그 외는 Gate 문구(`:23-24`). 제출·임시저장은 서버 액션 `createRfqAction`(`lib/rfq/actions.ts:75-93`) = **쓰기** — 누르지 않는다. 예산 필수 가드 `rfq-form.tsx:121-130` |
| 수요 목록·입찰 | **이름이 「주문 입찰」**: 목록 `/rfqs` `app/rfqs/page.tsx:27-158`(필터 `:59-81`, 카드 `:106-153`: 상태·「입찰 중/낙찰/탈락」 `:117-122`·마감임박·NEW·익명 배지 `:123-125`, 「입찰 n건」 `:127`). 상세·입찰 `/rfqs/[id]` `app/rfqs/[id]/page.tsx`: 공급자 익명 뷰 `:44-153`(배너 「익명 보기 — 수요자 신원…」 `:56`, 입찰 폼 `:122-132`, 내 입찰 카드 `:82-92`), 수요자 소유 뷰 「받은 입찰 n건」+ 「이 입찰 낙찰」 `:213-253` | 목록은 **공급자 전용**(`approved`): 수요자는 `/mypage` 로 리다이렉트(`rfqs/page.tsx:36`), **관리자는 들어가도 빈 목록**(`rfq_public_view` 가 `supplier_can_view_rfq` = `auth_role()='supplier'` 를 요구 — `init:316-318`, 뷰 `20260609010000…:136`). 입찰 있는 주문·마감 임박·NEW·내 입찰 이력이 있어야 배지들이 한 화면에 보인다 |
| 입찰 제출 전·후 | 전 `bid-form.tsx:35-52`(입찰가 `MoneyInput`·완료 예정일·제안서) · 제출 시 `window.confirm`(「이 내용으로 입찰할까요?」 `:30`) · 후 `state.ok` 초록 박스 「✓ 입찰 완료! …」 `:47-51` + 목록 배지 「입찰 중」 + 상세 「내 입찰 입찰 중 + 금액」 `[id]/page.tsx:82-92`, 철회 버튼 `:126-130` | 제출은 서버 액션 `placeBidAction`(`lib/rfq/bid-actions.ts:11-34`) → 서버가 `place_bid` RPC 호출 = **서버 쪽 쓰기라 가로채기 불가**(Playwright 는 `window.confirm` 대화상자 핸들러 필요). 「후」 화면은 로컬 DB 에서만 진짜로 만들 수 있다 |
| 지정 매칭 | 용어는 **특별주문 → 지정 매칭**. 수요자: `/rfqs/new` 의 주문유형 「특별주문」 선택 → Step 4 「구분(일반/긴급)」·「지정 업체」 `rfq-form.tsx:263-283`(안내 「특별주문은 입찰 없이 지정 업체로 즉시 매칭됩니다」 `:262`). 제출 시 상태가 곧바로 `matched` + `matches.match_type='designated'`·`pending`(`packages/shared/src/validation/rfq.ts:150-153` `rfqSubmitStatus`). 공급자: `/rfqs/[id]` 「지정 주문」 카드 수락/거절 `[id]/page.tsx:94-113`, `/matches` 의 수락/거절 `matches/page.tsx:114-127`. 매칭 내역 `/matches` `matches/page.tsx:22-90`(수요자 뷰 `:149-200`: 공급업체·입찰가·**입금 계좌(accepted)** `:161-175`·거래 완료 `:177-183`·정보 공개 토글 `:188-197`). 비슷한 다른 경로 「제공 선택」(`supply_selected`) = `/supplies/[id]` 선택 버튼(`app/supplies/select-button.tsx`, RPC `select_supply`) | 지정 매칭 만들기 = 수요자 + 공급자 승인 계정 필요, 공급자 목록에 승인된 공급자가 있어야 Step 4 드롭다운이 찬다. `/matches` 는 수요자·공급자·관리자 모두 로그인 필요 |
| 주문 수정(입찰 0건) | `/rfqs/new?edit=<주문id>` → `app/rfqs/new/page.tsx:29-55`(제목 「주문 수정」 `:85`, 안내 「입찰이 들어오기 전 주문만 수정할 수 있습니다…」 `:86-89`, 임시저장 버튼 숨김·제출 라벨 「수정 저장」 `rfq-form.tsx:296`). 진입점 2곳: 주문 상세 「주문 수정」 `[id]/page.tsx:197-199`, 마이페이지 「수정」 링크 `mypage/page.tsx:108-111`. 입찰이 있으면 「입찰이 들어와 수정할 수 없습니다. 취소 후 재등록해 주세요.」 `[id]/page.tsx:203-207`. 저장 = 서버 액션 `updateRfqAction`(`lib/rfq/actions.ts:100-140`) | 본인 수요자 + `imaging` + `open` + 입찰 0건인 주문 필요. 폼 화면 자체는 읽기 전용으로 찍을 수 있고 저장만 누르지 않으면 쓰기 없음(운영이 살아 있다면). 로컬이면 시드로 해결 |
| 관리자: 회원 승인·정지 | `/admin/members` `app/admin/members/page.tsx:10-44`: 「승인 대기 (n)」 카드 = 승인/거절, 「전체 회원 (n)」 카드 = 정지/복구 — `MemberCard` `app/admin/_components.tsx:110-141`. 위험 액션(거절·정지)은 확인 모달 `DangerStatus` `:92-107` → `ConfirmSubmit`(`app/_components/confirm-submit.tsx`). 액션 `setMemberStatusAction` `lib/admin/actions.ts:193-201` → RPC `admin_set_member_status`(`phase6_admin_options.sql:181-190`) | 관리자 계정(`role='admin'`) 필요, 404 가드(`notFound()` `members/page.tsx:15`). **회원 이메일·이름·소속이 카드에 그대로 뜬다**(`_components.tsx:62-72`) → 가림 필수 |
| 관리자: 신고 처리 | `/admin/reports` `reports/page.tsx:13-66`: 신고 카드(대상 종류·시각·상태·사유·「대상 ID」) + 버튼 검토중/처리완료/기각 `:44-46`. 액션 `resolveReportAction` `lib/admin/actions.ts:203-211` → RPC `admin_resolve_report`(`phase6_admin_options.sql:192-200`). 신고 생성 진입점은 주문 상세의 「이 주문 신고」(공급자) `[id]/page.tsx:141-151`와 참여업체 상세 `app/suppliers/[id]/page.tsx` | 신고 행(reports)이 있어야 목록이 찬다 |
| 관리자: 매칭 재지정 | **별도 화면이 아니다.** `/admin` 대시보드 하단 「거절된 지정 매칭 — 재지정/취소 (n)」 섹션 `app/admin/page.tsx:57-91` — **거절된 지정 매칭이 있을 때만 나타난다**(`lib/admin/queries.ts:32` `match_type='designated' and match_status='rejected'`). 재지정 select+버튼 `:66-74`, 취소는 확인 모달 `:75-85`. 액션 `redesignateAction`/`cancelDesignatedAction` `lib/admin/actions.ts:213-230` → RPC `admin_redesignate_match`/`admin_cancel_designated_match`(`phase6_admin_options.sql:202-240`) | 거절된 지정 매칭 1건 + 승인된 공급자 2명 이상(재지정 후보) 필요 → 로컬 시드 필수 |
| (참고) 관리자 나머지 | 대시보드 통계 `/admin` `:30-43`(전체 회원·승인대기·진행중 주문·누적 매칭·결제 건수·결제 금액·신고) · `/admin/monitoring`(주문+전체 활동 피드, 알림 제목에 주문명이 뜸) · `/admin/audit`(감사 로그: 회원 상태 변경·신고 처리·지정 매칭 취소·지정 재배정·사업자 인증, `app/admin/audit-format.ts:11-17`) | 관리자 |
| 모바일: 메인 | `/` 390px(헤더 햄버거 `site-header.tsx:119`, 푸터 포함) | 비로그인 OK (이때 하단 탭바 없음) |
| 모바일: 수요 목록 | `/rfqs` 390px — 공급자 로그인 + 하단 탭바 4개(주문 입찰·제공목록·매칭·채팅). 수요자가 모바일에서 보는 「내 주문」은 `/mypage` | 공급자 + 주문 여러 건 필요 |
| (참고) 결제 | 결제 화면은 없다: `/payments/[matchId]` 는 `PAYMENTS_DISABLED = true` 로 `/matches` 리다이렉트(`app/payments/[matchId]/page.tsx:12,21`) — 직거래 전환(브리프 §3-②) 일치 | — |

## 4. 테스트·관리자 계정 (값 기록 없음)

- **레포 안에는 계정 정의가 없다**(고정 계정·시드 스크립트·`.env.example` 없음). 계정은 Supabase Auth 에 이메일+비밀번호로 가입해 만든다(`lib/auth/actions.ts:15-19` 로그인, `:24-58` 가입 — 공급자는 은행·계좌번호·예금주 필수 `auth-forms.tsx:32,143-149`, 전 역할 면책 동의 필수). 가입 직후 `pending`, 관리자 승인 후 사용(`auth/page` 안내 「가입 후 관리자 승인을 받아야 주문·입찰이 가능합니다」, 카카오 로그인은 provider 미설정 안내).
- 운영에 기존 테스트·관리자 계정이 있는지: **확인 불가** — ① 운영 DB 정지(§0-1) ② 자격 증명 위치 미발견(브리프만 「수요자·공급자·관리자 데모 계정」이 있다고 적음 `briefs/matchsat.md:§7`). `~/satorder/.env.local` 이 있다는 것만 확인(내용은 열지 않음; `db.sh`·`deploy.sh`·`apply.mjs` 가 요구하는 변수 이름은 `SUPABASE_ACCESS_TOKEN`·`SUPABASE_PROJECT_REF`·`VERCEL_TOKEN`).
- 로컬 Supabase 로 가면 새 계정은 **로컬 DB 에만** 생기므로 「새 계정 금지」 범위 밖이다(가짜 이메일 `@example.test` 류로).

## 5. 쓰기 위험

**GET 만으로 서버가 쓰는 곳**
- 페이지 렌더(`app/**/page.tsx`·`layout.tsx`)에서 `.insert/.update/.upsert/.delete/.rpc` 호출은 **없다**(grep 확인). `middleware.ts` → `supabase.auth.getUser()`(`lib/supabase/middleware.ts:30`)는 쿠키가 있을 때 토큰 갱신(서버 인증 테이블에 refresh token 회전)만 한다.
- **예외 하나: `GET /api/payments/confirm`**(`app/api/payments/confirm/route.ts:16`) — 쿼리에 `paymentKey`·`orderId`·`amount` 가 있으면 토스 결제 승인 호출 + `service_role` 로 `mark_payment_paid`(DB 쓰기·유료 외부 호출). 결제 화면이 꺼져 있어도 라우트는 남아 있다 → **절대 열지 않는다**(파라미터 없이 열면 `/matches?payfail=` 로 리다이렉트만).
- `POST /api/notify/dispatch`(`route.ts:13`, `NOTIFY_DISPATCH_SECRET` 필요 · 메일/SMS/알림톡 발송 채널) — 브라우저에서 부르는 코드 없음(grep), 건드리지 않는다.

**로그인 자체가 운영 DB 에 남기는 것**: 로그인은 서버 액션(`signInAction`)이라 `page.route` 로 못 막는다 → Supabase Auth 의 마지막 로그인 시각·세션(refresh token)이 운영에 남는다. 브리프의 「운영에 아무것도 남기지 않는다」는 운영 로그인으론 지킬 수 없다(운영이 살아 있다 해도).

**클라이언트가 직접 보내는 쓰기(가로챌 수 있음)**: 채팅방 진입 시 `mark_messages_read` RPC(`app/chat/[conversationId]/chat-room.tsx:45`) · 메시지 `insert`(`:93`) · 알림 벨 열면 `notifications` 전부 읽음 `update`(`app/_components/notification-bell.tsx:81`). Supabase REST/RPC POST·PATCH 라 `page.route` 로 막을 수 있다. 실시간은 WebSocket(`rfq_feed` · `rfq_bids:<id>` · 대화 토픽) — 수신 전용(클라 INSERT 정책 없음)이고 DB 변화가 있을 때만 `router.refresh()`.

**서버 액션(쓰기, 누르지 않는다)**: `createRfqAction`·`updateRfqAction`(`lib/rfq/actions.ts`) · `placeBidAction`·`withdrawBidAction`·`awardBidAction`(`lib/rfq/bid-actions.ts`) · `toggleDisclosureAction`·`respondDesignatedAction`(`lib/match/actions.ts`) · `completeTransactionAction`(`lib/payments/actions.ts`) · `reportAction`(`lib/social/actions.ts`) · 관리자 4종 `setMemberStatusAction`·`resolveReportAction`·`cancelDesignatedAction`·`redesignateAction`(`lib/admin/actions.ts`) · 로그인/가입/비밀번호 변경(`lib/auth/actions.ts`) · 프로필·참여업체·제공 등록(`lib/profile`·`lib/suppliers`·`lib/supply`). 알림은 DB 트리거(`on_rfq_posted_notify` 등)가 만든다 — 외부 발송은 위 dispatch 경로뿐.

**외부 유료 호출**: 없음(AI 호출 코드 없음). 사업자번호 확인 `lib/suppliers/biz-verify.ts`(국세청 API, `NTS_BUSINESS_API_KEY`)는 참여업체 저장 시에만.

## 6. 가림 대상 (셀렉터 힌트)

지시: 기관명·담당자·계좌. 이 앱의 개인정보 노출 지점:

| 대상 | 위치 · 힌트 |
|---|---|
| 공급자 입금 계좌(은행·계좌번호·예금주) | 수요자 `/matches` 「입금 계좌 (직거래)」 박스 `matches/page.tsx:161-175`(`<dl>` 안 `Field` 3개: 은행·계좌·예금주), 공급자 본인 뷰 「내 입금 계좌 (수요자에게 공유됨)」 `:103-108`, 가입 폼 계좌 입력 `auth-forms.tsx:143-149`. 계좌번호는 가짜 값으로 치환(예: `110-***-******`) 또는 칸 제거 |
| 수요자 신원(이름·소속·전화·이메일) | 공급자 `/matches` 「수요자 연락처 (공개됨)」 `matches/page.tsx:129-138`(공개 동의된 매칭에서만), 관리자 회원 카드 `_components.tsx:62-72`(이름 `<b>`·이메일 `<span>`·소속), 마이페이지 프로필 `app/mypage/profile` |
| 공급업체·기관명 | 수요자 뷰 「공급업체: …」 `matches/page.tsx:152`, 받은 입찰 카드의 업체명+아바타 `rfqs/[id]/page.tsx:232-233`, 입금계좌 예금주, 참여업체 목록/상세 `/suppliers` — 지시가 기관명을 가리라고 했으므로 「A위성」식 치환(공급자는 원래 비익명이라 정책상 공개 정보지만 지시 우선) |
| 수요 기관명 | 주문 제목·촬영지점(`capture_point`)·분석 협의사항에 기관명이 들어갈 수 있음 — 로컬 시드면 처음부터 가짜 |
| 관리자 | 관리자 회원 목록의 이메일, 모니터링 「→ 수신자명」 `monitoring/page.tsx:56`, 감사로그의 UUID 앞 8자 |
| **푸터(전 페이지)** | `footer.tsx` 운영사·대표·사업자번호·주소·문의 이메일·전화 — 자리표시자지만 정규식에 걸림(§0-6). `<footer>` 통째로 숨김 권장 |
| 화면 속 도메인 | 메타·OG 외에 본문에 `satorder.kr` 글자는 보이지 않음(코드 확인). 이메일 `contact@satorder.example`(푸터) |
| 팝업·위젯 | 채팅 위젯·쿠키 배너·개발 배지 없음(grep 없음). `window.confirm`(입찰 제출)·`ConfirmSubmit` 모달은 상태 흐름 촬영 시 의도적 사용 |
| 실시간 배지 | 알림 벨 `app/_components/notification-bell.tsx`(읽지 않은 수), 「자동 갱신」 배지 `rfqs/[id]/page.tsx:219` |

## 7. 사실 후보 (자막용 · 값과 근거)

### 7-A. 매칭 전 신원·계좌 비공개를 DB 권한으로 막는 근거

| # | 사실 | 근거 (경로:줄) |
|---|---|---|
| A1 | 공급자는 주문 기저 테이블 `rfqs` 를 직접 조회할 수 없다: SELECT 정책은 **소유자(`rfqs_select_owner`)와 관리자(`rfqs_select_admin`)뿐** → 수요자 식별자 `requester_id` 가 공급자 쿼리에 아예 나오지 않는다 | `supabase/migrations/20260605090000_init_satorder_schema.sql:652-660` (주석 `:652` 「공급자는 기저 테이블 직접 SELECT 불가 (requester_id 노출 차단) → rfq_public_view 사용」) |
| A2 | 공급자가 보는 주문 목록 = 뷰 `rfq_public_view`(`security_invoker = false`, 즉 DEFINER). 컬럼에 수요자 프로필·`requester_id` 가 없고(식별 컬럼 신규 노출 0), `WHERE supplier_can_view_rfq(r.id)`(승인된 공급자 + 열람 가능 주문만), `anon`·`public` 권한 회수, `authenticated` 에만 SELECT | 최신 정의 `…20260609010000_analysis_negotiable_note.sql:123-138` (`create view` `:124`, `revoke all … from anon, public` `:137`, `grant select … to authenticated, service_role` `:138`); 헬퍼 `supplier_can_view_rfq` `init:316-332` |
| A3 | 수요자 프로필(이름·소속·전화·이메일)은 **매칭 + 수요자 공개 동의(`requester_disclosed`) 때만** 공급자에게 보인다. 보이는 경로는 매칭 뷰 `match_view` 의 `CASE WHEN m.requester_disclosed THEN rp.display_name/organization/phone/email END` 한 곳 | `…20260629000000_direct_trade_pivot.sql:93-96`(CASE 4줄), `:79-81` 뷰 정의, `:120-122` 행 제한 `WHERE m.supplier_id = auth.uid() OR r.requester_id = auth.uid() OR is_admin()`, `:124-125` anon 회수·authenticated 허용 |
| A4 | 공급자가 `profiles` 기저 테이블로 수요자 신원을 직접 읽는 길을 막음: 쌍 단위 정책 `profiles_select_disclosed_requester` 를 **삭제**(한 매칭 공개가 같은 수요자의 다른 미공개 매칭 신원까지 새던 문제 P1-1). 남은 정책은 본인·관리자·「수요자가 자기 주문에 관여한 공급자 보기」뿐 | 삭제 `…20260607180000_anonymity_hardening.sql:92`(근거 주석 `:9-10`); 남은 정책 `init:595-615` |
| A5 | 공급자가 스스로 공개 스위치를 켤 수 없다: 트리거 `matches_guard` 가 `requester_disclosed` 변경을 **주문 소유자·관리자·특권 역할만** 허용(그 외 변경은 이전 값으로 되돌림) | `init:440-475`(핵심 `:463-468`, 조건식 `:464`), 트리거 부착 `init:546` `trg_matches_guard` |
| A6 | 채팅 경로로도 수요자 UUID 가 샐 수 없다: `conversations`·`messages` 기저 SELECT 를 회수하고 **안전 컬럼만 재부여**(수요자 UUID 인 `requester_id`·`sender_id` 는 미부여), 읽기는 DEFINER 뷰 `conversations_view`·`messages_view`(당사자만; 발신자는 `is_mine`·`sender_role` 로만 표현) | `…20260607180000…:20-23`(revoke) `:21,24`(grant 컬럼), 뷰 `:28-46`; 이후 `…20260607220000_chat_media_close.sql:42-60` 로 재정의(미디어·삭제 반영, 같은 원칙) |
| A7 | 공급자 계좌(`bank_name`·`account_number`·`account_holder`)는 `supplier_profiles` 테이블에 있고, 기저 테이블 SELECT 는 **본인(`sp_select_self`)·관리자(`sp_select_admin`)뿐**이라 수요자는 기저 조회 불가. 이전의 「인증 사용자 전체 조회 가능」 정책 `sp_select_auth` 는 삭제 | 컬럼 추가 `…direct_trade_pivot.sql:22-24`(주석 `:16-19` 「계좌는 오직 match_view(definer)로만 노출」); 정책 `…anonymity_hardening.sql:97-103`(삭제 `:97`, 생성 `:99,102`) |
| A8 | 계좌가 수요자에게 나가는 유일한 경로 = `match_view` 의 계좌 3컬럼(`supplier_bank_name`·`supplier_account_number`·`supplier_account_holder`) + 행 제한 「매칭 당사자/관리자」. 공개 뷰 `rfq_public_view`·`suppliers_directory`(`sp.*` 가 아니라 명시 컬럼: id·profile_id·company_name·equipment·tier·is_verified·portfolio_url·created_at·description·satellites·achievements·homepage_url·founded_year)에는 계좌·사업자번호 컬럼이 없다 | `…direct_trade_pivot.sql:103-105`(계좌 3줄), `:120-122`; `…20260606130000_phase6_admin_options.sql:314-320`(suppliers_directory 컬럼) |
| A9 | **세밀한 단서(자막 정확성)**: DB 의 행 제한은 「당사자인가」지 「`accepted` 인가」가 아니다 — `match_view` 는 `pending` 지정 매칭이어도 당사자 수요자에게 계좌 컬럼을 돌려준다. 「accepted 일 때만 계좌 표시」는 **화면 조건**(`app/matches/page.tsx:161`). 그리고 「anon 권한 0」은 `rfq_public_view`·`match_view` 에는 맞지만 `suppliers_directory` 는 **anon 에게도 SELECT 가 부여**돼 있다(`…phase6_admin_options.sql:323`, 계좌 컬럼은 없음 — 그래서 비로그인 `/suppliers` 가 열림) | 위 줄들 |
| A10 | 관리자 쓰기 액션은 정확히 4개이며 전부 DEFINER RPC + `is_admin()` 검사 + 감사 로그 기록(`write_audit`) | `lib/admin/actions.ts:193,203,213,222`; RPC `…phase6_admin_options.sql:181-240`(각 RPC 첫 줄 `if not public.is_admin() then raise exception 'admin only'`, 끝줄 `perform public.write_audit(...)`) |

### 7-B. 입찰 규칙 · 주문 수정 규칙 (코드 근거)

| # | 사실 | 근거 |
|---|---|---|
| B1 | 입찰은 **승인된 공급자만**, 가격은 0 이상 정수(상한은 입력창 약 21억 `INTEGER_MAX`), 본인 주문 입찰 불가, 입찰 가능 주문 = 영상주문·분석 중 상태 `open`/`bidding`(**특별주문은 입찰 불가**), 차단 관계 불가, 마감(=촬영요청일시 종료)이 지나면 불가 | `place_bid` `…20260606140000_phase6_hardening.sql:29-65`(`:36-43` 가드들, `:45-46` 마감), `rfq_is_biddable` `init:305-313`; 서버 액션 가격 검증 `lib/rfq/bid-actions.ts:19-21` |
| B2 | **공급자 1곳당 주문 1건 입찰**(재입찰 = 기존 입찰 수정, 상태 `pending` 으로 되돌림). 낙찰/탈락 확정 후엔 수정 불가. **입찰 횟수 제한·최소 단위·밀봉은 없다** — 수요자는 모든 입찰의 업체·금액·제안을 보고(최저가 배지 `[id]/page.tsx:159,234`), 공급자는 본인 입찰만 본다 | 유니크 `bids_unique_per_supplier unique (rfq_id, supplier_id)` `init:165`; 수정 분기 `phase6_hardening.sql:52-60`; RLS `bids_select_supplier_own`·`bids_select_rfq_owner` `init:738-742` |
| B3 | 입찰 철회: 본인의 `pending` 입찰만 `withdrawn` 으로(`bids_delete_supplier` 정책도 `status='pending'` 한정) | `lib/rfq/bid-actions.ts:37-49`, `init:768-769` |
| B4 | 낙찰(`award_bid`): **주문 소유 수요자만**, 입찰이 `pending` 일 때만, 특별주문 불가, 주문 `open`/`bidding` 일 때만 → 한 트랜잭션에서 매칭(`bid_won`·`accepted`) 생성 + 낙찰 입찰 `won` + 나머지 `pending` 입찰 전부 `lost` + 주문 `matched` + 대화방 자동 생성 | `…20260605110000_phase4_chat_notifications.sql:266-296` |
| B5 | **주문 수정 규칙(코드 4가드)**: 본인 주문 · 상태 `open` · **입찰 0건**(update 시점 `EXISTS` 로 페이지 로드 뒤 들어온 입찰 race 차단) · 주문유형 `imaging`. 수정 대상 컬럼은 폼 필드만(제목·지역·요청일시·마감·예산·촬영수단·지점·해상도·반경·제공시간·분석 옵션/협의사항), `requester_id`·`status`·`order_type`·`id`·`created_at` 불변. 브리프의 「본인 AND open AND 입찰 0건」에 **imaging 한정이 더 있다**(지시·브리프의 「3조건」은 실제 4가드) | DB `…20260629010000_update_rfq.sql:42-63`(가드 4개), `:66-90`(UPDATE 컬럼), 권한 `:96-103`(`public`·`anon` 회수, `authenticated` 실행) |
| B6 | 같은 규칙을 **세 곳**에서 검사: 버튼 노출(주문 상세 `[id]/page.tsx:197-199`, 마이페이지 `mypage/page.tsx:108-111`) · 페이지 로드(`rfqs/new/page.tsx:31-36`: 비소유자는 `/mypage`, 조건 불충족은 `/rfqs/<id>?err=…`) · DB(`update_rfq`). 기존 `rfqs_update_owner` RLS 는 건드리지 않음(주석 `update_rfq.sql:7-10`: `award_bid`·`complete_transaction` 이 INVOKER 로 그 RLS 에 의존) | 위 경로 |
| B7 | 예산은 **필수**(최소·최대 중 하나 이상): 서버 zod(`packages/shared/src/validation/rfq.ts:62-65`, draft·submit 모두) + 클라이언트 제출 가드 `rfq-form.tsx:121-130`(빈 값이면 제출 막고 Step 4 로) + 입력 상한 약 21억(`:33-34`, 최소>최대 불가 `:54`) | 위 경로 |
| B8 | 주문 등록 4단계 = 무엇을 / 어디·언제 / 조건 / 예산·확정. 임시저장 상태 `draft` 가 있다(수정 RPC 는 `open` 만이라 임시저장은 수정 대상 아님) | `rfq-form.tsx:37`, `validation/rfq.ts:150-153`(`rfqSubmitStatus`), 열거형 `init:47` |
| B9 | 입찰 상태 표시: 목록 배지 「입찰 중/낙찰/탈락」(철회는 숨김) + 「마감 곧(3시간 이내)/마감 임박(24시간 이내)」 + NEW(24시간) | `rfqs/page.tsx:117-124`, `packages/shared/src/constants.ts:264-284`(`deadlineBadgeKind`·`isRecentlyCreated`) |
| B10 | 직거래 전환: 결제 진입 라우트는 플래그로 차단(`PAYMENTS_DISABLED = true`), 거래 완료는 **수요자만**·`accepted` 일 때만 | `app/payments/[matchId]/page.tsx:12,21`; `…direct_trade_pivot.sql:135-` `complete_transaction` |

### 7-C. 규모 수치 (실측, 브리프 수치와 비교)

| 항목 | 실측 | 브리프 | 근거 |
|---|---|---|---|
| 웹 페이지(라우트) | **28** | 「약 20개 이상」 | `git ls-files 'app/**/page.tsx'` (admin 5·auth·chat 2·guide·matches·mypage 4·payments·privacy·rfqs 3·suppliers 2·supplies 5·terms·홈) |
| 테이블 | **15** (audit_logs·bids·blocks·conversations·matches·messages·notifications·payments·profiles·reports·rfq_analysis_details·rfq_capture_details·rfqs·supplier_profiles·supply_listings) | 9~10 | `grep "create table" supabase/migrations` |
| 뷰 | **6** (rfq_public_view·match_view·suppliers_directory·supply_listings_view·conversations_view·messages_view) | 3 | 같은 grep (`create view`) |
| 마이그레이션 | **23** | — | `ls supabase/migrations` |
| RLS 정책 | 92개 이름(재정의 포함 고유) | — | `grep "create policy"` |
| 공개 함수 | 54개 이름(트리거·헬퍼 포함) | RPC 8개 | `create or replace function public.*` 고유 이름 |
| 커밋 | 77개, 2026-06-05 ~ 06-29 | 「10주 이상」 | `git log` (마지막 커밋이 06-29라 이후 개발은 레포에 없음) |
| 관리자 쓰기 액션 | 4 | 4 | A10 |

미확인: 사용자 수·트래픽, 자동화 테스트 수(이 레포에 테스트 스크립트·설정 없음 — `package.json` scripts 에 `test` 없음), 배포 횟수(레포 밖), 버전은 §1 표로 확인됨.

## 8. 브랜드

| 항목 | 값 · 근거 |
|---|---|
| 주색 | 검정 `#0A0A0B`(`ink-900`; 기본 버튼 `bg-ink-900 text-white` `app/_components/ui/button.tsx:15`, 로고 마크 색 `app/icon.svg`) · 흰 `#FFFFFF`(surface) · 페이지 배경 `#F2F4F6`(`page`) — 「블랙앤화이트」 |
| 보조색 | 링크·실시간 `signal #1B64F2`(bg `#EEF3FF`) · 완료·승인 `pos #0A7D58`(bg `#E9F8F1`) · 필수·마감 `warn #C2410C`(bg `#FFF3EC`) · 오류 `error #DC2626`(bg `#FEF2F2`) · 회색 스케일 `ink-50 #F8F9FA … ink-900 #0A0A0B`(`ink-400 #9598A1`, `ink-500 #6B6E76`) — 전부 `tailwind.config.ts:19-36` |
| 폰트 | **Pretendard Variable**(자체 호스팅 `app/fonts/PretendardVariable.woff2`, 라이선스 OFL `app/fonts/OFL.txt`) — `app/layout.tsx:14-19`(`--font-pretendard`), `tailwind.config.ts:38-` `fontFamily.sans`; 숫자는 `tabular-nums`(`globals.css:27`) |
| 로고 원본 | **SVG**: `app/icon.svg`(64 뷰박스, 흰 라운드 사각 위에 검정 궤도 타원·위성 본체·회색 `#9598A1` 태양전지판) · PNG: `app/apple-icon.png`(180×180) · `app/opengraph-image.png`·`twitter-image.png`(1200×630, 라틴 워드마크 「MatchSat」 + 부제 — 한글 폰트가 없어 영문만, `scripts/gen-brand-assets.mjs:1-6`). 헤더 아이콘은 코드 아이콘 `SatelliteIcon`(`app/_components/ui/icons.tsx`) |
| 히어로·제품 사진 | **없음**(소개 화면은 텍스트+카드, 이미지 자산은 위 아이콘·OG 뿐) → `media/` 에는 로고 SVG/PNG 만 |
| 슬로건 | 「위성영상, 주문부터 납품까지」(`app/page.tsx:10`) · 메타 「위성영상 촬영·분석 매칭 플랫폼 (B2G)」(`app/layout.tsx:34`) · 브리프 카드 부제 「위성영상 익명 매칭 플랫폼」 |
| 참고(이미 있는 캡처) | 포트폴리오 사이트 자산 `~/hongjun-journey/public/shots/matchsat-{desktop,guide,phone,phone-local}-*.{avif,webp}` — 공개 화면(`/` 데스크톱 1440, 사용법, 폰) 위주(`docs/CONTENT/assets/shots-log.json:199-240` 에 `url: https://satorder.kr/`, 1440×900·DSF2, 클립 740px). 로그인 화면은 없다 |

## 9. 다른 세션 점유 (읽기)

- `git worktree list`: `/home/dev/satorder 6aa098e [main]` 하나뿐. 작업 트리 변경은 추적 안 되는 `db.sh`·`deploy.sh` 2개뿐(편집 중인 형제 세션 흔적 아님: 이 파일들은 `.env.local` 토큰으로 배포·DB 도구를 감싸는 래퍼 — 내용 읽기만 함).
- rc 세션: systemd 사용자 유닛 `satorder` = **inactive / disabled**(`systemctl --user list-units`). cwd 가 satorder 인 `claude` 프로세스 없음, satorder 이름의 서버·프로세스 없음.
- 리스닝(`ss -ltnp`, 남의 것·건드리지 않음): next-server 3312·3417·3475·3494·38791, node 8781·8782. 도커 컨테이너: `junimal`(kong 54811 · db 54812), `luvo-judge`(kong 55931 · db 55932) — 이 레포와 무관.
- 빈 포트 후보: Next **3330~3333**, 로컬 Supabase 기본 54321~54324·사본 권장 54421~54429(모두 비어 있음 확인). `~/satorder/.next`·`node_modules` 없음(우리가 만들지 않음).
- 계약서·견적서 파일: **이름 기준 검색에서 못 찾았다.** `~/Downloads`(파일 0개) · `~/prism-hq`(→ `/srv/prism-hq`, 따라가서 `satorder|matchsat|매치샛|새틀|위성|계약|견적|용역|contract|quote|nda|제안` 이름 검색 — 무관 문서 `work/office-v3/contract.md`(사무실 도구 문서)·스크립트 2개뿐) · `~/private`(파일 2개, 일기 사진) · `~/satorder`(레포 안엔 없음, `비밀유지|공개 제한` 문구 grep 0건). 어느 파일도 열지 않았다 → **비밀유지·결과물 공개 제한 조항 인용은 불가(파일 없음)**. 브리프(`briefs/matchsat.md:§1,§9`)가 이미 「조항 확인된 바 없음, 원문 재확인 필요」로 적고 있다.

## 10. 지시와 코드가 다른 점

1. 「pnpm 모노레포」 → 실제 패키지 매니저는 **npm**, 웹 앱은 **레포 루트**(`apps/` 에는 Expo 앱만). `pnpm-workspace.yaml:1-9` 가 스스로 「pnpm 을 쓰지 않는다」고 적음.
2. 「수요 등록」 → 코드 이름 「위성영상주문 (Sat-order)」(`app/rfqs/new`, 내부 용어 RFQ). 「수요 목록·입찰」 → 「주문 입찰」(`/rfqs`), **공급자 전용**이고 관리자는 빈 목록, 수요자는 `/mypage` 로 보내짐(`rfqs/page.tsx:35-36`). 수요자가 받은 입찰을 보는 곳은 `/rfqs/[id]` 소유자 뷰.
3. 「지정 매칭」 → 이름은 「특별주문」의 「지정 주문/지정 매칭」이고 독립 화면이 없다(주문 폼 Step 4 + 공급자 수락/거절 카드 + `/matches`). 「제공 선택」(`supply_selected`)이라는 별개 매칭 경로가 하나 더 있다.
4. 「관리자: 매칭 재지정」 → 독립 화면 없음, **`/admin` 대시보드의 조건부 섹션**(거절된 지정 매칭이 있을 때만). 취소도 같은 섹션.
5. 「관리자: 회원 승인·정지」 → `/admin/members` 에서 승인·거절(대기 카드)과 정지·복구(전체 카드) 4가지 전이.
6. 「주문 수정(입찰 0건일 때)」 → 실제 조건은 본인 + `open` + 입찰 0건 + **`imaging`**(4가드). 특별주문·분석주문·임시저장(`draft`)은 수정 불가.
7. 「입찰 제출 전·후」 → 제출·후 화면은 서버 액션 + 서버 쪽 Supabase 호출이라 운영/가짜 응답으로는 만들 수 없다(§0-2). 입찰 규칙에 횟수·단위·밀봉은 없다(공급자당 1입찰, 재입찰=수정).
8. 「계좌 비공개」 → DB 는 「당사자만」, 「매칭 accepted 일 때만」은 화면 조건이다(A9). 「anon 권한 0」은 `suppliers_directory` 에는 해당하지 않는다(계좌 컬럼은 없음).
9. 규모 수치가 브리프보다 크다: 테이블 15(브리프 9~10), 뷰 6(3), 페이지 28(20+) — 자막은 실측을 쓸 것.
10. 운영이 지금 죽어 있다(Supabase DNS 해석 불가, §0-1) → 운영 공개 화면도 데이터 있는 부분(`/suppliers`)은 비어 보인다.
11. 푸터에 자리표시자 연락처(이메일·전화·사업자번호 형태)가 있다 — pii_scan 대상(§0-6).
12. 작업 트리 「변경 2줄」은 `?? db.sh`·`?? deploy.sh`(추적 안 되는 새 파일) — 시작 전 `git status` 기준선으로 기록할 것.
13. 브리프 §7 「공급자 피드 `/rfqs`… 입찰 이력 있는 상태 필요」는 실제로도 맞다(`rfqs/page.tsx:48` 본인 입찰 상태 조회) — 시드에서 입찰중/낙찰/탈락 3상태 + 마감 임박 + NEW 를 한 목록에 만들어야 한다.

## 추천 촬영 경로 (결정은 메인 세션)

- **A. 운영 공개 화면(익명 GET, 쓰기 0)**: `/`(데스크톱·모바일 메인), `/guide`(사용법 전체 — 역할·주문 유형·매칭 흐름을 설명하는 긴 화면), `/auth`(로그인/가입 탭 — 입력 없이 탭 전환만), `/terms`·`/privacy`. 푸터는 지운다. **지시 항목의 핵심(수요 등록·입찰·지정 매칭·주문 수정·관리자)은 이 경로로 못 찍는다.** 이미 있는 포트폴리오 캡처와 겹치므로 필요 시 보강용.
- **B. 로컬 Supabase(도커) + 레포 사본 — 사실상 유일한 본선**: 마이그레이션 23개 재생 → 가짜 수요자 2·공급자 3·관리자 1 가입 → SQL 로 승인/관리자 지정 → 앱 화면으로 주문 등록(4단계)·입찰·낙찰·지정 주문(수락/거절/거절 상태)·신고 생성 → 상태 흐름·관리자 화면 촬영. 계좌·기관명이 처음부터 가짜라 가림이 쉽다. 위험은 §1 의 「운영 전용 도구 3개를 쓰지 말 것」과 푸터 가림뿐. 막히면 BLOCKED 사유: 로컬 스택 기동 실패 시 같은 막힘 두 번까지.
- **C. 기존 캡처 재사용**: `~/hongjun-journey/public/shots/matchsat-*`(공개 화면). 로그인 화면은 없다.
- 운영 로그인 경로는 권하지 않는다: DB 가 정지돼 있고, 풀려도 로그인이 운영에 세션을 남기며 계정 자격 증명 위치도 모른다.

## 막힌 것 / 확인 못 한 것

- 운영 Supabase 정지 여부는 DNS 로만 확인(복원·상태 조회는 토큰 필요 — 하지 않음). 운영 데모·관리자 계정 존재는 확인 불가.
- 로컬 Supabase 기동은 실행하지 않았다(이미지 일부 — studio·imgproxy·vector·analytics — 보유 여부 미확인, 기본 `config.toml` 이 최소라 CLI 기본값 동작은 실제로 띄워 봐야 안다).
- 사용자 수·테스트 수·배포 횟수는 레포 밖 정보라 미확인.
