// hanil 촬영 공통 — 공개 화면은 운영 https://www.hanil-pnk.com (GET 만, 페이지 사이 ≥1초), 관리자는 사본+로컬 Supabase.
import { launch, newContext, sleep, log, capturePage, startFlow, recordSeq, recordScreencast, saveShot, redactNow, liveRedact, settle } from '../../tools/lib.mjs';

export const PROD = 'https://www.hanil-pnk.com';
export const LOCAL = 'http://127.0.0.1:3613';
export { launch, newContext, sleep, log, capturePage, startFlow, recordSeq, recordScreencast, saveShot, redactNow, liveRedact, settle };

// 푸터(대표이사·주소·전화·팩스)·머리 전화 링크는 지운다(숨고 연락처 노출 반려 규칙). 대표 이름은 가린다.
export const REDACT_PUBLIC = {
  remove: ['a[href^="tel:"]', 'a[href^="mailto:"]', 'footer dl'],
  textMap: { '정 대 성': '김○○', '정대성': '김○○' },
};

// 운영에는 비GET 이 0이어야 한다. 서버 액션 제출·파일 업로드는 절대 안 한다(lib 기본이 비GET 전부 가짜 200).
// GET 인데 서버가 쓰는 경로(자료 다운로드 카운트·크론)는 열지 않고, 열려도 가짜로 막는다.
export const GUARD_PUBLIC = {
  blockGet: [`${PROD}/api/library/`, `${PROD}/api/cron/`],
};

// 페이지 사이 간격(Vercel 체크포인트 방지)
export const gap = () => sleep(1500);

// 히어로 자동 전환(setInterval 6000)을 멈춘다 — 정지 화면 촬영이 첫 장(01/03)으로 고정되게. seq 는 이걸 쓰지 않는다.
export const FREEZE_HERO = `(() => { const si = window.setInterval.bind(window); window.setInterval = (f, ms, ...a) => (ms === 6000 ? 0 : si(f, ms, ...a)); })();`;

export async function gotoReady(page, url, { tries = 3 } = {}) {
  for (let k = 1; ; k++) {
    let res;
    try { res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); }
    catch (e) { if (k >= tries) throw e; log('goto 재시도', e.message.split('\n')[0].slice(0, 80)); await page.waitForTimeout(4000); continue; }
    const st = res ? res.status() : 0;
    if (st !== 200) throw new Error(`${url} → HTTP ${st}`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    // CSS 가 안 붙은 채(첫 요청 실패) 찍히는 일이 한 번 있었다 → 고정 헤더가 fixed 인지로 확인하고 아니면 다시 연다
    const styled = await page.evaluate(() => { const h = document.querySelector('header'); return !!h && getComputedStyle(h).position !== 'static'; }).catch(() => false);
    if (styled) return st;
    if (k >= tries) throw new Error(`${url} — 스타일시트가 안 붙는다(${tries}회)`);
    await page.waitForTimeout(3000);
  }
}
