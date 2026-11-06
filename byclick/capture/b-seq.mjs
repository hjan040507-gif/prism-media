// byclick B seq — 딜러 경매 상세의 마감 카운트다운 · 밀봉 입찰 제출 연출(데스크톱 1440). 로컬 사본 + 가짜 Supabase.
// 방식: page.clock(install → pauseAt) 1/60초씩 runFor + getAnimations currentTime 동기화(lib recordSeq). 입찰 제출은 프레임 훅에서 버튼을 DOM click 으로 눌러
// (가상 시간이라 actionability 대기 없이) 확인창 → 입찰 확정 → 로컬 가짜 DB 입찰 RPC(통과) → 토스트·남은 횟수 갱신을 그린다.
import { launch, newContext, recordSeq, recordScreencast, liveRedact, log } from '../../tools/lib.mjs';
import { cookieValueFor } from './mock-data.mjs';

const APP = process.env.APP_URL || 'http://127.0.0.1:3260';
const MOCK = process.env.MOCK_URL || 'http://127.0.0.1:3263';
const MH = new URL(MOCK).host;
const ids = await (await fetch(`${MOCK}/__mock/ids`)).json();
const live = ids.veh.filter((v) => v.i < 6);
const REDACT = { hide: ['[data-testid="install-prompt"]', '[data-testid="push-prompt"]', '[data-testid="kakao-chat"]'] };

const browser = await launch();
try {
  if (!process.env.ONLY_SUBMIT) {
  // 1) 마감 카운트다운 — 머리 아래 띠 + 입찰 패널 「마감까지」가 1초씩 줄어든다
  {
    const { ctx, page } = await newContext(browser, 'desktop', { project: 'byclick', guard: { allow: [] }, redact: REDACT, clock: true });
    await ctx.addCookies([{ name: 'sb-127-auth-token', value: cookieValueFor('dealer'), url: APP, httpOnly: false, sameSite: 'Lax' }]);
    await page.goto(`${APP}/dealer/auctions/${live[0].au}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const y = await page.evaluate(() => { const el = document.querySelector('[data-testid="bid-quota"]'); return el ? Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 220)) : 0; });
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(500);
    const r = await recordSeq(page, 'bid-countdown', { durationMs: 3000 });
    log('seq bid-countdown', JSON.stringify(r), 'intercepted', ctx.__prismStats.intercepted);
    await ctx.close();
  }
  }
  // 2) 밀봉 입찰 제출 — 금액 입력 → 입찰 금액 제출 → 확인창 → 입찰 확정 → 토스트 · 남은 입찰 기회 3 → 2
  //    (가상 시계 방식은 확인 뒤 서버 재렌더에서 세션이 끊겨 쓸 수 없었다 → 실시간 page.screencast 방식. shots.md 에 적는다)
  {
    const { ctx, page } = await newContext(browser, 'desktop', { project: 'byclick', guard: { allow: [`${MH}/rest/v1/rpc/place_bid_v2`] }, redact: REDACT });
    await ctx.addCookies([{ name: 'sb-127-auth-token', value: cookieValueFor('dealer'), url: APP, httpOnly: false, sameSite: 'Lax' }]);
    await page.goto(`${APP}/dealer/auctions/${live[3].au}`, { waitUntil: 'networkidle' }); // BMW R 1250 GS — A모터스 입찰 0건
    await page.waitForTimeout(1500);
    const y = await page.evaluate(() => { const el = document.querySelector('[data-testid="bid-quota"]'); return el ? Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 220)) : 0; });
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(500);
    const r = await recordScreencast(page, 'bid-submit', {
      durationMs: 5500,
      start: async () => {
        (async () => {
          await page.waitForTimeout(500);
          await page.locator('[data-testid="bid-amount"]').pressSequentially('9900000', { delay: 90 });
          await page.waitForTimeout(500);
          await page.locator('[data-testid="bid-submit"]').click();
          await page.waitForTimeout(900);
          await page.locator('[data-testid="bid-confirm"]').click();
        })().catch((e) => log('seq step error', e.message));
      },
    });
    log('seq bid-submit', JSON.stringify(r), 'allowed', JSON.stringify(ctx.__prismStats.allowed));
    await ctx.close();
  }
} finally {
  await browser.close();
}
