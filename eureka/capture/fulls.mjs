// eureka *-full.png 다시 찍기(조각 이어 붙임) — fullPage 캡처가 장치 픽셀 16,384 를 넘으면 구간이 비는 문제 대응.
// 실행: cd ~/prism-media && node eureka/capture/fulls.mjs <desktop|mobile> [이름...]   (view·states 는 건드리지 않는다)
// 운영 https://nomorenusu.com 공개 화면 GET 만. /api/analytics/event·모든 비GET 가로챔(common.mjs).
import { launch, log } from '../../tools/lib.mjs';
import { ctxFor, BASE, sectionShots, armRedact, fullTiled } from './common.mjs';

const vp = process.argv[2] || 'desktop';
const only = process.argv.slice(3);
const PAGES = [
  ['home', '/'],
  ['region-daechi', '/seoul/gangnam-gu/daechi-dong'],
  ['region-banghak', '/seoul/dobong-gu/banghak-dong'],
  ['posts', '/posts'],
  ['post-detail', '/posts/20261031-october-extension-175'],
];

const browser = await launch();
try {
  const { page, reqs } = await ctxFor(browser, vp);
  for (const [name, p] of PAGES) {
    const sections = name === 'home' && (!only.length || only.includes('sections'));
    const pageFull = !only.length || only.includes(name);
    if (!pageFull && !sections) continue;
    await page.goto(BASE + p, { waitUntil: 'load' });
    await page.waitForTimeout(1800);
    await armRedact(page);
    if (pageFull) { const j = await fullTiled(page, name); log('full', vp, name, `${j.docHeight}px`, `${j.pii_scan.slices}조각`, `pii ${j.pii_scan.total}`); }
    if (sections) {
      let j = (await sectionShots(page, 'quote-form', '#quote-form', { viewToo: false })).full;
      log('section quote-form full', `${j.clip.height}px`, `${j.pii_scan.slices}조각`, `pii ${j.pii_scan.total}`);
      j = (await sectionShots(page, 'live-board', 'aside:has(ul[aria-live])', { viewToo: false })).full;
      log('section live-board full', `${j.clip.height}px`, `${j.pii_scan.slices}조각`, `pii ${j.pii_scan.total}`);
    }
  }
  const nonGet = reqs.filter((r) => r.m !== 'GET');
  log('비GET 시도(전부 가로챔):', nonGet.length, [...new Set(nonGet.map((r) => r.m + ' ' + new URL(r.u).pathname))]);
  log('gtag/GA 요청:', reqs.filter((r) => /googletagmanager|google-analytics|gtag|analytics\.google/.test(r.u)).length, '총 요청', reqs.length);
} finally {
  await browser.close();
}
