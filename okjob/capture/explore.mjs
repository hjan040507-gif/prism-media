// 탐색용(촬영물 아님) — 화면 로드·가로챈 요청·자료 유무만 본다.
import { launch, newContext, BASE, STATE, GUARD, assertLocal, log } from './common.mjs';
const OUT = process.env.EXPLORE_OUT;
const routes = process.argv.slice(2);
const browser = await launch();
const { ctx, page } = await newContext(browser, 'desktop', { project: 'okjob', guard: GUARD, storageState: STATE });
assertLocal(page);
page.on('console', (m) => { if (m.type() === 'error') console.log('console.error', m.text().slice(0, 160)); });
for (const r of routes) {
  const t0 = Date.now();
  await page.goto(BASE + r, { waitUntil: 'networkidle', timeout: 120000 }).catch((e) => console.log('goto', e.message.slice(0, 100)));
  await page.waitForTimeout(1200);
  const name = r.replace(/[\/?=&]/g, '_');
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(r, page.url().replace(BASE, ''), Date.now() - t0, 'ms', await page.title());
}
log('가로챈', ctx.__prismStats.intercepted, ctx.__prismStats.list.slice(0, 12).join(' | '));
await browser.close();
