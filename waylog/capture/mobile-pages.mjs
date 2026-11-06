// 모바일 390×844·DSF3 페이지: 홈 · 후기 상세 · 이야기 상세 · 8주 식단 챌린지 · 체성분 기록 · 체성분 AI 저장 결과 · 설정(알림) · 관리자 3종.
// 사용: cd ~/prism-media && node waylog/capture/mobile-pages.mjs   (서버: tmp/waylog-src 에서 포트 3614 — common.mjs 머리 주석)
import fs from 'node:fs';
import { openBrowser, session, goHome, summary, MOBILE, BASE, richPost, captureOverlay, capPage } from './common.mjs';

const browser = await openBrowser();
const results = {};
const fails = [];
const step = async (name, fn) => { try { await fn(); console.log('ok', name); } catch (e) { fails.push(name); console.log('FAIL', name, String(e.message).split('\n')[0].slice(0, 300)); } };
const settleOverlay = async (page, ms = 1800) => { await page.waitForLoadState('networkidle').catch(() => {}); await page.waitForTimeout(ms); };
try {
  // ── 회원(main) 세션 ──
  let s = await session(browser, MOBILE, { account: 'main', mutate: richPost });
  let { page, world } = s;
  const rid = world.ids.R(1), cp = world.ids.CP(10);
  await step('home', async () => {
    await goHome(page);
    await page.locator('[data-home-feed="all"] [data-feed-item]').first().waitFor({ timeout: 40000 });
    await settleOverlay(page);
    await capPage(page, 'home');
  });
  await step('review-detail', async () => {
    await page.goto(`${BASE}/review/${rid}`);
    await page.getByRole('button', { name: '댓글 쓰기' }).first().waitFor({ timeout: 30000 }).catch(() => {});
    await settleOverlay(page, 2500);
    await capPage(page, 'review-detail');
  });
  await step('post-detail', async () => {
    await page.goto(`${BASE}/post/${cp}`);
    await page.locator('[data-reactions]').waitFor({ timeout: 30000 });
    await settleOverlay(page, 2000);
    await capPage(page, 'post-detail');
  });
  await step('challenge-8wk', async () => {
    await goHome(page);
    await page.locator('nav a[href="/challenge"]').click();
    await page.locator('[data-challenge-card="diet"] button').first().waitFor({ timeout: 30000 });
    await page.locator('[data-challenge-card="diet"] button').first().click();
    await page.locator('[role="dialog"][aria-label="8주 식단 챌린지"]').waitFor({ timeout: 20000 });
    await settleOverlay(page, 2500);
    await captureOverlay(page, 'challenge-8wk');
  });
  await step('inbody-records', async () => {
    await page.getByRole('button', { name: '체성분' }).first().click();
    await page.getByText('체성분 기록').first().waitFor({ timeout: 20000 });
    await settleOverlay(page, 1800);
    await captureOverlay(page, 'inbody-records');
  });
  await step('inbody-ai-result', async () => {
    await page.getByText('AI 분석', { exact: true }).first().click();
    await page.getByText('이번 주 권장 생활습관').first().waitFor({ timeout: 15000 }).catch(() => {});
    await settleOverlay(page, 1800);
    await captureOverlay(page, 'inbody-ai-result');
  });
  await step('settings-notifications', async () => {
    await page.goto(`${BASE}/profile/me`);
    await page.locator('[data-open-settings]').click();
    await page.getByText('푸시 알림 켜기').first().waitFor({ timeout: 20000 });
    await settleOverlay(page, 1800);
    await captureOverlay(page, 'settings-notifications');
  });
  results.member = summary(s);
  await s.ctx.close();

  // ── 관리자(admin) 세션 ──
  s = await session(browser, MOBILE, { account: 'admin' });
  page = s.page;
  const toSettings = async () => {
    await page.goto(`${BASE}/profile/me`);
    await page.locator('[data-open-settings]').click();
    await page.getByText('신고 모더레이션').first().waitFor({ timeout: 30000 });
    await page.waitForTimeout(1200);
  };
  await step('admin-reports', async () => {
    await toSettings();
    await page.getByText('신고 모더레이션').first().click();
    await page.getByText('스팸·광고').first().waitFor({ timeout: 20000 });
    await settleOverlay(page, 1800);
    await captureOverlay(page, 'admin-reports');
  });
  await step('admin-news', async () => {
    await page.getByRole('button', { name: '소식 보내기' }).first().click();
    await page.getByText('앱 소식 보내기').first().waitFor({ timeout: 15000 });
    await settleOverlay(page, 1500);
    await captureOverlay(page, 'admin-news');
  });
  await step('admin-signup-codes', async () => {
    await toSettings();
    await page.getByText('가입 코드').first().click();
    await page.getByText('DIET8WEEK').first().waitFor({ timeout: 20000 }).catch(() => {});
    await settleOverlay(page, 1800);
    await captureOverlay(page, 'admin-signup-codes');
  });
  results.admin = summary(s);
  await s.ctx.close();
} finally {
  await browser.close();
  fs.writeFileSync(new URL('./tally-mobile-pages.json', import.meta.url), JSON.stringify({ at: new Date().toISOString(), fails, results }, null, 1));
  console.log('FAILS', JSON.stringify(fails));
}
