# byclick(바이클릭) 사실 — 자막용

레포: `/home/dev/bikeclickofficial` HEAD `863d2c26`(feat/paid-42) · 운영: https://byclick.co.kr (11-04 배포 sian-v9는 레포에 없음 — 소비자 화면은 운영 직접 촬영). 모든 숫자는 아래 근거로만 쓴다.

## 1. 차종 자동완성은 제조사 150곳 · 모델 3,713개(운영 실측)
- 정의: 신청 화면에서 고르는 차종 목록 = 활성 제조사(manufacturers)와 모델(models) 행 수. 자막은 「제조사 150 · 모델 3,713」.
- 근거(운영 실측): 운영 `POST /rest/v1/rpc/vehicle_catalog`(읽기 전용 STABLE 함수 · 공개 키) 응답을 세어 제조사 150(모델 가진 제조사 149) · 모델 3,713 — 2026-11-05T22:53Z, RECON.md §7 #1. 이 세션이 운영 `/my/apply` GET 으로 센 제조사 선택 목록(`role="option"`)도 150개 — 2026-11-05T23:51:58Z.
- 근거(데이터 파일): `src/lib/passo-models.ts:2` 「제조사 150 · 모델 3704」 — 이 세션이 파일을 직접 파싱해 제조사 150 · 모델 3,704(모델 있는 제조사 149) 확인. 운영 DB 가 9개 더 많은 이유 = 데이터 파일 이전부터 있던 DB 행(`supabase/migrations/20260914120000_data1_vehicle_catalog.sql:3` 「models 가 3,713행」).
- 주의: 운영 `/my/apply` 의 제조사 선택 시트는 검색(한 글자씩 거름)이고, 모델 칸은 직접 입력이다(운영 화면에 모델 자동완성 팝업 없음 — 이 세션 확인). 「모델 3,713」은 DB 목록 크기로 말해야 정확하다.

## 2. 관리자 역할은 4종 — 최고관리자 · 운영 · 검수 · 정산
- 근거: `src/lib/admin-permissions.ts:50` `ADMIN_ROLES = ["owner","ops","inspector","finance"]` · 라벨 `:52-57` · 설명 `:61-66`. DB enum `supabase/migrations/20260911010000_w10_rbac.sql:27` `create type public.admin_role as enum ('owner','ops','inspector','finance')`(이후 `alter type` 없음 — RECON §7 #2). 역할 부여 화면 `/admin/settings/roles`(최고관리자 전용 `role.manage`) — 로컬 사본 촬영: `desktop/admin-roles-*`.

## 3. 입찰은 밀봉 방식 · 업체당 3번 · 1만원 단위
- 근거(운영 공개 문구): 운영 `/dealer/login` 소개 글 「입찰은 밀봉 방식이며 업체마다 3번까지 입찰할 수 있습니다.」 — `src/app/(auth)/dealer/login/DealerLoginIntro.tsx:8` · 이 세션 촬영 `desktop/dealer-login-live-view.png`(운영 라이브, 2026-11-05).
- 근거(코드): 단위 1만원 `src/lib/auction-engine-v2.ts:27` `BID_STEP_FALLBACK = 10000` · 업체당 최대 3회 `:29` `MAX_BIDS_PER_DEALER_FALLBACK = 3` · DB 설정 `supabase/migrations/20260908180000_w3_engine_v2_expand.sql:56-57` `bid_step_amount {"amount":10000}` · `max_bids_per_dealer {"count":3}`. 현재가·타사 금액은 비공개(`auction-engine-v2.ts` 머리 주석).
- 한계: 값은 DB 설정(app_settings)이라 운영의 현재값은 관리자 설정 화면(로그인 필요)에서만 확인 가능 — 「3번」은 운영 공개 문구가 직접 뒷받침, 「1만원」은 코드·마이그레이션 기본값 + 운영 랜딩 FAQ 「딜러들은 1만 원 단위로 제안가를 높일 수 있고」(운영 `/` GET 2026-11-05).

## 4. 경매 마감은 기본 48시간, 금요일 시작은 72시간
- 근거: `src/lib/auction-schedule.ts:25` `auctionDurationHours(startMs,{ base = 48, friday = 72 })` · `:26` KST 금요일이면 friday 아니면 base. 설정 키 `auction_default_duration_hours {"hours":48}`(`supabase/migrations/20260810133428_omaedan_schema.sql:540`) · `auction_friday_duration_hours {"hours":72}`(`supabase/migrations/20261029090000_paid41_auction_friday_hours.sql:3`). 마지막 적용 마이그레이션 `20261103100000`(`docs/deploy-chain.md:9`)이라 적용됨. 마감 임박 연장(소프트클로즈) v2 는 꺼짐(`supabase/migrations/20260909016000_step1_5_soft_close_v2_off.sql:8`).
- 한계: 운영 DB 의 현재 설정값은 미확인(관리자 로그인 불가).

## 5. 판매 진행은 6단계 — 신청 접수 · 픽업 · 차량 검수 · 경매 진행 · 판매 확정 · 정산 완료
- 근거: `src/lib/stage-table.ts:24-31` `STAGE_TABLE`(6행 · 판매·위탁 모두 같은 6단계). 소비자 `/my`·`/my/[id]` 화면(로그인 벽 — 운영 촬영 불가, BLOCKED.md).
- 운영 공개 랜딩의 「HOW IT WORKS」는 4단계(모의견적 · 무료픽업 · 검수 · 전국최고가 경매 및 입금)이고 6단계가 아니다 — `mobile/` 이 4단계 흐름(`states/process-steps/`)이다. 자막에 6단계를 쓰려면 코드 근거만 가능.

## 6. 최고가 확인 뒤 소비자는 판매 · 위탁 · 반환 3가지 중 직접 고른다
- 근거: `src/components/product/DecidePanel.tsx:43` `type Choice = "sell" | "consign" | "return"`. 운영 공개 랜딩 「즉시판매 · 위탁판매 · 차량반환」(운영 `/` GET 2026-11-05 · `mobile/landing-full.png`). 명세의 「판매·위탁」 둘이 아니라 반환 포함.

## 7. 거래 문서 PDF 3종 — 성능·상태 점검기록부 · 낙찰 확인서 · 판매 정산서
- 근거: `src/lib/pdf/documents.tsx`(`PerformanceRecord` · `WonConfirmation` · `SettlementStatement`) · 라우트 `src/app/api/docs/{performance,won,settlement}/…/route.ts`(RECON §3-4). 이 세션이 레포 렌더 코드를 가짜 데이터로 그대로 돌려 `pdf/` 3장.

## 8. 견적 신청부터 입금까지 영업일 기준 평균 5~7일(모의견적 0.5일 · 무료픽업 1일 · 검수 0.5일 · 경매 및 입금 3일)
- 근거: 운영 랜딩 「HOW IT WORKS」 문구(운영 `/` GET 2026-11-05, `mobile/landing-full.png` · `states/process-steps/`). 코드 근거는 sian-v9 라 레포에 없음 — 운영 화면이 근거.

## 미확인
- 총 입찰·거래 건수, 딜러 수, 누적 판매자 수: 운영 DB 로그인 불가 · 공개 API 없음 → 「미확인」.
- 운영 `LIVE 전국 경매 진행 중` 카드는 촬영 시각에 1건(대림 엠보이 125, `GET /api/public/live-auctions` 2026-11-05) — 실서비스 진행 현황이라 숫자 자막 근거로는 약함.
