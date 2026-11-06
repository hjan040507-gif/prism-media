// okjob 모바일 390×844 @3 — /dashboard(PWA 시작 주소 = 모바일 홈) · /assign. 상태 흐름(모바일 배정하기).
import { launch, newContext, capturePage, startFlow, log, BASE, STATE, GUARD, REDACT, assertLocal } from './common.mjs';
const only = process.argv.slice(2);
const want = (n) => !only.length || only.includes(n);
const browser = await launch();
const { ctx, page } = await newContext(browser, 'mobile', { project: 'okjob', guard: GUARD, redact: REDACT, storageState: STATE });
assertLocal(page);
const go = async (url) => { await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 120000 }); await page.waitForTimeout(1500); };
if (want('dashboard')) { await go('/dashboard'); await capturePage(page, 'dashboard'); log('m dashboard'); }
if (want('assign')) { await go('/assign'); await capturePage(page, 'assign'); log('m assign'); }
if (want('flow')) {
  await go('/assign');
  const flow = await startFlow(page, 'm-assign-flow', { scrollY: 200 });
  await flow.step('empty-form');
  await page.getByLabel('농가 이름 검색').fill('박'); await page.waitForTimeout(800);
  await flow.step('farm-search');
  await page.locator('#assign-farm-suggest li button').first().click(); await page.waitForTimeout(2000);
  await flow.step('farm-selected');
  await page.getByRole('button', { name: /추천 그대로 적용/ }).click(); await page.waitForTimeout(1200);
  await flow.step('recommend-applied');
  log('m flow');
}
const st = ctx.__prismStats; log('가로챈', st.intercepted, st.list.join(' | '), '허용', st.allowed.join(','));
await browser.close();
