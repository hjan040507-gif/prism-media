# okjob BLOCKED / 보고할 것 (2026-11-06)

합격 기준 1~4는 채웠다(desktop 13페이지×full·view, mobile 2페이지, states 4흐름, seq 2, files 2, facts 8, shots, contact). 아래는 못 한 것·바뀐 방식·결정 필요다.

## 못 한 것 / 바뀐 방식
1. **prod 빌드(`next build`)로 못 찍고 `next dev`(webpack, 로컬 사본)로 찍었다.** 사유: 서버 전체 부하(load 40~68, 스왑 0%)로 `heavy-run` build 자리가 1시간 가까이 안 열렸다(`tmp/okjob-build.log`). 시도: 큐에 올려 한 시간 기다림 → 포기하고 dev. 대안: 서버 여유가 생기면 사본(없어졌으면 `git archive ea28ba36` + 마이그레이션·시드 재현 = `capture/src-patches.diff`·`seed-extra*.sql`)에서 `next build && next start -p 3611` 후 `node okjob/capture/10-desktop.mjs` · `20-flows.mjs` · `30-mobile.mjs` · `50-seq.mjs` 재실행. 화면(구성·색·폰트)은 prod 와 같다.
2. **자동 시험 통과 수는 이 세션에서 재측정 못 했다**(`heavy-run npx vitest run` 도 같은 게이트에서 대기·미룸 75). 그래서 facts.md 3번은 파일 66개(`find`)와 `PROGRESS.md:13` 의 마지막 기록(980/980)만 쓴다. 재측정 명령: `cd <사본> && HEAVY_RUN... ~/.claude/bin/heavy-run npx vitest run 2>&1 | tail -8`.
3. **'모바일 PWA 홈' 전용 화면 없음** — 근거 `public/manifest.json` start_url=/dashboard. 모바일 390 의 `/dashboard` 를 홈으로 찍었다(shots.md).
4. **'엑셀에서 옮긴 배정 건수' 사실은 성립하지 않는다** — 엑셀에서 옮긴 것은 근로자 187명(·농가)이고 배정은 앱 손입력이다(facts.md 4번).
5. **「입금 확인」·「알림톡 발송」 화면의 입금·이력 행은 시드가 안 채우는 화면이라 보충 SQL(`capture/seed-extra.sql`)로 가짜 행을 넣었다.** 알림톡 이력은 provider=mock·실제 발송 0.
6. 모바일 상태 흐름은 칩 그리드가 화면 아래라 「추천 그대로 적용」 단계까지만 보인다(같은 scrollY 규칙 때문). 칩이 채워지는 모습은 데스크톱 `states/assign-flow` · `seq/assign-auto-recommend.mp4` 에 있다.

## 보고할 것 (운영 접속·쓰기 가능성)
- **운영 접속 0.** 운영 주소로 가는 요청 0건(`assertLocal` 이 로컬 아닌 호스트 요청을 즉시 중단). 운영 로그인 0. 원본 레포(`~/Okjob`) 에서는 `git archive`·`git show`(읽기)만 실행, `.env.local`·`.auth`·`.vercel` 읽기·복사 0.
- 로컬 Supabase 시드·마이그레이션 직전마다 접속 주소를 `127.0.0.1:57010/57011` 로 확인한 출력이 `capture/local-db-check.txt` 에 있다(4회: base.sql · seed-dev · seed-extra · seed-extra2 직전. 마이그레이션 78개는 `supabase start` 가 사본 config(project_id pm-okjob · 포트 57010~)의 새 도커 컨테이너에 적용했고 운영 링크 파일 `.temp/project-ref` 는 없었다 — 안전 절차 1·2·3).
- 로컬 앱 로그인 1번(로컬 Supabase auth 의 가짜 계정, 로컬 DB 인증 행). 가로챈 요청 합계 0 · 허용한 비GET = 로그인 1 + 읽기 전용 RPC(STABLE 함수) — 저장·확정·발송 버튼은 누르지 않았다.
- 사본에서 바꾼 것(원본 무변경): `scripts/seed-dev.ts` 막힘 2줄 제거 · 농가·근로자·관리자 이름 가림 꼴로 · 비밀번호 출력 줄 제거, 마이그레이션 2개 빈 DB 용 건너뜀, `supabase/config.toml` 신규 — `capture/src-patches.diff`.

## 결정 필요
1. 설정 「시간 단가」·「일당 단가」는 `base.sql` = 고객 확정 실제 설정값이 그대로 화면에 나온다(지어낸 값 아님). 영업 수치로 보고 가짜로 바꿔야 하면 로컬 DB 값만 바꿔 settings·assign·payroll 계열 재촬영(약 20분).
2. 알림톡 화면 상단의 「지금은 예약만 쌓입니다 … mock」 안내와 「실제 발송 꺼짐」 배지는 이 구성에서 앱이 실제로 그리는 문구라 남겼다. 영상에서 자를지 주 세션이 판단.
