// seq: 룰렛 회전→당첨 (모바일 390 · DSF3 · 60fps · page.clock 1/60초씩). play_event 가짜 응답.
import { launch, mk, BASE, sleep } from './common.mjs';
import { recordSeq } from '../../tools/lib.mjs';
const WIN = { result: '스타벅스 아메리카노', already_participated: false, reward_id: 'x', slot_number: 1, participant_id: 'x' };
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'mobile', { clock: true, guard: { fake: [
    { match: /\/api\/auth\/session-verify/, method: 'POST', json: { ok: false } },
    { match: /\/rest\/v1\/rpc\/play_event/, method: 'POST', json: WIN },
  ] } });
  await page.goto(`${BASE}/e/demo-roulette-mz-bright`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await sleep(2500);
  for (const cb of await page.locator('input[type=checkbox]').all()) await cb.check();
  await page.evaluate(() => window.scrollTo(0, 380));
  await sleep(500);
  const r = await recordSeq(page, 'roulette-spin-win', {
    durationMs: 6000,
    start: async () => { await page.getByRole('button', { name: '룰렛 시작' }).click({ noWaitAfter: true }); },
  });
  console.log(r);
} finally { await browser.close(); }
