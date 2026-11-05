// seq: 카드 상세 시세 차트 기간 전환 애니메이션(7일 → 90일 → 전체). page.clock 1/60초씩. 데스크톱 1440.
import { launch, mk, BASE, sleep, tally } from './common.mjs';
import { recordSeq } from '../../tools/lib.mjs';
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop', { clock: true });
  await page.goto(BASE + '/cards/optcgapi-OP13-007', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  await page.waitForSelector('[role=tablist][aria-label="기간 선택"]');
  await sleep(1500);
  const y = await page.evaluate(() => {
    const tl = document.querySelector('[role=tablist][aria-label="시세 축 선택"]');
    const card = tl.closest('div.rounded-card') || tl.parentElement;
    const top = Math.max(0, Math.round(card.getBoundingClientRect().top + window.scrollY - 112));
    window.scrollTo({ top, behavior: 'instant' });
    return top;
  });
  await sleep(600);
  const tab = (n) => page.locator('[role=tablist][aria-label="기간 선택"] [role=tab]', { hasText: n }).first();
  const r = await recordSeq(page, 'chart-period-switch', {
    durationMs: 3600,
    start: async () => { await tab('7일').click({ noWaitAfter: true }); },
    perFrame: async (i) => {
      if (i === 100) await tab('90일').click({ noWaitAfter: true });
      if (i === 170) await tab('전체').click({ noWaitAfter: true });
    },
  });
  console.log(r, 'scrollY', y);
  tally(ctx, 'seq-chart');
} finally { await browser.close(); }
