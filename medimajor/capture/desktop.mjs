// 데스크톱 1440 — 한국어 페이지 세트 + 매물 상세(실시간 입찰 흐름 포함). 운영 읽기 전용 + 가로채기.
import { launch, mk, gotoPage, LOT, ORIGIN, stats } from './common.mjs';
import { fakeRealtime, fakeHistory, pushBid, leadId, state } from './realtime.mjs';
import { capturePage, startFlow } from '../../tools/lib.mjs';
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop');
  await fakeHistory(ctx); await fakeRealtime(page);
  await gotoPage(page, '/ko'); await capturePage(page, 'home-ko');
  for (const [name, p] of [['auctions', '/auctions'], ['expo', '/expo'], ['wanted', '/wanted'], ['sell', '/sell']]) {
    await gotoPage(page, p, { wait: 1200 }); await capturePage(page, name);
  }
  // 매물 상세(허용 목록 1건 · UA 가 BOT 정규식에 걸림) + 실시간 입찰 흐름
  await gotoPage(page, '/auctions/' + LOT, { wait: 3000 });
  await capturePage(page, 'lot-detail');
  if (!state.joins.length) throw new Error('realtime join 없음');
  const flow = await startFlow(page, 'bid-live', { scrollY: 0 });
  await flow.step('start-13300000', { settleMs: 800 });
  for (let i = 1; i <= 4; i++) {
    pushBid(LOT, 13300000 + 100000 * i, 10 + i, leadId(i));
    await page.waitForTimeout(1500);
    await flow.step(`bid-${13300000 + 100000 * i}`, { note: `fake realtime push ${i}/4 (WebSocket postgres_changes intercepted, no real bid)`, settleMs: 600 });
  }
  console.log(JSON.stringify({ lotOpened: stats.lotOpened, lotUA: stats.lotUA, blockedLot: stats.blockedLot, ws: state.joins.length, pushes: state.pushes, fakeHist: state.historyFake }));
  await ctx.close();
} finally { await browser.close(); }
