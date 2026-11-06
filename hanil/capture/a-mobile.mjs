// A) 공개 화면 모바일 390 — 운영 GET 만.
import { launch, newContext, capturePage, PROD, REDACT_PUBLIC, GUARD_PUBLIC, FREEZE_HERO, gap, gotoReady, log } from './common.mjs';

const PAGES = [
  ['home', '/'],
  ['product', '/product'],
  ['product-gas-nitriding', '/product/gas-nitriding'],
  ['product-isonite-tf1', '/product/isonite-tf1'],
  ['support-quote', '/support/quote'],
];
const only = process.argv.slice(2);
const browser = await launch();
try {
  const { ctx, page } = await newContext(browser, 'mobile', { project: 'hanil', guard: GUARD_PUBLIC, redact: REDACT_PUBLIC });
  await ctx.addInitScript(FREEZE_HERO);
  for (const [name, path] of PAGES) {
    if (only.length && !only.includes(name)) continue;
    await gotoReady(page, PROD + path);
    await capturePage(page, name);
    log('captured mobile', name);
    await gap();
  }
} finally {
  await browser.close();
}
