// 모바일 390×844 @3 — 홈 · 매물 상세(+실시간 입찰 흐름) · 판매 등록 안내. 같은 URL 의 반응형.
import { launch, mk, gotoPage, LOT, stats } from './common.mjs';
import { fakeRealtime, fakeHistory, pushBid, leadId, state } from './realtime.mjs';
import { capturePage, startFlow } from '../../tools/lib.mjs';
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'mobile');
  await fakeHistory(ctx); await fakeRealtime(page);
  await gotoPage(page, '/ko'); await capturePage(page, 'home');
  await gotoPage(page, '/sell', { wait: 1200 }); await capturePage(page, 'sell');
  await gotoPage(page, '/auctions', { wait: 1200 }); await capturePage(page, 'auctions');
  await gotoPage(page, '/auctions/' + LOT, { wait: 3000 });
  await capturePage(page, 'lot-detail');
  if (!state.joins.length) throw new Error('realtime join 없음');
  const flow = await startFlow(page, 'bid-live-mobile', { scrollY: 0 });
  await flow.step('start-13300000', { settleMs: 800 });
  for (let i = 1; i <= 4; i++) {
    pushBid(LOT, 13300000 + 100000 * i, 10 + i, leadId(i));
    await page.waitForTimeout(1500);
    await flow.step(`bid-${13300000 + 100000 * i}`, { note: `fake realtime push ${i}/4 (intercepted WebSocket, no real bid)`, settleMs: 600 });
  }
  console.log(JSON.stringify({ lotOpened: stats.lotOpened, lotUA: stats.lotUA, blockedLot: stats.blockedLot, pushes: state.pushes, fakeHist: state.historyFake }));
  await ctx.close();
} finally { await browser.close(); }
