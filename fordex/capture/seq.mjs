// fordex 연출 영상(모바일 390×844 DSF3, 60fps) — tools/lib.mjs recordSeq: page.clock 으로 시간을 멈추고 1/60초씩 runFor + getAnimations 동기화, 프레임마다 스크린샷.
//  bid-place     : 경매 입찰(상세 → 입찰창이 올라옴 → 빠른 증액 → 입찰 → 현재가·입찰 횟수 갱신). place_bid_v2 는 가짜 응답.
//  checkout-pick : 결제 화면 수단 전환(계좌이체 → 카드) → 안전결제 약관 체크. 결제하기는 누르지 않는다.
// 클릭은 좌표(page.mouse) — 시계가 멈춘 동안 Playwright 의 rAF 기반 대기가 걸리지 않게. 좌표는 시작 전에 요소 사각형으로 구한다.
// 실행: cd ~/prism-media && node fordex/capture/seq.mjs [bid-place|checkout-pick]
import { launch, open, toMyPage, toHome, waitIdle, WEB } from './common.mjs';
import { installFake } from './fake.mjs';
import { S, priceOverrides, auctionOverrides, patchRows, installBidFake, seedBids } from './data.mjs';
import { recordSeq } from '../../tools/lib.mjs';

const LISTING = process.env.FORDEX_LISTING || '9ce09697-523a-4c1e-a386-14cc80399c2e';
const AUCTION = process.env.FORDEX_AUCTION || 'c2b733c9-c3be-425f-b315-45c889eeaf25';
const which = process.argv[2] || 'all';
const log = (m) => console.log(new Date().toISOString().slice(11, 19), m);

async function ctxFor(browser) {
  const { ctx, page } = await open(browser, 'mobile', 'buyer', { clock: true });
  await installFake(ctx, { overrides: [...priceOverrides, ...auctionOverrides], patch: patchRows });
  await installBidFake(ctx);
  page.on('pageerror', (e) => console.log('PAGEERR', String(e).slice(0, 160)));
  await page.goto(WEB + '/', { waitUntil: 'domcontentloaded' });
  await waitIdle(page, 2500);
  return { ctx, page };
}
const center = async (page, text, which = 'last') => {
  const loc = page.getByText(text, { exact: true }).locator('visible=true')[which]();
  const b = await loc.boundingBox();
  if (!b) throw new Error(`위치 없음: ${text}`);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
};

const browser = await launch();
try {
  S.auctionId = AUCTION; S.txFilter = null; S.stage = 'paid';
  if (which === 'all' || which === 'bid-place') {
    seedBids(3);
    const { ctx, page } = await ctxFor(browser);
    await toHome(page, 'ListingDetail', { listingId: AUCTION }); await waitIdle(page, 2500);
    const p1 = await center(page, '입찰하기'); // 상세 하단 버튼
    // 입찰창 안 버튼 좌표는 창을 한 번 열어 구한 뒤 닫는다(시계 정상 동작 중)
    await page.mouse.click(p1.x, p1.y); await waitIdle(page, 1500);
    const chip = await center(page, '+10,000', 'first');
    const submit = await center(page, '입찰');
    await page.getByText('취소', { exact: true }).locator('visible=true').last().click(); await waitIdle(page, 1200);
    seedBids(3);
    await page.goto(WEB + '/', { waitUntil: 'domcontentloaded' }); await waitIdle(page, 2500);
    await toHome(page, 'ListingDetail', { listingId: AUCTION }); await waitIdle(page, 2500);
    let calm = 0;
    const r = await recordSeq(page, 'bid-place', {
      durationMs: 6000,
      perFrame: async (i) => {
        if (i === 30) await page.mouse.click(p1.x, p1.y);
        if (i === 150) await page.mouse.click(chip.x, chip.y);
        if (i === 230) await page.mouse.click(submit.x, submit.y);
        if (i >= 230 && i < 262) await page.waitForTimeout(90); // 가짜 응답·재조회가 도착할 실시간 여유
      },
    });
    console.log(r, 'bids', S.bids.length, 'intercepted', ctx.__prismStats.intercepted, 'ext', JSON.stringify([...new Set(ctx.__ext)]));
    await ctx.close();
  }
  if (which === 'all' || which === 'checkout-pick') {
    const { ctx, page } = await ctxFor(browser);
    await toMyPage(page, 'Payment', { listingId: LISTING }); await waitIdle(page, 2500);
    await page.evaluate(() => { for (const el of document.querySelectorAll('div')) { if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 50 && el.offsetParent) el.scrollTop = 540; } });
    await page.waitForTimeout(600);
    const card = await center(page, '카드', 'first');
    const terms = await center(page, '안전결제 약관에 동의합니다.', 'first');
    const r = await recordSeq(page, 'checkout-pick', {
      durationMs: 4000,
      perFrame: async (i) => {
        if (i === 60) await page.mouse.click(card.x, card.y);
        if (i === 150) await page.mouse.click(terms.x - 80, terms.y);
      },
    });
    console.log(r, 'intercepted', ctx.__prismStats.intercepted, 'ext', JSON.stringify([...new Set(ctx.__ext)]));
    await ctx.close();
  }
} finally { await browser.close(); }
