// fordex 촬영 공통 — 로컬 복제 스택(게이트웨이 127.0.0.1:54400, 웹 정적 서버 127.0.0.1:8294)만 대상.
// 운영(fordex.co.kr · gwezmmnynoiqhzhgzuew.supabase.co · NICE)에는 접속하지 않는다: 브라우저 외부 호스트 요청은 전부 abort.
// 비밀값: 복제 합성 계정(*@replica.test) 로그인에 쓰는 anon 키·합성 비밀번호는 복제 레포 파일에서 실행 때만 읽고 출력·저장하지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import { launch, newContext, ROOT } from '../../tools/lib.mjs';

export const WEB = process.env.FORDEX_WEB || 'http://127.0.0.1:8294';
export const GW = 'http://127.0.0.1:54400';
const REPLICA = '/home/dev/fordex/replica';
export const SEED = JSON.parse(fs.readFileSync(path.join(REPLICA, 'seed-out.json'), 'utf8'));
const envFile = Object.fromEntries(fs.readFileSync(path.join(REPLICA, '.env.replica'), 'utf8').split('\n').filter(Boolean)
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '')]; }));
const PASSWORD = (fs.readFileSync(path.join(REPLICA, 'e2e/lib.mjs'), 'utf8').match(/const PASSWORD = '([^']+)'/) || [])[1];

let loginCount = 0;
export const loginCounter = () => loginCount;
const sessions = {};
// 복제 Auth 로그인(합성 계정). 복제 DB 의 auth.sessions 에 행이 남는 유일한 쓰기 — 역할당 1회, 수를 shots.md 에 적는다.
export async function sessionFor(role) {
  if (sessions[role]) return sessions[role];
  const email = SEED.users[role].email;
  loginCount++;
  const r = await fetch(`${GW}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: envFile.ANON_KEY, 'content-type': 'application/json' }, body: JSON.stringify({ email, password: PASSWORD }),
  });
  if (!r.ok) throw new Error(`login ${role} ${r.status}`);
  sessions[role] = await r.json();
  return sessions[role];
}

// 읽기 전용인데 POST 인 PostgREST RPC(근거: RECON.md 6절 + 각 함수 이름/호출 위치). 그 밖의 비GET 은 전부 가짜 성공.
export const READ_RPC = [
  'get_trade_mode', 'is_auction_enabled', 'get_auction_status', 'get_feature_flags', 'get_my_bid_listings', 'search_cards', 'search_listings',
  'autocomplete_search_keywords', 'autocomplete_card_names', 'card_grade_price', 'get_card_price_daily', 'get_featured_prices',
  'get_transaction_settlement', 'get_my_payout_account', 'admin_list_transactions', 'admin_escrow_detail', 'admin_unqueued_payout_units',
  'admin_partial_cancelled_txs', 'can_purchase_paid_skins', 'get_my_skins', 'list_shop_skins', 'get_ai_recognition_quota',
  'admin_payment_cancel_detail', 'get_transaction_cancel_summaries', 'admin_list_reports', 'admin_list_listings', 'admin_list_members', 'admin_payout_list', 'admin_transaction_summary', 'admin_bundle_summaries', 'admin_list_unpaid_auctions', 'admin_list_inquiries', 'admin_list_reviews', 'admin_pro_subscription_counts', 'admin_list_pro_subscriptions', 'admin_list_featured_prices', 'admin_search_cards', 'admin_list_user_skins', 'admin_list_portfolio_subscriptions',
  'get_portfolio_subscription', 'get_my_proxy_bid', 'get_auction_bid_history', 'get_seller_trust', 'get_nice_pay_methods', 'get_my_terms_status', 'get_transaction_pay_method', 'get_transaction_cancel_summary', 'is_blocked_pair', 'get_public_portfolio', 'can_delete_account',
  ...(process.env.EXTRA_READ_RPC ? process.env.EXTRA_READ_RPC.split(',') : []),
];
export const allowRpc = new RegExp(`/rest/v1/rpc/(${READ_RPC.join('|')})(\\?|$)`);

export const BASE_REDACT = {
  // 머리·꼬리 사업자정보(BusinessInfoFooter/HomeFooter)는 화면 확인 뒤 selector 를 더한다
  hide: [],
  remove: [],
  ids: [],
  names: [],
};

/** 복제 계정으로 로그인된 컨텍스트. 외부 호스트는 전부 abort(운영·NICE 차단). */
export async function open(browser, vp, role, { project = 'fordex', guard = {}, redact = {}, fake = [], clock = false } = {}) {
  const { ctx, page } = await newContext(browser, vp, {
    project, clock,
    guard: { allow: [allowRpc, ...(guard.allow || [])], fake, blockGet: guard.blockGet || [], blockAll: guard.blockAll || [] },
    redact: { ...BASE_REDACT, ...redact },
  });
  const ext = [];
  // 나중에 등록한 route 가 먼저 돈다 → 외부 호스트 abort 가 guard 보다 앞선다
  await ctx.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (['data:', 'blob:'].includes(u.protocol) || ['127.0.0.1', 'localhost'].includes(u.hostname)) return route.fallback();
    ext.push(u.hostname);
    return route.abort('blockedbyclient');
  });
  ctx.__ext = ext;
  if (role) {
    const s = await sessionFor(role);
    await ctx.addInitScript(([k, v]) => {
      if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(location.origin)) return;
      try { if (!localStorage.getItem(k)) localStorage.setItem(k, v); } catch { /* */ }
    }, ['sb-127-auth-token', JSON.stringify(s)]);
  }
  return { ctx, page };
}

export async function waitIdle(page, ms = 700) {
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch { /* realtime */ }
  await page.waitForTimeout(ms);
}

// replica/e2e/lib.mjs nav() 와 같은 방식: React fiber 에서 navigation 객체를 찾아 루트에서 navigate
export async function nav(page, screen, params) {
  await page.waitForFunction(() => !!document.getElementById('root')?.children.length, null, { timeout: 20000 });
  let ok = '';
  for (let i = 0; i < 30 && ok !== 'ok'; i++) {
    if (i) await page.waitForTimeout(500);
    ok = await page.evaluate(([screen, params]) => {
      const rootEl = document.getElementById('root');
      const key = Object.keys(rootEl).find((k) => k.startsWith('__reactContainer$'));
      if (!key) return 'no-fiber';
      const stack = [rootEl[key]];
      let navObj = null;
      while (stack.length && !navObj) {
        const f = stack.pop();
        if (!f) continue;
        const n = f.memoizedProps?.navigation;
        if (n && typeof n.navigate === 'function' && typeof n.getParent === 'function') { navObj = n; break; }
        if (f.sibling) stack.push(f.sibling);
        if (f.child) stack.push(f.child);
      }
      if (!navObj) return 'no-navigation';
      let r = navObj; while (r.getParent()) r = r.getParent();
      r.navigate(screen, params);
      return 'ok';
    }, [screen, params]);
  }
  if (ok !== 'ok') throw new Error(`nav failed: ${ok}`);
}
export const toMyPage = (page, screen, params) => nav(page, 'Main', { screen: 'MyPage', params: { screen, params, initial: false } });
export const toHome = (page, screen, params) => nav(page, 'Main', { screen: 'Home', params: { screen, params, initial: false } });

export async function visibleText(page) {
  return page.evaluate(() => document.body.innerText.slice(0, 3000));
}
export { launch, ROOT };
