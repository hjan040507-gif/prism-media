# byclick BLOCKED — 못 채운 것 · 대체한 것 · 보고할 것

(촬영 2026-11-05 23:3xZ ~ 11-06 02:2xZ · 운영 `https://byclick.co.kr` 직접 촬영은 소비자 모바일뿐, 딜러·관리자·PDF 는 로컬 사본+가짜 Supabase)

## 1. 소비자 로그인 벽 뒤 화면 — 진행 6단계 트랙(`/my`) · 최고가 확인 뒤 판매·위탁·반환 선택(`/my/[id]` DecidePanel) · 판매 정산서 링크
- 사유: 운영 소비자 로그인은 문자 인증(`signInWithOtp` → `verifyOtp`, `src/app/(auth)/my/login/actions.ts:27,40`)이고 고정 시험번호·고정 인증번호(`sms_test_otp`, Supabase 설정)를 이 세션이 알 방법이 없다(RECON.md §4). 알았더라도 시험번호는 신청 0건이라 보여 줄 데이터가 없고, 첫 로그인은 `consumers` 행을 만든다(운영 쓰기). 새 계정·실제 문자는 범위 밖.
- 시도: 운영 로그인 시도 0회(코드·라이브 GET 확인으로 불가 판정). 인증번호 받기 버튼은 누르지 않았다.
- 대체(찍음): 운영 랜딩의 4단계 안내 `states/process-steps/`(모의견적·무료픽업·검수·경매 및 입금, 4단계에 상위 제안가 TOP 3 와 「즉시판매·위탁판매·차량반환」 선택 화면 예시 포함)와 `mobile/landing-full.png` 의 「판매는 직접 결정하세요」 섹션. 6단계·3택 사실은 코드 근거만(facts.md #5 `stage-table.ts:24-31` · #6 `DecidePanel.tsx:43`).
- 대안(결정 필요): 레포 소비자 화면(v3)을 로컬 가짜 DB 로 찍을 수는 있으나 운영(11-04 배포 sian-v9, 레포에 없음)과 디자인이 달라 「실제 서비스와 픽셀 단위로 같다」에 어긋나 찍지 않았다. 필요하면 지시 주면 별도 폴더에 표시해서 찍는다.

## 2. 「촬영 가이드 단계」 전용 화면 없음
- 웹에는 촬영 가이드 화면이 없다(위저드 사진 스텝 꺼짐 `Wizard.tsx:65` · 앱 `PHOTO_STEP_ENABLED=false`). 슬롯별 안내 문구(`src/lib/photo-slots.ts:25` SLOT_GUIDES)는 관리자 검수 화면(`PhotoGrid.tsx:255`)에만 쓰인다.
- 대체(찍음): 운영 `/my/apply` 1단계의 「바이크 사진 등록」 블록과 시트 `states/photo-register/`(필수 4슬롯 + 추가 6장). 사진 선택·업로드는 누르지 않았다.

## 3. 웹푸시 관심차 알림 — 알림 자체는 캡처 불가
- 새 경매가 관심 조건과 맞으면 웹푸시 `interest_match`(`src/lib/auction-open-push.ts:12`)가 나가는데 브라우저 푸시 알림은 화면 캡처 대상이 아니다.
- 대체(찍음): 「관심차」 화면과 「관심차 조건」 등록 창 `states/interest-conditions/`, `desktop/dealer-interest-models-*`.

## 4. 딜러·관리자 운영 로그인 — 하지 않음(로컬 사본 + 가짜 Supabase 로 대체)
- 사유: 고정 딜러·관리자 계정 없음(`scripts/lib/run-accounts.mjs:3`), 관리자는 TOTP 2단계 인증, 관리자 화면 GET 은 서버가 `admin_sessions`·`admin_access_logs` 에 쓴다(RECON §0-5, §5). 운영에는 지금도 진행 중 실제 경매가 있다.
- 대체(찍음): 사본 `git archive HEAD(863d2c26)`(원본 레포 무변경) → `tmp/byclick-src` 에서 `npm ci` · `flock … heavy-run npm run build` · `next start -p 3260`, Supabase 는 이 세션의 목 서버(`capture/mock-supabase.mjs`, 3263). 세션은 가짜 JWT 쿠키. 화면 코드는 운영과 같다(딜러·관리자 로그인 화면 글자가 레포와 같음 — RECON §0-1). 2단계 인증 6자리 입력 화면·로그인 직후 화면은 찍지 않았다(my_admin_context.mfa_required=false · `ADMIN_MFA_SCHEDULE_OVERRIDE={}` → `src/lib/mfa-gate.ts:21,67` 통과).
- 한계: 운영 DB 의 실제 데이터·현재 설정값이 아니라 가짜 값이다(모든 금액·이름·차량).

## 5. 입찰 제출 연출 seq(`bid-submit`) — 폐기
- 시도 1(가상 시계 `recordSeq`): 입찰 확정 클릭 뒤 서버 재렌더에서 세션이 끊겨 딜러 로그인 화면으로 이동 — 영상 불가.
- 시도 2(실시간 `recordScreencast`): DSF 2 에서 녹화 프레임이 2880×1800 인데 화면은 1440×900 이 좌상단에만 그려져 쓸 수 없는 화질. 두 번까지만 시도하고 폐기, 파일 삭제.
- 대체(찍음): 상태 흐름 `states/sealed-bid/`(입력 전 3회 → 금액 입력 → 확인창 → 제출 후 2회·토스트·내 입찰가) 4단계 + `seq/bid-countdown.mp4`(마감 카운트다운 3초).
- 대안: `tools/lib.mjs recordScreencast` 의 size 를 CSS 해상도(dsf 1)로 맞추는 결정을 한 뒤 `ONLY_SUBMIT=1 node byclick/capture/b-seq.mjs` 재실행(앱·목 서버를 다시 띄워야 함).

## 6. 그 밖의 명세와 다른 점 · 알아 둘 것
- PDF: 「성능·상태 점검기록부」는 3쪽 문서의 첫 쪽만 `pdf/performance-record.png`. 낙찰 확인서·판매 정산서는 1쪽. 「정산서」는 소비자용 판매 정산서(딜러용 정산서 PDF 없음 — 관리자 정산 장부는 xlsx 내보내기). PDF 회사 정보(머리·꼬리)는 사본의 `company-info.ts` 만 치환해 렌더(대표자 「김○○」·사업자번호·주소 시·구까지·이메일 제거) — 레포 원본 무변경.
- 차종 자동완성: 운영 `/my/apply` 모델 칸은 직접 입력(팝업 없음), 제조사는 시트 검색(서버 렌더 150개 목록을 클라이언트에서 거름). `vehicle_catalog` RPC·서버 액션 예외 통과는 운영에서 0건이었다.
- 입찰 단위·횟수의 운영 현재값은 관리자 설정 화면(로그인)에서만 확인 가능 — 「3번」은 운영 로그인 화면 공개 문구, 「1만원 단위」는 코드 기본값 + 운영 랜딩 FAQ(facts.md #3).
- 운영 랜딩 LIVE 카드(`mobile/landing-*`)는 촬영 시각에 진행 중이던 실제 경매 1건(대림 엠보이 125, 정면 검수 사진 — 번호판 안 보임)이다. 영상에 쓰기 싫으면 `mobile/landing-view.png` 의 그 카드를 쓰지 말 것.
- 운영 로고는 SVG 원본 없음(PNG).

## 보고할 것 — 운영 쓰기 가능성 / 허용한 비GET
- 운영(`byclick.co.kr`)에는 GET 만 보냈다(소비자 모바일·로그인 화면·seq). 가로챈 비GET 0건, 허용한 운영 비GET 0건(전 json `intercepted`). 로그인 POST 0회.
- 서버가 GET 렌더 중에 하는 기록(방문 통계 등)은 미확인 — 공개 화면이라 영업 데이터 쓰기는 없다고 판단하나 확인 불가.
- 허용한 비GET 2종은 전부 로컬 가짜 DB(127.0.0.1:3263)로만 갔다: `POST /rest/v1/rpc/place_bid_v2`(입찰 — 메모리에 1건 더함, 딜러 상태 흐름 sealed-bid 1회), `POST /rest/v1/rpc/vehicle_catalog`(읽기 전용 STABLE 함수, 관리자 검수 입력 화면 차종 목록). 읽기 전용 서버 액션 `listModelsByManufacturer` 1종은 로컬 앱 → 로컬 가짜 DB 읽기로 통과(운영 아님).

## 재촬영 기록 (11-06 03:1xZ · 연락처 가림)
- 관리자 접수·결정·접수 상세(배차·경매중) 6장+짝 재촬영: 앱이 전화번호를 중첩 span(`010-<span>3456</span>-<span>7890</span>`)으로 쪼개 그려 lib 가림·검사가 못 잡았다. mock-data 의 전화번호 값을 전부 `010-****-****` 로 바꿔 다시 찍음(화면·DOM innerText 에 전화번호 형식 0건).
- 운영 딜러 로그인·가입 화면(desktop/dealer-login-live·dealer-signup-live)의 회사 정보 블록(대표자 이름·상세 주소·연락처 1566-…)이 가려지지 않아 있어 블록 전체를 숨기고 다시 찍음.
- ocr.py --all(112장) 걸림 1건: `pdf/settlement-statement.png` phone — 문서번호 `OMD-S-C3C3C3C3` 를 OCR 이 `040-5-063030303` 으로 잘못 읽은 것. PDF 원문(pdftotext)에는 전화번호 형식 0건, 화면에도 없음.
