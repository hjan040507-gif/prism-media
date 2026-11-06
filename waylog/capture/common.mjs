// waylog 촬영 공통 — 웹 PWA 1.9.0(태그 v1.9.0 = 3cbb43c) 사본 + 레포 audit/ 가짜 백엔드(page.route).
// 운영 접속 0: Supabase REST·Auth·Storage·Functions 는 전부 가짜 호스트(supabase.waylog.test)로 가서 audit/lib/mock.mjs 가 응답한다.
// 사본: git -C ~/waylog1 archive 3cbb43c | tar -x -C ~/prism-media/tmp/waylog-src (끝나면 지움 — 다시 찍을 땐 같은 명령으로 풀고 빌드)
// 빌드: cd tmp/waylog-src && npm ci && env -i … VITE_SUPABASE_URL=http://supabase.waylog.test VITE_SUPABASE_ANON_KEY=audit-fake-anon-key \
//        ./node_modules/.bin/vite build --config audit/vite.audit.config.mjs   (.env* 를 안 읽는다)
// 이번 촬영은 prod 빌드 대신 dev 서버(BLOCKED.md 6): nice -n 10 env -i … ./node_modules/.bin/vite --config audit/vite.audit.config.mjs --host 127.0.0.1 --port 3614 --strictPort
// prod 서버: ./node_modules/.bin/vite preview --config audit/vite.audit.config.mjs --host 127.0.0.1 --port 3614 --strictPort
import path from 'node:path';
import { launch, newContext, ROOT } from '../../tools/lib.mjs';

process.env.AUDIT_NOBRAND = '1'; // 하네스 옵션: 후기 사진 중 제품 사진(로고 노출)을 뺀다
export const SRC = path.join(ROOT, 'tmp', 'waylog-src');
export const BASE = process.env.WAYLOG_BASE || 'http://127.0.0.1:3614';
export const PROJECT = 'waylog';
const { buildWorld, NOW } = await import(path.join(SRC, 'audit/lib/fixtures.mjs'));
const { installMock, FAKE_URL, FAKE_HOST } = await import(path.join(SRC, 'audit/lib/mock.mjs'));
export { NOW, FAKE_URL };

export const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
export const MOBILE = { name: 'mobile', width: 390, height: 844, dsf: 3, isMobile: true, hasTouch: true, userAgent: ANDROID_UA };
export const STORAGE_KEY = `sb-${new URL(FAKE_URL).hostname.split('.')[0]}-auth-token`;
const SEED_PATH = '/__audit_seed';

// ───────────── 공개 표기: 제품 회사·브랜드명 글자 지움(RECON.md §6 문자열 목록) ─────────────
// 1) 가짜 DB 의 제품 이름은 통째로 중립 이름으로(아래 FULL), 남은 낱말은 WORDS 로. 2) 화면 DOM 글자는 redact.textMap 으로 한 번 더(앱 상수의 미션·칩 이름 등).
const FULL = {
  '뉴트리 파이토 푸로틴 (900g)': '식물성 단백질 쉐이크 (900g)',
  '아티스트리 스킨 뉴트리션 브라이트닝 비타민 C + 겔 마스크': '비타민C 브라이트닝 겔 마스크',
  '디쉬 드랍스 바이오퀘스트 식기 세정제': '주방 식기 세정제',
  '옵티미스트': '가정용 공기청정기',
  '아세로라 C (300정, 100일분)': '비타민C (300정, 100일분)',
  '글리스터 프로액션 컴플리트 치약': '프로액션 치약',
  '행복한아름 롤티슈(12롤)': '대용량 롤티슈(12롤)',
  '아티스트리 톤업 글로우 크림 SPF50+ PA++++': '톤업 글로우 크림 SPF50+ PA++++',
  'SA8 바이오퀘스트 프리미엄 세탁 세제 S 3kg': '프리미엄 세탁 세제 3kg',
  '25센트 라이드 스마트 바이크': '스마트 실내 자전거',
  'g&h 너리쉬 바디 로션': '너리쉬 바디 로션',
  '뉴트리 마린 오메가-3 (120캡슐, 30일분)': '마린 오메가-3 (120캡슐, 30일분)',
  '후아 내추럴 순면커버 팬티라이너': '내추럴 순면커버 팬티라이너',
  '디쉬 드랍스 과일 채소 세정제': '과일 채소 세정제',
  '아티스트리 프로틴 아키텍처 크림': '프로틴 아키텍처 크림',
  '리플렉서 1699': '발 마사지기',
  '칼맥 디 (360정, 90일분)': '칼슘 마그네슘 (360정, 90일분)',
  '글리스터 컴플리트 컨센트레이티드 마우스 워시액': '컨센트레이티드 마우스 워시액',
  'SA8 프리워시 스프레이 세제': '프리워시 스프레이 세제',
  '후아 내추럴 순면커버 생리대 대형': '내추럴 순면커버 생리대 대형',
  '아티스트리 스킨 뉴트리션 비타민 C + 히알루론산 트리플 액션': '비타민 C + 히알루론산 트리플 액션',
};
export const WORDS = [
  ['암웨이 코리아', '브랜드'], ['암웨이홈', '브랜드'], ['암웨이 퀸', '브랜드'], ['암웨이', '브랜드'], ['Amway Corp.', 'Brand'], ['Amway', 'Brand'],
  ['BODYKEY8W', 'DIET8WEEK'], ['BodyKey', 'Diet'], ['화이버 비츠', '식이섬유'], ['더마아키텍트', '케어'], ['하이드라매틱스', '수분'], ['아티스트리', '스킨케어'], ['뉴트리라이트', '건강식품'],
  ['푸로틴', '단백질'], ['바디키', '다이어트'], ['원포원', '나눔'], ['더블엑스', '종합 비타민'], ['굿모닝 챌린지', '아침 챌린지'], ['셀렉트팩', '팩'],
];
const deepRename = (db) => {
  let s = JSON.stringify(db);
  for (const [k, v] of Object.entries(FULL)) s = s.split(k).join(v);
  for (const [k, v] of WORDS) s = s.split(k).join(v);
  return JSON.parse(s);
};

export const REDACT = {
  // 채팅·쿠키·토스트 같은 건 앱에 없다 — 앱 자체 요소는 건드리지 않는다
  // 카탈로그(src/data/products.json)에서 앱이 직접 그리는 제품 이름의 브랜드 접두어도 지운다(DB 가 아니라 앱 데이터라 DOM 에서)
  textMap: Object.fromEntries([...WORDS, ['뉴트리 ', ''], ['아티스트리 ', ''], ['글리스터 ', ''], ['후아 ', ''], ['SA8 ', ''], ['g&h ', ''], ['디쉬 드랍스 ', ''], ['바이오퀘스트 ', ''], ['행복한아름 ', '']]),
  names: [], ids: [],
};

// ───────────── 세션 ─────────────
export const tally = () => ({ fakeGet: 0, fakeNonGet: 0, functions: 0, prodBlocked: 0, amwayBlocked: 0, localReq: 0, externalAllowed: {}, nonGetList: {} });

export async function openBrowser() {
  // 신규 headless(channel chromium) — headless-shell 은 Notification.permission 이 항상 denied 라 설정 화면이 달라진다(audit/README.md)
  return launch({ channel: 'chromium', args: ['--disable-features=Translate', '--lang=ko-KR'] });
}

/**
 * @param {import('playwright').Browser} browser
 * @param {'desktop'|object} vp  MOBILE | 'desktop'
 * @param {{account?: 'main'|'admin'|'fresh'|null, mutate?: (w:any)=>void, local?: object, idb?: object, modes?: object, clock?: boolean}} o
 */
export async function session(browser, vp, o = {}) {
  const account = o.account === undefined ? 'main' : o.account;
  const world = buildWorld({ account });
  world.db = deepRename(world.db);
  o.mutate?.(world);
  const { ctx, page } = await newContext(browser, vp, { project: PROJECT, redact: REDACT, clock: false, guard: { blockAll: [/\.supabase\.co/, /amway\.co\.kr/] } });
  await page.clock.install({ time: NOW.date });
  const log = { console: [], devWarnings: [], pageErrors: [], liveImages: [], unmocked: [], prodViolations: [], externalAborted: [], failed: [], ai: [] };
  const mock = await installMock(ctx, { db: world.db, accounts: world.accounts, log, now: NOW, modes: o.modes });
  const st = ctx.__prismStats;
  const t = tally();
  const seedHtml = '<!doctype html><title>seed</title>';
  // 맨 위(나중에 등록한 것이 먼저 돈다): 집계·운영 호스트·제품 사진 CDN 차단 → 나머지는 mock 으로 넘김
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const method = req.method();
    let u;
    try { u = new URL(req.url()); } catch { return route.fallback(); }
    const host = u.hostname;
    if (u.pathname === SEED_PATH && host === '127.0.0.1') return route.fulfill({ status: 200, contentType: 'text/html', body: seedHtml });
    if (host === 'media.amway.co.kr') { t.amwayBlocked++; return route.abort('blockedbyclient'); }
    if (host === 'supabase.co' || host.endsWith('.supabase.co')) {
      t.prodBlocked++; st.intercepted++; st.list.push(`${method} ${host}${u.pathname} (운영 호스트 차단 · 가짜 200)`);
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
    if (host === FAKE_HOST) {
      if (u.pathname.startsWith('/functions/v1/')) { t.functions++; st.intercepted++; st.list.push(`${method} ${u.pathname} (AI·함수 가짜 응답)`); }
      else if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        t.fakeNonGet++; st.intercepted++; st.list.push(`${method} ${u.pathname} (가짜 백엔드 메모리에만 반영)`);
        const k = `${method} ${u.pathname.replace(/[0-9a-f-]{36}/g, ':id')}`; t.nonGetList[k] = (t.nonGetList[k] || 0) + 1;
      } else t.fakeGet++;
    } else if (host === '127.0.0.1') t.localReq++;
    else t.externalAllowed[host] = (t.externalAllowed[host] || 0) + 1;
    return route.fallback();
  });
  page.on('console', (m) => { if (m.type() === 'error') log.console.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => log.pageErrors.push(String(e.message).slice(0, 200)));
  // Math.random 시드 고정(하네스와 같게) — 무작위 값이 매번 같게
  await ctx.addInitScript(() => {
    let a = 0x9e3779b9;
    Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  });
  const local = {
    'waylog:migrated-auth-v4': '1', 'waylog:community-clean-ver': '1', 'waylog:reset:2026-05-11': '1',
    ...world.local, ...(o.local || {}),
  };
  if (account) local[STORAGE_KEY] = JSON.stringify(world.accounts[account].session);
  const idb = { ...world.idb, ...(o.idb || {}) };
  await page.goto(`${BASE}${SEED_PATH}`);
  await page.evaluate(async ({ local, idb }) => {
    localStorage.clear();
    for (const [k, v] of Object.entries(local)) localStorage.setItem(k, v);
    await new Promise((resolve, reject) => {
      const req = indexedDB.open('waylog', 1);
      req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains('kv')) req.result.createObjectStore('kv'); };
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result; const tx = db.transaction('kv', 'readwrite'); const store = tx.objectStore('kv'); store.clear();
        for (const [k, v] of Object.entries(idb)) store.put(typeof v === 'string' ? v : JSON.stringify(v), k);
        tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error);
      };
    });
  }, { local, idb });
  return { ctx, page, world, log, mock, tally: t };
}

export const goHome = async (page) => {
  await page.goto(`${BASE}/`);
  await page.locator('nav[aria-label="주 메뉴"]').waitFor({ timeout: 30000 });
};
export const summary = (s) => ({ ...s.tally, mockUnmocked: s.log.unmocked.length, unmocked: s.log.unmocked.slice(0, 5), consoleErrors: s.log.console.length + s.log.pageErrors.length });

// w5_final_shoot.mjs 의 detail() — 이야기 상세에 사진·좋아요·댓글을 채운다(하네스 픽스처 그대로)
export const richPost = (w) => {
  const { U, CP } = w.ids;
  const p = w.db.community_posts.find((x) => x.id === CP(10));
  p.image_url = w.db.community_posts.find((x) => x.id === CP(9)).image_url;
  p.content = `${p.content}\n아침에 한 알, 저녁에 한 알 나눠 먹으니 속도 편해요. #오메가3 #가족건강`;
  for (const [i, un] of [2, 3, 4].entries()) w.db.community_post_likes.push({ id: `00000000-0000-4000-8400-0000000009${i}0`, post_id: CP(10), user_id: U(un), created_at: p.created_at });
  w.db.community_comments.push(
    { id: '00000000-0000-4000-8500-000000000901', post_id: CP(10), user_id: U(3), parent_id: null, mention_to: null, content: '어느 제품 드세요? 저도 찾고 있었어요', created_at: p.created_at },
    { id: '00000000-0000-4000-8500-000000000902', post_id: CP(10), user_id: U(1), parent_id: '00000000-0000-4000-8500-000000000901', mention_to: '하루한잔', content: '아래 제품 카드에 있어요!', created_at: p.created_at },
  );
};
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ───────────── 오버레이 화면(설정·챌린지·체성분·관리자)의 전체 캡처 ─────────────
// 이 PWA 의 이런 화면은 fixed 오버레이 + 안쪽 스크롤이라 window 기준 fullPage 는 뒤에 깔린 화면까지 같이 찍는다.
// view = 열린 그대로 첫 화면(안쪽 스크롤 0). full = 같은 오버레이를 안쪽 스크롤 높이만큼 펴서(position:absolute·높이 = 내용 전체, 뒤 화면은 숨김) 찍은 한 장 —
// DOM·CSS 는 그대로고 높이만 펴므로 글자·간격은 실제와 같다. 찍고 나면 원래대로 되돌린다.
import fsx from 'node:fs';
import { saveShot, liveRedact } from '../../tools/lib.mjs';
export async function captureOverlay(page, name, { dialog = '[role="dialog"]' } = {}) {
  const dir = path.join(ROOT, PROJECT, page.__prism.vpName);
  await liveRedact(page, true);
  await brandGuard(page, name);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(500);
  // 가장 위(마지막으로 열린) 오버레이를 고른다
  const info = await page.evaluate((sel) => {
    const ds = [...document.querySelectorAll(sel)].filter((d) => getComputedStyle(d).position === 'fixed' && d.getBoundingClientRect().height > innerHeight * 0.8);
    const d = ds[ds.length - 1];
    if (!d) return null;
    let sc = null;
    for (const e of d.querySelectorAll('*')) {
      const o = getComputedStyle(e).overflowY;
      if ((o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 4 && (!sc || e.scrollHeight > sc.scrollHeight)) sc = e;
    }
    d.setAttribute('data-ov-keep', '1');
    if (sc) sc.scrollTop = 0;
    return { scrollable: !!sc, extra: sc ? sc.scrollHeight - sc.clientHeight : 0, h: Math.round(d.getBoundingClientRect().height) };
  }, dialog);
  if (!info) throw new Error(`captureOverlay ${name}: 오버레이 없음`);
  const view = await saveShot(page, path.join(dir, `${name}-view.png`), { expectScroll: 0, note: '오버레이 화면 — 열린 그대로 첫 화면' });
  if (!info.scrollable) {
    // 안쪽 스크롤이 없으면 full = view 와 같은 장면
    const full = await saveShot(page, path.join(dir, `${name}-full.png`), { expectScroll: 0, note: '오버레이 화면 — 안쪽 스크롤이 없어 full = view' });
    return { view, full };
  }
  const X = info.h + info.extra;
  await page.evaluate((X) => {
    const d = document.querySelector('[data-ov-keep]');
    window.__ovSaved = { style: d.getAttribute('style') };
    const st = document.createElement('style'); st.id = '__ov-style';
    st.textContent = `html,body{height:${X}px!important;overflow:hidden!important}
      body *{visibility:hidden!important}
      [data-ov-keep],[data-ov-keep] *{visibility:visible!important}
      #root{height:${X}px!important;overflow:hidden!important}`;
    document.head.appendChild(st);
    d.style.setProperty('position', 'absolute', 'important');
    d.style.setProperty('top', '0', 'important');
    d.style.setProperty('bottom', 'auto', 'important');
    d.style.setProperty('height', X + 'px', 'important');
    d.style.setProperty('animation', 'none', 'important');
  }, X);
  await page.waitForTimeout(900);
  let full;
  try {
    full = await saveShot(page, path.join(dir, `${name}-full.png`), { full: true, note: `오버레이 전체 — 안쪽 스크롤 ${info.extra}px 만큼 높이를 펴서 찍음(뒤 화면 숨김)` });
  } finally {
    await page.evaluate(() => {
      const d = document.querySelector('[data-ov-keep]');
      document.getElementById('__ov-style')?.remove();
      if (d) { const s = window.__ovSaved?.style; if (s === null || s === undefined) d.removeAttribute('style'); else d.setAttribute('style', s); d.removeAttribute('data-ov-keep'); }
    });
    await page.waitForTimeout(400);
  }
  return { view, full };
}

// ───────────── 공개 표기 DOM 검사 — 화면 글자(보이는 글자 + alt·title·aria-label·placeholder)에 제품 회사·브랜드명이 0 인지 ─────────────
import { capturePage as capturePageRaw } from '../../tools/lib.mjs';
const BRAND_RX = ['암웨이', 'amway', '뉴트리라이트', '뉴트리라면', 'nutrilite', '아티스트리', 'artistry', '더블엑스', '바디키', 'bodykey', '원포원', '화이버비츠', '푸로틴', '더마아키텍트', '하이드라매틱스', '셀렉트팩', '글리스터', '이스프링', '노브스갈라', '행복한아름', '굿모닝', 'gutmorning', '바이오퀘스트', '디쉬드랍스', '뉴트리파이토', '뉴트리마린'];
export async function brandScan(page) {
  await liveRedact(page, true);
  await page.waitForTimeout(300);
  return page.evaluate((words) => {
    const parts = [document.body.innerText || ''];
    for (const el of document.querySelectorAll('[alt],[title],[aria-label],[placeholder]')) for (const a of ['alt', 'title', 'aria-label', 'placeholder']) { const v = el.getAttribute(a); if (v) parts.push(v); }
    const flat = parts.join('\n').replace(/\s+/g, '').toLowerCase();
    return words.filter((w) => flat.includes(w.toLowerCase()));
  }, BRAND_RX);
}
export async function brandGuard(page, label) {
  const hits = await brandScan(page);
  if (hits.length) throw new Error(`브랜드 글자 ${hits.join(',')} — ${label} 저장 안 함(textMap·FULL 에 더하라)`);
}
export async function capPage(page, name, opts) { await brandGuard(page, name); return capturePageRaw(page, name, opts); }
