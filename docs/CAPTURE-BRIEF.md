# 촬영 서브에이전트 공통 지침 (prism-media · 2026-11-05)

원문 명세: `docs/specs/portfolio-capture.md` — 먼저 전부 읽는다. 이 문서는 그 명세를 이 서버·이 도구로 실행하는 방법이다. 명세와 부딪히면 명세를 따른다.

## 산출물 (프로젝트 폴더 `~/prism-media/<proj>/`)
```
desktop/<이름>-full.png · <이름>-view.png (+ 같은 이름 .json) · header.png(고정 헤더가 있으면)
mobile/  …같은 규칙            tablet/ …(nowflix)
states/<흐름>/<NN>-<설명>.png(+json)   — 흐름 ≥2개, 각 ≥3단계, 같은 뷰포트·같은 scrollY
seq/<이름>.mp4 · <이름>-first.png · <이름>-last.png (+json)  — 60fps · CRF ≤12 · ≤6초
pdf/<이름>.png (+json, byclick)        media/ 로고 원본(svg·png)·히어로/제품 원본 사진·영상(레포 파일 복사)
capture/*.mjs  — 이 프로젝트 촬영 스크립트(재실행 가능하게, 비밀값 없음)
brand.json  { "primary": "#hex", "secondary": "#hex", "fonts": ["..."], "source": ["file:line", ...] }
facts.md    — 사실 ≥5, 항목마다 근거(코드 경로·라우트·읽기 전용 쿼리+실행 시각·로그 경로), 없으면 '미확인'. 형식: `## 1. <사실>` 다음 줄 `- 근거: …`
shots.md    — 모든 파일 한 줄(화면·상태·가린 것·가짜 값 여부·seq 방식). 파일 이름이 그대로 들어가야 한다(check.py 가 대조)
contact.jpg — `python3 tools/contact.py <proj>` 로 만든 뒤 Read 로 직접 열어 빈 화면·로딩 중·가림 누락을 본다
BLOCKED.md  — 못 채운 것: 사유 · 시도한 것(2번까지) · 가능한 대안
RECON.md    — 사전 조사(이미 있음, 읽고 시작)
```
파일당 95MB 미만, 폴더 400MB 이하. 넘으면 full.png 를 PIL `optimize=True` 로 다시 저장하거나 seq 길이를 줄인다(가짜로 줄이지 말 것).

## 도구 (`~/prism-media/tools/lib.mjs`, 머리 주석에 사용법)
스크립트는 `~/prism-media/<proj>/capture/` 에 두고 `import … from '../../tools/lib.mjs'` 로 쓴다(playwright 는 tools/node_modules 에서 풀린다. 스크립트에서 playwright 를 직접 import 하지 말고 lib 의 것을 쓴다). 실행: `cd ~/prism-media && node <proj>/capture/<x>.mjs`.
- `launch()` — chromiumSandbox:true. 서버 전체에서 브라우저 동시 2개(잠금 파일) · 가용 메모리 6GB 미만이면 알아서 기다린다. 한 스크립트에 브라우저 하나만, 끝나면 `browser.close()`.
- `newContext(browser, 'desktop'|'mobile'|{name:'tablet',width,height,dsf,isMobile,hasTouch}, { project, guard, redact, clock, storageState })` → `{ ctx, page }`
  - guard: 기본으로 GET·HEAD·OPTIONS 외 전부 가짜 200 `{"ok":true}`, 분석·추적 비콘은 204. `allow`(읽기 전용인데 POST 인 것 — 근거를 shots.md 에), `fake`(요청별 가짜 응답, GET 도 가능), `blockGet`(GET 인데 서버가 쓰는 것), `blockAll`(그 주소는 메서드 무관 전부 가짜), `addHeaders`(통과 요청에 헤더). 서비스 워커는 막혀 있다(모든 요청이 route 를 지난다).
  - redact: `remove`(visibility:hidden — 머리·꼬리 연락처·주소·사업자정보·SNS·QR), `hide`(display:none — 채팅·쿠키 배너·토스트·인트로), `names`('김○○'), `ids`('user***'), `address`(시·구까지), `biz`(셀렉터 → A·B·C모터스, `bizSuffix` 로 접미사), `bizMap`/`textMap`(정확 문자열 바꾸기), `fake`([{selector,value}] 영업 수치 가짜 값), `qrSelectors`. 전화(→010-****-****)·이메일·URL/도메인·주민번호·계좌/사업자번호·여권(→지움)·차량번호(→12가 ****)는 자동.
- `capturePage(page, name)` — 끝까지 스크롤(지연 로딩·등장 애니메이션) → 유한 애니메이션 finish → 맨 위 → 가림 → **PII 검사 0건일 때만** full·view 저장 + json. 고정 헤더는 처음 한 번 header.png.
- `startFlow(page, flow, { scrollY })` → `flow.step(desc)` — 단계마다 같은 scrollY 로 되돌린 뒤 검사·저장. 밀리면 예외. 흐름 중엔 새 글자도 바로 가린다(MutationObserver).
- `recordSeq(page, name, { durationMs ≤6000, start, perFrame })` — page 는 `newContext(..., { clock: true })` 로 만들고 goto 전에 시계가 설치돼 있어야 한다. 1/60초씩 runFor + getAnimations currentTime 동기화, 15프레임마다 PII 검사. 안 되면(영상 요소·캔버스 루프가 가상 시간에 안 묶이는 등) `recordScreencast(page, name, { durationMs, start })` 로 찍고 shots.md 에 방식을 적는다.
- `saveShot(page, file, { full, clip, kind })` — 낱장(예: PDF 뷰, 모달 자르기).
- 검사: `python3 tools/check.py <proj>` (nowflix 는 `--tablet`) — FAIL 줄만 본다. contact: `python3 tools/contact.py <proj>`.
- PII 예외가 나면 저장되지 않는다 — 셀렉터·textMap 을 더해 다시 찍는다. 검사를 끄거나 정규식을 고치지 않는다(필요하면 BLOCKED.md 에 '결정 필요'로).

## 화면 품질
- 실제 서비스와 같은 화면만. 새로 그리거나 없는 기능을 만들지 않는다. 가짜 데이터는 실제 API 응답 모양(코드 근거)으로 주입하고, 실데이터처럼 보이는 그럴듯한 값(사람 이름은 넣지 말고 '김○○'처럼 이미 가린 꼴, 상호는 'A모터스'식)을 쓴다.
- 찍기 전에 로딩 스피너·스켈레톤·빈 화면·에러 토스트·인트로 오버레이가 없는지 확인. 이미지가 다 떴는지 확인.
- 상태 흐름은 영상에서 겹쳐 바꾸므로 같은 뷰포트·같은 scrollY. 입력 포커스로 스크롤이 움직이는 모바일은 `startFlow(page, flow, { scrollY: <고정값> })`.
- 첫 화면 view.png 는 사람이 보는 그대로(스크롤 0). full.png 는 끝까지 다 뜬 상태.
- 사진·영상 원본: 레포 public/ 의 로고·히어로를 media/ 로 복사(용량 큰 영상은 95MB 미만만). 출처 경로를 shots.md 에.

## 안전 (반드시)
- 운영 DB 에 아무것도 남기지 않는다: 비GET·문자·알림톡·푸시·결제·AI 생성 요청은 guard 로 가짜 성공. GET 인데 서버가 쓰는 경로(RECON.md 의 '쓰기 위험')는 열지 않거나 blockGet. 서버 컴포넌트가 GET 렌더 중에 쓰는 페이지는 운영에서 열지 않는다(로컬 가짜 데이터로).
- 로그인은 이미 있는 테스트·관리자 계정만. 새 계정·비밀번호 변경 금지. 로그인 POST 를 allow 했다면 shots.md 와 BLOCKED.md '보고할 것'에 몇 번 했는지 적는다(인증 세션 행이 남는 쓰기라 보고 대상). 비밀번호를 틀려 잠금 카운터가 올라가는 일이 없게, 값이 확실할 때만 1번 시도.
- 비밀값(토큰·비밀번호·.env* 값·PIN)은 출력·기록·커밋하지 않는다. 스크립트에는 `process.env.X` 로만 받고, 값은 환경변수로 넘긴다(명령줄 인자 금지). `.env.local` 읽기가 막히면 우회하지 말고 BLOCKED.md.
- 고객 레포(`~/<repo>`)는 읽기만. 파일 쓰기·git 상태 변경(checkout·stash·worktree add 포함) 금지. 로컬 실행이 필요하면 `git -C ~/<repo> archive <commit> | tar -x -C ~/prism-media/tmp/<proj>-src` 로 사본을 만들고(원본 .git 을 안 건드린다), 거기서 `npm ci` 와 빌드. 빌드는 하나씩: `flock ~/prism-media/tmp/locks/build.lock ~/.claude/bin/heavy-run npm run build`(heavy-run 이 nice 10 을 건다). 서버는 빈 포트(먼저 `ss -ltn` 으로 확인)에서 `nice -n 10 npx next start -p <포트>` 를 run_in_background 로. 끝나면 **그 PID 만** 끄고 사본 폴더를 지운다(사용자 명세가 승인한 삭제). 끝났을 때 `ss -ltnp | grep <포트>` 가 비어 있어야 한다.
- 남의 세션·프로젝트의 프로세스와 포트는 건드리지 않는다. 종료·재시작은 이 세션이 띄운 PID 만, 포트가 차 있으면 빈 포트를 쓴다.
- 대기는 `sleep` 반복 대신 백그라운드 실행 + 완료 알림. while/until+sleep 이 들어간 Bash 는 훅이 막는다(스크립트 파일 안의 대기는 괜찮다).
- 같은 막힘은 두 번까지만 시도 → BLOCKED.md 에 시도·대안 → 다음으로.
- 스크린샷 Read 는 판정할 때만, 한 번에 10장 이하. contact.jpg 는 꼭 본다.

## 끝내기 전에
1. `python3 tools/check.py <proj>` FAIL 0 (못 채운 항목은 BLOCKED.md 에 사유가 있어야 함)
2. contact.jpg 를 직접 보고 빈 화면·로딩·가림 누락이 없음을 확인(문제 장면은 다시 찍기)
3. 임시 서버·사본 폴더 정리, `git -C ~/<repo> status --porcelain | sha1sum` 이 docs/baseline/<repo>.status 의 sha 와 같음(`printf '%s' "$(cat docs/baseline/<repo>.status)" | sha1sum` 과 비교)
4. 커밋·push 는 하지 않는다(주 세션이 검수 후 커밋).
5. 마지막 답(15줄 이내): check.py 결과 줄, 캡처 수(desktop/mobile/states/seq), 가로챈 요청 합계·허용한 비GET, 가짜 값 쓴 곳, BLOCKED 항목, 운영 쓰기 가능성이 있었던 것(있으면 정확히).
