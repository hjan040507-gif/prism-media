// 로그인 화면(데스크톱 1440): 관리 홈 · 참여 데이터/경품 확률·재고(이벤트 상세) · 배포용 QR 모달 · 관리자 초대(링크 발급 상태 흐름).
// QA 풀 계정(~/.q1r/qa-pool.json, 값 미출력)으로 로그인한 세션(tmp/maieventic-auth/state.json — gitignored)을 쓴다. 서버 쓰기가 있는 /create 는 열지 않는다(BLOCKED.md).
// 이 스크립트가 여는 /admin·/admin/events/<slug>·/admin/members 는 GET 렌더에 서버 쓰기가 없음을 코드로 확인(RECON·BLOCKED 참고).
import fs from 'node:fs';
import { launch, mk, BASE, sleep } from './common.mjs';
import { capturePage, startFlow, saveShot, ROOT } from '../../tools/lib.mjs';
import path from 'node:path';
const SLUG = 'qa-chromium-roulette';
const browser = await launch();
try {
  const exp = new Date(Date.now() + 7 * 864e5).toISOString();
  const { ctx, page } = await mk(browser, 'desktop', {
    storageState: 'tmp/maieventic-auth/state.json',
    guard: {
      allow: [/supabase\.co\/auth\/v1\/token/], // 세션 갱신 시에만 나감(로그인 POST 와 같은 종류)
      fake: [{ match: /\/api\/invite$/, method: 'POST', json: { ok: true, url: '/invite/DEMO-LINK', expiresAt: exp } }],
    },
    redact: {
      hide: ['[data-feedback-open]'],
      qrSelectors: ['canvas'],
      textMap: { 'E0J27JHV': 'A7K2M9QX' }, // 발행번호(교환권 코드) → 가짜 값
    },
  });
  const go = async (p) => {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await sleep(1800);
  };
  await go('/admin');
  await page.getByRole('button', { name: '네, 관리자입니다' }).click(); // 클라이언트 전용 확인(서버 호출 없음)
  await sleep(600);
  let r = await capturePage(page, 'admin-home'); console.log('admin-home', r.full.docHeight, r.full.pii_scan.total);
  await go('/admin/events/' + SLUG);
  r = await capturePage(page, 'admin-event'); console.log('admin-event', r.full.docHeight, r.full.pii_scan.total);
  // 운영 제어(경품 가중치·일 한도) 구간 — 스크롤한 첫 화면
  const y = await page.evaluate(() => { const h = [...document.querySelectorAll('h2,h3')].find((e) => /운영 제어/.test(e.textContent)); return h ? Math.round(h.getBoundingClientRect().top + scrollY - 24) : 0; });
  await page.evaluate((yy) => window.scrollTo(0, yy), y); await sleep(600);
  await saveShot(page, path.join(ROOT, 'maieventic/desktop/admin-event-control-view.png'), { expectScroll: y, note: '이벤트 상세의 운영 제어(상태·대체 경품·가중치 확률·일 당첨 한도) 구간으로 스크롤한 첫 화면' });
  // 배포용 QR 모달(공개 URL QR — QR 은 가림)
  await page.evaluate(() => window.scrollTo(0, 0)); await sleep(400);
  await page.getByRole('button', { name: /배포용 QR/ }).first().click(); await sleep(1200);
  await saveShot(page, path.join(ROOT, 'maieventic/desktop/admin-qr-modal-view.png'), { expectScroll: 0, note: '배포용 QR 모달 — QR 캔버스는 가림(qrSelectors:canvas)' });
  await page.keyboard.press('Escape'); await sleep(400);
  // 관리자 초대
  await go('/admin/members');
  r = await capturePage(page, 'admin-members'); console.log('admin-members', r.full.docHeight, r.full.pii_scan.total);
  const flow = await startFlow(page, 'admin-invite', { scrollY: 0 });
  await flow.step('empty');
  await page.locator('#invite-label').fill('강남점 매니저');
  await flow.step('memo-typed');
  await page.getByRole('button', { name: '초대 링크 만들기' }).last().click();
  await page.getByText('이 링크는 지금만 볼 수 있어요').waitFor({ timeout: 10000 });
  await sleep(600);
  await flow.step('link-issued', { note: '가짜 POST /api/invite 응답(모양: app/api/invite/route.ts) — 링크 글자는 URL 가림 규칙으로 지움' });
  console.log('allowed_nonget', [...new Set(ctx.__prismStats.allowed)], 'intercepted', ctx.__prismStats.list);
} finally { await browser.close(); }
