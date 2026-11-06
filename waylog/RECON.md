# waylog(웨이로그) 촬영 전 사전 조사 — RECON

조사 시각 2026-11-06 07:28~07:45Z · 읽기 전용(코드·문서 읽기 + 운영 GET/HEAD 만 · 브라우저·서버·빌드·DB 쓰기 0) · 비밀값 기록 0.
레포 = `/home/dev/waylog1` (작업 트리 브랜치 `v3` HEAD `5492691`, origin/v3 와 같은 계열 · main/origin/main = `3cbb43c` = 태그 `v1.9.0`). 이 문서의 코드 근거 줄 번호는 별도 표기가 없으면 **운영 코드 `3cbb43c`** 기준이다(`git show 3cbb43c:<경로>`로 읽음 — 작업 트리의 v3 코드는 줄 번호도 화면도 다르다). 형제 폴더 `~/waylog-ops`(2026-09-29·w16 운영 읽기 점검 JSON) · `~/waylog-release/1.9.0`(출시 로그·rc1 AAB) · `~/waylog-backups`(운영 DB 백업 JSON, 개인정보 포함)는 코드 없는 기록 폴더다.

## 0. 먼저 알아야 할 것 (촬영 방식을 바꾸는 사실 7개)

1. **「지금 Google Play 에 나간 버전」은 레포 기록상 1.5.1(versionCode 33, 태그 `v1.5.1` = `442b3bf`, 2026-06-17)이다.** 근거: `docs/ops/2026-10-12-play-1.8.0-pack.md:11-12`(「Play 프로덕션 = 1.5.1 (versionCode 33) · 1.6.0·1.7.0 은 프로덕션에 나가지 않음」) · `docs/ops/release-1.9.0.md:58` · `docs/handoff/HANDOFF.md:40`. 1.8.0(vc 37)·1.9.0(vc 38)은 Play 에 **내부 테스트** 업로드가 사용자 몫으로 남은 기록뿐(`PROGRESS.md:108`, `docs/release/1.9.0-R1-record.md:25`)이고, 프로덕션 승격 기록은 레포·`~/waylog-release`·`~/waylog-backups` 어디에도 없다. **Play Console 을 못 보므로 확정 불가 → 메인 세션이 사용자에게 한 줄 확인 필요**(지시 10번 「지금 Play 에 나간 버전」이 1.5.1 이면 화면이 지금 웹과 전혀 다르다 — 아래 2번). 참고: 홍준 브리프(`hongjun-journey/docs/CONTENT/briefs/waylog.md:20`)는 「프로덕션 게시 심사 중」이라고 쓰나 그 문서는 1.5.0 시점이라 낡았다.
2. **운영 웹 PWA(https://waylog1.vercel.app)는 1.9.0 = 커밋 `3cbb43c`** 이다. 근거: ① 라이브 번들 `index-CF4JFl-G.js` 안에 버전 문자열 `"1.9.0"` 1건 · 라이브 CSS 에 브랜드 `rgb(0 113 206)`(#0071CE) 3건, v3 의 `#157352` 0건 · 글꼴 Pretendard ② 출시 기록 `docs/release/1.9.0-R1-record.md:19`(⑥ 웹 13:40Z `dpl_3AFaTVFQMec5zsEh9BJKPrxzZ6T9`, 버전 1.9.0, HTTP 200) ③ `git rev-list v1.9.0..main` = 0. **개편(v3: 초록 `#157352`·Wanted Sans·새 로고, 66커밋)은 운영에 안 나갔다**(`PROGRESS.md` 「배포·태그·운영 DB 0」, 라이브에 v3 표식 `ProductsV3`·`#157352` 0건). → 라이브·`3cbb43c` 와 작업 트리(v3)가 섞이지 않게 하려면 **작업 트리를 그대로 빌드하지 말 것**(v3 화면이 나온다).
3. **1.5.1 ↔ 1.9.0 화면이 완전히 다르다.** 1.5.1(Play 프로덕션으로 보이는 쪽)은 핑크·보라 그라데이션·탭 4칸(추천·오늘뭐했지·마이웨이템·커뮤니티)·「바디키 8주 챌린지」 배너(레포에 남은 4월 캡처 `resources/playstore-screenshots/waylog1.vercel.app_ (1).png` 1080×1700 이 이 시기 화면). 1.9.0 은 파랑 `#0071CE`·홈 칩 4개·아래 탭 5칸·「8주 식단 챌린지」. 지시의 6개 화면(홈 피드·리뷰 상세·8주 챌린지·AI 체성분·푸시 설정·관리자)을 모두 갖춘 것은 1.9.0 이다(1.5.1 에는 알림 5종 설정·관리자 신고 화면은 있으나 제품 탭·홈 칩 없음). 추천: **웹 PWA 1.9.0 으로 찍고 shots.md 에 「웹 PWA 1.9.0(vc 38, 운영 라이브와 동일 커밋 3cbb43c). Play 프로덕션은 1.5.1 로 기록돼 있어 화면이 다를 수 있음」**을 적는다(사용자가 1.9.0 이 Play 에 올라갔다고 확인하면 문구만 바꿈).
4. **운영 DB 는 실회원 데이터다 — 운영에 로그인해 찍지 않는다.** 10-24 백업 manifest(`~/waylog-backups/2026-10-24-release-1.9.0/manifest.json`): profiles 38 · reviews 70 · comments 48 · community_posts 3 · notifications 259 · push_subscriptions 18 · challenges 1 · inbody_records 1 · reports 0. 비로그인 GET 은 전 표 0행(RLS, 라이브 GET `Prefer: count=exact` → `*/0` × reviews·community_posts·challenges·inbody_records·profiles·notifications). 즉 **비로그인으로는 홈 피드조차 비어 있고**(첫 화면 = 로그인 화면), 로그인하면 실회원 닉네임·사진·후기 본문·체성분 수치가 뜬다(`hongjun-journey/.../waylog.md:§9` 도 더미 계정/마스킹 요구).
5. **운영 로그인 없이 1.9.0 화면을 그대로 찍는 도구가 레포에 이미 있다**: `audit/` 하네스(`audit/README.md`) — 앱 소스를 vite dev 로 띄우고 Playwright 네트워크 모킹으로 Supabase·AI 를 가짜 응답 + 고정 픽스처로 대체(운영 백엔드 접속 0, `chromiumSandbox: true`). 1.9.0(=W5) 최종 캡처 스크립트 `audit/tools/w5_final_shoot.mjs`(`3cbb43c` 에 있음)가 홈·글 상세·제품·챌린지(8주·1일1팩)·알림·설정·프로필·AI 동의 등 장면 25종 × (390 폭 · 글자 100/130% · 라이트/다크)를 이미 만들었고 결과 89장이 `docs/qa/W5-final/captures/`(390×800 DSF1, 커밋 `32d3d00`) + `contact-sheet.png` 에 있다. **다만 그 장면 목록에는 AI 체성분 결과 · 관리자 화면 · 푸시 토글 전용 장면이 없다**(§3). 목(mock)이 이미 있는 것: 관리자 신고 처리 `audit/lib/mock.mjs:58,322,529`(role admin) · AI 가짜 응답 `audit/lib/ai.mjs`(체성분 `weekly_lifestyle` 포함 `:47`).
6. **이 하네스를 1.9.0 코드로 돌리려면 `3cbb43c` 체크아웃이 필요하다 = `git worktree add`(git 상태 변경)** → 이 단계는 금지라 하지 않았다. 메인 세션이 레포 밖 경로(예: scratchpad)에 `git worktree add --detach <경로> 3cbb43c` 후 `node_modules` 심볼릭 링크 → `audit/dev.sh <빈 포트> <worktree 경로>`(두 번째 인자가 다른 체크아웃의 src 를 띄움, `audit/README.md` 전후 비교 절). 단 `~/waylog1` 은 고객 레포이므로 worktree 추가가 허용되는지(지시: 고객 코드·설정 변경 금지 — worktree 는 `.git/worktrees` 만 건드림)는 메인 세션이 판단. 대안: `git archive 3cbb43c | tar -x -C <레포 밖 빈 폴더>` 로 사본을 만들고 `node_modules` 링크(레포 `.git` 무변경, 가장 안전).
7. **화면 안에서 AI 가 자동으로 불리는 곳이 있다**(「새 AI 호출 금지」에 걸림 — §5): 제품 상세 열기 → `product_summary`, 챌린지 메인에서 22시(KST) 이후 → 오늘의 리포트. 막는 법: Playwright `page.route('**/functions/v1/claude', …)`·`**/functions/v1/verify-facepack` 로 abort/가짜 응답(모든 AI 는 이 두 함수만 거침 `App.jsx:200-212`, `supabase.js:685`) — 하네스 경로(가짜 백엔드)면 애초에 외부로 안 나간다.

## 1. 스택·실행

| 항목 | 값 · 근거 |
|---|---|
| 프레임워크 | React 18.3 + Vite 6.4 + Tailwind 3.4 + React Router 6 · Supabase JS 2.117 · Capacitor 8.5.1(Android) · Firebase 12(FCM 웹푸시) · `package.json`(`3cbb43c` 1.9.0) |
| 구조 | 앱 셸 `src/App.jsx`(7,114줄) · 화면 `src/screens/`(19개) · 상수 `src/constants.js` · 제품 카탈로그 `src/data/products.json`(518개) |
| node | 22(`.nvmrc` 22 · `engines 22.x`) — 서버 node v22.23.1 |
| 명령 | `npm run build`=`vite build` · `npm run dev`=`vite`(포트 5173, **`host: true` = 0.0.0.0 바인딩** `vite.config.js:10-11`) · `npm run preview` · 하네스는 `audit/dev.sh <포트>`(127.0.0.1 `--strictPort`, 가짜 `VITE_SUPABASE_URL=http://supabase.waylog.test`·`VITE_SUPABASE_ANON_KEY=audit-fake-anon-key` 만, `env -i`) |
| 설치 | 작업 트리 `node_modules` 있음(477개) · `audit/node_modules`(playwright 1.63) 있음. worktree/사본은 링크 필요 |
| env 이름(웹) | `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` · `VITE_FIREBASE_API_KEY` `_AUTH_DOMAIN` `_PROJECT_ID` `_STORAGE_BUCKET` `_MESSAGING_SENDER_ID` `_APP_ID` `_VAPID_KEY` · (선택) `VITE_MEDIA_BASE` `VITE_SHARE_ORIGIN` (`.env.example`, 코드의 `import.meta.env.*`). Edge Function 쪽 비밀(클라이언트 밖): `FIREBASE_SERVICE_ACCOUNT` `VAPID_PRIVATE_KEY` `CRON_SECRET` `ANTHROPIC_API_KEY`/OpenAI 키(이름만, `.env.example`·`supabase/functions/README.md`). 레포 루트에 `.env.local`(600)·`.env.production` 있음 — 값 안 읽음 |
| 하네스·시험 env | `AUDIT_BASE` `AUDIT_OUT`(audit) · `E2E_ITEMS` `E2E_DEADLINE_MS` `WAYLOG_SCRATCH`(scripts/e2e) |
| 로컬 Supabase | 가능: `supabase/migrations` 32개(`3cbb43c`; 작업 트리 38) + `supabase/seed.sql` · `supabase` CLI 2.117.0(`~/bin`) · docker 있음 · `supabase/config.toml` 포트 54320-54329(API 54321 · DB 54322). 시작 스크립트 `scripts/e2e/android/sb-start.sh`(레지스트리 폴백), 시험 데이터 `scripts/e2e/android/seed.mjs`(127.0.0.1:54321 아니면 멈춤) · 웹 e2e `scripts/e2e/web/check.mjs`. 이미지 풀 소요·충돌 미확인(서버에 `junimal-verify` supabase 컨테이너가 도는 중 — 포트 겹치면 `config.toml` 포트를 사본에서 바꿔야 함). 하네스(가짜 응답)가 훨씬 가볍다 |
| 레포 규칙 | `CLAUDE.md`: main push 는 배포 안 일으킴(`vercel.json` `git.deploymentEnabled:false`) · 운영 반영은 `node scripts/ops/web-deploy.mjs --yes` 뿐 · `supabase db push` 금지 · push·태그·배포는 프롬프트 승인 시만 |

## 2. 라이브 주소·상태 (`curl -sI`/GET, 로그인 없음)

| URL | 상태 |
|---|---|
| `https://waylog1.vercel.app/` | 200 HTML(SPA, `vercel.json` rewrites `/(.*)`→`/` 라 **모든 경로가 200 + index.html**), `cache-control: no-cache`, 봇 차단·챌린지 없음 |
| `/manifest.webmanifest` | 200 `application/manifest+json`(name 웨이로그, bg/theme `#FFFFFF`) |
| `/privacy.html` `/terms.html` `/delete-account.html` `/og-image.png` `/img/cover/challenge.webp` | 200 |
| `/sw.js` | 200 JS(809B) — SW 정리 스크립트 |
| 비로그인 REST GET(공개 anon 키, 라이브 번들에 들어 있는 값 · 읽기, count 만) | reviews·community_posts·challenges·inbody_records·profiles·notifications 전부 200 `*/0` |

첫 화면은 **로그인 화면**(초대 코드 기반 가입 `AuthScreen.jsx:114-145`, 심사 안내 `docs/ops/2026-09-29-P14-play-forms-draft.md:132-167` 「Waylog is invite-only」). 로그인 전엔 앱 내용이 거의 없다(후기·글 모두 로그인 회원 RLS 0행).

## 3. 지시 항목 ↔ 실제 라우트·컴포넌트 (1.9.0 = `3cbb43c`)

라우트는 **7개뿐**(`App.jsx:6739-6758`): `/`(홈) · `/fav` · `/review/:id` · `/post/:id` · `/profile/me` · `/profile/:userId` · `/challenge` · `/notifications`(+ `/feed` `/community` `/r/:id` 는 리다이렉트). **설정·관리자·체성분·8주 메인·제품 상세는 라우트가 아니라 오버레이(상태 값)** 라 주소로 못 간다 — 클릭 경로로 열어야 한다.

| 지시 | 실제 | 진입 · 필요 데이터 · 셀렉터 힌트 |
|---|---|---|
| 홈 피드 | `/` → `HomeFeed.jsx`(칩 4개: 전체·제품 후기·일상·챌린지 인증, 20개 커서 `:1-3`) · 카드 `components/FeedCard.jsx` | **로그인 필요**(비로그인 0행). 카드가 화면에 절반 이상 1초 보이면 조회 기록 POST(§5) |
| 리뷰 상세 | `/review/:id` → `DetailScreenRoute`(`App.jsx:3842`, 라우트 `:6744`) — 제품 후기. 이야기는 `/post/:id`(`PostDetailRoute`) | 로그인 + 후기 id. 열면 조회 기록(`markViewed`) · 댓글 `loadComments`. 상세 안 제품 칩 → `ProductDetailModal`(`:1098`, **AI 요약 자동 호출 §5**) |
| 8주 챌린지 | 명칭은 **「8주 식단 챌린지」**(`constants.js:55`, id `bodykey-8w`, `weeks: 8`). 화면 `ChallengeMainScreen`(`App.jsx:3088`, 접근 레이블 `:3303`) = 오버레이(표지 `/img/cover/challenge.webp` · 「N일째 · 56일 중」 · 주차 8칸 막대 · 오늘/그래프/체성분 탭). 진입 = 아래 탭 [챌린지](`/challenge` → `ChallengeTabScreen.jsx`) → 8주 카드 → 메인. 시작 `ChallengeStartScreen.jsx` | 로그인 + **참여 중 챌린지 1건**(운영엔 1건뿐·실회원). 하네스는 `challenge-8wk`·`challenge-member`·`challenge-guest` 장면 보유(`docs/qa/W5-final/captures/390-t100-light-challenge-8wk.png` 등) |
| AI 인바디 분석 결과(저장된 결과) | **전용 화면 없음, 이름도 다름**: 화면 글자는 「체성분」(「인바디」 글자는 화면에 없음 — `git grep 인바디` src 0건). `InbodyScreen.jsx`(오버레이, 챌린지 메인 탭 「체성분」 `App.jsx:3328-3332`) 의 기록 목록 + 메인 오늘 탭의 「AI 권장 생활습관」 카드(`latestAILifestyle` `App.jsx:3283-3291`, `inbody_records.data.analyzed_by_ai / weekly_lifestyle`) | 저장 결과 읽기 = `GET /rest/v1/inbody_records?select=*`(RLS 본인, `supabase.js:757`) — **읽기라 안전**, 단 로그인+기록 필요(운영엔 기록 1건·실회원 수치). 새 분석 = `InbodyScreen` 사진 업로드 → `analyzeInbodyImage`(`App.jsx:361`) → `POST /functions/v1/claude {feature:"inbody_photo"}` (**유료, 누르지 말 것**). 재분석 `inbody_reanalyze`(`:384`)도 버튼 |
| 푸시 알림 설정 | 설정(`SettingsScreen.jsx`, 홈 헤더 톱니 `App.jsx:6700`) 「알림」 묶음: 「푸시 알림 켜기」 행(`:217-223`, 웹에서 Notification 지원 시만) + `NotifTypePrefs`(`:34`) 토글 **5개**(좋아요 `:25` · 댓글 · 팔로우 · 챌린지 리마인더 「매일 저녁 7시」 `:28` · 앱 소식 `:29`) | 로그인 필요(토글은 `member_feed_prefs.notif_prefs` 읽기 `notifPrefsApi.get`). **토글을 누르면 쓰기**(`:79-80`; 앱 소식은 `consents` 기록도 `:69`). 「푸시 알림 켜기」를 누르면 권한 + `push_subscriptions` 구독 등록(`App.jsx:6851-6857`) — **누르지 말고 행·토글 화면만** |
| 관리자 게시물 관리 | **「게시물 관리」 화면은 없다.** 가장 가까운 것: 설정 하단 「관리자」 묶음(`SettingsScreen.jsx:163,246`, `app_metadata.role==='admin'` 일 때만 보임) → ① **신고 관리** `AdminModerationScreen.jsx`(탭 「새 신고」「처리함」 `:15-18`, 신고 대상 글 미리보기, 처리 버튼 [숨기기]·[문제없음]·[처리함] → RPC `admin_resolve_report` · 회원 신고는 그 회원 최근 글에 글별 숨김 토글 `admin_set_hidden` `supabase.js:921-990`) ② **소식 보내기**(같은 파일 `NewsBroadcastForm` — 「모든 사용자에게 발송」 = 전 회원 푸시, **절대 누르지 말 것**) ③ **가입 코드** `AdminSignupCodesScreen.jsx`(초대 코드 발급·활성화). 모두 오버레이 | 관리자 계정 필요(§4). **운영 reports 0건**(10-24 백업) → 신고 목록이 비어 「게시물 관리」 느낌이 안 난다. 하네스 목(`audit/lib/mock.mjs:322`)에 신고 처리 있음 — 장면은 `audit/scenarios/w16.mjs`·`rc2.mjs` 쪽에 있을 가능성(미확인) |

Play 스토어 스크린샷 원본: **서버에 실제 Play 등재용 스크린샷은 없다**(`PLAY_STORE_LISTING.md:11` 「스크린샷 6장 ⏳」 — 사용자 작업 펜딩 기록 그대로). 있는 것: ① `~/waylog1/resources/playstore-screenshots/waylog1.vercel.app_ (1).png`(1080×1700, 2026-08-18 커밋, **옛 1.0 이전 시안**: 핑크·보라 그라데이션, 가짜 시드 후기, 「아티스트리 더마아키텍트」「뉴트리라이트」「암웨이홈」 제품명·제품 사진·「바디키 8주 챌린지」 노출 — 현 UI 아님·브랜드 다수 → **media/ 에 넣지 않기 권장**) ② `resources/playstore-feature-1024x500.png`(31KB, 2026-08-18) · `resources/playstore-icon-512.png`(10-13, W4 아이콘). 새 등재 자료는 `docs/ops/2026-10-12-play-1.8.0-pack.md`(문구)·`play-icon-512-1.8.0.png` 정도. 기존 캡처 재사용 후보는 §추천.

## 4. 테스트·관리자 계정 (파일 경로·변수 이름만, 값은 안 읽음)

| 종류 | 위치 | 비고 |
|---|---|---|
| Play 심사용 계정 2개(운영, 관리자 아님) | `~/.config/waylog/play-review.env`(600, 364B) — 변수 `WAYLOG_REVIEW_1_{EMAIL,PASSWORD,ID}` · `WAYLOG_REVIEW_2_{EMAIL,PASSWORD,ID}`(`scripts/ops/w16-review-accounts.mjs:12-34`, 10-01 생성, 닉네임 「심사 계정 1·2」) | **운영 계정**: 로그인하면 운영 DB 에 쓰기(로그인 시 세션, 약관 동의 한 장 표시 가능, 조회 기록 등)가 남고 피드엔 실회원 글이 뜬다. 쓰지 않기 권장 |
| 운영 도구 비밀(service_role·관리 토큰 등) | `~/.config/waylog/secrets.env`(600, 460B) — `scripts/ops/lib.mjs:12` 가 읽음, 운영 ref 허용 목록 `lib.mjs:9` | 범위 밖(운영 쓰기 도구). 읽지 않음 |
| 고정 관리자 계정 | **없음**. 관리자 = Supabase `app_metadata.role='admin'` 을 Admin API/대시보드로만 부여(`App.jsx:4211`, `SettingsScreen.jsx:163`). 레포 어디에도 운영 관리자 계정 정의 없음 | 운영 관리자 로그인은 범위 밖 |
| 로컬 시험 계정(로컬 Supabase 전용, 코드에 하드코딩된 가짜) | `scripts/e2e/android/seed.mjs:13-17`(초대 코드 1개 · 회원 3 `e2e-me@waylog.test` 등) · `scripts/e2e/web/w55.mjs:217`(`e2e-w55-admin@waylog.test` + `app_metadata.role:'admin'`) — 값은 코드 공개 가짜(운영과 무관, 127.0.0.1 만 허용) | 로컬 Supabase 를 띄울 때만 의미 |
| 하네스 가짜 세션 | `audit/lib/world-v31.mjs:52-62`(가짜 JWT, 네트워크 모킹) · 관리자 판정은 `app_metadata.role==='admin'` 을 `audit/lib/mock.mjs:58` 이 같게 봄 | 운영 접속 0, 계정 불필요 — **추천 경로가 이쪽** |

## 5. 쓰기 위험

**GET(화면 열기·스크롤)만으로 운영에 쓰기가 생기는 곳 — 로그인한 상태에서만**(전부 클라이언트가 보내는 REST POST 라 `page.route` 로 막을 수 있다):
- **조회 기록**: 피드 카드가 50% 이상 1초 보이거나 상세를 열거나 좋아요·댓글을 하면 `POST /rest/v1/post_views`(upsert, `src/utils/viewTracker.js:24`, `supabase.js:1137`). 2초마다 모아 보냄. 글쓴이 화면의 「누가 봤는지」에 촬영 계정이 남는다.
- **분석 이벤트**: `analytics.track` → `POST /rest/v1/analytics_events`(`supabase.js:988-991`, 운영 2,630행).
- **로그인 직후 프로필 하이드레이트·동의 확인**(`profiles`·`consents` 읽기, 첫 로그인 동의 한 장 [동의하고 계속하기]는 쓰기).
- Android 네이티브만: 로그인 직후 푸시 토큰 자동 등록(`App.jsx:4334-4358`)·첫 마운트 OS 권한 요청(`:4772-4800`). **웹 PWA 는 자동 등록 없음**(「푸시 알림 켜기」를 눌러야 `push_subscriptions` upsert `:6851`).

**외부 유료 호출(AI) — 화면을 열면 자동으로 부르는 곳**:
- 제품 상세(`ProductDetailModal`) 열기 → 그 제품 후기가 5개 이상이고 캐시가 없으면 `product_summary`(`App.jsx:1180-1185`, `summarizeProduct :344`). 캐시는 `window.storage`(브라우저 저장).
- 챌린지 메인 → 22시(KST) 이후 + 오늘 기록이 있으면 `aiDailyReport` 자동(`App.jsx:2948-2955`). 22시 전엔 호출 없음(「밤 10시에 열려요」 문구).
- 사용자가 누르는 것(누르지 말 것): 체성분 사진 업로드 `inbody_photo`·재분석 `inbody_reanalyze` · 식단 사진 `meal_photo`·이름 `meal_name`·고치기 `meal_rename` · 1일1팩 인증 사진 `verify-facepack`(AI 판정, `supabase.js:685`).
- 모두 `POST {supabase}/functions/v1/claude`(본문 `{feature, input, consentVersion}`)와 `/functions/v1/verify-facepack`. 서버가 일 50회 쿼터(`user_ai_quota`)·AI 동의 확인. 막는 법: 위 두 URL 을 `page.route` 로 abort 또는 고정 JSON(하네스는 `audit/lib/ai.mjs` 가 이미 함). `window.__WAYLOG_AI_PAUSED__ = true`(`addInitScript`, `constants.js:232`)는 자동 호출만 끄지만 화면이 「AI 점검 중」 문구로 바뀐다(`aiOff`, 저장된 결과 카드는 영향 미확인) — AI 결과 장면에는 쓰지 말고 라우트 차단을 쓸 것.

**전 회원에게 나가는 것(절대 클릭 금지)**: 관리자 「소식 보내기」→ [모든 사용자에게 발송](`AdminModerationScreen.jsx:150-160`, `send-push` news 일괄, 실제 FCM). 신고 [숨기기]/[문제없음]/[처리함]·회원 글 숨김 토글(`admin_resolve_report`·`admin_set_hidden` — 운영 쓰기). 가입 코드 발급·비활성(`AdminSignupCodesScreen`).
**설정 토글**: 알림 5종 토글(`member_feed_prefs` upsert, 앱 소식은 `consents` 행 추가), 글자 크기·다크 모드는 로컬 저장.
**기타**: 좋아요·댓글·팔로우·찜·차단·신고·글쓰기·프로필 수정·계정 삭제(`delete-account` 함수) 전부 쓰기. 이야기 사진은 비공개 버킷 서명 URL(`story-photos`).
**서버 쪽 GET 쓰기(page.route 로 못 막음)**: 코드상 없음(조회수는 위처럼 클라이언트 POST — 막을 수 있음. `post_views` 서버 함수 `post_view_counts` 는 읽기 RPC). 운영 크론 `send-challenge-reminders`(매일 19:00 KST, GitHub Actions)는 브라우저와 무관.
**하네스 경로면 위 전부 가짜 응답이라 운영 쓰기 0**(모킹 안 된 URL 이 나가는지는 `audit/lib/harness.mjs` 가 가짜 호스트 `supabase.waylog.test` 로만 보내 DNS 에서 막힘).

## 6. 가림 대상 (브랜드명 위치 · 셀렉터 힌트)

공개 표기 방침(지시 10번 + `hongjun-journey/docs/CONTENT/briefs/waylog.md` publicity_note·§9): 제품 회사·브랜드명 글자는 화면에서 지우고, 로고가 크게 보이는 제품 사진 칸은 고르지 않는다. 브랜드 = **암웨이(Amway) 및 그 제품 상표**(뉴트리라이트·아티스트리·퀸·바디키 등). 앱 이름 「웨이로그」는 자체 이름이라 유지.

**브랜드명이 나오는 위치(1.9.0)**

| 위치 | 근거 | 가림 방법 힌트 |
|---|---|---|
| **제품 카탈로그 전부**: 제품 이름·브랜드 칸·제품 사진(암웨이 공식 CDN `media.amway.co.kr` 에서 실시간 로드, **518개 전부** 사진 URL — 포장에 로고 인쇄) | `src/data/products.json`(518개: 브랜드 칸 있는 260개), `utils/ui.js:53` `isCatalogImage`, 앱은 이미지를 `<img src>` 로 직접 불러옴 | 제품 탭(`ProductsScreen`)·제품 상세(`ProductDetailModal`)·홈 하단 추천·글 카드의 제품 칩 = **고르지 않는다**(제품 사진이 로고 크게 보이는 칸). 홈 피드 후기 카드엔 제품 사진이 안 나오고 제품 이름 글자만 → textMap 으로 치환 |
| 후기 카드·상세의 제품 이름 줄(`product_name`, 사용자 글에 「아티스트리 더마아키텍트」 등) | `App.jsx:7052-7055`(예시 문구에도 「아티스트리 더마아키텍트」「암웨이 퀸 Ti 크라운 세트」「뉴트리라이트 원포원」), `FeedCard.jsx` | 텍스트 치환(`page.evaluate` 로 text node 치환 또는 하네스 픽스처의 제품명 자체를 중립 이름으로 바꾸기 — 하네스면 픽스처 값 교체가 깔끔) |
| 상세 하단 「이미지: amway.co.kr」 캡션 | `App.jsx:1230` | 제품 상세 안 — 제품 상세를 안 찍으면 안 나옴 |
| **설정 > 법적 고지**: 「Amway Corp. / 암웨이 코리아와 관련이 없는 독립 앱」 · 「(예: Artistry, Nutrilite, 퀸, 바디키 등)」 · 「amway.co.kr 공식 미디어 서버」 · 「amway.co.kr 공식 사이트」 | `SettingsScreen.jsx:334,339,343,347` | 설정 화면 스크롤 후반 접힘 블록(`확장` 행) — 알림 장면은 위쪽이라 안 나오나, 설정 전체를 길게 찍을 땐 가림 |
| 정적 법적 페이지 | `public/terms.html:91`(「Amway Corp. / 암웨이 코리아 … 무관한 독립·비공식 앱」) · `PLAY_STORE_LISTING.md:84,93` | 이 페이지를 안 찍으면 해당 없음 |
| 카테고리 칩·필터 라벨 「원포원」 · 「뉴트리션」 등 | `constants.js:114-122`(`one4one` = 「원포원」, 아이콘 `public/img/cat/one4one.webp`) · 인기 태그 `POPULAR_TAGS`(`constants.js:23`: 푸로틴·더마아키텍트·원포원 …) | 「원포원」은 뉴트리라이트 기부 프로그램 이름 → 칩·제목 치환(「나눔」 등) |
| **8주 챌린지 주간 미션 글**(브랜드 제품이 미션 문장에 들어 있음) | `constants.js:162`(w1m2 「바디키 쉐이크로 한 끼 대체하기」) · `:172`(w2m5 「화이버 비츠 섭취하기」) · `:178`(w3m4 「푸로틴 쉐이크 마시기」) · `:198`(w6m3 「바디키 쉐이크 + 푸로틴 콤보」) · `:206`(w7m4 「더블엑스 비타민 섭취」) (줄 번호 `3cbb43c:src/constants.js`, 미션 배열 `:159-215`) | 챌린지 메인 「오늘」 탭의 미션 체크리스트 — 주차에 따라 해당 줄이 보임(1·2·3·6·7주차). 치환 필요 |
| 홈 프로모션 카드 「굿모닝 챌린지」(외부 링크 `gutmorning.co.kr`) · 챌린지 목록 `PromotionListScreen` | `constants.js:42-51`, `PromotionListScreen.jsx` | 외부 서비스명 — 방침상 안전하게 치환/미노출. 챌린지 목록 화면은 안 찍는 편이 쉬움 |
| 1일1팩 선물 「셀렉트팩 1개」 | `constants.js:38` `FACEPACK_GIFT_NAME` | 제품 시리즈명(브랜드 인접) — 1일1팩 화면은 지시 목록 밖 |
| AI 체성분 분석·생활습관 카드 문구(서버 응답) | `supabase/functions/claude/features.ts` 프롬프트 · 응답에 제품명(예: 단백질 쉐이크)이 들어갈 수 있음(미확인) — 하네스 가짜 응답 `audit/lib/ai.mjs` 의 문구는 확인 필요 | 장면 캡처 후 글자 검사 |
| 로고 이미지 | 앱 로고·아이콘은 자체 「웨이로그」(`public/icons/*`, `resources/*.svg`) — 브랜드 로고 아님. `public/img/cat/*.webp`·`img/banner/event.webp`·`img/mission/*`·`img/empty/*`·`img/cover/*` 는 일러스트/표지(제품 로고 여부 **미확인**, 눈으로 한 번 볼 것: 특히 `banner/event`·`cat/one4one`·`cover/pack`) | 촬영 후 대조 |

**브랜드명 문자열 목록(textMap 후보 — 한글·영문·도메인)**: 암웨이 코리아 · 암웨이 · Amway Corp. · Amway · amway.co.kr · media.amway.co.kr · 암웨이홈 · 암웨이 퀸 · 퀸(Ti 프라이팬·웍·크라운 세트 등 퀸 제품) · 아티스트리 · 아티스트리 맨 · Artistry · 뉴트리라이트 · 뉴트리라면 · Nutrilite · 더블엑스 · 바디키 · BodyKey · 원포원 · 화이버 비츠 · 푸로틴 · 더마아키텍트 · 하이드라매틱스 · 셀렉트팩 · 시그니처 셀렉트 · 스튜디오 스킨 · 아이디얼 래디언스 · 엣모스피어(스카이·드라이브) · 글리스터 · 이스프링 · 까페드다몬 · XS 에너지 · g&h · LAB224 · 정기품 · 후아 · 노브스갈라 · 라임트리 · 행복한아름 · 스페셜 케어 · 종가 · 프라임펫 · 인텐시브 · 웰로스 · 아이쿡 나이프웨어 · 본작 · 재사용 쇼핑백 · 굿모닝 · gutmorning.co.kr(`products.json` 브랜드 칸 30종을 센 값 — 일반어와 겹치는 「종가」「인텐시브」「본작」「스페셜 케어」는 제품 이름 줄에서만 치환 필요 시 판단).

**개인정보(운영 로그인 시 · 하네스면 해당 없음)**: 회원 닉네임·프로필 사진·후기 본문·사진·댓글·알림 목록·체성분 수치/측정지 사진·초대 코드(가입 코드 화면)·관리자 신고 대상 글·이메일(설정/내 정보 상단). 홍준 브리프 §9 도 「스크린샷 전량 마스킹 또는 더미 계정」.
**팝업**: 알림 권한 안내 배너·AI 동의 시트·업데이트 안내(`UpdateRequired`, `app_config.min_version=1.5.1` 이라 1.9.0 에선 안 뜸)·온보딩(`OnboardingScreen`) — 첫 로그인 직후 나올 수 있어 닫고 찍을 것. 설치 안내 배너는 코드에서 `InstallPrompt` 식별 못 함(미확인).

## 7. 사실 후보 (자막용 · 근거)

| # | 사실 | 값 · 근거 |
|---|---|---|
| 1 | **챌린지 기간: 8주 = 56일** | `constants.js:26-27`(`CHALLENGE_WEEKS = 8`, `CHALLENGE_DAYS = CHALLENGE_WEEKS * 7`) · 화면 「N일째 / 56일 중」 · 주차 8칸 막대(`App.jsx:3306`) · 시험 `utils/challenge.test.js:63-66` · 주차별 미션 8주×5개=40(`constants.js:159`, 주석 「8주 x 5개 = 40 미션」, 정적 데이터 `CLAUDE.md`). 완료 판정은 57일째 00시(`b33-compat.test.js:65-75`). 같은 앱의 **1일1팩은 30일 · 28번 인증 시 선물**(`constants.js:36-38`, 쉬는 날 2번, 서버 `facepack_gift_required()` `20261023000300_w54_challenge_notifs.sql`) — 자막에 둘을 섞지 말 것 |
| 2 | **푸시: 설정의 알림 종류 5종** (좋아요·댓글·팔로우·챌린지 리마인더(매일 저녁 7시, KST 19:00 GitHub Actions 크론)·앱 소식) | `SettingsScreen.jsx:23-30` `NOTIF_TYPES`(5개). 서버 푸시 type 은 6개(like·comment·follow·challenge·news·**notice**) — `notice`(약관·처리방침 변경 등 서비스 알림)는 설정에 토글이 없고 항상 발송 `send-push/index.ts:55-62`. 따라서 「5종 토글」이 화면과 일치(코드 `docs`·브리프 「5종 토글」과 같음). 앱 안 알림 목록(소식)에는 조회 소식 digest(푸시 없음, `20261023000300…sql:7`)·새 회원 알림도 있으나 푸시 아님 |
| 3 | **비공개 테스트 인원·기간: 미확인(레포·서버에 Play Console 기록 없음)** | 유일한 근거는 레포 밖 브리프 `hongjun-journey/docs/CONTENT/briefs/waylog.md:62`(「등록 16명 / 참여 선택 12명+ / 활성 9명 → 이후 독려·추가 모집으로 증가, 증가 후 수치 미확인」)·`:23`(「비공개 테스트 14일」)·`:154`(프로덕션 액세스 1차 반려→2차 승인) — Play Console 에서 가져온 값을 사람이 옮긴 문서이고 그 뒤 수치는 모른다. 같은 브리프 §9 가 「테스터 수는 절대값이 작아 수치는 물어보면 답하는 선」이라 **자막에는 수치를 쓰지 말 것 권장**(쓰려면 사용자에게 Play Console 확인) |
| 4 | 버전 이력: versionCode 4 → 38(1.9.0 = vc 38, `android/app/build.gradle:18-19`) · 1.5.1 = vc 33(Play 프로덕션) | `HANDOFF.md:541-551`, `docs/ops/2026-10-12-play-1.8.0-pack.md:11` |
| 5 | 운영 규모(자막 쓰려면 주의: 실데이터 작음) | 10-24 백업: 회원(profiles) 38 · 후기 70 · 댓글 48 · 이야기 3 · 챌린지 1 · 체성분 1 — 규모가 작아 수치 자막 비권장 |
| 6 | 제품 카탈로그 518개 · 분야 6종(뉴트리션·웰니스·뷰티·퍼스널케어·홈리빙·원포원) | `products.json`(518), `constants.js:114-122` — 브랜드 제품 카탈로그라 자막에 쓰면 브랜드를 암시(방침상 비권장) |
| 7 | AI: 체성분 사진 → 수치 자동 입력 + 주간 생활습관 5카드, 사용자당 일 50회 | `supabase/functions/claude`(feature `inbody_photo`), `user_ai_quota`, 브리프 §3-②(일 50회). 현 AI 공급자는 코드 확인 필요(CLAUDE.md: Anthropic 모델 퇴역 → W1-4b 에서 OpenAI 전환, `constants.js:228`) |
| 8 | 알림 종류 5 · 홈 칩 4(전체·제품 후기·일상·챌린지 인증) · 아래 탭 5칸 | `HomeFeed.jsx:1`, `SettingsScreen.jsx:23` · 탭 5칸은 `docs/release/1.9.0-notes.md`(아래 가운데 [쓰기]) |

## 8. 브랜드 (앱 자체 색·폰트)

| 항목 | 운영(1.9.0) | 근거 |
|---|---|---|
| 주색 | **`#0071CE`**(brand-500 · 눌림 `#005BA5` · 강조 글자 `#00447C` · 연한 `#EBF4FB`) | `tailwind.config.js:22-34`(「W5-1 사용자 승인 ②: W4 먹 계단을 1.7.0 값으로 되돌림」) · 라이브 CSS `rgb(0 113 206)` 확인 |
| 폰트 | Pretendard(`font-family: Pretendard, -apple-system, …`) — **1.9.0 은 글꼴 파일을 자체 호스팅하지 않는다**(`3cbb43c` 에 `public/fonts` 없음) → 기기에 설치된 Pretendard 가 없으면 시스템 한글 글꼴로 나온다. 촬영 서버에서도 폴백 글꼴일 것(필요하면 하네스가 쓰는 글꼴 설정 확인) | `tailwind.config.js:17-20`, 라이브 CSS font-family |
| 바탕·글자 | 흰 `#FFFFFF`(manifest bg/theme `#FFFFFF`), 다크 모드 있음, 회색 계단 `#EDF1F5…#13181D`(`tailwind.config.js:3-4`) | |
| 참고(개편 v3 — 운영 아님) | 웨이 그린 `#157352` · Wanted Sans 자체 호스팅 · Phosphor 아이콘 · 새 로고 | `CLAUDE.md` 브랜드 색 절, 작업 트리 `public/manifest.webmanifest`(`background_color #157352`) — **라이브에는 없음** |
| 로고 | 앱 아이콘 `public/icons/icon-192.png`·`icon-512.png`, 소스 `resources/icon-*.svg`·`wordmark-paths.json`(1.9.0 의 「웨이로그」 워드마크 — 새 로그인 화면) | |

## 9. 다른 세션 점유 (읽기만)

- `ps` 에 waylog 프로세스 없음 · `ss -ltnp` 에 waylog 포트(5173·53xx·54xx) 점유 없음(5432 는 다른 용도) · rc 세션 `waylog1 inactive disabled`(`rc-list`).
- worktree: 본체 `/home/dev/waylog1`(v3) 외에 **다른 세션의 분리 worktree** `/tmp/claude-1001/-home-dev-waylog1/2a44500d-…/scratchpad/wt-before`(414c379, detached) 가 등록돼 있다 — **건드리지 말 것**. 작업 트리에 `.claude/scheduled_tasks.lock` 변경 1건(이전 세션 락, 소유 pid 2326562 는 이미 없음).
- 레포 안 `.claude/worktrees/`·`audit/out/perf-src-*` 는 이전 에이전트 사본(디스크 문제 이력 `agent-worktree-disk-growth` 참조) — 읽기만.
- 서버에 `junimal-verify` supabase docker 컨테이너가 방금 떠 있음(다른 프로젝트) → 로컬 Supabase 를 쓰면 포트·이미지 충돌 주의.

## 10. 지시와 코드가 다른 점 (한 줄씩)

1. **「지금 Google Play 에 나간 버전」** — 레포 기록상 프로덕션은 1.5.1(vc 33)이고 1.9.0 은 내부 테스트 업로드까지만 기록됨(`docs/ops/2026-10-12-play-1.8.0-pack.md:11`, `docs/ops/release-1.9.0.md:58`, `PROGRESS.md:108`). 웹 PWA 는 1.9.0. → **둘이 다른 화면**. Play Console 확인 필요(결정 필요).
2. **「웹 PWA 가 그 버전과 같은 코드인가」** — 웹 = 1.9.0(`3cbb43c`) = 레포 `main`/태그 `v1.9.0`. Play 프로덕션(1.5.1)과는 다른 코드. 작업 트리(v3, 초록 개편 66커밋)는 어느 쪽과도 다름 — 개편 화면은 라이브에 안 섞인다.
3. **「리뷰 상세」** — 라우트 `/review/:id`(제품 후기)·`/post/:id`(이야기) 두 종류. 지시의 「리뷰」는 `/review/:id`(`App.jsx:6744`). 데이터는 로그인해야 보인다.
4. **「8주 챌린지」** — 화면 이름은 「8주 식단 챌린지」, 내부 id `bodykey-8w`(브랜드 흔적). 라우트 없음(오버레이, `App.jsx:3088`). 1.5.1 에서는 「바디키 8주 챌린지」.
5. **「AI 인바디 분석 결과」** — 전용 화면 없음. 화면 글자는 「체성분」(`InbodyScreen`, 챌린지 메인 「체성분」 탭) + 「AI 권장 생활습관」 카드(`App.jsx:3283`). 저장 결과 GET 경로는 `inbody_records` REST(`supabase.js:757`)이고 새 분석은 `/functions/v1/claude` `inbody_photo`.
6. **「푸시 알림 설정」** — 별도 화면 없음, 설정 안 「알림」 묶음(「푸시 알림 켜기」 행 + 5개 토글). 푸시 「종류 수」는 설정 토글 5개, 서버 type 은 6개(notice 포함, 토글 없음).
7. **「관리자 게시물 관리」** — 그런 이름의 화면 없음. 있는 것은 설정 하단 「관리자」 → 신고 관리(신고된 글의 숨김/문제없음)·소식 보내기·가입 코드(`AdminModerationScreen.jsx`, `AdminSignupCodesScreen.jsx`). 운영 신고 0건이라 목록이 비어 있음.
8. **「Play 스토어 스크린샷 원본」** — 서버에 실제 Play 등재 스크린샷 없음(`PLAY_STORE_LISTING.md:11` ⏳). 레포 `resources/playstore-screenshots/` 의 1장은 옛 4월 시안(현 UI·브랜드 노출).
9. **「비공개 테스트 인원·기간」** — 레포·서버에 Play Console 기록 없음. 홍준 브리프의 옛 수치(16/12+/9, 14일)뿐.
10. **`CLAUDE.md` 의 「현재 출시 빌드 1.8.0」** 은 targetSdk 문맥의 서술이고 `CLAUDE.md` 「현재 상태 (2026-09-25)」 는 「Play 1.5.1 · 웹 1.5.0 정지」로 낡았다 — 현재 웹은 1.9.0(위 2번). 이 레포 문서 3곳(CLAUDE.md·브리프·release 문서)의 Play 버전 서술이 서로 다르니 `docs/ops/release-1.9.0.md:58` 을 최신으로 취급.
11. 지시의 「390×844·DSF 3」 — 기존 W5 캡처는 390×800 DSF1, 하네스는 해상도를 시나리오가 정함(DSF 3 지정 시 다시 찍어야 함, `audit/lib/harness.mjs` 의 `openSession` 옵션 미확인).

## 추천 촬영 경로 (결정은 메인 세션)

1. **1순위 — 로컬 사본(1.9.0 `3cbb43c`) + 레포의 `audit/` 가짜 응답 하네스**(운영 접속 0, 실회원 데이터 0, AI 가짜). `git archive 3cbb43c` 사본(또는 레포 밖 worktree) + node_modules 링크 → `audit/dev.sh <빈 포트> <사본>` → 홈 피드·글 상세·8주 챌린지·알림 설정은 `w5_final_shoot.mjs` 장면 재사용, **체성분 AI 결과·관리자 신고 관리는 `audit/lib/mock.mjs`·`ai.mjs` 목을 활용해 장면 추가**(픽스처의 제품명·미션 글은 브랜드가 있으므로 중립 이름으로 치환 또는 textMap). 이미지 `audit/cache/amway`·카탈로그 사진은 쓰지 않는 장면으로 구성.
2. **차선 — 기존 캡처 재사용**: `~/waylog1/docs/qa/W5-final/captures/`(1.9.0, 가짜 데이터, 라이트·다크, 390×800 DSF1)에서 홈·글 상세·챌린지(8주)·알림·설정·프로필 사용 가능(해상도·DSF 부족 + 브랜드 문구 검수 필요). 체성분 결과·관리자는 없음 → 1순위로 보충.
3. **쓰지 말 것**: 운영 로그인(심사 계정 포함 — 실회원 글·post_views 기록·조회 이력 남음), 작업 트리(v3) 직접 빌드(운영과 다른 초록 화면), `resources/playstore-screenshots` 옛 시안(브랜드·옛 UI).

## 막힌 것 · 미확인

- Play Console 의 현재 프로덕션/내부 테스트 버전 · 비공개 테스트 인원·기간(레포·서버에 기록 없음 → 사용자 확인).
- 하네스가 1.9.0 사본에서 실제로 뜨는지(빌드·dev 서버 실행 금지 단계라 미시험), `w16.mjs`·`rc2.mjs` 에 관리자 화면 장면이 있는지, `openSession` 의 DSF 옵션, 일러스트(`img/banner·cat·cover`)에 브랜드 로고가 있는지, AI 가짜 응답 문구의 브랜드 포함 여부.
- worktree/사본 생성 방식(고객 레포 git 상태 무변경 원칙과의 관계)은 메인 세션 판단.
