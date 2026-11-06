// okjob seq — page.clock 가상 시간 1/60초씩(recordSeq). 데스크톱 1440.
//  assign-auto-recommend: 농가를 고른 뒤 「추천 그대로 적용」→ 근로자 칩이 채워지는 장면(2.5초)
//  dashboard-day-select: 월간 현황 달력에서 날짜를 눌러 오른쪽 「그날 배정」이 바뀌는 장면(3초)
import { launch, newContext, recordSeq, log, BASE, STATE, GUARD, REDACT, assertLocal } from './common.mjs';
const only = process.argv.slice(2);
const want = (n) => !only.length || only.includes(n);
const browser = await launch();
for (const name of ['assign-auto-recommend', 'dashboard-day-select']) {
  if (!want(name)) continue;
  const { ctx, page } = await newContext(browser, 'desktop', { project: 'okjob', guard: GUARD, redact: REDACT, storageState: STATE, clock: true });
  assertLocal(page);
  await page.goto(BASE + (name === 'assign-auto-recommend' ? '/assign' : '/dashboard'), { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(2500);
  const clickDay = (d) => page.evaluate((d) => { const b = [...document.querySelectorAll('button')].find((x) => new RegExp('^' + d + '\\s*\\n?\\s*농가').test(x.innerText.trim())); if (!b) throw new Error('day ' + d); b.click(); }, d);
  if (name === 'assign-auto-recommend') {
    // 빈 폼 → 농가 이름 입력 → 후보 선택 → 자동 추천 카드 → 「추천 그대로 적용」으로 칩이 채워짐(4초). 모든 입력은 가상 시계 위에서 프레임에 맞춰 넣는다.
    await recordSeq(page, name, {
      durationMs: 4000,
      perFrame: async (i) => {
        if (i === 12) await page.getByLabel('농가 이름 검색').focus();
        if (i === 20) await page.keyboard.type('김');
        if (i === 70) await page.locator('#assign-farm-suggest li button').first().click();
        if (i === 140) await page.getByRole('button', { name: /추천 그대로 적용/ }).click();
      },
    });
  } else {
    await recordSeq(page, name, { durationMs: 3000, start: async () => { await clickDay(12); }, perFrame: async (i) => { if (i === 90) await clickDay(17); } });
  }
  const st = ctx.__prismStats; log(name, '가로챈', st.intercepted, st.list.join('|'), '허용', st.allowed.join(','));
  await ctx.close();
}
await browser.close();
