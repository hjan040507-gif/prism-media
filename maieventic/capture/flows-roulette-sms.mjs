// 모바일 상태 흐름: 룰렛 참여(시작 전→동의→도는 중→결과) · 문자 인증(번호→인증번호→완료).
// play_event·문자는 전부 가짜 응답(운영 호출 0). 응답 모양: playEvent.tsx PlayResult · auth send-code/verify-code.
import { launch, mk, BASE, sleep } from './common.mjs';
import { startFlow } from '../../tools/lib.mjs';
const which = process.argv[2] || 'all';
const SLUG = 'demo-roulette-mz-bright';
const WIN = { result: '스타벅스 아메리카노', already_participated: false, reward_id: 'x', slot_number: 1, participant_id: 'x' };
const guardNoSession = { fake: [{ match: /\/api\/auth\/session-verify/, method: 'POST', json: { ok: false } }] };
const browser = await launch();
async function ready(page) {
  await page.goto(`${BASE}/e/${SLUG}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await sleep(2500);
}
// play_event 를 가짜로 — release() 를 부를 때까지 응답을 잡아 두어 "도는 중" 장면을 만든다
function holdPlay(ctx) {
  let release; const gate = new Promise((r) => { release = r; });
  ctx.route(/\/rest\/v1\/rpc\/play_event/, async (route) => {
    ctx.__prismStats.intercepted++; ctx.__prismStats.list.push('POST /rest/v1/rpc/play_event (fake, held)');
    await gate;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(WIN) });
  });
  return release;
}
try {
  if (which === 'all' || which === 'roulette') {
    const { ctx, page } = await mk(browser, 'mobile', { guard: guardNoSession });
    const release = holdPlay(ctx);
    await ready(page);
    const flow = await startFlow(page, 'roulette-play', { scrollY: 380 });
    await flow.step('ready-unchecked');
    for (const cb of await page.locator('input[type=checkbox]').all()) await cb.check();
    await flow.step('consent-checked');
    await page.getByRole('button', { name: '룰렛 시작' }).click();
    await sleep(1800);
    await flow.step('spinning', { note: 'play_event 응답을 잡아 둔 상태(돌리는 중…)' });
    release();
    await sleep(9000);
    await flow.step('result-win', { note: '가짜 play_event 응답 {result:"스타벅스 아메리카노"} — 서버 응답을 가로채 채움' });
    console.log('roulette flow done', ctx.__prismStats.list);
  }
  if (which === 'all' || which === 'sms') {
    // 가림 도구의 입력 감시(input 이벤트 캡처 리스너)는 타이핑 도중 번호를 010-****-**** 로 바꿔 React 상태를 망가뜨린다 →
    // 타이핑 중엔 그 리스너만 건너뛰고(가림은 저장 직전 saveShot 이 DOM 을 바꾼다), 가짜 번호 1000000000 은 textMap 으로 010-****-**** 표시.
    const { ctx, page } = await mk(browser, 'mobile', { guard: guardNoSession, redact: { textMap: { '1000000000': '010-****-****' } } });
    await ctx.addInitScript(() => {
      const orig = document.addEventListener.bind(document);
      document.addEventListener = (t, f, o) => { if (t === 'input' && o === true && String(f).includes('redactAll')) return; return orig(t, f, o); };
    });
    // 라이브 데모 이벤트는 auth.phone=false 로 발행돼 있어 문자 칸이 안 뜬다. 코드의 데모 정의(lib/showcase/demos.ts:94 roulette auth.phone=true)와 같게
    // 이 문서 응답의 config.auth.phone 한 값만 true 로 바꿔 실제 문자 인증 UI 를 띄운다(화면 코드는 그대로).
    await page.route(new RegExp(`/e/${SLUG}(\\?.*)?$`), async (route) => {
      if (route.request().resourceType() !== 'document') return route.fallback();
      const resp = await route.fetch();
      let body = await resp.text();
      const n = (body.match(/\\"auth\\":\{\\"phone\\":false/g) || []).length;
      body = body.replace(/\\"auth\\":\{\\"phone\\":false/g, '\\"auth\\":{\\"phone\\":true');
      console.log('patched auth.phone occurrences:', n);
      const headers = { ...resp.headers() }; delete headers['content-encoding']; delete headers['content-length'];
      await route.fulfill({ status: resp.status(), headers, body });
    });
    await ready(page);
    const flow = await startFlow(page, 'sms-verify', { scrollY: 420 });
    await flow.step('phone-empty');
    await page.getByPlaceholder('휴대폰 번호').fill('1000000000');
    await flow.step('phone-entered');
    await page.getByRole('button', { name: '인증번호' }).click();
    await page.getByPlaceholder('인증번호 6자리').waitFor({ timeout: 10000 });
    await sleep(600);
    await flow.step('code-field', { note: '가짜 send-code 응답 {ok:true,ttlSec:300}' });
    await page.getByPlaceholder('인증번호 6자리').fill('000000');
    await flow.step('code-entered');
    await page.getByRole('button', { name: '확인' }).click();
    await page.getByText('인증 완료').waitFor();
    await sleep(600);
    await flow.step('verified', { note: '가짜 verify-code 응답 {ok:true,verified:true}' });
    console.log('sms flow done', ctx.__prismStats.list);
  }
} finally { await browser.close(); }
