// byclick — 운영 공개 로그인 화면(데스크톱 1440, GET만). 로그인은 하지 않는다(입력·제출 없음). 비GET 전부 가로챔.
import { launch, newContext, capturePage, log } from '../../tools/lib.mjs';
const BASE = 'https://byclick.co.kr';
const redact = { hide: ['[data-testid="kakao-chat"]', 'a[href*="pf.kakao.com"]', 'div:has(> dl dt)'], remove: ['footer'], textMap: { '865-87-': '○○○-○○-', '02901': '○○○○○' } };
const browser = await launch();
try {
  const { ctx, page } = await newContext(browser, 'desktop', { project: 'byclick', guard: {}, redact });
  for (const [p, n] of [['/dealer/login', 'dealer-login-live'], ['/dealer/signup', 'dealer-signup-live'], ['/admin/login', 'admin-login-live']]) {
    await page.goto(BASE + p, { waitUntil: 'networkidle' }); await page.waitForTimeout(1200);
    await capturePage(page, n); log(n);
  }
  console.log('intercepted', ctx.__prismStats.intercepted, JSON.stringify(ctx.__prismStats.list), 'allowed', JSON.stringify(ctx.__prismStats.allowed));
} finally { await browser.close(); }
