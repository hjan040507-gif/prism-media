// seq/home-hero.mp4 — 홈 배너 캐러셀 자동 전환(AUTO_MS 6000, HomeBanner.tsx:15) 60fps 5초. 슬라이드가 한 번 넘어간 뒤 3초 지점에서 시작해 다음 전환을 담는다.
import { launch, mk, gotoPage } from './common.mjs';
import { recordSeq } from '../../tools/lib.mjs';
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop', { clock: true });
  await gotoPage(page, '/ko', { wait: 1500 });
  const idx = () => page.evaluate(() => (document.body.innerText.match(/(\d) \/ 5/) || [])[1] || '');
  const first = await idx();
  for (let i = 0; i < 60 && (await idx()) === first; i++) await page.waitForTimeout(500);
  await page.waitForTimeout(3000);
  const r = await recordSeq(page, 'home-hero', { durationMs: 5000 });
  console.log(JSON.stringify({ out: r.out, startedAfterSlide: first }));
  await ctx.close();
} finally { await browser.close(); }
