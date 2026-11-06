// 데스크톱 1440 — 실시간 운영 현황판(30초 폴링), 일자별 경품 배분(재고 그리드), 당첨자 목록(필터 흐름), 설문 집계
// 가짜 데이터: 행사 최종 보고서(docs/posco/event-final-report.md §4-1~4-7, 스냅샷 2026-09-19) 집계값으로 재현. 행 단위 명단은 가짜(확인코드는 형식만 실제 규칙).
// 운영 쿠키 posco_ops 는 사본 서버의 임의(가짜) POSCO_SESSION_SECRET 으로 직접 서명한다 — 로그인 API·운영 PIN 을 쓰지 않는다.
// 실행: cd ~/prism-media && node posco/capture/30-desktop-ops.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { launch, newContext, makeState, makeGuard, setObj, freeze, adv, sleep, capturePage, startFlow, saveShot, ROOT, BASE, log } from './common.mjs';

const SRC = path.join(ROOT, 'tmp/posco-src');
const require = createRequire(path.join(SRC, 'package.json'));
const { SignJWT } = require('jose');
const envTxt = fs.readFileSync(path.join(SRC, '.env.local'), 'utf8');
const secret = envTxt.match(/^POSCO_SESSION_SECRET=(.+)$/m)[1].trim(); // 이 촬영용으로 새로 만든 임의 값
const jwt = await new SignJWT({ ops: true }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('12h').sign(new TextEncoder().encode(secret));

const ST = (s) => `[data-px="${s}"]`;

// ── 보고서 집계값 스냅샷 (OpsSnapshot 타입: src/lib/posco/ops-stats.ts:14-77)
const inv = [
  [1, 'gold', 70, 70], [1, 'blue', 70, 70], [1, 'steel', 240, 240],
  [2, 'gold', 70, 70], [2, 'blue', 70, 70], [2, 'steel', 240, 240],
  [3, 'gold', 40, 40], [3, 'blue', 40, 40], [3, 'steel', 120, 120],
].map(([dayNo, tier, quota, awarded]) => ({ tier, dayNo, quota, awarded, extraQuota: tier === 'steel' ? 0 : null, extraAwarded: 0 }));
const snapshot = {
  generatedAt: '2026-09-18T04:20:00.000Z',
  day: { dayNo: 3, kstDate: '2026-09-18', override: null, dates: { day1: '2026-09-16', day2: '2026-09-17', day3: '2026-09-18' }, extraActive: false, soldOut: true },
  participants: { today: 201, total: 961 },
  completed: { today: 201, total: 961 },
  claim: { claimed: 922, unclaimed: 38 },
  survey: {
    responses: 961, ratePct: 100,
    motives: [
      { value: 1, short: '포스코 관심', label: '평소 포스코 그룹 또는 포스코 그룹의 사업에 관심이 있어서', count: 352 },
      { value: 2, short: '탄소중립 관심', label: '탄소중립·친환경 기술 및 관련 산업에 관심이 있어서', count: 388 },
      { value: 3, short: '부스 디자인·콘텐츠', label: '전시부스의 디자인이나 콘텐츠가 눈에 띄어서', count: 133 },
      { value: 4, short: '안내·홍보·추천', label: '행사 안내, 홍보물 또는 주변 추천을 통해 알게 되어서', count: 58 },
      { value: 5, short: '이름 처음 접함', label: '"포스코"라는 기업 이름을 처음 접하고 호기심이 생겨서', count: 30 },
    ],
    satisfactionAvg: 4.79, kgxAvg: 4.78,
    zones: [
      { code: 'kgx', label: '대한민국 산업 GX의 시작, 포스코', count: 314 },
      { code: 'carbon_free', label: '무탄소 에너지', count: 336 },
      { code: 'steel', label: 'AX·GX시대의 산업 자원, 철', count: 89 },
      { code: 'hyrex', label: '철강 탈탄소 혁신 기술', count: 147 },
      { code: 'synergy', label: 'K-GX 생태계 시너지', count: 75 },
    ],
    comments: 961,
  },
  inventory: inv,
  coupons: { activeBatches: 1, tiers: [{ tier: 'steel', prizeLabel: '아메리카노 커피', available: 18, assigned: 582, expired: 0 }] },
  sms: { today: { ok: 415, fail: 0, dryrun: 0, blockedCap: 0 }, cap: 3000, usedTowardCap: 415, usagePct: 14, live: true },
  recentErrors: [],
};

// ── 당첨자 목록 가짜 행 (WinnerRow: ops-cms.ts:46-60). 이름·전화는 원래 화면에 없다 → 확인코드(가짜)·경품·시각만
const AL = 'ABCDEFGHJKMNPQRSTUVWXYZ';
let seed = 20260917;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const code = () => `${AL[Math.floor(rnd() * AL.length)]}${AL[Math.floor(rnd() * AL.length)]}${AL[Math.floor(rnd() * AL.length)]}-${Math.floor(2000 + rnd() * 7999)}`;
const PRIZE = { gold: '경량 5단 양우산', blue: '탁상 미니선풍기', steel: '아메리카노 커피' };
const DAYS = { 1: '2026-09-16', 2: '2026-09-17', 3: '2026-09-18' };
function rows(n, { day, tier, claimed } = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const d = day || 1 + Math.floor(rnd() * 3);
    const t = tier || (['gold', 'blue', 'steel', 'steel', 'steel'][Math.floor(rnd() * 5)]);
    const hh = 1 + Math.floor(rnd() * 5), mm = Math.floor(rnd() * 60); // UTC 01~05시 = KST 10~14시
    const awardedAt = `${DAYS[d]}T0${hh}:${String(mm).padStart(2, '0')}:20.000Z`;
    const isClaimed = claimed === undefined ? rnd() > 0.05 : claimed;
    const claimedAt = isClaimed ? `${DAYS[d]}T0${hh}:${String(Math.min(59, mm + 3)).padStart(2, '0')}:41.000Z` : null;
    out.push({
      claimCode: code(), tier: t, prize: PRIZE[t], dayNo: d, awardedAt, claimedAt,
      claimedBy: isClaimed ? (t === 'steel' ? 'coupon' : 'staff') : null,
      couponAssigned: t === 'steel' && isClaimed, couponAssignedAt: t === 'steel' && isClaimed ? claimedAt : null,
      replaceCount: 0, lastReplacedAt: null,
    });
  }
  return out.sort((a, b) => (a.awardedAt < b.awardedAt ? 1 : -1));
}

// 설문 주관식(가짜 문구 — 실제 참여자 글이 아니다)
const COMMENTS = ['수소환원제철 설명이 쉬웠어요', '퀴즈가 재미있었습니다', '전시 동선이 편했어요', '아이와 함께 즐겼어요', '철강이 이렇게 쓰이는 줄 몰랐어요', '포스코의 탄소중립 노력이 인상 깊었습니다', '체험 위주라 좋았어요', '좋아요'];
const comments = COMMENTS.concat(COMMENTS).map((text, i) => ({ seq: 961 - i, createdAt: `2026-09-18T0${1 + (i % 4)}:${String(10 + i * 3).padStart(2, '0')}:00.000Z`, text }));

const browser = await launch();
try {
  const st = makeState();
  setObj(st.opsStats, { ok: true, snapshot });
  setObj(st.opsWinners, { ok: true, rows: rows(14), total: 960 });
  setObj(st.opsSurvey, { ok: true, survey: snapshot.survey, comments });
  const { ctx, page } = await newContext(browser, 'desktop', { project: 'posco', clock: true, guard: makeGuard(st) });
  await ctx.addCookies([{ name: 'posco_ops', value: jwt, url: BASE }]);

  // ── 현황판: 서버 첫 렌더는 닫힌 DB 라 0 → 30초 폴링을 발화시켜 가짜 스냅샷으로 채운다
  await page.goto(`${BASE}/posco-ox/ops`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(ST('ops-board'), { timeout: 30000 });
  await freeze(page);
  await adv(page, 30500);
  await page.waitForFunction(() => document.querySelector('[data-px="stat-participants-today"]')?.textContent?.includes('201'), null, { timeout: 15000 });
  await adv(page, 1000);
  await capturePage(page, 'ops-board');
  log('ops-board done');

  // 일자별 경품 배분 = 재고 그리드(티어 3 × 일차 3). 그리드 섹션만 화면에 맞춰 view, 섹션 잘라낸 것이 full
  await page.evaluate(() => {
    const td = document.querySelector('[data-px="stock-gold-main-d1"]');
    const sec = td.closest('table').parentElement.parentElement;
    window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' });
  });
  await page.waitForTimeout(600);
  const clip = await page.evaluate(() => {
    const sec = document.querySelector('[data-px="stock-gold-main-d1"]').closest('table').parentElement.parentElement;
    const r = sec.getBoundingClientRect();
    return { x: Math.max(0, Math.floor(r.left - 16)), y: Math.max(0, Math.floor(r.top - 16)), width: Math.ceil(r.width + 32), height: Math.ceil(r.height + 32) };
  });
  const sy = await page.evaluate(() => Math.round(window.scrollY));
  await saveShot(page, path.join(ROOT, 'posco/desktop/ops-stock-view.png'), { expectScroll: sy });
  await saveShot(page, path.join(ROOT, 'posco/desktop/ops-stock-full.png'), { clip, kind: 'clip', expectScroll: sy, note: '재고 그리드 섹션만 잘라낸 것(전체 화면은 ops-board-full.png)' });
  log('ops-stock done');

  // ── 당첨자 목록 + 필터 흐름
  await page.goto(`${BASE}/posco-ox/ops/winners`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(ST('ops-winners'), { timeout: 30000 });
  await freeze(page);
  await page.waitForSelector(ST('winner-row'));
  await adv(page, 800);
  await capturePage(page, 'ops-winners');
  const flow = await startFlow(page, 'winners-filter');
  await flow.step('all');
  setObj(st.opsWinners, { ok: true, rows: rows(14, { day: 2 }), total: 380 });
  await page.click('text=DAY 2');
  await sleep(500); await adv(page, 800);
  await flow.step('day2');
  setObj(st.opsWinners, { ok: true, rows: rows(14, { day: 2, tier: 'steel' }), total: 240 });
  await page.click('text=스틸');
  await sleep(500); await adv(page, 800);
  await flow.step('day2-steel');
  setObj(st.opsWinners, { ok: true, rows: rows(3, { day: 2, tier: 'steel', claimed: false }), total: 3 });
  await page.click('text=미수령');
  await sleep(500); await adv(page, 800);
  await flow.step('day2-steel-unclaimed');
  log('winners done');

  // ── 설문 집계
  await page.goto(`${BASE}/posco-ox/ops/survey`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(ST('ops-survey'), { timeout: 30000 });
  await freeze(page);
  await page.waitForSelector(ST('survey-comment'));
  await adv(page, 800);
  await capturePage(page, 'ops-survey');
  log('survey done');
  await ctx.close();
} finally {
  await browser.close();
}
