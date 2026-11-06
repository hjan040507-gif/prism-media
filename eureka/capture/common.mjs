// eureka 촬영 공통 — 운영 공개 화면 https://nomorenusu.com 을 GET 으로만 연다(소스 저장소 없음).
// 시작 전에 guard: /api/analytics/event 는 메서드 무관 가로채고(blockAll), 그 밖의 비GET(홈 URL 로 가는 서버 액션 submitQuote 포함)은 lib 기본이 전부 가짜 200.
import { newContext, saveShot, settle, ROOT } from '../../tools/lib.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const BASE = 'https://nomorenusu.com';

export const GUARD = {
  blockAll: ['nomorenusu.com/api/analytics/event'],
  // 클릭하면 전화·카카오·관리자 API 로 가는 것은 열지 않는다(GET 이어도 막는다)
  blockGet: ['nomorenusu.com/admin/api/', 'open.kakao.com'],
};

// 전화(→010-****-****)·사업자번호·URL 은 lib 가 자동으로 가린다.
export const REDACT = { remove: [], hide: [], names: [], address: [] };

// 현황판 고객 이름(성+o+끝 글자, 사이트가 이미 마스킹한 꼴)을 김○○ 로, 꼬리의 전화·사업자정보 줄을 가린다.
// lib 의 names 규칙은 안쪽 글자를 통째로 바꾸므로(모바일은 시각 글자가 같은 span 안) 이름 글자만 바꾸는 초기화 스크립트를 따로 둔다.
export const EXTRA_REDACT = `(() => {
  const NAME = /^[가-힣a-zA-Z]o[가-힣a-zA-Z]/;
  const run = () => {
    for (const el of document.querySelectorAll('ul[aria-live] li span.font-bold')) {
      for (const n of el.childNodes) if (n.nodeType === 3 && NAME.test(n.nodeValue.trim())) n.nodeValue = '김○○';
    }
    for (const sp of document.querySelectorAll('footer span')) {
      if (sp.children.length === 0 && /^(전화|사업자정보)\\s*:/.test((sp.textContent || '').trim())) sp.style.setProperty('visibility', 'hidden', 'important');
    }
  };
  const start = () => { run(); new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true, characterData: true }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();`;

// 하이드레이션 전에 DOM 글자를 바꾸면 React #418(텍스트 불일치)이 나므로 goto + 하이드레이션 대기 뒤에 건다.
export async function armRedact(page) {
  await page.evaluate(EXTRA_REDACT);
}

export async function ctxFor(browser, vp, opts = {}) {
  const { ctx, page } = await newContext(browser, vp, {
    project: 'eureka',
    guard: GUARD,
    redact: opts.redact || REDACT,
    clock: !!opts.clock,
  });
  const reqs = [];
  page.on('request', (r) => reqs.push({ m: r.method(), u: r.url() }));
  page.on('pageerror', (e) => console.log('  [pageerror]', String(e.message).slice(0, 160)));
  page.__reqs = reqs;
  return { ctx, page, reqs };
}

// ───────────────────────── 조각 이어 붙임 캡처 ─────────────────────────
// Chrome 은 장치 픽셀 16,384 를 넘는 fullPage 캡처에서 구간을 흰색·빈 배경으로 그리는 일이 있다(모바일 홈 46833px 에서 확인).
// 그래서 화면 높이씩 스크롤하며 뷰포트 캡처(saveShot — 가림·PII 검사 포함)를 조각으로 찍어 PIL 로 잇는다.
// 고정·sticky 요소: page 모드는 위쪽 것은 첫 조각에만, 아래쪽 고정 바는 마지막 조각에만. section 모드는 전부 숨긴다.
export async function tiledFull(page, outFile, { y0 = 0, h, mode = 'page', note } = {}) {
  const vp = page.viewportSize();
  const vh = vp.height;
  const dsf = page.__prism.opts.deviceScaleFactor || 1;
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(300);
  const docH = await page.evaluate(() => document.documentElement.scrollHeight);
  if (h === undefined) h = docH - y0;
  await page.evaluate(() => {
    window.__prFx = [];
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if ((cs.position !== 'fixed' && cs.position !== 'sticky') || cs.display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      window.__prFx.push({ el, kind: cs.position === 'fixed' && r.top > window.innerHeight * 0.5 ? 'bottom' : 'top', vis: el.style.getPropertyValue('visibility'), pr: el.style.getPropertyPriority('visibility') });
    }
  });
  const ys = [];
  for (let y = y0; y < y0 + h; y += vh) ys.push(y);
  const tmpDir = path.join(ROOT, 'tmp', 'eureka-tiles');
  fs.mkdirSync(tmpDir, { recursive: true });
  const base = path.basename(outFile, '.png') + '-' + page.__prism.vpName;
  const pieces = [], jsons = [];
  for (let i = 0; i < ys.length; i++) {
    const y = ys[i];
    const calcSy = async () => Math.max(0, Math.min(y, (await page.evaluate(() => document.documentElement.scrollHeight)) - vh)); // 지연 로딩으로 문서 높이가 바뀔 수 있어 조각마다 다시 잰다
    let sy = await calcSy();
    const first = i === 0, last = i === ys.length - 1;
    await page.evaluate(({ mode, first, last }) => {
      for (const f of window.__prFx) {
        const show = mode === 'page' && ((first && f.kind === 'top') || (last && f.kind === 'bottom') || (first && last));
        if (show) { if (f.vis) f.el.style.setProperty('visibility', f.vis, f.pr); else f.el.style.removeProperty('visibility'); }
        else f.el.style.setProperty('visibility', 'hidden', 'important');
      }
    }, { mode, first, last });
    await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), sy);
    await page.waitForTimeout(700); // 등장 애니메이션·지연 이미지
    await page.evaluate(async (t) => {
      window.scrollTo({ top: t, behavior: 'instant' });
      const imgs = [...document.images].filter((im) => { const r = im.getBoundingClientRect(); return r.bottom > -50 && r.top < window.innerHeight + 50; });
      for (const im of imgs) { im.loading = 'eager'; }
      await Promise.race([Promise.all(imgs.map((im) => (im.complete ? im.decode() : new Promise((r) => { im.onload = im.onerror = r; }).then(() => im.decode())).catch(() => {}))), new Promise((r) => setTimeout(r, 8000))]);
    }, sy);
    await page.waitForTimeout(250);
    const tmp = path.join(tmpDir, `${base}-${String(i).padStart(3, '0')}.png`);
    let j;
    for (let attempt = 0; ; attempt++) { // 지연 이미지·카루셀로 레이아웃이 밀려 스크롤이 움직이면 다시 맞춰 재시도(최대 4번)
      try { j = await saveShot(page, tmp, { expectScroll: sy, kind: 'slice' }); break; } catch (e) {
        if (attempt >= 3 || !/스크롤이/.test(String(e.message))) throw e;
        console.log(`  [slice ${i}] 스크롤 이동 — 재시도 ${attempt + 1}:`, String(e.message).slice(0, 60));
        sy = await calcSy();
        await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), sy);
        await page.waitForTimeout(800);
      }
    }
    jsons.push({ j, sy });
    const off = y - sy; // 마지막 조각이 문서 바닥에 걸려 위쪽이 겹칠 때 겹친 만큼 위를 잘라 낸다
    const take = Math.min(vh - off, y0 + h - y);
    pieces.push({ file: tmp, top: Math.round(off * dsf), height: Math.round(take * dsf) });
  }
  await page.evaluate(() => { for (const f of window.__prFx || []) { if (f.vis) f.el.style.setProperty('visibility', f.vis, f.pr); else f.el.style.removeProperty('visibility'); } });
  const spec = path.join(tmpDir, `${base}.json`);
  fs.writeFileSync(spec, JSON.stringify({ out: outFile, pieces }));
  execFileSync('python3', ['-c', `
import json,sys
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
sp=json.load(open(sys.argv[1]))
ims=[(Image.open(p['file']).convert('RGB'),p) for p in sp['pieces']]
w=ims[0][0].width; H=sum(p['height'] for _,p in ims)
cv=Image.new('RGB',(w,H),'white'); y=0
for im,p in ims:
    cv.paste(im.crop((0,p['top'],w,p['top']+p['height'])),(0,y)); y+=p['height']
cv.save(sp['out'],optimize=True)`, spec]);
  // json: 조각 json 을 합친다(요소 사각형은 문서 좌표로)
  const seen = new Set(), elements = [];
  for (const { j, sy } of jsons) for (const e of j.elements || []) {
    if (e.fixed && !(mode === 'page')) continue;
    const r = { ...e.rect, y: Math.round((e.rect.y + sy - y0) * 10) / 10 };
    const key = e.type + r.x + ',' + r.y + ',' + r.w + ',' + r.h;
    if (seen.has(key)) continue; seen.add(key);
    elements.push({ ...e, rect: r });
  }
  const last = jsons[jsons.length - 1].j, firstJ = jsons[0].j;
  const out = {
    file: path.basename(outFile), kind: mode === 'page' ? 'page' : 'section-full', project: last.project, viewport: last.viewport, path: last.path,
    scrollY: 0, scrollX: 0, docHeight: docH, full: true, clip: mode === 'page' ? null : { documentY: y0, height: h },
    capturedAt: new Date().toISOString(), title: firstJ.title,
    note: `조각 이어 붙임 — 화면 높이(${vh}px)씩 스크롤해 뷰포트 캡처 ${ys.length}조각 후 PIL 로 이음${mode === 'page' ? '(고정 머리는 첫 조각, 하단 고정 바는 마지막 조각에만)' : '(섹션만, 고정 요소 숨김)'}. ${note || ''}`.trim(),
    pii_scan: { total: jsons.reduce((a, { j }) => a + j.pii_scan.total, 0), slices: ys.length, after: jsons.reduce((a, { j }) => a + (j.pii_scan.after || 0), 0), at: '조각마다 가림 후·촬영 후 DOM 글자 정규식 검사', patterns: firstJ.pii_scan.patterns },
    redactions: last.redactions,
    intercepted: last.intercepted,
    elements,
  };
  fs.writeFileSync(outFile.replace(/\.png$/, '.json'), JSON.stringify(out, null, 1));
  for (const { j } of jsons) { const f = path.join(tmpDir, j.file); fs.rmSync(f, { force: true }); fs.rmSync(f.replace(/\.png$/, '.json'), { force: true }); }
  fs.rmSync(spec, { force: true });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  return out;
}

// 페이지 전체(조각 이어 붙임) — settle 로 지연 로딩·등장 애니메이션을 다 띄운 뒤.
export async function fullTiled(page, name, { sub } = {}) {
  const dir = path.join(ROOT, 'eureka', sub || page.__prism.vpName);
  fs.mkdirSync(dir, { recursive: true });
  await settle(page, {});
  return tiledFull(page, path.join(dir, `${name}-full.png`), { mode: 'page' });
}

// 섹션(요소) 한 세트: <name>-view.png(섹션 맨 위가 화면 위쪽에 오게 스크롤한 한 화면, viewToo 일 때만) · <name>-full.png(섹션 전체, 조각 이어 붙임).
export async function sectionShots(page, name, selector, { topGap = 110, sub, viewToo = true } = {}) {
  const vpName = page.__prism.vpName;
  const dir = path.join(ROOT, 'eureka', sub || vpName);
  fs.mkdirSync(dir, { recursive: true });
  await settle(page, {});
  const rect = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const r = el.getBoundingClientRect();
    return { y: Math.round(r.top + scrollY), h: Math.round(r.height) };
  }, selector);
  let view = null;
  if (viewToo) {
    const sy = Math.max(0, rect.y - topGap);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), sy);
    await page.waitForTimeout(500);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), sy);
    view = await saveShot(page, path.join(dir, `${name}-view.png`), { expectScroll: sy, kind: 'section-view', note: `selector ${selector}` });
  }
  const full = await tiledFull(page, path.join(dir, `${name}-full.png`), { y0: rect.y, h: rect.h, mode: 'section', note: `selector ${selector}` });
  return { view, full, rect };
}
