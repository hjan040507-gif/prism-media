// jipyeong 관리자(데스크톱 1440) 촬영 — 로컬 사본(가짜 env, Supabase 변수 없음) + 가짜 응모자 JSON.
// 운영 관리자는 실응모자 데이터가 있어 열지 않는다. 실행: ADMIN_PORT=4310 JP_FAKE_ENV=<가짜 env 파일> node jipyeong/capture/admin.mjs
//  · 세션은 서버가 쿠키(JWT)만으로 판정(admin/auth.ts getAdminSession) → 가짜 pepper 로 jp_admin 쿠키를 직접 발급
//  · /api/admin/* GET 은 아래 가짜 JSON, 비GET(추첨·제외·문자 발송·로그인 포함)은 lib 기본 가짜 200(실문자 /notify·/alert-test 도 여기서 막힘)
import fs from 'node:fs';
import crypto from 'node:crypto';
import { newContext, capturePage, startFlow } from '../../tools/lib.mjs';
import { launch } from './common.mjs';

const PORT = process.env.ADMIN_PORT || '4310';
const ORIGIN = `http://127.0.0.1:${PORT}`;
const API = `127.0.0.1:${PORT}/jipyeong-shake/api/`;

// ── 가짜 pepper 로 jp_admin 쿠키(JWT HS256) 발급: 키 = utf8(HMAC-SHA256(pepper,"jp-admin-session") hex)
function pepperFromFile() {
  const m = fs.readFileSync(process.env.JP_FAKE_ENV, 'utf8').match(/^JIPYEONG_OTP_PEPPER=(.+)$/m);
  if (!m) throw new Error('가짜 env 에 pepper 없음');
  return m[1];
}
function adminJwt(pepper) {
  const key = Buffer.from(crypto.createHmac('sha256', pepper).update('jp-admin-session').digest('hex'), 'utf8');
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: 'HS256' });
  const body = b64({ adm: true, iat: now, exp: now + 3600 });
  const sig = crypto.createHmac('sha256', key).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${sig}`;
}

// ── 가짜 데이터(전부 '가짜 값'): 결정론적 난수
let seed = 20261030;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const SUR = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'];
const WEEKS = [
  { n: 1, start: '2026-09-17', end: '2026-09-23' }, { n: 2, start: '2026-09-24', end: '2026-09-30' },
  { n: 3, start: '2026-10-01', end: '2026-10-07' }, { n: 4, start: '2026-10-08', end: '2026-10-14' },
  { n: 5, start: '2026-10-15', end: '2026-10-21' }, { n: 6, start: '2026-10-22', end: '2026-10-30' },
];
const weekMs = (w) => ({ s: Date.parse(`${w.start}T00:00:00+09:00`), e: Date.parse(`${w.end}T23:59:59.999+09:00`) });
const weekOf = (ms) => (WEEKS.find((w) => { const r = weekMs(w); return ms >= r.s && ms <= r.e; }) || {}).n ?? null;
const typeOf = (s) => (s < 1 ? 'hype' : s < 2 ? 'story' : s < 3 ? 'cheers' : s < 4 ? 'balance' : 'calm');
const hex = (n) => Array.from({ length: n }, () => '0123456789abcdef'[ri(0, 15)]).join('');
const uid = () => `${hex(8)}-${hex(4)}-4${hex(3)}-8${hex(3)}-${hex(12)}`;
const byWeek = { 1: 188, 2: 301, 3: 352, 4: 421, 5: 498, 6: 550 };
const total = Object.values(byWeek).reduce((a, b) => a + b, 0);

const entries = [];
{
  let t = Date.parse('2026-10-30T22:41:17+09:00');
  for (let i = 0; i < 200; i++) {
    const sec = Math.round((0.3 + rnd() * 4.7) * 100) / 100;
    const rooms = rnd() < 0.3 ? 0 : ri(1, 10);
    entries.push({
      id: uid(), createdAt: new Date(t).toISOString(), name: `${SUR[ri(0, SUR.length - 1)]}○○`, phone: `010${ri(1000, 9999)}${ri(1000, 9999)}`,
      shakeSeconds: sec, typeId: typeOf(sec), messageId: ri(1, 6), rooms, weight: 1 + Math.min(rooms, 9), marketing: rnd() < 0.7,
      excludedAt: null, excludedReason: null, week: weekOf(t), wins: [],
    });
    t -= ri(20, 340) * 1000;
  }
}
const draws = []; const winners = [];
for (const w of WEEKS.slice(0, 5)) {
  const id = uid();
  draws.push({ id, week: w.n, seed: hex(64), drawnAt: new Date(weekMs(w).e + 10 * 3600 * 1000).toISOString(), status: 'active', voidReason: null, poolSize: Math.round(byWeek[w.n] * 0.97) });
  const plan = [1, 2, 2, 2, 2, 2, ...Array(20).fill(3)];
  plan.forEach((rank, k) => {
    const rooms = ri(0, 10);
    winners.push({
      id: uid(), drawId: id, entryId: uid(), rank: k === 0 ? 1 : rank, notifiedAt: new Date(weekMs(w).e + 12 * 3600 * 1000).toISOString(), smsProvider: 'sens', smsStatus: 'sent', smsError: null,
      name: `${SUR[ri(0, SUR.length - 1)]}○○`, phone: `010${ri(1000, 9999)}${ri(1000, 9999)}`, rooms, weight: 1 + Math.min(rooms, 9),
    });
  });
}
const overview = {
  ok: true,
  dashboard: { total, today: 0, byWeek, rooms: 3875, marketing: 1642 },
  entriesTotal: total, videoClicks: 1204, testCount: 0,
  alertPhones: ['010-****-****'], alertItems: [{ id: 'a1', masked: '010-****-****' }], alertVersion: 'v1',
  weeks: WEEKS.map((w) => { const r = weekMs(w); return { n: w.n, start: w.start, end: w.end, startAt: new Date(r.s).toISOString(), endAt: new Date(r.e).toISOString(), poolSize: Math.round(byWeek[w.n] * 0.97) }; }),
  plannedTotal: 26, draws, winners,
  template: '[지평 SHAKE] #{이름}님, #{등수} 당첨을 축하드립니다.', templateDefault: '[지평 SHAKE] #{이름}님, #{등수} 당첨을 축하드립니다.', placeholders: ['#{이름}', '#{등수}'],
  retentionEnd: '2026-11-30',
  log: [
    ['draw', { week: 5 }, '2026-10-22T10:02:11+09:00'], ['notify', { week: 5, sent: 26 }, '2026-10-22T10:05:40+09:00'], ['draw', { week: 4 }, '2026-10-15T10:01:02+09:00'],
    ['notify', { week: 4, sent: 26 }, '2026-10-15T10:04:31+09:00'], ['settings', { key: 'template' }, '2026-10-08T09:40:18+09:00'], ['draw', { week: 3 }, '2026-10-08T10:00:44+09:00'],
    ['exclude', { reason: '중복 응모' }, '2026-10-02T15:12:09+09:00'], ['draw', { week: 2 }, '2026-10-01T10:01:27+09:00'], ['draw', { week: 1 }, '2026-09-24T10:00:53+09:00'],
  ].map(([action, payload, at], i) => ({ id: `l${i}`, action, payload, at: new Date(at).toISOString() })),
};
const flow = { ok: true, since: '2026-10-30T00:00:00.000Z', flow: { sent: 612, verified: 548, fresh: 41, duplicate: 9, saveFailed: 0, lastFailAt: null }, recentErrors: [] };
const jsErrors = { ok: true, today: 0, top: [] };
const otpStatus = { ok: true, at: '2026-10-30T14:30:00.000Z', today: { success: 548, failed: 12, sens: 520, solapi: 40 }, recentFails: [] };
const entriesPage = { ok: true, rows: entries, total, offset: 0, limit: 200 };

const J = (match, json) => ({ match: `${API}${match}`, method: 'GET', json });
const GUARD = {
  fake: [J('admin/overview', overview), J('admin/flow', flow), J('admin/js-errors', jsErrors), J('admin/otp-status', otpStatus), J('admin/entries', entriesPage)],
  blockGet: [API], // 그 밖의 GET(export CSV·sms-providers·draw?week= 등)은 열지 않는다
};
// 표시용 마스킹: 번호는 '010-****-****'
const REDACT = { fake: [
  { selector: '[data-jpa="phone-toggle"]', value: '010-****-****' },
  { selector: '[data-jpa="draw-winners"] tbody td:nth-child(3)', value: '010-****-****' },
] };

const pepper = pepperFromFile();
const browser = await launch();
try {
  // 로그인 화면(쿠키 없음)
  {
    const { ctx, page } = await newContext(browser, 'desktop', { project: 'jipyeong', guard: GUARD, redact: REDACT });
    await page.goto(`${ORIGIN}/jipyeong-shake/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-jpa="gate"]', { timeout: 20000 });
    await page.waitForTimeout(800);
    await capturePage(page, 'admin-login');
    console.log('login intercepted', JSON.stringify(ctx.__prismStats.list));
    await ctx.close();
  }
  // 인증된 보드
  const { ctx, page } = await newContext(browser, 'desktop', { project: 'jipyeong', guard: GUARD, redact: REDACT });
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message.slice(0, 160)));
  await ctx.addCookies([{ name: 'jp_admin', value: adminJwt(pepper), url: `${ORIGIN}/jipyeong-shake` }]);
  await page.goto(`${ORIGIN}/jipyeong-shake/admin`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-jpa="tab-draw"]', { timeout: 30000 });
  await page.waitForSelector('[data-jpa="stats"]', { timeout: 15000 });
  await page.waitForTimeout(1500);
  await capturePage(page, 'admin-dash');
  await page.click('[data-jpa="tab-list"]');
  await page.waitForSelector('[data-jpa="entry-row"]', { timeout: 15000 });
  await page.waitForTimeout(800);
  await capturePage(page, 'admin-list');
  await page.click('[data-jpa="tab-draw"]');
  await page.waitForSelector('[data-jpa="draw-winners"]', { timeout: 15000 });
  await page.waitForTimeout(800);
  await capturePage(page, 'admin-draw');
  // 상태 흐름: 주차 선택(추첨 완료 → 완료 → 미추첨)
  const f = await startFlow(page, 'admin-draw-week', { scrollY: 0 });
  await f.step('week-1-drawn');
  await page.selectOption('[data-jpa="draw-week"]', '3'); await page.waitForTimeout(500);
  await f.step('week-3-drawn');
  await page.selectOption('[data-jpa="draw-week"]', '6'); await page.waitForTimeout(500);
  await f.step('week-6-not-drawn');
  console.log('intercepted', JSON.stringify(ctx.__prismStats.list), 'allowed', JSON.stringify(ctx.__prismStats.allowed));
  await ctx.close();
} finally {
  await browser.close();
}
console.log('DONE admin');
