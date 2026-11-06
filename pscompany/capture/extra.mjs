// 텍스트 기준 가림(lib 의 셀렉터 규칙으로 안 되는 것) — 하이드레이션이 끝난 뒤 걸고 MutationObserver 로 유지한다.
//  · 푸터 CONTACT·COMPANY 열(전화·이메일·카카오·사업자번호·주소)과 소셜 아이콘 줄
//  · 「접수 문의」 블록의 연락처 링크 줄, /recruit/sales 의 문의 줄, 성공 카드의 전화·카톡 안내
//  · 수익 문구(○○만원) — 브리프 §9: 수익 예시는 캡처에 넣지 않는다
// 요소는 지우지 않고 visibility:hidden (레이아웃 유지).
export const EXTRA_REDACT = `(() => {
  if (window.__psRedact) return; window.__psRedact = true;
  const hide = (el) => el && el.style.setProperty('visibility', 'hidden', 'important');
  const MONEY = /\\d[\\d,~\\-\\s]*만\\s?원/;
  const CONTACT_RX = /(전화|카카오톡|카톡|이메일)\\s*(@|\\d|[A-Za-z0-9._%+-]+@)|lycsky|사업자등록번호|광주광역시|상무연하로/;
  const run = () => {
    // 푸터: 열 제목이 CONTACT·COMPANY 인 열의 목록, 소셜 줄
    for (const f of document.querySelectorAll('footer')) {
      f.querySelectorAll('ul[aria-label="소셜 채널"]').forEach(hide);
      f.querySelectorAll('div').forEach((d) => {
        const t = (d.firstElementChild && d.firstElementChild.tagName === 'DIV' ? d.firstElementChild.textContent : '').trim();
        if (t === 'CONTACT' || t === 'COMPANY') d.querySelectorAll('ul').forEach(hide);
      });
    }
    // 본문: 전화·카톡·메일 링크 묶음(링크들의 부모)
    for (const a of document.querySelectorAll('main a[href^="tel:"], main a[href^="mailto:"], main a[href*="kakao.com"], main a[href^="#"][data-x]')) {
      let p = a.parentElement; // 링크 3개가 들어 있는 줄
      if (p && p.querySelectorAll('a').length >= 2) hide(p); else hide(a);
    }
    // 글자 기준: 연락처 안내 문구·수익 문구가 든 가장 안쪽 요소
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      const el = n.parentElement;
      if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
      const v = n.nodeValue;
      if (MONEY.test(v)) hide(el);
      if (/급한 문의|카카오톡|lycsky/.test(v) && !el.closest('label,form,nav,button')) hide(el);
    }
  };
  const start = () => { run(); new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true, characterData: true }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();`;

// 얼굴이 보이는 크리에이터 사진이 있으면 그 이미지에만 흐림(이 프로젝트의 촬영 화면에는 없지만 안전망)
export const BLUR_CSS = `img[alt^="피에스컴퍼니 소속 크리에이터"] { filter: blur(18px) !important; }`;
