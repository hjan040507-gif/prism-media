// A) 모바일 390 상태 흐름 — 운영 GET 만. 햄버거 메뉴: 닫힘 → 열림 → 회사소개 펼침 → PRODUCT 펼침
import { launch, newContext, startFlow, PROD, REDACT_PUBLIC, GUARD_PUBLIC, FREEZE_HERO, gotoReady, log } from './common.mjs';
const browser = await launch();
try {
  const { ctx, page } = await newContext(browser, 'mobile', { project: 'hanil', guard: GUARD_PUBLIC, redact: REDACT_PUBLIC });
  await ctx.addInitScript(FREEZE_HERO);
  await gotoReady(page, PROD + '/');
  await page.waitForTimeout(1500);
  const flow = await startFlow(page, 'mobile-menu', { scrollY: 0 });
  await flow.step('closed');
  await page.getByRole('button', { name: '메뉴 열기' }).click();
  await page.waitForTimeout(700);
  await flow.step('menu-open');
  const groups = page.locator('div[class*="z-[60]"] button[aria-expanded]');
  await groups.nth(0).click(); await page.waitForTimeout(500);
  await flow.step('group-1-expanded');
  await groups.nth(1).click(); await page.waitForTimeout(500);
  await flow.step('group-2-expanded');
  log('mobile-menu done', ctx.__prismStats.intercepted);
} finally { await browser.close(); }
