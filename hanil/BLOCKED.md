# hanil BLOCKED / 결정 필요 / 보고할 것

## 못 채운 것
1. **prod 빌드로 관리자 화면을 못 찍음 → `next dev` 로 찍음.**
   - 사유: `flock … heavy-run npm run build` 가 서버 부하 게이트(load 40~80 > 7.2, 스왑여유 0~3%, 다른 세션 gradlew 빌드 자리 점유)에서 07:57Z 부터 약 1시간 대기, 열리지 않음.
   - 시도: 대기 큐 확인(`heavy-run --status` 기다리는 7~15개), 그대로 대기 → 대기 빌드를 내 PID 로 중단.
   - 대안(적용): 사본 `tmp/hanil-src` 의 `next.config.ts` 에 `devIndicators:false` 만 더해(사본만) `next dev -H 127.0.0.1 -p 3613` 로 촬영. 렌더 결과(HTML·CSS)는 같고 개발 배지는 숨김. 관리자 화면 픽셀이 prod 빌드와 미세하게 다를 수 있음 — 필요하면 서버가 한가할 때 `npm run build` + `next start` 로 `capture/b-admin.mjs` 만 다시 돌리면 됨(재현 명령은 아래).
2. **기획서 원문 대조 결과는 재현 불가.** 레포에 원문(PPT)·대조 스크립트 없음 — facts.md #5 에 `PROGRESS.md` 서술을 그대로 인용하고 '원문 대조 재현 불가' 로 표기.
3. **설비 "49항목"(브리프)은 코드로 맞출 수 없음** → 코드 근거 24행(9+6+9)만 facts.md #4 에 씀. 49 는 미확인.
4. **문구 수정 폼 17개 중 대표 3개(메인 화면·인사말·설비현황)만 촬영**(지시: 2~3개). 흐름(3단계)은 메인 화면 폼.
5. **공지사항·자료실 공개 화면은 안 찍음**(지시에 없음, 운영 공지 실제 내용이 올라 있을 가능성 — 열람 안 함).
6. **운영 견적 폼 제출·성공 화면은 운영에서 못 찍음**(안전: 서버 액션이 고객 수신자에게 메일을 실발송). 같은 코드의 로컬 사본에서 `states/quote-submit-local/` 로 대체.
7. 운영 공개 견적 폼 흐름은 스크롤 높이(900px) 때문에 제출 버튼이 같은 scrollY 프레임 밖(동의 체크까지가 한 화면). 버튼은 `desktop/support-quote-full.png` 에 보임.

## 결정 필요
- **접근성 점수를 영상에 쓸 때의 문구**: 이번 재측정(2026-11-06, Lighthouse 12.8.2 모바일)은 6개 페이지 중 4개 100, `/company/greeting` 96·`/product/gas-nitriding` 95. 7월 기록 "100"(모든 페이지가 아니라 측정 페이지 기준)을 그대로 쓰면 과장. 추천: "주요 페이지 다수 100" 또는 점수 미표기. (게이트·기대값을 실측에 맞춰 바꾸지 않았다 — 결과 그대로 기록.)
- 포트폴리오에 노출해도 되는 도판·설비 사진 수준: `hanil-metal.md` 가 "공정 도판·설비 사진은 클라 자산(개별 재배포 금지)"으로 적음. 공개 화면 캡처에 도판이 그대로 들어 있음.
- 공개 화면의 `010-****-****` 전화 글자: 헤더 CTA·히어로 CTA 등 4~5곳이 가림 규칙(전화→010-****-****)대로 바뀌어 보임. 영상에서 어색하면 해당 요소를 `remove` 로 바꿔 다시 찍을 수 있음(`capture/common.mjs` REDACT_PUBLIC).

## 보고할 것(운영 접속·쓰기 가능성)
- 운영 `www.hanil-pnk.com` 접속은 **GET 만**(비GET 가로챔 0건·허용한 비GET 0건, 서버 액션·파일 선택 없음). 요청 사이 ≥1.5초. Vercel 체크포인트 차단 없음. 운영 로그인 0회.
- Lighthouse 접근성 측정은 같은 사이트 GET 6회(페이지당 1회 + 자원).
- 허용한 비GET 은 전부 로컬(127.0.0.1:3613 사본 · 127.0.0.1:57031 로컬 Supabase)로만 감: 로그인 `POST /auth/v1/token`(로컬 GoTrue, 가짜 관리자) 및 로컬 저장·업로드·상태 변경.
- 원본 `~/hanil` 폴더에서는 명령 실행 0(`git -C ~/hanil archive 8a0ee85a` 만 읽기 전용 호출).
- 0004 마이그레이션이 넣는 고객 실제 담당자 이메일 행은 로컬 DB 에서 `UPDATE` 로 가짜 관리자(admin@example.com)로 덮음. 실제 이메일은 어떤 캡처·문서에도 없음(grep 0).
- 로컬 Supabase: `supabase start` 가 마이그레이션 12개를 시작 시 자동 적용함(DB 가 없던 최초 기동이라 사전 확인 불가) — 직후 `status` 로 `127.0.0.1:57031/57032` 확인(`capture/local-db-check.txt`), 이후 시드 직전에도 확인 후 기록.

## 재현
- 로컬 관리자 촬영: 사본 `git -C ~/hanil archive 8a0ee85a | tar -x -C tmp/hanil-src` → `supabase init`(포트 57031~57037, studio/analytics/edge_runtime/pooler 끔) → `supabase start` → `supabase status -o env | python3 -I hanil/capture/mkenv.py tmp/hanil-src/.env.local` → `psql … -f hanil/capture/seed-local.sql` → `FAKE_ADMIN_PW=<가짜> node hanil/capture/seed-admin-user.mjs` → 앱 3613 → `FAKE_ADMIN_PW=<가짜> node hanil/capture/b-admin.mjs`.
