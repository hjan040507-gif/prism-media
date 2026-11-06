// 모바일 상태 흐름: 스탬프·출석(0/5 → 도장 찍기 → 진행 → 완주). /api/stamp/accrue 가짜 응답(모양: lib/game/stamp.ts StampAccrueResult).
import { launch, mk, BASE, sleep } from './common.mjs';
import { startFlow } from '../../tools/lib.mjs';
const SLUG = 'demo-stamp-mz-bright';
let count = 0;
const prog = (c) => ({ count: c, goal: 5, complete: c >= 5, remaining: Math.max(0, 5 - c), lastOn: new Date().toISOString().slice(0, 10), streak: c });
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'mobile', { guard: { fake: [
    { match: /\/api\/auth\/session-verify/, method: 'POST', json: { ok: false } },
  ] } });
  const st = ctx.__prismStats;
  let statusCount = 0; // 방문(새로고침)마다 서버가 알려 주는 "지금까지 모은 수"를 가짜로 — 하루 1번 적립이라 같은 방문에서는 여러 번 못 찍는다
  await page.route(/\/api\/stamp\/accrue/, async (route) => {
    count = Math.min(5, statusCount + 1);
    st.intercepted++; st.list.push(`POST /api/stamp/accrue (fake count=${count})`);
    const body = { ok: true, progress: prog(count) };
    if (count >= 5) body.played = { result: '스타벅스 아메리카노', already_participated: false, reward_id: 'x', participant_id: 'x' };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route(/\/api\/stamp\/status/, async (route) => {
    st.intercepted++; st.list.push(`GET /api/stamp/status (fake count=${statusCount})`);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, progress: prog(statusCount), stampedToday: false }) });
  });
  const load = async () => {
    await page.goto(`${BASE}/e/${SLUG}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await sleep(2200);
  };
  await load();
  const flow = await startFlow(page, 'stamp-collect', { scrollY: 200 });
  await flow.step('empty-0of5');
  const stamp = async (wait) => {
    for (const cb of await page.locator('input[type=checkbox]').all()) await cb.check().catch(() => {});
    await page.getByRole('button', { name: /도장/ }).first().click(); await sleep(wait);
  };
  await stamp(1800);
  await flow.step('stamped-1of5');
  await page.context().addCookies([{ name: 'mai_dev_id', value: 'dev_demo', url: BASE }]);
  for (const k of [3, 4, 5]) {
    statusCount = k - 1;
    await load();
    await stamp(k === 5 ? 7000 : 1800);
    await flow.step(k === 5 ? 'complete-5of5' : `stamped-${k}of5`, { note: `새 방문 가정: GET /api/stamp/status 가짜 응답(count=${k - 1}) → 도장 찍기 → 가짜 accrue 응답(count=${k})` });
  }
  console.log('stamp flow done', st.list);
} finally { await browser.close(); }
