# nowflix shots — 파일 한 줄 설명

## 방식 요약
- **태블릿 화면(tablet/ · states/nav-main-part-player · lock-admin · auto-return)**: 이 서버(ARM, KVM 없음)에서 앱을 새로 못 띄워, 레포 `~/nowflix-kiosk/ci-viewer/screenshots/` 의 기존 CI 에뮬레이터 캡처(pixel_c, API 30, Compose `captureToImage`, 2560×1688, source_commit 8801048 = 현 앱 코드, 2026-08-25)를 **복사**해 쓴다. 원본은 읽기만(sha256 을 json `source.sha256_original` 에 기록, 원본 무변경). 스크립트 `capture/tablet-from-ci.py`.
- **가림**: DOM 이 없으므로 PIL 로 주변 배경색 사각형을 덮어 지우기만 했다(새로 그리지 않음). 덮은 곳: 메인 QR 코드(01·02 → 메인을 쓰는 모든 파일, 상단 빨간 밴드 우측), 관리자 화면(07)의 QR 코드와 그 아래 도메인 글자. 좌표·채움색은 각 json `masked` 에 있다. 그 밖에 병원명·연락처는 화면에 없음(RECON 5절). 화면의 파트 이름("괜찮Knee TV" 등)·채널명 "고쳐줘 NOW"(테스트 픽스처)는 고객 콘텐츠 상호로 보아 그대로 뒀다(비공개 개인정보 아님; 고객 판단 필요 시 BLOCKED 에 올림).
- **json**: DOM 이 없어 `tesseract kor+eng tsv` 단어 상자(conf≥30)를 `elements`(text·rect), 줄 묶음을 `lines` 로 담았다. rect 는 px ÷ 밀도 2.0 = dp, viewport 1280×844 dp @2 (밀도는 pixel_c 기본 320dpi 추정 — 미확인). `pii_scan` 은 **가린 뒤 이미지**의 OCR 글자를 tools/ocr.py 의 PAT 표(전화·이메일·주민번호·계좌·URL·차량번호)로 검사한 값(total 0 일 때만 저장). `method`: existing CI emulator screenshot (pixel_c) + PIL mask + OCR boxes. 출처 경로·커밋·날짜도 json `source` 에.
- **실해상도**: 확인된 값은 에뮬레이터 2560×1688 뿐. 실기기 해상도는 미확인(BLOCKED.md 5).
- 영상 목록 썸네일이 빈 회색, 재생 화면이 검정 로딩인 것은 원본 캡처의 한계(BLOCKED.md 2).
- 영상 제목·조회수는 테스트 픽스처 값(`app/src/androidTest/assets/fixtures/videos.json`)이다.

## tablet/ (태블릿, 원본 2560×1688 PNG)
- `tablet/main-view.png` — 메인(파트 6개, "TOP 6", 포스터 6장). 가림: 상단 밴드 우측 QR. 원본 01_main_6parts.png. 가짜 값 아님.
- `tablet/main-8parts-view.png` — 메인 변형(파트 8개 "TOP 8", 오른쪽이 잘려 가로 스크롤). 가림: QR. 원본 02_main_8parts.png.
- `tablet/part-detail-view.png` — 진료 파트(좌: 포스터·"재생목록 · 동영상 8개"·"모두 재생"·"메인으로" / 우: 영상 8개 목록 — 재생목록과 영상 목록은 한 화면). 썸네일 빈 회색(원본 한계). 원본 03_video_list.png.
- `tablet/player-view.png` — 재생 화면(컨트롤 표시, 오른쪽 "다음 동영상", 영상 영역은 검정 로딩 마크 · 0:00/0:00). 원본 04_player_controls_shown.png.
- `tablet/player-controls-hidden-view.png` — 재생 화면(ScreenshotTest 의 controlsHidden 캡처; 04 와 다른 건 중앙 로딩 마크뿐). 원본 05_player_controls_hidden.png.
- `tablet/pin-pad-view.png` — 관리자 PIN 패드(점 3개 입력된 상태, 숫자 값은 화면에 없음). 원본 06_pin_pad.png.
- `tablet/admin-lock-view.png` — 앱 관리자 화면(메인 복귀 시간 120초·현재 파트 6개·잠금 모드 "완전 잠금 (device owner)"·앱 버전 1.1.0). 가림: QR 코드 + 도메인 글자(오른쪽 패널은 제목·안내 문구만 남음). 원본 07_admin.png.
- `tablet/player-fullscreen-view.png` — 재생 화면 전체화면("작게 보기" 버튼, v1.1.0). 원본 08_player_fullscreen.png.

## states/ 태블릿 흐름 (모두 같은 해상도·scrollY 0 — 같은 PNG 를 단계에 맞게 복사. 같은 시점 연속 촬영이 아니라 기존 캡처 조합)
- `states/nav-main-part-player/01-main.png` — 1단계 메인 (tablet/main-view 와 같은 이미지, QR 가림).
- `states/nav-main-part-player/02-part-detail.png` — 2단계 진료 파트(재생목록 정보+영상 목록).
- `states/nav-main-part-player/03-player.png` — 3단계 재생 화면.
- `states/nav-main-part-player/04-player-fullscreen.png` — 4단계 전체화면 재생.
- `states/lock-admin/01-main-hotspot.png` — 잠금 탈출구 1단계: 메인(우상단 숨은 핫스팟 3초 길게 누르기 — 핫스팟은 화면에 안 보임). QR 가림.
- `states/lock-admin/02-pin-pad-3digits.png` — 2단계 PIN 패드(3자리 입력).
- `states/lock-admin/03-admin-full-lock.png` — 3단계 관리자 화면 "완전 잠금 (device owner)". QR·도메인 가림.
- `states/auto-return/01-before-part-detail.png` — 자동 복귀 전 ①: 파트 상세(유휴 120초 직전). 같은 시점 연속 촬영이 아니라 기존 캡처 조합.
- `states/auto-return/02-before-player.png` — 자동 복귀 전 ②: 재생 화면(규칙 B: 터치 없이 자동 다음 2번 연속이어도 복귀). 기존 캡처 조합.
- `states/auto-return/03-after-main.png` — 자동 복귀 후: 메인(QR 가림). 기존 캡처 조합.

## 관리자 웹 (desktop/ · 1440×900 CSS px @2) — 로컬 사본 + 가짜 Supabase
- **방식**: 운영에는 접속하지 않았다. `git -C ~/nowflix-kiosk archive HEAD admin-web` 사본(Next.js 14, 레포 HEAD d5afa3a)을 `npm ci` → `heavy-run npm run build` → `next start`(127.0.0.1:47311)로 띄우고, `SUPABASE_URL` 은 `capture/mock-supabase.mjs`(node http, 47312)로, 나머지 env 는 무작위 가짜 값(`capture/setup-fake-env.mjs`)으로 만든 `.env.local`(사본 안, 커밋 안 됨·삭제됨). 로그인 세션은 가짜 `SESSION_SECRET` 으로 서명한 JWT 쿠키(`nf_admin`)를 주입했다(로그인 화면만 로그아웃 상태). 스크립트 `capture/admin-web.mjs`.
- **가짜 값**: 파트 6개의 이름·재생목록 ID·포스터는 앱 번들(`parts.json`, `res/drawable-nodpi`)과 같은 값. **'영상 N개'(8·12·9·15·11·7)와 새로 추가하는 파트 '발목 튼튼 TV'(영상 9개)·헤더 문구 '오늘 대한민국의 TOP 콘텐츠'는 가짜 값**이다(실제 YouTube·운영 DB 값 아님). 웹 비밀번호는 기본값 아님으로 설정(설정 화면의 '비밀번호를 바꿔주세요' 배너 없음).
- **가로챈 요청**: 브라우저 쪽 비GET 전부 가짜 성공(`PATCH /api/settings` 1건 기본 guard), `GET /api/status`(서버가 YouTube 를 부름)·`POST /api/parts/verify`·`POST /api/parts` 는 이 프로젝트 전용 가짜 응답(합계 6건, json `intercepted`). 허용한 비GET 0, 로그인 POST 0회. `/status` 화면은 열지 않았다. 폰트 CSS(jsdelivr Pretendard) GET 은 통과.
- **가림**: 화면에 전화·이메일·주소·QR 없음. 입력 칸 placeholder 의 URL 예시(`https://…`)는 규칙대로 지워져 빈 칸으로 보인다.
- `desktop/login-view.png` · `desktop/login-full.png` — 로그인 화면(비밀번호 입력 칸·로그인 버튼). 로그아웃 상태.
- `desktop/parts-view.png` · `desktop/parts-full.png` — 파트 관리 목록(파트 6개, 포스터·영상 N개(가짜)·노출 중·수정·삭제). 로그인 상태.
- `desktop/settings-view.png` · `desktop/settings-full.png` — 설정(메인 복귀 시간 120초·헤더 문구·앱 관리자 PIN·웹 비밀번호 4칸).
- `desktop/header.png` — 고정 헤더(NOWFLIX 관리자·로그아웃·탭 파트 관리/설정/상태), 스크롤된 상태.
- `states/settings-idle-change/01-before.png` — 설정 변경 1단계: 메인 복귀 시간 120.
- `states/settings-idle-change/02-edited-180.png` — 2단계: 값을 180 으로 편집.
- `states/settings-idle-change/03-saved.png` — 3단계: 저장 클릭 뒤 "저장했어요. 저장하면 태블릿에는 최대 30분 안에 반영돼요." (저장 요청은 가로채 가짜 성공, DB 기록 없음).
- `states/parts-add/01-empty-form.png` — 파트 추가 1단계: '파트 추가' 모달 빈 폼(기존 3개 파트에서 시작 — 4번째가 한 화면에 보이게 목 서버를 3개로 되돌린 상태).
- `states/parts-add/02-typed.png` — 2단계: 파트 이름 '발목 튼튼 TV'(가짜)와 재생목록 ID 입력.
- `states/parts-add/03-verified.png` — 3단계: '확인' 클릭 → "재생목록을 찾았어요: 발목 튼튼 TV · 영상 9개"(검증 응답은 가로챈 가짜).
- `states/parts-add/04-saved-list.png` — 4단계: 저장 뒤 목록(모달 닫힘, 새 파트가 4번째로 추가, 이미지 없음 칸 — 저장 요청은 가로채 목 서버 메모리에만 반영).

## media/ (레포 res/ 에서 복사한 원본)
- `media/nowflix_logo.png` — 로고 PNG 915×242 (`app/src/main/res/drawable-nodpi/nowflix_logo.png`). 현재 앱 화면에서는 안 쓰는 이미지(메인은 텍스트 워드마크).
- `media/posters/part_01_knee.png` · `part_02_chuk.png` · `part_03_son.png` · `part_04_hip.png` · `part_05_shoulder.png` · `part_06_jokjipge.png` — 파트 포스터 720×900 (`app/src/main/res/drawable-nodpi/`). 병원/채널 제작물이라 영상 사용 가능 여부는 고객 판단 필요. 메인 QR 이미지는 가림 대상이라 복사하지 않음. 앱 아이콘·SVG 는 레포에 없음(BLOCKED.md 6).
- `contact.jpg` — 전 캡처 축소 모음(tools/contact.py).
