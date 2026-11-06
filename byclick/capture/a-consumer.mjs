// byclick A — 소비자 모바일(390) · 운영 https://byclick.co.kr 공개 화면(GET만). 비GET 은 전부 가로챈다(allow 없음).
// 운영 라이브 /my/apply 의 제조사 선택은 서버가 그린 목록을 클라이언트에서 거르는 방식이라 vehicle_catalog RPC·서버 액션 호출이 없다(탐색에서 확인) → 예외 통과 0.
import { launch, newContext, capturePage, startFlow, log } from '../../tools/lib.mjs';

const BASE = 'https://byclick.co.kr';
const redact = {
  remove: ['footer'],
  textMap: { '장O규': '김○○', '865-87-': '○○○-○○-', '02901': '○○○○○' },
};
const browser = await launch();
try {
  const { ctx, page } = await newContext(browser, 'mobile', { project: 'byclick', guard: {}, redact });
  const go = async (p) => { await page.goto(BASE + p, { waitUntil: 'networkidle' }); await page.waitForTimeout(1200); };

  // 1) 랜딩
  await go('/');
  await capturePage(page, 'landing');
  log('landing 저장');

  // 2) 진행 안내(HOW IT WORKS) 4단계 — 같은 scrollY
  await go('/');
  const yProc = await page.evaluate(() => {
    const el = document.querySelector('.carousel-dot')?.closest('section') || document.querySelector('.carousel-dot').parentElement;
    return Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 70));
  });
  const fProc = await startFlow(page, 'process-steps', { scrollY: yProc });
  const names = ['estimate', 'pickup', 'inspection', 'auction-and-choice'];
  for (let i = 0; i < 4; i++) {
    await page.locator('button.carousel-dot').nth(i).click();
    await page.waitForTimeout(900);
    await fProc.step(names[i]);
  }
  log('process-steps 저장');

  // 3) 신청 화면
  await go('/my/apply');
  await capturePage(page, 'apply');
  log('apply 저장');

  // 3a) 제조사 자동완성(검색 시트): 한 글자씩
  await go('/my/apply');
  const Y1 = 300;
  const f1 = await startFlow(page, 'maker-autocomplete', { scrollY: Y1 });
  await page.evaluate((y) => window.scrollTo(0, y), Y1);
  await f1.step('closed');
  await page.click('#sellMake'); await page.waitForTimeout(500);
  await f1.step('sheet-open-all');
  const inp = page.locator('input[placeholder="제조사 이름으로 찾기"]');
  let typed = '';
  for (const ch of ['야', '마', '하']) {
    await inp.pressSequentially(ch, { delay: 120 }); typed += ch;
    await page.waitForTimeout(400);
    await f1.step(`typed-${typed}`);
  }
  await page.locator('[role=option]:visible').first().click(); await page.waitForTimeout(700);
  await f1.step('maker-selected');
  log('maker-autocomplete 저장');

  // 3b) 이어서 모델·연식·주행거리 입력(같은 페이지 상태에서 이어감)
  const f2 = await startFlow(page, 'bike-info-input', { scrollY: Y1 });
  await f2.step('maker-selected');
  const model = page.locator('input[placeholder="예: R 1200 RT"]');
  await model.click();
  let m = '';
  for (const ch of ['N', 'M', 'A', 'X']) { await model.pressSequentially(ch, { delay: 120 }); m += ch; await page.waitForTimeout(250); await f2.step(`model-${m}`); }
  await page.locator('select').first().selectOption({ index: 5 }); await page.waitForTimeout(300);
  await f2.step('year-selected');
  await page.locator('input[placeholder="예: 12,000"]').click();
  await page.locator('input[placeholder="예: 12,000"]').pressSequentially('8500', { delay: 80 }); await page.waitForTimeout(300);
  await f2.step('mileage-typed');
  log('bike-info-input 저장');

  // 3c) 바이크 사진 등록(촬영 가이드에 가장 가까움): 열기 전·시트 열림. 사진 선택은 누르지 않는다.
  await go('/my/apply');
  const yPhoto = await page.evaluate(() => Math.round(document.getElementById('byPhotoOpen').getBoundingClientRect().top + window.scrollY - 200));
  const f3 = await startFlow(page, 'photo-register', { scrollY: yPhoto });
  await f3.step('photo-block');
  await page.click('#byPhotoOpen'); await page.waitForTimeout(900);
  await f3.step('photo-sheet-open');
  // 시트 안을 끝까지 내려 「필수 사진 0 / 4장 · 사진 등록 완료」 줄까지(사진 선택은 누르지 않는다)
  await page.evaluate(() => {
    let n = [...document.querySelectorAll('div,section,aside')].filter((e) => /바이크 사진 등록/.test(e.textContent || '') && e.scrollHeight > e.clientHeight + 20 && /(auto|scroll)/.test(getComputedStyle(e).overflowY));
    n = n.sort((a, b) => a.contains(b) ? 1 : -1)[0];
    if (n) n.scrollTop = n.scrollHeight;
  });
  await page.waitForTimeout(500);
  await f3.step('photo-sheet-bottom');
  log('photo-register 저장');

  // 4) 소비자 로그인(내 신청 보기) — 입력 전 화면만. 인증번호 받기는 누르지 않는다(문자 발송).
  await go('/my/login');
  await capturePage(page, 'login');
  log('login 저장');

  console.log('intercepted', ctx.__prismStats.intercepted, JSON.stringify(ctx.__prismStats.list), 'allowed', JSON.stringify(ctx.__prismStats.allowed));
} finally {
  await browser.close();
}
