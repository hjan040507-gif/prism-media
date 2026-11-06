// 공개 페이지 세트: 데스크톱 1440 · 모바일 390 — 메인·결과 목록·프로그램 상세 2건·숲ON비즈·상담 신청 폼
import { launch, capturePage, log } from '../../tools/lib.mjs';
import { ctxFor, BASE, armAddr } from './common.mjs';

const PAGES = [
  ['home', '/'],
  ['programs', '/programs'],
  ['programs-filtered', '/programs?who=kids&exp=nature'],
  ['program-forestasan-01', '/program/forestasan-01'],
  ['program-company-4-01', '/program/company-4-01'],
  ['b2b', '/b2b'],
  ['b2b-inquiry', '/b2b/inquiry'],
];
const only = process.argv[2] ? process.argv[2].split(',') : null;
const vps = process.argv[3] ? process.argv[3].split(',') : ['desktop', 'mobile'];

const browser = await launch();
try {
  for (const vp of vps) {
    const { ctx, page } = await ctxFor(browser, vp);
    for (const [name, path] of PAGES) {
      if (only && !only.includes(name)) continue;
      await page.goto(BASE + path, { waitUntil: 'load' });
      await page.waitForTimeout(2500); // 하이드레이션·히어로 진입 연출
      await armAddr(page);
      await capturePage(page, name);
      log(vp, name, 'ok');
    }
    await ctx.close();
  }
} finally { await browser.close(); }
