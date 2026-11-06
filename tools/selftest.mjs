// 도구 자체 시험: 가짜 사이트(https://selftest.local)로 가림·검사·가로채기·흐름·영상·긴 전체 화면을 확인한다.
// 사용: node tools/selftest.mjs  → tmp/selftest/ 에 결과, 마지막 줄 SELFTEST PASS/FAIL
import fs from 'node:fs';
import path from 'node:path';
import { launch, newContext, capturePage, startFlow, recordSeq, liveRedact, saveShot, ROOT } from './lib.mjs';

const HTML = `<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>시험</title><style>
body{margin:0;font-family:sans-serif} header{position:fixed;top:0;left:0;right:0;height:64px;background:#123;color:#fff;display:flex;align-items:center;padding:0 16px;z-index:9}
main{padding-top:80px} .sec{height:900px;border-bottom:1px solid #ccc;padding:20px} .box{width:80px;height:80px;background:#e50914;animation:mv 2s linear infinite}
@keyframes mv{from{transform:translateX(0)}to{transform:translateX(300px)}} footer{padding:20px;background:#eee}
</style></head><body><header><b>LOGO</b>&nbsp;<span class=hdr-phone>대표 1588-1234</span></header><main>
<div class=sec><h1>홈</h1><p class=nm>홍길동 님</p><p>연락처 010-1234-5678 · mail test.user@example.com</p><p>방문 https://example.com/a 또는 sealkitt.com</p>
<p class=extra>주민2 9001011234567 · 주소 부산광역시 해운대구 센텀로 45 · 은행 국민 12345678901234 · 시각 1730812345678</p><div id=sh></div><p>계좌 110-123-456789 · 사업자 123-45-67890 · 날짜 2026-11-05 · 주민 900101-1234567 · 차량 12가 3456 · 100개 1500원 · 11월 2026</p>
<input id=q placeholder="카드 검색" value=""><button id=go>검색</button><div id=res></div><img alt="qr code" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" width=60 height=60 class=qr>
<div class=box></div></div><div class=sec><h2>둘째</h2></div><div class=sec><h2>셋째</h2></div><div class=sec><h2>넷째</h2></div><div class=sec><h2>다섯째</h2></div><div class=sec><h2>여섯째</h2></div>
</main><footer class=ft>주소 서울특별시 강남구 테헤란로 123 4층 · 고객센터 02-123-4567 · help@corp.co.kr</footer>
<script>document.getElementById('sh').attachShadow({mode:'open'}).innerHTML='<span>shadow mail a.b@c.io</span>';setInterval(()=>{document.querySelector('.nm').textContent='홍길동 님';},400);document.getElementById('go').onclick=async()=>{const r=await fetch('/api/order',{method:'POST',body:'{}'});const j=await r.json();document.getElementById('res').textContent='응답 '+JSON.stringify(j)+' 담당 010-9999-8888';};
document.getElementById('q').addEventListener('input',e=>{document.getElementById('res').textContent='자동완성: '+e.target.value+'…';});</script></body></html>`;

const out = path.join(ROOT, 'selftest');
fs.rmSync(out, { recursive: true, force: true });
const results = [];
const check = (name, cond, info = '') => { results.push(cond); console.log(`${cond ? 'PASS' : 'FAIL'} ${name} ${info}`); };

const browser = await launch();
try {
  for (const vp of ['desktop', 'mobile']) {
    const { ctx, page } = await newContext(browser, vp, {
      project: 'selftest', clock: vp === 'mobile',
      redact: { names: ['.nm'], address: [], remove: ['.ft'], hide: [] },
    });
    await ctx.route('https://selftest.local/**', (route) => (route.request().method() === 'GET' && !route.request().url().includes('/api/') ? route.fulfill({ contentType: 'text/html', body: HTML }) : route.fallback()));
    await page.goto('https://selftest.local/');
    const { full, view } = await capturePage(page, 'home');
    check(`${vp} pii 0`, full.pii_scan.total === 0 && view.pii_scan.total === 0, JSON.stringify(full.redactions));
    const txt = await page.evaluate(() => document.body.innerText);
    check(`${vp} 날짜·수량·타임스탬프는 그대로`, txt.includes('2026-11-05') && txt.includes('100개 1500원') && txt.includes('11월 2026') && txt.includes('1730812345678'));
    check(`${vp} 주소는 시·구까지`, txt.includes('부산광역시 해운대구') && !txt.includes('센텀로'));
    check(`${vp} 이름·차량·전화 치환`, txt.includes('김○○') && txt.includes('12가 ****') && txt.includes('010-****-****'));
    check(`${vp} header.png`, fs.existsSync(path.join(out, vp, 'header.png')));
    const flow = await startFlow(page, `search-${vp}`);
    for (const ch of ['ㅍ', '피', '피카']) {
      await page.fill('#q', ch);
      await flow.step(`typed-${ch}`);
    }
    await page.click('#go');
    await page.waitForTimeout(300);
    const j = await flow.step('submitted');
    check(`${vp} POST 가로챔`, j.intercepted.new.some((s) => s.startsWith('POST /api/order')), JSON.stringify(j.intercepted.new));
    check(`${vp} 응답 속 전화도 치환`, j.pii_scan.total === 0);
    const nm = await page.evaluate(() => document.querySelector('.nm').textContent);
    check(`${vp} 다시 그려진 이름도 재가림`, nm === '김○○', nm);
    if (vp === 'mobile') {
      const r = await recordSeq(page, 'box-move', { durationMs: 1000 });
      const probe = JSON.parse((await import('node:child_process')).execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames,r_frame_rate,width,height', '-of', 'json', r.out]).toString()).streams[0];
      check('seq 60프레임·60fps·1170x2532', probe.nb_read_frames === '60' && probe.r_frame_rate === '60/1' && probe.width === 1170 && probe.height === 2532, JSON.stringify(probe));
    }
    await ctx.close();
  }
  // 회귀(2026-11-06 byclick): React 가 <html> 루트를 갈아 끼우면 실시간 가림이 끊겨 연락처가 PNG 에 남았다
  {
    const { ctx, page } = await newContext(browser, 'desktop', { project: 'selftest' });
    await page.route('https://regress.local/**', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><html><body><p>x</p><div id=sh></div><script>document.getElementById("sh").attachShadow({mode:"open"}).innerHTML="<span>s</span>";</script></body></html>' }));
    await page.goto('https://regress.local/');
    await liveRedact(page, true);
    const swapped = await page.evaluate(async () => {
      const h = document.createElement('html'); h.innerHTML = '<body><div>010-3456-7890</div></body>';
      document.replaceChild(h, document.documentElement);
      await new Promise((r) => setTimeout(r, 50));
      document.body.insertAdjacentHTML('beforeend', '<div>010-2345-6789</div>');
      await new Promise((r) => setTimeout(r, 50));
      return document.body.innerText;
    });
    check('루트 교체 뒤에도 실시간 가림', !/\d{4}-\d{4}/.test(swapped), JSON.stringify(swapped));
    await page.goto('https://regress.local/');
    await liveRedact(page, true);
    const shadow = await page.evaluate(async () => {
      const sr = document.getElementById('sh').shadowRoot; sr.querySelector('span').textContent = '010-3456-7890';
      await new Promise((r) => setTimeout(r, 50));
      return sr.textContent;
    });
    check('shadow root 안 새 글자도 실시간 가림', !/\d{4}-\d{4}/.test(shadow), JSON.stringify(shadow));
    // 찍는 사이 관찰이 끊긴 채 PII 가 나타나면(byclick 경우) 가리기 전 검사가 잡아 PNG 를 지운다 — 찍기 직후에 끼워 넣어 결정적으로 재현
    await page.goto('https://regress.local/');
    const f = path.join(out, 'desktop', 'regress-during-shot.png');
    const shoot = page.screenshot.bind(page);
    page.screenshot = async (o) => {
      const r = await shoot(o);
      await page.evaluate(() => { window.__prism.live(false); document.body.insertAdjacentHTML('beforeend', '<div>010-1111-2222</div>'); });
      return r;
    };
    let err = '';
    try { await saveShot(page, f); } catch (e) { err = e.message; }
    page.screenshot = shoot;
    check('찍는 사이 생긴 PII 는 가리기 전 검사가 잡음', /PII \d+건이 찍는 사이 생김/.test(err) && !fs.existsSync(f), err.slice(0, 80));
    await ctx.close();
  }
} finally {
  await browser.close();
}
const ok = results.every(Boolean);
console.log(`SELFTEST ${ok ? 'PASS' : 'FAIL'} ${results.filter(Boolean).length}/${results.length}`);
process.exit(ok ? 0 : 1);
