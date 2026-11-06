// 가짜 Supabase Realtime(WebSocket, vsn 2.0.0 JSON 배열 프레임) — 서버에 연결하지 않고(connectToServer 호출 없음) 직접 응답한다.
// 근거: 클라이언트 AuctionLiveProvider.tsx:255-278 (channel auction-<id> · postgres_changes UPDATE · public.auctions · filter id=eq.<id>)
import { SUPABASE_HOST, LOT } from './common.mjs';

export const state = { sockets: [], joins: [], recv: 0, sent: 0, pushes: 0, hbs: 0, historyFake: 0, historyReal: 0, bids: null, count: 10, price: 13300000 };
let nextId = 90000;

export async function fakeRealtime(page) {
  await page.routeWebSocket(/realtime\/v1\/websocket/, (ws) => {
    state.sockets.push(ws);
    ws.onMessage((raw) => {
      state.recv++;
      let f; try { f = JSON.parse(String(raw)); } catch { return; }
      if (!Array.isArray(f)) return;
      const [jr, ref, topic, event, payload] = f;
      const reply = (response = {}) => { state.sent++; ws.send(JSON.stringify([jr, ref, topic, 'phx_reply', { status: 'ok', response }])); };
      if (event === 'heartbeat') { state.hbs++; return reply(); }
      if (event === 'phx_join') {
        const pgs = (payload?.config?.postgres_changes || []).map((p) => ({ ...p, id: nextId++ }));
        state.joins.push({ topic, pg: pgs.map((p) => `${p.event} ${p.table} ${p.filter}`) });
        (state.topicIds ||= {})[topic] = pgs.map((p) => p.id);
        return reply({ postgres_changes: pgs });
      }
      if (event === 'phx_leave') return reply();
      // access_token·presence·broadcast 등은 무시
    });
  });
}

// auctions UPDATE 푸시 (입찰가 갱신) — 바깥 가짜 프레임. record 에는 클라이언트가 읽는 필드만(current_price·bid_count·leading_bid_id).
export function pushBid(auctionId, price, count, leadingBidId) {
  const topic = `realtime:auction-${auctionId}`;
  const ids = state.topicIds?.[topic];
  if (!ids || !state.sockets.length) throw new Error('채널 join 이 아직 없다');
  const frame = [null, null, topic, 'postgres_changes', {
    ids,
    data: { schema: 'public', table: 'auctions', commit_timestamp: new Date().toISOString(), type: 'UPDATE', columns: [], errors: null,
      record: { id: auctionId, current_price: price, bid_count: count, leading_bid_id: leadingBidId },
      old_record: { id: auctionId } },
  }];
  for (const ws of state.sockets) { try { ws.send(JSON.stringify(frame)); state.sent++; } catch {} }
  state.pushes++; state.t0 ||= Date.now();
  state.price = price; state.count = count;
}

const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
// public_bids GET 가로채기: 진짜 응답을 읽어(GET) 위에 가짜 새 입찰 행을 얹는다. 푸시 전에는 진짜 그대로 통과.
export async function fakeHistory(ctx) {
  await ctx.route(new RegExp(`${SUPABASE_HOST.replace(/\./g, '\\.')}/rest/v1/public_bids`), async (route) => {
    const req = route.request();
    if (req.method() !== 'GET') return route.fallback();
    if (state.pushes === 0) { state.historyReal++; return route.fallback(); }
    if (!state.base) { const r = await route.fetch(); state.base = await r.json(); }
    const rows = [];
    for (let i = 0; i < state.pushes; i++) {
      rows.unshift({ id: uuid(i + 1), amount: 13300000 + 100000 * (i + 1), created_at: new Date(state.t0 - (state.pushes - 1 - i) * 120000).toISOString(), bidder_masked: 'user***', is_mine: false, is_auto: false });
    }
    state.historyFake++;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([...rows, ...state.base]) });
  });
}
export const leadId = (i) => uuid(i);
