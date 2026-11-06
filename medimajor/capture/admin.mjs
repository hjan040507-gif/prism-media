// 관리자(기존 qa-admin 계정, storageState 재사용) — 대시보드·거래매출 통계·전시관 관리·매물 심사. 서버는 GET 에서 읽기만(src/app/admin/**/page.tsx · models/admin.ts 에 insert/update/rpc 0).
// 영업 수치(낙찰 총액·평균 낙찰가 등 7자리 이상 원 단위)는 찍기 전에 가짜 값(×1.137 반올림)으로 바꾼다.
import { launch, mk, gotoPage, REDACT } from './common.mjs';
import { capturePage } from '../../tools/lib.mjs';
const redact = { ...REDACT };
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'desktop', { storageState: 'tmp/mm/state-admin.json', redact });
  const fakeMoney = () => page.evaluate(() => {
    const re = /(\d{1,3}(?:,\d{3}){2,})(\s*원)/g; let n = 0;
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let t;
    while ((t = tw.nextNode())) { const v = t.nodeValue.replace(re, (m, a, b) => { n++; const f = Math.round(Number(a.replace(/,/g, '')) * 1.137 / 10000) * 10000; return f.toLocaleString('en-US') + b; }); if (v !== t.nodeValue) t.nodeValue = v; }
    return n;
  });
  const out = {};
  for (const [name, p] of [['admin-dashboard', '/admin'], ['admin-stats', '/admin/stats'], ['admin-showroom', '/admin/showroom'], ['admin-listings', '/admin/listings']]) {
    await gotoPage(page, p, { wait: 2000 });
    out[name] = await fakeMoney();
    await capturePage(page, name);
  }
  console.log(JSON.stringify({ fakedMoneyNodes: out, intercepted: ctx.__prismStats.list, allowed: ctx.__prismStats.allowed }));
  await ctx.close();
} finally { await browser.close(); }
