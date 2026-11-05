// 모바일 390×844 @3 페이지 캡처. 운영 GET, 비GET 가로챔.
import { launch, mk, BASE, waitIntroGone, sleep, tally } from './common.mjs';
import { capturePage } from '../../tools/lib.mjs';

const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'mobile');
  const go = async (path, name) => {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    if (path === '/') await waitIntroGone(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await sleep(800);
    const r = await capturePage(page, name);
    console.log('captured', name, r.full.docHeight, 'pii', r.full.pii_scan.total, r.view.pii_scan.total);
  };
  await go('/', 'home');
  await go('/search', 'search');
  await go('/search?q=' + encodeURIComponent('ㄹㅈㅁ'), 'search-results');
  await go('/cards/pokemon-card-jp-32317', 'card-jp');
  await go('/cards/optcgapi-OP13-007', 'card-multi-axis');
  tally(ctx, 'mobile-pages');
} finally { await browser.close(); }
