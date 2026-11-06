// okjob 데스크톱 1440 — 페이지별 full·view. 로컬 사본 + 로컬 Supabase(가짜 데이터).
import { launch, newContext, capturePage, log, BASE, STATE, GUARD, REDACT, assertLocal } from './common.mjs';
const only = process.argv.slice(2);
const want = (n) => !only.length || only.includes(n);
const browser = await launch();
const { ctx, page } = await newContext(browser, 'desktop', { project: 'okjob', guard: GUARD, redact: REDACT, storageState: STATE });
assertLocal(page);
const go = async (url) => { await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 120000 }); await page.waitForTimeout(1500); };
const tab = async (label) => { await page.getByRole('radio', { name: label, exact: true }).click(); await page.waitForTimeout(1800); };

if (want('dashboard')) { await go('/dashboard'); await capturePage(page, 'dashboard'); log('dashboard'); }
if (want('assign')) { await go('/assign'); await capturePage(page, 'assign'); log('assign'); }
if (want('assign-batch')) {
  await go('/assign');
  await page.getByRole('button', { name: /기간 배정/ }).first().click().catch(async () => { await page.getByText('기간 배정').first().click(); });
  await page.waitForTimeout(1800);
  await page.getByPlaceholder('농가 이름 또는 지역').fill('황'); await page.waitForTimeout(900);
  await page.getByRole('option').first().click().catch(async () => { await page.locator('[role=listbox] button, ul li button').first().click(); });
  await page.waitForTimeout(2500);
  for (const code of [5, 19, 35]) { await page.locator(`button[data-code="${code}"]`).click(); await page.waitForTimeout(500); } // 노란 칩 = 전 기간 가용
  await page.waitForTimeout(1500);
  await capturePage(page, 'assign-batch'); log('assign-batch');
}
for (const [name, label] of [['assignments-day', '일별'], ['assignments-month', '월별'], ['assignments-worker', '근로자별'], ['assignments-batch', '기간 배정']]) {
  if (!want(name)) continue;
  await go('/assignments?date=2026-11-06'); await tab(label); await capturePage(page, name); log(name);
}
if (want('payroll')) {
  await go('/payroll');
  await page.getByRole('button', { name: '지난달', exact: true }).click(); await page.waitForTimeout(3000); // 10월 한 달 기준(이번 달 6일치만 보면 공제가 커서 실수령액이 음수로 나온다)
  await capturePage(page, 'payroll'); log('payroll');
}
if (want('payments')) { await go('/payments'); await capturePage(page, 'payments'); log('payments'); }
if (want('notifications')) { await go('/notifications'); await capturePage(page, 'notifications'); log('notifications'); }
if (want('settings-hours')) { await go('/settings'); await page.getByRole('tab', { name: '시간 단가' }).click(); await page.waitForTimeout(1500); await capturePage(page, 'settings-hours'); log('settings-hours'); }
if (want('settings-wages')) {
  await go('/settings'); await page.getByRole('tab', { name: '일당 단가' }).click().catch(async () => { await page.getByText('일당 단가', { exact: true }).first().click(); });
  await page.waitForTimeout(1500); await capturePage(page, 'settings-wages'); log('settings-wages');
}
const st = ctx.__prismStats; log('가로챈', st.intercepted, st.list.join(' | '), '허용', st.allowed.join(','));
await browser.close();
