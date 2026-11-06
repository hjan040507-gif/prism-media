# matchsat(매치샛) 사실 — 자막용

기준: 고객 저장소 `~/satorder` HEAD `6aa098e`(2026-06-29 「주문 수정 P3」)의 `git archive` 사본. 운영 Supabase 는 정지 상태(DNS 미해석)라 운영 쿼리는 쓰지 않았고, 아래 숫자·동작은 **코드(마이그레이션 파일:줄)** 와 **같은 마이그레이션 23개를 로컬 Supabase 에 적용해 읽기 전용으로 재현한 결과**(`matchsat/capture/rls-evidence.txt`, 2026-11-06T08:03Z, 전부 ROLLBACK)가 근거다.

## 1. 수요자 신원은 매칭 전까지 DB 권한으로 막힌다 — 공급자는 주문 테이블을 직접 읽을 수 없다
- 근거: `supabase/migrations/20260605090000_init_satorder_schema.sql:652-660`(`rfqs` SELECT 정책은 소유자 `rfqs_select_owner`·관리자 `rfqs_select_admin` 둘뿐, 주석 `:652` "공급자는 기저 테이블 직접 SELECT 불가 (requester_id 노출 차단)"). 공급자가 보는 목록은 뷰 `rfq_public_view`(`20260609010000_analysis_negotiable_note.sql:123-138` — `security_invoker = false`, `requester_id`·수요자 프로필 컬럼 없음, `where supplier_can_view_rfq(r.id)`, `revoke all … from anon, public` `:137`, `grant select … to authenticated, service_role` `:138`). 로컬 재현: 공급자 계정으로 `select count(*) from rfqs` = 0, `rfq_public_view` = 7행, 뷰에 `requester_id` 컬럼 = false(`rls-evidence.txt`).

## 2. 수요자 이름·소속·전화·이메일은 「매칭 + 수요자 공개 동의」일 때만 공급자에게 나간다
- 근거: 매칭 뷰 `match_view` 의 `case when m.requester_disclosed then rp.display_name/organization/phone/email end`(`20260629000000_direct_trade_pivot.sql:93-96`), 행 제한 `where m.supplier_id = auth.uid() or r.requester_id = auth.uid() or is_admin()`(`:120-122`), anon 회수(`:124`). 공급자가 공개 스위치를 스스로 켤 수 없게 트리거 `matches_guard` 가 `requester_disclosed` 변경을 주문 소유자·관리자·특권 역할에만 허용(`init:463-468`, 트리거 부착 `init:545-547`). 같은 수요자의 다른 미공개 매칭 신원이 새던 쌍 단위 정책 `profiles_select_disclosed_requester` 는 삭제(`20260607180000_anonymity_hardening.sql:92`). 로컬 재현: 공개 동의 매칭의 수요자 이름은 보이고 비공개 매칭은 `(null)`, 공급자가 읽을 수 있는 `profiles` 행은 본인 1행.

## 3. 공급자 입금 계좌는 기저 테이블에서 본인·관리자만 읽고, 수요자에게는 매칭 뷰로만 나간다
- 근거: 계좌 3컬럼(`bank_name`·`account_number`·`account_holder`)은 `supplier_profiles`(`20260629000000_direct_trade_pivot.sql:22-24`, 주석 `:16-19` "계좌는 오직 match_view(definer)로만 노출"). 기저 SELECT 는 `sp_select_self`·`sp_select_admin` 뿐이고 이전의 "인증 사용자 전체 조회" 정책 `sp_select_auth` 는 삭제(`20260607180000_anonymity_hardening.sql:97-103`). 수요자에게 나가는 경로는 `match_view` 의 계좌 3컬럼(`direct_trade_pivot.sql:103-105`) + 당사자 행 제한(`:120-122`) 하나. 공개 디렉터리 뷰 `suppliers_directory` 는 명시 컬럼 13개(id·profile_id·company_name·equipment·tier·is_verified·portfolio_url·created_at·description·satellites·achievements·homepage_url·founded_year)라 계좌·사업자번호가 없다(`20260606130000_phase6_admin_options.sql:314-320`; 로컬 재현 `rls-evidence.txt`). 로컬 재현: 수요자 계정으로 `supplier_profiles` 기저 테이블 행 수 = 0.
- 정확히 말할 점: 「accepted 일 때만 계좌 표시」는 **화면 조건**(`app/matches/page.tsx:161`)이고, DB 의 행 제한은 「당사자인가」다. 「anon 권한 0」은 `rfq_public_view`·`match_view` 에 해당하고 `suppliers_directory` 는 anon SELECT 가 있다(계좌 컬럼 없음, `phase6_admin_options.sql:323`).

## 4. 입찰 규칙 — 공급자 1곳당 주문 1입찰, 다시 내면 수정, 밀봉·횟수 제한·최소 단위는 없다
- 근거: 유니크 제약 `bids_unique_per_supplier unique (rfq_id, supplier_id)`(`init:165`), 재입찰은 기존 입찰 수정이며 상태를 `pending` 으로 되돌림(`20260606140000_phase6_hardening.sql:52-60`), 승인된 공급자만 · 가격 0 이상 정수(입력 상한 약 21억 `INTEGER_MAX`, `packages/shared/src/constants.ts`) · 본인 주문 불가 · 입찰 가능 주문은 영상주문·분석 중 `open`/`bidding`(특별주문은 입찰 불가) · 차단 관계 불가 · 마감(촬영요청일시 종료) 후 불가(`phase6_hardening.sql:29-65`, `:36-43` 가드, `:45-46` 마감). 수요자는 모든 입찰의 업체·금액·제안을 보고 공급자는 본인 입찰만 본다(RLS `bids_select_supplier_own`·`bids_select_rfq_owner` `init:738-742`). 낙찰은 한 트랜잭션에서 매칭 생성 + 낙찰 입찰 `won` + 나머지 `lost` + 주문 `matched` + 대화방 생성(`20260605110000_phase4_chat_notifications.sql:266-296`).

## 5. 주문 수정은 4조건을 모두 만족할 때만 — 본인 주문 · open · 입찰 0건 · 영상주문(imaging)
- 근거: `supabase/migrations/20260629010000_update_rfq.sql:42-63`(가드 1 본인 `:42-48`, 가드 2 open `:50-53`, 가드 3 입찰 0건 `:55-58`, 가드 4 imaging `:60-63`). 입찰 0건 검사는 UPDATE 시점의 `EXISTS` 라 페이지를 연 뒤 들어온 입찰도 막는다. 수정 대상 컬럼은 폼 필드만이고 `requester_id`·`status`·`order_type`·`id`·`created_at` 은 불변(`:66-90`). 같은 규칙을 버튼 노출(`app/rfqs/[id]/page.tsx:197-199`, `app/mypage/page.tsx:108-111`)·페이지 로드(`app/rfqs/new/page.tsx:31-36`)·DB 세 곳에서 검사한다.

## 6. 규모 — 테이블 15 · 뷰 6 · 페이지 28 · 마이그레이션 23 · RLS 정책 92(고유 이름)
- 근거: `git archive 6aa098e` 사본에서 `grep -c "create table" supabase/migrations/*.sql` 합계 15, `find app -name page.tsx | wc -l` = 28, `ls supabase/migrations | wc -l` = 23, `grep -h "create policy" …` 고유 이름 92(2026-11-06 실행). 로컬 Supabase 에 23개를 적용한 DB 에서 `information_schema` 조회로 public 테이블 15·뷰 6(`conversations_view`·`match_view`·`messages_view`·`rfq_public_view`·`suppliers_directory`·`supply_listings_view`) 확인(`rls-evidence.txt`). 브리프의 "테이블 9~10·뷰 3·페이지 20+" 보다 실측이 크다.

## 7. 위성영상주문은 4단계 — 무엇을 / 어디·언제 / 조건 / 예산·확정, 예산은 필수
- 근거: `app/rfqs/new/rfq-form.tsx:37`(`STEPS = ["무엇을","어디·언제","조건","예산·확정"]`), 진행바 「n / 4」 `:145-150`, 스텝 전환은 CSS `hidden` 만이라 모든 필드가 한 `<form>` 에 있다(`:158`). 예산은 최소·최대 중 하나 이상 필수: 서버 zod `packages/shared/src/validation/rfq.ts:62-65` + 클라이언트 제출 가드 `rfq-form.tsx:121-130`. 주문 유형은 영상주문·특별주문(특별주문은 입찰 없이 지정 업체로 즉시 매칭, `rfq-form.tsx:262`), 촬영수단 RF·EO·SAR, 제공시간 3·6·24시간 또는 협의(`packages/shared/src/constants.ts` `RESULT_DELIVERY_OPTIONS`).

## 8. 관리자 쓰기 액션은 정확히 4개 — 전부 관리자 검사 + 감사 로그
- 근거: `lib/admin/actions.ts:22`(회원 승인·거절·정지·복구 `setMemberStatusAction`)·`:32`(신고 처리 `resolveReportAction`)·`:42`(지정 매칭 취소 `cancelDesignatedAction`)·`:51`(재지정 `redesignateAction`), 각 RPC 에서 `if not public.is_admin() then raise exception 'admin only'`(`20260606130000_phase6_admin_options.sql:184,195,206,221`)와 `perform public.write_audit(...)`(`:188,198,212,237`). 재지정 화면은 별도 라우트가 아니라 `/admin` 하단의 「거절된 지정 매칭」 섹션이다(`app/admin/page.tsx:57-91`).

## 9. 결제 화면은 꺼져 있다 — 직거래 전환(결제는 당사자 간, 매치샛은 중개)
- 근거: `app/payments/[matchId]/page.tsx:12,21`(`PAYMENTS_DISABLED = true` → `/matches` 로 리다이렉트), 거래 완료는 수요자만·`accepted` 일 때만(`20260629000000_direct_trade_pivot.sql:135-`), 면책 문구 `packages/shared/src/constants.ts` `PLATFORM_DISCLAIMER`(가입 동의·거래 화면·약관 3곳).

## 10. 운영 서비스 상태 — 촬영 시점에 운영 DB 정지, 운영 데이터 화면은 없다
- 근거: `qqqoaejplefafjbupcto.supabase.co` DNS 미해석(`matchsat/RECON.md` §0-1, 2026-11-06 07:3xZ 조사). 그래서 이 폴더의 모든 데이터 화면은 로컬 사본 + 로컬 Supabase + 가짜 데이터다(`shots.md` '가짜 값'). 운영 가입자 수·거래 건수·자동 시험 수(이 레포에 시험 스크립트 없음, `package.json` scripts 에 `test` 없음)는 **미확인**.

계약서·견적서: 서버(~/satorder·~/Downloads·~/prism-hq·~/private)에서 찾지 못해 비밀유지·공개 제한 조항 인용 불가 — 브리프는 조항 미확인 상태(briefs/matchsat.md:6,19)
