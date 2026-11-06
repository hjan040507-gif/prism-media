// 로그인 1회 → storageState 를 tmp/maieventic-auth(gitignored, 700)에 저장 (이후 desktop-admin.mjs 가 이 세션을 재사용). 로그인 POST 는 1회. 비밀번호는 파일에서 읽어 메모리로만 쓴다(출력 안 함).
import fs from 'node:fs';
import { launch, mk, BASE, sleep } from './common.mjs';
const pool = JSON.parse(fs.readFileSync(process.env.HOME + '/.q1r/qa-pool.json', 'utf8')).accounts;
const email = 'qa-pool-q1b1-1@example.com';
const acct = pool[email];
if (!acct?.password) throw new Error('계정 없음');
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop', { guard: { allow: [/supabase\.co\/auth\/v1\/token/] } });
  await page.goto(BASE + '/login?redirect=%2Fadmin', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.locator('input[name=email]').fill(email);
  await page.locator('input[type=password]').first().fill(acct.password);
  await Promise.all([
    page.waitForURL(/\/admin/, { timeout: 30000 }).catch((e) => console.log('waitForURL', e.message.slice(0, 80))),
    page.locator('form button[type=submit]').first().click(),
  ]);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await sleep(2000);
  console.log('url', page.url());
  console.log('allowed', ctx.__prismStats.allowed, 'intercepted', ctx.__prismStats.list);
  await ctx.storageState({ path: 'tmp/maieventic-auth/state.json' });
  fs.chmodSync('tmp/maieventic-auth/state.json', 0o600);
} finally { await browser.close(); }
