// 완성 이벤트 페이지(게임 4종): 모바일 390 + 데스크톱 1440. 운영 /e/demo-* 읽기만. 비콘·쓰기 가로챔.
import { launch, mk, BASE, sleep } from './common.mjs';
import { capturePage } from '../../tools/lib.mjs';
const EVENTS = [
  ['roulette', 'demo-roulette-mz-bright'],
  ['scratch', 'demo-scratch-premium'],
  ['quiz', 'demo-quiz-minimal'],
  ['stamp', 'demo-stamp-mz-bright'],
];
const only = process.argv.slice(2);
const browser = await launch();
try {
  for (const vp of ['mobile', 'desktop']) {
    const { page } = await mk(browser, vp, { guard: { fake: [{ match: /\/api\/auth\/session-verify/, method: 'POST', json: { ok: false } }] } });
    for (const [game, slug] of EVENTS) {
      if (only.length && !only.includes(game)) continue;
      await page.goto(`${BASE}/e/${slug}`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await sleep(2000);
      const name = vp === 'mobile' ? `event-${game}` : `game-${game}`;
      const r = await capturePage(page, name);
      console.log(vp, name, r.full.docHeight, 'pii', r.full.pii_scan.total, r.view.pii_scan.total, 'intercepted', r.view.intercepted.total);
    }
  }
} finally { await browser.close(); }
