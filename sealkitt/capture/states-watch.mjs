// 상태 흐름 ⑤(추가): 카드 상세 '알림' 시트 — 열기 → 이 값 이상 선택 → 목표가 입력 → 알림 만들기(POST /api/watch 는 가짜 성공 {id:1,token:null}).
import { launch, mk, BASE, sleep, tally } from './common.mjs';
import { startFlow } from '../../tools/lib.mjs';
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop', {
    guard: { fake: [{ match: 'sealkitt.com/api/watch', method: 'POST', json: { id: 1, token: null, signedIn: false } }] },
  });
  await page.goto(BASE + '/cards/optcgapi-OP13-007', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await sleep(1000);
  const flow = await startFlow(page, 'watch-alert', { scrollY: 0 });
  await flow.step('card-detail', { settleMs: 300 });
  await page.getByRole('button', { name: '알림', exact: true }).first().click();
  await page.getByText('가격 알림').first().waitFor();
  await sleep(1500);
  await flow.step('sheet-open', { settleMs: 300 });
  await page.locator('[role=radio]', { hasText: '이 값 이상' }).first().click(); await sleep(500);
  const inp = page.locator('[aria-label="목표 가격"]');
  await inp.fill('30000'); await sleep(500);
  await flow.step('target-price-typed', { settleMs: 300 });
  await page.getByRole('button', { name: '알림 만들기' }).click();
  await sleep(1500);
  await page.locator('[role=status]').first().scrollIntoViewIfNeeded(); await sleep(400);
  await flow.step('created', { settleMs: 300 });
  console.log('status:', await page.locator('[role=status]').allTextContents());
  tally(ctx, 'states-watch');
} finally { await browser.close(); }
