// seq: 스크래치 긁기→당첨 공개 (모바일 390 · DSF3 · 60fps · page.clock 1/60초씩). play_event 가짜 응답. 마우스 드래그는 프레임마다 한 걸음.
import { launch, mk, BASE, sleep } from './common.mjs';
import { recordSeq } from '../../tools/lib.mjs';
const WIN = { result: '스타벅스 1만원권', already_participated: false, reward_id: 'x', slot_number: 1, participant_id: 'x' };
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'mobile', { clock: true, guard: { fake: [
    { match: /\/api\/auth\/session-verify/, method: 'POST', json: { ok: false } },
    { match: /\/rest\/v1\/rpc\/play_event/, method: 'POST', json: WIN },
  ] } });
  await page.goto(`${BASE}/e/demo-scratch-premium`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await sleep(2500);
  for (const cb of await page.locator('input[type=checkbox]').all()) await cb.check();
  await page.evaluate(() => window.scrollTo(0, 250));
  await sleep(500);
  await page.getByRole('button', { name: '스크래치 시작' }).click({ noWaitAfter: true }); // 시작은 영상 앞 — 응답이 들어온 뒤부터 녹화
  await sleep(2500);
  await page.evaluate(() => window.scrollTo(0, 250));
  const box = await page.locator('canvas').first().boundingBox();
  const x0 = box.x + 16, x1 = box.x + box.width - 16;
  // 프레임 30~ 에 누르고, 매 프레임 15px 씩 지그재그(행 간격 20px)
  const ptAt = (n) => { // n: 0.. 이동 스텝
    const perRow = Math.ceil((x1 - x0) / 15);
    const row = Math.floor(n / perRow), k = n % perRow;
    const x = row % 2 === 0 ? x0 + k * 15 : x1 - k * 15;
    return [x, box.y + 16 + row * 20];
  };
  let down = false, n = 0;
  const r = await recordSeq(page, 'scratch-reveal', {
    durationMs: 6000,
    perFrame: async (i) => {
      if (i < 30) return;
      if (!down) { const [x, y] = ptAt(0); await page.mouse.move(x, y); await page.mouse.down(); down = true; }
      if (n < 190) { const [x, y] = ptAt(n++); await page.mouse.move(x, y); }
      else if (down) { await page.mouse.up(); down = false; }
    },
  });
  console.log(r);
} finally { await browser.close(); }
