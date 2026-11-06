// eureka seq — 히어로 일러스트 캐러셀(JS setInterval 2.8초 + CSS transition-transform 500ms).
// 실행: cd ~/prism-media && node eureka/capture/seq.mjs <desktop|mobile>
// 방식: page.clock.install(goto 전) → 가상 시간으로 슬라이드가 막 바뀐 시점을 찾고(50ms 단위) 다음 전환 직전(+2.4초)까지 진행 →
//       recordSeq(1/60초씩 runFor + getAnimations currentTime 동기화, 프레임마다 스크린샷·PII 검사) 6초 = 전환 2번(약 0.4초·3.2초 지점).
import { launch, recordSeq, log } from '../../tools/lib.mjs';
import { ctxFor, BASE, armRedact } from './common.mjs';

const vp = process.argv[2] || 'desktop';
const browser = await launch();
try {
  const { page } = await ctxFor(browser, vp, { clock: true });
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2500); // 하이드레이션 대기(실시간) — 이 동안 가상 시계도 흐른다
  await armRedact(page);
  const idx = () => page.evaluate(() => {
    const el = [...document.querySelectorAll('[class*="transition-transform"]')].find((e) => /translateX\(-?\d+(\.\d+)?%\)/.test(e.style.transform || ''));
    if (!el) return null;
    return Math.round(Math.abs(parseFloat(el.style.transform.match(/translateX\((-?[\d.]+)%\)/)[1])) / 100 * (el.children.length ? 1 : 1));
  });
  const first = await idx();
  log('초기 슬라이드 인덱스(transform 기준)', first);
  if (first === null) throw new Error('캐러셀 트랙을 못 찾음');
  await page.clock.pauseAt(Date.now() + 50);
  let cur = await idx(), steps = 0;
  while (steps < 120) { // 최대 6초
    await page.clock.runFor(50); steps++;
    const n = await idx();
    if (n !== cur) { log(`전환 감지: ${cur} → ${n} (가상 +${steps * 50}ms)`); cur = n; break; }
  }
  if (steps >= 120) throw new Error('전환을 못 찾음');
  await page.clock.runFor(2300); // 다음 전환(+2800) 직전
  // 방금 전환의 CSS transition 이 실시간으로 끝날 때까지 기다린다(서버 부하가 크면 오래 걸린다). 시계는 멈춘 채 둔다 — recordSeq 가 pauseAt 한다.
  for (let i = 0; i < 80; i++) {
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.constructor.name === 'CSSTransition' && a.playState === 'running').length);
    if (!running) break;
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(600);
  const r = await recordSeq(page, `hero-carousel-${vp}`, { durationMs: 6000 });
  log('seq 완료', r.out, r.frames);
} finally {
  await browser.close();
}
