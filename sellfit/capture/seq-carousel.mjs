// seq: 상품 상세 사진 캐러셀이 넘어가는 연출(1→2→3→4). 모바일 390·DSF3.
// 방식: page.clock 1/60초씩 runFor + 프레임마다 스크린샷(recordSeq). 캐러셀은 CSS scroll-snap 스크롤이라 브라우저 smooth scroll 이
// 가상 시계에 안 묶이므로, 프레임마다 scrollLeft 를 easeInOutCubic 으로 직접 지정한다(그 동안만 컨테이너 scroll-snap-type 을 none 으로 하고
// 끝나면 되돌림). 화면은 실제 앱의 실제 렌더이고, 위치 보간만 스크립트다 — shots.md 에 적는다.
import { launch, mk, go, tally, PRODUCTS, sleep } from './common.mjs';
import { recordSeq } from '../../tools/lib.mjs';

const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'mobile', { clock: true });
  await go(page, PRODUCTS['bape-shark']);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(500);
  const W = await page.evaluate(() => document.querySelector('div.snap-x').clientWidth);
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const T = [[40, 1], [130, 2], [220, 3]]; // [시작 프레임, 도착 사진 인덱스]
  const LEN = 36;
  const r = await recordSeq(page, 'detail-carousel-swipe', {
    durationMs: 5000,
    start: async () => { await page.evaluate(() => { const c = document.querySelector('div.snap-x'); c.dataset.prSnap = c.style.scrollSnapType; c.style.scrollSnapType = 'none'; c.scrollLeft = 0; }); },
    perFrame: async (i) => {
      for (const [s, idx] of T) {
        if (i >= s && i <= s + LEN) {
          const p = ease((i - s) / LEN);
          await page.evaluate(([x]) => { document.querySelector('div.snap-x').scrollLeft = x; }, [Math.round(((idx - 1) + p) * W)]);
        }
      }
    },
  });
  await page.evaluate(() => { const c = document.querySelector('div.snap-x'); c.style.scrollSnapType = c.dataset.prSnap || ''; });
  console.log(r);
  tally(ctx, 'seq-carousel');
} finally { await browser.close(); }
