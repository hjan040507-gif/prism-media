// 모바일 상태 흐름: 스크래치 참여(시작 전→동의→시작→긁는 중→결과). play_event 는 가짜 응답(운영 호출 0).
import { launch, mk, BASE, sleep } from './common.mjs';
import { startFlow } from '../../tools/lib.mjs';
const SLUG = 'demo-scratch-premium';
const WIN = { result: '스타벅스 1만원권', already_participated: false, reward_id: 'x', slot_number: 1, participant_id: 'x' };
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'mobile', { guard: { fake: [
    { match: /\/api\/auth\/session-verify/, method: 'POST', json: { ok: false } },
    { match: /\/rest\/v1\/rpc\/play_event/, method: 'POST', json: WIN },
  ] } });
  await page.goto(`${BASE}/e/${SLUG}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await sleep(2500);
  const flow = await startFlow(page, 'scratch-play', { scrollY: 250 });
  await flow.step('ready-unchecked');
  for (const cb of await page.locator('input[type=checkbox]').all()) await cb.check();
  await flow.step('consent-checked');
  await page.getByRole('button', { name: '스크래치 시작' }).click();
  await sleep(2000);
  await flow.step('started', { note: '가짜 play_event 응답 {result:"스타벅스 1만원권"} — 이제 긁을 수 있음' });
  const box = await page.locator('canvas').first().boundingBox();
  const vy = box.y - (await page.evaluate(() => scrollY)); // 현재 스크롤 기준 뷰포트 좌표
  const x0 = box.x + 20, x1 = box.x + box.width - 20;
  await page.mouse.move(x0, box.y + 15); await page.mouse.down();
  for (let row = 0; row < 2; row++) { // 위쪽 일부만 긁음
    const y = box.y + 20 + row * 22;
    await page.mouse.move(row % 2 ? x0 : x1, y, { steps: 12 });
    await page.mouse.move(row % 2 ? x1 : x0, y + 11, { steps: 12 });
  }
  await sleep(300);
  await flow.step('scratching', { note: '은박 일부를 긁은 상태(마우스 드래그)' });
  for (let row = 2; row < 9; row++) {
    const y = box.y + 20 + row * 22;
    await page.mouse.move(row % 2 ? x0 : x1, y, { steps: 10 });
    await page.mouse.move(row % 2 ? x1 : x0, y + 11, { steps: 10 });
  }
  await page.mouse.up();
  await sleep(4000);
  await flow.step('result-win', { note: '70% 이상 긁어 결과 공개' });
  console.log('scratch flow done', ctx.__prismStats.list);
} finally { await browser.close(); }
