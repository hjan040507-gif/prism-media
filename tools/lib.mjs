// prism-media 촬영 도구 — Playwright 1.64.1 · chromiumSandbox 필수.
// 규격: docs/specs/portfolio-capture.md <촬영 규격>·<가림 규칙>·<안전> · 쓰는 법: docs/CAPTURE-BRIEF.md
//
//   import { launch, newContext, capturePage, startFlow, recordSeq, saveShot } from '../../tools/lib.mjs'
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
        let pid = 0;
        try { pid = Number(fs.readFileSync(p, 'utf8').trim() || 0); } catch {}
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
  const browser = await chromium.launch({ headless: true, ...opts, chromiumSandbox: true });
  browser.on('disconnected', release);
  return browser;
}

// ───────────────────────── 가림(PII) 정규식 — tools/check.py·ocr.py 와 같은 표 ─────────────────────────
export const PII = {
  phone: String.raw`(?<![\d])(?:\+82[-\s]?\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4}|0\d{1,2}[-.\s)]{0,2}\d{3,4}[-.\s]?\d{4}|1[5-9]\d{2}[-.\s]\d{4})(?![\d])`,
  email: String.raw`[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}`,
  // 주민번호: 하이픈 있거나, 없으면 생년월일 형식이 맞는 13자리
  rrn: String.raw`(?<![\d])(?:\d{6}\s?-\s?[1-8]\d{6}|\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[1-8]\d{6})(?![\d])`,
  // 2~6자리 숫자 묶음을 - 로 이은 10~16자리(계좌·사업자번호). 날짜(8자리)는 안 걸린다. + 문맥(계좌·은행·사업자) 뒤의 10~16자리 숫자
  account: String.raw`(?:(?<![\d-])\d{2,6}(?:-\d{2,7}){2,4}(?![\d-])|(?<=(?:계좌|은행|입금|예금주|사업자|등록번호|account|bank)[^\d\n·|,;/]{0,8})\d[\d\s-]{8,18}\d)`,
  passport: String.raw`(?<![A-Z0-9])[MSRODG](?:\d{8}|\d{3}[A-Z]\d{4})(?![A-Z0-9])`,
  url: String.raw`(?:https?:\/\/[^\s"'<>]+|www\.[^\s"'<>]+|(?<![@\w.-])(?:[A-Za-z0-9-]+\.)+(?:com|net|org|kr|io|app|dev|me|ai|xyz|shop|site|store|link|ly|gg|tv|jp|biz|info|vercel\.app)(?:\/[^\s"'<>]*)?)(?![\w])`,
  plate: String.raw`(?<![\d])\d{2,3}\s?[가나다라마바사아자거너더러머버서어저고노도로모보소오조구누두루무부수우주하허호배]\s?\d{4}(?![\d])`,
  // 상세 주소(시·도 + 구·군·시 + 도로명/동 + 번지) — 시·구까지만 남긴다
  addr: String.raw`[가-힣]+(?:특별시|광역시|특별자치시|특별자치도|도|시)\s+[가-힣]+(?:구|군|시)\s+[가-힣0-9]+(?:로|길|동|읍|면|리)(?:\s*\d+(?:-\d+)?(?:번지|번길)?)?`,
};
const ACCOUNT_MIN_DIGITS = 10;

// 브라우저(각 프레임) 안에서 돌릴 가림·검사 코드. rules 는 CAPTURE-BRIEF.md 참고.
const BROWSER_FN = String.raw`
window.__prism = window.__prism || (function () {
  const P = __PII__;
  const ACC_MIN = __ACC__;
  const mk = (k) => new RegExp(P[k], 'g');
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
  const stats = { phone: 0, email: 0, rrn: 0, account: 0, passport: 0, url: 0, plate: 0, addr: 0, names: 0, ids: 0, address: 0, biz: 0, textMap: 0, fake: 0, removed: 0, qr: 0 };
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
    o = o.replace(mk('addr'), (m) => { stats.addr++; return m.split(/\s+/).slice(0, 2).join(' '); });
    if (rules.textMap) for (const [k, v] of Object.entries(rules.textMap)) if (o.includes(k)) { o = o.split(k).join(v); stats.textMap++; }
    if (rules.bizMap) for (const [k, v] of Object.entries(rules.bizMap)) if (o.includes(k)) { o = o.split(k).join(v); stats.biz++; }
    return o;
  }
  function cutAddress(s) {
    const m = s.match(/^(.*?(?:특별시|광역시|특별자치시|특별자치도|도|시)\s*\S*?(?:구|군|시))(?:\s|$)/);
    return m ? m[1] : s.split(/\s+/).slice(0, 2).join(' ');
  }
  const curText = (el) => (el.matches && el.matches('input,textarea') ? el.value : (el.textContent || '')).trim();
  function setText(el, v) {
    if (curText(el) === v) return false;
    if (el.matches('input,textarea')) { el.value = v; return true; }
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let first = null, t;
    while ((t = tw.nextNode())) { if (t.nodeValue.trim()) { if (!first) { first = t; t.nodeValue = v; } else t.nodeValue = ''; } }
    if (!first) el.textContent = v;
    return true;
  }
  // 규칙은 매번 다시 건다(React 가 글자를 되돌려도 다음 호출에서 다시 바꾼다).
  function applyRules(root) {
    const q = (sel) => { try { return [...root.querySelectorAll(sel)].concat(root.matches && root.matches(sel) ? [root] : []); } catch { return []; } };
    for (const sel of rules.hide || []) q(sel).forEach((el) => el.style.setProperty('display', 'none', 'important'));
    for (const sel of rules.remove || []) q(sel).forEach((el) => { if (!el.dataset.prRm) { el.dataset.prRm = 1; stats.removed++; } el.style.setProperty('visibility', 'hidden', 'important'); });
    for (const sel of rules.names || []) q(sel).forEach((el) => { if (setText(el, '김○○')) stats.names++; });
    for (const sel of rules.ids || []) q(sel).forEach((el) => { if (setText(el, 'user***')) stats.ids++; });
    for (const sel of rules.address || []) q(sel).forEach((el) => { const c = curText(el); if (setText(el, cutAddress(c))) stats.address++; });
    if (Array.isArray(rules.biz)) {
      window.__prismBiz = window.__prismBiz || new Map();
      const outs = () => new Set(window.__prismBiz.values());
      for (const sel of rules.biz) q(sel).forEach((el) => {
        const orig = curText(el);
        if (!orig || outs().has(orig)) return;
        if (!window.__prismBiz.has(orig)) window.__prismBiz.set(orig, String.fromCharCode(65 + window.__prismBiz.size % 26) + (rules.bizSuffix || '모터스'));
        if (setText(el, window.__prismBiz.get(orig))) stats.biz++;
      });
    }
    for (const f of rules.fake || []) q(f.selector).forEach((el) => { if (setText(el, f.value)) stats.fake++; });
    if (rules.qr !== false) {
      q('img,canvas,svg,picture').forEach((el) => {
        const hint = ((el.getAttribute('alt') || '') + ' ' + (el.getAttribute('src') || '') + ' ' + (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('class') || '') + ' ' + (el.id || '') + ' ' + (el.dataset.testid || '')).toLowerCase();
        if (/(^|[^a-z])qr/.test(hint)) { if (!el.dataset.prQr) { el.dataset.prQr = 1; stats.qr++; } el.style.setProperty('visibility', 'hidden', 'important'); }
      });
      for (const sel of rules.qrSelectors || []) q(sel).forEach((el) => { if (!el.dataset.prQr) { el.dataset.prQr = 1; stats.qr++; } el.style.setProperty('visibility', 'hidden', 'important'); });
    }
  }
  // 문서·열린 shadow root 를 모두 돈다
  function roots() {
    const out = [document];
    const walk = (r) => { (r.querySelectorAll ? r.querySelectorAll('*') : []).forEach((el) => { if (el.shadowRoot) { out.push(el.shadowRoot); walk(el.shadowRoot); } }); };
    walk(document);
    return out;
  }
  const accept = { acceptNode: (n) => (n.parentElement && SKIP.has(n.parentElement.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) };
  function scrubRoot(r) {
    const base = r.nodeType === 9 ? r.body || r.documentElement : r;
    if (!base) return;
    const tw = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, accept);
    let t; while ((t = tw.nextNode())) { const v = scrubText(t.nodeValue); if (v !== t.nodeValue) t.nodeValue = v; }
    for (const el of base.querySelectorAll('*')) {
      if (el.matches('input,textarea')) { const v = scrubText(el.value); if (v !== el.value) el.value = v; }
      for (const a of ['placeholder', 'title', 'alt', 'aria-label', 'value', 'data-tooltip']) {
        const cur = el.getAttribute(a);
        if (cur) { const v = scrubText(cur); if (v !== cur) el.setAttribute(a, v); }
      }
      const href = el.getAttribute('href');
      if (href && /^(tel:|mailto:|sms:)/i.test(href)) el.setAttribute('href', '#');
    }
    applyRules(base);
  }
  function redactAll() {
    if (document.title) { const v = scrubText(document.title); if (v !== document.title) document.title = v; }
    for (const r of roots()) scrubRoot(r);
    return { ...stats };
  }
  // 저장 직전 검사: DOM 글자 전체(스크립트·스타일 제외, shadow root 포함) + 입력값 + 보이는 속성 + ::before/::after content + 제목
  function scan() {
    const parts = [document.title || ''];
    for (const r of roots()) {
      const base = r.nodeType === 9 ? r.body || r.documentElement : r;
      if (!base) continue;
      const tw = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, accept);
      let t; while ((t = tw.nextNode())) parts.push(t.nodeValue);
      for (const el of base.querySelectorAll('*')) {
        if (el.matches('input,textarea')) parts.push(el.value || '');
        for (const a of ['placeholder', 'title', 'alt', 'aria-label', 'data-tooltip']) { const v = el.getAttribute(a); if (v) parts.push(v); }
        for (const pe of ['::before', '::after']) {
          const c = getComputedStyle(el, pe).content;
          if (c && c !== 'none' && c !== 'normal' && c.length > 3) parts.push(c.replace(/^"|"$/g, ''));
        }
      }
    }
    const text = parts.join('\n');
    const out = { phone: 0, email: 0, rrn: 0, account: 0, passport: 0, url: 0, plate: 0, addr: 0 };
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
  const OBS = { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'alt', 'aria-label', 'value', 'href', 'src', 'class', 'style'] };
  function live(on) {
    if (observer) { observer.disconnect(); observer = null; }
    if (!on) return;
    observer = new MutationObserver(() => { observer.disconnect(); redactAll(); observer.observe(document.documentElement, OBS); });
    observer.observe(document.documentElement, OBS);
    // 입력값 바뀜은 MutationObserver 에 안 잡힌다
    document.addEventListener('input', () => redactAll(), true);
  }
  return { setRules(r) { rules = r || {}; }, redact: redactAll, scan, live, stats };
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
  html { scrollbar-width: none !important; scroll-behavior: auto !important; }
  ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
  *, *::before, *::after { caret-color: transparent !important; }
`;

// ───────────────────────── 운영 쓰기 가로채기 ─────────────────────────
// 기본: GET·HEAD·OPTIONS 말고 전부 가짜 성공(200 {"ok":true}). 추적·분석 비콘은 GET 도 204.
// guard: {
//   allow: [RegExp|string]    — 읽기 전용인데 POST 로 가는 것 · 기존 테스트 계정 로그인. 문자열은 host+path 에 대한 부분 일치(쿼리 제외)
//   fake:  [{ match, method?, status?, json?, body?, contentType? }] — 이 요청엔 이 응답(문자·AI·추첨 등, GET 도 가능)
//   blockGet: [RegExp|string] — GET 이라도 쓰기인 것 → 가짜 200
//   blockAll: [RegExp|string] — 이 주소로 가는 모든 요청(메서드 무관) → 가짜 200
//   addHeaders: [{ match, headers }] — 통과시키는 요청에 헤더 추가
// }
// 문자열 match 는 'host+pathname' 에, RegExp 는 전체 URL 에 맞춘다(g·y 플래그는 떼어 낸다).
const TRACKERS = [
  /google-analytics\.com/, /googletagmanager\.com\/gtag\/js/, /analytics\.google\.com/, /\/g\/collect/, /doubleclick\.net/,
  /\/_vercel\/insights\//, /\/_vercel\/speed-insights\//, /vitals\.vercel-insights\.com/, /va\.vercel-scripts\.com/,
  /clarity\.ms/, /hotjar\.com/, /facebook\.com\/tr/, /connect\.facebook\.net/, /analytics\.tiktok\.com/, /wcs\.naver\.net/, /\.channel\.io/,
  /sentry\.io\/api/, /ingest\.sentry\.io/, /posthog\.com/, /\/ingest\/(e|batch|decide)/, /amplitude\.com/, /mixpanel\.com/, /plausible\.io\/api/, /t1\.daumcdn\.net\/kas/,
  /vercel\.live/,
];
const hostPath = (u) => { try { const x = new URL(u); return x.host + x.pathname; } catch { return u; } };
function matcher(m) {
  if (m instanceof RegExp) { const re = new RegExp(m.source, m.flags.replace(/[gy]/g, '')); return (u) => re.test(u); }
  const s = String(m);
  return (u) => hostPath(u).includes(s);
}

export async function installGuards(ctx, guard = {}) {
  const allow = (guard.allow || []).map(matcher);
  const fakes = (guard.fake || []).map((f) => ({ ...f, t: matcher(f.match) }));
  const blockGet = (guard.blockGet || []).map(matcher);
  const blockAll = (guard.blockAll || []).map(matcher);
  const addHeaders = (guard.addHeaders || []).map((h) => ({ t: matcher(h.match), headers: h.headers }));
  const cont = (route, req) => {
    const hs = addHeaders.filter((h) => h.t(req.url()));
    if (!hs.length) return route.continue();
    return route.continue({ headers: Object.assign({}, req.headers(), ...hs.map((h) => h.headers)) });
  };
  const st = { intercepted: 0, list: [], allowed: [], trackers: 0, since: 0, ws: [] };
  ctx.__prismStats = st;
  const pathOnly = (u) => { try { return new URL(u).pathname; } catch { return '?'; } };
  const ok200 = (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();
    if (url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
    if (blockAll.some((t) => t(url))) { st.intercepted++; st.list.push(`${method} ${pathOnly(url)} (blockAll)`); return ok200(route); }
    const fk = fakes.find((f) => f.t(url) && (!f.method || f.method === method));
    if (fk) {
      st.intercepted++; st.list.push(`${method} ${pathOnly(url)} (fake)`);
      return route.fulfill({ status: fk.status || 200, contentType: fk.contentType || 'application/json', headers: fk.headers, body: fk.body !== undefined ? fk.body : JSON.stringify(fk.json !== undefined ? fk.json : { ok: true }) });
    }
    if (TRACKERS.some((r) => r.test(url))) { st.trackers++; return route.fulfill({ status: 204, body: '' }); }
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      if (blockGet.some((t) => t(url))) { st.intercepted++; st.list.push(`${method} ${pathOnly(url)}`); return ok200(route); }
      return cont(route, req);
    }
    if (allow.some((t) => t(url))) { st.allowed.push(`${method} ${pathOnly(url)}`); return cont(route, req); }
    st.intercepted++; st.list.push(`${method} ${pathOnly(url)}`);
    return ok200(route);
  });
  // 웹소켓은 route 를 안 지난다 — 연결과 보낸 프레임 수만 기록(쓰기 프레임을 보내는 앱이면 프로젝트가 routeWebSocket 으로 막는다)
  ctx.on('page', (p) => p.on('websocket', (ws) => { const e = { url: pathOnly(ws.url()), sent: 0 }; st.ws.push(e); ws.on('framesent', () => e.sent++); }));
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
    storageState, permissions, ...extra,
    serviceWorkers: 'block', // 덮어쓸 수 없게 맨 뒤
  });
  ctx.__prism = { project, vpName, opts, redact };
  await installGuards(ctx, guard);
  const page = await ctx.newPage();
  if (clock) await page.clock.install();
  page.__prism = ctx.__prism;
  return { ctx, page };
}

// 모든 프레임(같은·다른 출처 iframe 포함)에 가림 코드를 넣고 규칙을 건다
async function eachFrame(page, fn) {
  const out = [];
  for (const f of page.frames()) { try { out.push(await fn(f)); } catch { /* 떨어진 프레임 */ } }
  return out;
}
async function prep(page) {
  await page.addStyleTag({ content: PREP_CSS }).catch(() => {});
  const src = browserFn();
  const rules = page.__prism.redact || {};
  await eachFrame(page, async (f) => { await f.evaluate(src); await f.evaluate((r) => window.__prism.setRules(r), rules); });
}
async function redactFrames(page) {
  const all = await eachFrame(page, (f) => f.evaluate(() => (window.__prism ? window.__prism.redact() : null)));
  return all.find(Boolean) || {};
}
async function scanFrames(page) {
  const all = (await eachFrame(page, (f) => f.evaluate(() => (window.__prism ? window.__prism.scan() : null)))).filter(Boolean);
  const out = { total: 0, samples: [] };
  for (const s of all) for (const [k, v] of Object.entries(s)) {
    if (k === 'samples') out.samples.push(...v);
    else out[k] = (out[k] || 0) + v;
  }
  out.frames = all.length;
  return out;
}

export async function redactNow(page) {
  await prep(page);
  return redactFrames(page);
}
// 상태 흐름·영상·저장 중에는 새로 생기는 글자도 바로 바꾼다(MutationObserver + input 이벤트).
export async function liveRedact(page, on = true) {
  await prep(page);
  await redactFrames(page);
  await eachFrame(page, (f) => f.evaluate((v) => window.__prism && window.__prism.live(v), on));
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
    await page.evaluate(() => window.scrollBy({ top: Math.round(window.innerHeight * 0.7), behavior: 'instant' }));
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
  if (back) { await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(700); }
}

// ───────────────────────── JSON 곁 파일: 보이는 요소 사각형(이미지 좌표, CSS px)과 글자 ─────────────────────────
async function collectElements(page, { full, clip }) {
  return page.evaluate(({ full, clip }) => {
    const sx = window.scrollX, sy = window.scrollY, vw = window.innerWidth, vh = window.innerHeight;
    const H = full ? document.documentElement.scrollHeight : vh;
    const W = full ? Math.max(document.documentElement.scrollWidth, vw) : vw;
    const kinds = [
      ['heading', 'h1,h2,h3,h4,h5,h6,[role=heading]'],
      ['button', 'button,[role=button],input[type=submit],input[type=button]'],
      ['input', 'input:not([type=hidden]):not([type=submit]):not([type=button]),textarea,select'],
      ['link', 'a[href]'],
      ['card', 'article,[class*="card" i],[data-card],li[class*="item" i]'],
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
        let x = r.left + (full && !fixed ? sx : 0), y = r.top + (full && !fixed ? sy : 0);
        if (clip) { x -= clip.x; y -= clip.y; if (x + r.width <= 0 || y + r.height <= 0 || x >= clip.width || y >= clip.height) continue; }
        else if (x + r.width <= 0 || y + r.height <= 0 || x >= W || y >= H) continue;
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
  }, { full, clip: clip || null });
}

function relOut(page, sub) {
  const { project, vpName } = page.__prism;
  return path.join(ROOT, project, sub || vpName);
}
const scrollPos = (page) => page.evaluate(() => [Math.round(window.scrollX), Math.round(window.scrollY)]);

// 저장 한 번: 가림(+실시간) → 검사 → PNG → 다시 가림·검사(찍는 사이 새 글자가 생겼으면 PNG 지우고 예외) → JSON
export async function saveShot(page, file, { full = false, clip, kind = 'page', note, expectScroll } = {}) {
  await liveRedact(page, true);
  const red = await redactFrames(page);
  const pii = await scanFrames(page);
  if (pii.total > 0) throw new Error(`PII ${pii.total}건 — 저장 안 함 (${path.relative(ROOT, file)}): ${pii.samples.join(', ')} · redact 규칙을 더하라`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const meta = await collectElements(page, { full, clip });
  const before = await scrollPos(page);
  const vp = page.viewportSize();
  const dsf = page.__prism.opts.deviceScaleFactor || 1;
  if (full) await fullPageShot(page, file, dsf);
  else await page.screenshot({ path: file, clip, animations: 'disabled', caret: 'hide', scale: 'device' });
  await redactFrames(page);
  const post = await scanFrames(page);
  const after = await scrollPos(page);
  if (post.total > 0) { fs.rmSync(file, { force: true }); throw new Error(`PII ${post.total}건이 찍는 사이 생김 — PNG 지움 (${path.relative(ROOT, file)}): ${post.samples.join(', ')}`); }
  if (!full && (before[0] !== after[0] || before[1] !== after[1] || (expectScroll !== undefined && (after[1] !== expectScroll || after[0] !== 0)))) {
    fs.rmSync(file, { force: true });
    throw new Error(`스크롤이 찍는 사이 움직임 ${before} → ${after} (기대 ${expectScroll}) — PNG 지움 (${path.relative(ROOT, file)})`);
  }
  const st = page.context().__prismStats;
  const json = {
    file: path.basename(file), kind, project: page.__prism.project, viewport: { ...vp, deviceScaleFactor: dsf, name: page.__prism.vpName },
    path: (() => { try { return new URL(page.url()).pathname; } catch { return ''; } })(),
    scrollY: full ? 0 : before[1], scrollX: before[0], docHeight: meta.docHeight, full, clip: clip || null,
    capturedAt: new Date().toISOString(), title: meta.title, note: note || undefined,
    pii_scan: { total: 0, before: { ...pii, samples: undefined }, after: post.total, at: 'pre- and post-screenshot DOM text (all frames, shadow roots, pseudo content)', patterns: Object.keys(PII) },
    redactions: red,
    intercepted: { total: st.intercepted, new: st.list.slice(st.since), allowed_nonget: [...new Set(st.allowed)], trackers_blocked: st.trackers, websockets: st.ws },
    elements: meta.elements,
  };
  st.since = st.list.length;
  fs.writeFileSync(file.replace(/\.png$/, '.json'), JSON.stringify(json, null, 1));
  return json;
}

// 전체 화면: 기기 픽셀 16000 을 넘으면 clip 으로 나눠 찍고 PIL 로 잇는다.
async function fullPageShot(page, file, dsf) {
  // 화면 아래쪽에 붙은 고정 요소(하단 탭바·FAB)는 전체 화면에선 첫 화면 바닥(문서 중간)에 찍힌다 → 문서 바닥 같은 자리로 옮겼다가 되돌린다
  await page.evaluate(() => {
    const vh = window.innerHeight, docH = document.documentElement.scrollHeight, sy = window.scrollY;
    const moved = [];
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.height < 4 || r.top < vh * 0.5 || r.bottom > vh + 2) continue;
      moved.push([el, el.getAttribute('style')]);
      const want = docH - (vh - r.top);
      el.style.setProperty('position', 'absolute', 'important');
      el.style.setProperty('bottom', 'auto', 'important');
      el.style.setProperty('top', want + 'px', 'important');
      const got = el.getBoundingClientRect().top + window.scrollY;
      el.style.setProperty('top', (want + (want - got)) + 'px', 'important');
    }
    window.scrollTo({ top: sy, behavior: 'instant' });
    window.__prismMoved = moved;
  });
  try { await fullPageShotInner(page, file, dsf); } finally {
    await page.evaluate(() => { for (const [el, st] of window.__prismMoved || []) { if (st === null) el.removeAttribute('style'); else el.setAttribute('style', st); } window.__prismMoved = []; });
  }
}
async function fullPageShotInner(page, file, dsf) {
  // 화면 밖 이미지는 비동기 디코딩이라 전체 캡처에서 빈칸으로 찍힐 수 있다 → eager·sync 로 바꾸고 decode 를 기다린다
  await page.evaluate(async () => {
    const imgs = [...document.images];
    for (const i of imgs) { i.loading = 'eager'; i.decoding = 'sync'; }
    await Promise.race([Promise.all(imgs.map((i) => (i.complete ? i.decode() : new Promise((r) => { i.onload = i.onerror = r; }).then(() => i.decode())).catch(() => {}))), new Promise((r) => setTimeout(r, 10000))]);
  }).catch(() => {});
  await page.waitForTimeout(300);
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
  await liveRedact(page, true);
  await settle(page, settleOpts);
  const dir = relOut(page, sub);
  const full = await saveShot(page, path.join(dir, `${name}-full.png`), { full: true });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(400);
  const view = await saveShot(page, path.join(dir, `${name}-view.png`), { expectScroll: 0 });
  if (header && !fs.existsSync(path.join(dir, 'header.png'))) await captureHeader(page, dir).catch((e) => console.error('[header]', e.message));
  return { full, view };
}

export async function captureHeader(page, dir) {
  await page.evaluate(() => window.scrollTo({ top: Math.min(600, document.documentElement.scrollHeight - window.innerHeight), behavior: 'instant' }));
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
  if (!rect) { await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); return null; }
  const j = await saveShot(page, path.join(dir, 'header.png'), { clip: rect, kind: 'header' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
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
      await page.evaluate((y) => window.scrollTo({ left: 0, top: y, behavior: 'instant' }), scrollY);
      await page.waitForTimeout(settleMs);
      await page.evaluate((y) => window.scrollTo({ left: 0, top: y, behavior: 'instant' }), scrollY);
      const vp = page.viewportSize();
      if (vp.width !== vp0.width || vp.height !== vp0.height) throw new Error(`[flow ${flow}] 뷰포트 변경`);
      const file = path.join(dir, `${String(n).padStart(2, '0')}-${desc}.png`);
      return saveShot(page, file, { kind: 'state', note, expectScroll: scrollY });
    },
  };
}

// ───────────────────────── 연출 영상: 가상 시간 1/60초씩 → H.264 CRF 12 · 60fps · ≤6초 ─────────────────────────
// page 는 newContext(..., { clock: true }) 로 만든 것(page.goto 전에 시계 설치).
// start(): 0프레임 직전 한 번(예: 버튼 클릭). perFrame(i, tMs): 프레임마다(예: devicemotion 주입).
// CSS·WAAPI 애니메이션: 시작 시점에 있던 것은 그 자리에서 멈추고, 이후 생긴 것은 생긴 프레임을 0으로 삼아 가상 시간에 묶는다.
const VT_SYNC = `
  window.__vtNow = 0;
  window.__vtSync = (vt) => {
    for (const a of document.getAnimations()) {
      if (a.__vtStart === undefined) { a.__vtStart = window.__vtNow; a.__vtBase = window.__vtPre && window.__vtPre.has(a) ? (a.currentTime || 0) : 0; a.pause(); }
      try { a.currentTime = a.__vtBase + (vt - a.__vtStart); } catch {}
    }
    window.__vtNow = vt;
  };
  window.__vtPre = new Set(document.getAnimations());
  for (const a of window.__vtPre) { a.__vtStart = 0; a.__vtBase = a.currentTime || 0; a.pause(); }
  for (const ev of ['animationstart', 'transitionrun', 'transitionstart']) document.addEventListener(ev, () => window.__vtSync(window.__vtNow), true);
`;
export async function recordSeq(page, name, { durationMs = 4000, start, perFrame, crf = 12 } = {}) {
  if (durationMs > 6000) throw new Error('seq 는 6초 이내');
  const frames = Math.round((durationMs / 1000) * 60);
  const proj = page.__prism.project;
  const tmp = path.join(ROOT, 'tmp', 'frames', `${proj}-${name}-${process.pid}`);
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  await liveRedact(page, true);
  const pii0 = await scanFrames(page);
  if (pii0.total > 0) throw new Error(`seq ${name}: 시작 화면 PII ${pii0.total}건 — ${pii0.samples.join(', ')}`);
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 50);
  await page.evaluate(VT_SYNC);
  if (start) await start();
  await page.evaluate(() => window.__vtSync(0));
  let elapsed = 0;
  for (let i = 0; i < frames; i++) {
    if (perFrame) await perFrame(i, elapsed);
    const target = Math.round(((i + 1) * 1000) / 60);
    await page.clock.runFor(target - elapsed);
    elapsed = target;
    await page.evaluate((vt) => window.__vtSync && window.__vtSync(vt), elapsed);
    await redactFrames(page);
    const s = await scanFrames(page);
    if (s.total > 0) throw new Error(`seq ${name}: 프레임 ${i} PII ${s.total}건 — ${s.samples.join(', ')}`);
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
  const st = page.context().__prismStats;
  const meta = await collectElements(page, { full: false });
  for (const which of ['first', 'last']) {
    fs.writeFileSync(path.join(outDir, `${name}-${which}.json`), JSON.stringify({
      file: `${name}-${which}.png`, kind: 'seq-frame', seq: `${name}.mp4`, method: 'page.clock 1/60s runFor + getAnimations currentTime sync, screenshot per frame',
      viewport: { ...page.viewportSize(), deviceScaleFactor: page.__prism.opts.deviceScaleFactor || 1, name: page.__prism.vpName },
      scrollY: meta.scrollY, frames, fps: 60, durationMs, crf, capturedAt: new Date().toISOString(),
      pii_scan: { total: 0, checked: 'every frame (redact + scan before screenshot)', patterns: Object.keys(PII) },
      intercepted: { total: st.intercepted, new: st.list.slice(st.since), allowed_nonget: [...new Set(st.allowed)], trackers_blocked: st.trackers, websockets: st.ws },
      elements: which === 'last' ? meta.elements : undefined,
    }, null, 1));
  }
  st.since = st.list.length;
  fs.rmSync(tmp, { recursive: true, force: true });
  return { out, frames };
}

// 대안: 실시간 화면 녹화(page.screencast) → H.264 CRF 12 60fps 로 다시 인코딩. shots.md 에 방식을 적는다.
// 녹화 중 250ms 마다 가림·검사, 한 번이라도 걸리면 영상을 지우고 예외.
export async function recordScreencast(page, name, { durationMs = 4000, start, crf = 12 } = {}) {
  const proj = page.__prism.project;
  const vp = page.viewportSize();
  const dsf = page.__prism.opts.deviceScaleFactor || 1;
  const outDir = path.join(ROOT, proj, 'seq');
  fs.mkdirSync(outDir, { recursive: true });
  const webm = path.join(ROOT, 'tmp', `${proj}-${name}-${process.pid}.webm`);
  fs.mkdirSync(path.dirname(webm), { recursive: true });
  await liveRedact(page, true);
  const pii0 = await scanFrames(page);
  if (pii0.total > 0) throw new Error(`screencast ${name}: 시작 화면 PII ${pii0.total}건 — ${pii0.samples.join(', ')}`);
  await page.screencast.start({ path: webm, size: { width: vp.width * dsf, height: vp.height * dsf }, quality: 95, fps: 60 });
  if (start) await start();
  const t0 = Date.now();
  let worst = 0, checks = 0;
  while (Date.now() - t0 < durationMs) {
    await redactFrames(page);
    const s = await scanFrames(page);
    checks++; worst = Math.max(worst, s.total);
    await page.waitForTimeout(250);
  }
  await page.screencast.stop();
  if (worst > 0) { fs.rmSync(webm, { force: true }); throw new Error(`screencast ${name}: 녹화 중 PII ${worst}건 — 영상 버림`); }
  const out = path.join(outDir, `${name}.mp4`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-t', String(Math.min(durationMs, 6000) / 1000), '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-r', '60', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-movflags', '+faststart', out]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', out, '-frames:v', '1', path.join(outDir, `${name}-first.png`)]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-sseof', '-0.05', '-i', out, '-frames:v', '1', '-update', '1', path.join(outDir, `${name}-last.png`)]);
  fs.rmSync(webm, { force: true });
  const st = page.context().__prismStats;
  for (const which of ['first', 'last']) {
    fs.writeFileSync(path.join(outDir, `${name}-${which}.json`), JSON.stringify({ file: `${name}-${which}.png`, kind: 'seq-frame', seq: `${name}.mp4`, method: 'page.screencast quality 95 fps 60 → ffmpeg H.264 (real time, variable frame timing)', viewport: { ...vp, deviceScaleFactor: dsf, name: page.__prism.vpName }, capturedAt: new Date().toISOString(), pii_scan: { total: 0, checked: `start + every 250ms during recording (${checks} checks)`, patterns: Object.keys(PII) }, intercepted: { total: st.intercepted, new: st.list.slice(st.since), websockets: st.ws } }, null, 1));
  }
  st.since = st.list.length;
  return { out };
}

export const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
export { sleep };
