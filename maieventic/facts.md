# maieventic(마이이벤틱) 사실 — 자막용 (촬영 2026-11-06 00:0x~01:xxZ, 운영 https://mai-eventic.com)

코드 기준 레포 `/home/dev/maimai-event-builder` (읽기 전용, HEAD 4c3db5c8). DB 쿼리는 실행하지 않았다. 경로는 모두 `src/` 아래.
운영 로그인 계정은 QA 풀 계정(실서비스 고객 계정 아님)이라 관리자 화면의 숫자(이벤트 40개·누적 참여 5·남은 경품 176 등)는 **자막에 쓰지 말 것**(QA 데이터 — 항목 9).

## 1. 게임은 4종 — 룰렛 · 스크래치 · OX 퀴즈 · 스탬프(출석)
- 근거: `lib/config/schema.ts:470` `type: z.enum(["roulette","scratch","quiz","stamp"])`, `lib/showcase/demos.ts:80` `GAME_KEYS`. 라이브 게임 화면 4종 = `mobile/event-roulette|scratch|quiz|stamp-*.png` · `desktop/game-*-*.png`(`/e/demo-roulette-mz-bright`·`demo-scratch-premium`·`demo-quiz-minimal`·`demo-stamp-mz-bright`). 랜딩 마퀴에는 "퍼즐(예정)·브랜드게임(예정)" 2개가 더 있으나 미출시(`app/page.tsx:41` `MARQUEE_ITEMS`) — 자막에 4종 이상으로 쓰지 말 것.

## 2. 요금제 4종 — Free 무료 · One-Time ₩300,000(건당) · Pro ₩200,000(월) · Business 상담 후 견적
- 근거: `lib/config/plans.ts:232`(free `priceKrw: 0`), `:389`(onetime `priceKrw: 300000`), `:313`(pro `priceKrw: 200000`), `:448-449`(business `priceKrw: null` + `priceLabel: "상담 후 견적"`). 라이브 `/pricing`·랜딩 요약에 같은 값이 표시됨(2026-11-06 확인, `desktop/pricing-view.png`·`desktop/pricing-full.png`·`mobile/pricing-*.png`). 주의: Pro "/월" 표기는 코드 주석에 "월 기준인지는 K6 대표 확인"(`plans.ts:311`)이라 확정 대기 상태이고, 화면 문구에도 "가격·한도는 베타 기간 중 바뀔 수 있어요"가 있다 — 자막에 쓸 때 "베타 기준"을 병기할 것.

## 3. '디자인 자동 생성'의 3안은 AI(LLM) 생성이 아니라 결정론 엔진 — AI 호출 0
- 근거: `app/api/design/proposals/route.ts:1-8` 머리말 "3안 목록(결정론 플래너 산출) … AI 호출 0 · 네트워크 0(플래너는 순수 함수)". 새 만들기 흐름(create_v2)의 3안 고르기 `components/create-v2/Picks.tsx`. 한편 기획 대화·카피 작성·"AI로 완성하기"는 LLM(항목 4). **이 3안 결과 화면은 운영에서 찍지 못했다**(`/create` 가 서버에 분석 행을 씀 — BLOCKED.md 1번). 대체 원본: `media/builder-captures/ai-design.webp`(디자인 스텝 AI 3안 고르기), `journey-02-design.webp`.

## 4. AI 기획·카피 모델 = Claude Sonnet 4.6 (`claude-sonnet-4-6`)
- 근거: `lib/ai/briefChat.ts:30`(대화 기획), `lib/ai/brief.ts:18`, `lib/ai/generate.ts:16`("AI로 완성하기"), `lib/ai/chat.ts:34`, `lib/ai/suggestCopy.ts:15` 모두 `const MODEL = "claude-sonnet-4-6"`. 이번 촬영에서 AI 호출은 0회(`/create` 를 열지 않음).

## 5. 이벤트 만들기는 3단계(기획·만들기·퍼블리싱) · 최대 9스텝
- 근거: `lib/builder/phases.ts:10-13` `PHASES`(plan: brand·game·quiz·stamp·entry·prizes / make: design·content / publish: review), `app/(builder)/create/CreateClient.tsx:97-113` `stepDefsFor`(브랜드·목적→게임→(퀴즈|스탬프)→참여 방식→경품→디자인→문구·콘텐츠→확인). 게임에 따라 퀴즈·스탬프 스텝이 끼므로 상황별 8~9스텝. 화면 원본: `media/builder-captures/ai-*.webp`·`mine-*.webp`(레포가 랜딩·도움말에 쓰는 실제 빌더 캡처).

## 6. 무료(Free) 등급 — 이벤트 발행 1회 · AI 질문 10회 · 디자인 1회 무료
- 근거: `lib/config/plans.ts:228-232`(free: "발행 1회(누적)·챗봇 10회" 주석 `:233`), 라이브 `/pricing` Free 카드 문구 "이벤트 발행 1회 · AI 질문 10회 · 디자인 1회 무료"(`desktop/pricing-full.png`). 참가자 한도는 방문자 일 100명·이벤트 전체 1,000명(`plans.ts:234-236` 주석(발행 1회 주석 `:233`), 화면 Free 상세 "방문자 일 100명 이하·이벤트 전체 1,000명 이하"). 주의: 카드 문구는 "디자인 1회 무료", 상세 목록은 "디자인 중간 수정 3회까지"로 표현이 다르다 — 자막은 카드 문구만.

## 7. 경품이 소진되면 '꽝'으로 귀속, 결과는 서버가 확정(참여자 화면이 결과를 바꾸지 못함)
- 근거: 레포 CLAUDE.md "성역 — 제품·정책" 43행("재고 소진 경품 → 꽝 귀속은 확정 정책(08-19)"), 구현 `lib/event/exhaustion.ts`. 게임 결과는 `play_event` RPC(서버 결과, `components/game/playEvent.tsx:116` · 호출 `lib/game/playRpc.ts:19-24`)가 정함 — 촬영 때 이 응답을 가짜로 채웠다(shots.md). 관리자 운영 제어 화면에 "꽝 없는 이벤트·대체 경품" 설정 문구(`desktop/admin-event-full.png`).

## 8. 문자 인증은 운영에서 실제 문자 발송이 켜져 있다 — 문자 인증 화면: 번호 → 인증번호 → 인증 완료
- 근거: 운영 `GET /api/auth/methods` → `{"phone":true,"sms":true,"email":true,"kakao":false}`(2026-11-06 00:0xZ, curl). 화면 흐름 코드 `components/game/playEvent.tsx:1290-1360`("휴대폰 번호"→"인증번호"→"인증번호 6자리"→"확인"→"인증 완료", 안내 "휴대폰 번호는 본인확인과 중복 참여 방지에만 사용되며, 이벤트 종료 후 파기됩니다"). 촬영: `states/sms-verify/` — 문자는 발송하지 않고 응답을 가짜로 채움. 주의: 공개 데모 4종은 라이브에서 문자 인증이 꺼져 있어(`auth.phone:false`) 이 화면은 응답의 설정 한 값만 켜서 찍었다(shots.md '응답 가공').

## 9. 실서비스 수치(이벤트 수·참여자 수·고객 수) — 미확인
- 근거: 운영 DB 조회 금지 지침으로 확인하지 않음. 코드 주석 "발행물 176건 전수 파싱"(`app/e/[slug]/page.tsx:124`)은 날짜 불명의 과거 시점 값. 관리자 화면에 보이는 40개 이벤트·참여 5는 QA 풀 계정 하나의 테스트 워크스페이스(`qa-…`·`r2e3-…` 슬러그) 값이라 서비스 수치가 아니다. 사이트맵의 `showcase/demo-*` 62건은 시연용 데모(게임 4 × 톤 8 + 테마·목적·업종 템플릿)이고 `/showcase/<demo>` 상세는 현재 `/create` 로 이동해 비노출(`app/showcase/[slug]/page.tsx:54`) — 자막용 아님.

## 10. 관리자 초대는 이메일이 아니라 '초대 링크 발급'(소유자 전용), Pro 는 추가 관리자 3인
- 근거: `app/api/invite/route.ts:1-18`(소유자 전용·24바이트 랜덤·raw 코드는 응답 1회만, 7일 만료 — `components/admin/InvitePanel.tsx`), 화면 `desktop/admin-members-*.png`·`states/admin-invite/`("초대 링크 만들기"·"이 링크는 지금만 볼 수 있어요"). Pro 추가 관리자 상한 3: `lib/config/plans.ts:319`(`adminSeats: 3`), 화면 "관리자 자리 4석 중 1석 사용 · 소유자 계정을 포함한 자리예요".

## 11. 마케팅 카피 "기획·디자인·퍼블리싱을 5분만에 자동 생성"은 광고 문구(실측 아님)
- 근거: `app/page.tsx:61`("AI 자동 생성: 기획, 디자인, 퍼블리싱을 5분만에 자동으로 생성합니다."). 라이브 랜딩에 그대로 표시(`desktop/landing-full.png`). 실제 소요 시간 측정 기록 없음 → 자막에 쓸 때 "서비스 소개 문구"로만.
