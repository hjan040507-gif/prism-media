# fordex(FORDEX 포덱스) 자막용 사실

조사: 2026-11-05 ~ 11-06 (읽기 전용 — 코드 읽기, iTunes lookup GET). 고객 레포 `/home/dev/fordex` HEAD 281aab73 의 작업 트리 기준(`src/` 변경 0). DB 쿼리는 하지 않았다 — 그래서 아래 '미확인' 항목은 운영값을 모른다는 뜻이다.

## 1. 관리자 화면은 21개 (사용자가 아는 18개가 아니다)
- 근거: `src/navigation/MyPageStack.tsx` 의 `name="Admin…"` 21줄(127·132·137·142·147·152·157·162·167·172·177·182·187·192·202·207·212·217·222·227·232) = `src/screens/admin/*.tsx` 파일 21개(`ls | wc -l` = 21, 2026-11-06 실행) = 설정 메뉴 `navigate('Admin…')` 21줄(`src/screens/mypage/SettingsScreen.tsx:131-152`).
- 정의: '관리자 화면' = 로그인한 `is_admin` 계정의 설정(`MY → 설정`) 화면의 '어드민' 섹션에서 들어가는 화면 라우트. 별도 관리자 웹은 없다(같은 Expo 앱).
- 단서: '마케팅 알림'(`AdminMarketingPush`)은 `flags.marketing_push` 가 켜져야 메뉴에 보인다(`SettingsScreen.tsx:145`, 기본 꺼짐 `src/hooks/useFeatureFlags.ts:20`) → 메뉴에 항상 보이는 화면은 20개. 운영 플래그 값은 쿼리 금지라 **미확인**.
- 화면으로 확인: 복제 환경(마케팅 플래그 꺼짐)의 설정 → 어드민 섹션에는 화면 항목이 정확히 20개 보인다 — `desktop/admin-menu-full.png`(카드 등록 … 시세 TOP 3, '마케팅 알림'만 없음).
- 같은 섹션에 화면이 아닌 인라인 토글 3개(거래 모드·NICE 계좌이체·NICE 가상계좌, `SettingsScreen.tsx:128-130`)가 있다(항목 합계 24).
- 18은 옛 문서 수치: `docs/step253-survey.md:439` "Admin*Screen.tsx(18개)", `docs/step242-push-notification-audit.md:264` "어드민 18화면"(그 뒤 스킨 관리·쿠폰·이벤트 등이 붙었다). `docs/handover-admin.md:45,177` 은 "토글 3 + 화면 17"(더 옛 수치). 자막에는 "21개"(또는 "20개 이상")를 쓴다.

## 2. App Store 정식 출시 — 최초 출시 2026-09-08, 현재 버전 1.0.3 (2026-10-26 게시)
- 근거: iTunes lookup `https://itunes.apple.com/lookup?id=6805027868&country=kr` GET, 조회 시각 2026-11-06T00:29Z — `trackName` "FORDEX 포덱스", `version` 1.0.3, `releaseDate` 2026-09-08T07:00:00Z, `currentVersionReleaseDate` 2026-10-26T06:36:23Z, `bundleId` kr.co.fordex.app, 카테고리 Shopping(쇼핑), `minimumOsVersion` 15.1, 스크린샷 8장.
- 앱 ID 6805027868 은 `docs/handover-deploy.md:674` 의 ASC App ID 와 일치. `app.json:5` version 은 "1.0.0" 이라 스토어 값과 다르다(OTA·release 브랜치가 따로) → 자막은 스토어 값을 쓴다.
- 쓰지 말 것: 평점 5.0/6건(표본 작음).

## 3. 거래 진행은 4단계 — 주문 생성 → 결제 완료 → 발송 처리 → 구매확정
- 근거: `src/screens/mypage/TransactionDetailScreen.tsx:1119-1146` `Timeline` (`steps` 4개). 5번째 '에스크로 해제' 단계는 삭제됨(주석 `:1145`). 환불 타임라인은 반품 포함 5단계·미발송 즉시취소 3단계(`:1173-1177`).
- 영상의 `states/tx-timeline/` 4장이 이 4단계다(단계는 가짜 응답으로 바꿔 촬영).

## 4. 에스크로(안전결제) — 대금을 구매확정까지 보관, 구매확정일로부터 7영업일 뒤 판매대금 지급 요청
- 근거: `src/constants/notices.ts:74,81-82` `SETTLEMENT_NOTICE` — "구매자가 상품을 수령한 후 구매확정을 완료하면, 구매확정일로부터 7영업일 후 판매대금 지급이 요청됩니다", "구매확정을 하지 않더라도 송장번호 등록 후 7일이 경과하면 자동으로 구매확정". 메일 구매확정 계정(`SETTLEMENT_NOTICE_MAIL`)은 3영업일.
- 결제·에스크로·지급대행은 나이스페이먼츠(`README.md:26`). 거래 상세에 "안전결제 · 대금 보관 중"(`TransactionDetailScreen.tsx:496-503`). App Store 설명 "결제 대금은 구매확정 전까지 안전하게 보관"(iTunes lookup, 위 2번).
- 직거래는 정책상 금지(스토어 설명)이나 코드에는 `direct` 모드 스위치가 남아 있다(`src/hooks/useTradeMode.ts:4`).

## 5. 경매 최소 입찰 단위는 4구간 — 1만 원 미만 500 · 10만 원 미만 1,000 · 100만 원 미만 5,000 · 그 이상 10,000
- 근거: `src/utils/bidIncrement.ts:1-6`(`getMinBidIncrement`), 빠른 증액 4칸 = 단위 ×1·×2·×10·×20(`:7-10`). 자동 입찰(최대 입찰가) 지원: `src/components/auction/BidModal.tsx:58,133`(`place_bid_v2`). 실제 확정 규칙은 서버 `place_bid_v2` 이며 매물마다 `bid_increment` 컬럼이 있다 — 화면 촬영본의 "최소 단위 5,000원"은 가짜 매물 값이다.
- 경매 탭은 `auction_enabled` 가 켜져야 보인다(`src/hooks/useAuctionEnabled.ts`, 코드 기본 꺼짐). 운영값은 true 로 기록돼 있다(`docs/qa/fordex-qa-2026-10.md:56`) — 라이브 확인은 **미확인**.

## 6. 수수료 3.5%, 건당 최소 600원, 판매자 단일 요율
- 근거: `src/utils/feeCalculator.ts:1-8` (`FEE_RATE = 0.035`, `MIN_FEE_WON = 600`, PRO 할인 폐지 주석 `:2`). 코드 폴백·표시용 값이며 실제 부과값은 서버 `subscription_settings.fee_rate_percent` 가 기준 — 운영 DB 쿼리 금지라 **미확인**. (`docs/handover-admin.md` 의 "PRO 3.0%" 는 옛 기록.)
- 촬영본(복제 DB)의 거래 목록·정산 화면 수수료는 가짜 값이다.

## 7. 기술 규모 — Edge Function 41개 · 마이그레이션 419개
- 근거: `supabase/functions` 하위 폴더 수(`_shared` 제외) 41, `supabase/migrations/*.sql` 419개 — 2026-11-05 디렉터리 개수. README 의 "35·296" 은 옛 수치. 결제 수단: 신용·체크카드·계좌이체(NICE 인증결제), 가상계좌는 꺼짐(`src/constants/features.ts:43` `NICE_VBANK_ENABLED=false`; `PaymentScreen.tsx:393-400`). Payple→NICE 전면 컷오버 2026-08-05(`README.md:30`).

## 8. 매물 사진 최대 9장
- 근거: `src/screens/listing/listingForm.ts:6`.

## 9. 본인인증 화면에는 '만 19세' 문구가 없다 (명세와 다른 점)
- 근거: 본인인증 화면(`src/screens/auth/IdentityVerificationScreen.tsx:66-70`)의 안내는 3줄(최초 1회·통신사 PASS·암호화 보관). '만 19세 이상만 이용할 수 있어요.'는 인증 실패 사유(`age_restricted`) 문구로만 있다(`:49`) — 영상용으로 `mobile/identity-age-restricted-*.png`(실패 사유 상태)를 따로 찍었다. 약관 본문에도 19세 조항(`src/constants/terms/serviceBuyer.ts:27`, `serviceSeller.ts:25`, `service.ts:44`, `privacy.ts:144`).

## 10. 지원 카드 수 24,861장 (2026-08-27 기준 — 최신값은 미확인)
- 근거: `docs/handover-erd.md:1044` "cards 24,861행(2026-08-27 운영 실측)". 약 10주 전 수치이고 재확인은 DB 쿼리라 하지 않았다 → 자막에 쓰려면 "2만 개 이상" 수준이 안전. 한국판은 운영자가 한 장씩 등록(2026-10-03 실측 2,938행, `docs/handover-admin.md:225-228`).

## 미확인(근거 없음)
- 회원 수·거래 건수 — 운영 DB 쿼리 금지. 문서의 "44 프로필(2026-09-09)"(`docs/handover-admin.md:54`)은 오래돼 쓰지 않는다. 촬영본의 "결제완료 1,284건 · 거래액 148,236,000원"은 **가짜 값**이다.
- AI 카드 인식 월 한도: 코드 폴백(무료 5·PRO 100, `feeCalculator.ts:21-22`)과 스토어 업데이트 문구("월 80회", 마이그 `395_step288_ai_pro_iap.sql:897`)가 서로 다르다 → 자막에 쓰지 않는다.
