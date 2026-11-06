// sellfit 촬영 공통: 가드(운영 쓰기 차단)·가림 규칙. 비밀값 없음. 로그인 없음, 운영 https://sellfit.vercel.app 공개 화면 GET 만.
import fs from 'node:fs';
import { launch, newContext, liveRedact, ROOT } from '../../tools/lib.mjs';
export { launch, ROOT };
export const BASE = 'https://sellfit.vercel.app';

// 비GET 은 lib 기본으로 가짜 200(홈을 안 찍으므로 /api/codi-cover-dims 는 안 나가지만 방어). allow 없음.
// Supabase REST 쓰기(좋아요·찜)도 비GET 이라 기본 가로챔.
export const guard = {
  fake: [{ match: 'sellfit.vercel.app/api/codi-cover-dims', method: 'POST', json: { ok: true } }],
};

// 판매자 아바타·'비슷한 코디' 섹션은 remove(자리 유지), 판매자 닉네임은 ids. 스플래시·홈 화면 추가 안내는 hide.
export const redact = {
  remove: ['a[href^="/users/"] img', 'a[href^="/users/"] svg', '[data-pr-codi="1"]'],
  hide: ['#splash-root', '[role="dialog"][aria-label*="홈 화면에 추가"]'],
  names: [],
  ids: ['a[href^="/users/"] > span.font-semibold'],
};

export async function mk(browser, vp, extra = {}) {
  const { ctx, page } = await newContext(browser, vp, {
    project: 'sellfit',
    guard: { ...guard, ...(extra.guard || {}) },
    redact: { ...redact, ...(extra.redact || {}) },
    clock: !!extra.clock,
  });
  return { ctx, page };
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// '비슷한 코디' h2 를 가진 섹션에 표시(redact.remove 가 visibility:hidden 으로 자리 유지하며 지움)
export async function markRelatedCodis(page) {
  await page.evaluate(() => {
    for (const h of document.querySelectorAll('h2')) {
      if ((h.textContent || '').includes('비슷한 코디')) (h.closest('section') || h.parentElement).setAttribute('data-pr-codi', '1');
    }
  });
}

// 이동 + 스플래시/설치 안내 가림 + 비슷한 코디 표시 + 로딩 대기
export async function go(page, path) {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  await liveRedact(page, true);
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  await markRelatedCodis(page);
  await sleep(1500);
  await liveRedact(page, true);
}
export const PRODUCTS = {
  'bape-shark': '/products/62610461-b496-43b1-88fa-b41b688ecc90',
  'polo-italy': '/products/26582015-8951-4d02-ab1e-39f39a1ca469',
  'palace-knit': '/products/e275d237-9cef-493e-9193-adf6c1adb402',
};
export function tally(ctx, label) {
  const st = ctx.__prismStats;
  const row = { label, at: new Date().toISOString(), intercepted: st.intercepted, intercepted_list: [...new Set(st.list)], allowed: [...new Set(st.allowed)] };
  fs.appendFileSync(ROOT + '/tmp/sf-tally.jsonl', JSON.stringify(row) + '\n');
  console.log('[tally]', JSON.stringify(row));
}
