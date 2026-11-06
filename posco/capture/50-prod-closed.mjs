// 운영 /posco-ox 의 행사 종료(closed) 안내 화면 — 운영 HTML·정적 자산만 GET. 서버 API 는 모두 가로챈다:
// GET /api/posco/session 은 운영이 주는 실제 응답과 같은 모양(RECON.md §5-1: event.state=closed)의 가짜로 대신해 DB 읽기도 하지 않는다.
// 실행: cd ~/prism-media && node posco/capture/50-prod-closed.mjs
import { launch, newContext, capturePage, log } from './common.mjs';

const URL = 'https://mai-eventic.com/posco-ox';
const guard = {
  fake: [
    { match: /\/api\/posco\/session(\?|$)/, method: 'GET', json: { ok: true, authed: false, hasSurvey: false, hasAward: false, event: { state: 'closed', dayNo: null } } },
    { match: /\/api\/posco\//, status: 404, json: { ok: false, error: 'not found', code: 'not_found' } },
  ],
};

const browser = await launch();
try {
  for (const vp of ['mobile', 'desktop']) {
    const { ctx, page } = await newContext(browser, vp, { project: 'posco', guard });
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => /종료/.test(document.body.innerText), null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    await capturePage(page, 'closed-notice');
    log(vp, 'closed-notice ok');
    await ctx.close();
  }
} finally {
  await browser.close();
}
