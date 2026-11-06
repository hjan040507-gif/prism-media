import { launch, newContext, log } from '../../tools/lib.mjs';
const SP = process.env.SP;
const browser = await launch();
const { ctx, page } = await newContext(browser, 'mobile', { project: 'byclick', guard: { allow: [] } });
page.on('request', (r) => { if (r.method() !== 'GET') log('REQ', r.method(), r.url().slice(0, 140)); });
await page.goto('https://byclick.co.kr/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const q = await page.evaluate(() => ({
  btns: [...document.querySelectorAll('button')].filter((e) => e.offsetWidth).map((e) => `${e.className.slice(0,40)}|${e.getAttribute('aria-label')||''}|${e.innerText.replace(/\n/g,' ').slice(0,20)}`).slice(0, 40),
  live: [...document.querySelectorAll('[class*=live]')].map((e) => e.className.toString().slice(0,50)).slice(0, 12),
  foot: [...document.querySelectorAll('footer')].map((e) => e.className),
  imgs: [...document.querySelectorAll('img')].map((i) => (i.currentSrc||i.src).slice(0, 90)).slice(0, 30),
}));
console.log(JSON.stringify(q, null, 1));
const sec = page.locator('.by-live-section').first();
if (await sec.count()) { await sec.scrollIntoViewIfNeeded(); await page.waitForTimeout(1500); await sec.screenshot({ path: SP + '/live.png', scale: 'css' }); }
await browser.close();
