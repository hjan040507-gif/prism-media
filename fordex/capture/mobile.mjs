// fordex 모바일(390×844 DSF3) 페이지 촬영 — 로컬 복제 스택 + 가짜 값 층. 실행: cd ~/prism-media && node fordex/capture/mobile.mjs [buyer|seller|ident] (생략 시 전부)
import { launch, open, nav, toMyPage, toHome, waitIdle, WEB } from './common.mjs';
import { installFake } from './fake.mjs';
import { S, priceOverrides, auctionOverrides, patchRows, installBidFake, seedBids, sellerOverrides } from './data.mjs';
import { captureRN } from './rn.mjs';

const LISTING = process.env.FORDEX_LISTING || '9ce09697-523a-4c1e-a386-14cc80399c2e'; // 판매중 고정가 매물(복제 DB)
const AUCTION = process.env.FORDEX_AUCTION || 'c2b733c9-c3be-425f-b315-45c889eeaf25'; // 경매 매물(복제 DB, 시간·현재가는 가짜)
const CARD = '28900000-0000-4000-8000-0000000000c5';
const TX = 'e9901334-10f0-4027-ac93-0cabfa88d712';
const which = process.argv[2] || 'all';
const TEXTMAP = { '정승진': '', '751-13-02955': '', '031-657-7808': '' };

async function ctxFor(browser, role) {
  const { ctx, page } = await open(browser, 'mobile', role, { redact: { textMap: TEXTMAP } });
  await installFake(ctx, { overrides: [{ match: /\/rest\/v1\/listings\?.*card_id=eq/, method: 'GET', transform: (b) => (Array.isArray(b) ? b.filter((x) => x.sale_type !== 'auction').slice(0, 4) : b) }, ...sellerOverrides, ...priceOverrides, ...auctionOverrides], patch: patchRows });
  await installBidFake(ctx);
  page.on('dialog', (d) => d.accept().catch(() => {}));
  page.on('pageerror', (e) => console.log('PAGEERR', String(e).slice(0, 160)));
  await page.goto(WEB + '/', { waitUntil: 'domcontentloaded' });
  await waitIdle(page, 2500);
  return { ctx, page };
}
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const log = (m) => console.log(new Date().toISOString().slice(11, 19), m);
const want = (n) => !ONLY || ONLY.includes(n);
const cap = (page, n) => (want(n) ? captureRN(page, n) : null);
const go = async (page, fn, ms = 2200) => { await fn(); await waitIdle(page, ms); };

const browser = await launch();
try {
  S.auctionId = AUCTION; seedBids(3);
  if (which === 'all' || which === 'buyer') {
    const { ctx, page } = await ctxFor(browser, 'buyer');
    S.stage = 'shipped';
    log('home'); await cap(page, 'home');
    log('card-detail'); await go(page, () => toHome(page, 'CardDetail', { cardId: CARD })); await cap(page, 'card-detail');
    log('listing-detail'); await go(page, () => toHome(page, 'ListingDetail', { listingId: LISTING })); await cap(page, 'listing-detail');
    log('report-modal');
    await page.getByText('이 매물 신고하기').first().click(); await waitIdle(page, 1200);
    await cap(page, 'report-modal');
    await page.keyboard.press('Escape'); await waitIdle(page, 600);
    log('escrow-checkout'); await go(page, () => toMyPage(page, 'Payment', { listingId: LISTING })); await cap(page, 'escrow-checkout');
    log('purchases'); await go(page, () => toMyPage(page, 'Purchases')); await cap(page, 'purchases');
    log('tx-progress'); await go(page, () => toMyPage(page, 'TransactionDetail', { transactionId: TX })); await cap(page, 'tx-progress');
    log('refund-request');
    await page.getByText('환불 요청', { exact: true }).first().click(); await waitIdle(page, 1200);
    await cap(page, 'refund-request');
    await page.keyboard.press('Escape'); await waitIdle(page, 600);
    log('auction-list'); await go(page, () => toHome(page, 'Home'));
    await page.getByText('경매', { exact: true }).locator('visible=true').first().click(); await waitIdle(page, 2500);
    await cap(page, 'auction-list');
    log('auction-detail'); await go(page, () => toHome(page, 'ListingDetail', { listingId: AUCTION })); await cap(page, 'auction-detail');
    console.log('intercepted', ctx.__prismStats.intercepted, 'allowed', JSON.stringify([...new Set(ctx.__prismStats.allowed)]), 'ext', JSON.stringify([...new Set(ctx.__ext)]));
    await ctx.close();
  }
  if (which === 'all' || which === 'seller') {
    const { ctx, page } = await ctxFor(browser, 'seller');
    log('settlement'); await go(page, () => toMyPage(page, 'Settlement')); await cap(page, 'settlement');
    log('sales'); await go(page, () => toMyPage(page, 'Sales')); await cap(page, 'sales');
    console.log('intercepted', ctx.__prismStats.intercepted, 'ext', JSON.stringify([...new Set(ctx.__ext)]));
    await ctx.close();
  }
  if (which === 'all' || which === 'ident') {
    S.unverified = true;
    const { ctx, page } = await ctxFor(browser, 'buyer2');
    log('identity-guide'); await go(page, () => toMyPage(page, 'PhoneVerification')); await cap(page, 'identity-guide');
    log('identity-age-restricted'); await go(page, () => toMyPage(page, 'PhoneVerification', { niceResult: 'fail', niceReason: 'age_restricted' })); await cap(page, 'identity-age-restricted');
    console.log('intercepted', ctx.__prismStats.intercepted, 'ext', JSON.stringify([...new Set(ctx.__ext)]));
    await ctx.close();
  }
} finally { await browser.close(); }
