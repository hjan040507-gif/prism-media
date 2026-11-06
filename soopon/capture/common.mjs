// soopon 촬영 공통 — 운영 공개 화면 https://sooponfesta.com 을 GET 으로만 연다(원본 ~/Soopon 은 읽기만).
// 안전: ① GA/gtag 요청 전부 막음(고객 GA4 오염 방지, blockAll 메서드 무관) ② 비GET 은 lib 기본이 전부 가짜 200,
//       상담 서버 액션(POST /b2b · /b2b/inquiry + Next-Action)은 flight 형식 가짜 성공으로 fulfill.
//       ③ 예약하기·tel·SNS 링크는 누르지 않는다(스크립트에 click 없음 — blockGet 으로 외부 목적지 GET 도 가짜 200).
import { newContext } from '../../tools/lib.mjs';

export const BASE = 'https://sooponfesta.com';

// 서버 액션 응답(RSC flight). submitInquiry → { ok: true } 의 가짜.
export const ACTION_FLIGHT = '0:{"a":"$@1","f":"","b":"fake"}\n1:{"ok":true}\n';

export const GUARD = {
  // GA4(G-7ZB6E51805)·GTM 은 요청이 서버로 나가지 않게 전부 가짜 응답(막은 수는 json 의 intercepted)
  fake: [
    { match: 'googletagmanager.com', status: 200, contentType: 'application/javascript', body: '' },
    { match: 'google-analytics.com', status: 204, contentType: 'text/plain', body: '' },
    { match: 'analytics.google.com', status: 204, contentType: 'text/plain', body: '' },
    // 상담 신청 서버 액션(submitInquiry) — 현재 URL 로 가는 POST + Next-Action. flight 형식 가짜 성공
    { match: /^https:\/\/sooponfesta\.com\/b2b(\/inquiry)?(\?.*)?$/, method: 'POST', contentType: 'text/x-component', body: ACTION_FLIGHT },
  ],
  // 눌리면 외부(예약·홈페이지·SNS)로 나가는 것은 GET 이어도 열지 않는다
  blockGet: [/^https?:\/\/(?!sooponfesta\.com|[a-z0-9-]+\.supabase\.co)(?!.*\.(woff2?|ttf|css|js|png|jpe?g|webp|svg|gif|avif)(\?|$))[^/]*\/.*(booking\.naver|cafe\.naver|naver\.me|pcmap\.place|smartstore|instagram|facebook|youtube|kakao)/],
};

// 머리·꼬리·참여기업 연락처. 전화(→010-****-****)·이메일·URL 은 lib 가 자동으로 가린다. tel: href 도 lib 가 '#' 로 바꾼다.
export const REDACT = {
  remove: [],
  hide: [],
};

export async function ctxFor(browser, vp, opts = {}) {
  const { ctx, page } = await newContext(browser, vp, {
    project: 'soopon', guard: GUARD, redact: opts.redact || REDACT, clock: !!opts.clock,
  });
  const reqs = [];
  page.on('request', (r) => reqs.push({ m: r.method(), u: r.url() }));
  page.on('pageerror', (e) => console.log('  [pageerror]', String(e.message).slice(0, 160)));
  page.__reqs = reqs;
  return { ctx, page, reqs };
}

// 프로그램 상세·카드의 「지역」 줄에 업체 상세 도로명주소(예: 음봉면 충무로604번길 26-2)가 그대로 나온다 — 규칙: 주소는 시·구까지.
// lib 의 addr 정규식(시·도 + 구·군·시 + 도로명)에 안 걸리는 꼴이라 여기서 따로 지운다(읍·면·동·리 + 도로명 + 번지, 숫자+번길 + 번지).
// 하이드레이션 뒤에 건다(React #418 방지). 이후 클라이언트 렌더로 생긴 글자도 MutationObserver 가 바로 고친다.
export const ADDR_FIX = `(() => {
  if (window.__addrFix) return;
  const A = /[가-힣]+(?:읍|면|동|리)\\s+[가-힣]+(?:로|길)\\d*(?:번길)?\\s?\\d+(?:-\\d+)?/g;
  const B = /[가-힣]+\\d+번길\\s?\\d+(?:-\\d+)?/g;
  const fix = (s) => s.replace(A, '').replace(B, '');
  const run = () => {
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n; while ((n = tw.nextNode())) { if (n.parentElement && /^(SCRIPT|STYLE)$/.test(n.parentElement.nodeName)) continue; const v = fix(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
    for (const el of document.querySelectorAll('[alt],[title],[aria-label]')) for (const a of ['alt', 'title', 'aria-label']) { const c = el.getAttribute(a); if (c) { const v = fix(c); if (v !== c) el.setAttribute(a, v); } }
  };
  window.__addrFix = true;
  run();
  const mo = new MutationObserver(() => { mo.disconnect(); try { run(); } finally { mo.observe(document, { subtree: true, childList: true, characterData: true }); } });
  mo.observe(document, { subtree: true, childList: true, characterData: true });
})();`;
export const armAddr = (page) => page.evaluate(ADDR_FIX);
