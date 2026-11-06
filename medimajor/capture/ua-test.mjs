// BOT 정규식(레포 src/lib/lot-stats.ts:16, HEAD ec3dd74d)에 촬영 UA 가 걸리는지 시험 — 상세를 열기 전에 반드시 통과해야 한다.
import { launch, VIEWPORTS } from '../../tools/lib.mjs';
export const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview/i;
export const MARK = ' HeadlessChrome';
export async function baseUA(browser) {
  const c = await browser.newContext(); const p = await c.newPage();
  const ua = await p.evaluate(() => navigator.userAgent); await c.close(); return ua;
}
export function uaFor(vp, base) {
  const raw = vp === 'mobile' ? VIEWPORTS.mobile.userAgent : base;
  return raw.includes('HeadlessChrome') ? raw : raw + MARK;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const browser = await launch();
  const base = await baseUA(browser);
  await browser.close();
  const out = {};
  for (const vp of ['desktop', 'mobile']) { const ua = uaFor(vp, base); out[vp] = { ua, bot: BOT.test(ua) }; }
  console.log('default UA matches BOT:', BOT.test(base), '|', base);
  console.log(JSON.stringify(out, null, 1));
  process.exit(out.desktop.bot && out.mobile.bot ? 0 : 1);
}
