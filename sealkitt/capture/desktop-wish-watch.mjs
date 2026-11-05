// 데스크톱: 관심 카드 목록(/my/wishlist, 로그인 없이 localStorage) · 시세 알림 시트. POST /api/watch 는 가짜 성공.
import { launch, mk, BASE, sleep, tally } from './common.mjs';
import { capturePage } from '../../tools/lib.mjs';

const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop', {
    guard: { fake: [{ match: 'sealkitt.com/api/watch', method: 'POST', json: { id: 1, token: null, signedIn: false } }] },
  });
  for (const id of ['pokemon-card-jp-32317', 'pokemoncard-ko-BS2014001001', 'optcgapi-OP13-007']) {
    await page.goto(BASE + '/cards/' + id, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await sleep(800);
    await page.locator('button[aria-label="관심 추가"]:visible').first().click();
    await sleep(500);
  }
  await page.goto(BASE + '/my/wishlist', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await sleep(1500);
  const r = await capturePage(page, 'wishlist');
  console.log('wishlist', r.full.docHeight);

  await page.goto(BASE + '/cards/optcgapi-OP13-007', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await sleep(800);
  await page.getByRole('button', { name: '알림', exact: true }).first().click();
  await page.getByText('가격 알림').first().waitFor();
  await sleep(1500);
  const w = await capturePage(page, 'watch-sheet', { header: false });
  console.log('watch-sheet', w.view.docHeight);
  tally(ctx, 'desktop-wish-watch'); console.log(ctx.__serverActions);
} finally { await browser.close(); }
