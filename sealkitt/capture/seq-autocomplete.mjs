// seq: 홈 검색 자동완성 펼침(초성 ㅍ → ㅍㅋ → ㅍㅋㅊ). page.clock 1/60초씩. 데스크톱 1440. 서버 /api/suggest 호출은 글자 수만큼(3).
import { launch, mk, BASE, waitIntroGone, sleep, tally } from './common.mjs';
import { recordSeq } from '../../tools/lib.mjs';
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop', { clock: true });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  await sleep(6000); // 인트로(실시간 진행) 종료 대기
  await page.mouse.click(5, 5);
  const input = page.locator('input[role=combobox]:visible').first();
  await input.click();
  await sleep(1500);
  const r = await recordSeq(page, 'home-search-autocomplete', {
    durationMs: 3000,
    perFrame: async (i) => {
      if (i === 20) await page.keyboard.type('ㅍ');
      if (i === 70) await page.keyboard.type('ㅋ');
      if (i === 120) await page.keyboard.type('ㅊ');
    },
  });
  console.log(r, 'suggest calls', ctx.__calls.suggest);
  tally(ctx, 'seq-autocomplete');
} finally { await browser.close(); }
