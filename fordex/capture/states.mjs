// fordex 상태 흐름(모바일 390×844 DSF3) — 같은 뷰포트·같은 스크롤(window 0 · 안쪽 스크롤 고정)에서 단계마다 한 장.
//  tx-timeline   : 거래 진행(주문 생성 → 결제 완료 → 발송 처리 → 배송 중 → 구매확정) — 거래 상세 타임라인. 단계는 가짜 응답으로 바꾼다(복제 DB 무변경).
//  auction-bid   : 경매 입찰(입찰 전 → 입찰창 → 금액 입력 → 제출 후). place_bid_v2 는 가짜 응답, 현재가·입찰 내역은 가짜 상태 기계.
//  checkout-pay  : 결제 화면 수단·약관 선택(결제하기는 누르지 않는다).
// 실행: cd ~/prism-media && node fordex/capture/states.mjs [tx-timeline|auction-bid|checkout-pay]
import { launch, open, toMyPage, toHome, waitIdle, WEB } from './common.mjs';
import { installFake } from './fake.mjs';
import { S, priceOverrides, auctionOverrides, patchRows, installBidFake, seedBids } from './data.mjs';
import { startFlow } from '../../tools/lib.mjs';
import { innerScrollTo, innerScrollY } from './rn.mjs';

const LISTING = process.env.FORDEX_LISTING || '9ce09697-523a-4c1e-a386-14cc80399c2e';
const AUCTION = process.env.FORDEX_AUCTION || 'c2b733c9-c3be-425f-b315-45c889eeaf25';
const TX = 'e9901334-10f0-4027-ac93-0cabfa88d712';
const which = process.argv[2] || 'all';
const log = (m) => console.log(new Date().toISOString().slice(11, 19), m);

async function ctxFor(browser, role) {
  const { ctx, page } = await open(browser, 'mobile', role);
  await installFake(ctx, { overrides: [...priceOverrides, ...auctionOverrides], patch: patchRows });
  await installBidFake(ctx);
  page.on('dialog', (d) => d.accept().catch(() => {}));
  page.on('pageerror', (e) => console.log('PAGEERR', String(e).slice(0, 160)));
  await page.goto(WEB + '/', { waitUntil: 'domcontentloaded' });
  await waitIdle(page, 2500);
  return { ctx, page };
}
const stepAt = async (flow, page, y, desc, note) => {
  await innerScrollTo(page, y);
  const got = await innerScrollY(page);
  if (Math.abs(got - y) > 1) throw new Error(`안쪽 스크롤 ${got} ≠ ${y} (${desc})`);
  return flow.step(desc, { note });
};

const browser = await launch();
try {
  S.auctionId = AUCTION;
  if (which === 'all' || which === 'tx-timeline') {
    const { ctx, page } = await ctxFor(browser, 'buyer');
    S.txFilter = TX;
    const flow = await startFlow(page, 'tx-timeline');
    for (const [stage, desc] of [['created', 'order-created'], ['paid', 'paid-escrow-holding'], ['shipped', 'shipped'], ['confirmed', 'purchase-confirmed']]) {
      S.stage = stage; log(`tx ${stage}`);
      await toMyPage(page, 'Purchases'); await waitIdle(page, 900);
      await toMyPage(page, 'TransactionDetail', { transactionId: TX }); await waitIdle(page, 2000);
      await stepAt(flow, page, 0, desc, `거래 단계 가짜 응답(stage=${stage})`);
    }
    console.log('intercepted', ctx.__prismStats.intercepted, JSON.stringify(ctx.__prismStats.list), 'ext', JSON.stringify([...new Set(ctx.__ext)]));
    await ctx.close();
  }
  if (which === 'all' || which === 'auction-bid') {
    S.stage = 'paid'; S.txFilter = null;
    seedBids(3);
    const { ctx, page } = await ctxFor(browser, 'buyer');
    await toHome(page, 'ListingDetail', { listingId: AUCTION }); await waitIdle(page, 2500);
    const flow = await startFlow(page, 'auction-bid');
    log('bid 01'); await stepAt(flow, page, 0, 'before-bid', '입찰 전: 현재가·입찰 3건(가짜)');
    await page.getByText('입찰하기', { exact: true }).locator('visible=true').last().click(); await waitIdle(page, 1200);
    log('bid 02'); await stepAt(flow, page, 0, 'bid-modal-open', '입찰창(BidModal) 열림');
    await page.getByText('+10,000', { exact: true }).locator('visible=true').first().click(); await page.waitForTimeout(500);
    log('bid 03'); await stepAt(flow, page, 0, 'amount-entered', '빠른 증액 +10,000 선택 → 금액 입력됨');
    await page.getByText('입찰', { exact: true }).locator('visible=true').last().click(); await waitIdle(page, 2200);
    log('bid 04'); await stepAt(flow, page, 0, 'bid-submitted', '제출 후: place_bid_v2 가짜 응답, 현재가·입찰 내역 갱신');
    console.log('bids', S.bids.length, 'intercepted', ctx.__prismStats.intercepted, JSON.stringify(ctx.__prismStats.list.slice(-3)), 'ext', JSON.stringify([...new Set(ctx.__ext)]));
    await ctx.close();
  }
  if (which === 'all' || which === 'checkout-pay') {
    const { ctx, page } = await ctxFor(browser, 'buyer');
    await toMyPage(page, 'Payment', { listingId: LISTING }); await waitIdle(page, 2500);
    const flow = await startFlow(page, 'checkout-pay');
    const Y = 540;
    log('pay 01'); await stepAt(flow, page, Y, 'bank-transfer-default', '결제 수단 기본(계좌이체)');
    await page.getByText('카드', { exact: true }).locator('visible=true').first().click(); await page.waitForTimeout(500);
    log('pay 02'); await stepAt(flow, page, Y, 'card-selected', '카드 선택');
    await page.getByText('안전결제 약관에 동의합니다.').locator('visible=true').first().click(); await page.waitForTimeout(500);
    log('pay 03'); await stepAt(flow, page, Y, 'terms-agreed', '안전결제 약관 동의(결제하기는 누르지 않음)');
    console.log('intercepted', ctx.__prismStats.intercepted, 'ext', JSON.stringify([...new Set(ctx.__ext)]));
    await ctx.close();
  }
} finally { await browser.close(); }
