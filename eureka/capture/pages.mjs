// eureka 페이지 촬영(데스크톱·모바일). 실행: cd ~/prism-media && node eureka/capture/pages.mjs <desktop|mobile>
// 운영 https://nomorenusu.com 공개 화면(GET 만). /api/analytics/event·모든 비GET 가로챔(common.mjs).
import { launch, capturePage, log } from '../../tools/lib.mjs';
import { ctxFor, BASE, sectionShots, armRedact } from './common.mjs';

const vp = process.argv[2] || 'desktop';
const only = process.argv[3]; // 특정 항목만 다시 찍을 때
const POST = '/posts/20261031-october-extension-175';
const PAGES = [
  ['home', '/'],
  ['region-daechi', '/seoul/gangnam-gu/daechi-dong'],
  ['region-banghak', '/seoul/dobong-gu/banghak-dong'],
  ['posts', '/posts'],
  ['post-detail', POST],
];

const browser = await launch();
try {
  const { page, reqs } = await ctxFor(browser, vp);
  for (const [name, p] of PAGES) {
    if (only && only !== name && only !== 'sections') continue;
    if (only === 'sections' && name !== 'home') continue;
    await page.goto(BASE + p, { waitUntil: 'load' });
    await page.waitForTimeout(1800);
    await armRedact(page);
    if (only !== 'sections') { await capturePage(page, name); log('page', vp, name); }
    if (name === 'home' && (!only || only === 'home' || only === 'sections')) {
      await sectionShots(page, 'quote-form', '#quote-form', { topGap: 0 });
      log('section quote-form');
      await sectionShots(page, 'live-board', 'aside:has(ul[aria-live])', { topGap: vp === 'desktop' ? 120 : 110 });
      log('section live-board');
    }
  }
  const nonGet = reqs.filter((r) => r.m !== 'GET');
  log('비GET 시도(전부 가로챔):', nonGet.length, [...new Set(nonGet.map((r) => r.m + ' ' + new URL(r.u).pathname))]);
  log('gtag/GA 요청:', reqs.filter((r) => /googletagmanager|google-analytics|gtag|analytics\.google/.test(r.u)).length, '총 요청', reqs.length);
} finally {
  await browser.close();
}
