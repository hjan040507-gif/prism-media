// 데스크톱 홈을 지원 언어 6개마다 1장(경로 prefix) + 언어 전환 흐름(헤더 언어 메뉴 UI, 같은 scrollY 0)
import { launch, mk, gotoPage } from './common.mjs';
import { capturePage, startFlow } from '../../tools/lib.mjs';
const LANGS = [['ko', '/ko'], ['en', '/en'], ['zh-CN', '/zh-CN'], ['ja', '/ja'], ['th', '/th'], ['hi', '/hi']];
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop');
  if (process.argv[2] !== 'flow') for (const [l, p] of LANGS) { await gotoPage(page, p); await capturePage(page, `home-${l}`); }
  // 언어 전환 흐름: 한국어 → English → 日本語 → ไทย (헤더 언어 메뉴 클릭 = 쿠키 + router.refresh)
  // 접두 없는 '/' 에서 시작한다: '/ko' 같은 접두 경로는 refresh 때 프록시가 쿠키를 다시 ko 로 심어 전환이 되돌아간다(proxy.ts:52-98)
  await gotoPage(page, '/', { wait: 1000 });
  await page.locator('.h7-bn-pause').click(); // 배너 자동 전환을 멈춰 언어만 바뀌게 한다(HomeBanner.tsx:173 사용자 정지)
  const flow = await startFlow(page, 'lang-switch', { scrollY: 0 });
  await flow.step('ko', { settleMs: 800 });
  for (const l of ['en', 'ja', 'th', 'hi']) {
    await page.click('.hd-util .u-dd >> nth=0');
    await page.click(`.hd-util li[role=option][lang="${l}"]`);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1800);
    await page.keyboard.press('Escape'); // 메뉴가 열려 있으면 닫는다
    await flow.step(l, { note: 'header language menu click (cookie medimajor.lang + router.refresh)', settleMs: 700 });
  }
  await ctx.close();
} finally { await browser.close(); }
