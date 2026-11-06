// A) 공개 화면 데스크톱 1440 — 운영 GET 만. 폼은 건드리지 않는다(채우기는 a-flows.mjs).
import { launch, newContext, capturePage, PROD, REDACT_PUBLIC, GUARD_PUBLIC, FREEZE_HERO, gap, gotoReady, log } from './common.mjs';

const PAGES = [
  ['home', '/'],
  ['company-greeting', '/company/greeting'],
  ['company-history', '/company/history'],
  ['company-certifications', '/company/certifications'],
  ['company-profile', '/company/profile'],
  ['product', '/product'],
  ['product-isonite-tf1', '/product/isonite-tf1'],
  ['product-gas-nitriding', '/product/gas-nitriding'],
  ['product-dlc', '/product/dlc'],
  ['product-vacuum-carburizing', '/product/vacuum-carburizing'],
  ['facility', '/facility', 'tabs'],
  ['rnd', '/rnd'],
  ['esg', '/esg'],
  ['support-contact', '/support/contact'],
  ['support-quote', '/support/quote'],
];
const only = process.argv.slice(2);

const browser = await launch();
try {
  const { ctx, page } = await newContext(browser, 'desktop', { project: 'hanil', guard: GUARD_PUBLIC, redact: REDACT_PUBLIC });
  await ctx.addInitScript(FREEZE_HERO);
  for (const [name, path, mode] of PAGES) {
    if (only.length && !only.includes(name)) continue;
    await gotoReady(page, PROD + path);
    if (mode === 'tabs') {
      const tabs = [['manufacturing', 'tab1-manufacturing-1'], ['manufacturing2', 'tab2-manufacturing-2'], ['measuring', 'tab3-measuring']];
      for (const [id, suffix] of tabs) {
        await page.click(`#tab-${id}`);
        await page.waitForTimeout(500);
        await capturePage(page, `facility-${suffix}`);
        log('captured', `facility-${suffix}`);
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      }
    } else {
      await capturePage(page, name);
      log('captured', name);
    }
    await gap();
  }
  const st = ctx.__prismStats;
  log('intercepted', st.intercepted, 'allowed non-GET', st.allowed.length, JSON.stringify(st.list.slice(0, 5)));
} finally {
  await browser.close();
}
