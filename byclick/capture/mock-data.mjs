// byclick 촬영용 가짜 데이터 — 전부 지어낸 값(이름 '김○○' 꼴, 상호 'A모터스' 꼴, 금액은 그럴듯한 가짜).
// 응답 모양은 레포 코드(select 문·RPC 호출부)와 types/database.ts 의 Row 를 따른다. 없는 열은 null.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA = JSON.parse(fs.readFileSync(path.join(HERE, 'mock-schema.json'), 'utf8'));
export const SRC = process.env.BYCLICK_SRC || path.join(HERE, '..', '..', 'tmp', 'byclick-src');

export const NOW = Number(process.env.MOCK_NOW || Date.now());
const H = 3600_000;
export const iso = (offsetMs = 0) => new Date(NOW + offsetMs).toISOString();
const u = (kind, n) => `${kind}0000-0000-4000-8000-${String(n).padStart(12, '0')}`.replace(/^(.{8})0000/, '$1');
const id = (kind, n) => {
  const k = { au: 'a1', li: 'b2', sr: 'c3', in: 'd4', de: 'e5', co: 'f6', us: '11', bi: '22', ma: '33', mo: '44', ph: '55', st: '66', po: '77', rl: '88', pk: '99', dc: 'aa', dd: 'bb', ev: 'cc', cm: 'dd', nt: 'ee' }[kind] || '00';
  return `${k}${k}${k}${k}-0000-4000-8000-${String(n).padStart(12, '0')}`;
};

export const TABLES = {};
for (const t of Object.keys(SCHEMA)) TABLES[t] = [];
// 열이 전부 있는 행을 만든다(없는 열 = null).
function row(table, o) {
  const cols = SCHEMA[table];
  if (!cols) throw new Error('모르는 표 ' + table);
  const r = {};
  for (const c of cols) r[c] = null;
  return Object.assign(r, o);
}
const add = (table, o) => { const r = row(table, o); TABLES[table].push(r); return r; };

// ───────────────────────── 사용자·세션 ─────────────────────────
const b64u = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
export const SESSION_USERS = {};
function mkUser(key, uid, email, role, extra = {}) {
  const authUser = {
    id: uid, aud: 'authenticated', role: 'authenticated', email, email_confirmed_at: iso(-200 * 24 * H), phone: '',
    confirmed_at: iso(-200 * 24 * H), last_sign_in_at: iso(-2 * H), app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {}, identities: [], factors: [], created_at: iso(-200 * 24 * H), updated_at: iso(-2 * H), is_anonymous: false,
  };
  const token = () => {
    const now = Math.floor(NOW / 1000);
    return `${b64u({ alg: 'HS256', typ: 'JWT' })}.${b64u({ iss: 'mock', sub: uid, aud: 'authenticated', role: 'authenticated', email, session_id: id('us', 9000 + Object.keys(SESSION_USERS).length), aal: 'aal1', amr: [{ method: 'password', timestamp: now }], iat: now, exp: now + 30 * 86400, user_metadata: {}, app_metadata: authUser.app_metadata })}.${b64u('mock-signature')}`;
  };
  const tok = token();
  const entry = {
    key, uid, email, role, authUser, token: tok,
    session: () => ({ access_token: tok, token_type: 'bearer', expires_in: 30 * 86400, expires_at: Math.floor(NOW / 1000) + 30 * 86400, refresh_token: `rt.${key}`, user: authUser }),
    ...extra,
  };
  SESSION_USERS[key] = entry;
  return entry;
}
const UID = { dealer: id('us', 1), owner: id('us', 11), ops: id('us', 12), inspector: id('us', 13), finance: id('us', 14), d2: id('us', 2), d3: id('us', 3), d4: id('us', 4) };
mkUser('dealer', UID.dealer, 'dealer-a@example.test', 'dealer');
mkUser('owner', UID.owner, 'admin-owner@example.test', 'admin');
mkUser('ops', UID.ops, 'admin-ops@example.test', 'admin');
mkUser('inspector', UID.inspector, 'admin-inspector@example.test', 'admin');
mkUser('finance', UID.finance, 'admin-finance@example.test', 'admin');
export function userFromToken(tok) {
  if (!tok) return null;
  const p = tok.split('.')[1];
  if (!p) return null;
  try {
    const j = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
    const e = Object.values(SESSION_USERS).find((s) => s.uid === j.sub);
    return e || null;
  } catch { return null; }
}
export const cookieValueFor = (key) => 'base64-' + Buffer.from(JSON.stringify(SESSION_USERS[key].session())).toString('base64url');

// ───────────────────────── 기준 표 ─────────────────────────
const makers = ['혼다', '야마하', '스즈키', '가와사키', 'BMW', '두카티', '할리데이비슨', '트라이엄프', '대림', '베스파'];
makers.forEach((name, i) => add('manufacturers', { id: id('ma', i + 1), name, is_active: true, sort_order: i + 1, created_at: iso(-300 * 24 * H) }));
const maker = (name) => id('ma', makers.indexOf(name) + 1);
const modelsSeed = [
  ['혼다', 'PCX125', 125], ['혼다', 'CB650R', 649], ['혼다', 'X-ADV', 745], ['야마하', 'NMAX155', 155], ['야마하', 'MT-07', 689], ['야마하', 'XMAX300', 292],
  ['스즈키', 'GSX-R750', 750], ['스즈키', '버그만400', 400], ['가와사키', 'Ninja 400', 399], ['가와사키', 'Z900', 948], ['BMW', 'R 1250 GS', 1254], ['BMW', 'R nineT', 1170],
  ['두카티', '몬스터 937', 937], ['할리데이비슨', '스포스터 S', 1252], ['트라이엄프', '본네빌 T120', 1200], ['대림', '엠보이 125', 125], ['베스파', 'GTS 300', 278],
];
modelsSeed.forEach(([mk, name, cc], i) => add('models', { id: id('mo', i + 1), manufacturer_id: maker(mk), name, displacement_cc: cc, is_active: true, sort_order: i + 1, created_at: iso(-300 * 24 * H) }));
const model = (name) => id('mo', modelsSeed.findIndex((m) => m[1] === name) + 1);

// 설정(app_settings) — 값은 코드 기본값·마이그레이션 시드(auction-engine-v2.ts · w3 마이그레이션)를 따른다
const setting = (key, value, description = null) => add('app_settings', { key, value, description, updated_at: iso(-30 * 24 * H) });
setting('auction_engine_v2', { enabled: true });
setting('bid_step_amount', { amount: 10000 });
setting('max_bids_per_dealer', { count: 3 });
setting('bid_revision_mode', { mode: 'last_replaces' });
setting('auction_fee_notice', { text: '현재 수수료를 부과하지 않습니다.' });
setting('buy_now_enabled', { enabled: false });
setting('purchase_confirm_hours', { hours: 48 });
setting('demo_mode', { enabled: false });
setting('admin_mfa_required', { enabled: false });

// ───────────────────────── 딜러(매입업체) ─────────────────────────
const dealerDefs = [
  { n: 1, name: 'A모터스', rep: '김○○', region: '부산 사상구', uid: UID.dealer },
  { n: 2, name: 'B모터스', rep: '이○○', region: '서울 강서구', uid: UID.d2 },
  { n: 3, name: 'C모터스', rep: '박○○', region: '대구 달서구', uid: UID.d3 },
  { n: 4, name: 'D모터스', rep: '최○○', region: '광주 북구', uid: UID.d4 },
];
for (const d of dealerDefs) {
  add('profiles', { id: d.uid, role: 'dealer', display_name: d.rep, phone: null, created_at: iso(-200 * 24 * H), updated_at: iso(-2 * H) });
  add('dealers', {
    id: id('de', d.n), profile_id: d.uid, business_name: d.name, representative_name: d.rep, phone: '010-****-****', region: d.region,
    business_address: '부산광역시 사상구 낙동대로 910', business_registration_no: null, status: 'approved', approved_at: iso(-150 * 24 * H),
    interest_push_enabled: true, created_at: iso(-200 * 24 * H), updated_at: iso(-2 * H),
  });
}
const adminDefs = [['owner', '최고관리자 김○○'], ['ops', '운영 이○○'], ['inspector', '검수 박○○'], ['finance', '정산 최○○']];
for (const [k, name] of adminDefs) {
  add('profiles', { id: UID[k], role: 'admin', display_name: name, created_at: iso(-300 * 24 * H), updated_at: iso(-1 * H) });
  add('user_roles', { user_id: UID[k], role: k, granted_at: iso(-300 * 24 * H) });
}
export const ROLE_PERMS = (() => {
  const all = ['request.read', 'request.view', 'request.write', 'request.intake', 'transport_fee.write', 'pii.read', 'pii.read_settlement', 'pii.write', 'inspection.read', 'inspection.write', 'listing.read', 'listing.write', 'auction.read', 'auction.write', 'bid.manage', 'decision.read', 'decision.write', 'payment.read', 'payment.write', 'release.read', 'release.write', 'settlement.read', 'settlement.write', 'dealer.read', 'dealer.write', 'dealer.revoke', 'notice.read', 'notice.write', 'notification.read', 'notification.write', 'vehicle_code.write', 'settings.read', 'settings.write', 'audit.read', 'role.manage'];
  const pick = (re) => all.filter((p) => re.test(p));
  return {
    owner: all,
    ops: all.filter((p) => !/^(payment|settlement|pii\.read_settlement|role|dealer\.revoke|settings\.write)/.test(p)),
    inspector: ['request.view', 'request.intake', 'transport_fee.write', 'inspection.read', 'inspection.write', 'listing.read', 'listing.write', 'release.read', 'release.write'],
    finance: ['payment.read', 'payment.write', 'release.read', 'release.write', 'settlement.read', 'settlement.write', 'pii.read_settlement'],
  };
})();
for (const [role, perms] of Object.entries(ROLE_PERMS)) for (const p of perms) add('role_permissions', { role, permission: p });

// ───────────────────────── 차량(매물) ─────────────────────────
// 진행 중 6 + 종료 3. 사진은 repo public/media/consumer 의 무료 합성 사진을 돌려 쓴다(imageFor).
const vehicles = [
  { mk: '혼다', md: 'PCX125', yr: 2022, km: 8200, color: '화이트', cc: 125, grade: 'A' },
  { mk: '야마하', md: 'NMAX155', yr: 2021, km: 15400, color: '매트 블랙', cc: 155, grade: 'A' },
  { mk: '가와사키', md: 'Z900', yr: 2020, km: 21800, color: '메탈릭 그린', cc: 948, grade: 'B' },
  { mk: 'BMW', md: 'R 1250 GS', yr: 2021, km: 12900, color: '트리플 블랙', cc: 1254, grade: 'A' },
  { mk: '할리데이비슨', md: '스포스터 S', yr: 2022, km: 4300, color: '블랙 데님', cc: 1252, grade: 'S' },
  { mk: '두카티', md: '몬스터 937', yr: 2023, km: 3100, color: '레드', cc: 937, grade: 'S' },
  { mk: '트라이엄프', md: '본네빌 T120', yr: 2019, km: 18600, color: '블랙/골드', cc: 1200, grade: 'B' },
  { mk: '야마하', md: 'MT-07', yr: 2021, km: 9700, color: '아이스 플루오', cc: 689, grade: 'A' },
  { mk: '혼다', md: 'CB650R', yr: 2020, km: 14300, color: '그레이', cc: 649, grade: 'B' },
  { mk: '스즈키', md: 'GSX-R750', yr: 2018, km: 26100, color: '블루/화이트', cc: 750, grade: 'B' },
  { mk: '가와사키', md: 'Ninja 400', yr: 2022, km: 6900, color: '라임 그린', cc: 399, grade: 'A' },
  { mk: '혼다', md: 'X-ADV', yr: 2021, km: 11800, color: '그레이', cc: 745, grade: 'A' },
  { mk: '베스파', md: 'GTS 300', yr: 2022, km: 5200, color: '아이보리', cc: 278, grade: 'A' },
];
const consumerNames = ['김○○', '이○○', '박○○', '최○○', '정○○', '강○○', '조○○', '윤○○', '장○○', '임○○', '한○○', '오○○'];
const regions = ['부산광역시 사상구', '서울특별시 강남구', '경기도 성남시', '대구광역시 수성구', '인천광역시 연수구', '대전광역시 서구', '광주광역시 북구', '울산광역시 남구', '경기도 고양시', '충청북도 청주시', '경상남도 창원시', '제주특별자치도 제주시'];
const plateBase = ['12가', '34나', '56다', '78라', '90마', '21바', '43사', '65아', '87자', '19허', '28하', '37호'];

// 상태 계획: i 0..5 = 진행 중(live) · 6..8 = 종료 · 9 = 결정 대기 · 10 = 검수 중 · 11 = 접수/배차
// 마감(h): live 경매는 다양한 남은 시간(최초 카운트다운 시연용)
const endsInH = [3.2, 9.5, 20.1, 31.4, 45.2, 70.0];
const V = vehicles.map((v, i) => ({ ...v, i, n: i + 1 }));
V.forEach((v) => {
  const sr = id('sr', v.n), li = id('li', v.n), ins = id('in', v.n), au = id('au', v.n), cons = id('co', v.n);
  const status = v.i < 6 ? 'auctioning' : v.i === 6 ? 'sold' : v.i === 7 ? 'sold' : v.i === 8 ? 'sold' : v.i === 9 ? 'awaiting_decision' : v.i === 10 ? 'inspecting' : v.i === 12 ? 'sold' : 'submitted';
  v.sr = sr; v.li = li; v.ins = ins; v.au = au; v.cons = cons; v.status = status;
  add('consumers', { id: cons, name: consumerNames[v.i], phone: '010-****-****', auth_user_id: id('us', 100 + v.n), created_at: iso(-40 * 24 * H), updated_at: iso(-3 * 24 * H) });
  add('sale_requests', {
    id: sr, consumer_id: cons, status, manufacturer_id: maker(v.mk), model_id: model(v.md), model_name_text: v.md, model_year: v.yr, mileage_km: v.km, color: v.color,
    displacement_cc: v.cc, plate_number: `${plateBase[v.i]} ****`, vin: `KMH${100000 + v.i * 7919}`, region: regions[v.i], contact_phone: '010-****-****',
    pickup_address: `${regions[v.i]} 중앙로 ${10 + v.i * 7}`, pickup_address_detail: '지하 1층', pickup_slot: '오전 9시~12시', pickup_desired_at: iso(-(20 - v.i) * 24 * H),
    has_accident: false, option_amount: 300000 + v.i * 50000, registration_status: '정상', terms_agreed_at: iso(-30 * 24 * H), privacy_agreed_at: iso(-30 * 24 * H),
    created_at: iso(-(14 + v.i) * 24 * H), updated_at: iso(-(1 + (v.i % 4)) * H),
  });
  if (v.i <= 10 || v.i === 12) {
    add('pickups', { id: id('pk', v.n), sale_request_id: sr, status: v.i <= 10 ? 'completed' : 'assigned', scheduled_at: iso(-(11 - v.i) * 24 * H), picked_up_at: iso(-(10 - v.i) * 24 * H), driver_name: '배차 기사', driver_phone: '010-****-****', fee_amount: 80000 + v.i * 5000, fee_bearer: 'company', created_at: iso(-12 * 24 * H), updated_at: iso(-9 * 24 * H) });
  }
});
// 접수 단계 매물(11): 신규 접수·배차 대기 / 픽업 예정 행도 더한다
const extraReq = [
  { n: 13, status: 'submitted', mk: '혼다', md: 'PCX125', yr: 2023, km: 2100, region: '서울특별시 마포구', h: -5 },
  { n: 14, status: 'submitted', mk: '야마하', md: 'XMAX300', yr: 2020, km: 19800, region: '경기도 수원시', h: -30 },
  { n: 15, status: 'pickup_scheduled', mk: '베스파', md: 'GTS 300', yr: 2021, km: 7400, region: '인천광역시 남동구', h: -52 },
  { n: 16, status: 'pickup_scheduled', mk: '스즈키', md: '버그만400', yr: 2019, km: 22400, region: '경상남도 김해시', h: -70 },
  { n: 17, status: 'received', mk: '대림', md: '엠보이 125', yr: 2020, km: 10500, region: '부산광역시 해운대구', h: -90 },
];
extraReq.forEach((e, k) => {
  const cons = id('co', e.n);
  add('consumers', { id: cons, name: consumerNames[(k + 3) % 12], phone: '010-****-****', created_at: iso(-20 * 24 * H), updated_at: iso(-24 * H) });
  add('sale_requests', {
    id: id('sr', e.n), consumer_id: cons, status: e.status, manufacturer_id: maker(e.mk), model_id: model(e.md), model_name_text: e.md, model_year: e.yr, mileage_km: e.km,
    plate_number: `${plateBase[(k + 5) % 12]} ****`, region: e.region, contact_phone: '010-****-****', pickup_address: `${e.region} 번영로 ${20 + k * 3}`, pickup_slot: '오후 1시~5시', pickup_desired_at: iso(24 * H * (1 + k)),
    terms_agreed_at: iso(e.h * H), privacy_agreed_at: iso(e.h * H), created_at: iso(e.h * H), updated_at: iso(e.h * H),
  });
  if (e.status === 'pickup_scheduled' || e.status === 'received') {
    add('pickups', { id: id('pk', e.n), sale_request_id: id('sr', e.n), status: e.status === 'received' ? 'completed' : 'assigned', scheduled_at: iso((e.n - 14) * 18 * H), picked_up_at: e.status === 'received' ? iso(-20 * H) : null, driver_name: '배차 기사', driver_phone: '010-****-****', fee_amount: 90000, fee_bearer: 'company', created_at: iso(e.h * H), updated_at: iso(-10 * H) });
  }
});

// 검수 + 매물 + 경매
const templateId = id('cm', 1);
add('inspection_templates', { id: templateId, name: '기본 검수표', is_active: true, created_at: iso(-300 * 24 * H) });
const tmplItems = [['오일 누유', 'bool'], ['체인·벨트 상태', 'select'], ['타이어 마모', 'select'], ['브레이크 패드', 'select'], ['배터리', 'select'], ['전장(등화류)', 'bool']];
tmplItems.forEach(([label, t], k) => add('inspection_template_items', { id: id('cm', 100 + k), template_id: templateId, code: `item_${k + 1}`, label, input_type: t, sort_order: k + 1, options: null, created_at: iso(-300 * 24 * H) }));
const photoSlots = ['right', 'left', 'front', 'rear', 'dash', 'doc'];
const productImgs = 12; // imageFor 가 돌려 쓴다
V.forEach((v) => {
  if (v.i > 10 && v.i !== 12) return;
  const started = v.i >= 0;
  add('inspections', {
    id: v.ins, sale_request_id: v.sr, template_id: templateId, inspector_id: UID.inspector, status: v.i === 10 ? 'in_progress' : 'completed', overall_grade: v.grade,
    mileage_km: v.km, inspected_at: iso(-(9 - v.i * 0.2) * 24 * H), summary: `${v.yr}년식 ${v.md}. 외관 상태 양호, 엔진·구동계 이상 없음. 정기 점검 이력 확인.`,
    refurb_estimate_amount: 150000 + v.i * 20000, option_estimate_amount: 300000, transport_fee_amount: 120000 + v.i * 5000, locked_at: v.i === 10 ? null : iso(-8 * 24 * H), first_signed_at: v.i === 10 ? null : iso(-8 * 24 * H), sign_revision: v.i === 10 ? 0 : 1,
    created_at: iso(-10 * 24 * H), updated_at: iso(-8 * 24 * H),
  });
  photoSlots.forEach((slot, k) => add('inspection_photos', { id: id('ph', v.n * 10 + k), inspection_id: v.ins, slot, label: null, sort_order: k + 1, storage_path: `p/${v.i % productImgs}/${slot}.jpg`, thumb_path: `p/${v.i % productImgs}/${slot}.jpg`, created_at: iso(-9 * 24 * H) }));
  tmplItems.forEach((it, k) => add('inspection_item_results', { id: id('cm', 1000 + v.n * 10 + k), inspection_id: v.ins, template_item_id: id('cm', 100 + k), value: it[1] === 'bool' ? false : '양호', note: null, photo_paths: [], created_at: iso(-9 * 24 * H) }));
  add('listings', {
    id: v.li, sale_request_id: v.sr, inspection_id: v.ins, manufacturer_id: maker(v.mk), model_id: model(v.md), model_name_text: v.md, title: `${v.mk} ${v.md}`, model_year: v.yr, mileage_km: v.km, displacement_cc: v.cc,
    status: v.i < 6 ? 'auctioning' : 'closed', description: `${v.color} · ${v.cc}cc · ${v.km.toLocaleString('ko-KR')}km`, relist_count: 0, created_at: iso(-8 * 24 * H), updated_at: iso(-6 * H),
  });
});
// 성능·상태 점검기록부 뷰 + 성능 항목
const perfItems = [
  ['cowl', 'exterior', '카울·외장', 1], ['frame', 'exterior', '프레임', 2], ['suspension', 'steering', '서스펜션', 3], ['oil_leak', 'other', '오일 누유', 4], ['engine_oil', 'other', '엔진오일', 5], ['coolant', 'other', '냉각수', 6],
  ['radiator', 'other', '라디에이터', 7], ['fuel', 'other', '연료 계통', 8], ['gear', 'other', '변속기', 9], ['battery', 'electrical', '배터리', 10], ['lighting', 'electrical', '등화장치', 11], ['triple_clamp', 'steering', '트리플클램프', 12],
  ['handlebar', 'steering', '핸들바', 13], ['brake_pad', 'brake', '브레이크 패드', 14], ['brake_disc', 'brake', '브레이크 디스크', 15], ['abs', 'brake', 'ABS', 16], ['brake_fluid', 'brake', '브레이크액', 17],
  ['belt_chain', 'other', '벨트·체인', 18], ['tire', 'other', '타이어', 19], ['engine', 'other', '엔진', 20], ['wheel_scratch', 'exterior', '휠 스크래치', 21], ['spare_key', 'other', '보조키', 22],
];
perfItems.forEach(([code, group, label, so]) => add('inspection_perf_item_catalog', { item_code: code, group_code: group, label, sort_order: so, updated_at: iso(-300 * 24 * H) }));
const states = [['good', '양호', '정상', '이상 없음'], ['repaint', '도색', '도색', '재도색 흔적'], ['wrapping', '랩핑', '랩핑', '랩핑 시공'], ['aftermarket', '애프터마켓', '튜닝', '순정 외 부품'], ['weld', '용접', '용접', '용접 수리 흔적'], ['dent', '찍힘', '찍힘', '찍힘'], ['bent', '휨', '휨', '휨 변형'], ['seepage', '미세 누유', '미세누유', '미세 누유'], ['leak', '누유', '누유', '오일 누유'], ['contaminated', '오염', '오염', '오염'], ['excess', '과다', '과다', '규정량 초과'], ['insufficient', '부족', '부족', '규정량 미달'], ['abnormal', '이상', '이상', '이상 소견']];
states.forEach(([st, label, legend, desc], k) => add('inspection_perf_state_criteria', { state: st, label, legend_label: legend, description: desc, sort_order: k + 1, updated_at: iso(-300 * 24 * H) }));
V.forEach((v) => {
  if (v.i > 10 && v.i !== 12) return;
  add('dealer_performance_record', {
    inspection_id: v.ins, listing_id: v.li, sale_request_id: v.sr, accident_free: true, accident_front: false, accident_rear: false, accident_slip_left: false, accident_slip_right: false, accident_tip_left: false, accident_tip_right: false,
    flooded: false, structure_changed: false, structure_note: null, usage_inspection_passed: true, usage_inspection_note: null, mileage_auth: 'normal', odometer_unit: 'km', odometer_value: v.km, odometer_km: v.km,
    displacement_cc: v.cc, recorded_on: iso(-9 * 24 * H).slice(0, 10), inspector_name: '박○○', remarks: '특이사항 없음', vin: null,
  });
  add('inspection_performance_records', { ...TABLES.dealer_performance_record.at(-1), id: id('dd', 900 + v.n), created_at: iso(-9 * 24 * H), updated_at: iso(-9 * 24 * H) });
  perfItems.forEach(([code]) => {
    const st = v.grade === 'B' && ['tire', 'brake_pad', 'belt_chain'].includes(code) ? 'abnormal' : 'good';
    add('inspection_performance_items', { id: id('dd', v.n * 100 + perfItems.findIndex((p) => p[0] === code)), inspection_id: v.ins, item_code: code, state: st === 'abnormal' ? 'abnormal' : 'good', part: 'none', note: st === 'abnormal' ? '마모 진행 — 교환 권장' : null, f_pct: null, r_pct: null, created_at: iso(-9 * 24 * H) });
  });
});

// 경매(밀봉 sealed · engine v2) — 마감 시각은 NOW 기준
V.forEach((v) => {
  if (v.i > 8 && v.i !== 12) return;
  const live = v.i < 6;
  const ends = live ? NOW + endsInH[v.i] * H : NOW - ((v.i === 12 ? 9 : v.i) - 5) * 11 * H;
  add('auctions', {
    id: v.au, listing_id: v.li, type: 'sealed', status: live ? 'live' : 'ended', starting_price: 3000000 + v.i * 400000, starts_at: new Date(ends - (v.i === 5 ? 72 : 48) * H).toISOString(), ends_at: new Date(ends).toISOString(),
    original_ends_at: new Date(ends).toISOString(), engine_version: 2, extension_count: 0, min_increment: 10000, created_at: new Date(ends - 50 * H).toISOString(), updated_at: iso(-H), current_price: null,
  });
});
// 입찰 — 밀봉: 딜러 본인 것만 보인다. D1(A모터스)은 L1에 1건 · L3에 3건 · L2/L4 0건 · L5 2건
const bids = [
  [1, 1, 3200000], [1, 2, 3350000], [1, 3, 3150000], [1, 4, 3300000],
  [3, 1, 6100000], [3, 1, 6150000], [3, 1, 6200000], [3, 2, 6400000], [3, 3, 6050000],
  [4, 2, 9800000], [4, 3, 9700000],
  [5, 1, 11200000], [5, 1, 11350000], [5, 2, 11500000],
  [6, 2, 9200000], [6, 3, 9150000], [6, 4, 9300000],
];
bids.forEach(([ai, di, amt], k) => {
  const v = V[ai - 1];
  add('bids', { id: id('bi', k + 1), auction_id: v.au, dealer_id: id('de', di), amount: amt, status: 'placed', is_auto: false, placed_at: iso(-(30 - k) * H), created_at: iso(-(30 - k) * H) });
});
// 종료 경매 결과(낙찰) — E1 = 7번 차량(i=6): A모터스 낙찰 → 입금 대기 · E2 = i=7: A모터스 낙찰·입금 확인 → 출고 신청 가능 · E3 = i=8: 타사 낙찰
const wonBids = [
  { v: V[6], dealer: 1, amt: 7350000, paid: false },
  { v: V[7], dealer: 1, amt: 5280000, paid: true, confirmed: true },
  { v: V[8], dealer: 1, amt: 4960000, paid: true },
  { v: V[12], dealer: 2, amt: 6120000, paid: true, confirmed: true },
];
wonBids.forEach((w, k) => {
  const bidId = id('bi', 100 + k);
  add('bids', { id: bidId, auction_id: w.v.au, dealer_id: id('de', w.dealer), amount: w.amt, status: 'won', is_auto: false, placed_at: iso(-(60 + k * 10) * H), created_at: iso(-(60 + k * 10) * H) });
  add('bids', { id: id('bi', 110 + k), auction_id: w.v.au, dealer_id: id('de', w.dealer === 3 ? 4 : 3), amount: w.amt - 150000, status: 'lost', is_auto: false, placed_at: iso(-(62 + k * 10) * H), created_at: iso(-(62 + k * 10) * H) });
  const a = TABLES.auctions.find((x) => x.id === w.v.au);
  a.winning_bid_id = bidId; a.current_price = w.amt;
  add('sale_decisions', {
    id: id('dd', 500 + k), sale_request_id: w.v.sr, auction_id: w.v.au, status: 'decided', decision: 'sell', decided_at: iso(-(40 + k * 8) * H), decided_via: 'consumer', highest_bid_amount: w.amt, second_bid_amount: w.amt - 150000, third_bid_amount: w.amt - 300000,
    winner_dealer_masked: 'A모터스', second_dealer_masked: 'C모터스', third_dealer_masked: 'D모터스', participating_dealer_count: 4, below_reserve: false, dealer_payment_deadline_at: iso((w.paid ? -10 : 30) * H),
    dealer_payment_confirmed_at: w.paid ? iso(-20 * H) : null, purchase_confirmed_at: w.confirmed ? iso(-6 * H) : null, purchase_confirmed_via: w.confirmed ? 'dealer' : null, deadline_at: iso(-30 * H), created_at: iso(-60 * H), updated_at: iso(-20 * H), offer_acceptance_enabled: false,
  });
  add('deal_charges', { id: id('dc', 1 + k * 3), sale_request_id: w.v.sr, kind: 'vehicle_price', payer: 'dealer', account_kind: 'company', amount: w.amt, status: w.paid ? 'confirmed' : 'pending', confirmed_at: w.paid ? iso(-20 * H) : null, source_table: 'sale_decisions', source_id: id('dd', 500 + k), source_key: `vehicle_price:${id('dd', 500 + k)}:${bidId}`, fixture: false, created_at: iso(-40 * H), updated_at: iso(-20 * H) });
  add('deal_charges', { id: id('dc', 2 + k * 3), sale_request_id: w.v.sr, kind: 'dealer_transport', payer: 'dealer', account_kind: 'company', amount: 120000 + w.v.i * 5000, status: w.paid ? 'confirmed' : 'pending', confirmed_at: w.paid ? iso(-20 * H) : null, source_table: 'inspections', source_id: w.v.ins, source_key: `dealer_transport:${w.v.ins}:${bidId}`, fixture: false, created_at: iso(-40 * H), updated_at: iso(-20 * H) });
});
// 정산(판매자 쪽): 낙찰 3건
wonBids.forEach((w, k) => {
  const gross = w.amt, commission = 0, pickup = 80000 + w.v.i * 5000;
  add('settlements', { id: id('st', k + 1), sale_request_id: w.v.sr, status: k >= 2 ? 'paid' : 'calculated', gross_amount: gross, commission_rate: 0, commission_amount: commission, pickup_fee: pickup, pickup_fee_bearer: 'company', net_payout: gross - commission, settled_at: k >= 2 ? iso(-5 * H) : null, settled_month: '2026-11', created_at: iso(-20 * H), updated_at: iso(-5 * H) });
  add('payouts', { id: id('po', k + 1), sale_request_id: w.v.sr, settlement_id: id('st', k + 1), status: k >= 2 ? 'paid' : 'pending', amount: gross - commission, method: 'transfer', bank_name: '농협', account_holder: consumerNames[w.v.i], account_number: null, paid_at: k >= 2 ? iso(-5 * H) : null, paid_by: k >= 2 ? UID.finance : null, hold_periods: [], created_at: iso(-20 * H), updated_at: iso(-5 * H) });
});
wonBids.forEach((wb, k) => {
  const w = { au: wb.v.au, sr: wb.v.sr, li: wb.v.li, amt: wb.amt, paid: wb.paid, confirmed: wb.confirmed, v: wb.v.i };
  const v = V[w.v];
  const a = TABLES.auctions.find((x) => x.id === w.au);
  add('dealer_won_auctions', {
    auction_id: w.au, auction_type: 'sealed', dealer_id: id('de', wb.dealer), decision_status: 'decided', ends_at: a.ends_at, listing_id: w.li, mileage_km: v.km, model_name_text: v.md, model_year: v.yr,
    title: `${v.mk} ${v.md}`, sale_request_id: w.sr, won_amount: w.amt, dealer_payment_deadline_at: iso((w.paid ? -10 : 30) * H), dealer_payment_confirmed_at: w.paid ? iso(-20 * H) : null, purchase_confirmed_at: w.confirmed ? iso(-6 * H) : null,
    sale_notice_reached_at: iso(-39 * H), sale_notice_basis: 'consumer_decision',
  });
});
add('release_requests', { id: id('rl', 1), auction_id: wonBids[3].v.au, sale_request_id: wonBids[3].v.sr, dealer_id: id('de', 2), status: 'requested', requested_at: iso(-3 * H), release_method: 'freight', refurb_requested: false, created_at: iso(-3 * H), updated_at: iso(-3 * H) });
// 결정 대기(i=9): 경매 종료 후 소비자 선택 대기
{
  const v = V[9];
  add('auctions', { id: v.au, listing_id: null, type: 'sealed', status: 'ended', starts_at: iso(-60 * H), ends_at: iso(-12 * H), engine_version: 2, created_at: iso(-62 * H), updated_at: iso(-12 * H), current_price: 5400000 });
  add('listings', { id: v.li, sale_request_id: v.sr, inspection_id: v.ins, manufacturer_id: maker(v.mk), model_id: model(v.md), model_name_text: v.md, title: `${v.mk} ${v.md}`, model_year: v.yr, mileage_km: v.km, status: 'closed', relist_count: 0, created_at: iso(-8 * 24 * H), updated_at: iso(-12 * H) });
  TABLES.auctions.find((x) => x.id === v.au).listing_id = v.li;
  add('sale_decisions', { id: id('dd', 520), sale_request_id: v.sr, auction_id: v.au, status: 'pending', decision: null, highest_bid_amount: 5400000, second_bid_amount: 5250000, third_bid_amount: 5100000, participating_dealer_count: 3, below_reserve: false, deadline_at: iso(36 * H), created_at: iso(-12 * H), updated_at: iso(-12 * H), offer_acceptance_enabled: false });
}
// 접수 이력(타임라인) — 상태 사슬대로 한 줄씩
const CHAIN = ['submitted', 'pickup_scheduled', 'picked_up', 'received', 'inspecting', 'auctioning', 'awaiting_decision', 'sold'];
const lastIdx = (st) => (st === 'consigned' ? 7 : CHAIN.indexOf(st));
let hk = 0;
for (const r of TABLES.sale_requests) {
  const n = Math.max(0, lastIdx(r.status));
  for (let k = 0; k <= n; k++) {
    add('sale_request_status_history', { id: id('ev', ++hk), sale_request_id: r.id, from_status: k === 0 ? null : CHAIN[k - 1], to_status: CHAIN[k], changed_at: new Date(Date.parse(r.created_at) + k * 14 * H).toISOString(), changed_by: k === 0 ? null : UID.ops, note: null, photo_paths: [] });
  }
}
add('consultation_notes', { id: id('nt', 1), sale_request_id: V[0].sr, body: '고객 요청: 픽업 전 연락 부탁(오전 9시 이후).', created_at: iso(-12 * 24 * H), created_by: UID.ops });
// 경매 공지·알림 등 기타 표는 비어 있어도 화면이 그려진다 — 필요한 것만 아래 보강(mock-data-extra.mjs)
export const REL = {};
export const WON = wonBids.map((w) => ({ au: w.v.au, sr: w.v.sr, li: w.v.li, ins: w.v.ins, amt: w.amt, paid: w.paid, v: w.v.i }));
export const VEH = V;
export const EXTRA_SR = extraReq.map((e) => ({ n: e.n, status: e.status, sr: id('sr', e.n) }));
export const IDS = { id, UID, dealerId: (n) => id('de', n) };

// 관심차(딜러 A): 혼다 PCX / 야마하 전체 / BMW R 1250 GS
add('dealer_interests', { id: id('dd', 700), dealer_id: id('de', 1), manufacturer_id: maker('혼다'), model_id: model('PCX125'), created_at: iso(-20 * 24 * H) });
add('dealer_interests', { id: id('dd', 701), dealer_id: id('de', 1), manufacturer_id: maker('야마하'), model_id: null, created_at: iso(-18 * 24 * H) });
add('dealer_interests', { id: id('dd', 702), dealer_id: id('de', 1), manufacturer_id: maker('BMW'), model_id: model('R 1250 GS'), created_at: iso(-10 * 24 * H) });
add('dealer_watchlist', { dealer_id: id('de', 1), listing_id: V[2].li, created_at: iso(-3 * H) });
add('dealer_watchlist', { dealer_id: id('de', 1), listing_id: V[4].li, created_at: iso(-5 * H) });

// ───────────────────────── 이미지(사진 서명 URL 의 실제 응답) ─────────────────────────
const PRODUCT = fs.existsSync(path.join(SRC, 'public/media/consumer/product')) ? fs.readdirSync(path.join(SRC, 'public/media/consumer/product')).filter((f) => f.endsWith('.webp') && !f.includes('cutout')).sort() : [];
const DETAIL = fs.existsSync(path.join(SRC, 'public/media/consumer/detail')) ? fs.readdirSync(path.join(SRC, 'public/media/consumer/detail')).filter((f) => f.endsWith('.webp')).sort() : [];
export function imageFor(bucket, p) {
  const m = p.match(/^p\/(\d+)\/([a-z_]+)\./);
  const k = m ? Number(m[1]) : 0;
  const slot = m ? m[2] : 'right';
  let file;
  if (slot === 'dash' && DETAIL.length) file = path.join(SRC, 'public/media/consumer/detail', DETAIL.filter((f) => f.startsWith('gauge'))[k % DETAIL.filter((f) => f.startsWith('gauge')).length]);
  else if (slot === 'doc') file = path.join(SRC, 'public/photos/step-2-inspection.jpg');
  else if (PRODUCT.length) file = path.join(SRC, 'public/media/consumer/product', PRODUCT[(k + (slot === 'left' ? 0 : slot === 'front' ? 1 : slot === 'rear' ? 2 : 0)) % PRODUCT.length]);
  else file = path.join(SRC, 'public/photos/hero-bike.jpg');
  if (!file || !fs.existsSync(file)) file = path.join(SRC, 'public/photos/hero-bike.jpg');
  return { file, type: file.endsWith('.webp') ? 'image/webp' : file.endsWith('.png') ? 'image/png' : 'image/jpeg' };
}

// ───────────────────────── RPC ─────────────────────────
const dealerIdOf = (user) => (user && user.role === 'dealer' ? id('de', 1) : null);
export const RPC = {
  my_admin_context: (a, { user }) => {
    if (!user || user.role !== 'admin') return null;
    const roles = TABLES.user_roles.filter((r) => r.user_id === user.uid).map((r) => r.role);
    const perms = [...new Set(roles.flatMap((r) => ROLE_PERMS[r] || []))];
    return { roles, permissions: perms, mfa_required: false };
  },
  vehicle_catalog: () => TABLES.manufacturers.filter((m) => m.is_active).map((m) => ({ id: m.id, name: m.name, models: TABLES.models.filter((x) => x.manufacturer_id === m.id && x.is_active).map((x) => ({ id: x.id, name: x.name, displacementCc: x.displacement_cc })) })),
  current_dealer_id: (a, { user }) => dealerIdOf(user),
  current_app_role: (a, { user }) => (user ? user.role : null),
  current_admin_roles: (a, { user }) => TABLES.user_roles.filter((r) => user && r.user_id === user.uid).map((r) => r.role),
  admin_mfa_required_now: () => false,
  inspection_signature_public: (a) => {
    const sr = Object.values(a || {})[0];
    const ins = TABLES.inspections.find((i) => i.sale_request_id === sr);
    if (!ins || ins.status !== 'completed') return { signed: false, completed: false };
    return { signed: true, completed: true, locked: true, first_signed_at: ins.first_signed_at, last_signed_at: ins.first_signed_at, revision: 1, edit_count: 0, hash_prefix: 'a3f19c7e5b24', unchanged: true };
  },
  place_bid_v2: (a, { user }) => {
    // 로컬 가짜 DB 메모리에만 더한다(운영 아님). 촬영의 「제출 후」 상태를 서버 재렌더로 그리기 위한 것.
    const au = TABLES.auctions.find((x) => x.id === a.p_auction_id);
    if (!au || !user) return { ok: false, error: 'auction_not_found' };
    const did = a.p_dealer_id;
    TABLES.bids.push(row('bids', { id: id('bi', 500 + TABLES.bids.length), auction_id: au.id, dealer_id: did, amount: a.p_amount, status: 'placed', is_auto: false, placed_at: new Date().toISOString(), created_at: new Date().toISOString() }));
    const used = TABLES.bids.filter((b) => b.auction_id === au.id && b.dealer_id === did).length;
    return { ok: true, ends_at: au.ends_at, extended: false, remaining: Math.max(0, 3 - used) };
  },
  dealer_my_bids: (a, { user }) => {
    const did = id('de', 1);
    const mine = TABLES.bids.filter((b) => b.dealer_id === did);
    const byAu = new Map();
    for (const b of mine) { if (!byAu.has(b.auction_id)) byAu.set(b.auction_id, []); byAu.get(b.auction_id).push(b); }
    const rows = [];
    for (const [auId, list] of byAu) {
      const au = TABLES.auctions.find((x) => x.id === auId);
      if (!au) continue;
      const li = TABLES.listings.find((x) => x.id === au.listing_id) || {};
      const last = [...list].sort((x, y) => (x.placed_at < y.placed_at ? 1 : -1))[0];
      const wonB = list.find((b) => b.status === 'won');
      const tab = au.status === 'live' ? 'live' : wonB ? 'won' : 'lost';
      rows.push({ auction_id: auId, inspection_id: li.inspection_id || null, title: li.title || null, maker: (TABLES.manufacturers.find((m) => m.id === li.manufacturer_id) || {}).name || null, model_year: li.model_year, mileage_km: li.mileage_km, status: au.status, ends_at: au.ends_at, tab, my_amount: last.amount, won_amount: wonB ? wonB.amount : null, final_amount: wonB ? wonB.amount : null, transferred_away: false });
    }
    const counts = { live: 0, won: 0, lost: 0 };
    rows.forEach((r) => counts[r.tab]++);
    const sel = rows.filter((r) => r.tab === (a.p_tab || 'live')).sort((x, y) => (a.p_sort === 'oldest' ? 1 : -1) * (x.ends_at < y.ends_at ? 1 : -1));
    return { counts, total: sel.length, rows: sel.slice(a.p_offset || 0, (a.p_offset || 0) + (a.p_limit || 20)) };
  },
  dealer_bid_quota: () => ({ max: 3, used: 0, remaining: 3 }),
};
