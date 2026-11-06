// React Native Web 용 캡처 보조 — 화면 스크롤이 window 가 아니라 안쪽 ScrollView(div overflow:auto)라서
// tools/lib.mjs capturePage 의 "끝까지 스크롤 → 문서 전체 캡처"가 그대로는 안 된다.
// full: 안쪽 스크롤 영역을 끝까지 내려 지연 로딩을 띄운 뒤, 뷰포트 높이를 내용 높이에 맞춰 키워 한 번에 찍고 되돌린다(앱 레이아웃은 그대로 — 하단 탭바는 맨 아래).
// view: 원래 뷰포트(스크롤 0).
import path from 'node:path';
import { saveShot, liveRedact, ROOT } from '../../tools/lib.mjs';

// 맨 위에 보이는 화면의 스크롤 영역(스택 아래 깔린 이전 화면 제외)과 내용 높이
const pickFn = () => {
  let best = null;
  for (const el of document.querySelectorAll('div')) {
    const cs = getComputedStyle(el);
    if (!/(auto|scroll)/.test(cs.overflowY)) continue;
    if (el.offsetParent === null && cs.position !== 'fixed') continue;
    const r = el.getBoundingClientRect();
    if (r.width < innerWidth * 0.5 || r.height < 150) continue;
    if (r.bottom <= 0 || r.top >= innerHeight) continue;
    const hit = document.elementFromPoint(Math.min(innerWidth - 2, r.left + r.width / 2), Math.min(innerHeight - 2, r.top + Math.min(r.height / 2, 200)));
    if (!hit || !el.contains(hit)) continue;
    const d = el.scrollHeight - el.clientHeight;
    if (!best || d >= best.d) best = { d, el, r };
  }
  return best;
};
const infoFn = () => {
  const best = window.__pick();
  if (!best) return null;
  const top = best.r.top - best.el.scrollTop;
  let maxB = 0, n = 0;
  for (const c of best.el.querySelectorAll('*')) {
    if (++n > 8000) break;
    if (c.children.length && !/^svg$/i.test(c.tagName)) continue;
    if (!c.textContent.trim() && !/^(IMG|SVG|CANVAS|INPUT|TEXTAREA|VIDEO)$/i.test(c.tagName)) continue;
    const cs = getComputedStyle(c);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
    const r = c.getBoundingClientRect();
    if (r.height < 1 || r.width < 1) continue;
    if (r.bottom - top > maxB) maxB = r.bottom - top;
  }
  const ch = best.el.clientHeight;
  return { ch, sh: best.el.scrollHeight, content: Math.ceil(maxB) + 32, chrome: innerHeight - ch };
};
async function inject(page) {
  await page.evaluate(`window.__pick = (${pickFn.toString()})`);
}
async function info(page) {
  await inject(page);
  return page.evaluate(`(${infoFn.toString()})()`);
}

export async function scrollAll(page) {
  await inject(page);
  await page.evaluate(async () => {
    const b = window.__pick();
    if (!b) return;
    const el = b.el;
    let last = -1;
    for (let i = 0; i < 40; i++) {
      el.scrollTop = el.scrollTop + el.clientHeight * 0.8;
      await new Promise((r) => setTimeout(r, 350));
      if (el.scrollTop === last) break;
      last = el.scrollTop;
    }
    el.scrollTop = 0;
  });
  await page.waitForTimeout(600);
}

export async function scrollTopAll(page) {
  await page.evaluate(() => { for (const el of document.querySelectorAll('div')) if (el.scrollTop) el.scrollTop = 0; window.scrollTo(0, 0); });
}

async function imagesReady(page) {
  await page.evaluate(async () => {
    const imgs = [...document.images].filter((i) => !i.complete);
    await Promise.race([Promise.all(imgs.map((i) => new Promise((r) => { i.onload = i.onerror = r; }))), new Promise((r) => setTimeout(r, 8000))]);
    if (document.fonts) await document.fonts.ready;
  }).catch(() => {});
  await page.waitForTimeout(400);
}

/** <name>-full.png · <name>-view.png (+json). sub: 폴더(mobile|desktop). maxCss: 전체 캡처 최대 높이(CSS px). */
export async function captureRN(page, name, { sub, maxCss, prep } = {}) {
  const vp0 = page.viewportSize();
  const dsf = page.__prism.opts.deviceScaleFactor;
  const cap = maxCss || Math.floor(15900 / dsf);
  const dir = path.join(ROOT, page.__prism.project, sub || page.__prism.vpName);
  await liveRedact(page, true);
  if (prep) await prep(page);
  await imagesReady(page);
  await scrollAll(page);
  await imagesReady(page);
  let inf = await info(page);
  let truncated = false;
  if (inf && inf.content > inf.ch + 2) {
    let nh = Math.min(cap, Math.max(vp0.height, inf.chrome + inf.content));
    if (inf.chrome + inf.content > cap) truncated = true;
    for (let k = 0; k < 3; k++) {
      await page.setViewportSize({ width: vp0.width, height: nh });
      await page.waitForTimeout(900);
      await scrollAll(page);
      await imagesReady(page);
      inf = await info(page);
      if (!inf) break;
      const want = Math.min(cap, Math.max(vp0.height, inf.chrome + inf.content));
      if (Math.abs(want - nh) <= 2) break;
      nh = want;
    }
  }
  await scrollTopAll(page);
  await page.waitForTimeout(500);
  await liveRedact(page, true);
  const full = await saveShot(page, path.join(dir, `${name}-full.png`), { full: true, note: truncated ? `전체 캡처 높이 상한(${cap}px)에서 잘림` : undefined });
  await page.setViewportSize(vp0);
  await page.waitForTimeout(900);
  await scrollTopAll(page);
  await page.waitForTimeout(500);
  const view = await saveShot(page, path.join(dir, `${name}-view.png`), { expectScroll: 0 });
  return { full, view, truncated };
}

/** 상태 흐름용: 안쪽 스크롤을 y 로(보통 0). */
export async function innerScrollTo(page, y = 0) {
  await inject(page);
  await page.evaluate((y) => { const b = window.__pick(); if (b) b.el.scrollTop = y; }, y);
  await page.waitForTimeout(300);
}
export async function innerScrollY(page) {
  await inject(page);
  return page.evaluate(() => { const b = window.__pick(); return b ? Math.round(b.el.scrollTop) : 0; });
}
