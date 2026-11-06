-- okjob 촬영용 보충 2 — 기간 배정 2건(화면 「기간 배정」 탭) + 11월 초 입금 일부. 로컬 Supabase pm-okjob 전용 · 전부 가짜.
-- 기간 배정은 앱이 쓰는 RPC create_assignment_batch 를 그대로 호출한다(로컬 DB).
do $$
declare
  v_farm1 uuid := (select id from public.farms where name = '황○○');
  v_farm2 uuid := (select id from public.farms where name = '안○○');
  v_wt uuid := '30000000-0000-0000-0000-000000000001';
  v_term uuid := public.term_id_for_date(date '2026-11-23');
  w1 uuid[]; w2 uuid[];
  d date; days1 jsonb := '[]'; days2 jsonb := '[]';
  r jsonb;
begin
  select array_agg(id order by code) into w1 from public.workers where term_id = v_term and code in (16,17,18,19,21);
  select array_agg(id order by code) into w2 from public.workers where term_id = v_term and code in (22,26,28,29,30);
  for d in select generate_series(date '2026-11-23', date '2026-11-27', '1 day')::date loop
    days1 := days1 || jsonb_build_object('work_date', d, 'workers', (select jsonb_agg(jsonb_build_object('worker_id', x)) from unnest(w1) x));
  end loop;
  for d in select generate_series(date '2026-11-24', date '2026-11-28', '1 day')::date loop
    days2 := days2 || jsonb_build_object('work_date', d, 'workers', (select jsonb_agg(jsonb_build_object('worker_id', x)) from unnest(w2) x));
  end loop;
  r := public.create_assignment_batch(jsonb_build_object('farm_id', v_farm1, 'starts_on', '2026-11-23', 'ends_on', '2026-11-27', 'mode', 'fixed',
        'want_male', 4, 'want_female', 1, 'weekdays', jsonb_build_array(1,2,3,4,5), 'work_type_id', v_wt, 'lunch_box', true, 'work_hours', 8, 'pickup_time', '06:30', 'days', days1));
  raise notice 'batch1 %', r;
  r := public.create_assignment_batch(jsonb_build_object('farm_id', v_farm2, 'starts_on', '2026-11-24', 'ends_on', '2026-11-28', 'mode', 'fixed',
        'want_male', 5, 'want_female', 0, 'weekdays', jsonb_build_array(2,3,4,5,6), 'work_type_id', v_wt, 'lunch_box', false, 'work_hours', 8, 'pickup_time', '07:00', 'days', days2));
  raise notice 'batch2 %', r;
end $$;

insert into public.farm_payments (farm_id, covers_from, covers_to, amount, received_on, memo, source)
select a.farm_id, date '2026-11-01', date '2026-11-05', sum(aw.farm_charge_snapshot)::int, date '2026-11-06', null, 'manual'
  from public.assignment_workers aw join public.assignments a on a.id = aw.assignment_id
 where a.work_date between date '2026-11-01' and date '2026-11-05' and aw.farm_charge_snapshot is not null
 group by a.farm_id
having abs(hashtext(a.farm_id::text)) % 5 < 3;

select (select count(*) from public.assignment_batches) batches, (select count(*) from public.farm_payments) payments;
