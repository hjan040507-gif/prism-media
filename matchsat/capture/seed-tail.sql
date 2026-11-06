-- seed.mjs 의 끝부분(대화방·입찰 상태 정합·신고·알림 읽음) — 1회차 시드가 conversations 에서 멈춰 이어서 적용한 것.
-- 로컬 DB(127.0.0.1:57021)에만: psql "postgresql://postgres:postgres@127.0.0.1:57021/postgres" -f matchsat/capture/seed-tail.sql
insert into public.conversations (match_id, requester_id, supplier_id)
select m.id, r.requester_id, m.supplier_id from public.matches m join public.rfqs r on r.id = m.rfq_id
where m.match_type = 'bid_won' and r.title in ('댐 수위 변화 SAR 관측','도심 열섬 분석용 야간 촬영');
update public.bids set status='lost' where price = 5200000 and proposal like '야간 EO 촬영 제안%';
insert into public.reports (reporter_id, target_type, target_id, reason, status, created_at)
select (select id from public.profiles where email='sup-a@pm-local.test'), 'rfq', (select id from public.rfqs where title='산불 피해 구역 긴급 촬영'), '촬영 요청 조건이 현실적이지 않아 확인이 필요합니다(가상).', 'pending'::report_status, now() - interval '6 hours'
union all select (select id from public.profiles where email='req-b@pm-local.test'), 'supplier', (select id from public.profiles where email='sup-c@pm-local.test'), '연락 두절 — 지정 매칭 거절 사유 확인 요청(가상).', 'reviewing'::report_status, now() - interval '2 days'
union all select (select id from public.profiles where email='req-a@pm-local.test'), 'rfq', (select id from public.rfqs where title='농경지 작황 영상 및 객체분석'), '중복 등록된 주문으로 보입니다(가상).', 'resolved'::report_status, now() - interval '6 days';
update public.notifications set is_read = true;
