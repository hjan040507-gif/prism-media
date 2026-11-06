# fordex 촬영물 목록 (shots.md)

공통: 로컬 복제 스택(`fordex-replica3` 합성 DB, 게이트웨이 127.0.0.1:54400) + 웹 빌드 `dist-replica-after` 사본(127.0.0.1:8294)을 보고 찍었다. 운영 접속 0 (브라우저 외부 호스트 abort). 로그인은 복제 합성 계정(`*@replica.test`) 세션을 `localStorage` 에 주입. 비GET 은 가짜 200 으로 가로채고 읽기 전용 RPC 만 통과(허용 목록 `capture/common.mjs` `READ_RPC`).
**가짜 데이터**: 복제 DB 의 e2e 시험 흔적을 가리려고 응답 값만 바꿨다(UI 코드·응답 모양은 그대로) — 매물 제목·설명·카드명(베이스 세트 카드), 카드 사진(시드 줄무늬 PNG → images.pokemontcg.io 공개 카드 이미지), 닉네임(user***)·이름(김○○)·전화·주소(서울특별시 강남구)·이메일, 시세·경매·정산·관리자 목록 값. 코드: `capture/fake.mjs`·`capture/data.mjs`.
모바일 390×844 DSF3(isMobile·hasTouch), 데스크톱 1440×900 DSF2. full.png 는 React Native Web 이 window 가 아닌 안쪽 ScrollView 로 스크롤해서, 안쪽 스크롤을 끝까지 내려 지연 로딩을 띄운 뒤 뷰포트 높이를 내용 높이로 키워 한 번에 찍었다(`capture/rn.mjs`, 기기 픽셀 15,900 상한 — 넘으면 json note 에 '잘림'). view.png 는 원래 뷰포트(스크롤 0).
로그인(복제 Auth) 횟수·운영 쓰기 가능성: BLOCKED.md '보고할 것'.

## 페이지 (full·view 쌍)
- `desktop/admin-dispute-modal-full.png` — 분쟁 처리 — 거래 행의 '에스크로 배송등록/통보' 창 안 '분쟁·구매거절' 구역(AdminEscrowDetailModal). admin_escrow_detail 가짜 응답, 조치 버튼은 누르지 않음 [full]
- `desktop/admin-dispute-modal-view.png` — 분쟁 처리 — 거래 행의 '에스크로 배송등록/통보' 창 안 '분쟁·구매거절' 구역(AdminEscrowDetailModal). admin_escrow_detail 가짜 응답, 조치 버튼은 누르지 않음 [view]
- `desktop/admin-members-full.png` — 회원 관리(어드민) — 14명(복제 DB 행, 닉네임·아이디·이메일은 user*** 로 가림) [full]
- `desktop/admin-members-view.png` — 회원 관리(어드민) — 14명(복제 DB 행, 닉네임·아이디·이메일은 user*** 로 가림) [view]
- `desktop/admin-menu-full.png` — 관리자 홈(설정 → 어드민 메뉴) — 1440 폭에서 모바일 UI 가 늘어난 실제 모양. 관리 메뉴만 보임, 토글은 누르지 않음 [full]
- `desktop/admin-menu-view.png` — 관리자 홈(설정 → 어드민 메뉴) — 1440 폭에서 모바일 UI 가 늘어난 실제 모양. 관리 메뉴만 보임, 토글은 누르지 않음 [view]
- `desktop/admin-reports-full.png` — 신고 관리(어드민) — 신고 8건(가짜 값, 신고자 user***) [full]
- `desktop/admin-reports-view.png` — 신고 관리(어드민) — 신고 8건(가짜 값, 신고자 user***) [view]
- `desktop/admin-transactions-full.png` — 거래 관리(어드민) — 거래·정산 합계(결제완료 1,284건·148,236,000원·수수료 5,188,260원 = 가짜 값)와 거래 14건(가짜, 구매자·판매자 김○○, 송장 마스킹) [full]
- `desktop/admin-transactions-view.png` — 거래 관리(어드민) — 거래·정산 합계(결제완료 1,284건·148,236,000원·수수료 5,188,260원 = 가짜 값)와 거래 14건(가짜, 구매자·판매자 김○○, 송장 마스킹) [view]
- `mobile/auction-detail-full.png` — 경매 매물 상세 — 현재가·입찰 3회·남은 시간·입찰 내역. 가짜 값(응답 모양은 get_auction_status·get_auction_bid_history 기준), 입찰자 user*** [full]
- `mobile/auction-detail-view.png` — 경매 매물 상세 — 현재가·입찰 3회·남은 시간·입찰 내역. 가짜 값(응답 모양은 get_auction_status·get_auction_bid_history 기준), 입찰자 user*** [view]
- `mobile/auction-list-full.png` — 홈 '경매' 탭 — 경매 매물 카드. 종료 시각·현재가·사진은 가짜 값, auction_enabled 는 가짜 응답(true) [full]
- `mobile/auction-list-view.png` — 홈 '경매' 탭 — 경매 매물 카드. 종료 시각·현재가·사진은 가짜 값, auction_enabled 는 가짜 응답(true) [view]
- `mobile/card-detail-full.png` — 카드 상세(시세 정보) — 등급별 시세(RAW·PSA 10)·가격정보 차트·판매 중 매물 4건. 시세 금액·차트는 가짜 값(응답 모양은 앱 코드 기준), 카드명·사진은 가짜(리자몽 베이스 세트) [full]
- `mobile/card-detail-view.png` — 카드 상세(시세 정보) — 등급별 시세(RAW·PSA 10)·가격정보 차트·판매 중 매물 4건. 시세 금액·차트는 가짜 값(응답 모양은 앱 코드 기준), 카드명·사진은 가짜(리자몽 베이스 세트) [view]
- `mobile/escrow-checkout-full.png` — 에스크로 안전결제 화면(결제) — 배송지 입력칸은 placeholder 만, 결제하기는 누르지 않음 [full]
- `mobile/escrow-checkout-view.png` — 에스크로 안전결제 화면(결제) — 배송지 입력칸은 placeholder 만, 결제하기는 누르지 않음 [view]
- `mobile/home-full.png` — 홈(HOT 탭) — 배너·카드 목록. 매물 제목·카드 사진·판매자는 가짜 데이터(복제 DB 시험 행을 실카드 이미지·카드명으로 대체), 배너는 복제 DB 단색 배너 [full]
- `mobile/home-view.png` — 홈(HOT 탭) — 배너·카드 목록. 매물 제목·카드 사진·판매자는 가짜 데이터(복제 DB 시험 행을 실카드 이미지·카드명으로 대체), 배너는 복제 DB 단색 배너 [view]
- `mobile/identity-age-restricted-full.png` — 본인인증 실패 사유 상태(age_restricted) — '만 19세 이상만 이용할 수 있어요.'(앱의 실제 문구, 라우트 파라미터 niceResult=fail) [full]
- `mobile/identity-age-restricted-view.png` — 본인인증 실패 사유 상태(age_restricted) — '만 19세 이상만 이용할 수 있어요.'(앱의 실제 문구, 라우트 파라미터 niceResult=fail) [view]
- `mobile/identity-guide-full.png` — 본인인증 안내(미인증 상태는 프로필 응답 is_verified=false 가짜) — '만 19세' 문구 없음(실제 화면 그대로, BLOCKED.md 4번) [full]
- `mobile/identity-guide-view.png` — 본인인증 안내(미인증 상태는 프로필 응답 is_verified=false 가짜) — '만 19세' 문구 없음(실제 화면 그대로, BLOCKED.md 4번) [view]
- `mobile/listing-detail-full.png` — 매물 상세(구매) — 판매자 user***. 매물·사진 가짜 데이터 [full]
- `mobile/listing-detail-view.png` — 매물 상세(구매) — 판매자 user***. 매물·사진 가짜 데이터 [view]
- `mobile/purchases-full.png` — 내 구매 내역 — 판매자 user***, 매물 가짜 데이터 [full]
- `mobile/purchases-view.png` — 내 구매 내역 — 판매자 user***, 매물 가짜 데이터 [view]
- `mobile/refund-request-full.png` — 환불 요청 모달(거래 상세) — 분쟁에 해당하는 실제 UI(전용 분쟁 화면은 없음). 제출 안 함 [full]
- `mobile/refund-request-view.png` — 환불 요청 모달(거래 상세) — 분쟁에 해당하는 실제 UI(전용 분쟁 화면은 없음). 제출 안 함 [view]
- `mobile/report-modal-full.png` — 신고 모달(매물 상세의 '이 매물 신고하기') — 사유 5종. 제출 안 함 [full]
- `mobile/report-modal-view.png` — 신고 모달(매물 상세의 '이 매물 신고하기') — 사유 5종. 제출 안 함 [view]
- `mobile/sales-full.png` — 내 판매 내역(판매자) — 구매자 user***, 매물 가짜 데이터 [full]
- `mobile/sales-view.png` — 내 판매 내역(판매자) — 구매자 user***, 매물 가짜 데이터 [view]
- `mobile/settlement-full.png` — 정산 내역(판매자) — 수수료 3.5%·최소 600원(feeCalculator 코드 폴백)으로 다시 계산한 가짜 값, 합계도 가짜 [full]
- `mobile/settlement-view.png` — 정산 내역(판매자) — 수수료 3.5%·최소 600원(feeCalculator 코드 폴백)으로 다시 계산한 가짜 값, 합계도 가짜 [view]
- `mobile/tx-progress-full.png` — 거래 상세 — 진행 타임라인(발송 처리까지 완료)·결제 정보·'안전결제 대금 보관 중'. 거래 단계는 가짜 응답, 배송지는 '김○○ · 010-****-**** · 서울특별시 강남구'로 가림, 송장은 마스킹 [full]
- `mobile/tx-progress-view.png` — 거래 상세 — 진행 타임라인(발송 처리까지 완료)·결제 정보·'안전결제 대금 보관 중'. 거래 단계는 가짜 응답, 배송지는 '김○○ · 010-****-**** · 서울특별시 강남구'로 가림, 송장은 마스킹 [view]

## 상태 흐름 (states/<흐름>/<NN>-<설명>.png, 같은 뷰포트·같은 스크롤)
- `states/auction-bid/01-before-bid.png` — 경매 입찰 — 입찰 전 → 입찰창 → 금액 입력(빠른 증액 +10,000) → 제출 후(현재가·입찰 4회). place_bid_v2 가짜 응답, 안쪽 스크롤 0
- `states/auction-bid/02-bid-modal-open.png` — 경매 입찰 — 입찰 전 → 입찰창 → 금액 입력(빠른 증액 +10,000) → 제출 후(현재가·입찰 4회). place_bid_v2 가짜 응답, 안쪽 스크롤 0
- `states/auction-bid/03-amount-entered.png` — 경매 입찰 — 입찰 전 → 입찰창 → 금액 입력(빠른 증액 +10,000) → 제출 후(현재가·입찰 4회). place_bid_v2 가짜 응답, 안쪽 스크롤 0
- `states/auction-bid/04-bid-submitted.png` — 경매 입찰 — 입찰 전 → 입찰창 → 금액 입력(빠른 증액 +10,000) → 제출 후(현재가·입찰 4회). place_bid_v2 가짜 응답, 안쪽 스크롤 0
- `states/checkout-pay/01-bank-transfer-default.png` — 에스크로 결제 화면 수단·약관 선택(결제하기는 누르지 않음), 안쪽 스크롤 540
- `states/checkout-pay/02-card-selected.png` — 에스크로 결제 화면 수단·약관 선택(결제하기는 누르지 않음), 안쪽 스크롤 540
- `states/checkout-pay/03-terms-agreed.png` — 에스크로 결제 화면 수단·약관 선택(결제하기는 누르지 않음), 안쪽 스크롤 540
- `states/tx-timeline/01-order-created.png` — 결제 진행 단계(거래 진행 타임라인) — 단계는 가짜 응답으로 바꿔 거래 상세를 다시 열어 찍음, 안쪽 스크롤 0
- `states/tx-timeline/02-paid-escrow-holding.png` — 결제 진행 단계(거래 진행 타임라인) — 단계는 가짜 응답으로 바꿔 거래 상세를 다시 열어 찍음, 안쪽 스크롤 0
- `states/tx-timeline/03-shipped.png` — 결제 진행 단계(거래 진행 타임라인) — 단계는 가짜 응답으로 바꿔 거래 상세를 다시 열어 찍음, 안쪽 스크롤 0
- `states/tx-timeline/04-purchase-confirmed.png` — 결제 진행 단계(거래 진행 타임라인) — 단계는 가짜 응답으로 바꿔 거래 상세를 다시 열어 찍음, 안쪽 스크롤 0

## 연출 영상 (seq/)
- `seq/bid-place.mp4` — 경매 입찰 연출 6초 — 입찰창 올라옴 → 빠른 증액 → 입찰 → 현재가 95,000→105,000·입찰 3→4회. 방식: page.clock 으로 시간을 멈추고 1/60초씩 runFor + getAnimations currentTime 동기화, 프레임마다 스크린샷(360프레임) → H.264 CRF 12 60fps. 클릭은 좌표(page.mouse), 입찰은 가짜 응답
- `seq/bid-place-first.png` — 위 영상의 첫 프레임
- `seq/bid-place-last.png` — 위 영상의 끝 프레임
- `seq/checkout-pick.mp4` — 결제 수단 전환 연출 4초 — 계좌이체 → 카드 → 안전결제 약관 체크. 같은 방식(240프레임), 결제하기는 누르지 않음
- `seq/checkout-pick-first.png` — 위 영상의 첫 프레임
- `seq/checkout-pick-last.png` — 위 영상의 끝 프레임

## media/ (원본 복사 — 파일 변경 없음)
- `media/appstore/01-home-feed.png` — App Store 제출 스크린샷 원본 1320×2868, 출처 `/home/dev/fordex/store/ios/screenshots/01-home-feed.png`(cmp 동일)
- `media/appstore/02-card-price.png` — App Store 제출 스크린샷 원본 1320×2868, 출처 `/home/dev/fordex/store/ios/screenshots/02-card-price.png`(cmp 동일)
- `media/appstore/03-listing-detail.png` — App Store 제출 스크린샷 원본 1320×2868, 출처 `/home/dev/fordex/store/ios/screenshots/03-listing-detail.png`(cmp 동일)
- `media/appstore/04-portfolio.png` — App Store 제출 스크린샷 원본 1320×2868, 출처 `/home/dev/fordex/store/ios/screenshots/04-portfolio.png`(cmp 동일) (테스트 계정 컬렉션 평가액)
- `media/appstore/05-ai-recognition.png` — App Store 제출 스크린샷 원본 1320×2868, 출처 `/home/dev/fordex/store/ios/screenshots/05-ai-recognition.png`(cmp 동일)
- `media/appstore/06-payment.png` — App Store 제출 스크린샷 원본 1320×2868, 출처 `/home/dev/fordex/store/ios/screenshots/06-payment.png`(cmp 동일) (결제 입력칸은 placeholder 만)
- `media/appstore/07-chat-room.png` — App Store 제출 스크린샷 원본 1320×2868, 출처 `/home/dev/fordex/store/ios/screenshots/07-chat-room.png`(cmp 동일) (거래 번호 앞 8자·송장 6994-****-**** 이미 마스킹)
- `media/appstore/08-search-results.png` — App Store 제출 스크린샷 원본 1320×2868, 출처 `/home/dev/fordex/store/ios/screenshots/08-search-results.png`(cmp 동일)
- `media/logo/app-icon-1024.png` — 로고·아이콘 PNG 원본(SVG 원본은 레포에 없음), 출처 `/home/dev/fordex/assets/icon.png`
- `media/logo/app-icon-ios-1024.png` — 로고·아이콘 PNG 원본(SVG 원본은 레포에 없음), 출처 `/home/dev/fordex/assets/icon-ios.png (iOS 앱 아이콘 1024)`
- `media/logo/favicon.png` — 로고·아이콘 PNG 원본(SVG 원본은 레포에 없음), 출처 `/home/dev/fordex/assets/favicon.png`
- `media/logo/fordex-logo-horizontal.png` — 로고·아이콘 PNG 원본(SVG 원본은 레포에 없음), 출처 `/home/dev/fordex/assets/fordex-logo-horizontal.png`
- `media/logo/fordex-logo-splash.png` — 로고·아이콘 PNG 원본(SVG 원본은 레포에 없음), 출처 `/home/dev/fordex/assets/fordex-logo-splash.png`
- `media/logo/logo-horizontal.png` — 로고·아이콘 PNG 원본(SVG 원본은 레포에 없음), 출처 `/home/dev/fordex/assets/branding/logo-horizontal.png (홈 헤더)`
- `media/logo/logo-vertical.png` — 로고·아이콘 PNG 원본(SVG 원본은 레포에 없음), 출처 `/home/dev/fordex/assets/branding/logo-vertical.png (로그인)`
- `media/logo/play-app-icon-512.png` — 로고·아이콘 PNG 원본(SVG 원본은 레포에 없음), 출처 `/home/dev/fordex/store/play/app-icon-512.png`

## 그 밖
- `brand.json` — 주색 #48DBCB·폰트 Pretendard(file:line)
- `facts.md` — 자막용 사실 10개(근거 file:line)
- `BLOCKED.md` — 못 채운 것·보고할 것
- `RECON.md` — 사전 조사
- `contact.jpg` — 전 캡처 축소 모음
- `capture/*.mjs` — 촬영 스크립트(비밀값 없음)

## OCR 독립 검사(`python3 tools/ocr.py fordex -j 4`, 2026-11-06)
- 50장 중 걸림 1: `mobile/home-view.png` phone 패턴 `19***` — 카드 그림 속 저작권 줄 "© 1995, 96, 98, 99 Nintendo, Creatures, GAMEFREAK"(OCR 이 "1995.9698"로 읽음)이며 전화번호가 아니다 → 오탐으로 판정(카드 이미지는 images.pokemontcg.io 공개 이미지).
- 별도로 view·states·seq 프레임 34장 + full 전체를 tesseract 로 읽어 `e2e|qa###|replica|복제|시험|합성|admin2`·이메일·휴대폰 번호를 찾았고 0건이었다.
