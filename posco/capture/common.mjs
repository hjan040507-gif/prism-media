// posco 촬영 공통 — 로컬 사본(git archive 27e9e64d) + 가짜 /api/posco/* 응답. 운영 도메인은 열지 않는다.
// 서버: tmp/posco-src 에서 `next start -p $POSCO_PORT`(기본 3207). DB URL 은 닫힌 로컬 포트(127.0.0.1:9) — 가로채기를 놓쳐도 운영에 닿지 않는다.
// 응답 모양 근거: posco/RECON.md §5-3 (src/app/api/posco/**/route.ts, src/app/demo/posco-ox/data/live.ts)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { launch, newContext, capturePage, startFlow, recordSeq, saveShot, liveRedact, redactNow, ROOT } from '../../tools/lib.mjs';

export { launch, newContext, capturePage, startFlow, recordSeq, saveShot, liveRedact, redactNow, ROOT };
export const PORT = Number(process.env.POSCO_PORT || 3207);
export const BASE = `http://127.0.0.1:${PORT}`;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 가짜 값(형식만 실제 규칙을 따른다): 확인코드 = 영문 3 + 숫자 4(0·O·1·I 제외), 토큰은 16자 이상 임의 hex
export const FAKE_TOKEN = '7d3f9a1c5e8b2046a9d1c7f3e5b80246';
export const CODES = { gold: 'KXM-4827', blue: 'PWR-3925', steel: 'HTN-6238' };
export const COUPON_PNG = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'tmp/posco-fake-coupon.png')).toString('base64');

export const setObj = (target, src) => { for (const k of Object.keys(target)) delete target[k]; Object.assign(target, src); };

// 호출마다 달라지는 응답은 state 의 객체를 제자리에서 바꾼다(lib 가 응답 시점에 json 참조를 읽는다).
export function makeState() {
  return {
    session: { ok: true, authed: false, hasSurvey: false, hasAward: false, event: { state: 'open', dayNo: 2 } },
    verify: { ok: true, verified: true, joined: false },
    draw: { ok: true, tier: 'steel', claimCode: CODES.steel },
    claimGet: { ok: true, tier: 'steel', dayNo: 2, claimCode: CODES.steel, claimed: false, claimedAt: null },
    coupon: { ok: true, coupon: { code: '7391 4826 5517', imageUrl: COUPON_PNG, expiresAt: '2026-11-09', prizeLabel: '아메리카노 커피', urlTtlSec: 900 } },
    confirm: { ok: true, claimed: true, tier: 'blue', claimCode: CODES.blue, claimedAt: '2026-09-17T05:12:00.000Z' },
    opsStats: { ok: true, snapshot: null },
    opsWinners: { ok: true, rows: [], total: 0 },
    opsSurvey: { ok: true, survey: null, comments: [] },
  };
}

const R = (re) => new RegExp(re);
export function makeGuard(st) {
  return {
    fake: [
      { match: R('/api/posco/session(\\?|$)'), method: 'GET', json: st.session },
      { match: R('/api/posco/otp/send$'), method: 'POST', json: { ok: true, ttlSec: 180 } },
      { match: R('/api/posco/otp/verify$'), method: 'POST', json: st.verify },
      { match: R('/api/posco/quiz/answer$'), method: 'POST', json: { ok: true, correct: true } },
      { match: R('/api/posco/survey/submit$'), method: 'POST', json: { ok: true, saved: true } },
      { match: R('/api/posco/draw$'), method: 'POST', json: st.draw },
      { match: R('/api/posco/notify-win$'), method: 'POST', json: { ok: true, status: 'ok' } },
      { match: R('/api/posco/session/end$'), method: 'POST', json: { ok: true, ended: true } },
      { match: R(`/api/posco/claim/${FAKE_TOKEN}$`), method: 'GET', json: st.claimGet },
      { match: R(`/api/posco/claim/${FAKE_TOKEN}/coupon$`), method: 'POST', json: st.coupon },
      { match: R(`/api/posco/claim/${FAKE_TOKEN}/confirm$`), method: 'POST', json: st.confirm },
      { match: R('/api/posco/ops/stats'), method: 'GET', json: st.opsStats },
      { match: R('/api/posco/ops/winners\\?'), method: 'GET', json: st.opsWinners },
      { match: R('/api/posco/ops/survey'), method: 'GET', json: st.opsSurvey },
      // 나머지 /api/posco/** 는 전부 404 (등록 안 된 요청은 서버에 닿지 않는다)
      { match: R('/api/posco/'), status: 404, json: { ok: false, error: 'not found', code: 'not_found' } },
    ],
  };
}

// lib 의 live 가림은 'input' 이벤트마다 입력칸 값을 먼저 바꿔 React 가 가려진 값을 읽게 한다(전화번호 11자리가 차는 순간 010-****-**** 로 바뀌어
// 입력 검증이 깨진다). 이 캡처에서는 그 캡처 단계 리스너만 등록하지 않게 하고, 저장 직전 redactAll 이 입력칸을 가린다(PNG·json 은 가려진 값).
export async function skipInputRedactListener(ctx) {
  await ctx.addInitScript(() => {
    const orig = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, cb, opts) {
      const cap = opts === true || (opts && opts.capture);
      if (this === document && type === 'input' && cap && typeof cb === 'function' && String(cb).includes('redactAll')) return;
      return orig.call(this, type, cb, opts);
    };
  });
}

export async function freeze(page) {
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 1500);
}
export const adv = (page, ms) => page.clock.runFor(ms);

export async function mobile(browser, st, opts = {}) {
  const { ctx, page } = await newContext(browser, 'mobile', { project: 'posco', clock: true, guard: makeGuard(st), ...opts });
  await skipInputRedactListener(ctx);
  return { ctx, page };
}

// 하이드레이션 + 부팅 점 3개 사라질 때까지
export async function boot(page, url, readySel) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('main[data-px-ready="1"], [data-px="claim"], [data-px="ops-board"], [data-px="ops-gate"]', { timeout: 30000 });
  if (readySel) await page.waitForSelector(readySel, { timeout: 30000 });
}

export function log(...a) { console.log(new Date().toISOString().slice(11, 19), ...a); }
