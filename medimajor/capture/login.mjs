// 로그인 1회(기존 테스트·관리자 계정) → storageState 를 tmp/mm/state-<kind>.json 에 저장(gitignored). 비밀값은 환경변수로만, 출력하지 않는다.
// 로그인은 서버 액션 POST(medimajor.com/login) 하나만 allow — 운영 인증 세션 행이 남는 쓰기라 횟수를 보고한다.
// 사용: LOGIN_KIND=seller|admin LOGIN_EMAIL=… LOGIN_PASSWORD=… node medimajor/capture/login.mjs
import fs from 'node:fs';
import { launch, mk, ORIGIN } from './common.mjs';
const kind = process.env.LOGIN_KIND; const email = process.env.LOGIN_EMAIL; const pw = process.env.LOGIN_PASSWORD;
if (!kind || !email || !pw) { console.log('LOGIN_RESULT skipped (env 없음)'); process.exit(2); }
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop', { guard: { allow: ['medimajor.com/login'] } });
  await page.goto(ORIGIN + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const em = page.locator('input[type=email], input[name=email], input[autocomplete=username]').first();
  const pwd = page.locator('input[type=password]').first();
  await em.fill(email); await pwd.fill(pw);
  const nav = page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 20000 }).then(() => true).catch(() => false);
  await page.locator('form:has(input[type=password]) button[type=submit]').first().click();
  const ok = await nav;
  const st = ctx.__prismStats;
  console.log('LOGIN_RESULT', kind, ok ? 'success' : 'stayed-on-login', 'allowed_nonget=' + JSON.stringify(st.allowed), 'url=' + new URL(page.url()).pathname);
  if (ok) { fs.mkdirSync('tmp/mm', { recursive: true }); await ctx.storageState({ path: `tmp/mm/state-${kind}.json` }); fs.chmodSync(`tmp/mm/state-${kind}.json`, 0o600); }
  await ctx.close();
  process.exit(ok ? 0 : 3);
} finally { await browser.close(); }
