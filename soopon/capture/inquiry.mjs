// 상태 흐름: 상담 신청 폼(/b2b/inquiry) — 폼이 길어(데스크톱 문서 4073px) 한 화면에 안 들어오므로 구역별 흐름으로 나눈다. 각 흐름은 같은 뷰포트·같은 scrollY.
//  b2b-inquiry-info    : 빈 폼 → 담당자·소속 → 이메일·연락처 → 관심 프로그램 선택  (제출 가로챔 뒤 완료 화면은 desktop|mobile/b2b-inquiry-done-full·view.png)
//  b2b-inquiry-details : (데스크톱) 도입 목적·인원·희망 시기·문의 내용 구역: 빈 → 목적 선택 → 인원·시기 → 문의 내용
//  b2b-inquiry-consent : (데스크톱) 동의 3개 구역: 모두 해제 → 필수1 → 선택 → 필수3(제출 직전)
// 모바일은 info·details. 제출 POST 는 guard.fake 가 flight 형식 가짜 성공으로 응답한다.
// 입력 중에는 lib 의 input 가림 리스너를 꺼 둔다(켜 두면 전화 입력값이 가려진 글자로 React 상태에 들어가 검증 오류가 난다). 저장 직전 step() 이 다시 켜고 가린 뒤 검사한다.
import { launch, startFlow, liveRedact, capturePage, log } from '../../tools/lib.mjs';
import { ctxFor, BASE, armAddr } from './common.mjs';

const vps = process.argv[2] ? process.argv[2].split(',') : ['desktop', 'mobile'];
const FAKE = { name: '김○○', dept: 'A기관', email: 'user***@기관.kr', phone: '010-1234-5678', headcount: '30명', period: '11월 둘째 주 평일', msg: '임직원 대상 숲 프로그램을 문의합니다. (가짜 문의 내용)' };
const top = (page, sel, off) => page.evaluate(([s, o]) => Math.max(0, Math.round(document.querySelector(s).getBoundingClientRect().top + window.scrollY - o)), [sel, off]);

const browser = await launch();
try {
  for (const vp of vps) {
    const mobile = vp === 'mobile';
    const { ctx, page } = await ctxFor(browser, vp);
    await page.goto(BASE + '/b2b/inquiry', { waitUntil: 'load' });
    await page.waitForSelector('[data-field=contact_name]', { timeout: 15000 });
    await page.waitForTimeout(2500); await armAddr(page);
    const f = (k) => page.locator(`[data-field=${k}]`);
    const suffix = mobile ? '-mobile' : '';

    // ── info
    const SY1 = await top(page, '[data-field=contact_name]', 140);
    const info = await startFlow(page, 'b2b-inquiry-info' + suffix, { scrollY: SY1 });
    await info.step('empty');
    await liveRedact(page, false);
    await f('contact_name').fill(FAKE.name); await f('department').fill(FAKE.dept);
    await info.step('name-department');
    await liveRedact(page, false);
    await f('email').fill(FAKE.email); await f('phone').fill(FAKE.phone);
    await info.step('email-phone');
    await page.locator('[data-field=program_ids] label').first().click();
    await page.waitForTimeout(300);
    await info.step('program-selected');

    // ── details
    const SY2 = await top(page, '[data-field=purpose]', mobile ? 40 : 110);
    const det = await startFlow(page, 'b2b-inquiry-details' + suffix, { scrollY: SY2 });
    await det.step('empty');
    await page.locator('[data-field=purpose] label', { hasText: '교육' }).first().click();
    await page.waitForTimeout(300);
    await det.step('purpose-education');
    await liveRedact(page, false);
    await f('headcount').fill(FAKE.headcount); await f('preferred_period').fill(FAKE.period);
    await det.step('headcount-period');
    await liveRedact(page, false);
    await f('message').fill(FAKE.msg);
    await det.step('message');

    // ── consent (데스크톱)
    if (!mobile) {
      const SY3 = await top(page, '[data-field=privacy_agreed]', 100);
      const con = await startFlow(page, 'b2b-inquiry-consent', { scrollY: SY3 });
      await con.step('none');
      await f('privacy_agreed').check(); await page.waitForTimeout(300);
      await con.step('required-1');
      await f('optional_agreed').check(); await page.waitForTimeout(300);
      await con.step('optional');
      await f('third_party_agreed').check(); await page.waitForTimeout(300);
      await con.step('required-3-ready-to-submit');
    } else {
      await f('privacy_agreed').check(); await f('optional_agreed').check(); await f('third_party_agreed').check();
    }

    // ── 제출(가로챔) → 완료 화면. 첫 흐름의 scrollY 로 돌아와 한 장 더.
    await page.locator('form button[type=submit]').click();
    await page.waitForSelector('[role=status]', { timeout: 10000 });
    await page.waitForTimeout(800);
    await capturePage(page, 'b2b-inquiry-done'); // 완료 화면은 문서가 짧아져 흐름의 scrollY 를 못 지킨다 → 페이지 세트(full·view)로
    await ctx.close(); log(vp, 'inquiry ok');
  }
} finally { await browser.close(); }
