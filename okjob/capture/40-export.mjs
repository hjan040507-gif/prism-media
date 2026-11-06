// 엑셀 두 종을 로컬 export 라우트(로그인 필요)로 받아 tmp/okjob-xlsx/ 에 둔다. 변환·PNG 는 41-files.py.
import fs from 'node:fs';
import path from 'node:path';
import { launch, newContext, log, BASE, STATE, GUARD, assertLocal, ROOT } from './common.mjs';
const out = path.join(ROOT, 'tmp', 'okjob-xlsx'); fs.mkdirSync(out, { recursive: true });
const browser = await launch();
const { ctx, page } = await newContext(browser, 'desktop', { project: 'okjob', guard: GUARD, storageState: STATE });
assertLocal(page);
for (const [name, url] of [['day-sheet', '/api/reports/day/export?date=2026-11-03'], ['worker-matrix', '/api/reports/matrix/export?month=2026-11']]) {
  const res = await ctx.request.get(BASE + url, { timeout: 240000 });
  log(name, res.status(), res.headers()['content-disposition'] ? 'disposition ok' : '');
  if (res.status() !== 200) throw new Error(name + ' ' + res.status());
  fs.writeFileSync(path.join(out, name + '.xlsx'), await res.body());
}
await browser.close();
