// matchsat 촬영용 로컬 시드 — 로컬 Supabase(pm-matchsat, API 57020 · DB 57021)에만 쓴다.
// 운영 DB·운영 주소는 어디에도 없다. 주소는 아래 상수로 박혀 있고 다르면 즉시 멈춘다.
//   실행: LOCAL_SERVICE_ROLE_KEY=<로컬 키> MS_PW=<가짜 계정 비밀번호> node matchsat/capture/seed.mjs
//   (키·비밀번호는 환경변수로만 — 로컬 전용 가짜 값이며 이 파일에는 없다)
import { execFileSync } from 'node:child_process';

const API = 'http://127.0.0.1:57020';
const DB = 'postgresql://postgres:postgres@127.0.0.1:57021/postgres';
if (!API.startsWith('http://127.0.0.1:57020') || !DB.includes('@127.0.0.1:57021/')) throw new Error('로컬 주소가 아님 — 중단');
const KEY = process.env.LOCAL_SERVICE_ROLE_KEY;
const PW = process.env.MS_PW;
if (!KEY || !PW) throw new Error('LOCAL_SERVICE_ROLE_KEY·MS_PW 환경변수 필요');

const psql = (sql) => execFileSync('psql', [DB, '-v', 'ON_ERROR_STOP=1', '-At', '-c', sql], { encoding: 'utf8' }).trim();

// 가짜 계정 — 이메일은 예약 도메인(.test), 사람 이름은 이미 가린 꼴, 상호는 A·B·C 식
const USERS = [
  { key: 'admin', email: 'admin@pm-local.test', role: 'requester', display_name: '관리자', organization: '운영팀', makeAdmin: true },
  { key: 'reqA', email: 'req-a@pm-local.test', role: 'requester', display_name: '김○○', organization: 'A기관' },
  { key: 'reqB', email: 'req-b@pm-local.test', role: 'requester', display_name: '이○○', organization: 'B기관' },
  { key: 'supA', email: 'sup-a@pm-local.test', role: 'supplier', display_name: '박○○', organization: 'A위성', company_name: 'A위성', bank_name: '○○은행', account_number: '000-000-000000', account_holder: 'A위성' },
  { key: 'supB', email: 'sup-b@pm-local.test', role: 'supplier', display_name: '최○○', organization: 'B위성영상', company_name: 'B위성영상', bank_name: '○○은행', account_number: '000-000-000001', account_holder: 'B위성영상' },
  { key: 'supC', email: 'sup-c@pm-local.test', role: 'supplier', display_name: '정○○', organization: 'C지구관측', company_name: 'C지구관측', bank_name: '○○은행', account_number: '000-000-000002', account_holder: 'C지구관측' },
  // 승인 대기(관리자 회원 화면의 승인·거절 카드용)
  { key: 'pendReq', email: 'pend-req@pm-local.test', role: 'requester', display_name: '한○○', organization: 'C기관', pending: true },
  { key: 'pendSup', email: 'pend-sup@pm-local.test', role: 'supplier', display_name: '오○○', organization: 'D위성', company_name: 'D위성', bank_name: '○○은행', account_number: '000-000-000003', account_holder: 'D위성', pending: true },
];

const ids = {};
for (const u of USERS) {
  const res = await fetch(`${API}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      email: u.email, password: PW, email_confirm: true,
      user_metadata: { role: u.role, display_name: u.display_name, organization: u.organization, company_name: u.company_name, bank_name: u.bank_name, account_number: u.account_number, account_holder: u.account_holder },
    }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`사용자 생성 실패 ${u.key}: ${JSON.stringify(j).slice(0, 200)}`);
  ids[u.key] = j.id;
}

// 승인·관리자 지정(로컬 postgres 직접 접속 = 특권 역할이라 profiles_guard 통과)
for (const u of USERS) {
  if (u.pending) continue;
  psql(`update public.profiles set status='approved', approved_at=now() - interval '20 days', ${u.makeAdmin ? "role='admin'," : ''} updated_at=now() where id='${ids[u.key]}'`);
}
// 공급업체 소개(참여업체 화면용 가짜 값)
psql(`update public.supplier_profiles set is_verified=true, tier='sme', equipment=array['EO','SAR'], satellites=array['KOMPSAT 계열(가짜 값)'], description='위성영상 촬영·분석 업체(가상)' where profile_id='${ids.supA}'`);
psql(`update public.supplier_profiles set is_verified=true, tier='large', equipment=array['EO'], description='광학 위성영상 공급(가상)' where profile_id='${ids.supB}'`);
psql(`update public.supplier_profiles set is_verified=false, tier='research', equipment=array['SAR','RF'], description='SAR·RF 관측(가상)' where profile_id='${ids.supC}'`);

// ── 주문 ── (모양은 rfqs + rfq_capture_details + [rfq_analysis_details], 실제 폼이 만드는 필드와 같다)
const H = (h) => `now() + interval '${h} hours'`;
const mk = (o) => {
  const id = psql(`insert into public.rfqs (requester_id, order_type, title, status, region_name, requested_datetime, requested_datetime_end, deadline, budget_min, budget_max, created_at)
    values ('${ids[o.req]}','${o.type}','${o.title}','${o.status}','${o.region}', ${H(o.startH)}, ${H(o.endH)}, ${H(o.endH)}, ${o.bmin}, ${o.bmax}, now() - interval '${o.ageH} hours') returning id`).split('\n')[0];
  psql(`insert into public.rfq_capture_details (rfq_id, sensor_types, capture_point, is_special, urgency, designated_supplier_id, resolution, radius_km, result_delivery_hours, needs_analysis, analysis_options, analysis_note)
    values ('${id}', array[${o.sensors.map((s) => `'${s}'`).join(',')}], '${o.point}', ${o.type === 'special'}, ${o.urgency ? `'${o.urgency}'` : 'null'}, ${o.designated ? `'${ids[o.designated]}'` : 'null'}, ${o.res ? `'${o.res}'` : 'null'}, ${o.radius ?? 'null'}, ${o.hours ?? 'null'}, ${o.analysis ? 'true' : 'false'}, ${o.analysis ? `array['object_detection']` : 'null'}, null)`);
  return id;
};
const rfq = {};
// 1) 공급자 A: 입찰 중(+B 도 입찰) — 수요자 소유 뷰의 「받은 입찰 2건」
rfq.bidded = mk({ req: 'reqA', type: 'imaging', title: '서해안 갯벌 변화 관측 위성영상', status: 'bidding', region: '충남 서산', startH: 30, endH: 80, bmin: 3000000, bmax: 6000000, ageH: 60, sensors: ['EO', 'SAR'], point: '가로림만 일대(가상)', res: '1m급 이상', radius: 8, hours: 24 });
// 2) 마감 곧(3시간 이내) · 입찰 없음 — 공급자 A 는 아직 입찰 안 함 → 입찰 제출 흐름용
rfq.urgent = mk({ req: 'reqB', type: 'imaging', title: '산불 피해 구역 긴급 촬영', status: 'open', region: '강원 강릉', startH: 1, endH: 2.5, bmin: 2000000, bmax: 4000000, ageH: 40, sensors: ['EO'], point: '피해 구역 반경 5km(가상)', res: '3m급', radius: 5, hours: 6 });
// 3) NEW(24시간 이내) · 입찰 없음 · imaging · open — 주문 수정 화면(수요자 A) + 공급자 입찰 제출 흐름용
rfq.edit = mk({ req: 'reqA', type: 'imaging', title: '항만 야적장 적재 현황 촬영', status: 'open', region: '부산 남구', startH: 48, endH: 120, bmin: 1500000, bmax: 3000000, ageH: 3, sensors: ['EO'], point: '신항 야적장 일대(가상)', res: '1m급 이상', radius: 4, hours: 24 });
// 4) 분석보고서 포함 영상주문 · 입찰 없음
rfq.analysis = mk({ req: 'reqB', type: 'imaging', title: '농경지 작황 영상 및 객체분석', status: 'open', region: '전남 나주', startH: 72, endH: 168, bmin: 4000000, bmax: 8000000, ageH: 30, sensors: ['EO', 'SAR'], point: '나주 평야 일대(가상)', res: '5m급 이상', radius: 12, hours: -1, analysis: true });
// 5) 낙찰(공급자 A 가 따냄) · 6) 탈락(공급자 A 가 입찰했으나 B 가 낙찰)
rfq.won = mk({ req: 'reqB', type: 'imaging', title: '댐 수위 변화 SAR 관측', status: 'matched', region: '경북 안동', startH: -50, endH: -20, bmin: 2500000, bmax: 5000000, ageH: 120, sensors: ['SAR'], point: '안동댐 일대(가상)', res: '3m급', radius: 6, hours: 24 });
rfq.lost = mk({ req: 'reqA', type: 'imaging', title: '도심 열섬 분석용 야간 촬영', status: 'matched', region: '대구 수성', startH: -60, endH: -30, bmin: 3500000, bmax: 7000000, ageH: 130, sensors: ['RF', 'EO'], point: '수성구 일대(가상)', res: '1m급 이상', radius: 7, hours: 24 });
// 7~9) 특별주문(지정 매칭): A 에게 대기중 / B 가 거절 / C 가 거절 → 관리자 재지정 섹션
rfq.spPending = mk({ req: 'reqA', type: 'special', title: '해안 침식 정밀 지정 촬영', status: 'matched', region: '강원 삼척', startH: 20, endH: 60, bmin: 5000000, bmax: 9000000, ageH: 5, sensors: ['EO'], point: '삼척 해안선(가상)', res: '0.25cm급 이상', radius: 3, hours: 6, urgency: 'urgent', designated: 'supA' });
rfq.spRej1 = mk({ req: 'reqB', type: 'special', title: '국가산단 시설 정기 지정 촬영', status: 'matched', region: '울산 남구', startH: 40, endH: 90, bmin: 4500000, bmax: 8500000, ageH: 20, sensors: ['EO', 'SAR'], point: '산단 일대(가상)', res: '1m급 이상', radius: 5, hours: 24, urgency: 'normal', designated: 'supB' });
rfq.spRej2 = mk({ req: 'reqA', type: 'special', title: '철새 도래지 지정 관측', status: 'matched', region: '전남 신안', startH: 55, endH: 100, bmin: 3000000, bmax: 6500000, ageH: 26, sensors: ['SAR', 'RF'], point: '도래지 일대(가상)', res: '3m급', radius: 9, hours: 24, urgency: 'normal', designated: 'supC' });

// ── 입찰 ──
const bid = (r, s, price, days, proposal, status = 'pending', ageH = 20) => psql(`insert into public.bids (rfq_id, supplier_id, price, estimated_days, proposal, status, created_at)
  values ('${rfq[r]}','${ids[s]}',${price},${days},'${proposal}','${status}', now() - interval '${ageH} hours') returning id`).split('\n')[0];
const b = {};
b.bidA = bid('bidded', 'supA', 4200000, 3, '가로림만 일대 EO·SAR 합성 영상 제공, 분석 전 원본 우선 전달(가상)', 'pending', 40);
b.bidB = bid('bidded', 'supB', 3800000, 4, '광학 영상 기준 최저가 제안(가상)', 'pending', 30);
b.wonA = bid('won', 'supA', 3300000, 2, 'SAR 단독 관측, 24시간 내 납품(가상)', 'won', 100);
b.lostA = bid('lost', 'supA', 5200000, 3, '야간 EO 촬영 제안(가상)', 'lost', 110);
b.lostB = bid('lost', 'supB', 4600000, 2, '야간 EO·RF 동시 촬영(가상)', 'won', 112);
// ── 매칭 ──
const match = (r, s, bidId, type, status, disclosed = false) => psql(`insert into public.matches (rfq_id, supplier_id, bid_id, match_type, status, requester_disclosed)
  values ('${rfq[r]}','${ids[s]}',${bidId ? `'${bidId}'` : 'null'},'${type}','${status}',${disclosed}) returning id`).split('\n')[0];
const m = {};
m.won = match('won', 'supA', b.wonA, 'bid_won', 'accepted', true);
m.lost = match('lost', 'supB', b.lostB, 'bid_won', 'accepted');
m.spPending = match('spPending', 'supA', null, 'designated', 'pending');
m.spRej1 = match('spRej1', 'supB', null, 'designated', 'rejected');
m.spRej2 = match('spRej2', 'supC', null, 'designated', 'rejected');
for (const k of ['won', 'lost']) psql(`select public.ensure_conversation('${m[k]}')`);
// 입찰 상태 정합(낙찰 B 는 won, A 는 lost)
psql(`update public.bids set status='lost' where id='${b.lostA}'`);

// ── 신고(관리자 신고 처리 화면) ── 공급자 A 가 주문을, 수요자 B 가 공급자를 신고
psql(`insert into public.reports (reporter_id, target_type, target_id, reason, status, created_at) values
  ('${ids.supA}','rfq','${rfq.urgent}','촬영 요청 조건이 현실적이지 않아 확인이 필요합니다(가상).','pending', now() - interval '6 hours'),
  ('${ids.reqB}','supplier','${ids.supC}','연락 두절 — 지정 매칭 거절 사유 확인 요청(가상).','reviewing', now() - interval '2 days'),
  ('${ids.reqA}','rfq','${rfq.analysis}','중복 등록된 주문으로 보입니다(가상).','resolved', now() - interval '6 days')`);

// 알림 읽음 처리(벨 배지 숫자가 화면마다 흔들리지 않게)
psql(`update public.notifications set is_read = true`);

console.log(JSON.stringify({ users: ids, rfq, matches: m, bids: b }, null, 1));
