# medimajor facts (자막용 사실 — 근거 없는 수치는 '미확인')

코드 근거는 고객 레포 `/home/dev/Medimajor` HEAD `ec3dd74d`(design/v59)를 `git show HEAD:<경로>` 로 읽은 줄 번호(읽기 전용). 라이브는 https://medimajor.com (배포 커밋 해시는 미확인 — 제목·푸터·언어 경로·로고·가격 토큰·BOT 정규식은 HEAD 와 일치 확인). 시범 운영 서비스라 매물·판매자·사진은 전부 시범 운영 샘플이다("실거래"로 쓰지 말 것).

## 1. 지원 언어는 6개 — 한국어·English·中文·日本語·ไทย·हिन्दी
- 근거: `src/lib/i18n-core.ts:27` `LANGS = ["ko","en","zh-CN","ja","th","hi"]`, 자기 표기 `:73` `LANG_LABEL`. 라이브 `/` `/en` `/zh-CN` `/ja` `/th` `/hi` 6장을 2026-11-05T23:4xZ 촬영(desktop/home-*-view.png, `<html lang>` 일치), 헤더 언어 메뉴 6개 항목(states/lang-switch). 전환 방식: 경로 prefix(`src/proxy.ts:52-98`)·쿠키 `medimajor.lang`(`i18n-core.ts:30`)·헤더 메뉴. 표시 통화도 6종 KRW·USD·CNY·JPY·THB·INR(헤더 통화 메뉴 라이브 확인), 입찰·결제는 원화(라이브 문구 "입찰·결제는 원화(KRW)입니다").

## 2. 장비 카테고리는 대분류 25개 · 소분류 102개
- 근거: `src/lib/categories.ts:74-352` `TAXONOMY` 를 직접 센 값(4칸 들여쓴 `key:` 25개, `{ key: "…", names` 소분류 102개, 실행 2026-11-06T00:0xZ 의 grep 집계). 주석 `categories.ts:11` "25 majors × 102 subs" 와 일치. 라이브 홈 "분야별 매물 25"·"전체 25개"(desktop/home-ko-view.png). 이름 번역은 ko·en·zh·ja 4개, th·hi 는 영문 폴백(`categories.ts:53-65`, 태국어·힌디어 홈에 영어 분류명이 섞여 보임 — states/lang-switch/04·05).

## 3. 실시간 입찰은 Supabase Realtime `postgres_changes`(WebSocket)로 가격이 바뀐다
- 근거: `src/components/detail/AuctionLiveProvider.tsx:255-278` — `supabase.channel("auction-<id>").on("postgres_changes",{event:"UPDATE",schema:"public",table:"auctions",filter:"id=eq.<id>"},cb).subscribe()`; 콜백이 `current_price`·`bid_count`·`ends_at`·`extension_count`·`leading_bid_id` 를 받아 화면을 바꾸고 입찰 이력(`public_bids`)을 다시 읽는다(`:231-239`). 폴링 폴백 없음(상세). 가격은 값이 바뀔 때만 `data-mo="roll"` 을 단 새 요소로 갈아 끼워 번쩍·롤링한다(`src/v51/islands/BidPanel.tsx:61-66`). 홈 라이브 카드는 별개로 broadcast 채널 `live-events` + 20초 폴링(`src/v3/live/live-channel.ts`).
- 이 촬영의 입찰 갱신 화면은 가로챈 가짜 WebSocket 프레임이 만든 연출이다(운영 입찰 0건): states/bid-live·bid-live-mobile, seq/bid-update.mp4. 가격 13,300,000→13,400,000→13,500,000→13,600,000→13,700,000, 입찰 10→14건은 **가짜 값**.

## 4. 입찰 호가 단위는 가격 구간에 따라 5만·10만·50만·100만 원
- 근거: `src/lib/bid-increment.ts:5` 경계 `[5_000_000, 20_000_000, 50_000_000]`, `:16-22` `getBidIncrement` — 500만 미만 5만 · 2,000만 미만 10만 · 5,000만 미만 50만 · 그 이상 100만. DB `public.bid_increment` 와 같은 표(`:11-14` 주석, `tests/auction-rules.test.ts`). 촬영 매물(1,330만 원대)은 10만 원 단위라 상승폭이 10만 원.

## 5. 입력은 '최대 입찰가'(자동입찰)이고, 마감 5분 전 입찰이 들어오면 5분 연장된다
- 근거: 라이브 홈 거래 원칙 줄 "마감 5분 전 입찰 시 5분 연장"(2026-11-06T00:0xZ curl GET `/` 로 재확인, 화면은 states/lang-switch/01-ko.png 아래쪽·home-ko-full.png 의 `ul.h7-rules`) · 라이브 문구 "한도는 다른 입찰자에게 비공개"(홈 배너 3/5 "최대 금액만 정해 두면 자동으로 입찰합니다", seq/home-hero.mp4 끝 프레임). 서버 판정: `place_bid` 트랜잭션이 선두·가격·연장을 한 번에 정함(`CLAUDE.md` §2, `src/lib/finalize.ts` 주석). 실제 5분 연장 동작은 촬영하지 않음.

## 6. 시범 운영 중 — 정식 오픈은 2026년 12월
- 근거: 라이브 모든 페이지 상단 띠 "시범 운영 중 · 정식 오픈 2026년 12월"(2026-11-05 확인, desktop/*-view.png 맨 위). 매물 사진 캡션 "대표 이미지 5장입니다(시범 운영 사진)"(mobile/lot-detail-view.png). `robots.txt` = `Disallow: /`(비색인). 영상 자막에 "시범 운영 샘플" 단서를 붙일 것.

## 7. 라이브 규모(2026-11-05T23:46Z 홈 SSR): 진행 중 경매 35건 · 구매 요청 9건 · 공매 29건 · 전시관 4개 브랜드·신품 12종
- 근거: desktop/home-ko-view.png·home-ko-full.json 텍스트 "중고 경매장터 35건 진행 중 / 신품 전시관 4개 브랜드·신품 12종 / 삽니다 구매 요청 9건 진행 중 / 공매 29"(읽기 전용 SSR HTML). "공매 29"는 한국자산관리공사 공고를 옮긴 외부 정보(푸터 문구 "공매 정보는 한국자산관리공사 공고를 옮긴 외부 정보이며" — desktop/home-ko-full.png 푸터). 판매 안내 `/sell` 은 "진행 중 경매 35건 · 게시 88건 · 검수 항목 20개"(mobile/sell-view.png, 2026-11-05T23:40Z).

## 8. 관리자 통계의 실제 DB 건수: 매물 94(승인 89·진행 35·종료 59) · 총 입찰 312건 · 낙찰 27 · 유찰 27 (시범 운영 샘플 데이터)
- 근거: 관리자 `/admin/stats` 라이브 화면(desktop/admin-stats-full.png, 2026-11-06T00:00:55Z, 로그인 1회 — BLOCKED.md '보고할 것'). 화면 문구 "이 페이지의 모든 숫자는 조회 시점에 DB 에서 직접 센 실제 값입니다". **낙찰 총액·평균 낙찰가는 가짜 값으로 바꿔 찍었다(×1.137 반올림)** — 이 두 금액은 자막에 쓰지 말 것. 건수는 바꾸지 않았다. 같은 날 시범 샘플이므로 "실거래"로 쓰지 말 것.

## 9. 호스팅은 Vercel 서울 리전(icn1) · DB 는 Supabase, 마감 확정은 pg_cron 이 매분
- 근거: `vercel.json` `"regions":["icn1"]`; Supabase 프로젝트 ref 는 `.env.local` 에 있음(값은 기록 안 함, RECON.md §1); `src/lib/finalize.ts:4-6` 주석 "pg_cron job (finalize-auctions, every minute) is the primary path". 라이브 응답 헤더 `x-vercel-id` 의 icn1 은 RECON.md §2(2026-11-05T22:46Z curl -sI).

## 10. 판매 등록은 '사진 한 장으로 시작' — 마법사 4단계(사진·기본 정보 → 상태 신고 → 경매 조건 → 확인·제출)
- 근거: 라이브 화면 states/sell-photos·desktop/sell-wizard-view.png(진행 막대 01~04), 코드 `src/app/sell/page.tsx:47-52`(`/sell?start=1` 은 로그인 필요 `requireUser`), 홈 문구 "등록 무료 · 사진 한 장으로". 사진 필수 항목: 정면·명판(화면 "정면 · 필수 / 명판 · 필수"), 최대 8장(`src/lib/photo-slots.ts` 의 MAX_PHOTOS — 화면 "사진 추가 최대 8장", 상수 값 자체는 미확인).
