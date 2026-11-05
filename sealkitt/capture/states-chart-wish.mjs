// 상태 흐름 ②③④: 차트 기간 전환 · 관심 카드 등록 · 시세 축(나라) 탭 전환. 데스크톱 1440, 운영 GET.
import { launch, mk, BASE, sleep, tally } from './common.mjs';
import { startFlow } from '../../tools/lib.mjs';

const browser = await launch();
async function open(page, id) {
  await page.goto(BASE + '/cards/' + id, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await sleep(1200);
}
// 차트 카드가 화면 위쪽 근처에 오도록 한 번 스크롤하고, 그 scrollY 를 흐름 내내 고정한다.
async function chartScrollY(page) {
  return page.evaluate(() => {
    const tl = document.querySelector('[role=tablist][aria-label="시세 축 선택"]');
    const card = tl.closest('div.rounded-card') || tl.parentElement;
    return Math.max(0, Math.round(card.getBoundingClientRect().top + window.scrollY - 112));
  });
}
try {
  const { ctx, page } = await mk(browser, 'desktop');
  const tab = (label, name) => page.locator(`[role=tablist][aria-label="${label}"] [role=tab]`, { hasText: name }).first();

  // ② 차트 기간 전환(원피스 카드: 국내+일본 두 축, 실측 13일)
  await open(page, 'optcgapi-OP13-007');
  let y = await chartScrollY(page);
  let flow = await startFlow(page, 'chart-period', { scrollY: y });
  for (const p of ['7일', '30일', '90일', '전체']) {
    await tab('기간 선택', p).click();
    await sleep(700);
    await flow.step(`period-${p}`, { settleMs: 400 });
  }

  // ④ 나라(시세 축) 탭 전환 — 국내 → 일본 → 국내
  await open(page, 'optcgapi-OP13-007');
  y = await chartScrollY(page);
  flow = await startFlow(page, 'axis-tabs-kr-jp', { scrollY: y });
  await sleep(500);
  await flow.step('axis-국내', { settleMs: 400 });
  await tab('시세 축 선택', '일본').click(); await sleep(700);
  await flow.step('axis-일본', { settleMs: 400 });
  await tab('시세 축 선택', '국내').click(); await sleep(700);
  await flow.step('axis-국내-again', { settleMs: 400 });

  // ③ 관심 카드 등록: 누르기 전 → 누름 → 등록됨
  await open(page, 'pokemon-card-jp-32317');
  flow = await startFlow(page, 'wish-register', { scrollY: 0 });
  const heart = page.locator('button[aria-label="관심 추가"]:visible').first();
  await flow.step('before', { settleMs: 300 });
  await heart.hover(); await page.mouse.down(); await sleep(150);
  await flow.step('pressed', { settleMs: 0 });
  await page.mouse.up(); await sleep(900);
  await page.mouse.move(5, 5);
  const j = await flow.step('registered', { settleMs: 300 });
  console.log('wish pressed state:', await page.locator('button[aria-label="관심 해제"]:visible').count());
  tally(ctx, 'states-chart-wish');
} finally { await browser.close(); }
