// matchsat 페이지 촬영(데스크톱 1440 + 모바일 390). 로컬 사본·로컬 DB 만. 상태 흐름(입찰 제출)은 DB 를 바꾸므로 cap-flows.mjs 에서 맨 마지막에.
// 실행: set -a; . tmp/matchsat-pw.env; set +a; node matchsat/capture/cap-pages.mjs [desktop|mobile]
import { launch } from '../../tools/lib.mjs';
import { capturePage } from '../../tools/lib.mjs';
import { ctxFor, open, ids, tryDo } from './common.mjs';

const WHICH = process.argv[2] || 'all';
const I = ids();
const browser = await launch();
try {
  if (WHICH === 'all' || WHICH === 'desktop') {
    // 비로그인: 메인
    {
      const { ctx, page } = await ctxFor(browser, 'desktop', null);
      await tryDo('desktop home', async () => { await open(page, '/'); await capturePage(page, 'home'); });
      await ctx.close();
    }
    // 수요자 A(A기관): 위성영상주문(수요 등록) · 받은 입찰 · 주문 수정
    {
      const { ctx, page } = await ctxFor(browser, 'desktop', 'reqA');
      await tryDo('desktop rfq-new', async () => { await open(page, '/rfqs/new'); await capturePage(page, 'rfq-new'); });
      await tryDo('desktop rfq-owner-bids', async () => { await open(page, `/rfqs/${I.bidded}`); await capturePage(page, 'rfq-owner-bids'); });
      await tryDo('desktop rfq-edit', async () => { await open(page, `/rfqs/new?edit=${I.edit}`); await capturePage(page, 'rfq-edit'); });
      await ctx.close();
    }
    // 공급자 A(A위성): 주문 입찰 목록 · 입찰 폼 · 지정 주문 카드 · 매칭
    {
      const { ctx, page } = await ctxFor(browser, 'desktop', 'supA');
      await tryDo('desktop rfqs', async () => { await open(page, '/rfqs'); await capturePage(page, 'rfqs'); });
      await tryDo('desktop rfq-bid', async () => { await open(page, `/rfqs/${I.urgent}`); await capturePage(page, 'rfq-bid'); });
      await tryDo('desktop rfq-designated', async () => { await open(page, `/rfqs/${I.spPending}`); await capturePage(page, 'rfq-designated'); });
      await tryDo('desktop matches-supplier', async () => { await open(page, '/matches'); await capturePage(page, 'matches-supplier'); });
      await ctx.close();
    }
    // 수요자 B(B기관): 매칭 내역(입금 계좌·정보 공개)
    {
      const { ctx, page } = await ctxFor(browser, 'desktop', 'reqB');
      await tryDo('desktop matches-requester', async () => { await open(page, '/matches'); await capturePage(page, 'matches-requester'); });
      await ctx.close();
    }
    // 관리자
    {
      const { ctx, page } = await ctxFor(browser, 'desktop', 'admin');
      await tryDo('desktop admin', async () => { await open(page, '/admin'); await capturePage(page, 'admin'); });
      await tryDo('desktop admin-members', async () => { await open(page, '/admin/members'); await capturePage(page, 'admin-members'); });
      await tryDo('desktop admin-reports', async () => { await open(page, '/admin/reports'); await capturePage(page, 'admin-reports'); });
      await ctx.close();
    }
  }
  if (WHICH === 'all' || WHICH === 'mobile') {
    {
      const { ctx, page } = await ctxFor(browser, 'mobile', null);
      await tryDo('mobile home', async () => { await open(page, '/'); await capturePage(page, 'home'); });
      await ctx.close();
    }
    {
      const { ctx, page } = await ctxFor(browser, 'mobile', 'supA');
      await tryDo('mobile rfqs', async () => { await open(page, '/rfqs'); await capturePage(page, 'rfqs'); });
      await tryDo('mobile rfq-bid', async () => { await open(page, `/rfqs/${I.urgent}`); await capturePage(page, 'rfq-bid'); });
      await ctx.close();
    }
    {
      const { ctx, page } = await ctxFor(browser, 'mobile', 'reqA');
      await tryDo('mobile rfq-new', async () => { await open(page, '/rfqs/new'); await capturePage(page, 'rfq-new'); });
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}
