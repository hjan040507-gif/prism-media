# waylog BLOCKED / 결정 필요 / 보고할 것 (2026-11-06)

## 결정 필요
1. **「지금 Google Play 에 나간 버전」 확정 불가.** 레포 기록상 Play 프로덕션은 1.5.1(vc33, docs/ops/2026-10-12-play-1.8.0-pack.md:11-12 · docs/ops/release-1.9.0.md:58 · docs/handoff/HANDOFF.md:40)이고 1.9.0(vc38)은 내부 테스트 업로드 기록까지(PROGRESS.md:108 · docs/release/1.9.0-R1-record.md:25). 프로덕션 승격 기록은 레포·~/waylog-release·~/waylog-backups 어디에도 없다. → 촬영본은 **웹 PWA 1.9.0(3cbb43c)** 이고 shots.md 맨 위에 그 기준을 적었다. 사용자가 Play Console 에서 1.9.0 이 프로덕션인지 확인해 주면 문구만 바꾸면 된다. 1.5.1 이 프로덕션이면 영상 화면이 실제 Play 앱(핑크·보라, 탭 4칸, 「바디키 8주 챌린지」)과 다르다 — 그 화면은 브랜드명이 크게 노출돼 이번에 안 찍었다.

## 못 채운 것
2. **Play 스토어 스크린샷 원본 — 서버에 없음.** 시도: `~/waylog1` 의 resources/playstore-screenshots·PLAY_STORE_LISTING.md:11(「스크린샷 6장 ⏳」 = 사용자 작업 펜딩 기록)·~/waylog-release 확인. 있는 것은 레포 resources/playstore-screenshots/ 의 옛 4월 시안 1장(1080×1700, 1.0 이전 UI·핑크/보라, 「바디키 8주 챌린지」·제품명·제품 사진 노출)뿐이라 **현재 UI 아님 + 브랜드 노출로 media/ 에 안 넣었다**. 대안: 사용자가 Play Console 에서 등재용 스크린샷을 내려받아 주면 브랜드 글자 확인 후 media/ 에 추가. media/ 에는 브랜드 글자 없는 앱 아이콘(512·192 PNG, SVG 3종)만 넣었다.
3. **비공개 테스트 인원·기간 — 미확인(서버 기록 없음).** 레포·서버에 Play Console 기록이 없다. 레포 밖 브리프(hongjun-journey/docs/CONTENT/briefs/waylog.md:62,23)에 옛 수치(16/12+/9명, 14일)가 있으나 1.5.0 시점이라 facts.md 에 수치로 쓰지 않았다. 대안: Play Console 의 테스트 트랙 화면에서 사용자가 확인.
4. **지시의 「관리자 게시물 관리」 화면 없음.** 근거: src/screens/SettingsScreen.jsx:246-248(설정 하단 「관리자」 묶음에 「신고 모더레이션」·「가입 코드」만), 소식 보내기는 AdminModerationScreen.jsx:116 안. 대안으로 실제 화면 3개(신고 관리·소식 보내기·가입 코드)를 찍었다(신고 행은 하네스 가짜 값 — 운영 reports 는 0건).
5. **제품 탭·제품 상세·설정의 법적 고지·1일1팩·로그인 화면은 안 찍음(의도).** 제품 회사 로고가 포장에 인쇄된 사진이 518개 전부이고(src/data/products.json), 법적 고지에 브랜드명이 명시돼 있어 공개 표기 방침(브랜드 글자 0, 로고 큰 제품 사진 칸 제외)에 따라 뺐다.

## 방식 메모
6. **dev 서버(vite, 포트 3614)로 촬영 — prod 빌드 못 함.** 사본의 `vite build`(flock build.lock → heavy-run)를 08:00Z 쯤 걸었으나 prism-media 다른 빌드가 build.lock 을 쥔 채 오래 가고(약 1시간 대기), 이어 heavy-run 게이트가 CPU 98~99%·load 31~53(한도 7.2)·스왑 여유 0%(한도 15%) 때문에 계속 「대기」라 09:00Z 에 내 대기 프로세스만 PID 로 취소했다(빌드는 시작도 못 함, dist 없음). 화면 개발·촬영은 같은 소스·같은 설정(audit/vite.audit.config.mjs, 가짜 env, .env* 안 읽음)의 vite dev 로 했다. 앱 화면·글자·CSS 는 같고(Tailwind JIT 동일) React 개발 모드 경고(콘솔)만 다르다. 대안: 서버가 한가할 때 `bash waylog/capture/rerun-all.sh` 앞에 common.mjs 머리 주석의 빌드·preview 명령을 쓰면 prod 빌드 기준으로 전부 다시 찍는다(사본은 지웠으니 `git -C ~/waylog1 archive 3cbb43c | tar -x -C ~/prism-media/tmp/waylog-src` + `npm ci` 부터).
7. 앱이 부르는 제품 사진 CDN(media.amway.co.kr) 요청은 abort(세션당 3~12건) — 제품 카드 썸네일 칸이 비어 보인다(로고 노출 회피, 의도). 콘솔 오류 수는 이 차단 건수와 같다(`ERR_BLOCKED_BY_CLIENT`).

## 보고할 것 — 운영 접속·쓰기 가능성
- 운영 로그인 0(Play 심사 계정 포함), 운영 Supabase 호스트(*.supabase.co)로 나간 요청 0(모든 촬영 세션 `prodBlocked` 0 — capture/tally-*.json), 앱의 REST·Auth·Storage·Functions 는 전부 가짜 호스트(supabase.waylog.test)로 가서 하네스가 메모리에서 응답. `/functions/v1/claude`·`verify-facepack` 는 하네스 가짜 응답(새 AI 호출 0).
- 허용한 외부 요청: cdn.jsdelivr.net 읽기(GET) — Pretendard 글꼴 CSS·파일(src/index.css:2). 운영 서비스 아님. 제품 사진 CDN(media.amway.co.kr)은 abort.
- 허용한 비GET: 0(lib allow 목록 비어 있음). 앱이 보낸 POST·PATCH 는 전부 가짜 백엔드 메모리에만 반영(가로챈 요청 수는 각 PNG 의 json `intercepted` 와 capture/tally-*.json).
- 고객 레포 `~/waylog1` 은 `git archive`(읽기)만 했다. 기준선 비교는 정리 단계 출력 참고.
