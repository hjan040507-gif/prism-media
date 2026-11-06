// 모바일 상태 흐름: OX 퀴즈(시작 전→문항 1→2→3→결과). play_event 가짜 응답(모양: playEvent.tsx PlayResult — quiz_passed·score·review).
import { launch, mk, BASE, sleep } from './common.mjs';
import { startFlow } from '../../tools/lib.mjs';
const SLUG = 'demo-quiz-minimal';
// 문항·정답·해설은 운영 페이지의 데모 정의(lib/showcase/demos.ts quizConfig)와 같다. 응답 값만 가짜.
const WIN = { result: '아메리카노 기프티콘', already_participated: false, reward_id: 'x', slot_number: 1, participant_id: 'x', quiz_passed: true, score: { correct: 3, total: 3 },
  review: [{ correct: true, explanation: 'QR코드는 1994년 일본 덴소웨이브가 개발했어요.' }, { correct: true, explanation: '마케팅용 이름일 뿐, 공식 약자가 아니에요.' }, { correct: true, explanation: "'에모지(絵文字)' — 그림(絵)+문자(文字)에서 왔어요." }] };
const browser = await launch();
try {
  const { ctx, page } = await mk(browser, 'mobile', { guard: { fake: [
    { match: /\/api\/auth\/session-verify/, method: 'POST', json: { ok: false } },
    { match: /\/rest\/v1\/rpc\/play_event/, method: 'POST', json: WIN },
  ] } });
  await page.goto(`${BASE}/e/${SLUG}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await sleep(2500);
  const flow = await startFlow(page, 'quiz-play', { scrollY: 150 });
  await flow.step('ready');
  await page.locator('input[type=checkbox]').first().check();
  await page.getByRole('button', { name: '퀴즈 시작' }).click();
  await sleep(1200);
  await flow.step('question-1');
  const ans = ['X', 'X', 'O'];
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: ans[i], exact: true }).click();
    await sleep(i < 2 ? 1500 : 7000);
    if (i < 2) await flow.step(`question-${i + 2}`);
  }
  await flow.step('result', { note: '가짜 play_event 응답(quiz_passed·score 3/3)' });
  console.log('quiz flow done', ctx.__prismStats.list);
} finally { await browser.close(); }
