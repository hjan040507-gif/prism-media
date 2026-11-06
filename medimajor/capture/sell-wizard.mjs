// 로그인(테스트 판매자 계정, storageState 재사용) 뒤 /sell?start=1 사진 등록 마법사 — 데스크톱 full·view + 사진 추가 흐름, 모바일 full·view.
// GET /sell?start=1 은 서버가 읽기만 한다(sell/page.tsx:47 sellNewVM = categories·my_seller select). 쓰기성 POST(rpc·스토리지)는 전부 가짜 성공.
import fs from 'node:fs';
import { launch, mk, gotoPage, REDACT } from './common.mjs';
import { capturePage, startFlow } from '../../tools/lib.mjs';
const FILES = ['medimajor/media/lot-usx100-1.webp', 'medimajor/media/lot-usx100-2.webp', 'medimajor/media/lot-usx100-3.webp'];
const redact = { ...REDACT, textMap: { '테스트 계정 · Test Seller': 'user***', '테스트 계정 판매자': 'user*** 판매자' } };
const guard = { fake: [{ match: 'rpc/create_listing_draft', method: 'POST', json: '00000000-0000-4000-8000-0000000000d1' }] };
async function wire(ctx) {
  const up = [];
  await ctx.route(/\/storage\/v1\/object\/(?:public\/)?listing-images\//, async (route) => {
    const r = route.request(); const u = new URL(r.url());
    if (r.method() === 'POST') { up.push(decodeURIComponent(u.pathname.split('/object/listing-images/')[1])); return route.fallback(); } // lib guard 가 가짜 200
    const p = decodeURIComponent(u.pathname.split('/object/public/listing-images/')[1] || '');
    const i = up.indexOf(p);
    if (r.method() === 'GET' && i >= 0) return route.fulfill({ status: 200, contentType: 'image/webp', body: fs.readFileSync(FILES[i % FILES.length]) });
    return route.fallback();
  });
  return up;
}
const browser = await launch();
try {
  // 데스크톱
  {
    const { ctx, page } = await mk(browser, 'desktop', { storageState: 'tmp/mm/state-seller.json', redact, guard });
    const up = await wire(ctx);
    await gotoPage(page, '/sell?start=1', { wait: 2500 });
    await capturePage(page, 'sell-wizard');
    await gotoPage(page, '/sell?start=1', { wait: 2500 });
    const flow = await startFlow(page, 'sell-photos', { scrollY: 380 });
    await flow.step('draft-1-photo', { settleMs: 700 });
    for (let k = 0; k < 3; k++) {
      await page.locator('input[type=file]').first().setInputFiles(FILES[k]);
      await page.waitForFunction((n) => [...document.images].filter((i) => /listing-images/.test(i.src) && i.complete && i.naturalWidth > 0).length >= n, 2 + k, { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1200);
      await flow.step(`photo-${k + 2}-added`, { note: 'file chosen in the real uploader; storage POST + rpc intercepted (fake success), image GET served from local copy of a public sample photo', settleMs: 600 });
    }
    // 분류·장비명 입력(실제 입력칸, 서버 저장 POST 는 가로챔)
    const cat = await page.evaluate(() => { const s = document.getElementById('sn-c'); const o = [...s.options].find((x) => /초음파/.test(x.text)); return o ? o.value : null; });
    if (cat) await page.selectOption('#sn-c', cat);
    await page.fill('#sn-n', '범용 초음파 진단기');
    await page.fill('#sn-mk', '저슬메디칼'); await page.fill('#sn-md', 'USX-100'); await page.fill('#sn-y', '2019');
    await page.waitForTimeout(1200);
    await flow.step('info-filled', { note: 'typed into real inputs (category, name, maker, model, year); draft save POSTs intercepted', settleMs: 600 });
    console.log(JSON.stringify({ uploads: up.length, intercepted: ctx.__prismStats.list, cat }));
    await ctx.close();
  }
  // 모바일
  {
    const { ctx, page } = await mk(browser, 'mobile', { storageState: 'tmp/mm/state-seller.json', redact, guard });
    await wire(ctx);
    await gotoPage(page, '/sell?start=1', { wait: 2500 });
    await capturePage(page, 'sell-wizard');
    await ctx.close();
  }
} finally { await browser.close(); }
