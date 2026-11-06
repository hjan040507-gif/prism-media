# nowflix 사전 조사 (RECON)

조사 시각 2026-11-05 (읽기 전용 · 레포 상태·운영 DB 무변경 · 브라우저 미사용, curl HEAD 2회만). 경로는 `/home/dev/nowflix-kiosk` 기준 상대경로.
레포 HEAD `d5afa3a`. 앱·웹 코드의 마지막 변경은 `8801048`(2026-08-25) 이후 없음(git log -- app admin-web).

## 1. 구조
- 안드로이드 앱: 모듈 `:app` 하나(settings.gradle.kts:23). **Jetpack Compose**(app/build.gradle.kts:95-98 `buildFeatures{compose=true}`), Kotlin 2.0.21 · AGP 8.7.3 · Compose BOM 2025.09.01 (gradle/libs.versions.toml:2,4). `kr.prism.nowflix`, 단일 Activity `MainActivity`(AndroidManifest.xml:20~) + 화면 composable `ui/*.kt`.
- 관리자 웹: `admin-web/` Next.js 14 App Router + Tailwind 3 (admin-web/package.json), Vercel 프로젝트 `nowflix-admin`(icn1, admin-web/vercel.json). 운영 URL `https://nowflix-admin.vercel.app` (앱에 하드코딩: app/build.gradle.kts:52 `ADMIN_WEB_URL`).
  - `curl -sI /` → **307 → /login**, `/login` → **200** (2026-11-05 22:47Z, Vercel). 살아 있음.
  - 화면 3개: 파트 관리(`/parts`) · 설정(`/settings`) · 상태(`/status`) (admin-web/src/components/NavShell.tsx:7-10) + `/login`.
- 백엔드: **Supabase**(parts·settings·web_auth 테이블, supabase/migrations/20260803103813_kiosk_config.sql, 20260803140000_web_admin_auth.sql). 앱은 anon 읽기전용(SupabaseConfigSource.kt), 관리자 웹은 서버에서 service_role 로 REST 호출(admin-web/src/lib/db.ts:7-8,51). 영상 목록은 **YouTube Data API v3**(data/YoutubeApi.kt; 관리자 웹 상태·검증도 youtube.ts:23).
- 대상 기기: 모델 명시 없음. 코드는 `sensorLandscape` 가로 고정(AndroidManifest.xml:25). CI 에뮬레이터 프로필 **pixel_c**(API 30, x86_64; .github/workflows/verify.yml `profile: pixel_c`). 실제 병원 태블릿은 5대, 기종·해상도 문서 없음(docs/·README·PROGRESS.md 에 해상도·dpi 언급 없음) → **미확인**.
- **실해상도 확정값**: 기존 CI 캡처 PNG 의 IHDR **2560×1688**(PROGRESS.md:91 "가로 2560×1688", 파일 `file` 실측 동일). Pixel C 2560×1800 에서 시스템 영역을 뺀 Compose 루트 크기로 추정(density 는 기록 없음, pixel_c 기본 320dpi 로 추정 — 미확인).

## 2. 기존 검수 캡처·녹화
레포·`/home/dev` 아래 이름 검색 결과: 영상(mp4/webm) **없음**. Paparazzi/Roborazzi 스냅샷 **없음**. 이미지는 아래뿐.

`ci-viewer/screenshots/` (git 추적됨 · 2026-08-25 12:05 · source_commit 8801048 = 현 코드 · 모두 PNG **2560×1688** · CI 에뮬레이터 pixel_c 의 Compose `captureToImage`, 즉 앱이 실제로 그린 화면):

| 파일 | 크기 | 화면 | 명세 매핑 |
|---|---|---|---|
| 01_main_6parts.png | 1.4MB | 메인(6파트, NOWFLIX 빨간 밴드+QR, "TOP 6", 포스터 6장) | 메인 |
| 02_main_8parts.png | 1.4MB | 메인(8파트, 가로 스크롤) | 메인 변형 |
| 03_video_list.png | 0.8MB | 진료 파트 상세: 포스터·"모두 재생"·"메인으로"+영상 8개 목록 | 진료 파트 재생목록 + 영상 목록(같은 화면) |
| 04_player_controls_shown.png | 0.2MB | 재생 화면(컨트롤 표시, 오른쪽 "다음 동영상") | 재생 화면 |
| 05_player_controls_hidden.png | 0.2MB | 재생 화면(컨트롤 자동 숨김 뒤) | 재생 상태 흐름용 |
| 06_pin_pad.png | 57KB | PIN 입력 오버레이(숫자 3개 입력) | 잠금 상태 관련(탈출구) |
| 07_admin.png | 105KB | 앱 관리자 화면: 복귀 120초·파트 6개·"완전 잠금 (device owner)"·v1.1.0·QR+URL 글자 | 잠금 상태(모드 표시) / 설정 |
| 08_player_fullscreen.png | 32KB | 재생 화면 전체화면("작게 보기") | 재생 화면 변형 |

같이 있는 것: `ci-viewer/kiosk-summary.txt`(키오스크 잠금 검증 6/6 PASS 텍스트, 화면 아님), `ci-viewer/meta.txt`, 원격 `origin/ci-screenshots` 브랜치(마지막 커밋 ca17b47 2026-08-25, 같은 8장 + contact-sheet; `git log` 로만 확인). 앱 리소스: `app/src/main/res/drawable-nodpi/` 로고 915×242, QR 740×740, 파트 포스터 6장 720×900.

**기존 캡처의 한계(직접 열어 확인한 4장 기준: 01·03·04·07)**
- 영상 행 썸네일이 **빈 회색 타일**(03, 04): 테스트가 MockWebServer 라 이미지 URL 을 못 받음 → 영상 소개용으론 약함.
- 재생 화면 영상 영역이 **검정 + 흐린 NOWFLIX 로딩 마크**, 시간 `0:00 / 0:00`(04). 실제 YouTube 재생 프레임은 어느 캡처에도 없음(임베드 WebView, 오프라인).
- 01·07 에 **QR 코드가 보임**, 07 은 도메인 글자(`nowflix-admin.vercel.app`)도 보임 → 가림 필요(규칙: QR·화면 속 도메인).
- 영상 제목·조회수는 픽스처 값(`app/src/androidTest/assets/fixtures/videos.json`, 채널명 "고쳐줘 NOW")이지 라이브 값이 아님.
- 자동 복귀 전후, 잠금 "상태" 전용 화면, 관리자 웹: 캡처 **없음**.

## 3. 이 서버에서 새로 찍는 방법 (설치·실행 안 함)
확인한 사실
- `/dev/kvm` **없음**, vmx 0 → 안드로이드 에뮬레이터 불가(PROGRESS.md 도 "VM엔 KVM 없어 에뮬레이터는 GitHub Actions 에서만"). aarch64 호스트용 emulator 패키지 없음, `emulator` 바이너리 없음.
- `/home/dev/android-sdk`(604MB): platforms 는 `android-36` 만(레포 compileSdk 35 필요), build-tools 35·36(aapt2 는 aarch64 로 교체돼 있음), cmdline-tools 있음. **`adb` 는 x86-64 바이너리라 실행 불가**(binfmt 오류). 레포 `local.properties` 의 `sdk.dir=/opt/android-sdk` 는 이 서버에 **없음**(옛 서버 경로) → 지금 상태로는 Gradle 빌드가 SDK 를 못 찾음. JDK 17(`/usr/lib/jvm/java-17-openjdk-arm64`) 있음, `sdkmanager`·`emulator` PATH 에 없음.
- 레포에 Paparazzi·Roborazzi·Compose Preview Screenshot Testing **설정 없음**(app/build.gradle.kts 의존성에 없음; 있는 건 `androidTest` 계측 `ScreenshotTest.kt` 하나).
- JVM 방식 가능성: `~/.gradle` 캐시에 Robolectric nativeruntime-dist-compat 1.0.19 가 있으나 네이티브 라이브러리는 linux/**x86_64**·mac 만(`native/linux/x86_64`), **linux aarch64 없음** → Robolectric 네이티브 그래픽(실제 픽셀) 불가. Paparazzi(layoutlib)의 linux-arm64 지원은 **미확인**(캐시엔 layoutlib-api 만, 설치 없이 확인 못 함).
- Gradle 겹침: 지금 `gradle daemon 9.8.0`(pid 1237940, 21:54 시작, 메모리 2.6GB)과 kotlin daemon 이 돌고 있음(다른 세션의 lock-app 으로 추정, cwd 는 데몬 폴더라 레포 불명). 이 레포는 `org.gradle.daemon/parallel/configuration-cache/caching` 켬(gradle.properties). 다른 세션이 쓰는 레포(작업 폴더)에서 빌드하면 `.gradle`·`build/` 를 건드리므로 worktree 필요. 메모리 가용 18GB(6GB 이상), 디스크 여유 73GB.

방법 후보 (현실성 순)
1. **기존 CI 캡처 재사용(비용 0)**: 위 8장을 그대로 쓰고 QR·도메인만 가림. 가림은 이미지 후처리(QR 사각형·URL 글자 영역을 단색 채우기 — 새로 그리는 것이 아니라 가리기). 좌표: 01 메인 밴드 우측 QR(표시 이미지 기준 약 x1790-1938,y45-192 → 원본 ×1.28), 07 우측 QR 패널 전체. 단점: 썸네일 빈칸·재생 프레임 검정·"자동 복귀 전후"·잠금 상태·관리자 웹 없음.
2. **GitHub Actions 에뮬레이터로 새로 찍기(권장 보강, 비용: 코드 일부 추가 + 20~40분 러너 시간, 서버 디스크 0)**: 이 서버엔 KVM 이 없으니 x86 러너(KVM 있음)만 가능. 고객 저장소(`mrholdingsco-hue`)에 푸시는 범위 밖이므로 **레포를 prism-media 소유 비공개 임시 저장소로 복제**해 `ScreenshotTest` 에 장면 추가(썸네일은 로컬 fixture 이미지 서빙, 자동 복귀 전후는 `IdleReturnMachine` 시계 조작 대신 `mainClock.advanceTimeBy(120s)`)하고 `verify.yml` 로 돌려 PNG 를 받는다. 인증·Actions 사용 가능 여부 미확인(레포는 `gh-cla14` 별칭, 비밀값 없음). 이 경로는 "새로 그리지 않음" 규칙에 부합(앱 실제 컴포저블 렌더).
3. 서버에서 직접 Gradle 빌드(`./gradlew assembleDebug`)는 가능하지 않음: SDK 경로 수정·`android-35` 플랫폼 설치 필요, 계측 실행(adb·에뮬레이터)은 불가. JVM 스크린샷은 위 사유로 보류. → 하지 않음.
4. **관리자 웹은 서버에서 직접 가능**(Playwright, 비용 낮음): worktree/임시 clone 에서 `admin-web` 을 빈 포트로 `next dev`, `SUPABASE_URL` 을 **로컬 목(mock) 서버**로 지정(서버 측 fetch 가 전부 `${SUPABASE_URL}/rest/v1/…`·`/storage/v1/…` 라 db.ts:51,157 가 목으로 향함) + 임의 `SESSION_SECRET`, 로그인용 bcrypt 해시는 가짜 비밀번호로 목 `web_auth` 행에 넣는다. 운영 DB·운영 계정 불필요. 파트/설정 데이터는 `app/src/main/assets/parts.json` 의 6파트(공개 YouTube 재생목록 ID)로 채우고, `/api/parts` POST·`/api/parts/verify`(서버가 googleapis 호출)·`/api/settings` PATCH 는 `page.route` 로 가짜 성공 처리. `/status` 는 서버가 googleapis 를 부르므로 목으로 못 막음 → 촬영 제외 또는 실패 화면 주의. 이 방식은 admin-web 의존성 설치(`npm ci` 임시 clone 안, 약 300~500MB·1~2분)만 필요. 운영 사이트 직접 로그인은 **하지 않는 것을 권장**: 비밀번호 오입력 시 `web_auth.failed_count` 가 운영 DB 에 써진다(db.ts:145, 5회 틀리면 잠김).

예상 비용 요약: (1)만 하면 0, (1)+(4) 디스크 ~0.6GB·시간 ~30분, (2) 추가 시 GitHub 러너 20~40분 + 테스트 코드 수정.

## 4. 명세 항목 ↔ 실제 화면 (파일:줄)
| 명세 | 실제 | 위치 | 기존 캡처 |
|---|---|---|---|
| 메인 | `HomeScreen`(빨간 `TopBand` + "TOP N" 헤더 + 포스터 행 `PartsRow`) | MainActivity.kt:459(HomeScreen), :500(TopBand), :533(TopContentHeader), :564(PartsRow) | 01, 02 |
| 진료 파트 재생목록 | `PartDetailScreen`(좌: 포스터·"재생목록 · 동영상 N개"·"모두 재생"·"메인으로" / 우: 영상 목록). **"재생목록"과 "영상 목록"은 별도 화면이 아니라 한 화면** | ui/PartDetailScreen.kt:59, 좌패널 :138, 영상목록 :259, 문구 :170,:207,:226 | 03 |
| 영상 목록 | 위와 동일(`VideoList`/`VideoRow`) | ui/PartDetailScreen.kt:259, ui/VideoRowUi.kt:57 | 03 |
| 재생 화면 | `PlayerScreen`(YouTube 임베드 `YouTubePlayerView`, 오른쪽 "다음 동영상" 목록, 전체화면 토글) | ui/PlayerScreen.kt:107(PlayerScreen), :273(PlayerStage), :606(FullscreenButton), :689(UpNextList) | 04, 05, 08 |
| 잠금 상태 | 별도 "잠금 화면"은 **없음**. 잠금은 OS 레벨(LockTask), 화면 증거는 ① 3초 길게 눌러 여는 숨은 우상단 핫스팟 → `PinPad`(MainActivity.kt:349-358 → :364) ② 관리자 화면의 "잠금 모드: 완전 잠금 (device owner)"(ui/AdminScreen.kt:233-236) ③ 잠금 검증 로그 `ci-viewer/kiosk-summary.txt`(텍스트 6/6 PASS) | 위 | 06, 07, 텍스트 |
| 자동 복귀 전후 | 별도 화면 없음. 동작: 둘러보는 중 마지막 터치 후 `idleReturnSeconds`(기본 **120초**, 관리자 웹에서 30~600초 설정)에 `goHome()` → 메인 + 목록 맨앞으로 스크롤. 전 = 파트 상세/목록, 후 = 메인(01과 같은 화면) | KioskConfig.kt:23,40(기본 120), MainActivity.kt:258-264(machine), :283-287(1초 폴링→goHome), :275(goHome), IdleReturnMachine.kt:61-64(isIdleExpired), admin-web/src/lib/constants.ts:2-3(30~600) | 없음(03→01 로 구성 가능) |
| 재생 중 자동 복귀(규칙 B) | 터치 없이 자동 다음 영상이 **2번 연속**이면 메인 복귀 | IdleReturnMachine.kt:68(`AUTO_ADVANCE_LIMIT = 2`), MainActivity.kt:317-320 | 없음 |
| 관리자 웹: 재생목록 추가 | `/parts` "+ 파트 추가" → 모달 "파트 추가"(유튜브 재생목록 주소 입력 → "확인" → "재생목록을 찾았어요: …· 영상 N개" → 저장) | admin-web/src/components/PartsManager.tsx:66, PartDialog.tsx:98,105,125,160 | 없음 |
| 관리자 웹: 설정 | `/settings` "설정"(메인 복귀 시간·헤더 문구 저장, 앱 PIN 변경, 웹 비밀번호 변경). 저장 안내 "태블릿에는 최대 30분 안에 반영" | admin-web/src/components/SettingsForm.tsx:44,7,70,110,148,198 | 없음 |

## 5. QR 코드와 가림 대상
- **메인 화면 QR**: `TopBand` 안 `Image(painterResource(R.drawable.nowflix_qr))` — MainActivity.kt:520-527(우상단, 밴드 높이의 62%, 모서리 4dp). 정적 PNG(app/src/main/res/drawable-nodpi/nowflix_qr.png, 740×740, 디코딩 안 해 인코딩 내용은 **미확인**). 앱 레벨에서 끌 수 없음 → 캡처 후 가림.
- **관리자 화면 QR**: `QrPanel`(AdminScreen.kt:128,203-224) — `QrCode(content=adminWebUrl)`(ui/QrCode.kt:21)로 관리자 웹 URL 을 런타임 생성 + 그 아래 URL 글자 `nowflix-admin.vercel.app` 표시. QR·도메인 둘 다 가림 대상.
- 병원명: 화면·코드에 **없음**(grep '병원' 은 문서 전부 일반 명사). 화면의 브랜드는 "NOWFLIX", 파트 이름(괜찮Knee TV·척척박사 TV·손봐줘 TV·Hip한 NOW·어깨의 정석·족집게 TV)과 영상 채널명 "고쳐줘 NOW"(픽스처). 이들이 고객사 표기인지는 미확인(명세 규칙상 공개 화면 상호는 그대로 둘 수 있음; 판단 필요). `header_text` 설정이 있으나 앱 화면에서 쓰는 곳은 미확인(KioskConfig.kt:25,42 만, MainActivity 에 소비 흔적 없음).
- 연락처: 앱 화면·관리자 웹 화면에 전화·이메일·주소 **없음**(확인한 범위: ui/*.kt, MainActivity.kt, admin-web 컴포넌트 문자열). 단 `docs/인계문서.md`·`설치가이드`엔 계정·연락 정보가 있을 수 있으니 영상 재료로 쓰지 말 것.

## 6. 관리자 웹 테스트 계정·쓰기 API
- 계정: 아이디 없는 **비밀번호 단일 로그인**(login/route.ts:9, bcrypt 비교 auth.ts:31). 정의 위치: ① 초기 비밀번호·앱 PIN 은 `docs/인계문서.md` "3. 기본 비밀번호·PIN" 표(113-114행 부근; 값은 여기 쓰지 않음) 및 `docs/운영가이드.md:67`(PIN) ② 해시는 DB `web_auth` 행(supabase/migrations/20260803140000_web_admin_auth.sql), 시드 값은 마이그레이션 쪽. 실제 운영 비밀번호가 초기값 그대로인지는 **미확인**(바꿨을 수 있음, `is_default` 컬럼으로 추적).
- 서버 env 이름(관리자 웹): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `YOUTUBE_API_KEY`, `SESSION_SECRET`(admin-web/src/lib/env.ts:13-17). 레포 루트 `.env.local`(600)에 토큰류가 있으나 열람 권한 거부돼 변수 이름도 확인 안 함. 앱 쪽은 `local.properties`(YOUTUBE_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, RELEASE_*).
- 쓰기 API(전부 세션 쿠키 필요, 운영에선 DB 쓰기 → 촬영 때 가로채기 대상):
  - `POST /api/login`(성공·실패 모두 `web_auth` 갱신: 실패 카운트/잠금 `rateLimit.ts`) · `POST /api/logout`
  - `POST /api/parts`(재생목록 추가+이미지 업로드) · `PATCH /api/parts/[id]`(수정/활성화) · `DELETE /api/parts/[id]` · `POST /api/parts/[id]/move`(순서)
  - `POST /api/parts/verify`(DB 쓰기 없음, YouTube 호출 — 유료 아님이나 쿼터 사용)
  - `PATCH /api/settings`(복귀 시간·헤더) · `POST /api/settings/pin` · `POST /api/settings/password`
  - 읽기: `GET /api/parts`, `GET /api/settings`, `GET /api/status`(YouTube 호출)
  - 파일: admin-web/src/app/api/**/route.ts

## 7. 사실 후보 (자막용, 근거 있음)
1. 유휴 자동 복귀 기본 **120초**, 관리자 웹에서 **30~600초**로 조정 — KioskConfig.kt:23,40 · supabase/migrations/20260803103813_kiosk_config.sql:22 · admin-web/src/lib/constants.ts:2-3.
2. 재생 중 터치 없이 **2번 연속** 자동 다음 영상이면 메인 복귀 — IdleReturnMachine.kt:68.
3. 설정 반영 주기 **30분**(+ PIN 화면 열면 즉시 갱신, 관리자 화면 "설정 새로고침" 버튼) — MainActivity.kt:451, :250-251, AdminScreen(07 캡처).
4. 진료 파트: 번들 기본 **6개**(assets/parts.json), 테스트 픽스처 8개까지 가로 스크롤 시연(parts_8.json); 한 화면에 **6열**까지 한 줄(CardMetrics.kt:14). 상한 숫자는 코드에서 **미확인**(파트 추가는 데이터 변경만, Part.kt:8-10 주석).
5. 잠금 방식: **device owner 기반 LockTask**(FULL_LOCK: 상태바·키가드 비활성) / 비소유 시 화면 고정+홈 런처 FALLBACK — KioskLockMode.kt:3-8, MainActivity.kt:182-196; 잠금 검증 CI **6/6 PASS**(ci-viewer/kiosk-summary.txt, 2026-08-25).
6. 탈출구: 우상단 숨은 영역 **3초 길게 누르기** → PIN(6자리) → 관리자 화면 — MainActivity.kt:349-358; PIN **5회 오입력 → 30초 잠금** — PinGate.kt:75-76. (PIN 숫자 자체는 촬영·자막에 쓰지 말 것)
7. 영상 소스: **YouTube 재생목록**(Data API v3 목록 + 임베드 플레이어 `android-youtube-player` 13.0.0) — README.md:5-8, libs.versions.toml:`youtubePlayer`; 목록은 캐시 후 Supabase 설정과 병합.
8. SDK: **minSdk 29 / targetSdk 34 / compileSdk 35**, versionName **1.1.0**(versionCode 2), 컴포즈 단일 모듈 — app/build.gradle.kts:37-46 (minSdk :39). 릴리즈 APK `dist/nowflix-1.1.0.apk` 27.1MB, 병원 태블릿 **5대**(PROGRESS.md:12·인계문서; 실기기 v1.1.0 설치는 미실시로 기록됨).
9. 단위 테스트 **102개**, CI 계측 **21/21**, 스크린샷 8장(PROGRESS.md:8, 2026-08-25 실행 기록) — 실행 시각이 이 서버 실행이 아니라 기록 근거임에 유의.
10. 재생 화면: 컨트롤 **3초** 뒤 자동 숨김, 하단 진행바·시간은 항상 표시, v1.1.0 에서 전체화면 추가 — PlayerScreen.kt:94(CONTROLS_TIMEOUT_MS), PROGRESS.md:7.

## 8. 브랜드
- 주색 **#E50914**(Netflix 풍 빨강): MainActivity.kt:99 `NowflixRed`, ui/PinPad.kt:36, ui/AdminScreen.kt:40, ui/VideoRowUi.kt:46. 배경 `#0B0B0C`(MainActivity.kt:100), 상세·플레이어·관리자 `#0F0F0F`(PartDetailScreen.kt:52, PlayerScreen.kt:82, AdminScreen.kt:38), 카드 `#17171A`(AdminScreen.kt:39), 보조 글자 `#AAAAAA`, 재생 진행바 `#FF0000`(PlayerScreen.kt:93). colors.xml·Theme.kt 없음(색은 composable 파일 안 상수; themes.xml 은 검정 배경만).
- 앱 폰트: 지정 없음(Compose 기본 = 기기 시스템 폰트, 캡처에선 Roboto/Noto Sans CJK 계열로 보임). "NOWFLIX" 워드마크는 **이미지가 아니라 텍스트**(`FontWeight.Black`, 넓은 자간, 흰색 — MainActivity.kt:510-516).
- 관리자 웹: 주색 **#2563EB**(brand, brandDark #1D4ED8), ink #111827, canvas #F6F7F9, 폰트 **Pretendard**(admin-web/tailwind.config.ts:9-20). 앱(빨강/검정)과 웹(파랑/라이트)은 서로 다른 팔레트.
- 로고 원본: `app/src/main/res/drawable-nodpi/nowflix_logo.png`(915×242, **현재 앱 화면에서 안 씀** — PROGRESS.md:93 로 텍스트 워드마크로 교체됨), 파트 포스터 `part_01_knee`~`part_06_jokjipge`.png(720×900, 병원/채널 제작물이므로 영상 사용 가능 여부는 고객 판단 필요), 앱 아이콘 리소스(mipmap) **없음**(res 에 drawable-nodpi·values·xml 뿐). svg 없음.

## 9. 명세와 코드가 다른 점
- 명세 "진료 파트 재생목록"과 "영상 목록"은 **같은 화면**(`PartDetailScreen`) — 별도 2장이 아님.
- "잠금 상태" 전용 화면 **없음** — 잠금은 OS 기능. 보일 수 있는 건 PIN 패드·관리자 화면의 "잠금 모드" 행·키오스크 검증 텍스트.
- "자동 복귀 전후"는 화면이 아니라 **동작**(120초 유휴 → 메인). 전용 캡처 없음, 전(파트 상세)·후(메인) 두 장으로 구성해야 함. 실제 시간 흐름 영상은 서버에서 못 찍음.
- "태블릿 가로 **실해상도**": 실제 병원 태블릿 기종·해상도 기록 없음. 확인되는 건 CI 에뮬레이터(pixel_c) 2560×1688 뿐 → "실해상도"라 부르려면 이 값이 맞는지 사용자 확인 필요.
- "관리자 웹: **재생목록 추가**" → 실제 이름은 **파트 추가**(재생목록 주소를 넣는 모달). "설정"은 일치.
- 명세는 "기존 검수 캡처·녹화부터"라 했고 **8장 PNG 는 있으나 녹화 영상은 없음**. 재생 화면은 실제 영상이 아니라 검정 로딩 상태.
- 명세 "안드로이드 에뮬레이터, JVM 스크린샷 테스트 등 서버에서 되는 방법": 이 서버는 KVM·실행 가능한 adb 없음, Robolectric 네이티브 aarch64 미지원, 레포에 JVM 스크린샷 도구 없음 → 서버만으로는 안드로이드 화면 **새로 촬영 불가**(위 3절).
- 명세 "QR 코드는 가린다": 메인 QR 뿐 아니라 관리자 화면(07)의 QR + URL 글자도 가려야 함. 앱에서 QR 를 끄는 설정은 없음.
- `local.properties` 의 SDK 경로(`/opt/android-sdk`)가 이 서버와 불일치, `.env.local` 은 읽기 거부 — 로컬 빌드·운영 연동 시도는 모두 막힘(촬영엔 불필요).
- 참고(비밀): `docs/인계문서.md`·`운영가이드.md` 에 초기 관리자 비밀번호·PIN 이 평문으로 적혀 있음 → 영상·shots.md·facts.md 로 옮기지 말 것.
