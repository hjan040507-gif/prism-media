// media/posco-logo.png — 레포의 공식 로고 SVG(public/posco/posco-logo.svg, 원본색)를 투명 배경 PNG(2048 폭)로 변환. 새로 그리지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import { launch, ROOT } from '../../tools/lib.mjs';

const svg = fs.readFileSync(path.join(ROOT, 'posco/media/posco-logo.svg'));
const browser = await launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 277 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.setContent(`<html><body style="margin:0;background:transparent"><img id="l" style="display:block;width:1024px;height:277px" src="data:image/svg+xml;base64,${svg.toString('base64')}"></body></html>`);
  await page.waitForFunction(() => document.getElementById('l').complete);
  await page.locator('#l').screenshot({ path: path.join(ROOT, 'posco/media/posco-logo.png'), omitBackground: true });
  await ctx.close();
} finally {
  await browser.close();
}
console.log('ok');
