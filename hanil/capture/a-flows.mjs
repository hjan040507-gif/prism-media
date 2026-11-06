// A) 공개 화면 상태 흐름(운영 GET 만 — 폼은 채우기까지, 파일 선택·제출 없음).
//   quote-fill: 빈 폼 → 희망 공정 선택 → 입력 채움 → 개인정보 동의(제출 직전)
//   facility-tabs: 설비현황 3탭 전환
import { launch, newContext, startFlow, PROD, REDACT_PUBLIC, GUARD_PUBLIC, FREEZE_HERO, gotoReady, log, liveRedact } from './common.mjs';

const browser = await launch();
try {
  const { ctx, page } = await newContext(browser, 'desktop', { project: 'hanil', guard: GUARD_PUBLIC, redact: REDACT_PUBLIC });
  await ctx.addInitScript(FREEZE_HERO);

  // ── quote-fill
  await gotoReady(page, PROD + '/support/quote');
  await page.waitForTimeout(1200);
  const y = await page.evaluate(() => Math.round(document.querySelector('form').getBoundingClientRect().top + window.scrollY - 110));
  const flow = await startFlow(page, 'quote-fill', { scrollY: y });
  await flow.step('empty-form');
  await page.selectOption('#process', { index: 3 });
  await flow.step('process-selected');
  await page.fill('#company', 'A산업');
  await page.fill('#name', '김○○');
  await page.fill('#email', 'user***@example.com');
  await page.fill('#phone', '010-****-****');
  await page.fill('#material', 'SCM440');
  await page.fill('#quantity', '2,000개');
  await page.fill('#message', '샤프트 부품 가스질화 처리 견적을 요청드립니다. 도면은 별도 전달 예정입니다.');
  await flow.step('fields-filled');
  await page.check('input[name="privacy"]');
  await flow.step('consent-ready-to-submit', { note: '제출 버튼은 누르지 않음(운영 서버 액션 → 메일 발송 방지). 파일 선택 없음.' });
  log('quote-fill done');

  // ── facility-tabs
  await new Promise((r) => setTimeout(r, 1500));
  await gotoReady(page, PROD + '/facility');
  await page.waitForTimeout(1200);
  const y2 = await page.evaluate(() => Math.round(document.querySelector('[role=tablist]').getBoundingClientRect().top + window.scrollY - 110));
  const f2 = await startFlow(page, 'facility-tabs', { scrollY: y2 });
  await page.click('#tab-manufacturing'); await f2.step('tab1-manufacturing-1');
  await page.click('#tab-manufacturing2'); await f2.step('tab2-manufacturing-2');
  await page.click('#tab-measuring'); await f2.step('tab3-measuring');
  log('facility-tabs done');
  const st = ctx.__prismStats;
  log('intercepted', st.intercepted, 'allowed', st.allowed.length);
} finally {
  await browser.close();
}
