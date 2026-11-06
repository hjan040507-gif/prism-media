// A) seq — 운영 GET 만. page.clock 으로 시간을 멈추고 1/60초씩(recordSeq).
//   hero-crossfade: HeroCrossfade 6초 setInterval + 1400ms 불투명도 전환(전환 1초 전부터 4초)
//   matrix-to-detail: /product 공정 체계도 행 링크 클릭 → /product/<id> 상세로 이동
import { launch, newContext, recordSeq, recordScreencast, PROD, REDACT_PUBLIC, GUARD_PUBLIC, gotoReady, log } from './common.mjs';
const which = process.argv[2] || 'all';
const browser = await launch();
try {
  if (which === 'all' || which === 'hero') {
    const { page } = await newContext(browser, 'desktop', { project: 'hanil', guard: GUARD_PUBLIC, redact: REDACT_PUBLIC, clock: true });
    await gotoReady(page, PROD + '/');
    await page.waitForSelector('button[aria-label="히어로 배경 1"]', { timeout: 20000 });
    await page.waitForTimeout(800);
    const r = await recordSeq(page, 'hero-crossfade', {
      durationMs: 4000,
      start: async () => {
        // 활성 인디케이터 막대(6000ms 선형 transition)가 지금 어디쯤인지 = 마운트 뒤 경과. 전환(6000ms)까지 1초 남기고 시작한다.
        const ct = await page.evaluate(() => { const a = document.getAnimations().find((x) => { try { return x.effect.getComputedTiming().duration === 6000; } catch { return false; } }); return a ? a.__vtBase : null; });
        const delta = ct == null ? 0 : Math.max(0, 6000 - ct - 1000);
        log('bar ct', ct, 'advance', delta);
        if (delta) {
          await page.clock.runFor(delta);
          await page.evaluate((d) => { for (const a of document.getAnimations()) if (a.__vtBase !== undefined) a.__vtBase += d; window.__vtSync(0); }, delta);
        }
      },
    });
    log('hero seq', r.out, r.frames);
    await page.context().close();
  }
  if (which === 'all' || which === 'matrix') {
    const { page } = await newContext(browser, 'desktop', { project: 'hanil', guard: GUARD_PUBLIC, redact: REDACT_PUBLIC, clock: true });
    await gotoReady(page, PROD + '/product');
    await page.waitForTimeout(1200);
    const link = page.locator('a[aria-label="GAS NITRIDING 공정 상세 보기"]:visible').first();
    await link.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy({ top: -200, behavior: 'instant' }));
    await page.waitForTimeout(1500);
    const r = await recordSeq(page, 'matrix-to-detail', {
      durationMs: 4000,
      // 처음 0.7초는 체계도 화면 그대로 → 행 링크에 호버(0.75초) → 클릭(1.0초) → 상세로 전환
      perFrame: async (i) => {
        if (i === 45) await link.hover();
        if (i === 60) await link.click({ noWaitAfter: true });
      },
    });
    log('matrix seq', r.out, r.frames, page.url());
  }
} finally {
  await browser.close();
}
