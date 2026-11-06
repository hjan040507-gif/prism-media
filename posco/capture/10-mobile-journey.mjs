// 모바일 390 — 커피(steel) 참여자 한 사람의 전 과정: 랜딩 → 인증번호 → 존 안내 → 퀴즈 → 미션 → 설문 → 추첨 → 당첨 → 문자 후 화면
// 실행: cd ~/prism-media && node posco/capture/10-mobile-journey.mjs   (서버: tmp/posco-src next start -p $POSCO_PORT)
import { launch, mobile, makeState, setObj, boot, freeze, adv, sleep, capturePage, startFlow, BASE, CODES, FAKE_TOKEN, log } from './common.mjs';

const st = makeState();
const browser = await launch();
const ST = (sel) => `[data-px="${sel}"]`;

async function advUntil(page, sel, { step = 250, max = 40 } = {}) {
  for (let i = 0; i < max; i++) {
    if (await page.$(sel)) return true;
    await adv(page, step);
    await sleep(60);
  }
  throw new Error(`못 찾음: ${sel}`);
}
const click = async (page, sel) => { await page.click(sel, { timeout: 10000 }); };

try {
  const { ctx, page } = await mobile(browser, st);
  await boot(page, `${BASE}/posco-ox`, ST('send'));
  await freeze(page);
  await adv(page, 1800);

  // ── 1. 랜딩(=문자 인증 번호 입력 화면)
  await capturePage(page, 'landing');
  log('landing done');

  // ── 2. 문자 인증 흐름
  let flow = await startFlow(page, 'verify-code');
  await flow.step('empty');
  await page.fill(ST('name-input'), '김○○');
  await page.fill(ST('phone-input'), '01012345678');
  await click(page, ST('consent'));
  await adv(page, 400);
  await flow.step('filled-consent');
  await click(page, ST('send'));
  await advUntil(page, ST('sent-to'));
  await adv(page, 1500);
  await flow.step('code-empty');
  await page.click('input.px-otp-input', { force: true });
  await page.keyboard.type('483', { delay: 60 });
  await adv(page, 400);
  await flow.step('code-partial');
  await page.keyboard.type('917', { delay: 60 });
  await sleep(500);
  await adv(page, 700);
  await flow.step('verified');
  log('verify flow done');
  await capturePage(page, 'code'); // 인증 성공 상태의 코드 화면

  // ── 3. 존 안내
  await advUntil(page, ST('zoning-start'), { step: 300, max: 60 });
  await adv(page, 1800);
  await capturePage(page, 'zoning');
  log('zoning done');

  // ── 4. 퀴즈 5문항 (Q1 정답 / Q2 오답→다시 풀기→정답 / Q3~Q5 정답). 답안키 O·X·O·O·O
  await click(page, ST('zoning-start'));
  await advUntil(page, ST('statement'), { step: 300, max: 60 });
  await adv(page, 1500);
  await capturePage(page, 'quiz');
  flow = await startFlow(page, 'quiz-correct');
  await flow.step('asking');
  await click(page, ST('ox-O'));
  await adv(page, 120);
  await flow.step('picked');
  await adv(page, 1600);
  await flow.step('correct-feedback');
  await click(page, ST('verdict-cta'));
  await adv(page, 1500);

  flow = await startFlow(page, 'quiz-wrong');
  await flow.step('asking');
  await click(page, ST('ox-O')); // Q2 정답은 X → 오답
  await adv(page, 120);
  await flow.step('picked');
  await adv(page, 1600);
  await flow.step('wrong-feedback');
  await click(page, ST('verdict-cta')); // 다시 풀기
  await adv(page, 1500);
  await flow.step('retry');
  await click(page, ST('ox-X'));
  await adv(page, 1900);
  await click(page, ST('verdict-cta'));
  await adv(page, 1500);
  for (const a of ['O', 'O', 'O']) {
    await click(page, ST(`ox-${a}`));
    await adv(page, 1900);
    await click(page, ST('verdict-cta'));
    await adv(page, 1500);
  }
  log('quiz done');

  // ── 5. 미션 완료
  await advUntil(page, ST('mission-next'), { step: 300, max: 60 });
  await adv(page, 2500);
  await capturePage(page, 'mission');
  await click(page, ST('mission-next'));
  await adv(page, 1500);

  // ── 6. 설문 5문항
  await advUntil(page, ST('survey-q'), { step: 300, max: 60 });
  await adv(page, 1200);
  flow = await startFlow(page, 'survey');
  await flow.step('q1-choice');
  // 문항 순서: q1 동기(motive) → q2 척도 → q3 존 → q4 척도 → q5 자유서술. 직전 문항이 사라진 뒤 다음 보기를 누른다(퇴장 애니메이션 중 중복 클릭 방지).
  const pickStep = async (sel, { waitGone = true } = {}) => {
    for (let i = 0; i < 80; i++) {
      const el = await page.$(sel);
      if (el && (await el.isVisible())) { await el.click(); return; }
      await adv(page, 200);
      await sleep(40);
    }
    throw new Error(`survey: ${sel} 못 찾음`);
  };
  const waitGone = async (sel) => {
    for (let i = 0; i < 80; i++) {
      if (!(await page.$(sel))) return;
      await adv(page, 200);
      await sleep(40);
    }
    throw new Error(`survey: ${sel} 안 사라짐`);
  };
  await pickStep(ST('motive-2'));
  await adv(page, 120);
  await flow.step('q1-picked');
  await waitGone(ST('motive-2'));
  await adv(page, 1500);
  await flow.step('q2-scale');
  await pickStep(ST('scale-5'));
  await waitGone(ST('scale-5'));
  await adv(page, 1000);
  await pickStep(ST('zone-carbon_free'));
  await waitGone(ST('zone-carbon_free'));
  await adv(page, 1000);
  await pickStep(ST('scale-5'));
  await waitGone(ST('scale-5'));
  await adv(page, 1000);
  await advUntil(page, ST('q5-text'), { step: 250, max: 60 });
  await adv(page, 1200);
  await flow.step('q5-empty');
  await page.fill(ST('q5-text'), '전시가 한눈에 들어와서 좋았어요');
  await adv(page, 300);
  await flow.step('q5-typed');
  await capturePage(page, 'survey');
  log('survey done');
  await click(page, ST('q5-submit'));

  // ── 7. 경품 추첨 연출 (스캔 1.3s → 블룸 0.5s → 플래시 0.12s → 카드 spring)
  try {
    await advUntil(page, ST('draw-confirm'), { step: 300, max: 60 });
  } catch (e) {
    const info = await page.evaluate(() => ({ px: [...document.querySelectorAll('[data-px]')].map((n) => n.getAttribute('data-px')), text: document.body.innerText.slice(0, 400) }));
    console.log('DIAG', JSON.stringify(info));
    throw e;
  }
  await adv(page, 1500);
  await capturePage(page, 'draw-wait');
  flow = await startFlow(page, 'draw-reveal');
  await flow.step('wait');
  await click(page, ST('draw-confirm'));
  await adv(page, 650);
  await flow.step('scan');
  await adv(page, 850);
  await flow.step('bloom');
  await adv(page, 1300);
  await flow.step('prize');
  await adv(page, 1500);
  await capturePage(page, 'prize-coffee');
  log('draw done');

  // ── 8. 문자 안내(EndScreen): 재조회 응답에 claimToken 이 있어야 쿠폰 열기 버튼이 그려진다
  setObj(st.session, { ok: true, authed: true, hasSurvey: true, hasAward: true, claimToken: FAKE_TOKEN, name: '김○○', winNotified: true, event: { state: 'open', dayNo: 2 } });
  await click(page, ST('claim'));
  await advUntil(page, ST('end'), { step: 300, max: 60 });
  await advUntil(page, ST('coupon-open'), { step: 300, max: 40 });
  await adv(page, 1500);
  await capturePage(page, 'end-coffee');
  log('end done');
  await ctx.close();
} finally {
  await browser.close();
}
