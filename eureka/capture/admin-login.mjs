// /admin/login 화면 1장(GET 만, 비밀번호 입력·제출 없음). 실행: cd ~/prism-media && node eureka/capture/admin-login.mjs
import { launch, capturePage, log } from '../../tools/lib.mjs';
import { ctxFor, BASE } from './common.mjs';

const browser = await launch();
try {
  const { page, reqs } = await ctxFor(browser, 'desktop');
  await page.goto(BASE + '/admin/login', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await capturePage(page, 'admin-login', { header: false });
  log('admin-login 완료, 비GET 시도', reqs.filter((r) => r.m !== 'GET').map((r) => r.m + ' ' + new URL(r.u).pathname));
} finally {
  await browser.close();
}
