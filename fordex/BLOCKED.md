# fordex — 못 채운 것 · 명세와 다른 것 · 보고할 것

## 못 채운 것 (사유 · 시도 · 대안)
1. **운영 관리자 화면 촬영 못 함** — 사유: 운영 `is_admin` 계정 3개의 비밀번호가 이 서버에 없고(`docs/handover-admin.md:52-69`), 운영 화면은 실회원 데이터가 섞인다. 시도: 없음(비밀번호가 없어 로그인 시도조차 하지 않음). 대안(적용함): 로컬 복제 스택의 합성 `admin` 계정(`*@replica.test`)으로 같은 앱의 같은 관리자 화면을 찍고, 목록 값은 가짜로 대체(shots.md 에 '가짜 값').
2. **'관리자 대시보드'·'분쟁 중재' 이름의 화면은 코드에 없다**(RECON 12-2). 대체: 대시보드 = 설정의 어드민 메뉴(`desktop/admin-menu-*`)와 거래 관리 상단 합계(`admin-transactions-*`), 분쟁 중재 = 거래 행 → '에스크로 배송등록/통보' 창의 '분쟁·구매거절' 구역(`admin-dispute-modal-*`, 실제 이름 `AdminEscrowDetailModal`·`ADMIN_DISPUTE_COPY`) + 신고 관리(`admin-reports-*`).
3. **'수수료 정산'(AdminRevenue)·'지급/정산 관리'(AdminPayouts) 화면은 찍지 않았다.** 사유: 수수료 정산은 예치금 출금 버튼이 있고 `admin_revenue_summary` 가 VOLATILE(advisory lock)이라 안전하다고 보증하기 어렵다. 지급/정산은 복제 DB 의 e2e 잔여 값(수동 이체 대기 478건·내부 id·붉은 오류 문구)이 실서비스처럼 보이지 않는다. 시도: AdminRevenue 1회(가짜 응답이 형식에 안 맞아 앱 오류 화면), AdminPayouts 1회(위 사유로 폐기). 대안: 거래 관리(`admin-transactions`)가 거래·정산 합계(결제완료 건수·거래액·수수료)를 보여 준다. 필요하면 합성 응답(`admin_payout_list` 등 모양은 앱 코드 기준)을 만들어 추가 촬영 가능.
4. **본인인증 안내에 '만 19세' 문구가 없다.** 시도: 화면 그대로 촬영(`mobile/identity-guide-*`). 실제 앱에서 '만 19세 이상만 이용할 수 있어요.' 는 인증 실패 사유 상태에서만 나오므로 그 상태(`niceResult=fail&niceReason=age_restricted` 라우트 파라미터 — 앱이 NICE 복귀 때 쓰는 실제 값)도 `mobile/identity-age-restricted-*` 로 찍었다. 자막에 "만 19세"를 쓰려면 후자만 근거가 된다.
5. **결제 진행 중 NICE 결제창은 못 찍는다** — 웹은 결제하기를 누르면 현재 탭이 NICE 페이지로 통째로 바뀐다(`PaymentScreen.tsx:420-424`). 시도: 결제하기를 누르지 않고 결제 화면의 수단·약관 선택(`states/checkout-pay`)과 거래 상세 타임라인 4단계(`states/tx-timeline`)로 '결제 진행'을 구성. 대안: NICE 승인을 복제 목 서버가 받는 `replica/e2e/bs-lib.mjs payViaNice` 경로로 끝까지 진행하려면 복제 서비스(`replica/services.sh`) 기동이 필요한데 남의 도커 스택이라 하지 않았다.
6. **App Store 스크린샷 8장은 원본 그대로** `media/appstore/` (파일 변경 없음, `cmp` 동일 확인). 개인정보 직접 확인: 이름·전화·주소·계좌 없음. `06-payment` 입력칸은 placeholder 만. `07-chat-room` 에 거래 번호 앞 8자(`1040d252`)와 송장 `6994-****-****`(이미 마스킹). `04-portfolio` 에 테스트 계정의 컬렉션 평가액.
7. **로고 SVG 원본 없음**(레포에 PNG 만) — `media/logo/` PNG 로 대체. 히어로 사진도 따로 없음(홈 배너는 DB `ad_banners` 이미지라 복제 DB 의 단색 배너가 찍힌다 — 스토어 컷 `01-home-feed.png` 의 배너가 실제 운영 배너).

## 명세와 코드가 다른 점 (요약 — 상세는 RECON.md 12절)
- 관리자 화면 18개 → 실제 21개(+토글 3, 마케팅 알림은 플래그 꺼지면 20개 노출). 근거 facts.md 1번.
- 관리자 웹이 따로 없고 같은 앱 UI 의 설정 → 어드민. 1440 폭에서는 모바일 UI 가 가로로 늘어난 모양(실제 모습) — 새 레이아웃을 만들지 않았다.
- 라우트 URL 이 없다(`linking` 없음) → React Navigation 객체를 fiber 에서 찾아 `navigate`(복제 레포 e2e 의 `nav()` 방식).

## 보고할 것 (운영 쓰기 가능성 · 복제 DB 쓰기)
- **운영(fordex.co.kr · gwezmmnynoiqhzhgzuew.supabase.co · NICE)에는 한 번도 접속하지 않았다.** 브라우저의 외부 호스트 요청은 전부 abort(`ctx.__ext` 가 모든 촬영에서 비어 있음 = 외부 요청 0). 웹은 `dist-replica-after`(Supabase URL 이 127.0.0.1:54400 으로 박힌 복제 빌드)의 사본.
- 복제 Auth 로그인(합성 계정 `*@replica.test` buyer·buyer2·seller·admin, `POST /auth/v1/token`) — 스크립트 실행 1회당 역할마다 1회, 탐색·재촬영 포함 총 약 40회. **복제 DB 의 `auth.sessions`/`refresh_tokens`/`last_sign_in_at` 에만 행이 남는 쓰기**(이미 떠 있던 `fordex-replica3` 스택, 운영 아님). 컨테이너는 시작·중지·재시작·SQL 모두 하지 않았다.
- 복제 DB 에 앱이 쓰는 요청(비GET)은 전부 가짜 200 으로 가로챔. 가로챈 목록은 각 json `intercepted` 에. 허용(비GET 통과)한 것은 읽기 전용 RPC 뿐(목록은 `capture/common.mjs` `READ_RPC`, 함수가 STABLE 임을 마이그레이션에서 확인한 것 + 이름이 조회인 관리자 목록). Realtime 웹소켓은 복제 kong 으로 연결(구독만, 쓰기 프레임 없음 — json `websockets` 에 기록).
- 복제 게이트웨이(54400)·웹 서버(8294)는 이 세션이 `tmp/fordex-gw/` 사본으로 띄웠다 → 끝나며 PID 만 종료.
