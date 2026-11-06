// maieventic 촬영 공통: 가드(운영 쓰기 차단)·가림 규칙·진입 헬퍼. 비밀값 없음.
import { launch, newContext, ROOT } from '../../tools/lib.mjs';
export { launch, ROOT };

export const BASE = 'https://mai-eventic.com';

// 운영 DB 쓰기 방지(RECON 6):
//  - 비GET 은 lib 기본으로 가짜 200. 읽기인데 POST 인 것은 fake 로 응답 모양을 채운다.
//  - /e 진입 비콘(/api/beacon, /api/analytics/beacon)은 blockAll, GET 이면서 DB 쓰기인 /api/stamp/store-qr 는 blockGet.
//  - 문자(send-code·verify-code·notify-win·session-verify)는 전부 fake — 운영은 SENS 실발송이라 절대 통과 금지.
//  - play_event 는 PostgREST 직호출(**/rest/v1/rpc/play_event) — 게임 결과를 fake.
//  - Supabase 인증(/auth/v1/*)은 allow(로그인 POST) — 로그인 촬영 스크립트에서만 쓴다.
export const baseGuard = {
  allow: [],
  blockAll: [/\/api\/beacon/, /\/api\/analytics\/beacon/],
  blockGet: [/\/api\/stamp\/store-qr/],
  fake: [
    { match: /\/api\/auth\/send-code/, method: 'POST', json: { ok: true, ttlSec: 300 } },
    { match: /\/api\/auth\/verify-code/, method: 'POST', json: { ok: true, verified: true } },
    { match: /\/api\/notify-win/, method: 'POST', json: { ok: true, sent: 0, status: 'skipped' } },
    { match: /\/api\/auth\/session-verify/, method: 'POST', json: { ok: true, identifier: '01000000000' } },
    { match: /\/api\/consents/, method: 'POST', json: { ok: true } },
  ],
};

// 마케팅 푸터의 사업자 정보 블록(상호·대표자·사업자번호·주소·대표전화·이메일·책임자) 전부 가림 + 챗 위젯 FAB 숨김.
export const baseRedact = {
  remove: ['footer .mt-3.flex.flex-wrap', 'footer a[href*="ftc.go.kr"]'],
  hide: ['button[aria-label="문의하기"]', '.mai-fab'],
  qrSelectors: [],
};

export async function mk(browser, vp, extra = {}) {
  const guard = { ...baseGuard, ...(extra.guard || {}) };
  guard.fake = [...(extra.guard?.fake || []), ...baseGuard.fake];
  guard.allow = [...baseGuard.allow, ...(extra.guard?.allow || [])];
  guard.blockAll = [...baseGuard.blockAll, ...(extra.guard?.blockAll || [])];
  guard.blockGet = [...baseGuard.blockGet, ...(extra.guard?.blockGet || [])];
  const redact = { ...baseRedact, ...(extra.redact || {}) };
  redact.remove = [...baseRedact.remove, ...(extra.redact?.remove || [])];
  redact.hide = [...baseRedact.hide, ...(extra.redact?.hide || [])];
  const r = await newContext(browser, vp, { project: 'maieventic', guard, redact, clock: !!extra.clock, storageState: extra.storageState, extra: extra.ctx });
  // 비콘 차단 보강: DNT 신호(헤드리스라도 클라가 비콘을 건너뛰게). 가로챈 수는 json 에 기록된다.
  await r.ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' }); } catch {} });
  return r;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
