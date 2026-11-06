// eureka 상태 흐름 촬영. 실행: cd ~/prism-media && node eureka/capture/flows.mjs <quote|live|posts> <desktop|mobile>
//   quote : 견적 폼 — 빈 폼 → 입력(이름·연락처·지역·상세주소·증상) → 사진 선택(가짜 이미지 3장, setInputFiles) → 제출 직전(동의 체크). 제출 버튼은 누르지 않는다.
//   live  : 현황판 상태가 올라가는 단계(데모 모드 — 클라이언트가 2.5초마다 행을 끼우고 1.5초마다 한 행의 상태를 올린다). page.clock 으로 시간을 진행.
//   posts : 작업사례 지역 필터(/posts → 지역 칩 → /posts/region/<구>)
import { launch, startFlow, settle, log, sleep } from '../../tools/lib.mjs';
import { ctxFor, BASE, armRedact } from './common.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const flowName = process.argv[2] || 'quote';
const vp = process.argv[3] || 'desktop';
const here = path.dirname(fileURLToPath(import.meta.url));
const FAKE = [1, 2, 3].map((i) => path.join(here, 'fake', `fake-ceiling-${i}.jpg`));

const browser = await launch();
try {
  const { page, reqs } = await ctxFor(browser, vp, { clock: flowName === 'live' });
  const nonGetCount = () => reqs.filter((r) => r.m !== 'GET').length;

  if (flowName === 'quote') {
    // 폼이 뷰포트 한 장보다 커서(데스크톱 약 840→1000px, 모바일 더 큼) 같은 scrollY 한 곳에 전부 담을 수 없다.
    // 같은 입력 순서를 두 번 돌려 흐름 둘로 나눈다: fields(폼 위쪽: 이름·연락처·지역·상세주소·증상·사진) / submit(폼 아래쪽: 사진·동의·제출 버튼 직전).
    const form = page.locator('#quote-form form');
    const VH = vp === 'desktop' ? 900 : 844;
    const open = async () => {
      await page.goto(BASE + '/', { waitUntil: 'load' });
      await page.waitForTimeout(2000);
      await settle(page, {}); // 지연 로딩 이미지가 다 뜬 뒤 위치를 잰다(안 하면 폼이 아래로 밀린다)
      await armRedact(page);
      await page.evaluate(() => document.querySelector('#quote-form form').scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.waitForTimeout(500);
      return page.evaluate(() => { const r = document.querySelector('#quote-form form').getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; });
    };
    const fillText = async () => {
      await page.fill('#customer_name', '김○○');
      await page.fill('#phone', '01000000000');
    };
    const fillRest = async () => {
      await form.getByRole('button', { name: '서울', exact: true }).click();
      await form.getByRole('button', { name: '강남구', exact: true }).click();
      await page.fill('#apartment', '○○아파트');
      await page.fill('#symptom', '화장실 천장에서 물이 떨어지고 얼룩이 점점 커지고 있어요. 어제부터 시작됐습니다.');
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
    };
    const addPhotos = async () => {
      const before = reqs.length;
      await page.setInputFiles('#images', FAKE);
      await page.waitForTimeout(1500);
      const after = reqs.slice(before).map((r) => `${r.m} ${new URL(r.u).host}${new URL(r.u).pathname}`);
      log('사진 선택 직후 새 요청:', after.length, after);
    };
    const agree = async () => { await page.check('input[name=agree]'); await page.evaluate(() => document.activeElement && document.activeElement.blur()); };

    // 시험 한 번(저장 없음): 끝 상태에서 제출 버튼 바닥 위치를 잰다
    let m = await open();
    await fillText(); await fillRest(); await addPhotos(); await agree();
    const subBottom = await page.evaluate(() => Math.round(document.querySelector('#quote-form form button[type=submit]').getBoundingClientRect().bottom + scrollY));
    log('dry-run: form top', m.top, 'h', m.h, 'submit bottom', subBottom);

    // 흐름 1: fields — 이름 입력칸이 고정 머리 바로 아래에 오는 위치
    m = await open();
    const syA = m.top - (vp === 'desktop' ? 125 : 115);
    const f1 = await startFlow(page, `quote-form-fields-${vp}`, { scrollY: syA });
    await f1.step('empty');
    await fillText();
    await f1.step('name-phone-entered');
    await fillRest();
    await f1.step('region-address-symptom');
    await addPhotos();
    await f1.step('photos-selected');

    // 흐름 2: submit — 마지막 상태의 제출 버튼 바닥이 화면 아래쪽에 오는 위치
    m = await open();
    const syB = Math.max(0, subBottom + 50 + (vp === 'desktop' ? 0 : 110) - VH); // 모바일은 하단 탭바(약 80px)가 버튼을 가리지 않게 더 올린다
    const f2 = await startFlow(page, `quote-form-submit-${vp}`, { scrollY: syB });
    await f2.step('empty');
    await fillText(); await fillRest(); await addPhotos();
    await f2.step('photos-selected');
    await agree();
    await f2.step('ready-to-submit');
    log('scrollY fields', syA, 'submit', syB, '· 제출 버튼은 누르지 않음. 비GET 시도 누계', nonGetCount(), [...new Set(reqs.filter((r) => r.m !== 'GET').map((r) => r.m + ' ' + new URL(r.u).pathname))]);
  }

  if (flowName === 'live') {
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await armRedact(page);
    await page.clock.pauseAt(Date.now() + 100);
    await page.clock.runFor(200);
    const sy = vp === 'desktop' ? 0 : 295;
    const f = await startFlow(page, `live-board-progress-${vp}`, { scrollY: sy });
    const snap = () => page.evaluate(() => [...document.querySelectorAll('ul[aria-live] li')].map((li) => {
      const sp = [...li.querySelectorAll('span')].map((s) => s.textContent.trim());
      return sp.filter((t) => /^(작업접수|상담진행|작업출동|작업완료)$/.test(t))[0] + (li.dataset.statusChanged === 'true' ? '*' : '') + (li.dataset.justAdded === 'true' ? '+' : '');
    }).join(' | '));
    log('t=0', await snap());
    await f.step('t0-initial', { settleMs: 300 });
    let tNow = 0;
    for (const t of [6, 15, 30]) {
      await page.clock.runFor((t - tNow) * 1000); tNow = t;
      await page.waitForTimeout(500); // 전환·핀 애니메이션 정착(실시간)
      log(`t=${t}s`, await snap());
      await f.step(`t${String(t).padStart(2, '0')}s`, { settleMs: 300 });
    }
  }

  if (flowName === 'posts') {
    await page.goto(BASE + '/posts', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    const chipTop = await page.evaluate(() => Math.round(document.querySelector('a[href="/posts/region/gangnam"]').getBoundingClientRect().top + scrollY));
    const sy = Math.max(0, chipTop - (vp === 'desktop' ? 260 : 220));
    log('chip top', chipTop, 'scrollY', sy);
    const f = await startFlow(page, `posts-region-filter-${vp}`, { scrollY: sy });
    await f.step('all-posts');
    for (const [slug, label] of [['gangnam', 'gangnam'], ['dobong', 'dobong']]) {
      await page.evaluate((s) => window.scrollTo({ top: s, behavior: 'instant' }), sy);
      await page.locator(`a[href="/posts/region/${slug}"]`).first().click();
      await page.waitForURL(`**/posts/region/${slug}`, { timeout: 20000 });
      await page.waitForTimeout(1800);
      await f.step(`region-${label}`);
    }
  }
  log('가로챈 요청 수', page.context().__prismStats.intercepted, page.context().__prismStats.list.slice(-6));
} finally {
  await browser.close();
}
