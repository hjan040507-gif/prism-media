// prism-media 촬영 도구 — Playwright 1.64.1 · chromiumSandbox 필수.
// 규격: docs/specs/portfolio-capture.md <촬영 규격>·<가림 규칙>·<안전>
//
// 쓰는 법(프로젝트 스크립트 <proj>/capture/*.mjs 에서):
//   import { launch, newContext, capturePage, captureState, recordSeq, saveShot } from '../../tools/lib.mjs'
//   const browser = await launch();
//   const { ctx, page } = await newContext(browser, 'desktop', { project: 'sealkitt', guard: {...}, redact: {...} });
//   await page.goto(url); await capturePage(page, 'home');         // desktop/home-full.png·home-view.png(+json)
//   const flow = await startFlow(page, 'search-autocomplete');      // states/search-autocomplete/
//   await flow.step('typed-ㅍ');                                     // 01-typed-ㅍ.png(+json) — 스크롤 고정 검사
//   await browser.close();
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const LOCK_DIR = path.join(ROOT, 'tmp', 'locks');

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

// 데스크톱 1440×900 @2 · 모바일 390×844 @3 isMobile hasTouch · 태블릿은 기기 실해상도를 프로젝트가 넘긴다.
export const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: IPHONE_UA },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ───────────────────────── 자원: 브라우저 동시 2개 · 가용 메모리 6GB ─────────────────────────
function memAvailGiB() {
  const m = fs.readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+)/);
  return m ? Number(m[1]) / 1048576 : 99;
}
function pidAlive(pid) {
  try { process.kill(pid, 0); return true; } catch { return false; }
}
async function acquireBrowserSlot() {
  fs.mkdirSync(LOCK_DIR, { recursive: true });
  let warned = false;
  for (;;) {
    while (memAvailGiB() < 6) {
      if (!warned) { console.error(`[lib] 가용 메모리 ${memAvailGiB().toFixed(1)}GiB < 6 — 기다림`); warned = true; }
      await sleep(10000);
    }
    for (const i of [0, 1]) {
      const p = path.join(LOCK_DIR, `browser-${i}.lock`);
      try {
        const fd = fs.openSync(p, 'wx');
        fs.writeSync(fd, String(process.pid));
        fs.closeSync(fd);
        return p;
      } catch {
        const pid = Number(fs.readFileSync(p, 'utf8').trim() || 0);
        if (pid && pid !== process.pid && !pidAlive(pid)) fs.rmSync(p, { force: true });
      }
    }
    if (!warned) { console.error('[lib] 브라우저 자리 2개가 다 찼다 — 기다림'); warned = true; }
    await sleep(5000);
  }
}

export async function launch(opts = {}) {
  const slot = await acquireBrowserSlot();
  const release = () => fs.rmSync(slot, { force: true });
  process.once('exit', release);
  // 서버 규칙: 격리 필수. 안 켜지면 예외로 멈춘다(--no-sandbox 금지).
  const browser = await chromium.launch({ headless: true, chromiumSandbox: true, ...opts });
  browser.on('disconnected', release);
  return browser;
}

// ───────────────────────── 가림(PII) 정규식 — tools/check.py 와 같은 표 ─────────────────────────
// 문자열로 들고 다니며 브라우저 안에서 RegExp 로 만든다.
export const PII = {
  phone: String.raw`(?<![\d])(?:\+82[-\s]?\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4}|0\d{1,2}[-.\s)]{0,2}\d{3,4}[-.\s]?\d{4}|1[5-9]\d{2}[-.\s]\d{4})(?![\d])`,
  email: String.raw`[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}`,
  rrn: String.raw`(?<![\d])\d{6}\s?-\s?[1-8]\d{6}(?![\d])`,
  // 2~4개 숫자 묶음을 - 로 이은 10~16자리(계좌·사업자번호). 날짜(8자리)는 안 걸린다.
  account: String.raw`(?<![\d-])\d{2,6}(?:-\d{2,7}){2,4}(?![\d-])`,
  passport: String.raw`(?<![A-Z0-9])[MSRODG]\d{8}(?![0-9])`,
  url: String.raw`(?:https?:\/\/[^\s"'<>]+|www\.[^\s"'<>]+|(?<![@\w.-])(?:[A-Za-z0-9-]+\.)+(?:com|net|org|kr|io|app|dev|me|ai|xyz|shop|site|store|link|ly|gg|tv|jp|biz|info|vercel\.app)(?![\w.-]*[A-Za-z0-9]\()(?:\/[^\s"'<>]*)?)(?![\w])`,
  plate: String.raw`(?<![\d])\d{2,3}\s?[가나다라마바사아자거너더러머버서어저고노도로모보소오조구누두루무부수우주하허호배]\s?\d{4}(?![\d])`,
};
const ACCOUNT_MIN_DIGITS = 10;

// 브라우저 안에서 돌릴 가림·검사 코드(문자열로 주입). rules:
//   remove: [selector]      — visibility:hidden (머리·꼬리 연락처·SNS·QR) — 자리 유지라 스크롤이 안 밀린다
//   hide:   [selector]      — display:none (채팅 위젯·쿠키 배너·토스트)
//   names:  [selector]      — 글자를 '김○○'
//   ids:    [selector]      — 'user***'
//   address:[selector]      — 시·구까지만
//   biz:    { '실제 상호': 'A모터스' } 또는 [selector] (차례로 A·B·C모터스)
//   textMap:{ '원문': '바꿀 글' } — 정확히 일치하는 글자 바꾸기(가짜 값 포함)
//   fake:   [{ selector, value }] — 영업 수치 등 가짜 값
//   qr: true(기본) — img/canvas/svg 중 qr 흔적이 있는 것 visibility:hidden
const BROWSER_FN = String.raw`
window.__prism = window.__prism || (function () {
  const P = __PII__;
  const ACC_MIN = __ACC__;
  const mk = (k) => new RegExp(P[k], 'g');
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
  const stats = { phone: 0, email: 0, rrn: 0, account: 0, passport: 0, url: 0, plate: 0, names: 0, ids: 0, address: 0, biz: 0, textMap: 0, fake: 0, removed: 0, qr: 0 };
  let rules = {};
  const digits = (s) => (s.match(/\d/g) || []).length;
  function scrubText(s) {
    if (!s) return s;
    let o = s;
    o = o.replace(mk('email'), () => { stats.email++; return ''; });
    o = o.replace(mk('url'), () => { stats.url++; return ''; });
    o = o.replace(mk('rrn'), () => { stats.rrn++; return ''; });
    o = o.replace(mk('phone'), () => { stats.phone++; return '010-****-****'; });
    o = o.replace(mk('account'), (m) => { if (digits(m) < ACC_MIN) return m; stats.account++; return ''; });
    o = o.replace(mk('passport'), () => { stats.passport++; return ''; });
    o = o.replace(mk('plate'), () => { stats.plate++; return '12가 ****'; });
    if (rules.textMap) for (const [k, v] of Object.entries(rules.textMap)) if (o.includes(k)) { o = o.split(k).join(v); stats.textMap++; }
    if (rules.bizMap) for (const [k, v] of Object.entries(rules.bizMap)) if (o.includes(k)) { o = o.split(k).join(v); stats.biz++; }
    return o;
  }
  function cutAddress(s) {
    const m = s.match(/^(.*?(?:특별시|광역시|특별자치시|특별자치도|도|시)\s*\S*?(?:구|군|시))(?:\s|$)/);
    return m ? m[1] : s.split(/\s+/).slice(0, 2).join(' ');
  }
  function setText(el, v) {
    if (el.matches('input,textarea')) { el.value = v; return; }
    // 자식 요소 구조는 두고 첫 글자 노드만 바꾼다(없으면 textContent)
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let first = null, t;
    while ((t = tw.nextNode())) { if (t.nodeValue.trim()) { if (!first) { first = t; t.nodeValue = v; } else t.nodeValue = ''; } }
    if (!first) el.textContent = v;
  }
  function applyRules(root) {
    const q = (sel) => { try { return [...(root.querySelectorAll ? root.querySelectorAll(sel) : [])].concat(root.matches && root.matches(sel) ? [root] : []); } catch { return []; } };
    for (const sel of rules.hide || []) q(sel).forEach((el) => el.style.setProperty('display', 'none', 'important'));
    for (const sel of rules.remove || []) q(sel).forEach((el) => { if (!el.dataset.prRm) { el.dataset.prRm = 1; stats.removed++; } el.style.setProperty('visibility', 'hidden', 'important'); });
    for (const sel of rules.names || []) q(sel).forEach((el) => { if (el.dataset.prNm) return; el.dataset.prNm = 1; setText(el, '김○○'); stats.names++; });
    for (const sel of rules.ids || []) q(sel).forEach((el) => { if (el.dataset.prId) return; el.dataset.prId = 1; setText(el, 'user***'); stats.ids++; });
    for (const sel of rules.address || []) q(sel).forEach((el) => { if (el.dataset.prAd) return; el.dataset.prAd = 1; setText(el, cutAddress((el.value || el.textContent || '').trim())); stats.address++; });
    if (Array.isArray(rules.biz)) {
      window.__prismBiz = window.__prismBiz || new Map();
      for (const sel of rules.biz) q(sel).forEach((el) => {
        if (el.dataset.prBz) return; el.dataset.prBz = 1;
        const orig = (el.textContent || '').trim();
        if (!window.__prismBiz.has(orig)) window.__prismBiz.set(orig, String.fromCharCode(65 + window.__prismBiz.size % 26) + (rules.bizSuffix || '모터스'));
        setText(el, window.__prismBiz.get(orig)); stats.biz++;
      });
    }
    for (const f of rules.fake || []) q(f.selector).forEach((el) => { if (el.dataset.prFk) return; el.dataset.prFk = 1; setText(el, f.value); stats.fake++; });
    if (rules.qr !== false) {
      q('img,canvas,svg,picture').forEach((el) => {
        const hint = ((el.getAttribute('alt') || '') + ' ' + (el.getAttribute('src') || '') + ' ' + (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('class') || '') + ' ' + (el.id || '') + ' ' + (el.dataset.testid || '')).toLowerCase();
        if (/(^|[^a-z])qr/.test(hint) && !el.dataset.prQr) { el.dataset.prQr = 1; el.style.setProperty('visibility', 'hidden', 'important'); stats.qr++; }
      });
      for (const sel of rules.qrSelectors || []) q(sel).forEach((el) => { if (!el.dataset.prQr) { el.dataset.prQr = 1; stats.qr++; } el.style.setProperty('visibility', 'hidden', 'important'); });
    }
  }
  function scrubNode(root) {
    if (!root) return;
    if (root.nodeType === 3) { const v = scrubText(root.nodeValue); if (v !== root.nodeValue) root.nodeValue = v; return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    const base = root.nodeType === 9 ? root.body : root;
    if (!base || SKIP.has(base.nodeName)) return;
    const tw = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement && SKIP.has(n.parentElement.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    let t; while ((t = tw.nextNode())) { const v = scrubText(t.nodeValue); if (v !== t.nodeValue) t.nodeValue = v; }
    const els = base.querySelectorAll ? [base, ...base.querySelectorAll('*')] : [base];
    for (const el of els) {
      if (el.matches && el.matches('input,textarea')) { const v = scrubText(el.value); if (v !== el.value) el.value = v; }
      for (const a of ['placeholder', 'title', 'alt', 'aria-label', 'value']) {
        const cur = el.getAttribute && el.getAttribute(a);
        if (cur) { const v = scrubText(cur); if (v !== cur) el.setAttribute(a, v); }
      }
      const href = el.getAttribute && el.getAttribute('href');
      if (href && /^(tel:|mailto:|sms:)/i.test(href)) el.setAttribute('href', '#');
    }
    applyRules(base);
  }
  // 저장 직전 검사: DOM 글자 전체(스크립트·스타일 제외) + 입력값 + 보이는 속성
  function scan() {
    const parts = [];
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement && SKIP.has(n.parentElement.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    let t; while ((t = tw.nextNode())) parts.push(t.nodeValue);
    document.querySelectorAll('input,textarea').forEach((el) => parts.push(el.value || ''));
    document.querySelectorAll('[placeholder],[title],[alt],[aria-label]').forEach((el) => ['placeholder', 'title', 'alt', 'aria-label'].forEach((a) => parts.push(el.getAttribute(a) || '')));
    parts.push(document.title || '');
    const text = parts.join('\n');
    const out = { phone: 0, email: 0, rrn: 0, account: 0, passport: 0, url: 0, plate: 0 };
    const samples = [];
    for (const k of Object.keys(out)) {
      for (const m of text.matchAll(mk(k))) {
        if (k === 'account' && digits(m[0]) < ACC_MIN) continue;
        out[k]++;
        if (samples.length < 8) samples.push(k + ':' + m[0].slice(0, 2) + '***');
      }
    }
    out.total = Object.values(out).reduce((a, b) => a + b, 0);
    out.samples = samples;
    return out;
  }
  let observer = null;
  function live(on) {
    if (observer) { observer.disconnect(); observer = null; }
    if (!on) return;
    observer = new MutationObserver((muts) => {
      observer.disconnect();
      for (const m of muts) {
        if (m.type === 'characterData') scrubNode(m.target);
        else if (m.type === 'attributes') scrubNode(m.target);
        else m.addedNodes.forEach((n) => scrubNode(n));
      }
      observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'alt', 'aria-label', 'value', 'href', 'src'] });
    });
    observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'alt', 'aria-label', 'value', 'href', 'src'] });
  }
  return {
    setRules(r) { rules = r || {}; },
    redact() { scrubNode(document); return { ...stats }; },
    scan, live, stats,
  };
})();
`;
function browserFn() {
  return BROWSER_FN.replace('__PII__', JSON.stringify(PII)).replace('__ACC__', String(ACCOUNT_MIN_DIGITS));
}

// 숨길 것: 개발 배지·Vercel 툴바·스크롤바·캐럿·흔한 채팅 위젯·쿠키 배너
const PREP_CSS = `
  nextjs-portal, [data-nextjs-toast], [data-nextjs-dialog-overlay], #__next-build-watcher, [data-next-badge-root], [data-nextjs-dev-tools-button],
  vercel-live-feedback, #vercel-live-feedback, [data-vercel-toolbar], #__vercel-toolbar, iframe[src*="vercel.live"],
  #ch-plugin, #ch-plugin-launcher, .ch-desk-messenger, iframe[title*="Channel"], #crisp-chatbox, .intercom-lightweight-app, #intercom-container,
  iframe[id^="kakao"], #tawk-bubble-container, .grecaptcha-badge, #CybotCookiebotDialog, #onetrust-banner-sdk, .cookie-banner, [aria-label*="cookie" i][role="dialog"]
  { display: none !important; }
  html { scrollbar-width: none !important; }
  ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
  *, *::before, *::after { caret-color: transparent !important; }
`;

// ───────────────────────── 운영 쓰기 가로채기 ─────────────────────────
// 기본: GET·HEAD·OPTIONS 말고 전부 가짜 성공(200 {"ok":true}). 추적·분석 비콘은 GET 도 204.
// guard: {
//   allow: [RegExp|string]    — 읽기 전용인데 POST 로 가는 것(근거를 RECON.md 에) · 기존 테스트 계정 로그인
//   fake:  [{ match, method?, status?, json?, body?, contentType? }] — 이 요청엔 이 응답(문자·AI·추첨 등, GET 도 가능)
//   blockGet: [RegExp|string] — GET 이라도 쓰기인 것(예: /api/track?...) → 가짜 200
// }
const TRACKERS = [
  /google-analytics\.com/, /googletagmanager\.com\/gtag\/js/, /analytics\.google\.com/, /\/g\/collect/, /doubleclick\.net/,
  /\/_vercel\/insights\//, /\/_vercel\/speed-insights\//, /vitals\.vercel-insights\.com/, /va\.vercel-scripts\.com/,
  /clarity\.ms/, /hotjar\.com/, /facebook\.com\/tr/, /connect\.facebook\.net/, /analytics\.tiktok\.com/, /wcs\.naver\.net/, /\.channel\.io/, /cdn\.channel\.io/,
  /sentry\.io\/api/, /ingest\.sentry\.io/, /posthog\.com/, /\/ingest\/(e|batch|decide)/, /amplitude\.com/, /mixpanel\.com/, /plausible\.io\/api/, /t1\.daumcdn\.net\/kas/,
  /vercel\.live/,
];
const asRe = (m) => (m instanceof RegExp ? m : new RegExp(String(m).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

export async function installGuards(ctx, guard = {}) {
  const allow = (guard.allow || []).map(asRe);
  const fakes = (guard.fake || []).map((f) => ({ ...f, re: asRe(f.match) }));
  const blockGet = (guard.blockGet || []).map(asRe);
  const st = { intercepted: 0, list: [], allowed: [], trackers: 0, since: 0 };
  ctx.__prismStats = st;
  const pathOnly = (u) => { try { const x = new URL(u); return x.pathname; } catch { return '?'; } };
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();
    if (url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
    const fk = fakes.find((f) => f.re.test(url) && (!f.method || f.method === method));
    if (fk) {
      st.intercepted++; st.list.push(`${method} ${pathOnly(url)} (fake)`);
      return route.fulfill({ status: fk.status || 200, contentType: fk.contentType || 'application/json', body: fk.body !== undefined ? fk.body : JSON.stringify(fk.json !== undefined ? fk.json : { ok: true }) });
    }
    if (TRACKERS.some((r) => r.test(url))) { st.trackers++; return route.fulfill({ status: 204, body: '' }); }
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      if (blockGet.some((r) => r.test(url))) { st.intercepted++; st.list.push(`${method} ${pathOnly(url)}`); return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); }
      return route.continue();
    }
    if (allow.some((r) => r.test(url))) { st.allowed.push(`${method} ${pathOnly(url)}`); return route.continue(); }
    st.intercepted++; st.list.push(`${method} ${pathOnly(url)}`);
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  return st;
}

// ───────────────────────── 컨텍스트 ─────────────────────────
// vp: 'desktop' | 'mobile' | { name:'tablet', width, height, dsf, isMobile?, hasTouch?, userAgent? }
export async function newContext(browser, vp, { project, guard = {}, redact = {}, clock = false, storageState, permissions, extra = {} } = {}) {
  if (!project) throw new Error('newContext: project 이름 필요');
  let vpName, opts;
  if (typeof vp === 'string') { vpName = vp; opts = VIEWPORTS[vp]; }
  else { vpName = vp.name || 'tablet'; opts = { viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.dsf || 1, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch, ...(vp.userAgent ? { userAgent: vp.userAgent } : {}) }; }
  const ctx = await browser.newContext({
    ...opts, locale: 'ko-KR', timezoneId: 'Asia/Seoul', colorScheme: 'light', reducedMotion: 'no-preference',
    serviceWorkers: 'block', storageState, permissions, ...extra,
  });
  ctx.__prism = { project, vpName, opts, redact };
  await installGuards(ctx, guard);
  const page = await ctx.newPage();
  if (clock) await page.clock.install();
  page.__prism = ctx.__prism;
  return { ctx, page };
}

async function prep(page) {
  await page.addStyleTag({ content: PREP_CSS }).catch(() => {});
  await page.evaluate(browserFn()).catch(() => {});
  await page.evaluate((r) => window.__prism && window.__prism.setRules(r), page.__prism.redact || {}).catch(() => {});
}

export async function redactNow(page) {
  await prep(page);
  return page.evaluate(() => window.__prism.redact());
}
// 상태 흐름·영상 중에는 새로 생기는 글자도 바로 바꾼다(MutationObserver).
export async function liveRedact(page, on = true) {
  await prep(page);
  await page.evaluate(() => window.__prism.redact());
  await page.evaluate((v) => window.__prism.live(v), on);
}

// ───────────────────────── 로딩 마무리: 끝까지 스크롤 → 이미지·애니메이션 끝 → 맨 위 ─────────────────────────
export async function settle(page, { maxSteps = 80, stepWait = 350, finishAnimations = true, back = true } = {}) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  let lastH = 0, still = 0;
  for (let i = 0; i < maxSteps; i++) {
    const { y, h, vh } = await page.evaluate(() => ({ y: window.scrollY, h: document.documentElement.scrollHeight, vh: window.innerHeight }));
    if (y + vh >= h - 2) { if (h === lastH) { if (++still >= 2) break; } else still = 0; }
    lastH = h;
    await page.evaluate(() => window.scrollBy(0, Math.round(window.innerHeight * 0.7)));
    await page.waitForTimeout(stepWait);
  }
  await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
  await page.evaluate(async () => {
    const imgs = [...document.images].filter((i) => !i.complete);
    await Promise.race([Promise.all(imgs.map((i) => new Promise((r) => { i.onload = i.onerror = r; }))), new Promise((r) => setTimeout(r, 8000))]);
    if (document.fonts) await document.fonts.ready;
  }).catch(() => {});
  if (finishAnimations) {
    await page.evaluate(() => {
      for (const a of document.getAnimations()) {
        try { const t = a.effect && a.effect.getComputedTiming(); if (t && t.iterations !== Infinity && t.endTime !== Infinity) a.finish(); } catch {}
      }
    }).catch(() => {});
  }
  if (back) { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(700); }
}

// ───────────────────────── JSON 곁 파일: 보이는 요소 사각형(이미지 좌표, CSS px)과 글자 ─────────────────────────
async function collectElements(page, { full }) {
  return page.evaluate(({ full }) => {
    const sx = window.scrollX, sy = window.scrollY, vw = window.innerWidth, vh = window.innerHeight;
    const H = full ? document.documentElement.scrollHeight : vh;
    const W = full ? Math.max(document.documentElement.scrollWidth, vw) : vw;
    const kinds = [
      ['heading', 'h1,h2,h3,h4,h5,h6,[role=heading]'],
      ['button', 'button,[role=button],input[type=submit],input[type=button]'],
      ['input', 'input:not([type=hidden]):not([type=submit]):not([type=button]),textarea,select'],
      ['link', 'a[href]'],
      ['card', 'article,[class*="card" i],[class*="Card"],[data-card],li[class*="item" i]'],
      ['image', 'img,picture,svg[role=img],video,canvas,[role=img]'],
    ];
    const out = []; const seen = new Set();
    for (const [type, sel] of kinds) {
      for (const el of document.querySelectorAll(sel)) {
        if (out.length >= 500) break;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const fixed = cs.position === 'fixed';
        const x = r.left + (full && !fixed ? sx : 0), y = r.top + (full && !fixed ? sy : 0);
        if (x + r.width <= 0 || y + r.height <= 0 || x >= W || y >= H) continue;
        const key = type + Math.round(x) + ',' + Math.round(y) + ',' + Math.round(r.width) + ',' + Math.round(r.height);
        if (seen.has(key)) continue; seen.add(key);
        let text = '';
        if (type === 'input') text = el.value || el.getAttribute('placeholder') || '';
        else if (type === 'image') text = el.getAttribute('alt') || el.getAttribute('aria-label') || '';
        else text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
        out.push({ type, tag: el.tagName.toLowerCase(), text: text.slice(0, 160), rect: { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 }, ...(fixed ? { fixed: true } : {}) });
      }
    }
    return { elements: out, scrollY: Math.round(sy), scrollX: Math.round(sx), docHeight: document.documentElement.scrollHeight, title: document.title };
  }, { full });
}

function relOut(page, sub) {
  const { project, vpName } = page.__prism;
  return path.join(ROOT, project, sub || vpName);
}

// 저장 한 번: 가림 → 검사(0건이 아니면 예외, 저장 안 함) → PNG → JSON
export async function saveShot(page, file, { full = false, clip, kind = 'page', note } = {}) {
  await prep(page);
  const red = await page.evaluate(() => window.__prism.redact());
  const pii = await page.evaluate(() => window.__prism.scan());
  if (pii.total > 0) {
    throw new Error(`PII ${pii.total}건 — 저장 안 함 (${path.relative(ROOT, file)}): ${pii.samples.join(', ')} · redact 규칙을 더하라`);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const meta = await collectElements(page, { full });
  const vp = page.viewportSize();
  const dsf = page.__prism.opts.deviceScaleFactor || 1;
  if (full) await fullPageShot(page, file, dsf);
  else await page.screenshot({ path: file, clip, animations: 'disabled', caret: 'hide', scale: 'device' });
  const st = page.context().__prismStats;
  const json = {
    file: path.basename(file), kind, project: page.__prism.project, viewport: { ...vp, deviceScaleFactor: dsf, name: page.__prism.vpName },
    path: (() => { try { return new URL(page.url()).pathname; } catch { return ''; } })(),
    scrollY: full ? 0 : meta.scrollY, scrollX: meta.scrollX, docHeight: meta.docHeight, full, clip: clip || null,
    capturedAt: new Date().toISOString(), title: meta.title, note: note || undefined,
    pii_scan: { ...pii, samples: undefined, at: 'pre-save DOM text', patterns: Object.keys(PII) },
    redactions: red,
    intercepted: { total: st.intercepted, new: st.list.slice(st.since), allowed_nonget: [...new Set(st.allowed)], trackers_blocked: st.trackers },
    elements: meta.elements,
  };
  st.since = st.list.length;
  fs.writeFileSync(file.replace(/\.png$/, '.json'), JSON.stringify(json, null, 1));
  return json;
}

// 전체 화면: 기기 픽셀 16000 을 넘으면 clip 으로 나눠 찍고 PIL 로 잇는다.
async function fullPageShot(page, file, dsf) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const w = page.viewportSize().width;
  const LIMIT = Math.floor(16000 / dsf);
  if (h <= LIMIT) { await page.screenshot({ path: file, fullPage: true, animations: 'disabled', caret: 'hide', scale: 'device' }); return; }
  const parts = [];
  for (let y = 0, i = 0; y < h; y += LIMIT, i++) {
    const p = file.replace(/\.png$/, `.part${i}.png`);
    await page.screenshot({ path: p, fullPage: true, clip: { x: 0, y, width: w, height: Math.min(LIMIT, h - y) }, animations: 'disabled', caret: 'hide', scale: 'device' });
    parts.push(p);
  }
  execFileSync('python3', [path.join(ROOT, 'tools', 'stitch.py'), file, ...parts]);
  parts.forEach((p) => fs.rmSync(p, { force: true }));
}

// 페이지 한 장 세트: <name>-full.png · <name>-view.png (+json), 고정 헤더가 있으면 header.png(뷰포트 폴더에 한 번)
export async function capturePage(page, name, { settleOpts = {}, header = true, sub } = {}) {
  await prep(page);
  await settle(page, settleOpts);
  await page.evaluate(() => window.__prism.redact());
  const dir = relOut(page, sub);
  const full = await saveShot(page, path.join(dir, `${name}-full.png`), { full: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const view = await saveShot(page, path.join(dir, `${name}-view.png`));
  if (header && !fs.existsSync(path.join(dir, 'header.png'))) await captureHeader(page, dir).catch((e) => console.error('[header]', e.message));
  return { full, view };
}

export async function captureHeader(page, dir) {
  await page.evaluate(() => window.scrollTo(0, Math.min(600, document.documentElement.scrollHeight - window.innerHeight)));
  await page.waitForTimeout(700);
  const rect = await page.evaluate(() => {
    const vw = window.innerWidth;
    let best = null;
    for (const el of document.querySelectorAll('header,nav,[class*="header" i],[class*="nav" i],div')) {
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
      const r = el.getBoundingClientRect();
      if (r.top > 2 || r.top < -2 || r.width < vw * 0.8 || r.height < 30 || r.height > 260) continue;
      if (!best || r.height > best.height) best = { x: 0, y: 0, width: vw, height: Math.ceil(r.bottom) };
    }
    return best;
  });
  if (!rect) { await page.evaluate(() => window.scrollTo(0, 0)); return null; }
  const j = await saveShot(page, path.join(dir, 'header.png'), { clip: rect, kind: 'header' });
  await page.evaluate(() => window.scrollTo(0, 0));
  return j;
}

// ───────────────────────── 상태 흐름: 같은 뷰포트·같은 스크롤에서 단계마다 한 장 ─────────────────────────
export async function startFlow(page, flow, { scrollY = 0 } = {}) {
  const dir = path.join(ROOT, page.__prism.project, 'states', flow);
  fs.mkdirSync(dir, { recursive: true });
  await liveRedact(page, true);
  let n = 0;
  const vp0 = page.viewportSize();
  return {
    dir,
    async step(desc, { note, settleMs = 500 } = {}) {
      n++;
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(settleMs);
      const y = await page.evaluate(() => window.scrollY);
      const vp = page.viewportSize();
      if (y !== scrollY || vp.width !== vp0.width || vp.height !== vp0.height) throw new Error(`[flow ${flow}] 스크롤/뷰포트가 밀림: scrollY ${y} ≠ ${scrollY} 또는 뷰포트 변경`);
      const file = path.join(dir, `${String(n).padStart(2, '0')}-${desc}.png`);
      return saveShot(page, file, { kind: 'state', note });
    },
  };
}

// ───────────────────────── 연출 영상: 가상 시간 1/60초씩 → H.264 CRF 12 · 60fps · ≤6초 ─────────────────────────
// page 는 newContext(..., { clock: true }) 로 만든 것(page.goto 전에 시계 설치).
// start(): 0프레임 직전 한 번(예: 버튼 클릭). perFrame(i, tMs): 프레임마다(예: devicemotion 주입).
export async function recordSeq(page, name, { durationMs = 4000, start, perFrame, crf = 12 } = {}) {
  if (durationMs > 6000) throw new Error('seq 는 6초 이내');
  const frames = Math.round((durationMs / 1000) * 60);
  const proj = page.__prism.project;
  const tmp = path.join(ROOT, 'tmp', 'frames', `${proj}-${name}-${process.pid}`);
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  await liveRedact(page, true);
  const pii0 = await page.evaluate(() => window.__prism.scan());
  if (pii0.total > 0) throw new Error(`seq ${name}: 시작 화면 PII ${pii0.total}건 — ${pii0.samples.join(', ')}`);
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 50);
  await page.evaluate(() => {
    window.__vtSync = (vt) => {
      for (const a of document.getAnimations()) {
        if (a.__vtStart === undefined) { a.__vtStart = vt; a.__vtBase = a.currentTime || 0; a.pause(); }
        try { a.currentTime = a.__vtBase + (vt - a.__vtStart); } catch {}
      }
    };
  });
  if (start) await start();
  let elapsed = 0, piiMax = 0;
  for (let i = 0; i < frames; i++) {
    if (perFrame) await perFrame(i, elapsed);
    const target = Math.round(((i + 1) * 1000) / 60);
    await page.clock.runFor(target - elapsed);
    elapsed = target;
    await page.evaluate((vt) => window.__vtSync && window.__vtSync(vt), elapsed);
    if (i % 15 === 0 || i === frames - 1) {
      const s = await page.evaluate(() => window.__prism.scan());
      piiMax = Math.max(piiMax, s.total);
      if (s.total > 0) throw new Error(`seq ${name}: 프레임 ${i} PII ${s.total}건 — ${s.samples.join(', ')}`);
    }
    await page.screenshot({ path: path.join(tmp, `f${String(i).padStart(5, '0')}.png`), animations: 'allow', caret: 'hide', scale: 'device' });
  }
  const outDir = path.join(ROOT, proj, 'seq');
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${name}.mp4`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '60', '-i', path.join(tmp, 'f%05d.png'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-r', '60',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-movflags', '+faststart', out]);
  fs.copyFileSync(path.join(tmp, 'f00000.png'), path.join(outDir, `${name}-first.png`));
  fs.copyFileSync(path.join(tmp, `f${String(frames - 1).padStart(5, '0')}.png`), path.join(outDir, `${name}-last.png`));
  // 첫·끝 PNG 곁 json(현재 DOM 기준 — 끝 프레임 상태)
  const st = page.context().__prismStats;
  const meta = await collectElements(page, { full: false });
  for (const which of ['first', 'last']) {
    fs.writeFileSync(path.join(outDir, `${name}-${which}.json`), JSON.stringify({
      file: `${name}-${which}.png`, kind: 'seq-frame', seq: `${name}.mp4`, method: 'page.clock + getAnimations currentTime, 1/60s per frame',
      viewport: { ...page.viewportSize(), deviceScaleFactor: page.__prism.opts.deviceScaleFactor || 1, name: page.__prism.vpName },
      scrollY: meta.scrollY, frames, fps: 60, durationMs, crf, capturedAt: new Date().toISOString(),
      pii_scan: { total: piiMax, checked: 'every 15th frame + first/last', patterns: Object.keys(PII) },
      intercepted: { total: st.intercepted, new: st.list.slice(st.since), allowed_nonget: [...new Set(st.allowed)], trackers_blocked: st.trackers },
      elements: which === 'last' ? meta.elements : undefined,
    }, null, 1));
  }
  st.since = st.list.length;
  fs.rmSync(tmp, { recursive: true, force: true });
  return { out, frames };
}

// 대안: 실시간 화면 녹화(page.screencast) → H.264 CRF 12 60fps 로 다시 인코딩. shots.md 에 방식을 적는다.
export async function recordScreencast(page, name, { durationMs = 4000, start, crf = 12 } = {}) {
  const proj = page.__prism.project;
  const vp = page.viewportSize();
  const dsf = page.__prism.opts.deviceScaleFactor || 1;
  const outDir = path.join(ROOT, proj, 'seq');
  fs.mkdirSync(outDir, { recursive: true });
  const webm = path.join(ROOT, 'tmp', `${proj}-${name}-${process.pid}.webm`);
  fs.mkdirSync(path.dirname(webm), { recursive: true });
  await liveRedact(page, true);
  await page.screencast.start({ path: webm, size: { width: vp.width * dsf, height: vp.height * dsf }, quality: 95, fps: 60 });
  if (start) await start();
  await page.waitForTimeout(durationMs);
  await page.screencast.stop();
  const out = path.join(outDir, `${name}.mp4`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-t', String(Math.min(durationMs, 6000) / 1000), '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-r', '60', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-movflags', '+faststart', out]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', out, '-frames:v', '1', path.join(outDir, `${name}-first.png`)]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-sseof', '-0.05', '-i', out, '-frames:v', '1', '-update', '1', path.join(outDir, `${name}-last.png`)]);
  fs.rmSync(webm, { force: true });
  const st = page.context().__prismStats;
  for (const which of ['first', 'last']) {
    fs.writeFileSync(path.join(outDir, `${name}-${which}.json`), JSON.stringify({ file: `${name}-${which}.png`, kind: 'seq-frame', seq: `${name}.mp4`, method: 'page.screencast quality 95 fps 60 → ffmpeg H.264', viewport: { ...vp, deviceScaleFactor: dsf, name: page.__prism.vpName }, capturedAt: new Date().toISOString(), pii_scan: { total: 0, checked: 'live MutationObserver redact; DOM scan at start', patterns: Object.keys(PII) }, intercepted: { total: st.intercepted, new: st.list.slice(st.since) } }, null, 1));
  }
  st.since = st.list.length;
  return { out };
}

// 매 단계 1초 간격 같은 로그
export const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
export { sleep };
