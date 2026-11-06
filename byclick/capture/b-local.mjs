// byclick B — 매입업체(딜러)·관리자 데스크톱 1440. 로컬 사본(tmp/byclick-src, next start) + 가짜 Supabase(mock-supabase.mjs). 운영 접속 0.
// 실행: APP_URL=http://127.0.0.1:3260 MOCK_URL=http://127.0.0.1:3263 node byclick/capture/b-local.mjs [dealer|admin|seq]
// 세션: 가짜 JWT 쿠키(sb-127-auth-token). 딜러·관리자 로그인 화면은 거치지 않는다(운영 로그인 0).
// 서버 액션(POST)·브라우저가 부르는 Supabase 쓰기는 lib guard 가 가로채 가짜 200 — 예외 1건: 입찰 RPC place_bid_v2 는
// 로컬 가짜 DB(메모리)로만 가므로 통과시켜 「제출 후」를 서버 재렌더로 그린다(운영 아님 · 허용한 비GET 로 json 에 남는다).
import fs from 'node:fs';
import { launch, newContext, capturePage, startFlow, recordSeq, saveShot, liveRedact, settle, log } from '../../tools/lib.mjs';
import { cookieValueFor } from './mock-data.mjs';

const APP = process.env.APP_URL || 'http://127.0.0.1:3260';
const MOCK = process.env.MOCK_URL || 'http://127.0.0.1:3263';
const WHICH = process.argv[2] || 'all';
const ids = await (await fetch(`${MOCK}/__mock/ids`)).json();
const NOWMS = ids.now;
const live = ids.veh.filter((v) => v.i < 6);
const ended = ids.veh.filter((v) => v.i >= 6 && v.i <= 8);

const MH = new URL(MOCK).host;
// 허용한 비GET(전부 로컬 가짜 DB 로만 간다 — 운영 아님): 입찰 RPC(메모리에 입찰 1건 더함) · 차종 카탈로그 RPC(읽기 전용 STABLE 함수)
const GUARD = { allow: [`${MH}/rest/v1/rpc/place_bid_v2`, `${MH}/rest/v1/rpc/vehicle_catalog`] };
const REDACT = {
  // 개발 도구·설치 안내·푸시 안내 팝업
  hide: ['[data-testid="install-prompt"]', '[data-testid="push-prompt"]', '[class*="install-prompt" i]', '[data-testid="kakao-chat"]'],
};

async function ctxFor(browser, who, extra = {}) {
  const { ctx, page } = await newContext(browser, 'desktop', { project: 'byclick', guard: GUARD, redact: REDACT, ...extra });
  await ctx.addCookies([{ name: 'sb-127-auth-token', value: cookieValueFor(who), url: APP, httpOnly: false, sameSite: 'Lax' }]);
  return { ctx, page };
}
async function open(page, p, { wait = 1200 } = {}) {
  await page.goto(APP + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(wait);
}
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; // 재촬영용: ONLY=requests,decisions 처럼 이름으로 거른다
const tryDo = async (name, fn) => { if (ONLY && !ONLY.includes(name)) return; try { await fn(); log('ok', name); } catch (e) { log('FAIL', name, String(e.message).slice(0, 300)); } };

// 서버 액션 id 는 빌드가 정한다 — 클라이언트 청크에서 이름으로 찾는다(읽기 전용 listModelsByManufacturer 하나만 통과시키는 데 쓴다).
function actionIdOf(name) {
  const dir = new URL('../../tmp/byclick-src/.next/static/', import.meta.url).pathname;
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(d + '/' + e.name) : [d + '/' + e.name]));
  for (const f of walk(dir).filter((x) => x.endsWith('.js'))) {
    const m = fs.readFileSync(f, 'utf8').match(new RegExp('"([a-f0-9]{40,})",[a-z]\\.callServer,void 0,[a-z]\\.findSourceMapURL,"' + name + '"'));
    if (m) return m[1];
  }
  return null;
}

async function dealer(browser) {
  const { ctx, page } = await ctxFor(browser, 'dealer', { clock: true });
  await page.clock.setFixedTime(NOWMS);
  const L2 = live[1].au; // A모터스 입찰 0건(남은 3회)
  const L3 = live[2].au; // 3회 모두 사용
  const L1 = live[0].au; // 1건 입찰

  await tryDo('auctions', async () => { await open(page, '/dealer/auctions'); await capturePage(page, 'dealer-auctions'); });
  await tryDo('detail-L1', async () => { await open(page, `/dealer/auctions/${L1}`); await capturePage(page, 'dealer-auction-detail'); });
  await tryDo('detail-ended', async () => { await open(page, `/dealer/auctions/${ended[1].au}`); await capturePage(page, 'dealer-auction-detail-won'); });

  // 밀봉 입찰: 입력 전 · 금액 입력 · 확인창 · 제출 후 — 같은 scrollY
  await tryDo('sealed-bid-flow', async () => {
    await open(page, `/dealer/auctions/${L2}`);
    const y = await page.evaluate(() => { const el = document.querySelector('[data-testid="bid-quota"]'); return el ? Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 220)) : 0; });
    const f = await startFlow(page, 'sealed-bid', { scrollY: y });
    await f.step('before-empty');
    await page.locator('[data-testid="bid-amount"]').click();
    await page.locator('[data-testid="bid-amount"]').pressSequentially('4200000', { delay: 60 });
    await page.waitForTimeout(400);
    await f.step('amount-typed');
    await page.locator('[data-testid="bid-submit"]').click();
    await page.waitForTimeout(700);
    await f.step('confirm-dialog');
    await page.locator('[data-testid="bid-confirm"]').click();
    await page.waitForTimeout(2200);
    await f.step('after-submitted');
  });

  await tryDo('bids', async () => { await open(page, '/dealer/bids'); await capturePage(page, 'dealer-bids'); });
  await tryDo('wins', async () => { await open(page, '/dealer/wins'); await capturePage(page, 'dealer-wins'); });
  // 낙찰·출고 신청: 입금 확인된 건(MT-07)에서 「출고 신청」 창 — 제출은 하지 않는다(서버 액션은 가로챔 대상)
  await tryDo('release-flow', async () => {
    await open(page, '/dealer/wins');
    const y = await page.evaluate(() => { const b = document.querySelector('[data-testid="deal-release"]'); return b ? Math.max(0, Math.round(b.getBoundingClientRect().top + window.scrollY - 380)) : 0; });
    const f = await startFlow(page, 'release-request', { scrollY: y });
    await f.step('deal-card');
    await page.locator('[data-testid="deal-release"]').first().click();
    await page.waitForTimeout(800);
    await f.step('release-dialog-open');
    const radios = page.locator('[data-testid^="release-"][role="radio"], input[type="radio"][data-testid^="release-"]');
    if (await radios.count() > 1) { await radios.nth(1).click({ force: true }); await page.waitForTimeout(500); }
    await f.step('release-option-selected');
  });
  await tryDo('payment-guide-flow', async () => {
    await open(page, '/dealer/wins');
    const y = await page.evaluate(() => { const b = document.querySelector('[data-testid="deal-pay"]'); return b ? Math.max(0, Math.round(b.getBoundingClientRect().top + window.scrollY - 380)) : 0; });
    const f = await startFlow(page, 'payment-guide', { scrollY: y });
    await f.step('deal-card');
    await page.locator('[data-testid="deal-pay"]').first().click();
    await page.waitForTimeout(800);
    await f.step('payment-guide-open');
    await page.locator('[data-testid="dialog-back"]').first().click();
    await page.waitForTimeout(600);
    await f.step('closed-again');
  });
  await tryDo('interest-models', async () => { await open(page, '/dealer/interest-models'); await capturePage(page, 'dealer-interest-models'); });
  // 관심차 조건 등록: 「관심차 조건」 창 열기 → 제조사 선택(모델 목록은 읽기 전용 서버 액션 listModelsByManufacturer — 이 하나만 통과) → 모델 선택. 추가(쓰기)는 누르지 않는다.
  await tryDo('interest-conditions-flow', async () => {
    const actionId = actionIdOf('listModelsByManufacturer');
    if (!actionId) throw new Error('listModelsByManufacturer action id 를 못 찾음');
    log('listModelsByManufacturer action id', actionId.slice(0, 8) + '…');
    await ctx.route('**/*', (route) => (route.request().headers()['next-action'] === actionId ? route.continue() : route.fallback()));
    await open(page, '/dealer/interest-models');
    const f = await startFlow(page, 'interest-conditions', { scrollY: 0 });
    await f.step('page');
    await page.getByRole('button', { name: /관심차 조건/ }).first().click();
    await page.waitForTimeout(900);
    await f.step('conditions-window-open');
    const mfr = page.locator('select[aria-label="제조사"]');
    const opts = await mfr.locator('option').allTextContents();
    const target = opts.find((t) => t.includes('가와사키')) || opts[2];
    await mfr.selectOption({ label: target });
    await page.waitForTimeout(1200);
    await f.step('maker-chosen-models-loaded');
    const md = page.locator('select[aria-label="모델"]');
    const mopts = await md.locator('option').allTextContents();
    if (mopts.length > 1) await md.selectOption({ index: 1 });
    await page.waitForTimeout(500);
    await f.step('model-chosen');
  });
  console.log('dealer intercepted', ctx.__prismStats.intercepted, JSON.stringify(ctx.__prismStats.list), 'allowed', JSON.stringify(ctx.__prismStats.allowed));
}

async function admin(browser) {
  const { ctx, page } = await ctxFor(browser, 'owner');
  await tryDo('dashboard', async () => { await open(page, '/admin'); await capturePage(page, 'admin-dashboard'); });
  await tryDo('requests', async () => { await open(page, '/admin/requests'); await capturePage(page, 'admin-requests'); });
  const ex = (n) => ids.extra.find((e) => e.n === n).sr;
  await tryDo('request-detail-new', async () => { await open(page, `/admin/requests/${ex(13)}`); await capturePage(page, 'admin-request-detail-new'); });
  await tryDo('request-detail-dispatched', async () => { await open(page, `/admin/requests/${ex(15)}`); await capturePage(page, 'admin-request-detail-dispatched'); });
  await tryDo('request-detail-auctioning', async () => { await open(page, `/admin/requests/${ids.veh[0].sr}`); await capturePage(page, 'admin-request-detail-auctioning'); });
  await tryDo('inspections', async () => { await open(page, '/admin/inspections'); await capturePage(page, 'admin-inspections'); });
  await tryDo('inspection-form', async () => { await open(page, `/admin/inspections/${ids.veh[10].sr}`); await capturePage(page, 'admin-inspection-form'); });
  await tryDo('auctions', async () => { await open(page, '/admin/auctions'); await capturePage(page, 'admin-auctions'); });
  await tryDo('auction-detail', async () => { await open(page, `/admin/auctions/${live[0].au}`); await capturePage(page, 'admin-auction-detail'); });
  await tryDo('settlements', async () => { await open(page, '/admin/settlements'); await capturePage(page, 'admin-settlements'); });
  await tryDo('roles', async () => { await open(page, '/admin/settings/roles'); await capturePage(page, 'admin-roles'); });
  await tryDo('decisions', async () => { await open(page, '/admin/decisions'); await capturePage(page, 'admin-decisions'); });
  await tryDo('payments', async () => { await open(page, '/admin/payments'); await capturePage(page, 'admin-payments'); });
  await tryDo('releases', async () => { await open(page, '/admin/releases'); await capturePage(page, 'admin-releases'); });
  console.log('admin intercepted', ctx.__prismStats.intercepted, JSON.stringify(ctx.__prismStats.list), 'allowed', JSON.stringify(ctx.__prismStats.allowed));
}

const browser = await launch();
try {
  if (WHICH === 'all' || WHICH === 'dealer') await dealer(browser);
  if (WHICH === 'all' || WHICH === 'admin') await admin(browser);
} finally {
  await browser.close();
}
