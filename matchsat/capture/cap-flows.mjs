// matchsat 상태 흐름·연출. 로컬 사본·로컬 DB 만. 입찰 제출은 로컬 DB 에 쓴다(운영 아님) — cap-pages 가 끝난 뒤에 돌린다.
// 실행: set -a; . tmp/matchsat-pw.env; set +a; node matchsat/capture/cap-flows.mjs <rfq-new-steps|bid-submit|admin-redesignate|seq-steps>
import { launch, startFlow, recordSeq } from '../../tools/lib.mjs';
import { ctxFor, open, ids, tryDo } from './common.mjs';

const WHICH = process.argv[2];
const I = ids();
const browser = await launch();

// 위성영상주문 4단계에 넣는 가짜 값(상호·사람 이름 없음)
async function fillStep(page, n) {
  if (n === 1) {
    await page.fill('input[name="title"]', '서해안 갯벌 변화 관측 위성영상');
    for (const s of ['EO', 'SAR']) await page.getByRole('button', { name: s, exact: true }).first().click();
    await page.getByRole('button', { name: '1m급 이상' }).first().click();
  } else if (n === 2) {
    await page.fill('input[name="capture_point"]', '36.95N 126.50E 일대(가상)');
    await page.fill('input[name="radius_km"]', '8');
    await page.fill('input[name="requested_datetime"]', '2026-11-12T10:00');
    await page.fill('input[name="requested_datetime_end"]', '2026-11-14T18:00');
  } else if (n === 3) {
    await page.getByRole('button', { name: '24시간 이내' }).first().click().catch(() => page.getByRole('button', { name: /24/ }).first().click());
    await page.getByRole('button', { name: '유', exact: true }).first().click();
    await page.getByRole('button', { name: '객체분석' }).first().click();
  } else if (n === 4) {
    await page.getByPlaceholder('예: 10,000').fill('3000000');
    await page.getByPlaceholder('예: 50,000').fill('6000000');
  }
}
const blur = (page) => page.evaluate(() => document.activeElement && document.activeElement.blur());
const next = (page) => page.getByRole('button', { name: '다음', exact: true }).click();

try {
  if (WHICH === 'rfq-new-steps') {
    const { ctx, page } = await ctxFor(browser, 'desktop', 'reqA');
    await open(page, '/rfqs/new');
    const flow = await startFlow(page, 'rfq-new-steps', { scrollY: 0 });
    await tryDo('flow rfq-new-steps', async () => {
      await fillStep(page, 1); await blur(page); await flow.step('step1-what');
      await next(page); await fillStep(page, 2); await blur(page); await flow.step('step2-where-when');
      await next(page); await fillStep(page, 3); await blur(page); await flow.step('step3-conditions');
      await next(page); await fillStep(page, 4); await blur(page); await flow.step('step4-budget');
    });
    await ctx.close();
  }

  if (WHICH === 'bid-submit') {
    const { ctx, page } = await ctxFor(browser, 'desktop', 'supA');
    page.on('dialog', (d) => d.accept()); // window.confirm("이 내용으로 입찰할까요?")
    await open(page, `/rfqs/${I.analysis}`);
    const Y = Number(process.env.BID_Y || 0);
    const flow = await startFlow(page, 'bid-submit', { scrollY: Y });
    await tryDo('flow bid-submit', async () => {
      await flow.step('before');
      await page.getByPlaceholder('예: 1,000,000').fill('5800000');
      await page.locator('input[type="date"]').first().fill('2026-11-10');
      await page.locator('textarea[name="proposal"]').fill('광학·SAR 합성 영상과 객체분석 보고서를 함께 납품합니다(가상 제안).');
      await flow.step('typing');
      await page.getByRole('button', { name: '입찰하기', exact: true }).last().click();
      await page.waitForSelector('text=입찰 완료', { timeout: 15000 }).catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      await flow.step('after');
    });
    await ctx.close();
  }

  if (WHICH === 'admin-redesignate') {
    const { ctx, page } = await ctxFor(browser, 'desktop', 'admin');
    await open(page, '/admin');
    const Y = Number(process.env.ADM_Y || 372);
    const flow = await startFlow(page, 'admin-redesignate', { scrollY: Y });
    await tryDo('flow admin-redesignate', async () => {
      await flow.step('rejected-designated');
      const sel = page.locator('select').first();
      await sel.selectOption({ index: 1 });
      await flow.step('pick-new-supplier');
      await page.getByRole('button', { name: /취소/ }).first().click();
      await page.waitForTimeout(500);
      await flow.step('cancel-confirm');
    });
    await ctx.close();
  }

  if (WHICH === 'seq-steps') {
    // 대표 연출: 위성영상주문 4단계가 「다음」으로 넘어가며 진행바가 차오른다. 시계를 멈추고 1/60초씩(lib recordSeq).
    const { ctx, page } = await ctxFor(browser, 'desktop', 'reqA', { clock: true });
    await open(page, '/rfqs/new', 1500);
    await tryDo('seq rfq-form-steps', async () => {
      // 준비(촬영 전): 4단계를 채우고 1단계로 돌아온다 — 값은 state 에 남는다
      await fillStep(page, 1); await next(page); await fillStep(page, 2); await next(page); await fillStep(page, 3); await next(page); await fillStep(page, 4); await blur(page);
      for (let i = 0; i < 3; i++) await page.getByRole('button', { name: '이전', exact: true }).click();
      await page.waitForTimeout(500);
      const clickNext = () => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '다음'); if (b) b.click(); });
      await recordSeq(page, 'rfq-form-steps', { durationMs: 5000, perFrame: async (i) => { if (i === 45 || i === 120 || i === 195) await clickNext(); } });
    });
    await ctx.close();
  }
} finally {
  await browser.close();
}
