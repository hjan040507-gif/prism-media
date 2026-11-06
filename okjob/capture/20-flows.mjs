// okjob 상태 흐름 — 데스크톱 1440, 같은 뷰포트·같은 scrollY(0).
//  assign-flow(배정하기 7단계) · assign-duplicate-confirm(중복 배정 확인창) · matrix-hover(칸 hover 행·열 강조)
// 저장·확정 버튼은 누르지 않는다(저장 직전에서 멈춤). 비GET 은 guard 가 가로챈다.
import { launch, newContext, startFlow, log, BASE, STATE, GUARD, REDACT, assertLocal } from './common.mjs';
const only = process.argv.slice(2);
const want = (n) => !only.length || only.includes(n);
const browser = await launch();
const { ctx, page } = await newContext(browser, 'desktop', { project: 'okjob', guard: GUARD, redact: REDACT, storageState: STATE });
assertLocal(page);
const go = async (url) => { await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 120000 }); await page.waitForTimeout(1500); };
const pickFarm = async (q) => {
  await page.getByLabel('농가 이름 검색').fill(q); await page.waitForTimeout(700);
  await page.locator('#assign-farm-suggest li button').first().click(); await page.waitForTimeout(1800);
};

if (want('assign-flow')) {
  await go('/assign');
  const flow = await startFlow(page, 'assign-flow', { scrollY: 0 });
  await flow.step('empty-form');
  await page.getByLabel('농가 이름 검색').fill('김'); await page.waitForTimeout(800);
  await flow.step('farm-search');
  await page.locator('#assign-farm-suggest li button').first().click(); await page.waitForTimeout(2000);
  await flow.step('farm-selected-auto-recommend');
  await page.getByLabel('작업', { exact: true }).selectOption({ label: '선과' }); await page.waitForTimeout(600);
  await page.getByLabel('작업 시간').selectOption({ label: '6시간' }); await page.waitForTimeout(1200);
  await flow.step('task-and-hours');
  await page.getByRole('button', { name: /추천 그대로 적용/ }).click(); await page.waitForTimeout(1200);
  await flow.step('recommend-applied');
  await page.getByRole('button', { name: /배정 저장/ }).hover(); await page.waitForTimeout(500);
  await flow.step('before-save');
  log('assign-flow 끝');
}

if (want('assign-duplicate-confirm')) {
  await go('/assign');
  await pickFarm('이');
  const flow = await startFlow(page, 'assign-duplicate-confirm', { scrollY: 0 });
  await flow.step('farm-selected-dotted-chips');
  await page.locator('button[data-code][data-state="assigned"]').first().hover(); await page.waitForTimeout(500);
  await flow.step('hover-assigned-chip');
  await page.locator('button[data-code][data-state="assigned"]').first().click(); await page.waitForTimeout(900);
  await flow.step('confirm-dialog');
  await page.getByRole('dialog').getByRole('button', { name: /취소|닫기|아니/ }).first().click(); await page.waitForTimeout(700);
  await flow.step('dialog-cancelled');
  log('assign-duplicate-confirm 끝');
}

if (want('matrix-hover')) {
  await go('/assignments?date=2026-11-06');
  await page.getByRole('radio', { name: '근로자별', exact: true }).click(); await page.waitForTimeout(2500);
  // 스크롤 영역 안에 완전히 보이는 '배정 있음' 칸을 서로 다른 행·열로 고른다
  const picks = await page.evaluate(() => {
    const sc = document.querySelector('[data-testid="matrix-scroll"]');
    const R = sc.getBoundingClientRect();
    const out = []; const usedRows = new Set(), usedCols = new Set();
    const rows = [...sc.querySelectorAll('[data-testid="matrix-row"]')];
    for (const tr of rows) {
      const code = tr.dataset.code;
      for (const td of tr.querySelectorAll('td[data-has="1"]')) {
        const r = td.getBoundingClientRect();
        if (r.left < R.left + 120 || r.right > R.right - 20 || r.top < R.top + 40 || r.bottom > R.bottom - 10) continue;
        if (usedRows.has(code) || usedCols.has(td.dataset.date)) continue;
        // 서로 멀리 떨어진 칸(행 간격 ≥3)을 우선
        if (out.length && Math.abs(Number(code) - Number(out[out.length - 1].code)) < 3) continue;
        out.push({ code, date: td.dataset.date }); usedRows.add(code); usedCols.add(td.dataset.date); break;
      }
      if (out.length >= 4) break;
    }
    return out;
  });
  log('hover picks', JSON.stringify(picks));
  if (picks.length < 3) throw new Error('hover 칸 3곳을 못 골랐다');
  await page.mouse.move(5, 5);
  const flow = await startFlow(page, 'matrix-hover', { scrollY: 0 });
  await flow.step('matrix-idle');
  let i = 0;
  for (const p of picks) {
    i++;
    await page.locator(`[data-testid="matrix-row"][data-code="${p.code}"] td[data-date="${p.date}"]`).hover(); await page.waitForTimeout(600);
    await flow.step(`hover-cell-${i}-worker${p.code}-${p.date.slice(5)}`);
  }
  log('matrix-hover 끝');
}
const st = ctx.__prismStats; log('가로챈', st.intercepted, st.list.join(' | '), '허용', st.allowed.join(','));
await browser.close();
