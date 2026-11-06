// byclick A seq — 운영 랜딩의 「HOW IT WORKS」 단계 캐러셀이 다음 단계로 넘어가는 연출(모바일 390). GET 만.
import { launch, newContext, recordSeq, log } from '../../tools/lib.mjs';
const redact = { remove: ['footer'], textMap: { '장O규': '김○○', '865-87-': '○○○-○○-', '02901': '○○○○○' } };
const browser = await launch();
try {
  const { ctx, page } = await newContext(browser, 'mobile', { project: 'byclick', guard: {}, redact, clock: true });
  await page.goto('https://byclick.co.kr/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const y = await page.evaluate(() => Math.max(0, Math.round(document.querySelector('.carousel-dot').closest('section').getBoundingClientRect().top + window.scrollY - 70)));
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.locator('button.carousel-dot').nth(0).click();
  await page.waitForTimeout(1200);
  const r = await recordSeq(page, 'process-carousel', { durationMs: 3000, start: async () => { await page.locator('button.carousel-arrow[aria-label="다음 단계"]').click(); } });
  log('seq', JSON.stringify(r));
  console.log('intercepted', ctx.__prismStats.intercepted);
} finally { await browser.close(); }
