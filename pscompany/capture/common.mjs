// pscompany 촬영 공통 — 운영 공개 화면 https://pscp.to 를 GET 으로만 연다(소스 저장소 없음).
// 지원서 제출은 Next 서버 액션 POST(next-action 헤더) → guard.fake 로 가짜 성공(RSC flight)을 준다. 로그인 시도 없음.
import { newContext } from '../../tools/lib.mjs';
import { execFileSync } from 'node:child_process';

export const BASE = 'https://pscp.to';

// 촬영 직전에 운영 HTML 의 flight 에서 현재 빌드 ID 를 다시 읽는다(재배포되면 바뀜).
export async function readBuildId() {
  const html = await (await fetch(`${BASE}/recruit`)).text();
  const m = html.match(/\\"b\\":\\"([A-Za-z0-9_-]{10,40})\\"/) || html.match(/"b":"([A-Za-z0-9_-]{10,40})"/);
  if (!m) throw new Error('빌드 ID 를 못 읽음');
  return m[1];
}

export function guardFor(buildId) {
  const flight = `0:{"a":"$@1","f":"","b":"${buildId}"}\n1:{"ok":true}\n`;
  return {
    fake: [
      // 지원서 제출(서버 액션) — 현재 경로로 POST. 문의·로그인 액션도 같은 방식으로 가로챈다(제출하지 않지만 안전망).
      { match: 'pscp.to/recruit', method: 'POST', body: flight, contentType: 'text/x-component' },
      { match: 'pscp.to/contact', method: 'POST', body: flight, contentType: 'text/x-component' },
      { match: 'pscp.to/manage', method: 'POST', body: flight, contentType: 'text/x-component' },
    ],
    // 전화·카톡·메일로 나가는 링크는 열지 않는다
    blockGet: ['open.kakao.com', 'pf.kakao.com'],
  };
}

// 가림: 푸터 연락처·주소·사업자정보·SNS, /recruit·/recruit/sales 「접수 문의」 블록, 성공 카드의 전화·카톡 안내.
// (셀렉터는 exploreDom 결과로 확정 — 아래 REDACT 는 pages.mjs 에서 채운다)
export async function ctxFor(browser, vp, { redact, buildId, clock = false } = {}) {
  const { ctx, page } = await newContext(browser, vp, { project: 'pscompany', guard: guardFor(buildId), redact, clock });
  const reqs = [];
  page.on('request', (r) => reqs.push({ m: r.method(), u: r.url() }));
  page.on('pageerror', (e) => console.log('  [pageerror]', String(e.message).slice(0, 160)));
  page.__reqs = reqs;
  return { ctx, page, reqs };
}
