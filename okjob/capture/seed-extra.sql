-- okjob 촬영용 보충 가짜 데이터(로컬 Supabase pm-okjob 전용 · psql 로 로컬 주소를 글자로 박아 실행).
-- seed-dev.ts 가 안 채우는 화면(입금 확인 · 알림톡 발송 이력)을 채운다. 전부 지어낸 값.
-- 실행: psql postgresql://postgres:postgres@127.0.0.1:57011/postgres -v ON_ERROR_STOP=1 -f okjob/capture/seed-extra.sql

-- 1) 입금 확인: 농가 20곳 중 15곳은 9/22~10/31 분 입금 완료(청구 합계와 같은 금액), 5곳은 미입금(미수로 보인다)
insert into public.farm_payments (farm_id, covers_from, covers_to, amount, received_on, memo, source)
select a.farm_id,
       date '2026-09-22', date '2026-10-31',
       sum(aw.farm_charge_snapshot)::int,
       date '2026-11-02' + (abs(hashtext(a.farm_id::text)) % 4),
       null, 'manual'
  from public.assignment_workers aw
  join public.assignments a on a.id = aw.assignment_id
 where a.work_date between date '2026-09-22' and date '2026-10-31'
   and aw.farm_charge_snapshot is not null
 group by a.farm_id
having abs(hashtext(a.farm_id::text)) % 4 <> 0;

-- 2) 알림톡 발송 이력: 이미 나간 배정(sent·confirmed) 중 오늘 -14일 ~ 내일 분은 '발송됨' 행(가짜 · provider=mock)
insert into public.notifications (assignment_id, channel, kind, scheduled_at, sent_at, status, confirm_token, token_expires_at, confirmed_at, provider, provider_message_id, delivery_status, delivery_reported_at, attempts)
select a.id, 'alimtalk', 'assign',
       ((a.work_date - 1)::timestamp + time '07:30') at time zone 'Asia/Seoul',
       ((a.work_date - 1)::timestamp + time '07:30:20') at time zone 'Asia/Seoul',
       'sent',
       md5('pm-okjob-' || a.id::text),
       ((a.work_date)::timestamp + time '23:59') at time zone 'Asia/Seoul',
       case when a.status = 'confirmed' then ((a.work_date - 1)::timestamp + time '09:12' + (abs(hashtext(a.id::text)) % 300) * interval '1 minute') at time zone 'Asia/Seoul' end,
       'mock', 'mock-' || substr(md5(a.id::text), 1, 12),
       'delivered', ((a.work_date - 1)::timestamp + time '07:31') at time zone 'Asia/Seoul', 1
  from public.assignments a
 where a.status in ('sent', 'confirmed')
   and a.work_date between (now() at time zone 'Asia/Seoul')::date - 14 and (now() at time zone 'Asia/Seoul')::date + 1;

-- 3) 실패 1건(수신 불가 사례) — 이력 탭 '실패' 필터가 비지 않게
update public.notifications set status = 'failed', error = '수신 불가(카카오톡 미사용 번호)', delivery_status = 'failed'
 where id = (select id from public.notifications order by sent_at desc limit 1 offset 3);

-- 4) 예약: 앞으로 3일 안의 draft 배정은 전일 07:30 예약 행
insert into public.notifications (assignment_id, channel, kind, scheduled_at, status, confirm_token, token_expires_at, provider)
select a.id, 'alimtalk', 'assign',
       ((a.work_date - 1)::timestamp + time '07:30') at time zone 'Asia/Seoul',
       'scheduled',
       md5('pm-okjob-sch-' || a.id::text),
       ((a.work_date)::timestamp + time '23:59') at time zone 'Asia/Seoul',
       'mock'
  from public.assignments a
 where a.status = 'draft'
   and a.work_date between (now() at time zone 'Asia/Seoul')::date and (now() at time zone 'Asia/Seoul')::date + 5;

select (select count(*) from public.farm_payments) as payments,
       (select count(*) from public.notifications where status = 'sent') as sent,
       (select count(*) from public.notifications where status = 'scheduled') as scheduled,
       (select count(*) from public.notifications where status = 'failed') as failed;
