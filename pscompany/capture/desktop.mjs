// pscompany 데스크톱 촬영 — 페이지 3(+제출 후 1) · 상태 흐름 2 · seq 1. 운영 https://pscp.to 를 GET 으로만, 제출은 서버 액션 POST 를 guard 로 가로챈다.
// 실행: cd ~/prism-media && node pscompany/capture/desktop.mjs [pages|flows|seq]
import { launch, capturePage, startFlow, recordSeq, saveShot, liveRedact, log } from '../../tools/lib.mjs';
import { ctxFor, readBuildId, BASE } from './common.mjs';
import { EXTRA_REDACT, BLUR_CSS } from './extra.mjs';

const part = process.argv[2] || 'all';
const want = (p) => part === 'all' || part === p || (part === 'fs' && p !== 'pages');
const bid = await readBuildId();
log('buildId', bid);

const FAKE = { name: '김○○', age: '24', phone: '010-0000-0000', experience: '방송 경력 없음', intro: '방송 경험은 없지만 새로운 도전을 하고 싶습니다. 성실하게 임하겠습니다.' };

async function open(page, route) {
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200); // 하이드레이션 뒤에 가림을 건다(React #418 방지)
  await page.addStyleTag({ content: BLUR_CSS });
  await page.evaluate(EXTRA_REDACT);
  await liveRedact(page, true);
}
// 전화번호는 검증을 통과해야 해서 가림을 잠깐 끄고 넣는다. 화면에는 곧바로 010-****-**** 로 보이고 RHF 값은 그대로 남는다.
async function typePhone(page) {
  await liveRedact(page, false);
  await page.fill('#recruit-phone', FAKE.phone);
  await liveRedact(page, true);
}
// RHF 는 제출할 때 입력칸의 현재 값을 읽는다 — 가림이 010-****-**** 로 바꿔 둔 값은 검증(숫자·-·+·공백·괄호만)에 걸린다.
// 그래서 제출 순간에만 가림을 끄고 더미 번호를 넣어 누른 뒤 곧바로 다시 가린다(요청은 guard 가 가로채고, 폼은 제출 뒤 비워진다).
async function submitNow(page, { viaEval = false } = {}) {
  await liveRedact(page, false);
  if (viaEval) {
    await page.evaluate((v) => {
      const el = document.querySelector('#recruit-phone');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('form button[type=submit]').click();
    }, FAKE.phone);
  } else {
    await page.fill('#recruit-phone', FAKE.phone);
    await page.click('form button[type=submit]', { noWaitAfter: true });
  }
  await liveRedact(page, true);
}
const top = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return Math.round(r.top + window.scrollY); }, sel);

const browser = await launch();
try {
  if (want('pages')) {
    const { page } = await ctxFor(browser, 'desktop', { redact: {}, buildId: bid });
    for (const [route, name] of [['/recruit', 'recruit'], ['/recruit/sales', 'recruit-sales'], ['/manage/login', 'manage-login']]) {
      await open(page, route);
      await capturePage(page, name);
      log('page', name);
    }
    await page.context().close();
  }

  if (want('flows')) try {
    const { page, ctx } = await ctxFor(browser, 'desktop', { redact: {}, buildId: bid });
    await open(page, '/recruit');
    const formTop = await top(page, 'form');
    const S1 = formTop - 33; // 이름 라벨이 고정 헤더(65px) 바로 아래
    const f1 = await startFlow(page, 'apply-form', { scrollY: S1 });
    await f1.step('empty');
    await page.click('label:has(#category-personal)');
    await f1.step('category-selected');
    await page.fill('#recruit-name', FAKE.name);
    await page.fill('#recruit-age', FAKE.age);
    await page.click('label:has(#gender-female)');
    await typePhone(page);
    await f1.step('basic-info');
    await page.fill('#recruit-experience', FAKE.experience);
    await page.fill('#recruit-introduction', FAKE.intro);
    await f1.step('intro-filled');

    const S2 = (await top(page, '#recruit-agreed')) - 600; // 경력·자기소개·선호 연락·동의·제출 버튼이 한 화면
    const f2 = await startFlow(page, 'apply-submit', { scrollY: S2 });
    await f2.step('before-consent');
    await page.click('label:has(#preferred_contact-kakao)');
    await f2.step('contact-method');
    await page.check('#recruit-agreed');
    await f2.step('ready-to-submit');
    log('flows done; intercepted so far', JSON.stringify(ctx.__prismStats.list), 'POST seen', page.__reqs.filter((r) => r.m !== 'GET').length);

    // 제출(가로챈 가짜 성공) 직후 화면 — 카드 위치로 스크롤해 한 장
    await submitNow(page);
    await page.waitForSelector('text=지원이 접수되었습니다', { timeout: 10000 });
    await page.waitForTimeout(1200);
    const cardTop = await page.evaluate(() => { const el = [...document.querySelectorAll('h1,h2,h3,h4,p,div')].find((e) => e.children.length === 0 && e.textContent.includes('지원이 접수되었습니다')); const r = el.getBoundingClientRect(); return Math.round(r.top + window.scrollY); });
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.max(0, cardTop - 250));
    await page.waitForTimeout(600);
    await saveShot(page, new URL('../desktop/recruit-submitted-view.png', import.meta.url).pathname, { kind: 'page', note: '가로챈 가짜 성공 응답 후 성공 카드(RSC flight 0:{a,f,b}+1:{ok:true})' });
    log('submitted shot; intercepted', JSON.stringify(ctx.__prismStats.list), 'allowed', JSON.stringify(ctx.__prismStats.allowed));
    await ctx.close();
  } catch (e) { console.log('FLOWS ERROR', e.message); process.exitCode = 1; }

  if (want('seq')) try {
    // 제출 성공 카드 등장 — 폼을 채운 뒤 시계를 멈추고 제출 클릭부터 1/60초씩
    const { page, ctx } = await ctxFor(browser, 'desktop', { redact: {}, buildId: bid, clock: true });
    await open(page, '/recruit');
    await page.click('label:has(#category-personal)');
    await page.fill('#recruit-name', FAKE.name);
    await page.click('label:has(#gender-female)');
    await page.fill('#recruit-experience', FAKE.experience);
    await page.fill('#recruit-introduction', FAKE.intro);
    await typePhone(page);
    await page.click('label:has(#preferred_contact-kakao)');
    await page.check('#recruit-agreed');
    const S2 = (await top(page, '#recruit-agreed')) - 600;
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), S2);
    await page.waitForTimeout(500);
    // 제출 응답을 0.33초(20프레임) 늦춰 「제출 중 → 성공 카드 등장」이 영상에 담기게 한다. 이 경로도 운영 서버로는 안 나간다(route.fulfill 가짜 응답).
    let openGate; const gate = new Promise((res) => { openGate = res; });
    const st = ctx.__prismStats;
    await page.route(/pscp\.to\/recruit$/, async (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      st.intercepted++; st.list.push('POST /recruit (fake, delayed 20 frames)');
      await gate;
      return route.fulfill({ status: 200, contentType: 'text/x-component', body: `0:{"a":"$@1","f":"","b":"${bid}"}\n1:{"ok":true}\n` });
    });
    const r = await recordSeq(page, 'submit-success', {
      durationMs: 3000,
      start: async () => { await submitNow(page, { viaEval: true }); },
      perFrame: async (i) => { if (i === 20) openGate(); },
    });
    log('seq', r.out, r.frames, 'intercepted', JSON.stringify(ctx.__prismStats.list));
    await ctx.close();
  } catch (e) { console.log('SEQ ERROR', e.message); process.exitCode = 1; }
} finally {
  await browser.close();
}
