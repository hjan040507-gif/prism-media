// 상태 흐름 ①: 홈 검색창 한 글자씩 입력 → 자동완성(초성 ㅍ→ㅍㅋ→ㅍㅋㅊ→피카츄). 데스크톱 + 모바일. 단계마다 서버 /api/suggest 호출 수를 센다.
import { launch, mk, BASE, waitIntroGone, sleep, tally } from './common.mjs';
import { startFlow } from '../../tools/lib.mjs';

const STEPS = ['ㅍ', 'ㅍㅋ', 'ㅍㅋㅊ', '피카츄'];
const browser = await launch();
try {
  for (const vp of ['desktop', 'mobile']) {
    const { ctx, page } = await mk(browser, vp);
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await waitIntroGone(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const input = page.locator('input[role=combobox]:visible').first();
    await input.click();
    await sleep(1200); // 사전(IndexedDB) 로딩
    const flow = await startFlow(page, vp === 'desktop' ? 'search-autocomplete' : 'search-autocomplete-mobile', { scrollY: 0 });
    // 시작 상태(포커스만, 빈 입력)
    await flow.step('00-focus'.replace('00-', ''));
    let typed = '';
    for (const [i, s] of STEPS.entries()) {
      // 한 글자씩: 직전 문자열과 다른 부분만 추가(마지막 단계는 전부 지우고 새로 입력)
      if (s.startsWith(typed) && typed) { await page.keyboard.type(s.slice(typed.length), { delay: 120 }); }
      else { await input.fill(''); await page.keyboard.type(s, { delay: 160 }); }
      typed = s;
      await sleep(1500);
      const rows = await page.locator('[role=option]').count();
      const j = await flow.step(`typed-${s}`, { note: `option rows=${rows}`, settleMs: 300 });
      console.log(vp, s, 'rows', rows, 'suggest calls so far', ctx.__calls.suggest);
    }
    tally(ctx, `states-autocomplete-${vp}`);
    await ctx.close();
  }
} finally { await browser.close(); }
