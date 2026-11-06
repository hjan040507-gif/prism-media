# nowflix 자막용 사실 (근거 있는 것만 · 레포 ~/nowflix-kiosk HEAD d5afa3a, 앱·웹 코드 마지막 변경 8801048 2026-08-25)

경로는 레포 루트 기준. 앱 소스 루트 `app/src/main/java/kr/prism/nowflix/` 는 `A/` 로 줄여 쓴다. 이 서버에서 앱을 실행·측정한 값은 없다(ARM·KVM 없음) — 아래는 모두 코드·문서 읽기 근거다.

## 1. 아무도 안 만지면 120초 뒤 메인으로 자동 복귀 — 기본 120초, 관리자 웹에서 30~600초로 조정
- 근거: `A/data/KioskConfig.kt:23,40`(idleReturnSeconds 기본 120) · `supabase/migrations/20260803103813_kiosk_config.sql:22`(idle_return_seconds default 120) · `admin-web/src/lib/constants.ts:2-3`(IDLE_MIN 30 · IDLE_MAX 600) · `admin-web/src/app/api/settings/route.ts:28-34`(범위 밖이면 400) · `A/player/IdleReturnMachine.kt:61-64`(탐색 중 마지막 터치 후 idleReturnSeconds 가 지나면 만료, 재생 중엔 안 걸림) · 앱 관리자 화면 캡처 `tablet/admin-lock-view.png`("메인 복귀 시간 120초")

## 2. 재생 중 터치 없이 자동 다음 영상이 2번 연속이면 메인으로 복귀
- 근거: `A/player/IdleReturnMachine.kt:68`(`AUTO_ADVANCE_LIMIT = 2`) · `A/MainActivity.kt:317-320`(onAutoAdvance → goHome). 실제 동작 측정은 못 함(코드 근거).

## 3. 관리자 웹에서 바꾼 설정은 태블릿에 최대 30분 안에 반영 (PIN 화면을 열거나 '설정 새로고침'을 누르면 즉시)
- 근거: `A/MainActivity.kt:451`(`delay(30 * 60 * 1000L)` — 지금 한 번, 이후 30분마다) · `A/MainActivity.kt:423`(실패하면 이전 값 유지) · `A/ui/AdminScreen.kt:109`("30분 주기를 기다리지 않고 지금 바로 원격 설정을 다시 받아와요") · `admin-web/src/components/SettingsForm.tsx:7`("저장하면 태블릿에는 최대 30분 안에 반영돼요") · 화면: `tablet/admin-lock-view.png`, `desktop/settings-view.png`

## 4. 태블릿을 앱 하나에 잠금 — device owner 이면 완전 잠금(LockTask), 아니면 화면 고정+홈 런처 대체
- 근거: `A/kiosk/KioskLockMode.kt:3-8`(FULL_LOCK / FALLBACK) · `A/MainActivity.kt:136,182-196`(lockModeFor 로 모드 선택 → startLockTask·상태바·키가드 끔) · 앱 관리자 화면 "잠금 모드: 완전 잠금 (device owner)"(`A/ui/AdminScreen.kt:231-236` lockModeLabel, 캡처 `tablet/admin-lock-view.png`) · CI 에뮬레이터 잠금 검증 6/6 PASS(`ci-viewer/kiosk-summary.txt`, 홈·최근앱 무시·상태바 차단 포함, 실행 2026-08-25 — 이 서버에서 재실행한 값이 아니라 레포 기록).

## 5. 관리자 화면 진입: 우상단 숨은 영역 3초 길게 누르기 → PIN(6자리), 5번 틀리면 30초 잠금
- 근거: `A/MainActivity.kt:341,353`(숨은 핫스팟, 3000ms 길게 누름 → PIN) · `A/kiosk/PinGate.kt:75-76`(`MAX_ATTEMPTS = 5` · `LOCKOUT_MS = 30_000L`) · `admin-web/src/components/SettingsForm.tsx:165,167`(앱 PIN 은 숫자 6자리) · 화면: `states/lock-admin/02-pin-pad-3digits.png`. PIN 값은 자막·기록에 쓰지 않는다.

## 6. 영상은 YouTube 재생목록 — 파트마다 재생목록 하나, 관리자 웹에서 주소를 붙여넣고 '확인'으로 실제 존재 검사 후 저장
- 근거: `README.md:5-8`(유튜브 재생목록을 파트별로, 목록은 YouTube Data API v3) · `gradle/libs.versions.toml:14,38`(android-youtube-player 13.0.0 임베드) · `admin-web/src/components/PartDialog.tsx:34-48,98-125`(확인 → 재생목록을 찾았어요 → 저장) · `admin-web/src/app/api/parts/route.ts`(저장 때 서버가 다시 검증) · 화면: `states/parts-add/`(가짜 응답으로 재현 — shots.md)

## 7. 앱은 Android 10(API 29) 이상, 단일 모듈 Jetpack Compose — v1.1.0
- 근거: `app/build.gradle.kts:35-44`(compileSdk 35 · minSdk 29 · targetSdk 34 · versionCode 2 · versionName "1.1.0") · `app/build.gradle.kts:96`(compose = true) · `gradle/libs.versions.toml:2,4`(Kotlin 2.0.21 · AGP 8.7.3) · 릴리즈 APK `dist/nowflix-1.1.0.apk` 27,095,748 바이트(`ls -l`, 파일 시각 2026-08-25).

## 8. 번들 기본 진료 파트 6개 — 메인에 6개가 한 줄, 더 많으면 가로 스크롤(8개 캡처로 확인)
- 근거: `app/src/main/assets/parts.json`(6개 항목: 괜찮Knee·척척박사·손봐줘·Hip한 NOW·어깨의 정석·족집게) · 캡처 `tablet/main-view.png`(TOP 6) · `tablet/main-8parts-view.png`(TOP 8, 오른쪽이 잘려 가로 스크롤). 파트 개수 상한은 코드에서 확인 못 함 → 상한 숫자는 '미확인'.

## 9. 병원 태블릿 5대 — 현재 설치된 건 v1.0.0, v1.1.0 실기기 설치는 미실시로 기록됨 · 실제 병원 해상도·기종은 미확인
- 근거: `PROGRESS.md:11,15`(5대 · v1.1.0 `adb install` 미실시, 설치된 것은 v1.0.0) · `docs/설치가이드.md:6` · `docs/인계문서.md:292`(5대; 비밀번호·PIN 평문이 같이 있는 문서라 이 폴더엔 옮기지 않음). 기종·해상도 기록은 문서에 없음 → '미확인'. 확인된 해상도는 CI 에뮬레이터(pixel_c) 캡처의 2560×1688 뿐(PNG IHDR 실측).

## 10. 재생 화면 컨트롤은 3초 뒤 자동 숨김 — 하단 진행바·시간은 항상 표시, v1.1.0 부터 전체화면 보기
- 근거: `A/ui/PlayerScreen.kt:94`(`CONTROLS_TIMEOUT_MS = 3000L`) · `PROGRESS.md:7-8`(전체화면 추가) · 화면: `tablet/player-fullscreen-view.png`(작게 보기 버튼)

## 11. 레포 검증 기록: 단위 테스트 102개 · CI 계측 21/21 · 잠금 검증 6/6 (2026-08-25 CI 실행 기록)
- 근거: `PROGRESS.md:8`(레포가 기록한 값). 이 서버에서 다시 돌린 값이 아니다(Gradle 미실행) — 자막에 쓰면 "레포 기록" 으로만.

## 미확인(자막에 쓰지 말 것)
- 설치 병원 수·병원명(코드·화면에 없음) · 실기기 해상도·기종 · 파트 개수 상한 · 파트별 실제 영상 수(캡처의 영상 8개·조회수는 `app/src/androidTest/assets/fixtures/videos.json` 테스트 픽스처, 관리자 웹 영상 수는 가짜 값).
