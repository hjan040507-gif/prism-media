// jipyeong 참여자 화면(모바일 390) 촬영.  실행: cd ~/prism-media && node jipyeong/capture/mobile.mjs <main|types|pointer|seq>
//   main    랜딩→흔들기 안내→흔드는 중(상태 흐름)→결과(calm)→게이트(상태 흐름)→초대장 6종(상태 흐름)→완료
//   types   결과 4종(hype·story·cheers·balance) — 유형은 흔든 초로 정해지므로 그 길이만큼 실제로 흔든다
//   pointer '꾹 눌러 참여'(센서 없는 환경 = shim 없음)
//   seq     흔들기→섞임 / 섞임→결과 영상(60fps, 가상 시간)
import { newContext, capturePage, startFlow, recordSeq, ROOT } from '../../tools/lib.mjs';
import { launch, participant, openLanding, Driver, ampWobble, BASE } from './common.mjs';

const part = process.argv[2] || 'main';
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// 흔든 이벤트 길이(초) → 표시 초 = 이벤트 길이 + 입력 꺼짐 확정 꼬리(0.35s). 구간 중앙을 겨냥(RECON 3절)
const SHAKE_FOR = { hype: 0.4, story: 1.2, cheers: 2.2, balance: 3.2, calm: 4.2 };

async function toShakeGuide(page) {
  await openLanding(page);
  await page.click('[data-jp="landing-start"]');
  await page.waitForSelector('[data-jp="motion-start"]', { timeout: 15000 });
  await page.waitForTimeout(900);
}

// 흔들고 → 놓고 → 결과 화면이 다 그려질 때까지 시계를 진행. 끝나면 시계를 다시 흐르게 둔다.
async function shakeToResult(page, seconds) {
  const d = new Driver(page);
  await page.click('[data-jp="motion-start"]');
  await d.run(50, 0);
  await d.run(seconds * 1000, ampWobble);
  await d.run(2000, 0); // 정지 이벤트 ≥1.9s → done
  await d.run(2600, 0, { events: false }); // 정착 0.6 + 전환 0.32 + 카운트업·reveal
  await d.resume();
  await page.waitForSelector('[data-jp="result"]', { timeout: 10000 });
  await page.waitForTimeout(1200);
  return d;
}

async function resultShot(page, id) {
  const t = await page.getAttribute('[data-jp="result"]', 'data-jp-type');
  const sec = await page.evaluate(() => document.querySelector('[data-jp="result-sec"]')?.textContent);
  log(`result ${id}: type=${t} sec=${sec}`);
  if (t !== id) throw new Error(`유형 불일치 기대 ${id} 실제 ${t} (sec ${sec})`);
  return capturePage(page, `result-${id}`);
}

const browser = await launch();
try {
  if (part === 'main') {
    const { ctx, page } = await participant(browser);
    await openLanding(page);
    await capturePage(page, 'landing');
    log('landing 완료');
    await page.click('[data-jp="landing-start"]');
    await page.waitForSelector('[data-jp="motion-start"]', { timeout: 15000 });
    await page.waitForTimeout(900);
    await capturePage(page, 'shake-guide');
    log('shake-guide 완료');

    // ── 상태 흐름 ①: 흔들기 진행(안내 → 흔드는 중 초반 → 중반 → 섞임 연출 후반 → 완료)
    const f1 = await startFlow(page, 'shake-progress', { scrollY: 0 });
    await f1.step('guide');
    const d = new Driver(page);
    await page.click('[data-jp="motion-start"]');
    await d.run(50, 0);
    await d.run(850, ampWobble);
    await f1.step('shaking-early');
    await d.run(1350, ampWobble);
    await f1.step('shaking-mid');
    await d.run(1600, ampWobble);
    await f1.step('mixing-late');
    await d.run(1400, ampWobble); // 누적 5.0 도달 → done (정착 연출 중 화면)
    await f1.step('mix-done');
    log('state flow shake-progress 완료');
    await d.run(2800, 0, { events: false });
    await d.resume();
    await page.waitForSelector('[data-jp="result"]', { timeout: 10000 });
    await page.waitForTimeout(1200);
    await resultShot(page, 'calm');

    // ── 게이트: 동의(19세) → 이름·번호 → 인증번호
    await page.click('[data-jp="result-share"]');
    await page.waitForSelector('[data-jp="gate"][data-jp-step="1"]', { timeout: 10000 });
    await page.waitForTimeout(900);
    await capturePage(page, 'gate-consent');
    const f2 = await startFlow(page, 'gate-input', { scrollY: 0 });
    await f2.step('unchecked');
    await page.click('[data-jp="gate-agree-age"]');
    await f2.step('age-checked');
    await page.click('[data-jp="gate-agree-all"]');
    await f2.step('all-agreed');
    await page.click('[data-jp="gate-submit"]');
    await page.waitForSelector('[data-jp="gate"][data-jp-step="2"]', { timeout: 10000 });
    await page.waitForTimeout(700);
    await page.evaluate(() => { window.__noLiveInput = true; });
    await page.fill('[data-jp="gate-name"]', '김하나');
    await page.fill('[data-jp="gate-phone"]', '01000000000');
    await page.evaluate(() => { window.__noLiveInput = false; });
    await f2.step('phone-entered');
    await capturePage(page, 'gate-phone');
    await page.evaluate(() => { window.__noLiveInput = true; });
    await page.click('[data-jp="gate-send"]');
    await page.waitForSelector('[data-jp="gate"][data-jp-step="3"]', { timeout: 10000 });
    await page.waitForTimeout(900);
    await f2.step('otp-requested');
    await capturePage(page, 'gate-otp');
    await page.fill('[data-jp="gate-otp"]', '000000');
    await page.waitForSelector('[data-jp="gate-verified"]', { timeout: 10000 });
    await page.evaluate(() => { window.__noLiveInput = false; });
    await f2.step('otp-verified');
    log('state flow gate-input 완료');

    // ── 초대장: 6종 각각 + 넘기기 상태 흐름
    await page.click('[data-jp="gate-submit"]');
    await page.waitForSelector('[data-jp="message"]', { timeout: 10000 });
    await page.waitForTimeout(1200);
    const f3 = await startFlow(page, 'invite-cards', { scrollY: 0 });
    const names = {};
    for (let n = 1; n <= 6; n++) {
      await page.click(`[data-jp="message-option"][data-jp-id="${n}"]`);
      await page.waitForTimeout(900);
      await f3.step(`card-${n}`);
    }
    for (let n = 1; n <= 6; n++) {
      await page.click(`[data-jp="message-option"][data-jp-id="${n}"]`);
      await page.waitForTimeout(900);
      await capturePage(page, `invite-${n}`);
      names[n] = n;
    }
    log('초대장 6종 완료');
    await page.click('[data-jp="message-option"][data-jp-id="1"]');
    await page.waitForTimeout(600);
    await page.click('[data-jp="message-cta"]');
    await page.waitForSelector('[data-jp="done"]', { timeout: 15000 });
    await page.waitForTimeout(2500);
    await capturePage(page, 'done');
    log('done 완료');
    log('intercepted', JSON.stringify(ctx.__prismStats.list), 'allowed', JSON.stringify(ctx.__prismStats.allowed), 'trackers', ctx.__prismStats.trackers);
  }

  if (part === 'types') {
    for (const id of ['hype', 'story', 'cheers', 'balance']) {
      const { ctx, page } = await participant(browser);
      await toShakeGuide(page);
      await shakeToResult(page, SHAKE_FOR[id]);
      await resultShot(page, id);
      await ctx.close();
    }
  }

  if (part === 'pointer') {
    // 센서 없이 진행하는 길: 안내 화면의 폴백 링크("막걸리 병을 꾹 눌러 진행하기") → pointer 모드 = '꾹 눌러 참여' 화면
    const { ctx, page } = await participant(browser);
    await toShakeGuide(page);
    const f = await startFlow(page, 'hold-to-join', { scrollY: 0 });
    await f.step('sensor-guide');
    await page.click('[data-jp="motion-fallback"]');
    await page.waitForSelector('[data-jp="shake-hint"]', { timeout: 15000 });
    await page.waitForTimeout(1200);
    log('입력 모드', await page.getAttribute('[data-jp-input]', 'data-jp-input').catch(() => null));
    await f.step('pointer-mode');
    await capturePage(page, 'hold-to-join');
    const box = await page.locator('[data-jp="shake-area"]').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(1500);
    await f.step('holding');
    await page.mouse.up();
    log('intercepted', JSON.stringify(ctx.__prismStats.list));
  }

  if (part === 'seq') {
    // seq 1: 안내 화면에서 시작 → 5초 흔들기(섞임) → 정착 직전까지 6초
    {
      const { ctx, page } = await participant(browser);
      await toShakeGuide(page);
      await recordSeq(page, 'shake-mix', {
        durationMs: 6000,
        start: async () => { await page.click('[data-jp="motion-start"]'); },
        perFrame: async (i, t) => { await page.evaluate((a) => window.__jpFrame(a), t < 60 ? 0 : ampWobble(t)); },
      });
      log('seq shake-mix 완료');
      await ctx.close();
    }
    // seq 2: 3.9초 흔든 상태(미리 감기, 녹화 아님)에서 시작 → 5.0 도달 → 정착 → 결과 카운트업·reveal
    {
      const { ctx, page } = await participant(browser);
      await toShakeGuide(page);
      const d = new Driver(page);
      await page.click('[data-jp="motion-start"]');
      await d.run(50, 0);
      await d.run(3900, ampWobble);
      let base = d.elapsed;
      await recordSeq(page, 'mix-to-result', {
        durationMs: 5500,
        perFrame: async (i, t) => { await page.evaluate((a) => window.__jpFrame(a), t < 1150 ? ampWobble(base + t) : 0); },
      });
      log('seq mix-to-result 완료');
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}
log('DONE', part);
