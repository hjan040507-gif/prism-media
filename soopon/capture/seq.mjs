// seq A: 1440 홈 칩 클릭 → 결과 패널(개수·행) 갱신  /  seq B: 390 필터 시트 열림 → 칩 선택 → 결과 보기 (N개) 갱신
// page.clock 1/60초씩 runFor + getAnimations 동기화(lib recordSeq). 칩 클릭은 DOM click()(시계가 멈춘 동안 Playwright 클릭의 rAF 대기를 피한다).
import { launch, recordSeq, log } from '../../tools/lib.mjs';
import { ctxFor, BASE, armAddr } from './common.mjs';

const which = process.argv[2] ? process.argv[2].split(',') : ['A', 'B'];
const browser = await launch();
try {
  if (which.includes('A')) {
    const { ctx, page } = await ctxFor(browser, 'desktop', { clock: true });
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForSelector('[data-discovery-panel] button[aria-pressed]', { timeout: 15000 });
    await page.waitForTimeout(2500); await armAddr(page);
    const clickChip = (label) => page.evaluate((l) => { [...document.querySelectorAll('[data-discovery-panel] button[aria-pressed]')].find((b) => b.textContent.trim() === l).click(); }, label);
    // 이미지를 미리 캐시에 올린다(영상 중 이미지가 늦게 뜨지 않게) — 한 바퀴 돌고 조건 지우기
    for (const l of ['아이와', '자연체험', '경기']) { await clickChip(l); await page.waitForTimeout(700); }
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);
    await page.evaluate(() => [...document.querySelectorAll('[data-discovery-panel] button')].find((b) => b.textContent.trim() === '조건 지우기').click());
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo({ top: 540, behavior: 'instant' }));
    await page.mouse.move(40, 420);
    await page.waitForTimeout(800);
    const seq = ['아이와', '자연체험', '경기'];
    const at = [24, 108, 192];
    await recordSeq(page, 'home-filter-results', { durationMs: 4500, perFrame: async (i) => { const k = at.indexOf(i); if (k >= 0) await clickChip(seq[k]); } });
    await ctx.close(); log('seq A ok');
  }
  if (which.includes('B')) {
    const { ctx, page } = await ctxFor(browser, 'mobile', { clock: true });
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForSelector('[data-discovery-pickers] button', { timeout: 15000 });
    await page.waitForTimeout(2500); await armAddr(page);
    const SY = await page.evaluate(() => Math.round(document.querySelector('#discovery-heading').getBoundingClientRect().top + window.scrollY - 84));
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), SY);
    await page.waitForTimeout(800);
    const sheetChip = (l) => page.evaluate((x) => { const d = document.querySelector('[role=dialog][data-sheet]'); [...d.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(x)).click(); }, l);
    await recordSeq(page, 'mobile-filter-sheet', {
      durationMs: 5000,
      start: async () => { await page.evaluate(() => document.querySelector('[data-discovery-pickers] button').click()); },
      perFrame: async (i) => {
        if (i === 100) await sheetChip('아이와');
        if (i === 200) await sheetChip('자연체험');
      },
    });
    await ctx.close(); log('seq B ok');
  }
} finally { await browser.close(); }
