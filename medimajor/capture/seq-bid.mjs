// seq/bid-update.mp4 — 입찰 갱신 연출(가격 롤링 [data-mo=roll]) 60fps 6초. 가짜 Realtime 푸시를 perFrame 에서 보낸다.
import { launch, mk, gotoPage, LOT, stats } from './common.mjs';
import { fakeRealtime, fakeHistory, pushBid, leadId, state } from './realtime.mjs';
import { recordSeq, sleep } from '../../tools/lib.mjs';
const MARK = new Map([[48, 1], [126, 2], [204, 3], [282, 4]]); // 0.8s·2.1s·3.4s·4.7s
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop', { clock: true });
  await fakeHistory(ctx); await fakeRealtime(page);
  await gotoPage(page, '/auctions/' + LOT, { wait: 3000 });
  if (!state.joins.length) throw new Error('realtime join 없음');
  const r = await recordSeq(page, 'bid-update', {
    durationMs: 6000,
    perFrame: async (i) => {
      const k = MARK.get(i);
      if (k) { pushBid(LOT, 13300000 + 100000 * k, 10 + k, leadId(k)); await sleep(250); }
    },
  });
  console.log(JSON.stringify({ out: r.out, frames: r.frames, lotOpened: stats.lotOpened, lotUA: stats.lotUA, blockedLot: stats.blockedLot, pushes: state.pushes }));
  await ctx.close();
} finally { await browser.close(); }
