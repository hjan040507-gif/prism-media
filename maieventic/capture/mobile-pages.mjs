// 모바일 390: 랜딩·요금제(공개) + 문자 인증 칸이 보이는 이벤트 페이지(룰렛 — 응답 가공: config.auth.phone=true, 코드 demos.ts:94 와 같은 값).
import { launch, mk, BASE, sleep } from './common.mjs';
import { capturePage } from '../../tools/lib.mjs';
const SLUG = 'demo-roulette-mz-bright';
const browser = await launch();
try {
  for (const [name, p] of [['landing', '/'], ['pricing', '/pricing']]) {
    const { page } = await mk(browser, 'mobile');
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await sleep(2000);
    const r = await capturePage(page, name);
    console.log('mobile', name, r.full.docHeight, r.full.pii_scan.total, r.view.pii_scan.total);
  }
  const { page } = await mk(browser, 'mobile', { guard: { fake: [{ match: /\/api\/auth\/session-verify/, method: 'POST', json: { ok: false } }] } });
  await page.route(new RegExp(`/e/${SLUG}(\\?.*)?$`), async (route) => {
    if (route.request().resourceType() !== 'document') return route.fallback();
    const resp = await route.fetch();
    let body = await resp.text();
    body = body.replace(/\\"auth\\":\{\\"phone\\":false/g, '\\"auth\\":{\\"phone\\":true');
    const headers = { ...resp.headers() }; delete headers['content-encoding']; delete headers['content-length'];
    await route.fulfill({ status: resp.status(), headers, body });
  });
  await page.goto(`${BASE}/e/${SLUG}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await sleep(2500);
  const r = await capturePage(page, 'event-roulette-sms');
  console.log('mobile event-roulette-sms', r.full.docHeight, r.full.pii_scan.total, r.view.pii_scan.total);
} finally { await browser.close(); }
