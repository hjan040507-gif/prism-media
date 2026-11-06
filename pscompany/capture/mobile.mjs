// pscompany 모바일(390×844 @3) 촬영 — 페이지 2(/recruit, /recruit/sales) · 상태 흐름 2(같은 반응형 폼). 제출 POST 는 guard 로 가로챈다.
// 실행: cd ~/prism-media && node pscompany/capture/mobile.mjs [pages|flows]
import { launch, capturePage, startFlow, liveRedact, log } from '../../tools/lib.mjs';
import { ctxFor, readBuildId, BASE } from './common.mjs';
import { EXTRA_REDACT, BLUR_CSS } from './extra.mjs';

const part = process.argv[2] || 'all';
const want = (p) => part === 'all' || part === p;
const bid = await readBuildId();
log('buildId', bid);
const FAKE = { name: '김○○', age: '24', phone: '010-0000-0000', experience: '방송 경력 없음', intro: '방송 경험은 없지만 새로운 도전을 하고 싶습니다. 성실하게 임하겠습니다.' };

async function open(page, route) {
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.addStyleTag({ content: BLUR_CSS });
  await page.evaluate(EXTRA_REDACT);
  await liveRedact(page, true);
}
async function typePhone(page) {
  await liveRedact(page, false);
  await page.fill('#recruit-phone', FAKE.phone);
  await liveRedact(page, true);
}
const top = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return Math.round(r.top + window.scrollY); }, sel);

const browser = await launch();
try {
  if (want('pages')) {
    const { page } = await ctxFor(browser, 'mobile', { redact: {}, buildId: bid });
    for (const [route, name] of [['/recruit', 'recruit'], ['/recruit/sales', 'recruit-sales']]) {
      await open(page, route);
      await capturePage(page, name);
      log('page', name);
    }
    await page.context().close();
  }

  if (want('flows')) {
    const { page, ctx } = await ctxFor(browser, 'mobile', { redact: {}, buildId: bid });
    await open(page, '/recruit');
    const lay = await page.evaluate(() => ['#recruit-name', '#recruit-phone', '#category-personal', '#recruit-introduction', '#recruit-agreed', 'form button[type=submit]'].map((s) => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return [s, Math.round(r.top + scrollY), Math.round(r.height)]; }));
    log('layout', JSON.stringify(lay));
    // 흐름 1: 직군 선택 → 기본 정보 (이름 칸이 고정 헤더 바로 아래)
    const S1 = (await top(page, '#recruit-name')) - 110;
    const f1 = await startFlow(page, 'apply-form-mobile', { scrollY: S1 });
    await f1.step('empty');
    await page.fill('#recruit-name', FAKE.name);
    await page.fill('#recruit-age', FAKE.age);
    await page.click('label:has(#gender-female)');
    await f1.step('name-age');
    await typePhone(page);
    await f1.step('phone');
    await page.click('label:has(#category-personal)');
    await f1.step('category-selected');

    // 흐름 2: 경력·자기소개 → 선호 연락 → 동의 → 제출 직전
    await page.fill('#recruit-experience', FAKE.experience);
    await page.fill('#recruit-introduction', FAKE.intro);
    const S2 = (await top(page, '#recruit-introduction')) - 110;
    const f2 = await startFlow(page, 'apply-submit-mobile', { scrollY: S2 });
    await f2.step('intro-filled');
    await page.click('label:has(#preferred_contact-kakao)');
    await f2.step('contact-method');
    await page.check('#recruit-agreed');
    await f2.step('consent-checked');
    log('intercepted', JSON.stringify(ctx.__prismStats.list), 'POST seen', page.__reqs.filter((r) => r.m !== 'GET').length);
    await ctx.close();
  }
} finally {
  await browser.close();
}
