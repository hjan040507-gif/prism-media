# medimajor BLOCKED · 못 채운 것과 보고할 것

## 못 채운 것 (사유 · 시도 · 대안)
1. **판매 등록 마법사 2~4단계(상태 신고·경매 조건·확인·제출)** — 미촬영. 사유: 다음 단계로 넘어가려면 '다음 · 상태 신고' 가 `update_listing_draft`·`submit_listing` 등 쓰기 RPC 를 부르고, 가짜 200 응답(`{"ok":true}`)으로는 서버 상태가 필요한 화면이 어긋날 수 있어 운영에서 열지 않았다. 시도: 1단계(사진·기본 정보)를 로그인 세션으로 찍음 — 기존 빈 초안이 재사용돼 `create_listing_draft` 는 호출되지 않았고, 업로더·입력칸 흐름 5장(states/sell-photos)은 성공. 대안: 로컬 폐기 DB 가 있는 환경(레포 CLAUDE.md `verify:p5bid` 용)에서 같은 스크립트를 돌리거나, 마법사 화면이 더 필요하면 `/dev/fixture/sell`(로컬 `MM_FIXTURES=1` 에서만 열림)을 쓴다.
2. **'사진에서 정보 채우기'(AI 인식) 결과 화면** — 미촬영. 사유: 유료 Anthropic 호출(`/api/ai-listing/*`)이라 버튼을 누르지 않았다(가짜 AI 응답을 새로 만들면 '없는 기능' 이 된다). 대안: 레포에 저장된 AI 결과가 있으면 그 응답 모양으로 가로채기(미확인).
3. **관리자 중 개인정보 가능 화면**(`/admin/quotes`·`/admin/directory`·`/admin/wanted`·`/admin/listings/[id]`·`/admin/reports`) — 의도적으로 찍지 않음. 실제 가입자·문의자 정보가 열릴 수 있고 가림 셀렉터를 검증할 수 없었다. 찍은 4화면(대시보드·통계·전시관·매물 심사)은 판매자 칸을 앱이 이미 ○○○○ 로 가려 내려줌.
4. **로그인 상태의 입찰 입력 UI**(입찰가 입력창·확인 모달) — 미촬영. 입찰은 `place_bid` 쓰기 경로라 열지 않았다(비로그인 상세의 가격·이력·입찰 패널은 가짜 실시간 푸시로 촬영).

## 결정 필요
- 없음(게이트 기준값·가림 정규식·시험 기대값은 바꾸지 않았다).

## 보고할 것 (운영 쓰기 가능성)
- **로그인 POST 2회**(서버 액션 `POST https://medimajor.com/login`, 인증 세션 행이 남는 쓰기): 테스트 판매자 1회(성공)·관리자 `qa-admin` 1회(성공). 둘 다 `.secrets/*.json` 의 기존 계정, 환경변수로만 전달, 틀린 비밀번호 시도 0. 세션 파일은 촬영 뒤 삭제. `qa-admin` 의 role=admin 이 지금도 유지됨을 확인(관리자 화면 열림).
- **조회수**: 매물 상세 문서를 총 8회 열었다(미래온 MQE-102 `0ca69e33…` 1건, 탐색 3·촬영 5). 모든 요청 UA 가 BOT 정규식(`lot-stats.ts:16`)에 걸림(스크립트가 요청마다 검사, 안 걸리면 abort) → `lot_view_stats` 기록 0 예상. 단 사전 조사(RECON)에서 일반 UA curl 1회가 같은 매물에 있었다(이 세션 이전).
- curl GET `/`(홈, UA `Mozilla/5.0 HeadlessChrome`) 1회 — 문구 재확인용, 서버 쓰기 경로 없음.
- 가로챈 비GET(운영에 도달 0): `POST rpc/get_listing_price_input` ×3(읽기성 RPC)·`POST rpc/sync_listing_images_slots` ×3·`POST storage/v1/object/listing-images/…` ×3(사진 업로드). 그 밖의 공개 페이지·상세·관리자·실시간 캡처에서 비GET 0건. `create_listing_draft`·`/api/ai-listing/*`·`place_bid`·`buy_now` 호출 0.
- GET 이지만 운영을 읽은 것: `rest/v1/public_bids`(입찰 이력, 푸시마다 한 번 진짜 응답을 읽어 가짜 행을 얹음)·`/api/time`·`/api/live/events` 등 앱이 원래 부르는 읽기.
- 고객 레포 `/home/dev/Medimajor`: 읽기만(`git show HEAD:…`). baseline 과 `git status --porcelain` sha 동일(17a720a26c), worktree 7개 그대로. 임시 서버·로컬 사본 0(라이브 촬영이라 띄운 것 없음).

## 그 밖의 메모
- 명세의 폰트 'Pretendard Variable' 은 라이브에서 실제로 쓰이지 않는다 — computed 는 `MM Sans`(Pretendard 서브셋 개명). brand.json 참고.
- lib.mjs 가 촬영 중 두 번 바뀌었다(하단 고정 요소 이동·이미지 eager 디코딩, 조율 세션 알림). 모든 PNG 는 lib.mjs 최종 수정(23:38:49Z) 이후에 찍힌 것이고 stale 이던 첫 desktop 실행은 덮어썼다.
- ocr.py 걸림 5건은 판정 결과 모두 오탐: admin-listings-view 의 '00***' 는 앱이 판매자 칸에 찍은 `○○○○ · ○○○○` 마스크를 OCR 이 0000-0000 으로 읽은 것(눈으로 확인), home-th-view·lang-switch/04-th 의 '07***'·'09***' 는 태국어 글자를 OCR 이 숫자열로 오독한 것(DOM pii_scan 0건, 텍스트 줄 확인).
