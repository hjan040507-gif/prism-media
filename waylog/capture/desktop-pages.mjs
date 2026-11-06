// 데스크톱 1440×900·DSF2: 같은 PWA 를 1440 에서 열린 그대로(레이아웃이 모바일 폭 칼럼이면 그대로 — shots.md 에 적는다).
// 홈 · 이야기 상세 · 챌린지 탭(/challenge) · 알림(/notifications) · 8주 식단 챌린지 오버레이 · 설정(알림) · 관리자 신고 관리
import fs from 'node:fs';
import { openBrowser, session, goHome, summary, BASE, richPost, captureOverlay, capPage } from './common.mjs';

const browser = await openBrowser();
const results = {};
const fails = [];
const step = async (name, fn) => { try { await fn(); console.log('ok', name); } catch (e) { fails.push(name); console.log('FAIL', name, String(e.message).split('\n')[0].slice(0, 300)); } };
const quiet = async (page, ms = 1800) => { await page.waitForLoadState('networkidle').catch(() => {}); await page.waitForTimeout(ms); };
try {
  let s = await session(browser, 'desktop', { account: 'main', mutate: richPost });
  let { page, world } = s;
  const cp = world.ids.CP(10);
  await step('home', async () => {
    await goHome(page);
    await page.locator('[data-home-feed="all"] [data-feed-item]').first().waitFor({ timeout: 40000 });
    await quiet(page);
    await capPage(page, 'home');
  });
  await step('post-detail', async () => {
    await page.goto(`${BASE}/post/${cp}`);
    await page.locator('[data-reactions]').waitFor({ timeout: 30000 });
    await quiet(page, 2000);
    await capPage(page, 'post-detail');
  });
  await step('challenge-tab', async () => {
    await goHome(page);
    await page.locator('nav a[href="/challenge"]').click();
    await page.locator('[data-challenge-card="diet"] button').first().waitFor({ timeout: 30000 });
    await quiet(page, 2000);
    await capPage(page, 'challenge-tab');
  });
  await step('notifications', async () => {
    await goHome(page);
    await page.locator('nav a[href="/notifications"]').click();
    await page.locator('[data-notif-group]').first().waitFor({ timeout: 30000 });
    await quiet(page, 1800);
    await capPage(page, 'notifications');
  });
  await step('challenge-8wk', async () => {
    await goHome(page);
    await page.locator('nav a[href="/challenge"]').click();
    await page.locator('[data-challenge-card="diet"] button').first().click();
    await page.locator('[role="dialog"][aria-label="8주 식단 챌린지"]').waitFor({ timeout: 20000 });
    await quiet(page, 2500);
    await captureOverlay(page, 'challenge-8wk');
  });
  await step('settings-notifications', async () => {
    await page.goto(`${BASE}/profile/me`);
    await page.locator('[data-open-settings]').click();
    await page.getByText('푸시 알림 켜기').first().waitFor({ timeout: 30000 });
    await quiet(page, 1800);
    await captureOverlay(page, 'settings-notifications');
  });
  results.member = summary(s);
  await s.ctx.close();

  s = await session(browser, 'desktop', { account: 'admin' });
  page = s.page;
  await step('admin-reports', async () => {
    await page.goto(`${BASE}/profile/me`);
    await page.locator('[data-open-settings]').click();
    await page.getByText('신고 모더레이션').first().click();
    await page.getByText('스팸·광고').first().waitFor({ timeout: 30000 });
    await quiet(page, 1800);
    await captureOverlay(page, 'admin-reports');
  });
  results.admin = summary(s);
  await s.ctx.close();
} finally {
  await browser.close();
  fs.writeFileSync(new URL('./tally-desktop-pages.json', import.meta.url), JSON.stringify({ at: new Date().toISOString(), fails, results }, null, 1));
  console.log('FAILS', JSON.stringify(fails));
}
