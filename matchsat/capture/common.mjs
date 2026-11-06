// matchsat 촬영 공통 — 로컬 사본(next start :3612) + 로컬 Supabase(pm-matchsat, API 57020). 운영 접속 0.
import fs from 'node:fs';
import path from 'node:path';
import { newContext, log, ROOT } from '../../tools/lib.mjs';

export const BASE = 'http://127.0.0.1:3612';
export const STATE_DIR = path.join(ROOT, 'tmp', 'matchsat');
export const EMAILS = { reqA: 'req-a@pm-local.test', reqB: 'req-b@pm-local.test', supA: 'sup-a@pm-local.test', admin: 'admin@pm-local.test' };
export const stateFile = (who) => path.join(STATE_DIR, `state-${who}.json`);

// 로컬 주소로 가는 비GET(서버 액션 · 로컬 Supabase REST)은 통과시킨다 — 앱·DB 모두 이 서버의 로컬 사본이라 운영이 아니다.
// 그 밖의 모든 주소의 비GET 은 lib guard 기본값대로 가짜 200 으로 가로챈다. (결정 기록: shots.md '가로채기')
export const GUARD = { allow: [/^http:\/\/127\.0\.0\.1:(3612|57020)\//] };

// 푸터 사업자·연락처 자리표시자(footer.tsx:24-38)는 지운다. 그 밖의 가림은 lib 자동 규칙(전화·이메일·계좌·URL).
export const REDACT = { remove: ['footer dl'], hide: [] };

export const needPw = () => {
  if (!process.env.MS_PW) throw new Error('MS_PW 환경변수 필요(로컬 가짜 계정 비밀번호)');
  return process.env.MS_PW;
};

// 한 번 로그인해 세션(storageState)을 저장한다. 로그인 POST 는 로컬 앱 → 로컬 Supabase Auth.
export async function loginAs(browser, who) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  const { ctx, page } = await newContext(browser, 'desktop', { project: 'matchsat', guard: GUARD, redact: REDACT });
  await page.goto(`${BASE}/auth`, { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', EMAILS[who]);
  await page.fill('input[name="password"]', needPw());
  await Promise.all([page.waitForURL((u) => !u.pathname.startsWith('/auth'), { timeout: 20000 }), page.click('button[type="submit"]:has-text("로그인")')]);
  await ctx.storageState({ path: stateFile(who) });
  fs.chmodSync(stateFile(who), 0o600);
  await ctx.close();
  log('login', who, 'ok');
}

export async function ctxFor(browser, vp, who, extra = {}) {
  const storageState = who ? stateFile(who) : undefined;
  return newContext(browser, vp, { project: 'matchsat', guard: GUARD, redact: REDACT, storageState, ...extra });
}

export async function open(page, p, wait = 800) {
  await page.goto(BASE + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(wait);
}

export const ids = () => JSON.parse(fs.readFileSync(path.join(STATE_DIR, 'ids.json'), 'utf8'));
export const tryDo = async (name, fn) => { try { await fn(); log('ok', name); } catch (e) { log('FAIL', name, String(e.message).slice(0, 400)); } };
export { log };
