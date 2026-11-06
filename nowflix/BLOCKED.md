# nowflix — 못 채운 것 · 한계 · 보고할 것

## 1. 태블릿 화면을 이 서버에서 새로 촬영하지 못함 (재료는 기존 CI 캡처 8장으로 대체)
- 사유: 서버가 ARM(aarch64)이고 `/dev/kvm` 없음 → 안드로이드 에뮬레이터 불가, `adb` 는 x86-64 바이너리라 실행 불가, Robolectric 네이티브 그래픽은 linux aarch64 미지원, 레포에 Paparazzi 류 JVM 스크린샷 도구 없음(RECON.md 3절). 다른 세션의 Gradle 데몬이 도는 중이라 Gradle 은 돌리지 않았다.
- 한 것: 레포 `ci-viewer/screenshots/` 8장(CI 에뮬레이터 pixel_c, API 30, Compose `captureToImage` 로 앱이 실제로 그린 화면, source_commit 8801048 = 현 코드)을 복사만 하고(원본 무변경) QR·도메인 글자만 PIL 로 덮었다.
- 대안(사용자 승인 필요): prism-media 소유 비공개 임시 저장소에 레포를 복제해 GitHub Actions(x86 러너, KVM)의 에뮬레이터로 `ScreenshotTest` 를 돌려 새로 촬영. 고객 저장소에는 push 하지 않는다. 로컬 fixture 이미지 서빙으로 영상 썸네일을 채우고, 자동 복귀는 `mainClock.advanceTimeBy(120s)` 로 재현하면 아래 2·3번도 풀린다. 이 서버에는 GitHub 인증이 없어 이번에는 시도하지 않았다.

## 2. 영상 목록 썸네일 빈 회색 · 재생 화면 영상 영역이 검정 로딩 (기존 캡처의 한계)
- 사유: 캡처 테스트가 MockWebServer 라 썸네일 이미지 URL 을 못 받고(`part-detail-view.png`, `player-view.png` 의 회색 타일), 재생은 YouTube 임베드 WebView 가 오프라인이라 `0:00 / 0:00` + NOWFLIX 로딩 마크만 보인다. 영상 제목·조회수는 테스트 픽스처 값(`app/src/androidTest/assets/fixtures/videos.json`, 채널명 "고쳐줘 NOW")이지 라이브 값이 아니다.
- 시도: 없음(기존 캡처 재사용 방침 + 새로 그리지 않는다는 규칙 — 회색 칸을 이미지로 채우면 실제 화면과 달라진다).
- 대안: 1번의 임시 저장소 Actions 재촬영(썸네일 fixture 서빙, 재생 프레임은 로컬 영상 파일을 임베드 대신 쓰는 테스트 더블이 필요해 앱 코드 수정이 따름 — 승인 필요).

## 3. 자동 복귀 '전후'는 같은 시점 연속 촬영이 아님
- 사유: 자동 복귀는 화면이 아니라 동작(유휴 120초 → `goHome()`)이고 이 서버에서 앱을 못 돌린다.
- 한 것: `states/auto-return/` 에 전(파트 상세 → 재생)과 후(메인)를 기존 캡처 조합으로 둠. json `flow_note`·shots.md 에 '같은 시점 연속 촬영이 아니라 기존 캡처 조합'이라고 명시.
- 대안: 1번. 재생 중 자동 복귀(자동 다음 영상 2번 연속, `IdleReturnMachine.kt:68`)는 캡처 자체가 없다.

## 4. 잠금 상태 전용 화면 없음 · PIN 입력 단계는 1장뿐
- 사유: 잠금은 OS(LockTask) 기능이라 앱에 "잠금 화면"이 없다. 화면 증거는 PIN 패드와 관리자 화면의 "잠금 모드: 완전 잠금 (device owner)" 행뿐이고, PIN 패드 캡처는 점 3개 입력된 1장(0·6자리 상태는 없다).
- 한 것: `states/lock-admin/` = 메인(숨은 핫스팟 3초 길게 누름) → PIN 패드(3자리) → 관리자 화면(완전 잠금) 3단계(기존 캡처 조합). 잠금 검증 6/6 PASS 는 텍스트 기록(`ci-viewer/kiosk-summary.txt`)이라 facts.md 4번에 근거로만 썼다.

## 5. 실해상도 미확인
- 확인된 값은 CI 에뮬레이터(pixel_c) 캡처의 2560×1688(PNG IHDR 실측) 뿐. 실제 병원 태블릿 기종·해상도는 문서·코드·README 어디에도 없다 → **실기기 해상도 미확인**. 밀도(dpi)도 기록이 없어 pixel_c 기본 320dpi(밀도 2.0)로 추정했고, json 의 rect 는 그 가정의 dp(px ÷ 2), viewport 는 1280×844 dp @2 이다(미확인 가정).
- 사용자 확인 필요: 영상에서 '태블릿 실해상도'라고 부를 때 2560×1688(에뮬레이터) 이 맞는지.

## 6. 앱 아이콘·SVG 로고 없음
- 레포 `res/` 에 mipmap(앱 아이콘)이 없고 SVG 도 없다. `media/nowflix_logo.png`(915×242)는 앱 화면에서 현재 안 쓰는 이미지(메인의 NOWFLIX 는 텍스트 워드마크, PROGRESS.md:93). 메인 QR 이미지(`nowflix_qr.png`)는 가림 대상이라 media/ 에 넣지 않았다.

## 7. 관리자 웹은 운영이 아니라 로컬 사본 + 가짜 Supabase (보고)
- 운영 `nowflix-admin.vercel.app` 에는 접속하지 않았다(로그인 실패가 운영 DB `web_auth.failed_count` 에 쌓이고 5회에 잠김). 따라서 운영 쓰기 0, 로그인 POST 0회.
- 로컬 사본은 `git archive HEAD admin-web`(원본 무변경)로 만들어 `npm ci` → heavy-run 게이트 대기 약 85분(다른 세션 빌드와 스왑 여유 부족으로 대기) 뒤 `npm run build` 종료 코드 0 → `next start` 47311 + 목 서버 47312 로 1회에 촬영(재시도 없음). 끝난 뒤 두 서버 PID 종료·`ss -ltnp` 빈 것·사본 삭제 확인.
- 파트 추가 입력 칸의 '주소' 자리에는 URL 이 아니라 재생목록 ID(코드가 받는 형식 `extractPlaylistId` case 1)만 입력했다 — URL 글자는 화면에 남기지 않는 규칙 때문(입력 칸 placeholder 의 `https://…` 예시 글자도 규칙대로 지워져 빈 칸).
- 화면 속 파트 이름·재생목록 ID·포스터는 앱 번들(`parts.json`, `res/drawable-nodpi`) 값, 파트별 '영상 N개' 와 추가하는 파트('발목 튼튼 TV', 영상 9개)는 가짜 값이다(shots.md). `/status` 화면은 서버가 YouTube 를 불러 열지 않았다.
- 대안: 없음(필요하면 운영 화면은 고객 승인 + 일회용 로그인 정책이 먼저).

## 보고할 것 (운영 쓰기 가능성)
- 없음. 고객 레포는 읽기만(`git status --porcelain` sha 가 docs/baseline/nowflix-kiosk.status 와 동일), 운영 URL 접속 0, 브라우저 → 로컬 사본/목 서버 외 요청은 폰트 CDN(jsdelivr) GET 뿐.
