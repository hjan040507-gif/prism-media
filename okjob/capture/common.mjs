// okjob 촬영 공통 — 로컬 사본(tmp/okjob-src, 앱 3611 · 로컬 Supabase pm-okjob 57010~57019)만 본다.
// 운영 주소(okjob-jeju.kr · supabase.co)로는 요청을 보내지 않는다(아래 assertLocal 이 막는다).
import fs from 'node:fs';
import path from 'node:path';
import { launch, newContext, capturePage, startFlow, recordSeq, saveShot, log, sleep, ROOT } from '../../tools/lib.mjs';
export { launch, newContext, capturePage, startFlow, recordSeq, saveShot, log, sleep, ROOT };

export const BASE = 'http://127.0.0.1:3611';
export const STATE = path.join(ROOT, 'tmp', 'okjob-state.json');

// 로컬 로그인 계정은 로컬 auth 에만 있다(운영 계정 아님). 값은 환경변수로만 받는다.
export function authEnv() {
  const f = path.join(ROOT, 'tmp', 'okjob-local-auth.env');
  const o = {};
  for (const l of fs.readFileSync(f, 'utf8').split('\n')) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) o[m[1]] = m[2]; }
  return o;
}

// 비GET 은 기본 가짜 200. 로컬 앱 로그인(서버 액션 POST)만 통과시킨다. 읽기 전용 POST(supabase RPC) 는 필요한 것만 allow 로 더한다.
export const GUARD = {
  allow: [
    /127\.0\.0\.1:3611\/login/,
    // 읽기 전용 RPC(Postgres STABLE 함수 — 쓸 수 없다. pg_proc.provolatile='s' 로 확인) — POST 지만 조회다
    /127\.0\.0\.1:57010\/rest\/v1\/rpc\/(assign_final_notice_passed|assignment_batch_list|assignment_bundle_mates|assignment_confirmation_status|farm_assignment_history|farm_assignment_history_range|notification_bundle_fields|notification_dispatch_info|notification_history|notification_history_failed|notification_list|worker_assignment_history|worker_month_assignments)(\?|$)/,
  ],
  // 발송 라우트는 로컬 DB 알림 행도 안 바꾸도록 가짜 성공(기본 가로채기와 같지만 이름을 박아 둔다)
  fake: [
    { match: '127.0.0.1:3611/api/notify/send-on-save', json: { ok: true, intercepted: true } },
    { match: '127.0.0.1:3611/api/notify/send-now', json: { ok: true, intercepted: true } },
  ],
};

// 로컬이 아닌 곳으로 가는 요청이 있으면 즉시 멈춘다(폰트·이미지 등 GET 도 포함 — 로컬 앱은 외부로 안 나간다).
export function assertLocal(page) {
  page.on('request', (r) => {
    const u = r.url();
    if (/^(data|blob|about):/.test(u)) return;
    const h = new URL(u).hostname;
    if (!['127.0.0.1', 'localhost'].includes(h)) { console.error('[okjob] 로컬 아닌 요청 감지 — 중단:', h); process.exit(2); }
  });
}

export const REDACT = {
  // 로그인 폼 이메일·사이드바 프로필 등은 가림 꼴이라 따로 지울 것 없음 — 촬영 중 pii_scan 으로 확인한다.
  hide: ['[data-sonner-toaster]', '[role="status"][class*="toast" i]'],
};

export async function loginAndSave(who = 'HEAD') {
  const env = authEnv();
  const browser = await launch();
  const { ctx, page } = await newContext(browser, 'desktop', { project: 'okjob', guard: GUARD });
  assertLocal(page);
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800); // 하이드레이션 기다림(STEP 36)
  await page.fill('#email', env[`SEED_ADMIN_${who}_EMAIL`]);
  await page.fill('#password', env[`SEED_ADMIN_${who}_PASSWORD`]);
  await page.click('button[type=submit]');
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30000 });
  await ctx.storageState({ path: STATE });
  const st = ctx.__prismStats;
  log('로그인 저장', page.url(), '가로챈', st.intercepted, '허용', st.allowed.join(','));
  await browser.close();
}
