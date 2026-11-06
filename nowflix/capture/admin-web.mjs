// nowflix 관리자 웹(데스크톱 1440) 촬영 — 로컬 사본(next start) + 가짜 Supabase(mock-supabase.mjs). 운영 로그인·운영 DB 없음.
// 실행: APP_PORT=47311 MOCK_PORT=47312 node nowflix/capture/admin-web.mjs
// 준비: tmp/nowflix-src/admin-web 에 npm ci·build·setup-fake-env.mjs, mock-supabase.mjs 와 next start 가 떠 있어야 한다.
//   - 로그인 화면은 로그아웃 상태로, 나머지는 가짜 SESSION_SECRET 으로 서명한 가짜 세션 쿠키(nf_admin)로 찍는다.
//   - 브라우저 쪽 비GET 은 guard 로 가짜 성공. /api/status(서버가 YouTube 를 부름)·/api/parts/verify·POST /api/parts 는 아래에서 직접 가짜 응답.
import fs from 'node:fs';
import path from 'node:path';
import { launch, newContext, capturePage, startFlow, liveRedact, ROOT } from '../../tools/lib.mjs';

const APP = `http://127.0.0.1:${process.env.APP_PORT}`;
const MOCK = `http://127.0.0.1:${process.env.MOCK_PORT}`;
if (!process.env.APP_PORT || !process.env.MOCK_PORT) throw new Error('APP_PORT·MOCK_PORT 필요');
const { token } = JSON.parse(fs.readFileSync(path.join(ROOT, 'tmp', 'nowflix-src', 'fake-session.json'), 'utf8'));
const mock = (p, body) => fetch(MOCK + p, body ? { method: 'POST', body: JSON.stringify(body) } : {}).then((r) => r.json());

// 가짜 값: 파트별 영상 수(실제 YouTube 값 아님) · 새 재생목록 확인 응답
const VIDEO_COUNTS = { '괜찮Knee TV': 8, '척척박사 TV': 12, '손봐줘 TV': 9, 'Hip한 NOW': 15, '어깨의 정석': 11, '족집게 TV': 7 };
const NEW_PART = { title: '발목 튼튼 TV', playlistId: 'PLfakeplaylistidfakeplaylistidfake', itemCount: 9 };

const ctxOpts = (authed) => ({
  project: 'nowflix',
  storageState: authed ? { cookies: [{ name: 'nf_admin', value: token, domain: '127.0.0.1', path: '/', httpOnly: true, secure: false, sameSite: 'Lax', expires: Math.floor(Date.now() / 1000) + 3600 }], origins: [] } : undefined,
  guard: {},
  redact: {},
});

// 이 프로젝트 전용 가짜 응답(가로챈 요청으로 기록한다)
async function installFakes(ctx) {
  const st = ctx.__prismStats;
  const note = (m, u) => { st.intercepted++; st.list.push(`${m} ${new URL(u).pathname} (fake)`); };
  await ctx.route('**/api/status', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    note('GET', route.request().url());
    const rows = await fetch(`${MOCK}/rest/v1/parts?order=position.asc`).then((r) => r.json());
    const statuses = rows.map((p) => ({ id: p.id, title: p.title, isActive: p.is_active, playlistId: p.playlist_id, videoCount: VIDEO_COUNTS[p.title] ?? NEW_PART.itemCount, ok: true, warning: null }));
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ statuses }) });
  });
  await ctx.route('**/api/parts/verify', (route) => {
    note('POST', route.request().url());
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ playlistId: NEW_PART.playlistId, title: NEW_PART.title, itemCount: NEW_PART.itemCount }) });
  });
  await ctx.route(/\/api\/parts$/, async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    note('POST', route.request().url());
    const row = await mock('/__mock/add-part', { title: NEW_PART.title, playlist_id: NEW_PART.playlistId });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, part: row }) });
  });
}

const ready = async (page) => {
  await page.waitForFunction(() => !document.body.innerText.includes('영상 수 확인 중') && !document.querySelector('.animate-spin'), null, { timeout: 15000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
};

const browser = await launch();
const report = {};
try {
  // 1) 로그인 화면(로그아웃 상태)
  {
    const { ctx, page } = await newContext(browser, 'desktop', ctxOpts(false));
    await page.goto(`${APP}/login`, { waitUntil: 'networkidle' });
    await capturePage(page, 'login');
    report.login = ctx.__prismStats.list.length;
    await ctx.close();
  }
  // 2) 파트 목록 · 설정 (로그인 상태)
  await mock('/__mock/reset', { n: 6 });
  {
    const { ctx, page } = await newContext(browser, 'desktop', ctxOpts(true));
    await installFakes(ctx);
    await page.goto(`${APP}/parts`, { waitUntil: 'networkidle' });
    await ready(page);
    await capturePage(page, 'parts');
    await page.goto(`${APP}/settings`, { waitUntil: 'networkidle' });
    await ready(page);
    await capturePage(page, 'settings');

    // 3) 설정 변경 흐름: 전 → 편집 → 저장됨
    const flowS = await startFlow(page, 'settings-idle-change');
    await page.goto(`${APP}/settings`, { waitUntil: 'networkidle' });
    await ready(page);
    await liveRedact(page, true);
    await flowS.step('before');
    const idle = page.locator('input[type=number]');
    await idle.click();
    await idle.fill('180');
    await flowS.step('edited-180');
    await page.getByRole('button', { name: '저장' }).first().click();
    await page.getByText('저장했어요.').first().waitFor({ timeout: 8000 });
    await flowS.step('saved');

    // 4) 파트 추가 흐름: 빈 폼 → 입력 → 확인됨 → 저장 뒤 목록 (기존 3개에서 시작해 4번째가 한 화면에 보이게)
    await mock('/__mock/reset', { n: 3 });
    await page.goto(`${APP}/parts`, { waitUntil: 'networkidle' });
    await ready(page);
    const flowP = await startFlow(page, 'parts-add');
    await page.getByRole('button', { name: '+ 파트 추가' }).click();
    await page.getByText('파트 추가').last().waitFor();
    await flowP.step('empty-form');
    await page.getByPlaceholder('예: 괜찮Knee TV').fill(NEW_PART.title);
    await page.locator('input').nth(1).pressSequentially(NEW_PART.playlistId, { delay: 15 }) // 재생목록 ID 만 붙여넣는 경우(extractPlaylistId 의 case 1) — 화면에 URL 글자가 안 남게;
    await flowP.step('typed');
    await page.getByRole('button', { name: '확인' }).click();
    await page.getByText('재생목록을 찾았어요').waitFor({ timeout: 8000 });
    await flowP.step('verified');
    await page.getByRole('button', { name: '저장' }).last().click();
    await page.getByText(NEW_PART.title).first().waitFor({ timeout: 8000 });
    await page.waitForFunction(() => !document.querySelector('.fixed.inset-0'), null, { timeout: 8000 });
    await ready(page);
    await flowP.step('saved-list');
    report.intercepted = ctx.__prismStats.intercepted;
    report.list = ctx.__prismStats.list;
    report.allowed = ctx.__prismStats.allowed;
    await ctx.close();
  }
  await mock('/__mock/reset', { n: 6 });
} finally {
  await browser.close();
}
console.log(JSON.stringify(report));
