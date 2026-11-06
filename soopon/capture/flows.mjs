// 상태 흐름: ① desktop home-filter-chips(칩 누적) ② mobile home-filter-sheet(시트 열기→칩→결과 수)
//           ③ desktop programs-filter-chips(결과 목록 URL 필터) — 모두 운영 공개 GET, 같은 뷰포트·같은 scrollY
import { launch, startFlow, log } from '../../tools/lib.mjs';
import { ctxFor, BASE, armAddr } from './common.mjs';

const which = process.argv[2] ? process.argv[2].split(',') : ['chips', 'sheet', 'plist'];
const imagesDone = (page) => page.evaluate(async () => {
  const imgs = [...document.images].filter((i) => !i.complete);
  await Promise.race([Promise.all(imgs.map((i) => new Promise((r) => { i.onload = i.onerror = r; }))), new Promise((r) => setTimeout(r, 6000))]);
  for (const a of document.getAnimations()) { try { const t = a.effect.getComputedTiming(); if (t.iterations !== Infinity) a.finish(); } catch {} }
});
const hydrated = (page) => page.waitForFunction(() => document.querySelector('[data-discovery-panel] button[aria-pressed]') || document.querySelector('[data-filter-panel] button'), null, { timeout: 15000 });

const browser = await launch();
try {
  if (which.includes('chips')) {
    const { ctx, page } = await ctxFor(browser, 'desktop');
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await hydrated(page); await page.waitForTimeout(2500); await armAddr(page);
    const SY = 540;
    const flow = await startFlow(page, 'home-filter-chips', { scrollY: SY });
    const chip = (label) => page.locator('[data-discovery-panel] button[aria-pressed]', { hasText: new RegExp(`^${label}$`) });
    const park = () => page.mouse.move(40, 420);
    await park();
    await flow.step('all-52', { settleMs: 800 });
    await chip('아이와').click(); await park(); await imagesDone(page);
    await flow.step('with-kids', { settleMs: 1200 });
    await chip('자연체험').click(); await park(); await imagesDone(page);
    await flow.step('plus-nature', { settleMs: 1200 });
    await chip('경기').click(); await park(); await imagesDone(page);
    await flow.step('plus-gyeonggi', { settleMs: 1200 });
    await ctx.close(); log('chips ok');
  }
  if (which.includes('sheet')) {
    const { ctx, page } = await ctxFor(browser, 'mobile');
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForSelector('[data-discovery-pickers] button', { timeout: 15000 }); await page.waitForTimeout(2500); await armAddr(page);
    const SY = await page.evaluate(() => Math.round(document.querySelector('#discovery-heading').getBoundingClientRect().top + window.scrollY - 84));
    const flow = await startFlow(page, 'home-filter-sheet', { scrollY: SY });
    await flow.step('pickers', { settleMs: 800 });
    await page.locator('[data-discovery-pickers] button').first().click();
    await page.waitForSelector('[role=dialog][data-sheet]', { timeout: 8000 }); await page.waitForTimeout(900);
    await flow.step('sheet-open', { settleMs: 800 });
    const dlg = page.locator('[role=dialog][data-sheet]');
    const pick = async (label, n) => { await dlg.getByRole('button', { name: new RegExp(`^${label}`) }).first().click(); await page.waitForFunction((k) => /결과 보기 \(\d+개\)/.test(document.querySelector('[role=dialog][data-sheet]').innerText), null, { timeout: 8000 }); await page.waitForTimeout(900); };
    await pick('아이와'); await flow.step('kids-count', { settleMs: 800 });
    await pick('자연체험'); await flow.step('plus-nature-count', { settleMs: 800 });
    await pick('경기'); await flow.step('plus-gyeonggi-count', { settleMs: 800 });
    await ctx.close(); log('sheet ok');
  }
  if (which.includes('plist')) {
    const { ctx, page } = await ctxFor(browser, 'desktop');
    await page.goto(BASE + '/programs', { waitUntil: 'load' });
    await page.waitForSelector('[data-filter-panel] button', { timeout: 15000 }); await page.waitForTimeout(2500); await armAddr(page);
    const flow = await startFlow(page, 'programs-filter-chips', { scrollY: 0 });
    const chip = (label) => page.locator('[data-filter-panel] button', { hasText: new RegExp(`^${label}$`) }).first();
    const park = () => page.mouse.move(40, 700);
    await park();
    await flow.step('all', { settleMs: 800 });
    for (const [lab, d] of [['아이와', 'with-kids'], ['자연체험', 'plus-nature']]) {
      await chip(lab).click(); await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {}); await park(); await page.waitForTimeout(1500); await imagesDone(page);
      await flow.step(d, { settleMs: 1000 });
    }
    await ctx.close(); log('plist ok');
  }
} finally { await browser.close(); }
