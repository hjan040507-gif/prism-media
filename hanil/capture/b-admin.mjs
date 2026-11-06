// B) 관리자 — 사본(tmp/hanil-src) + 로컬 Supabase(127.0.0.1:57031) + 앱 3613 에서만. 가짜 관리자(admin@example.com)로 실제 로그인.
// 운영 주소는 한 번도 열지 않는다. 비밀번호는 환경변수 FAKE_ADMIN_PW(로컬 가짜 계정 값).
// 사용: node hanil/capture/b-admin.mjs [pages|bg|product|content|inbox|public]  (인자 없으면 전부)
import path from 'node:path';
import { launch, newContext, capturePage, startFlow, LOCAL, REDACT_PUBLIC, gotoReady as _g, sleep, log, liveRedact } from './common.mjs';
import { ROOT } from '../../tools/lib.mjs';

const SRC = path.join(ROOT, 'tmp/hanil-src/public/images');
const PW = process.env.FAKE_ADMIN_PW;
if (!PW) throw new Error('FAKE_ADMIN_PW 환경변수 필요(로컬 가짜 계정)');
const which = process.argv.slice(2);
const on = (k) => !which.length || which.includes(k);

// 관리자 화면: 머리의 로그인 계정 이메일은 지워진다(자동 가림) — 고객 실제 이메일은 DB 에도 없음(가짜 관리자로 덮음).
const REDACT_ADMIN = { textMap: { '정 대 성': '김○○', '정대성': '김○○' } };
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; // 특정 페이지만 다시 찍기
const GUARD_LOCAL = {}; // 로컬 DB 라 비GET(저장·업로드)은 그대로 통과시켜야 흐름이 실제로 돈다 → allow 에 로컬 주소만
const allowLocal = ['127.0.0.1:3613/', '127.0.0.1:57031/']; // 로컬 사본·로컬 Supabase 만 비GET 통과

async function gotoLocal(page, p) {
  const res = await page.goto(LOCAL + p, { waitUntil: 'domcontentloaded', timeout: 90000 });
  if (!res || res.status() >= 400) throw new Error(`${p} → ${res && res.status()}`);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
}

const browser = await launch();
try {
  // ── 1) 공개 견적 폼 제출 → 접수 완료 화면(로컬 사본 · 같은 코드). 접수함에 가짜 행이 하나 늘어난다.
  if (on('public')) {
    const { ctx, page } = await newContext(browser, 'desktop', { project: 'hanil', guard: { allow: allowLocal }, redact: REDACT_PUBLIC });
    await gotoLocal(page, '/support/quote');
    await page.waitForTimeout(1500);
    const y = await page.evaluate(() => Math.round(document.querySelector('form').getBoundingClientRect().top + window.scrollY - 110));
    const flow = await startFlow(page, 'quote-submit-local', { scrollY: y });
    await flow.step('empty-form', { note: '로컬 사본(가짜 DB)' });
    await page.selectOption('#process', { index: 4 });
    await page.fill('#company', 'G기계'); await page.fill('#name', '오○○');
    await page.fill('#email', 'user***@example.com'); await page.fill('#phone', '010-****-****');
    await page.fill('#material', 'SUS304'); await page.fill('#quantity', '800개');
    await page.fill('#message', '부품 표면 경도 향상을 위한 처리 견적을 요청드립니다.');
    await page.check('input[name="privacy"]');
    await flow.step('filled-before-submit');
    // 제출 — 로컬 서버 액션(가짜 DB). 입력값이 이메일 형식이어야 클라 검증을 통과한다 → 제출 순간만 형식을 맞추고 화면은 가린다.
    await page.evaluate(() => window.__prism && window.__prism.live(false));
    await page.fill('#email', 'user@example.com'); await page.fill('#phone', '010-0000-0000');
    await page.click('button[type=submit]');
    await page.waitForSelector('text=접수가 완료되었습니다', { timeout: 30000 });
    await flow.step('submitted-success', { note: '로컬 사본 서버 액션 성공 화면(Resend 키 없음 → 메일 미발송)' });
    log('public quote flow done', JSON.stringify(ctx.__prismStats.allowed));
    await ctx.close();
  }

  // ── 2) 관리자 로그인(UI) — 로그인 POST(인증 세션)는 로컬 GoTrue 로 간다
  const { ctx, page } = await newContext(browser, 'desktop', { project: 'hanil', guard: { allow: allowLocal }, redact: REDACT_ADMIN });
  await gotoLocal(page, '/admin/login');
  await capturePage(page, 'admin-login', { header: false });
  await page.evaluate(() => window.__prism && window.__prism.live(false)); // 입력 중 이메일이 가림으로 지워지지 않게(로그인 화면은 이미 찍음)
  await page.fill('#email', 'admin@example.com');
  await page.fill('#password', PW);
  await page.click('button[type=submit]');
  await page.waitForURL(/\/admin(\/)?$/, { timeout: 180000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  // 입력칸이 화면에 남지 않게 로그인 화면은 이미 떠났다. 이메일 값이 들어간 페이지 캐시는 없음.
  log('logged in', page.url());

  if (on('pages')) {
    const PAGES = [
      ['admin-dashboard', '/admin'],
      ['admin-backgrounds', '/admin/backgrounds'],
      ['admin-product-photos', '/admin/product-photos'],
      ['admin-product-photos-gas-nitriding', '/admin/product-photos/gas-nitriding'],
      ['admin-content-hub', '/admin/content'],
      ['admin-content-home', '/admin/content/home'],
      ['admin-content-greeting', '/admin/content/greeting'],
      ['admin-content-facility', '/admin/content/facility'],
      ['admin-inquiries', '/admin/inquiries'],
      ['admin-notices', '/admin/notices'],
      ['admin-notifications', '/admin/notifications'],
    ];
    for (const [name, p] of PAGES) {
      if (ONLY && !ONLY.includes(name)) continue;
      await gotoLocal(page, p);
      await page.waitForTimeout(800);
      await capturePage(page, name, { header: false });
      log('captured', name);
    }
    // 접수 상세(첫 행)
    if (!ONLY || ONLY.includes('admin-inquiry-detail')) {
    await gotoLocal(page, '/admin/inquiries');
    await page.locator('ul li a').first().click();
    await page.waitForURL(/inquiries\/[0-9a-f-]+/);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await capturePage(page, 'admin-inquiry-detail', { header: false });
    }
  }

  // ── 3) 배경 사진 교체 흐름: 슬롯 선택 → 초점 지정 미리보기 → 저장
  if (on('bg')) {
    await gotoLocal(page, '/admin/backgrounds');
    await page.waitForTimeout(1000);
    const card = page.getByRole('button', { name: '사진·초점 바꾸기' }).first();
    await card.scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => Math.max(0, Math.round(window.scrollY - 120)));
    await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y);
    const flow = await startFlow(page, 'bg-replace', { scrollY: y });
    await flow.step('slot-list');
    await card.click();
    const dlg = page.locator('[role=dialog][aria-label][aria-modal="true"]').first();
    await dlg.waitFor();
    await page.waitForTimeout(800);
    await flow.step('dialog-open');
    await page.setInputFiles('input[type=file]', path.join(SRC, 'r2/main-hero-3/hero-space.webp'));
    await page.waitForSelector('text=바꿀 사진', { timeout: 60000 });
    await page.waitForTimeout(1200);
    await flow.step('photo-uploaded-focal-preview');
    const box = page.locator('[role=application]').first();
    const b = await box.boundingBox();
    await page.mouse.click(b.x + b.width * 0.7, b.y + b.height * 0.35);
    await page.waitForTimeout(500);
    await flow.step('focal-point-set');
    await dlg.getByRole('button', { name: '저장', exact: true }).click();
    await dlg.waitFor({ state: 'detached', timeout: 60000 });
    await page.waitForTimeout(1200);
    await flow.step('saved-list-updated');
    log('bg-replace done');
  }

  // ── 4) 제품 사진: 교체(다이얼로그) + 순서 바꾸기
  if (on('product')) {
    await gotoLocal(page, '/admin/product-photos/gas-nitriding');
    await page.waitForTimeout(1000);
    const btn = page.getByRole('button', { name: '사진 바꾸기' }).first();
    await btn.scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => Math.max(0, Math.round(window.scrollY - 140)));
    await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y);
    const flow = await startFlow(page, 'product-photo-replace', { scrollY: y });
    await flow.step('photo-cards');
    await btn.click();
    const dlg = page.locator('[role=dialog][aria-label][aria-modal="true"]').first();
    await dlg.waitFor();
    await page.waitForTimeout(600);
    await flow.step('dialog-open');
    await page.setInputFiles('input[type=file]', path.join(SRC, 'photos/equipment/equi-10.jpg'));
    await page.waitForSelector('text=바꿀 사진', { timeout: 60000 });
    await page.waitForTimeout(1000);
    await flow.step('new-photo-preview');
    await dlg.getByRole('button', { name: '저장', exact: true }).click();
    await dlg.waitFor({ state: 'detached', timeout: 60000 });
    await page.waitForTimeout(1200);
    await flow.step('replaced');
    log('product replace done');

    // 순서 — 갤러리형 섹션의 [뒤로] → [순서 저장]
    await gotoLocal(page, '/admin/product-photos/gas-nitriding');
    await page.waitForTimeout(1000);
    const sec = page.locator('[data-section]').first();
    await sec.scrollIntoViewIfNeeded();
    const y2 = await sec.evaluate((el) => Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 100)));
    await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y2);
    const f2 = await startFlow(page, 'product-photo-reorder', { scrollY: y2 });
    await f2.step('gallery-before');
    await sec.getByRole('button', { name: /앞으로$/ }).nth(1).click();
    await page.waitForTimeout(600);
    await f2.step('moved-forward-unsaved');
    await sec.getByRole('button', { name: '순서 저장' }).click();
    await page.waitForTimeout(1500);
    await f2.step('order-saved');
    log('product reorder done');
  }

  // ── 5) 문구 수정: 메인 화면(히어로) 문구
  if (on('content')) {
    await gotoLocal(page, '/admin/content/home');
    await page.waitForTimeout(800);
    const flow = await startFlow(page, 'content-edit-home', { scrollY: 0 });
    await flow.step('form-loaded');
    const ta = page.locator('textarea').first();
    await ta.fill('제품의 표면은 단순한 외관이 아닌,\n수명을 좌우하는 핵심 기술 영역입니다.');
    await page.waitForTimeout(300);
    await flow.step('headline-edited');
    await page.getByRole('button', { name: '저장', exact: true }).click();
    await page.waitForSelector('text=저장되었습니다', { timeout: 20000 });
    await flow.step('saved-message');
    log('content edit done');
  }

  // ── 6) 접수함: 목록 → 상세 → 답변완료로 변경
  if (on('inbox')) {
    await gotoLocal(page, '/admin/inquiries');
    await page.waitForTimeout(800);
    const flow = await startFlow(page, 'inquiry-status', { scrollY: 0 });
    await flow.step('inbox-list');
    await page.locator('ul li a').first().click();
    await page.waitForURL(/inquiries\/[0-9a-f-]+/);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await flow.step('detail-new');
    await page.getByRole('button', { name: '답변완료로 변경' }).click();
    await page.waitForSelector('text=신규로 되돌리기', { timeout: 20000 });
    await page.waitForTimeout(600);
    await flow.step('marked-answered');
    log('inquiry status done');
  }
  log('intercepted', ctx.__prismStats.intercepted, 'allowed(local)', ctx.__prismStats.allowed.length);
} finally {
  await browser.close();
}
