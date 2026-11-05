// 보조: 헤더 워드마크 SVG 추출(media/wordmark.svg) + 마켓 목록 표시 건수 읽기(facts 근거). GET 만.
import fs from 'node:fs';
import { launch, mk, BASE, sleep, ROOT, tally } from './common.mjs';
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop');
  await page.goto(BASE + '/market/box', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await sleep(1000);
  const svg = await page.evaluate(() => {
    const a = document.querySelector('header a[href="/"]') || document.querySelector('a[href="/"]');
    const sv = [...a.querySelectorAll('svg')];
    return sv.map((s) => ({ w: s.getBoundingClientRect().width, h: s.getBoundingClientRect().height, html: s.outerHTML }));
  });
  console.log(svg.map((s) => [s.w, s.h, s.html.length]));
  const word = svg.sort((a, b) => b.w - a.w)[0];
  fs.writeFileSync(ROOT + '/sealkitt/media/wordmark.svg', word.html.replace(/currentColor/g, '#e6edf3').replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'));
  const counts = async (p) => {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await sleep(800);
    return page.evaluate(() => {
      const t = document.body.innerText;
      return { counts: [...t.matchAll(/([0-9][0-9,]*)\s*개/g)].map((m) => m[0]).slice(0, 6), tabs: [...document.querySelectorAll('[role=tablist][aria-label="마켓 종류"] [role=tab]')].map((e) => e.textContent.trim()), kpi: (t.match(/번개장터 매물 카드[^\n]*\n?[^\n]*/) || [''])[0].slice(0, 80) };
    });
  };
  console.log('box', JSON.stringify(await counts('/market/box')));
  console.log('pack', JSON.stringify(await counts('/market/pack')));
  tally(ctx, 'probe');
} finally { await browser.close(); }
