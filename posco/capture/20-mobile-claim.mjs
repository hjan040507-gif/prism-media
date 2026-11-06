// 모바일 390 — 당첨 카드 3종(우산·선풍기·커피), 개인 링크 쿠폰(커피·steel), 스탭 PIN 수령 확인(우산 gold · 선풍기 blue)
// 실행: cd ~/prism-media && node posco/capture/20-mobile-claim.mjs
import { launch, mobile, makeState, setObj, boot, freeze, adv, sleep, capturePage, startFlow, BASE, CODES, FAKE_TOKEN, log } from './common.mjs';

const ST = (sel) => `[data-px="${sel}"]`;
const browser = await launch();
async function advUntil(page, sel, { step = 250, max = 60 } = {}) {
  for (let i = 0; i < max; i++) {
    if (await page.$(sel)) return true;
    await adv(page, step);
    await sleep(60);
  }
  throw new Error(`못 찾음: ${sel}`);
}

// 당첨자 재진입 경로(hasAward → result)로 바로 추첨 대기 화면에 들어간다 — 추첨 응답만 티어별로 바꾼다.
async function prizeCard(tier, shotName, endName) {
  const st = makeState();
  setObj(st.session, { ok: true, authed: true, hasSurvey: true, hasAward: true, claimToken: FAKE_TOKEN, name: '김○○', winNotified: false, event: { state: 'open', dayNo: 2 } });
  setObj(st.draw, { ok: true, tier, claimCode: CODES[tier] });
  const { ctx, page } = await mobile(browser, st);
  await boot(page, `${BASE}/posco-ox`, ST('draw-confirm'));
  await freeze(page);
  await adv(page, 1500);
  await page.click(ST('draw-confirm'));
  await adv(page, 3500);
  await advUntil(page, ST('prize-card'));
  await adv(page, 1500);
  await capturePage(page, shotName);
  setObj(st.session, { ok: true, authed: true, hasSurvey: true, hasAward: true, claimToken: FAKE_TOKEN, name: '김○○', winNotified: true, event: { state: 'open', dayNo: 2 } });
  await page.click(ST('claim'));
  await advUntil(page, ST('end'));
  await adv(page, 2000);
  await capturePage(page, endName);
  await ctx.close();
  log(shotName, 'done');
}
// 인자 'coffee' 면 커피 수령 화면만 다시 찍는다(나머지는 건드리지 않음).
const ONLY = process.argv[2];
if (!ONLY) {
await prizeCard('gold', 'prize-umbrella', 'end-umbrella');
await prizeCard('blue', 'prize-fan', 'end-fan');
}

// ── 개인 링크 쿠폰(커피): 쿠폰 이미지·쿠폰번호·유효기간
async function claimPage(tier, name, mutate) {
  const st = makeState();
  setObj(st.claimGet, { ok: true, tier, dayNo: 2, claimCode: CODES[tier], claimed: false, claimedAt: null });
  if (tier !== 'steel') setObj(st.coupon, { ok: true, coupon: null, miss: 'not_configured' });
  if (mutate) mutate(st);
  const { ctx, page } = await mobile(browser, st, tier === 'steel' ? { redact: { qr: false } } : {}); // 커피: 가짜 쿠폰 data URL 의 base64 가 lib 의 QR 힌트 정규식(qr)에 우연히 걸려 이미지가 가려진다(오탐) → 이 화면만 qr 가림 끔(실 QR·바코드 없음, 직접 만든 샘플)
  await boot(page, `${BASE}/posco-ox/claim/${FAKE_TOKEN}`, ST('claim'));
  await page.waitForSelector(`${ST('claim')}[data-px-status="unclaimed"]`);
  await freeze(page);
  await adv(page, 1500);
  if (tier === 'steel') await page.waitForSelector(ST('coupon-image'));
  await page.evaluate(async () => { const i = document.querySelector('[data-px="coupon-image"]'); if (i && !i.complete) await new Promise((r) => { i.onload = i.onerror = r; }); });
  await adv(page, 500);
  await capturePage(page, name);
  return { ctx, page, st };
}

{
  const { ctx } = await claimPage('steel', 'claim-coffee');
  await ctx.close();
  log('claim-coffee done');
}

// ── 스탭 PIN 수령 확인: gold(우산)·blue(선풍기). PIN 은 임의 6자리(실제 PIN 아님), 서버 응답은 가짜 성공.
if (!ONLY) for (const [tier, name, prize] of [['gold', 'claim-umbrella', '우산'], ['blue', 'claim-fan', '선풍기']]) {
  const { ctx, page, st } = await claimPage(tier, name, (s) => setObj(s.confirm, { ok: true, claimed: true, tier, claimCode: CODES[tier], claimedAt: '2026-09-17T05:12:00.000Z' }));
  const flow = await startFlow(page, `staff-pin-${tier === 'gold' ? 'umbrella' : 'fan'}`);
  await flow.step('unclaimed');
  await page.click(ST('staff-toggle'));
  await adv(page, 900);
  await flow.step('pin-sheet');
  await page.click('input.px-otp-input', { force: true });
  await page.keyboard.type('2468', { delay: 60 });
  await adv(page, 300);
  await flow.step('pin-partial');
  await page.keyboard.type('02', { delay: 60 });
  await adv(page, 300);
  await flow.step('pin-filled');
  const hold = await page.$(ST('staff-hold'));
  const box = await hold.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await adv(page, 500);
  await flow.step('holding');
  await adv(page, 400);
  await sleep(500);
  await adv(page, 900);
  await page.mouse.up();
  await advUntil(page, ST('claim-popup'), { step: 300, max: 30 });
  await adv(page, 1200);
  await flow.step('claimed-popup');
  await adv(page, 2500);
  await capturePage(page, `${name}-done`);
  await ctx.close();
  log(name, prize, 'done');
}
await browser.close();
