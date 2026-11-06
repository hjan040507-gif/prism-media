# fordex 사전 조사 (RECON) — 2026-11-05 23:5xZ

읽기 전용 조사(코드 읽기 + 운영 GET/curl + iTunes lookup GET). 서버 기동·빌드·브라우저·DB 쿼리 없음. `/home/dev/fordex` 는 읽기만 했고(미커밋 8개는 docs/scripts 뿐 — `src/`·`App.tsx` 변경 0), `.env.local` 은 열지 않았다. 비밀값은 쓰지 않았다(이름·파일 경로만).

## 0. 결론 먼저
1. **웹은 Expo(React Native Web) 단일 SPA, 별도 관리자 웹 없음.** 관리자 화면은 같은 앱의 `MY → 설정 → 어드민` 섹션이다(`src/screens/mypage/SettingsScreen.tsx:125`). 라우트 URL 이 없다(React Navigation 에 `linking` 없음, `src/navigation/RootNavigator.tsx:151`) → 화면은 탭·버튼 클릭이나 navigation 객체 호출로만 간다.
2. **운영 웹 https://fordex.co.kr = 200**(Vercel, 정적 SPA). 그러나 **비로그인은 로그인 화면만** 나온다(매물 조회 RLS `42501`, `.claude/skills/run-fordex/SKILL.md` §5). 로그인 필요한 전 화면을 운영 DB 쓰기 없이 찍으려면 레포에 **로컬 복제 스택(replica)** 이 이미 있고 도커가 지금 떠 있다(7절).
3. **관리자 화면 실제 수 = 21개(+ 설정 인라인 토글 3개).** 사용자가 아는 18개는 옛 문서 수치(`docs/step253-survey.md:439`). 3절.
4. **명세의 '관리자 대시보드'·'분쟁 중재'는 같은 이름의 화면이 없다**(대체 화면 있음, 2절).
5. **App Store 제출 스크린샷 원본 있음**: `/home/dev/fordex/store/ios/screenshots/` 8장 1320×2868, git 추적됨(HEAD 포함), 파일명이 현재 스토어 등록분(iTunes lookup `screenshotUrls` 8개)과 일치. 4절.
6. **데스크톱 1440 에서 앱은 모바일 UI 가 가로로 늘어난 모양**(max-width 래퍼 없음; 기존 캡처 `docs/e2e-runs/20261026-133820-p3408423/shots/ac-A-18-list-1440.png` 를 직접 확인). 관리자 데스크톱 컷의 품질 판단이 필요(결정 필요 A).

## 1. 스택·실행
- 프레임워크: Expo SDK 54 · React Native 0.81.5 · react-native-web 0.21 · React 19.1 · TypeScript · React Navigation 7 (`package.json`, `README.md:18-19` "별도 Next.js 없음"). 패키지 매니저 npm(`package-lock.json`).
- 웹 빌드: `npx expo export --platform web --clear` → `dist/`(`vercel.json:2-3`). 서빙은 `node .claude/skills/run-fordex/serve.mjs <포트> <dist 폴더>`(SPA 폴백·`/support`·`/privacy` 리라이트 흉내, `serve.mjs:7-8`). `app.json` web.output = "single".
- **이미 빌드된 웹 번들**: `/home/dev/fordex/dist-replica-after/`(2026-10-26 04:25, 복제 스택용), `dist-replica-main/`, `dist/`(10-16, 운영 env 로 빌드). `dist-replica-after` 번들은 Supabase URL 이 `http://127.0.0.1:54400`(복제 게이트웨이)으로 박혀 있다(번들 grep 1건 확인) = 운영 DB 로 안 나간다. 마지막 `src/` 커밋(dd543d71 스킨 관리 상품ID 칸·7e7d66fc/a4ca69fe 관리자 내보내기, 10-26)보다 빌드가 앞설 수 있어 그 두 관리자 화면만 HEAD 와 다를 수 있음(미검증). 새 빌드는 필수 아님.
- 운영 웹 URL: https://fordex.co.kr (200, `server: Vercel`, 마지막 수정 2026-11-05 10:51Z). `www.` → 307 → apex. `/admin` 도 200 이지만 같은 index.html(라우트 아님). 정적 페이지 `/support`·`/privacy`·`/account-deletion` 200(`public/*.html`).
- 관리자 웹: **없음**(위 0-1). 프레임워크 동일(Expo web). 진입 = 로그인한 `profiles.is_admin=true` 계정의 설정 화면(`SettingsScreen.tsx:125`) + 각 화면이 진입 시 `is_admin` 재조회(`docs/handover-admin.md:31`).
- 백엔드: Supabase 프로젝트 ref `gwezmmnynoiqhzhgzuew`(`README.md:7`) — Postgres(RLS)·Auth(이메일+카카오·네이버·애플)·Storage·Edge Functions(Deno) 폴더 41개(`supabase/functions`, `_shared` 제외; README 의 "35" 는 옛 수치)·마이그레이션 419개(`supabase/migrations`, README 의 "296" 은 옛 수치). 결제 = 나이스페이먼츠(`README.md:26`).
- env 이름(공개 `EXPO_PUBLIC_*`, 번들에 인라인, `src/constants/env.ts`): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_APP_URL`, `EXPO_PUBLIC_PHONE_VERIFICATION_ENABLED`, `EXPO_PUBLIC_NAVER_CLIENT_ID`, `EXPO_PUBLIC_TOSS_CLIENT_KEY`, `EXPO_PUBLIC_PAYPLE_CLIENT_KEY`·`_CST_ID`·`_ENV`, (레거시·코드 미참조) `EXPO_PUBLIC_REVIEW_ACCOUNT_ID`·`_PW`(`docs/handover-env.md:71`). 서버·스크립트 전용(`.env.example`): `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`, `VERCEL_TOKEN`, `EXPO_TOKEN`, `EBAY_APP_ID`, `EBAY_CLIENT_SECRET`, `KAKAO_REST_API_KEY`, `KAKAO_CLIENT_SECRET`, `ADMIN_EMAIL`. 복제 환경 키는 `replica/.env.replica`(600, gitignore, `replica/build-web.sh:12`).
- **로컬 실행 시 DB 대상**: `.env.local` 로 빌드하면 **운영 Supabase**(스테이징 없음, `.claude/skills/run-fordex/SKILL.md:7-9`). 복제 빌드(`replica/build-web.sh`)는 `EXPO_NO_DOTENV=1` + `127.0.0.1:54400` 이라 운영과 분리.

## 2. 명세 항목 ↔ 실제 화면
공통: 앱 진입은 `RootNavigator.tsx:153-163` — 세션 없음 → `Auth`(SignIn·SignUp·ForgotPassword, `AuthStack.tsx:15-17`), 정지 계정 → Suspended, 닉네임 없음 → NicknameSetup, 그 외 → `Main` 탭. **아래 모든 화면이 로그인 필요.** 하단 탭: 홈·검색·상품등록·MY컬렉션·MY(채팅 탭은 숨김, `MainTab.tsx:84-115`). 탭 testID `tab-home|tab-search|tab-addcard|tab-portfolio|tab-mypage`.

### 모바일(390×844)
| 명세 | 실제 이름 | 라우트·파일:줄 | 필요한 데이터 · 비고 |
|---|---|---|---|
| 홈 | `Home` (HOT 탭 기본) | `HomeStack.tsx:51` → `src/screens/home/HomeScreen.tsx:46-80`, 탭 `:27-33` ('HOT','매물','경매','가격정보','컬렉션 둘러보기','스킨샵'), HOT `components/home/tabs/HotTab.tsx` | 배너(`useAdBanners`)·매물 목록·`FeaturedPricesStrip`. 하단 푸터(사업자 정보) `HotTab.tsx:394` → **가림 필요**. 로그인 직후 `PopupAd`·약관 게이트가 뜰 수 있음(`RootNavigator.tsx:167-171`) |
| 카드 상세(시세 정보) | `CardDetail` | `HomeStack.tsx:61`·`SearchStack.tsx:56` → `screens/card/CardDetailScreen.tsx`('등급별 시세' `:161`, '가격정보'(차트) `:186`), 훅 `hooks/useCard.ts` | `cards`·`price_history`/`price_daily`·RPC `card_grade_price`·`get_card_price_daily`. 진입 = 홈 '가격정보' 탭 또는 검색 결과/매물 상세의 카드 링크 |
| 매물 상세(구매) | `ListingDetail` | `HomeStack.tsx:56` → `screens/card/ListingDetailScreen.tsx:66`, 하단바 `components/listing/BottomActionBar.tsx` | `listings` + 판매자 프로필(닉네임·후기) → 가림. 구매하기 → Payment |
| 경매 | 홈 '경매' 탭(`AuctionTab.tsx`) + 경매 매물의 `ListingDetail` + 입찰창 `BidModal` + `AuctionStatusBox`·`BidHistorySection`·`CountdownTimer` | `HomeScreen.tsx:29-31`, `components/auction/*` | **탭은 `auction_enabled`(app_settings, RPC `is_auction_enabled`)가 true 일 때만 보임**(`hooks/useAuctionEnabled.ts`, 코드 기본 false). 운영값 = true(`docs/qa/fordex-qa-2026-10.md:56`, `PROGRESS.md:1627`). **복제 DB 기본 false**(`replica/e2e/scenarios/b14-auction-live-bid.mjs:8` 가 임시로 켬). 입찰은 본인인증 필요(`ListingDetailScreen.tsx:487-494`). 복제 시드에 경매 매물 없음 |
| 거래 진행 단계 | `TransactionDetail` 의 `Timeline`(4단계: 주문 생성 → 결제 완료 → 발송 처리 → 구매확정) + 배지(`mypage/txBadge.ts:31-70`: 결제 대기·결제 완료·발송 대기·배송 중·거래 완료·환불 요청 등) | `MyPageStack.tsx:87` → `screens/mypage/TransactionDetailScreen.tsx:137`, `Timeline :1119-1146`, `RefundTimeline :1179`(반품 있으면 5단계/없으면 3단계) | `transactions`+`refunds` 임베드. 진입 = MY → 내 구매 내역(`Purchases`) → 거래 선택. 구매자·판매자 시점 둘 다 |
| 에스크로 안전결제 | `Payment`(결제 화면 + '안전결제 약관에 동의합니다') + 거래 상세의 "안전결제: 대금 보관 중"(`TransactionDetailScreen.tsx:496-503`) | `MyPageStack.tsx:92` → `screens/payment/PaymentScreen.tsx:96`, 약관 줄 `:1018`, 단계 `phase`: form→opening→(popup/webview)→confirming→done(`:163`) | 거래 모드가 `escrow` 여야 함(`hooks/useTradeMode.ts`, 직거래면 결제 차단 `PaymentScreen.tsx:130,758`). 결제하기 버튼 = 주문 생성 RPC → `nice-pay-prepare` EF → 현재 탭을 NICE 결제창으로 `document.write` 교체(`:420-424`). **버튼은 누르지 않거나 전부 가로챈다** |
| 구매확정·정산 내역 | 구매확정 버튼(거래 상세 `title="구매확정"` `:967`, RPC `confirm_delivery` `:423`) + **정산 내역(판매자)** `Settlement`(`MyPageScreen.tsx:66` 퀵메뉴 '정산 내역') + 판매 내역 `Sales` | `MyPageStack.tsx:77` → `screens/mypage/SettlementScreen.tsx:107`, `SalesScreen.tsx:61` | RPC `get_transaction_settlement`(판매자 전용). 정산 합계·금액은 영업 수치 → **가짜 값 치환**(명세 가림 규칙) |
| 신고·분쟁 | 신고: `ReportModal`(매물 상세·프로필·채팅·거래). 분쟁에 해당 = **환불 요청**(`request_refund`) + 거래 상태 "분쟁 확인 중"(`escrow_status='disputed'`, `TransactionDetailScreen.tsx:503`) | `components/report/ReportModal.tsx:36`(사유 5종 `constants/reports.ts:2-8`), 거래 안 자체 `ReportModal :1227`, 환불 UI `TransactionDetailScreen.tsx:535-` | **'분쟁' 전용 화면은 없다.** 촬영은 신고 모달 + 환불 요청/환불 타임라인으로 대체 |
| 본인인증(만 19세) 안내 | `PhoneVerification` 라우트(키 이름만 옛것)의 컴포넌트 = `IdentityVerificationScreen`('안전한 거래를 위해 본인인증이 필요해요', 안내 3줄 `:66-70`) + 게이트 모달 `VerifyRequiredModal` | `MyPageStack.tsx:122-123` → `screens/auth/IdentityVerificationScreen.tsx:306-320` | **이 화면에 "만 19세" 문구는 없다.** 19세는 ① 실패 사유 문구 `age_restricted`("만 19세 이상만 이용할 수 있어요", `:49`) ② 약관 본문(`constants/terms/serviceBuyer.ts:27`, `serviceSeller.ts:25`, `service.ts:44`, `privacy.ts:144`)에만 나온다. 가입 시 약관·생년월일 게이트는 `TermsConsentGate`(만 14세 미만 서버 거절). 시작 버튼 = EF `nice-start`(`:141`) → 가로채기 |

### 관리자(데스크톱 1440×900) — 같은 앱, `is_admin` 계정
| 명세 | 실제 이름 | 라우트·파일:줄 | 비고 |
|---|---|---|---|
| 대시보드 | **없음** | — | 대체 후보: `AdminTransactions` 상단 합계(건수·거래액·수수료, `screens/admin/AdminTransactionsScreen.tsx:114`), `AdminRevenue`('수수료 정산': 누적 순수익·예치금 잔액·출금 가능액, `AdminRevenueScreen.tsx:1-8,122`) — 후자는 예치금 출금 버튼이 있어 **누르지 말 것** |
| 거래·정산 관리 | `AdminTransactions`(거래 관리) · `AdminPayouts`(지급/정산 관리) · `AdminRevenue`(수수료 정산) | `MyPageStack.tsx:177,182,187`; `SettingsScreen.tsx:141-143` | 거래 목록·상태 필터·합계, 지급 대기/보류/요청됨/완료. 결제취소·환불 모달은 실 PG 취소 경로 → 열람만 |
| 분쟁 중재 | **없음**(전용 화면 없음) | — | 대체: `AdminTransactions` → `AdminRefundModal`('환불 상태 이력·전이 대행' `components/AdminRefundModal.tsx:84,238`), `AdminEscrowDetailModal`(`:81`), 미결제 경매 탭 |
| 신고 처리 | `AdminReports`(신고 관리) | `MyPageStack.tsx:147`; `AdminReportsScreen.tsx:71` | 신고 목록(대기 우선)·처리 메모. 신고자·대상 닉네임 가림 |
| 그 밖 | 회원(`AdminMembers`)·매물(`AdminListings`)·고객문의(`AdminInquiries`) 등 3절 전체 | | 회원 화면은 이메일·실명·전화 노출 → 가림 대상 1순위 |

### 상태 흐름
| 흐름 | 가능한 단계 | 근거 |
|---|---|---|
| 결제 진행 단계 | (a) 결제 화면 form → (b) 결제하기 누름 `opening`(가로챈 RPC·EF 응답을 늦춰 '결제창을 여는 중' 연출) → (c) 승인 완료 후 거래 상세 타임라인이 '결제 완료'로 바뀜 → 발송 → 구매확정(타임라인 4단계 점이 차례로 채워짐) | `PaymentScreen.tsx:163,369-424`, `TransactionDetailScreen.tsx:1119-1146`. 웹은 NICE 창으로 **페이지가 통째로 이동**하므로 중간 NICE 화면은 못 찍는다(가로채기 필수). 복제 환경은 NICE 승인을 목 서버가 받아 끝까지 진행(`replica/seed.mjs:3-9`, 헬퍼 `replica/e2e/bs-lib.mjs` `buySingle`·`payViaNice`) |
| 경매 입찰 | 현재가(`AuctionStatusBox`) → 입찰 버튼 → `BidModal`(빠른 증액 4칸, `utils/bidIncrement.ts:7-10`) → 제출 → 현재가·입찰 내역(`BidHistorySection`) 갱신(Realtime `hooks/useListing.ts:74`) | `components/auction/BidModal.tsx:46,133`, `hooks/useAuctionStatus.ts:55`. 최소 증액 구간: 1만 미만 500 / 10만 미만 1,000 / 100만 미만 5,000 / 그 이상 10,000(`bidIncrement.ts:1-6`). 복제 e2e 가 두 구매자 컨텍스트로 실시간 갱신을 이미 시험(`b14-auction-live-bid.mjs`) |

## 3. 관리자 화면 수 — 직접 센 결과
- **화면(라우트) 21개** = `MyPageStackParamList` 의 `Admin*` 21개 = `MyPageStack.tsx` 의 `name="Admin…"` 21개(줄 127·132·137·142·147·152·157·162·167·172·177·182·187·192·202·207·212·217·222·227·232) = `src/screens/admin/*.tsx` 파일 21개 = 설정 메뉴 `navigate('Admin…')` 21줄(`SettingsScreen.tsx:131-152`).
- 단 `마케팅 알림`(`AdminMarketingPush`)은 `flags.marketing_push` 가 켜져야 메뉴에 보인다(`SettingsScreen.tsx:145`, 기본 false `hooks/useFeatureFlags.ts:20`) → **메뉴에 항상 보이는 화면은 20개**, 플래그가 켜지면 21개. 운영 플래그값은 쿼리 금지라 **미확인**.
- 같은 '어드민' 섹션 맨 위에 **인라인 토글 3개**(화면 아님, **누르면 운영 설정이 바뀜**): 거래 모드 전환(`:128`), NICE 계좌이체 ON/OFF(`:129`), NICE 가상계좌 ON/OFF(`:130`). 섹션 항목 총 = 3 + 21 = 24(마케팅 플래그 꺼짐이면 23).
- 목록(메뉴 라벨 · 라우트 · SettingsScreen 줄): 카드 등록 `AdminCreateCard` 131 · 카테고리 관리 `AdminCategories` 132 · 구독 설정 `AdminSubscriptions` 133 · 광고 배너 `AdminBanners` 134 · 신고 관리 `AdminReports` 135 · 후기 관리 `AdminReviews` 136 · 회원 관리 `AdminMembers` 137 · 매물 관리 `AdminListings` 138 · 구독 관리 `AdminSubscribers` 139 · 스킨구매 관리 `AdminSkinPurchases` 140 · 거래 관리 `AdminTransactions` 141 · 지급/정산 관리 `AdminPayouts` 142 · 수수료 정산 `AdminRevenue` 143 · 마케팅 알림 `AdminMarketingPush` 145(플래그) · 스킨 관리 `AdminSkins` 146 · 쿠폰 관리 `AdminCoupons` 147 · 이벤트 관리 `AdminEvents` 148 · 고객문의 관리 `AdminInquiries` 149 · 공지사항 관리 `AdminNotices` 150 · 데이터 내보내기 `AdminExport` 151 · 시세 TOP 3 `AdminFeaturedPrices` 152.
- "18개"의 출처: `docs/step253-survey.md:439`("Admin*Screen.tsx(18개)"), `docs/step242-push-notification-audit.md:264`("어드민 18화면"). `docs/handover-admin.md:45,177` 은 "토글 3 + 화면 17"(더 옛 수치). 이후 스킨 관리·쿠폰·이벤트 등이 붙어 21. **자막에는 "21개"(또는 "20개 이상")와 근거 줄을 쓸 것.** 판정 기준 = 현재 HEAD(281aab73) 작업 트리, `src/` 무변경.

## 4. App Store 스크린샷 원본
- **`/home/dev/fordex/store/ios/screenshots/`** — 8장, 모두 **1320×2868 PNG**(iPhone 6.9형), 합 약 9.9MB, 개당 0.25~2.8MB(95MB 미만). 파일: `01-home-feed` `02-card-price` `03-listing-detail` `04-portfolio` `05-ai-recognition` `06-payment` `07-chat-room` `08-search-results`(.png). git 추적(`git ls-files store/ios/screenshots`), 2026-08-25 제작. `scripts/step102-asc-screenshots.mjs:1-7` 이 이 폴더 8장을 ASC `APP_IPHONE_67` 세트로 업로드했고, 스토어 등록 파일명(iTunes lookup `screenshotUrls` 8개: 01-home-feed.png … 08-search-results.png)과 일치.
- 사본(내용 동일, `cmp` 확인): `/home/dev/fordex-clean/store/ios/screenshots/`(8장). 그 밖: `/home/dev/fordex/store/play/screenshots/` 8장 1080×1920(Play용), `store/play/app-icon-512.png`, `store/play/feature-graphic-1024x500.png`, `docs/step292/shots/pro-review-1290x2796.png`, `docs/step258-iap/screens{,-native}/` 스킨 상점 컷 1290×2796 각 7~8장. `/home/dev/fordex-store-archive/` 는 PDF 4개뿐(이미지 0), `fordex-outputs`·`fordex-project`·`fordex-private` 등엔 이미지 없음.
- 개인정보 메모(8장 직접 훑음): 이름·전화·주소·계좌 노출 **없음**. 결제 컷 `06` 의 입력칸은 placeholder 만(홍길동·010-1234-5678·101동 1502호). `07-chat-room` 에 카드명 "Crabominable AR"·거래 번호 앞 8자(`1040d252`)·송장 `6994-****-****`(이미 마스킹). `04-portfolio` 에 컬렉션 평가액(₩89,118,968 등, 테스트 계정 값). `01-home-feed` 상단 알림 배지 35. 닉네임·이메일은 보이지 않음 → 그대로 media/ 에 넣어도 PII 는 없음.
- 현재 스토어 등록 정보(iTunes lookup, 2026-11-05 GET): 앱명 "FORDEX 포덱스", **버전 1.0.3**, 최초 출시 **2026-09-08**, 현재 버전 게시 **2026-10-26**, bundleId `kr.co.fordex.app`, 카테고리 쇼핑, iOS 15.1+. 스토어에 걸린 건 위 8장(레포 원본이 더 좋음).
- 로고·아이콘 원본은 10절.

## 5. 테스트·관리자 계정 (값은 적지 않음)
- 로그인 방식: **이메일+비밀번호**(Supabase Auth `signInWithPassword`, `contexts/AuthContext.tsx:201-202`) 외에 카카오·네이버(웹 리다이렉트)·애플(iOS 네이티브 전용)(`screens/auth/SignInScreen.tsx`). 문자 로그인 없음. 본인인증은 가입 뒤 별도 단계(NICE).
- **복제 환경(권장)**: 합성 계정 5개 `buyer`·`buyer2`·`seller`·`seller2`·`admin`(전부 `*@replica.test`), 정의 = `replica/seed.mjs`(비밀번호 상수 `:22`, 매물·거래 `:114-120,183-216`), 결과 id·이메일 = `replica/seed-out.json`(`users`), 같은 상수가 `replica/e2e/lib.mjs:26`·`bs-lib.mjs:13`. e2e 의 세션 주입 키 = `localStorage['sb-127-auth-token']`(`lib.mjs:73-75`). 로컬 전용 합성값이라 운영과 무관하나 이 문서에는 옮기지 않음.
- 운영 심사용 계정(관리자 아님): 이메일 3개는 `/home/dev/fordex-private/handover-admin-accounts.md`(600), 생성 기록 `docs/step68-review-accounts.md`, 비밀번호 파일 이름만 `~/.secrets/step161-review-pw.txt`·`~/.secrets/step259-apple-review-pw.txt`(600). 본인인증 완료 상태(`manual-review`)라 입찰·결제 화면까지 진입 가능(`step68-review-accounts.md` §0).
- **운영 관리자 계정**: `is_admin=true` 는 3개(개발사 마스터·내부 테스트·네이버 소셜 테스트, `docs/handover-admin.md:52-62`), 비밀번호가 이 서버에 문서화돼 있지 않다. 심사용·발주자 계정은 어드민이 아니다(`handover-admin.md:62-69`). → **관리자 컷은 운영에서 못 찍고 복제 `admin` 계정으로만 가능.**
- 새 계정 금지 규칙: 이미 있는 `*@replica.test` 5개(매물 9·거래 4·채팅 1)로 충분 — 더 만들 필요 없음.

## 6. 쓰기 위험 (운영 대상일 때 가로챌 목록)
모든 호출이 브라우저 → Supabase 직접(PostgREST `POST /rest/v1/rpc/<함수>`·`/rest/v1/<표>`, Auth, Storage, Functions `POST /functions/v1/<이름>`). 서버 렌더링 없음 → **GET 렌더 중 서버 쓰기는 없다**(정적 SPA). 단 화면을 여는 순간 클라이언트가 쓰는 곳이 있음.
- **결제(NICE)**: RPC `create_payment_order_v3`(`src/lib/payment.ts:246`)·`create_bundle_payment_order_v2`(`:310`)·`create_auction_payment_order`(`:269`) = **거래 행 생성**; EF `nice-pay-prepare` POST(`:296,333`) 후 브라우저가 NICE JS 로 이동(`document.write`, `PaymentScreen.tsx:420-424`); NICE 가 EF `nice-pay-return` 으로 승인 POST; 취소 EF `nice-pay-cancel`(관리자). Payple·Toss 경로(`payple-create-payment`·`payple-confirm`·`toss-*`)는 신규 개시 차단(`constants/features.ts` `PAYPLE_NEW_PAYMENT_ENABLED=false`)이나 코드는 남음.
- **본인인증**: EF `nice-start` POST(`IdentityVerificationScreen.tsx:141`), 콜백 EF `nice-callback`; 웹은 `beginNiceWebAuth`(`lib/nice-web-return.ts`)로 페이지 이동.
- **지급·정산(관리자)**: RPC `admin_requeue_payout`·`admin_record_manual_payout`·`admin_resolve_partial_cancel`, EF `nice-payout-cancel`·`nice-payout-submall`·`nice-payout-balance`·`nice-fordex-withdraw`(수수료 정산 화면의 예치금 출금), `nice-pay-cancel`(결제취소 모달). 판매자 정산계좌 저장 RPC `upsert_my_payout_account`.
- **입찰**: RPC `place_bid_v2`(`components/auction/BidModal.tsx:133`).
- **신고**: `POST /rest/v1/reports`(`components/report/ReportModal.tsx:53`, 거래 안 모달도 동일). **환불**: `request_refund`·`approve_refund`·`reject_refund`·`confirm_return_received`. **구매확정**: `confirm_delivery`·`confirm_bundle_delivery`(`TransactionDetailScreen.tsx:422-423`).
- **읽기인데 POST(RPC)** — 통과시켜야 화면이 그려지는 것: `get_trade_mode`·`is_auction_enabled`·`get_auction_status`·`get_feature_flags`·`get_my_bid_listings`·`search_cards`·`search_listings`·`autocomplete_*`·`card_grade_price`·`get_card_price_daily`·`get_featured_prices`·`get_transaction_settlement`·`get_my_payout_account`·`admin_list_transactions`·`admin_escrow_detail`·`admin_list_*` 등. **"POST 전부 차단" 규칙을 그대로 적용하면 화면이 안 그려진다 → 읽기 RPC 허용 목록 필요.**
- **화면을 열기만 해도 나가는 쓰기**: 채팅방 진입 `mark_messages_read`(`lib/chat.ts:224`), 알림 화면 `is_read` PATCH(`NotificationsScreen.tsx:98,117`), 공지 상세 `increment_notice_view`(`lib/notices.ts:69`), MY컬렉션 `refresh_portfolio_items_value`(`hooks/usePortfolio.ts:112`), 즐겨찾기 `toggle_favorite`, 약관 게이트 `accept_required_terms`·`record_consent`. 운영 세션을 쓰면 **Auth 토큰 갱신 `POST /auth/v1/token`**(만료 임박 시)도 나간다.
- **Realtime(WebSocket `/realtime/v1/websocket`)**: `useListing.ts:74`·`useActiveBids.ts:86`·`useMyAuctions.ts:137`·`useChats.ts:135`·`useTotalUnreadCount.ts:63`·`useTransactions.ts:123`·`TransactionDetailScreen.tsx:321`·`useUnreadNotifications.ts:35`·`NotificationsScreen.tsx:63`(postgres_changes 구독) + Presence `usePresenceViewers.ts:33`(매물 상세 열람자 수; DB 쓰기 아님). 입찰 갱신 연출은 Realtime 으로 오므로 `page.routeWebSocket` 또는 복제 스택 사용.
- 관리자 인라인 토글(거래 모드·NICE 수단)은 `app_settings` 를 바꾼다(`SettingsScreen.tsx:50-80`) — **절대 누르지 않는다.** '데이터 내보내기'는 민감정보 포함 옵션이 있음(`docs/handover-admin.md` §5).

## 7. 가짜 데이터로 찍는 방법
**클라이언트가 Supabase 를 직접 부르는 정적 SPA** → 길이 둘(+ 비권장 하나).
- **A안(권장) — 기존 로컬 복제 스택(replica)**: `/home/dev/fordex/replica/` = 운영과 분리된 로컬 Supabase 스택 + 합성 시드(운영 데이터 0, `replica/README.md:1-3`). **도커 컨테이너 `fordex-replica3` 8개가 12일째 실행 중**(kong **54321**·db **54322**·inbucket **54324**). 필요한 것:
  1. 게이트웨이 `node replica/gateway.mjs`(포트 **54400**, 현재 비어 있음; 빌드된 번들이 이 주소로 박혀 있어 포트 고정) — `/functions/v1/*` 는 EF 러너, 그 밖은 kong 으로 프록시, WebSocket 포함(`gateway.mjs:48`). 읽기 화면은 EF 러너·목 서버 없이도 된다. 결제 EF 까지 실제처럼 돌리려면 `replica/services.sh start`(목 `replica/mock/server.mjs`·EF 러너 `replica/ef/run.mjs`)가 필요하나 **격리 가드 `replica/guard.sh verify` 통과가 선행**(크론이 운영 EF URL 을 못 부르게, `README.md:28-31`). 현재 가드 상태는 실행 전이라 **미확인**.
  2. 웹 서빙: `node .claude/skills/run-fordex/serve.mjs <빈 포트> dist-replica-after`(정적 파일만 읽음; 번들을 prism-media 쪽 임시 폴더로 복사해 쓰면 작업 폴더 무변경).
  3. 로그인: 5절 계정 → `POST /auth/v1/token?grant_type=password`(게이트웨이) → 세션 JSON 을 `localStorage['sb-127-auth-token']` 에 `addInitScript` 로 주입(`replica/e2e/lib.mjs:73-75`). 외부 호스트는 `context.route('**/*')` 로 abort(`lib.mjs:68-71` 같은 패턴).
  4. 화면 이동: URL 라우트가 없으므로 e2e 의 `nav()` 헬퍼(React fiber 에서 navigation 객체를 찾아 `navigate('Main',{screen:'MyPage',params:{screen:'AdminPayouts',initial:false}})`, `replica/e2e/lib.mjs:110-143`)를 그대로 쓰면 어드민 21화면·거래 상세·결제 화면에 직접 간다.
  - 한계: ① **시드 카드 사진은 단색+줄무늬 PNG**(`replica/seed.mjs:44-60`)이고 카드 5종(토게데마루·제르네아스·메가갸루무사·피카츄·리자몽)이라 "실제 서비스 픽셀"에 못 미침 → 카드 이미지를 `page.route` 로 실카드 이미지로 바꿔치기하거나 복제 DB 에 사진을 더 넣는 선택이 필요(후자는 복제 DB 쓰기, 결정 필요 B). ② 경매 매물·`auction_enabled`=true 가 시드에 없음 → e2e `setTemp`/`mkAuction`(복제 DB 쓰기, `bs-lib.mjs`)으로 만들어야 함. 인라인 SQL DELETE 는 danger-guard 에 막혀 정리 불가(복제 DB 에는 e2e 잔여 계정이 이미 있음). ③ 시드 생성 2026-10-12 이후 e2e 가 12일간 만진 상태 — 현재 DB 내용은 **미확인**(쿼리 금지, 화면을 열어 확인).
- **B안 — 운영 번들 + 전부 가짜 응답**: https://fordex.co.kr 번들을 열고 세션을 `localStorage['sb-gwezmmnynoiqhzhgzuew-auth-token']` 에 가짜로 주입, `page.route('**/rest/v1/**'|'**/auth/v1/**'|'**/functions/v1/**')` 로 전부 직접 만든 응답으로 채움(`page.routeWebSocket` 로 Realtime 도). 운영 접촉 0 이 가능하나 화면마다 PostgREST select·embed 모양을 맞춰야 해 작업량이 큼. 선례 `scripts/step288/web-back-verify.mjs:17-71`(단 service_role 로 세션 발급 — 쓰지 않는다).
- **C안(비권장) — 운영 심사용 계정으로 읽기만**: 실 시세·실 이미지 장점. 단점: 로그인 자체가 운영 Auth 쓰기(`last_sign_in_at`), 실회원 닉네임·거래가 섞여 가림 누락 위험, 관리자 화면 불가, Realtime·`mark_*` 계열 가로채기 필요.
- 데모/mock 모드: **없음**(앱 내 데모 스위치 없음). `EXPO_PUBLIC_PHONE_VERIFICATION_ENABLED` 는 문자 인증 UI 스위치(복제 빌드는 false).

## 8. 가림 대상
- 닉네임: 판매자 정보(`components/listing/SellerInfoSection.tsx`)·채팅 상대·프로필·후기·관리자 회원/신고/거래 목록. 경매 입찰자는 앱이 이미 부분 마스킹(`utils/masking.ts:3` `maskNickname`, `AuctionStatusBox` 사용) — 그래도 'user***' 규칙으로 통일.
- 주소·연락처: 결제 화면 배송지(수령인·휴대폰·우편번호·주소·메모, `PaymentScreen.tsx` 폼), 거래 상세 배송 정보, 관리자 거래/회원 화면(실명·전화·이메일, `docs/handover-admin.md:205-208`), 채팅 안 송장·연락처(앱은 에스크로 모드에서 연락처를 마스킹).
- 계좌: `PayoutAccount`(정산 계좌, `screens/mypage/PayoutAccountScreen.tsx`), 관리자 지급/정산·데이터 내보내기(민감정보 옵션).
- **머리·꼬리 사업자정보**: `src/constants/business.ts:10-19` — 상호·대표자·사업자등록번호·통신판매업신고번호·**사업장 주소**·고객센터 전화·이메일. 렌더 위치: 홈 HOT 탭 하단 `HomeFooter`(`HotTab.tsx:394`), 로그인·회원가입·비밀번호 찾기·재설정 화면 하단 `BusinessInfoFooter`(`SignInScreen.tsx:18` 등). 대표번호·이메일·주소 행은 DOM 에서 지울 것(명세: 머리·꼬리 연락처 반려 이력).
- 화면 속 도메인·URL: 설정의 약관·support/privacy 링크 글자, 채팅 안내 문구 속 도메인이 있으면 지움. 배너·공지 이미지 안 글자는 DOM 으로 못 지움(배너 내용 확인 필요).
- QR: **앱에 QR 코드 없음**(`grep qrcode` 0건).
- 저장 직전 `pii_scan` 정규식에 걸릴 것: 이메일 형식 문자열, 전화 번호 형식(결제 화면 placeholder `010-1234-5678` 포함), 송장번호.

## 9. 사실 후보 (자막용) — 근거 file:line, 없으면 미확인
1. **관리자 화면 21개(+ 토글 3)** — `src/navigation/MyPageStack.tsx:127-232`, `src/screens/mypage/SettingsScreen.tsx:131-152`(3절). 마케팅 알림은 플래그 시에만 노출(`:145`).
2. **거래 진행 4단계**(주문 생성 → 결제 완료 → 발송 처리 → 구매확정) — `TransactionDetailScreen.tsx:1119-1146`(5번째 '에스크로 해제' 단계는 삭제, 주석 `:1144`). 환불은 반품 포함 5단계·미발송 3단계(`:1173-1177`).
3. **수수료 3.5%, 건당 최소 600원, 판매자 단일 요율**(PRO 할인 폐지) — `src/utils/feeCalculator.ts:1-8`(코드 폴백·표시용; 실제 부과값은 서버 `subscription_settings.fee_rate_percent` 가 SSOT → 라이브 확인은 쿼리 금지라 **미확인**). 프로모션 표기 "정상 8% → 3.5% 이내"(`feeCalculator.ts:27-28`)는 표시용이라 자막에 쓸 때 주의. (`docs/handover-admin.md` 의 "PRO 3.0%"는 옛 기록 — 코드 주석 `feeCalculator.ts:2` 가 PRO 할인 폐지를 말함.)
4. **에스크로 방식**: 결제 대금을 구매확정 전까지 보관 → 구매자 구매확정(또는 송장 등록 7일 후 자동 확정) → **구매확정일로부터 7영업일 후 판매대금 지급 요청**(NICE 메일 확정 계정은 3영업일) — `src/constants/notices.ts:74,81-82`, 앱스토어 설명 "결제 대금은 구매확정 전까지 안전하게 보관"(iTunes lookup). 결제·에스크로·지급대행은 나이스페이먼츠(`README.md:26`). 직거래는 정책으로 금지(스토어 설명)이나 코드에 `direct` 모드 스위치는 남아 있음(`hooks/useTradeMode.ts:4`).
5. **App Store 출시: 2026-09-08 최초 출시, 현재 버전 1.0.3(2026-10-26 게시), bundleId `kr.co.fordex.app`, 쇼핑 카테고리, iOS 15.1+** — iTunes lookup 2026-11-05 GET(id 6805027868, `docs/handover-deploy.md:674` 의 ASC App ID 와 일치). 1.0.1 READY_FOR_SALE 기록 `docs/release-runbook.md:16`. `app.json:5` version 은 "1.0.0" 으로 스토어 버전과 다름(OTA·release 브랜치가 따로 — `AGENTS.md` 브랜치 규칙) → 자막에는 app.json 이 아니라 스토어 값.
6. **경매 최소 입찰 단위 4구간**(500/1,000/5,000/10,000원) + 자동 입찰(최대 입찰가, `place_bid_v2`) — `src/utils/bidIncrement.ts:1-6`, `BidModal.tsx:58,133`.
7. **매물 사진 최대 9장**(`src/screens/listing/listingForm.ts:6`). AI 카드 인식 횟수: 코드 폴백 무료 5·PRO 100(`feeCalculator.ts:21-22`)과 스토어 업데이트 문구 "월 80회까지"·마이그 `395_step288_ai_pro_iap.sql:897`(=80)이 **불일치** → 자막에 쓰려면 80(마이그) 근거만, 라이브값은 미확인.
8. **지원 카드 수**: `cards` 24,861행(2026-08-27 운영 실측, `docs/handover-erd.md:1044` — 약 10주 전 수치, 재확인은 쿼리 금지라 **미확인**). 한국판은 운영자가 한 장씩 등록(2026-10-03 실측 2,938행, `docs/handover-admin.md:225-228`).
9. 기술 규모: Edge Function 41개·마이그레이션 419개(`supabase/functions`·`supabase/migrations` 디렉터리 개수, 2026-11-05 센 값). README 는 35/296 이라고 옛 수치.
10. 결제 수단: 신용·체크카드, 계좌이체(NICE 인증결제), 가상계좌는 꺼짐(`constants/features.ts:43` `NICE_VBANK_ENABLED=false`; 어드민 토글은 별도) — `PaymentScreen.tsx:393-400`. Payple→NICE 전면 컷오버 2026-08-05(`README.md:30`).
- 쓰지 말 것(약함): 앱스토어 평점 5.0/6건(표본 작음), 회원 수(44 프로필 2026-09-09, `handover-admin.md:54`, 오래됨).

## 10. 브랜드
- **주색 `#48DBCB`**(민트) — `src/constants/colors.ts:8`(`primary[500]`; 700 `#1E9E92` `:10`, 600 `#2FC2B3`, 300 `#6FE4D8`, 50 `#E8FBF8` `:3`). 홈 배경 `#F6FAFA`(`src/constants/theme.ts:17`), 텍스트 `#111827`(`colors.ts:15`), 안드로이드 어댑티브 아이콘 배경 `#040C17`(`app.json` android.adaptiveIcon). 보조: 성공 `#5BAE2A`·경고 `#E89225`·오류 `#E94E5A`(`colors.ts:49,55,63`), PSA10 `#FFD700`(`:76`).
- 폰트: **Pretendard Regular·Bold**(OTF) — `App.tsx:21-22`, 파일 `assets/fonts/Pretendard-Regular.otf`·`Pretendard-Bold.otf`(각 약 1.5MB), `src/constants/typography.ts:5-11`.
- 로고(PNG 만 있고 **SVG 원본 없음** — `find *.svg` 0건): `assets/branding/logo-horizontal.png`(홈 헤더 `HomeHeader.tsx:38`), `assets/branding/logo-vertical.png`(로그인 `SignInScreen.tsx:332`), `assets/fordex-logo-horizontal.png`(898×268 RGBA), `assets/fordex-logo-splash.png`.
- 앱 아이콘: `assets/icon-ios.png`(1024×1024, iOS `app.json:24`), `assets/icon.png`(1024×1024, `app.json:14`), `assets/icon-android.png`, `assets/adaptive-icon.png`·`adaptive-icon-white.png`, `assets/splash-icon.png`, `assets/favicon.png`, Play용 `store/play/app-icon-512.png`.
- 히어로·제품 사진: 홈 상단 배너는 DB `ad_banners`(Storage) 이미지(스토어 컷 `01-home-feed.png` 에 "나만의 진열장" 배너). 진열장 배경 `src/assets/shelf-room-basic.jpg`. 루트의 `ChatGPT Image 2026년 6월 7일 오후 08_03_45.png`(1536×1024, 2.1MB)는 용도 불명 생성 이미지(**쓰지 말 것**). 스킨 상점 컷 `docs/step258-iap/screens/*.png` 1290×2796.

## 11. 다른 세션 점유 (읽기 확인)
- `git -C /home/dev/fordex worktree list` → **`/home/dev/fordex 281aab73 [main]` 하나뿐**(추가 worktree 없음). `.claude/worktrees` 는 비어 있음. 최신 커밋 281aab73(2026-11-02, step337b docs).
- 포트(`ss -ltnp`): fordex 관련 개발 서버·웹 서빙(8281·8288~8293)·복제 게이트웨이 **54400 전부 비어 있음**. 떠 있는 것: 복제 도커 `fordex-replica3` 8컨테이너(kong **54321**·db **54322**·inbucket **54324**; 12일째), 다른 프로젝트 도커(luvo-judge 55931, gcp-test 55421), sealkitt 하네스 8781·8782, next-server 3311·3312·3475·3491·3493·38791(fordex 아님·소유 미확인 — 건드리지 말 것).
- 빈 포트 후보: 웹 서빙 **8294~8299**(번들엔 8289 가 박혀 있으나 결제 반환 URL 에만 쓰임), 게이트웨이는 번들 고정으로 **54400**(띄우기 전 `ss -ltn | grep :54400` 재확인; fordex 세션이 같은 포트를 쓰려 하면 충돌).
- `replica/gateway.mjs` 는 `replica/gateway.jsonl`(gitignore)에 로그를 쓴다 → 작업 폴더에서 실행해도 `git status` 는 안 변하지만, 규칙상 **스크립트·번들을 prism-media 쪽 임시 폴더로 복사해 실행**(`ROOT`/`HERE` 경로만 바꾸면 됨, `.env.replica` 는 읽기만)하는 편이 안전.
- 서버 자원: 가용 메모리 약 21GB(`free -g`), 디스크 여유 66GB(83% 사용).

## 12. 명세와 코드가 다른 점 (PROGRESS.md 에 옮길 것)
1. **관리자 화면 18개 → 실제 21개**(+ 토글 3, 마케팅 알림은 플래그 꺼짐 시 메뉴 숨김).
2. **관리자 '대시보드' 화면 없음**; '분쟁 중재' 전용 화면 없음(환불 처리 모달·에스크로 상세·신고 관리로 대체); 관리자 웹이 따로 있지 않고 모바일 앱 UI 안의 설정 → 어드민 메뉴.
3. 관리자 '데스크톱'은 **모바일 레이아웃이 1440 폭으로 늘어난 모양**(래퍼·사이드바 없음, 하단 탭바 그대로).
4. '본인인증(만 19세) 안내': 본인인증 화면에는 "만 19세" 문구가 없다(3줄 안내: 최초 1회·통신사 PASS·암호화 보관). 19세는 실패 사유 문구·약관에만.
5. 경매는 `auction_enabled` 가 켜져야 탭이 보임(운영 true, 복제 기본 false, 복제 시드에 경매 매물 없음).
6. **라우트 URL 이 없다**(`linking` 없음) → "페이지마다 URL 로 찍기"는 불가, 클릭/navigation 호출로 이동. 전 화면 로그인 필요(운영 비로그인은 로그인 화면만).
7. 에스크로 결제 버튼은 현재 탭을 NICE 결제창으로 통째로 교체(`document.write`) — 결제 중 화면은 우리 앱이 아니라 NICE 페이지. 결제 진행 흐름은 가로챈 응답 + 거래 상세 타임라인으로 구성.
8. 로고 SVG 원본 없음(PNG 만), 폰트는 Pretendard OTF.
9. 읽기 RPC 가 전부 POST → 명세 안전 규칙(POST·PATCH·PUT·DELETE 가로채기)을 그대로 쓰면 화면이 안 그려짐 → 읽기 RPC 허용 목록 필요(6절).
10. 복제 시드는 카드 5종·단색 줄무늬 사진 — UI 는 실제와 같으나 카드 사진·시세 곡선은 가짜(shots.md 에 '가짜 데이터'로 적을 것).
11. 문서 수치가 코드와 어긋남: README(EF 35·마이그 296 ↔ 실제 41·419), `app.json` version 1.0.0 ↔ 스토어 1.0.3, `handover-admin.md` 화면 17 ↔ 21.

## 결정 필요 (메인에 올림)
- **A. 관리자 데스크톱 컷의 모양**: 1440 폭에서 UI 가 늘어난다. (추천) 그대로 1440 에서 찍되 shots.md 에 "실제 서비스가 그렇게 보임"을 적고, 영상용으로 390 폭 관리자 컷을 병행 — 새 레이아웃을 만들지 않는다(명세: 새로 그리지 않는다).
- **B. 복제 DB 쓰기 허용 범위**: 경매 매물·`auction_enabled` 켜기·카드 사진 교체는 복제 DB 쓰기가 필요(운영 아님; e2e 잔여 쓰기가 이미 있고 인라인 DELETE 불가로 정리 못 함). (추천) `[CAP]` 접두어로 최소만 추가하고 shots.md·보고에 남김. 허용 안 되면 경매 입찰 흐름은 B안(가짜 응답 `page.route`)으로만.
- **C. 운영 관리자 컷 미촬영 확인**: 운영 관리자 계정 비밀번호가 없고 실회원 노출 위험이 있어 복제 `admin` 으로 대체 — facts/shots 에 명시.
