// jipyeong 촬영 공통 — 운영 URL(GET 만 닿음) + 가짜 응답 + devicemotion shim + 시계 고정.
// 행사 종료(10/30)라 서버 API 는 410 이다 → 모든 /jipyeong-shake/api/** 를 가짜 성공 응답으로 가로채고,
// 클라이언트 시계를 행사 기간(2026-10-20 14:00 KST)으로 맞춰 게이트가 열린 화면을 찍는다.
import { launch, newContext } from '../../tools/lib.mjs';

export const HOST = 'jipyeong.mai-eventic.com';
export const BASE = `https://${HOST}/jipyeong-shake`;
export const FAKE_NOW = Date.parse('2026-10-20T14:00:00+09:00');
const API = `${HOST}/jipyeong-shake/api/`;
const FAKE_PHONE = '01000000000';

export const GUARD = {
  fake: [
    // RECON 6절의 가짜 성공 응답(코드 근거: otp.ts requestOtp/confirmOtp, entry-client.ts confirmed())
    { match: `${API}otp/send`, method: 'POST', json: { ok: true, expiresAt: FAKE_NOW + 10 * 60 * 1000, resendAfter: 30 } },
    { match: `${API}otp/verify`, method: 'POST', json: { ok: true, token: `${FAKE_PHONE}.${Math.floor(FAKE_NOW / 1000) + 3600}.fake` } },
    { match: `${API}entry`, method: 'POST', json: { ok: true, duplicate: false, entryId: '00000000-0000-4000-8000-000000000001', createdAt: new Date(FAKE_NOW).toISOString(), shortId: '00000000', sig: 'x' } },
    { match: `${API}client-error`, json: { ok: true } },
    // 외부 스크립트: GTM(운영 GA 오염 방지)·카카오 SDK(없으면 share.ts 가 목 경로로 완료까지 간다)는 빈 스크립트로
    { match: 'googletagmanager.com', contentType: 'application/javascript', body: '' },
    { match: 'kakaocdn.net', contentType: 'application/javascript', body: '', headers: { 'access-control-allow-origin': '*' } },
  ],
  // GET 인데 서버가 쓰는 것·API 의 모든 GET 은 가짜 200(열지 않는다). 비GET 은 lib 기본이 전부 가짜 200.
  blockGet: [API, `${HOST}/jipyeong-shake/video`],
};

export const REDACT_PARTICIPANT = {
  names: ['[data-jp="done-name"]', '[data-jp="gate-name"]'],
  fake: [{ selector: '[data-jp="done-phone"]', value: '010-****-****' }],
};

// 헤드리스 Chromium 에는 DeviceMotionEvent 가 없다 → 센서 지원 기기처럼 보이게 shim(RECON 4절).
// __jpFrame(amp): 60Hz 한 프레임 — a = amp·sin(2π·3.6Hz·t), 중력 y=-9.81. amp 0 = 정지 이벤트.
// __noLiveInput: lib 의 input 가림 리스너가 React 상태(전화번호)를 마스킹 값으로 덮지 않게 하는 스위치(타이핑 중 true).
export const SHIM = `(() => {
  class DME extends Event { constructor(t, i) { super(t, i); this.acceleration = (i && i.acceleration) || null; this.accelerationIncludingGravity = (i && i.accelerationIncludingGravity) || null; this.rotationRate = null; this.interval = 16; } }
  window.DeviceMotionEvent = DME;
  window.__jp = { n: 0 };
  window.__jpFrame = (amp) => {
    const a = amp * Math.sin(2 * Math.PI * (window.__jp.n * 3.6) / 60);
    window.dispatchEvent(new DME('devicemotion', { accelerationIncludingGravity: { x: a, y: -9.81, z: 0 }, acceleration: { x: a, y: 0, z: 0 } }));
    window.__jp.n++;
  };
})();`;
export const NO_LIVE_INPUT = `(() => {
  const orig = document.addEventListener.bind(document);
  document.addEventListener = (t, l, o) => (t === 'input' && o === true ? orig(t, (e) => { if (!window.__noLiveInput) l(e); }, o) : orig(t, l, o));
})();`;

// 참여자(모바일 390) 컨텍스트. sensor=false 면 shim 없이(= '꾹 눌러' pointer 모드).
export async function participant(browser, { sensor = true, clock = true } = {}) {
  const { ctx, page } = await newContext(browser, 'mobile', { project: 'jipyeong', clock, guard: GUARD, redact: REDACT_PARTICIPANT });
  await ctx.addInitScript(NO_LIVE_INPUT);
  if (sensor) await ctx.addInitScript(SHIM);
  if (clock) await page.clock.setSystemTime(FAKE_NOW);
  // 진행 중인 CSS 애니메이션(섞임 게이지 스트라이프 등)이 사라지지 않게 — lib 기본 animations:'disabled' 는 무한 애니메이션을 취소한다.
  const shot = page.screenshot.bind(page);
  page.screenshot = (o = {}) => shot({ ...o, animations: 'allow' });
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message.slice(0, 160)));
  return { ctx, page };
}

export async function openLanding(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('html[data-jp-ready="1"]', { timeout: 60000 });
  await page.waitForSelector('[data-jp="landing-start"]', { timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
}

// 시계를 멈추고(pauseAt) 1/60초씩 진행하며 devicemotion 을 먹인다. ampAt(tMs) → amp (0 = 정지 이벤트)
export class Driver {
  constructor(page) { this.page = page; this.elapsed = 0; this.paused = false; }
  async pause() {
    if (this.paused) return;
    for (let k = 0; ; k++) {
      try { await this.page.clock.pauseAt((await this.page.evaluate(() => Date.now())) + 400 + k * 400); break; }
      catch (e) { if (k >= 5) throw e; }
    }
    this.paused = true;
  }
  async resume() { if (this.paused) { await this.page.clock.resume(); this.paused = false; } }
  // ms 동안 프레임 진행. amp 는 숫자 또는 (tSinceStartMs)=>숫자. 이벤트는 매 프레임.
  async run(ms, amp = 0, { events = true } = {}) {
    await this.pause();
    const frames = Math.round((ms / 1000) * 60);
    const t0 = this.elapsed;
    for (let i = 0; i < frames; i++) {
      if (events) {
        const a = typeof amp === 'function' ? amp(this.elapsed) : amp;
        await this.page.evaluate((v) => window.__jpFrame(v), a);
      }
      const target = t0 + Math.round(((i + 1) * 1000) / 60);
      await this.page.clock.runFor(target - this.elapsed);
      this.elapsed = target;
    }
  }
}
export const ampWobble = (t) => 14 + 4 * Math.sin((2 * Math.PI * 0.7 * t) / 1000); // 10~18 m/s²

export { launch };
