// seq/ — 60fps 연출 영상 2개(page.clock 1/60초씩 runFor + getAnimations 동기, 프레임마다 가림·PII 검사)
//  1) draw-reveal : 경품 추첨 연출(스캔 1.3s → 블룸 0.5s → 플래시 0.12s → 카드 spring) 4.0초
//  2) quiz-correct: OX 퀴즈 정답 선택 → 판정 → 정답 피드백 시트 2.4초
// 실행: cd ~/prism-media && node posco/capture/40-seq.mjs [draw|quiz]
import { launch, mobile, makeState, setObj, boot, sleep, recordSeq, BASE, CODES, FAKE_TOKEN, log } from './common.mjs';

const which = process.argv[2] || 'all';
const ST = (s) => `[data-px="${s}"]`;
const browser = await launch();
try {
  if (which === 'all' || which === 'draw') {
    const st = makeState();
    setObj(st.session, { ok: true, authed: true, hasSurvey: true, hasAward: true, claimToken: FAKE_TOKEN, name: '김○○', winNotified: false, event: { state: 'open', dayNo: 2 } });
    setObj(st.draw, { ok: true, tier: 'steel', claimCode: CODES.steel });
    const { ctx, page } = await mobile(browser, st);
    await boot(page, `${BASE}/posco-ox`, ST('draw-confirm'));
    await sleep(2500); // 대기 화면 진입 애니메이션이 끝나도록
    const r = await recordSeq(page, 'draw-reveal', { durationMs: 4000, start: async () => { await page.click(ST('draw-confirm')); } });
    log('draw-reveal', r.frames, 'frames');
    await ctx.close();
  }
  if (which === 'all' || which === 'quiz') {
    const st = makeState();
    const { ctx, page } = await mobile(browser, st);
    await boot(page, `${BASE}/posco-ox`, ST('send'));
    await sleep(1500);
    await page.fill(ST('name-input'), '김○○');
    await page.fill(ST('phone-input'), '01012345678');
    await page.click(ST('consent'));
    await page.click(ST('send'));
    await page.waitForSelector(ST('sent-to'));
    await sleep(1500);
    await page.click('input.px-otp-input', { force: true });
    await page.keyboard.type('483917', { delay: 60 });
    await page.waitForSelector(ST('zoning-start'), { timeout: 20000 });
    await sleep(1800);
    await page.click(ST('zoning-start'));
    await page.waitForSelector(ST('ox-O'), { timeout: 20000 });
    await sleep(2000);
    const r = await recordSeq(page, 'quiz-correct', { durationMs: 2400, start: async () => { await page.click(ST('ox-O')); } });
    log('quiz-correct', r.frames, 'frames');
    await ctx.close();
  }
} finally {
  await browser.close();
}
