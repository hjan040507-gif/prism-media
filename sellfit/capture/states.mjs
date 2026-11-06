// 상태 흐름(모바일 390): ① 상품 상세 사진 캐러셀 넘기기(1/4→4/4) ② 거래 목록 검색창 한 글자씩 입력→목록 필터(클라이언트 필터, GET 만).
import { launch, mk, go, tally, PRODUCTS, sleep } from './common.mjs';
import { startFlow } from '../../tools/lib.mjs';

const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'mobile');

  // ① 캐러셀
  await go(page, PRODUCTS['bape-shark']);
  const flow = await startFlow(page, 'detail-carousel', { scrollY: 0 });
  const total = await page.locator('div.snap-x > img').count();
  console.log('carousel images', total);
  for (let i = 0; i < total; i++) {
    await page.evaluate((i) => { const c = document.querySelector('div.snap-x'); c.scrollTo({ left: i * c.clientWidth, behavior: 'instant' }); }, i);
    await sleep(900);
    const counter = await page.evaluate(() => [...document.querySelectorAll('div')].find((d) => /^\d\/\d$/.test((d.textContent || '').replace(/\s/g, '')) && d.children.length <= 3)?.textContent.replace(/\s/g, ''));
    await flow.step(`photo-${i + 1}of${total}`, { note: `counter=${counter}` });
    console.log('carousel step', i + 1, counter);
  }

  // ② 검색 필터
  await go(page, '/products');
  const input = page.locator('input[aria-label="상품 검색"]');
  const Y = 300;
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Y);
  await sleep(500);
  const f2 = await startFlow(page, 'search-filter', { scrollY: Y });
  await input.click();
  // 빈 입력·한 글자 상태는 목록 맨 위에 사람이 나온 '유저 제품' 카드가 있어 찍지 않는다(앱은 2글자부터 필터). 한 글자 입력은 찍지 않고 이어 친다.
  // 폴로 → 폴로 빅 (이어 입력), 지우고 스투시, 지우고 슈프림. (결과가 5개 미만이면 문서가 짧아 같은 scrollY 를 못 지키므로 그런 질의는 안 쓴다)
  const steps = [['폴', null, false], ['로', '폴로', false], [' 빅', '폴로 빅', false], ['스투시', '스투시', true], ['슈프림', '슈프림', true]];
  let typed = '';
  for (const [chunk, label, clear] of steps) {
    if (clear) { await input.fill(''); typed = ''; await input.click(); }
    await page.keyboard.type(chunk, { delay: 120 });
    typed += chunk;
    await sleep(900);
    if (!label) continue;
    const n = await page.evaluate(() => [...document.querySelectorAll('a[href^="/products/"]')].filter((a) => a.textContent.trim()).length);
    await f2.step(`typed-${label.replace(/ /g, '_')}`, { note: `query=${typed} cards=${n}` });
    console.log('search', typed, 'cards', n);
  }
  tally(ctx, 'states');
} finally { await browser.close(); }
