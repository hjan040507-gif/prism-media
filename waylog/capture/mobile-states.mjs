// 모바일 상태 흐름(각 3~4단계) + seq 2개. 같은 뷰포트·같은 window scrollY(오버레이 안 스크롤만 다름).
//   notif-toggles      설정 「알림」 묶음: 처음(5종 전부 켬) → 챌린지 리마인더 끔 → 팔로우 알림 끔 → 앱 소식 끔(가짜 백엔드 메모리에만 쓰기)
//   challenge-8wk-open 챌린지 탭 → 「8주 식단 챌린지」 오버레이 열림 → 이번 주 미션 → AI 권장 생활습관 카드(저장된 결과)
//   story-compose      쓰기 시트 → 이야기 쓰기 빈 폼 → 글 입력 → (제출 직전, 올리기는 안 누름)
//   admin-news         소식 보내기 빈 폼 → 제목·본문 입력 → 「모든 사용자에게 발송」 확인창(보내기는 안 누름)
//   seq: challenge-open(오버레이 슬라이드업) · toggle-switch(알림 토글 전환)
import fs from 'node:fs';
import { startFlow, recordSeq } from '../../tools/lib.mjs';
import { openBrowser, session, goHome, summary, MOBILE, BASE } from './common.mjs';

const browser = await openBrowser();
const results = {};
const fails = [];
const only = process.argv[2];
const step = async (name, fn) => { if (only && only !== name) return; try { await fn(); console.log('ok', name); } catch (e) { fails.push(name); console.log('FAIL', name, String(e.message).split('\n')[0].slice(0, 300)); } };
const quiet = async (page, ms = 1500) => { await page.waitForLoadState('networkidle').catch(() => {}); await page.waitForTimeout(ms); };
// 토글을 누르고 저장이 끝나(aria-checked 가 바뀌고 저장 중이 풀릴 때)까지 기다린다 — 고정 대기는 서버 부하에 따라 어긋난다
const toggle = async (page, name, to) => {
  const sw = page.getByRole('switch', { name });
  await sw.click();
  await page.waitForFunction(([nm, want]) => { const el = [...document.querySelectorAll('[role=switch]')].find((e) => new RegExp(nm).test(e.getAttribute('aria-label') || '')); return el && el.getAttribute('aria-checked') === String(want) && !el.disabled; }, [name.source, to], { timeout: 15000 });
  await page.waitForTimeout(1200);
};
const openSettings = async (page, wait) => {
  await page.goto(`${BASE}/profile/me`);
  await page.locator('[data-open-settings]').click();
  await page.getByText(wait).first().waitFor({ timeout: 30000 });
  await quiet(page, 1500);
};
try {
  // ── 회원 세션 ──
  let s = await session(browser, MOBILE, { account: 'main' });
  let { page } = s;
  await step('notif-toggles', async () => {
    await openSettings(page, '푸시 알림 켜기');
    const flow = await startFlow(page, 'notif-toggles');
    await flow.step('initial');
    await toggle(page, /챌린지 리마인더/, false);
    await flow.step('challenge-reminder-off');
    await toggle(page, /팔로우 알림/, false);
    await flow.step('follow-off');
    await toggle(page, /앱 소식/, false);
    await flow.step('news-off');
  });
  await step('seq-toggle', async () => {
    await page.getByRole('switch', { name: /좋아요 알림/ }).waitFor({ timeout: 10000 });
    await recordSeq(page, 'toggle-switch', { durationMs: 1200, start: async () => { await page.getByRole('switch', { name: /좋아요 알림/ }).click(); } });
  });
  results.member1 = summary(s);
  await s.ctx.close();

  s = await session(browser, MOBILE, { account: 'main' });
  page = s.page;
  await step('challenge-8wk-open', async () => {
    await goHome(page);
    await page.locator('nav a[href="/challenge"]').click();
    await page.locator('[data-challenge-card="diet"] button').first().waitFor({ timeout: 30000 });
    await quiet(page, 1500);
    const flow = await startFlow(page, 'challenge-8wk-open');
    await flow.step('tab-list');
    await page.locator('[data-challenge-card="diet"] button').first().click();
    await page.locator('[role="dialog"][aria-label="8주 식단 챌린지"]').waitFor({ timeout: 20000 });
    await quiet(page, 2200);
    await flow.step('overlay-top');
    // 오버레이 안 스크롤(window scrollY 는 0 그대로): 이번 주 미션 → AI 권장 생활습관 카드
    const scrollTo = (text) => page.evaluate((t) => {
      const d = document.querySelector('[role="dialog"][aria-label="8주 식단 챌린지"]');
      const sc = [...d.querySelectorAll('div')].find((e) => e.scrollHeight > e.clientHeight + 50 && /auto|scroll/.test(getComputedStyle(e).overflowY));
      const el = [...d.querySelectorAll('h2,h3,p,span')].find((e) => (e.textContent || '').trim().startsWith(t));
      if (!sc || !el) return false;
      sc.scrollTop = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 96;
      return true;
    }, text);
    const okMission = await scrollTo('오늘의 미션') || await scrollTo('이번 주 미션');
    console.log('mission scroll', okMission);
    await page.waitForTimeout(900);
    await flow.step('mission-checklist');
    const okAi = await scrollTo('이번 주 권장 생활습관');
    console.log('ai scroll', okAi);
    await page.waitForTimeout(900);
    await flow.step('ai-lifestyle-card');
  });
  results.member2 = summary(s);
  await s.ctx.close();

  s = await session(browser, MOBILE, { account: 'main' });
  page = s.page;
  await step('seq-challenge-open', async () => {
    await goHome(page);
    await page.locator('nav a[href="/challenge"]').click();
    await page.locator('[data-challenge-card="diet"] button').first().waitFor({ timeout: 30000 });
    await quiet(page, 1500);
    await recordSeq(page, 'challenge-open', { durationMs: 1000, start: async () => { await page.locator('[data-challenge-card="diet"] button').first().click(); } });
  });
  results.member3 = summary(s);
  await s.ctx.close();

  s = await session(browser, MOBILE, { account: 'main' });
  page = s.page;
  await step('story-compose', async () => {
    await goHome(page);
    await page.locator('[data-home-feed="all"] [data-feed-item]').first().waitFor({ timeout: 40000 });
    await quiet(page, 1200);
    const flow = await startFlow(page, 'story-compose');
    await page.locator('[data-write-fab]').click();
    await page.getByRole('dialog', { name: '무엇을 올릴까요?' }).waitFor({ timeout: 15000 });
    await flow.step('write-sheet');
    await page.locator('[data-write="story"]').click();
    await page.locator('[data-compose="story"]').waitFor({ timeout: 15000 });
    await quiet(page, 1000);
    await flow.step('story-empty');
    await page.locator('#compose-body').fill('오늘은 아침 산책 40분, 점심은 현미 비빔밥 반 공기로 먹었어요. 저녁엔 가볍게 샐러드 예정!');
    await page.waitForTimeout(600);
    await flow.step('story-filled');
  });
  results.member4 = summary(s);
  await s.ctx.close();

  // ── 관리자 세션 ──
  s = await session(browser, MOBILE, { account: 'admin' });
  page = s.page;
  await step('admin-news', async () => {
    await openSettings(page, '신고 모더레이션');
    await page.getByText('신고 모더레이션').first().click();
    await page.getByRole('button', { name: '소식 보내기' }).first().waitFor({ timeout: 20000 });
    await page.getByRole('button', { name: '소식 보내기' }).first().click();
    await page.getByText('앱 소식 보내기').first().waitFor({ timeout: 15000 });
    await quiet(page, 1200);
    const flow = await startFlow(page, 'admin-news');
    await flow.step('empty');
    await page.getByLabel('소식 제목').fill('새 기능 안내');
    await page.getByLabel('소식 본문').fill('8주 식단 챌린지에 주간 리포트가 추가됐어요. 앱을 최신 버전으로 업데이트해 보세요.');
    await page.waitForTimeout(600);
    await flow.step('typed');
    await page.getByRole('button', { name: /모든 사용자에게 발송/ }).click();
    await page.getByText('모든 사용자에게 보낼까요?').waitFor({ timeout: 10000 });
    await page.waitForTimeout(700);
    await flow.step('confirm-dialog-not-sent');
  });
  results.admin = summary(s);
  await s.ctx.close();
} finally {
  await browser.close();
  fs.writeFileSync(new URL(`./tally-mobile-states${only ? '-' + only : ''}.json`, import.meta.url), JSON.stringify({ at: new Date().toISOString(), fails, results }, null, 1));
  console.log('FAILS', JSON.stringify(fails));
}
