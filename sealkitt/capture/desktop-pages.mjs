// 데스크톱 1440 페이지 캡처(full·view·header). 운영 https://sealkitt.com, GET 위주 · 비GET 가로챔.
import { launch, mk, BASE, waitIntroGone, sleep, tally } from './common.mjs';
import { capturePage } from '../../tools/lib.mjs';

const CARD_KR = 'pokemoncard-ko-BS2014001001';
const CARD_JP = 'pokemon-card-jp-32317';
const CARD_MULTI = 'optcgapi-OP13-007'; // 국내·일본 두 축 활성(원피스)

const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop');
  const go = async (path, name, after) => {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    if (path === '/') await waitIntroGone(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    if (after) await after();
    const r = await capturePage(page, name);
    console.log('captured', name, r.full.docHeight, 'pii', r.full.pii_scan.total, r.view.pii_scan.total);
  };
  await go('/', 'home');
  await go('/search?q=' + encodeURIComponent('ㄹㅈㅁ'), 'search-chosung');
  await go('/search?q=OP01-120', 'search-code');
  await go('/cards/' + CARD_JP, 'card-jp');
  await go('/cards/' + CARD_KR, 'card-kr');
  await go('/cards/' + CARD_MULTI, 'card-multi-axis');
  await go('/market/box', 'market-box');
  await go('/for-shops', 'for-shops');
  await go('/shops', 'shops-empty');
  tally(ctx, 'desktop-pages');
} finally { await browser.close(); }
