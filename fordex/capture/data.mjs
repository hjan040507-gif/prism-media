// fordex 가짜 데이터 — 시세·경매·거래 단계·본인인증 상태. 응답 모양은 앱 코드(useCard·useAuctionStatus·BidModal 등)가 읽는 그대로.
// 값(시세 금액·입찰 내역·시각)은 전부 가짜이며 shots.md 에 '가짜 값'으로 적는다.
import { cardFor, CARDS } from './fake.mjs';

export const S = {
  now: Date.now(),
  unverified: false,       // true 면 내 프로필의 is_verified=false (본인인증 안내 화면용)
  stage: 'paid',           // 거래 단계: paid → shipped → delivering → confirmed
  txFilter: null,          // 단계 가짜를 적용할 거래 id(없으면 전부)
  auctionId: null,         // 입찰 화면에 쓰는 경매 매물 id
  bids: [],                // [{ id, amount, mine, auto, t }] — 입찰 상태 기계
  startPrice: 80000,
  inc: 5000,
  txMeta: {},              // 거래 id → { amount, escrow } (정산 가짜 값 계산용)
};
export const iso = (ms) => new Date(ms).toISOString();

// ── 시세(가짜) ─────────────────────────────────────────────
const BASE = [ // CARDS 순서: 리자몽 피카츄 갸라도스 거북왕 이상해꽃 뮤츠 피존투 괴력몬 시라소몬 럭키
  [380000, 2150000], [48000, 520000], [210000, 1480000], [185000, 1320000], [172000, 1260000], [150000, 980000], [64000, 410000], [58000, 360000], [52000, 330000], [46000, 290000],
];
const hashStr = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const idxOf = (cardId) => CARDS.indexOf(cardFor(cardId));
function series(cardId, grade, days) {
  const i = idxOf(cardId);
  const base = BASE[i][grade ? 1 : 0];
  const seed = hashStr(cardId + grade);
  const out = [];
  for (let d = days; d >= 0; d--) {
    const t = S.now - d * 86400000;
    const wave = Math.sin((d + seed % 17) / 6) * 0.045 + Math.sin((d + seed % 5) / 2.3) * 0.015 - (d / Math.max(days, 1)) * 0.06;
    const price = Math.round((base * (1 + wave)) / 1000) * 1000;
    out.push({ t, price });
  }
  return out;
}
const dayStr = (t) => iso(t).slice(0, 10);
const cardIdFromUrl = (u) => (decodeURIComponent(u).match(/card_id=eq\.([0-9a-f-]{36})/) || [])[1];
const GRADES = [null, 'PSA_10'];

export const priceOverrides = [
  {
    match: /\/rest\/v1\/price_history\?/, method: 'GET',
    json: (req) => {
      const cid = cardIdFromUrl(req.url());
      const m = decodeURIComponent(req.url()).match(/recorded_at=gte\.([^&]+)/);
      const since = m ? Date.parse(m[1]) : S.now - 30 * 86400000;
      const days = Math.max(2, Math.round((S.now - since) / 86400000));
      const rows = [];
      for (const g of GRADES) for (const p of series(cid, g, Math.min(days, 365))) {
        rows.push({ id: `${hashStr(cid + g + p.t)}`, card_id: cid, grade: g, price: p.price, currency: 'KRW', source: 'ebay', recorded_at: iso(p.t), suppressed: false, metadata: { filter_applied: true, filtered_count: 26, sample_count: 26 } });
      }
      return rows.sort((a, b) => (a.recorded_at < b.recorded_at ? 1 : -1)).slice(0, 500);
    },
  },
  {
    match: /\/rest\/v1\/rpc\/get_card_price_daily/, method: 'POST',
    json: (req) => {
      const b = req.postDataJSON() || {};
      const days = Math.min(Number(b.p_days) || 30, 365);
      const rows = [];
      for (const g of GRADES) for (const p of series(b.p_card_id, g, days)) rows.push({ grade: g, source: 'ebay', new_gen: true, day: dayStr(p.t), price_sum: p.price * 3, n: 3 });
      return rows;
    },
  },
  {
    match: /\/rest\/v1\/rpc\/card_grade_price/, method: 'POST',
    json: (req) => {
      const b = req.postDataJSON() || {};
      const g = b.p_grade_key ? b.p_grade_key : null;
      const s = series(b.p_card_id, g, 1);
      return [{ price: s[s.length - 1].price, as_of: iso(S.now), is_fresh: true }];
    },
  },
];

// ── 경매(가짜) ─────────────────────────────────────────────
export function seedBids(n = 3, mineLast = false) {
  S.bids = [];
  const names = ['user***', 'user***', 'user***', 'user***'];
  for (let i = 0; i < n; i++) S.bids.push({ id: `b${i}`, amount: S.startPrice + S.inc * (i + 1), mine: mineLast && i === n - 1, auto: false, t: S.now - (n - i) * 17 * 60000, label: names[i % 4] });
}
const top = () => S.bids.reduce((m, b) => (b.amount > m ? b.amount : m), 0);
export const endsFor = (id, idx = 0) => iso(S.now + [3.2, 7.5, 26, 49][(idx + hashStr(id)) % 4] * 3600000);

export const auctionOverrides = [
  { match: /\/rest\/v1\/rpc\/is_auction_enabled/, method: 'POST', json: true },
  {
    match: /\/rest\/v1\/rpc\/get_auction_status/, method: 'POST',
    json: () => {
      const hi = top();
      const last = S.bids[S.bids.length - 1];
      const lead = S.bids.find((b) => b.amount === hi);
      return {
        total_bid_count: S.bids.length, highest_bid_amount: hi, highest_bidder_nickname: 'user***', is_self_top_bidder: !!(lead && lead.mine),
        last_bid_amount: last ? last.amount : 0, last_bid_at: last ? iso(last.t) : null, min_next_bid: (hi || S.startPrice) + S.inc,
      };
    },
  },
  { match: /\/rest\/v1\/rpc\/get_my_proxy_bid/, method: 'POST', json: () => { const m = S.bids.filter((b) => b.mine).map((b) => b.amount); return m.length ? Math.max(...m) : null; } },
  {
    match: /\/rest\/v1\/rpc\/get_auction_bid_history/, method: 'POST',
    json: () => S.bids.map((b) => ({ id: b.id, amount: b.amount, created_at: iso(b.t), bidder_label: b.mine ? 'user***' : b.label, is_mine: b.mine, is_auto: b.auto })),
  },
];

// place_bid_v2 는 복제 DB 에 쓰지 않는다 — 가짜 상태 기계로 응답(경매 입찰 흐름용)
export async function installBidFake(ctx) {
  await ctx.route(/\/rest\/v1\/rpc\/place_bid_v2/, async (route) => {
    const b = route.request().postDataJSON() || {};
    const amount = Number(b.p_amount);
    S.bids.push({ id: `b${S.bids.length}`, amount, mine: true, auto: false, t: Date.now(), label: 'user***' });
    ctx.__prismStats.intercepted++; ctx.__prismStats.list.push('POST /rest/v1/rpc/place_bid_v2 (fake: 입찰 가짜 응답)');
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ bid_id: `b${S.bids.length}`, leader_is_me: true, current_bid: amount, my_max: b.p_max_proxy_bid || amount, auto_bid: false, max_raised_only: false }) });
  });
}

// ── 응답 값 고치기(listings·profiles·transactions) ─────────────
export function patchRows(body, url) {
  const walkFix = (v, key) => {
    if (Array.isArray(v)) return v.map((x) => walkFix(x, key));
    if (!v || typeof v !== 'object') return v;
    const o = { ...v };
    // 경매 매물: 진행 중으로 보이게(남은 시간·현재가·시작가) — 입찰 화면의 매물은 S.auctionId
    if (o.sale_type === 'auction' && o.status === 'active' && o.id) {
      const isTarget = o.id === S.auctionId;
      o.auction_end_at = isTarget ? iso(S.now + (2 * 3600 + 14 * 60 + 36) * 1000) : endsFor(o.id);
      o.auction_start_price = isTarget ? S.startPrice : 30000 + (hashStr(o.id) % 8) * 10000;
      o.bid_increment = isTarget ? S.inc : 1000;
      o.current_bid = isTarget ? (top() || null) : o.auction_start_price + 5000 * (1 + (hashStr(o.id) % 3));
      if (o.price != null && isTarget) o.price = o.current_bid || S.startPrice;
      o.viewer_count = isTarget ? 8 : 3 + (hashStr(o.id) % 9);
    }
    for (const k of Object.keys(o)) o[k] = walkFix(o[k], k);
    return o;
  };
  let out = walkFix(body, '');
  if (S.unverified && /\/rest\/v1\/profiles/.test(url)) {
    const unv = (r) => (r && typeof r === 'object' && 'is_verified' in r ? { ...r, is_verified: false } : r);
    out = Array.isArray(out) ? out.map(unv) : unv(out);
  }
  if (/\/rest\/v1\/transactions/.test(url)) {
    for (const r of Array.isArray(out) ? out : [out]) if (r && r.id && r.amount != null) S.txMeta[r.id] = { amount: r.amount, escrow: r.escrow_status };
    const st = S.stage;
    const fix = (r) => {
      if (!r || typeof r !== 'object' || !('payment_status' in r)) return r;
      if (S.txFilter && r.id !== S.txFilter) return r;
      const t0 = Date.parse(r.created_at);
      const o = { ...r };
      o.payment_status = st === 'created' ? 'pending' : 'paid';
      o.escrow_status = st === 'created' ? null : st === 'confirmed' ? 'released' : 'holding';
      o.delivery_status = st === 'delivering' ? 'in_transit' : st === 'confirmed' ? 'delivered' : st === 'shipped' ? 'shipping' : null;
      o.shipping_started_at = ['shipped', 'delivering', 'confirmed'].includes(st) ? iso(Math.max(t0, S.now - 2 * 86400000)) : null;
      o.shipping_tracking_number = ['shipped', 'delivering', 'confirmed'].includes(st) ? '6994-****-****' : null;
      o.carrier_name = o.shipping_tracking_number ? 'CJ대한통운' : null;
      if (st === 'created') o.payment_due_at = iso(S.now + 11 * 60000 + 24000);
      o.buyer_confirmed_at = st === 'confirmed' ? iso(S.now - 3600000) : null;
      return o;
    };
    out = Array.isArray(out) ? out.map(fix) : fix(out);
  }
  return out;
}

// ── 관리자 목록(가짜) — 복제 DB 의 e2e 시험 행 대신, 같은 응답 모양(admin_list_transactions·admin_list_reports·admin_transaction_summary)으로 새로 만든 값 ──
const DAY = 86400000;
const TITLES = CARDS.map((c) => `${c.ko} ${c.set} ${c.rarity}`);
const AMOUNTS = [12000, 33500, 48000, 65000, 90000, 128000, 15500, 24000, 185000, 52000, 9800, 77000, 43000, 21000];
export function fakeAdminTx() {
  // [결제, 에스크로, 배송, 구매확정(일 전), 경매]
  const states = [
    ['paid', 'holding', null, null], ['paid', 'holding', 'in_transit', null], ['paid', 'released', 'delivered', 2], ['paid', 'disputed', 'delivered', null], ['paid', 'released', 'delivered', 4],
    ['pending', null, null, null], ['paid', 'holding', null, null], ['paid', 'released', 'delivered', 6], ['paid', 'holding', 'in_transit', null], ['cancelled', 'refunded', null, null],
    ['paid', 'released', 'delivered', 9], ['pending', null, null, null], ['paid', 'released', 'delivered', 11], ['paid', 'holding', null, null],
  ];
  return states.map((s, i) => {
    const amount = AMOUNTS[i];
    const fee = Math.max(600, Math.round(amount * 0.035));
    const created = S.now - (i * 0.7 + 0.3) * DAY;
    return {
      id: `7a000000-0000-4000-8000-0000000000${String(i).padStart(2, '0')}`, listing_no: 4310 - i, listing_title: TITLES[i % TITLES.length], sale_type: i === 4 || i === 10 ? 'auction' : 'fixed',
      buyer_name: '김○○', seller_name: '김○○', amount, shipping_fee: 3000, fee_amount: fee, net_amount: amount - fee,
      payment_status: s[0], escrow_status: s[1], payment_method: i % 3 === 1 ? 'bank' : 'card', pg_provider: null, pg_order_id: null, pg_tid: null,
      shipping_tracking_number: s[2] ? '6994-****-****' : null, delivery_status: s[2], shipping_started_at: s[2] ? iso(created + 0.4 * DAY) : null,
      buyer_confirmed_at: s[3] ? iso(S.now - s[3] * DAY) : null, auto_confirmed: false, shipping_address: null, payment_order_id: null,
      paid_at: s[0] === 'paid' ? iso(created + 0.02 * DAY) : null, created_at: iso(created),
    };
  });
}
export function fakeAdminReports() {
  const rows = [
    ['listing', '사기/거래 위반 — 입금 후 발송 안내가 없고 연락이 끊겼어요', 'pending', 0],
    ['transaction', '허위/부적절한 내용 — 카드 상태가 설명과 달라요', 'pending', 1],
    ['user', '욕설/비방 — 채팅에서 반복적으로 욕설을 했어요', 'pending', 1],
    ['listing', '스팸/광고 — 외부 거래 유도 문구가 있어요', 'pending', 2],
    ['review', '허위/부적절한 내용 — 거래와 무관한 후기예요', 'resolved', 4],
    ['transaction', '사기/거래 위반 — 다른 카드가 도착했어요', 'resolved', 6],
    ['listing', '기타 — 사진이 다른 사람 게시글과 같아요', 'dismissed', 8],
    ['user', '스팸/광고 — 홍보성 메시지를 보냈어요', 'resolved', 9],
  ];
  return rows.map((r, i) => ({
    id: `5e000000-0000-4000-8000-0000000000${String(i).padStart(2, '0')}`, reported_type: r[0], reported_id: `6f000000-0000-4000-8000-0000000000${String(i).padStart(2, '0')}`,
    reason: r[1], status: r[2], admin_note: r[2] === 'pending' ? null : r[2] === 'resolved' ? '확인 후 경고 조치했습니다.' : '신고 사유를 확인할 수 없어 기각했습니다.',
    resolved_at: r[2] === 'pending' ? null : iso(S.now - (r[3] - 1) * DAY), created_at: iso(S.now - r[3] * DAY - 3600000 * (i + 1)),
    reporter_id: `4d000000-0000-4000-8000-0000000000${String(i).padStart(2, '0')}`, reporter_name: 'user***',
    target_label: r[0] === 'user' || r[0] === 'review' ? 'user***' : TITLES[(i + 2) % TITLES.length],
  }));
}
export const adminOverrides = [
  { match: /\/rest\/v1\/rpc\/admin_payment_cancel_detail/, method: 'POST', json: () => ({ ledger: null }) },
  {
    match: /\/rest\/v1\/rpc\/admin_escrow_detail/, method: 'POST',
    json: (req) => {
      const id = (req.postDataJSON() || {}).p_transaction_id || '';
      const disputed = id.endsWith('03');
      const t0 = S.now - 2 * DAY;
      return {
        tid: 'FDXdemo-tid', confirm_mail: null,
        job: { status: 'done', attempts: 1, last_error: null, next_attempt_at: null },
        deliveries: [{ result_code: 'C000', result_msg: '정상 처리', carrier_name: 'CJ대한통운', invoice_no: '6994-****-****', registered_at: iso(t0), created_at: iso(t0) }],
        events: [{ status_code: '10', result_code: '0000', amount: 33500, signature_ok: true, received_at: iso(t0), process_error: null }, ...(disputed ? [{ status_code: '21', result_code: '0000', amount: 33500, signature_ok: true, received_at: iso(S.now - 0.6 * DAY), process_error: null }] : [])],
        nice_rejected_at: disputed ? iso(S.now - 0.6 * DAY) : null, payout_blocked: disputed, payment_status: 'paid', escrow_status: disputed ? 'disputed' : 'holding',
        refund: disputed ? { id: '8d000000-0000-4000-8000-000000000003', status: 'seller_rejected' } : null, report_open: disputed,
      };
    },
  },
  { match: /\/rest\/v1\/rpc\/admin_list_members/, method: 'POST', transform: (b) => (Array.isArray(b) ? b.slice(0, 14) : b) },
  { match: /\/rest\/v1\/rpc\/admin_transaction_summary/, method: 'POST', json: () => [{ paid_count: 1284, paid_amount: 148236000, paid_fee: 5188260, pending_count: 12, pending_amount: 236000 }] },
  { match: /\/rest\/v1\/rpc\/admin_list_transactions/, method: 'POST', json: (req) => { const b = req.postDataJSON() || {}; let r = fakeAdminTx(); if (b.p_status && b.p_status !== 'all') r = r.filter((x) => x.payment_status === b.p_status); if (b.p_listing_no) r = r.filter((x) => String(x.listing_no) === String(b.p_listing_no)); return r; } },
  { match: /\/rest\/v1\/rpc\/admin_list_reports/, method: 'POST', json: () => fakeAdminReports() },
];

// ── 정산(판매자) 가짜 값: 수수료 3.5%·최소 600원(feeCalculator.ts 코드 폴백)으로 다시 계산 — 복제 DB 시드 값(6.3%)을 쓰지 않는다 ──
export const sellerOverrides = [
  { match: /\/rest\/v1\/rpc\/get_transaction_cancel_summaries/, method: 'POST', json: () => [] },
  {
    match: /\/rest\/v1\/rpc\/get_transaction_settlement/, method: 'POST',
    json: (req) => {
      const id = (req.postDataJSON() || {}).p_transaction_id;
      const m = S.txMeta[id] || { amount: 12000, escrow: 'holding' };
      const fee = Math.max(600, Math.round(m.amount * 0.035));
      const paid = m.escrow === 'released';
      const day = (n) => iso(S.now + n * 86400000).slice(0, 10);
      return [{ fee_amount: fee, net_amount: m.amount - fee, payout_state: paid ? 'paid' : 'scheduled', payout_amount: m.amount - fee, payout_paid_at: paid ? day(-2) : null, payout_expected_at: paid ? null : day(6) }];
    },
  },
];
