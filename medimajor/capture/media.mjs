// 라이브 CSS 토큰(brand.json 근거) + 매물 대표 사진 원본(공개 스토리지 GET) + 히어로 이미지 수집. 읽기 전용.
import fs from 'node:fs';
import { launch, mk, gotoPage, LOT, ORIGIN } from './common.mjs';
const OUT = 'medimajor/media'; fs.mkdirSync(OUT, { recursive: true });
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop');
  await gotoPage(page, '/ko', { wait: 1500 });
  const css = await page.evaluate(() => {
    const el = document.querySelector('.mm') || document.body; const cs = getComputedStyle(el);
    const g = (n) => cs.getPropertyValue(n).trim();
    return { brand: g('--brand'), blue: g('--blue'), night: g('--night'), sig: g('--sig'), ink: g('--ink'), bg: g('--bg'), font: cs.fontFamily, bodyFont: getComputedStyle(document.body).fontFamily,
      fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '')).filter((v, i, a) => a.indexOf(v) === i),
      hero: [...document.querySelectorAll('img')].map(i => i.currentSrc || i.src).filter(s => /bmr|booth|hero/i.test(s)).slice(0, 6) };
  });
  fs.writeFileSync('tmp/mm/live-css.json', JSON.stringify(css, null, 1));
  console.log(JSON.stringify(css));
  await gotoPage(page, '/auctions/' + LOT, { wait: 2500 });
  const imgs = await page.evaluate(() => [...document.querySelectorAll('img')].map(i => i.currentSrc || i.src).filter(s => /listing-images/.test(s)));
  const urls = [...new Set(imgs.map((s) => { try { const u = new URL(s); return u.searchParams.get('url') || s; } catch { return s; } }))];
  console.log('lot images', urls.length);
  let n = 0;
  for (const u of urls.slice(0, 6)) {
    const r = await fetch(u); if (!r.ok) continue;
    const buf = Buffer.from(await r.arrayBuffer());
    const ext = (r.headers.get('content-type') || '').includes('webp') ? 'webp' : (r.headers.get('content-type') || '').includes('png') ? 'png' : 'jpg';
    n++; fs.writeFileSync(`${OUT}/lot-mqe102-${n}.${ext}`, buf); console.log(u.replace(/^https:\/\/[^/]+/, '').slice(0, 120), buf.length);
  }
  await ctx.close();
} finally { await browser.close(); }
