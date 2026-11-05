// seq: 홈 IntroSplash (한 획 → 스탬프 → 워드마크 → 페이드). page.clock 으로 1/60초씩. 데스크톱 1440.
import { launch, mk, BASE, sleep, tally } from './common.mjs';
import { recordSeq } from '../../tools/lib.mjs';
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop', { clock: true });
  await page.goto(BASE + '/', { waitUntil: 'commit' });
  await page.waitForSelector('body', { state: 'attached' });
  const r = await recordSeq(page, 'home-intro-splash', { durationMs: 4000 });
  console.log(r);
  tally(ctx, 'seq-intro');
} finally { await browser.close(); }
