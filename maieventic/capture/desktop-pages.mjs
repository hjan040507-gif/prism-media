// 데스크톱 1440 공개 페이지: 랜딩·요금제·쇼케이스(+사례 1). 로그인 없음. 운영 쓰기 0(비GET 가로챔).
import { launch, mk, BASE, sleep } from './common.mjs';
import { capturePage } from '../../tools/lib.mjs';
const only = process.argv.slice(2);
const browser = await launch();
try {
  const pages = [
    ['landing', '/'],
    ['pricing', '/pricing'],
    ['showcase', '/showcase'],
    // ['showcase-case-marra', '/showcase/case/marra-gongbang'], // 사례 이미지 안에 고객사 도메인(브라우저 주소창)이 찍혀 있어 폐기 — BLOCKED.md
  ];
  for (const [name, p] of pages) {
    if (only.length && !only.includes(name)) continue;
    // 쇼케이스는 제작 사례 이미지 alt 에 'QR'(테이블 QR 룰렛 …)이 있어 자동 QR 가림이 사진을 지운다 → 이 페이지엔 QR 이미지가 없으므로 자동 QR 가림만 끈다(전화·이메일·URL 규칙은 그대로)
    const { page } = await mk(browser, 'desktop', name.startsWith('showcase') ? { redact: { qr: false } } : {});
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await sleep(1500);
    // lazy 이미지(next/image)가 늦게 뜨는 페이지 대비: 천천히 한 번 훑고 모든 img 가 로드될 때까지 기다린다
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 250)); } window.scrollTo(0, 0); });
    await page.waitForFunction(() => [...document.images].every((i) => i.complete && (i.naturalWidth > 0 || !i.currentSrc)), null, { timeout: 15000 }).catch(() => {});
    await sleep(1000);
    const r = await capturePage(page, name);
    console.log(name, r.full.docHeight, 'pii', r.full.pii_scan.total, r.view.pii_scan.total, 'intercepted', r.view.intercepted.total);
  }
} finally { await browser.close(); }
