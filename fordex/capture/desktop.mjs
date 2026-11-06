// fordex 관리자(데스크톱 1440×900 DSF2) 촬영 — 같은 앱의 설정 → 어드민 화면들(복제 `admin` 합성 계정). 1440 에서 앱은 모바일 UI 가 가로로 늘어난 모양(실제 모습).
// 실행: cd ~/prism-media && node fordex/capture/desktop.mjs
import { launch, open, toMyPage, waitIdle, WEB } from './common.mjs';
import { installFake } from './fake.mjs';
import { S, patchRows, adminOverrides } from './data.mjs';
import { captureRN } from './rn.mjs';

const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const want = (n) => !ONLY || ONLY.includes(n);
const cap = (page, n, o) => (want(n) ? captureRN(page, n, o) : null);
const log = (m) => console.log(new Date().toISOString().slice(11, 19), m);
const go = async (page, fn, ms = 2200) => { await fn(); await waitIdle(page, ms); };

const browser = await launch();
try {
  const { ctx, page } = await open(browser, 'desktop', 'admin');
  await installFake(ctx, { overrides: adminOverrides, patch: patchRows });
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  page.on('pageerror', (e) => console.log('PAGEERR', String(e).slice(0, 160)));
  await page.goto(WEB + '/', { waitUntil: 'domcontentloaded' });
  await waitIdle(page, 2500);
  log('admin-menu'); await go(page, () => toMyPage(page, 'Settings')); await cap(page, 'admin-menu');
  log('admin-transactions'); await go(page, () => toMyPage(page, 'AdminTransactions')); await cap(page, 'admin-transactions');
  log('admin-dispute-modal');
  await page.getByText('FDX-004307', { exact: false }).first().click(); await waitIdle(page, 1800);
  await cap(page, 'admin-dispute-modal');
  await page.getByText('닫기', { exact: true }).locator('visible=true').first().click(); await waitIdle(page, 800);
  log('admin-reports'); await go(page, () => toMyPage(page, 'AdminReports')); await cap(page, 'admin-reports');
  log('admin-members'); await go(page, () => toMyPage(page, 'AdminMembers')); await cap(page, 'admin-members');
  console.log('intercepted', ctx.__prismStats.intercepted, JSON.stringify([...new Set(ctx.__prismStats.list)]), 'ext', JSON.stringify([...new Set(ctx.__ext)]));
  await ctx.close();
} finally { await browser.close(); }
