# 2차 촬영 서브에이전트 지침 (prism-media · 2026-11-06)

먼저 읽기: `docs/specs/portfolio-capture-2.md`(이번 지시) → `docs/specs/portfolio-capture.md`(규격·가림·안전·문서·합격 기준) → `docs/CAPTURE-BRIEF.md`(도구·산출물·안전 — 전부 그대로 적용) → `<proj>/RECON.md`(사전 조사) → `PROGRESS.md` 맨 위 '2차 지시와 코드가 다른 점'의 그 프로젝트 줄. 이 문서는 2차에서 더하거나 바뀐 것만 적는다.

## 바뀐 것
- 기준선은 `docs/baseline2/<repo>.status`(07:40Z). 끝낼 때 `diff <(cat docs/baseline2/<repo>.status) <(git -C ~/<repo> status --porcelain)` 이 비어 있어야 한다(소스 없는 프로젝트는 생략).
- 지시와 코드가 다르면 **실제 화면 이름·구성대로** 찍고 shots.md 에 '지시의 ○○ = 실제 △△'로 적는다. 없는 화면을 만들거나 새로 그리지 않는다. 없는 것은 BLOCKED.md 에 '화면 없음(근거 file:line)'으로.
- 상태 흐름이 지시대로 안 되면(단계가 없는 한 장 폼 등) 실제로 있는 단계로 다시 정의한다: 예) 빈 폼 → 직군 선택 → 입력 채움 → 제출 직전 → (가로챈) 성공 화면. 각 단계는 같은 뷰포트·같은 scrollY.
- 커밋·push 는 주 세션이 한다. 너는 하지 않는다.

## 로컬 실행 (사본 · 포트 배정)
- 사본: `git -C ~/<repo> archive <커밋> | tar -x -C ~/prism-media/tmp/<proj>-src` (지시의 'worktree' 대신 — 원본 git 상태를 아예 안 건드리는 같은 효과, 1차 결정). 원본 레포 폴더에서는 어떤 명령도 실행하지 않는다(`supabase --version` 도 `.temp` 파일을 만든다).
- 포트(겹치지 않게 미리 나눔): okjob Supabase 57010~57019·앱 3611 / matchsat 57020~57029·3612 / hanil 57030~57039·3613 / waylog 앱 3614 / sy-motors 앱 3615·목 3616. 쓰기 전에 `ss -ltn` 으로 비었는지 확인, 차 있으면 그 범위 안 다른 포트.
- 빌드: `cd tmp/<proj>-src && npm ci && flock ~/prism-media/tmp/locks/build.lock ~/.claude/bin/heavy-run npm run build`(heavy-run 이 75 로 끝나면 미룸 — 다시 띄운다). 서버: `nice -n 10 npx next start -p <포트>` 를 run_in_background, PID 를 tmp/<proj>-app.pid 에.

## 로컬 Supabase 안전 절차 (okjob·matchsat·hanil — 운영 DB 를 지우는 사고를 막으려고, 하나도 빼지 않는다)
1. 사본에 `supabase/.temp` 가 없는지 `ls` 로 확인(있으면 사본에서만 지운다 — 운영 프로젝트 링크 파일).
2. supabase 명령은 언제나 사본 폴더에서 `env -u SUPABASE_ACCESS_TOKEN -u SUPABASE_DB_PASSWORD -u SUPABASE_PROJECT_REF -u SUPABASE_URL -u SUPABASE_SERVICE_ROLE_KEY supabase …` 로. `--linked`·`--db-url`·`db push`·`link`·`login` 은 쓰지 않는다.
3. config.toml(없으면 사본에서 `supabase init`): `project_id = "pm-<proj>"`, api·db·shadow_db·inbucket 포트를 배정 범위로, studio·analytics·edge_runtime·pooler 는 `enabled = false`(메모리 절약). 운영 ref 가 project_id 에 있으면 바꾼다.
4. `supabase start` 뒤 **매 마이그레이션·시드 직전에** `supabase status -o env | grep -E '^(API_URL|DB_URL)='` 를 출력해 둘 다 `127.0.0.1:<배정 포트>` 인지 확인하고 그 출력을 `<proj>/capture/local-db-check.txt` 에 덧붙인다(값 중 키는 남기지 말고 URL 두 줄만). 아니면 즉시 멈춘다.
5. 마이그레이션은 `supabase db reset --local`(또는 `migration up --local`)만. 시드·가짜 데이터는 `psql "postgresql://postgres:postgres@127.0.0.1:<db포트>/postgres"` 처럼 **로컬 주소를 글자로 박아** 넣는다. 프로젝트의 db 스크립트(`db:apply`·`db.sh`·`apply.mjs`·`sql.ts`·`deploy.sh` 등)는 운영 전용이라 쓰지 않는다. 시드 스크립트를 써야 하면 사본을 고쳐 로컬 URL·로컬 키를 환경변수로 넘긴다(사본만 고친다).
6. 앱용 `.env.local` 은 사본에 새로 만든다: 로컬 API_URL·anon key(필요하면 로컬 service_role) 만. 원본 `.env.local` 을 복사·읽기 금지. 문자·알림톡·결제·AI·메일 키는 넣지 않는다(빈 값이면 앱이 보내지 못한다).
7. 가짜 데이터: 사람 이름은 이미 가린 꼴('김○○', '이○○'…), 전화는 넣지 않거나 화면에서 가려지는 꼴, 여권·계좌·주민번호는 넣지 않는다. 상호는 'A농장'·'B기관'식. 영업 수치는 그럴듯한 가짜 값 → shots.md 에 '가짜 값'. 실명과 같은 시드 이름(예: okjob 시드의 실제 농가명)은 바꿔 넣는다.
8. 끝나면: 앱 서버 PID 종료 → 사본 폴더에서 `supabase stop --no-backup`(이 사본의 pm-<proj> 컨테이너·볼륨만) → `docker ps -a --format '{{.Names}}' | grep -c pm-<proj>` 가 0 → 사본 폴더 삭제 → `ss -ltnp` 에 배정 포트 0.

## 공통
- 남의 세션·프로젝트의 프로세스와 포트는 건드리지 않는다. 종료·재시작은 이 세션이 띄운 PID 만, 포트가 차 있으면 빈 포트를 쓴다. 다른 도커 스택(junimal·luvo-judge·멈춰 둔 fordex-replica3·gcp-test)은 손대지 않는다.
- 같은 막힘 2번 → BLOCKED.md(사유·시도·대안) → 다음.
- 마지막 답(15줄 이내): check.py 결과 줄, 캡처 수(desktop/mobile/states/seq/파일), 가로챈 요청 합계·허용한 비GET, 가짜 값 쓴 곳, BLOCKED 항목, 운영 접속·쓰기 가능성이 있었던 것(정확히), 정리 확인(포트·컨테이너·사본 0, 기준선 diff 빈 출력).
