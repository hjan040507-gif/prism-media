// medimajor 촬영 공통 — 운영 https://medimajor.com 을 Playwright 가로채기로 찍는다(로컬 실행 없음).
// 안전: ① 매물 상세는 허용 목록 1개만, 그리고 요청 UA 가 BOT 정규식(레포 src/lib/lot-stats.ts:16)에 걸릴 때만 통과
//       ② 허용 목록 밖의 /auctions/<uuid>(Next prefetch 포함)는 abort ③ 비GET 은 lib guard 가 전부 가짜 200
import { launch, newContext, VIEWPORTS } from '../../tools/lib.mjs';
import { BOT, baseUA, uaFor } from './ua-test.mjs';
export { launch, BOT };

export const ORIGIN = 'https://medimajor.com';
// 미래온 MQE-102 뇌파 검사기 — 마감 2026-11-14 22:25 KST(촬영 시각 2026-11-06 으로부터 8일 뒤). 공개 목록에서 확인.
export const LOT = '0ca69e33-a36d-4fa3-a9f9-bd991d7ebdc8';
export const LOT_ENDS_NOTE = '2026-11-14T22:25+09:00';
const LOT_RE = /^\/(?:(?:ko|en|zh-cn|ja|th|hi)\/)?auctions\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

// 가림: 머리 고객센터 번호·푸터 대표번호·사업자정보·팩스·주소는 remove(전화는 자동 치환 대신 지움), 홈 거래 원칙 줄의 번호도 지움
export const REDACT = {
  remove: ['.u-r a[href="/contact"]', '.ft-tel', '.ft-biz', '.h7-rules li:last-child'],
  hide: [],
  ids: [],
};

export const SUPABASE_HOST = 'bkdszypustbzlnmehmxm.supabase.co';
export const stats = { blockedLot: 0, lotOpened: [], lotUA: [] };

export async function mk(browser, vp, { clock = false, redact = REDACT, guard = {}, storageState } = {}) {
  const base = await baseUA(browser);
  const ua = uaFor(vp, base);
  if (!BOT.test(ua)) throw new Error('UA 가 BOT 정규식에 안 걸린다 — 중단');
  const { ctx, page } = await newContext(browser, vp, { project: 'medimajor', clock, redact, guard, storageState, extra: { userAgent: ua } });
  // 이미 마스킹돼 있는 표시명(홍** 꼴, 서버가 내려주는 값)을 규칙 형식으로 한 번 더 바꾼다: 입찰 이력=user***, 그 밖(삽니다 요청자 등)=김○○
  await ctx.addInitScript(() => {
    const RE = /^([가-힣])\*\*(?=\s|$)/;
    const fix = (root) => {
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let t; while ((t = tw.nextNode())) {
        const v = t.nodeValue; if (!RE.test(v.trim())) continue;
        const inBid = t.parentElement && t.parentElement.closest('.bh,.bh-r,.who,[class*=bid-hist],[class*=bidder]');
        t.nodeValue = v.replace(RE, inBid ? 'user***' : '김○○');
        const who = t.parentElement && t.parentElement.closest('.who');
        if (who) { const av = who.querySelector('.avatar'); if (av && av.textContent !== 'u') av.textContent = 'u'; }
      }
    };
    const run = () => { try { fix(document.body || document.documentElement); } catch {} };
    new MutationObserver(run).observe(document, { subtree: true, childList: true, characterData: true });
    document.addEventListener('DOMContentLoaded', run); setInterval(run, 400);
  });
  // 나중에 건 route 가 먼저 돈다 — 상세 접근 통제(통과 시 fallback → lib guard)
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    let u; try { u = new URL(req.url()); } catch { return route.fallback(); }
    if (u.host !== 'medimajor.com') return route.fallback();
    const m = LOT_RE.exec(u.pathname);
    if (!m) return route.fallback();
    const id = m[1].toLowerCase();
    const reqUA = req.headers()['user-agent'] || '';
    if (id !== LOT || !BOT.test(reqUA)) { stats.blockedLot++; return route.abort(); }
    if (req.method() === 'GET' && (req.resourceType() === 'document')) { stats.lotOpened.push(id); stats.lotUA.push(BOT.test(reqUA)); }
    return route.fallback();
  });
  return { ctx, page, ua };
}

export const gotoPage = async (page, p, opts = {}) => {
  await page.goto(ORIGIN + p, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(opts.wait ?? 800);
};
