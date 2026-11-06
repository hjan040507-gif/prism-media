// 모바일 390 + 데스크톱 1440 페이지 캡처. 운영 공개 화면 GET 만, 비GET 가로챔.  사용: node sellfit/capture/pages.mjs <mobile|desktop>
import { launch, mk, go, tally, PRODUCTS } from './common.mjs';
import { capturePage } from '../../tools/lib.mjs';
const vp = process.argv[2];
const list = vp === 'mobile'
  ? [['/sensel', 'sensel-list'], [PRODUCTS['bape-shark'], 'product-bape-shark'], [PRODUCTS['polo-italy'], 'product-polo-italy'], [PRODUCTS['palace-knit'], 'product-palace-knit'], ['/login', 'login']]
  : [['/sensel', 'sensel-list'], [PRODUCTS['bape-shark'], 'product-bape-shark'], [PRODUCTS['polo-italy'], 'product-polo-italy'], ['/login', 'login']];
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, vp);
  for (const [path, name] of list) {
    await go(page, path);
    const r = await capturePage(page, name);
    console.log('captured', vp, name, r.full.docHeight, 'pii', r.full.pii_scan.total, r.view.pii_scan.total);
  }
  tally(ctx, 'pages-' + vp);
} finally { await browser.close(); }
