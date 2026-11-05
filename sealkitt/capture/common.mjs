// sealkitt 촬영 공통: 가드(운영 쓰기 차단)·가림 규칙·진입 헬퍼. 비밀값 없음.
import { launch, newContext, ROOT } from '../../tools/lib.mjs';
export { launch, ROOT };

export const BASE = 'https://sealkitt.com';

// 운영 DB 쓰기 방지:
//  - 비GET 은 lib 기본으로 가짜 200. 읽기인데 POST 인 것만 allow(근거: RECON 5-3).
//  - sealkitt.com 동일 출처 요청에만 x-sealkitt-verify: 1 (검색 로그 rpc 를 서버가 건너뜀). supabase.co 에는 안 붙음(host+path 에 'sealkitt.com' 포함 여부로만 매치).
//  - 열람 집계 rpc(record_*)는 사이트가 webdriver 면 안 보내지만, 한 번 더 가짜로 막는다.
//  - 푸시 구독 등 알림 생성은 기본 가로채기.
export const guard = {
  allow: [
    'sealkitt.com/api/revisit',
    /\/rest\/v1\/rpc\/get_wishlist_preview/,
    /\/rest\/v1\/rpc\/get_my_wishlist/,
  ],
  addHeaders: [{ match: 'sealkitt.com', headers: { 'x-sealkitt-verify': '1' } }],
  blockAll: [/\/rest\/v1\/rpc\/record_(card|product|recent)_view/],
};

export const redact = {
  remove: ['dl[aria-label="운영자 정보"]'],
  hide: [],
  names: [],
  ids: ['a[href^="/community/"] p > span.font-medium'],
  qrSelectors: [],
};

export async function mk(browser, vp, extra = {}) {
  const { ctx, page } = await newContext(browser, vp, {
    project: 'sealkitt',
    guard: { ...guard, ...(extra.guard || {}) },
    redact: { ...redact, ...(extra.redact || {}) },
    clock: !!extra.clock,
  });
  // Next 서버 액션(읽기: loadCards·resolveRecentCards·getPriceRefreshState 등)은 URL 로 구분 불가 → 통과시키되 목록을 남긴다.
  // 쓰기 액션(requestPriceRefresh·requestBrgPop·reportPrice)은 버튼을 누를 때만 호출되므로 촬영에서 누르지 않는다.
  ctx.__serverActions = [];
  // 서버 DB 카운터(api_rate_take)를 올리는 GET 호출 수 집계: /api/suggest · /api/search (+ /search?q= 페이지 GET)
  ctx.__calls = { suggest: 0, search_api: 0, search_page: 0, suggest_dict: 0, ebay_snkr_get: 0 };
  ctx.on('request', (r) => {
    let u; try { u = new URL(r.url()); } catch { return; }
    if (!u.hostname.endsWith('sealkitt.com')) return;
    if (u.pathname === '/api/suggest') ctx.__calls.suggest++;
    else if (u.pathname === '/api/search') ctx.__calls.search_api++;
    else if (u.pathname === '/search' && u.searchParams.has('q') && r.resourceType() === 'document') ctx.__calls.search_page++;
    else if (u.pathname === '/api/suggest-dict') ctx.__calls.suggest_dict++;
    else if (/^\/api\/(ebay-|snkr-)/.test(u.pathname)) ctx.__calls.ebay_snkr_get++;
  });
  await ctx.route((u) => u.hostname.endsWith('sealkitt.com'), async (route) => {
    const req = route.request();
    if (req.method() === 'POST' && req.headers()['next-action']) {
      const st = ctx.__prismStats;
      ctx.__serverActions.push(`${new URL(req.url()).pathname} action=${req.headers()['next-action'].slice(0, 8)} body=${(req.postData() || '').slice(0, 60)}`);
      st.allowed.push(`POST ${new URL(req.url()).pathname} (server action, read)`);
      return route.continue({ headers: { ...req.headers(), 'x-sealkitt-verify': '1' } });
    }
    return route.fallback();
  });
  return { ctx, page };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 홈: IntroSplash 가 사라질 때까지(최대 6s) 기다린다. 오버레이는 position fixed inset-0 의 #0B0F14.
export async function waitIntroGone(page) {
  await page.waitForFunction(() => {
    const els = [...document.querySelectorAll('body *')];
    return !els.some((el) => {
      const cs = getComputedStyle(el);
      return cs.position === 'fixed' && el.getBoundingClientRect().width >= innerWidth - 2 && el.getBoundingClientRect().height >= innerHeight - 2 && Number(cs.opacity) > 0.02 && /rgb\(11, 15, 20\)/.test(cs.backgroundColor) && el.children.length > 0 && el.querySelector('svg');
    });
  }, null, { timeout: 8000 }).catch(() => {});
  await sleep(500);
}

import fs from 'node:fs';
// 호출 수 누적(보고용): tmp/sk-tally.jsonl
export function tally(ctx, label) {
  const st = ctx.__prismStats;
  const row = { label, at: new Date().toISOString(), calls: ctx.__calls, intercepted: st.intercepted, intercepted_list: [...new Set(st.list)], allowed: [...new Set(st.allowed)], serverActions: ctx.__serverActions.length };
  fs.appendFileSync(ROOT + '/tmp/sk-tally.jsonl', JSON.stringify(row) + '\n');
  console.log('[tally]', JSON.stringify(row));
}
