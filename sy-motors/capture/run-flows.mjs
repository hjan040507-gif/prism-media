// sy-motors 3흐름 촬영 — 로컬 사본 봇(127.0.0.1:3615) + 목 서버(127.0.0.1:3616)에만 요청한다.
// 운영 스킬 주소로는 어떤 요청도 보내지 않는다(아래 BASE 가 127.0.0.1:3615 가 아니면 즉시 멈춤).
// 결과: sy-motors/states/<흐름>/<NN>-<설명>.json  = { request, response, note, pii_scan, ... }
// 가림: tools/lib.mjs 의 PII 표(순서·대체 글자 포함)를 그대로 가져다 쓴다(고치지 않는다). 저장 전 PII 검사 0건일 때만 저장.
// 실행: node sy-motors/capture/run-flows.mjs   (앱 로그 경로 APP_LOG, 기본 tmp/sy-motors-app.log)
import fs from 'node:fs';
import path from 'node:path';
import { PII, ROOT } from '../../tools/lib.mjs';

const BASE = 'http://127.0.0.1:3615';
const MOCK = 'http://127.0.0.1:3616';
const APP_LOG = process.env.APP_LOG || path.join(ROOT, 'tmp', 'sy-motors-app.log');
const OUT = path.join(ROOT, 'sy-motors', 'states');
const ACC_MIN = 10; // lib.mjs ACCOUNT_MIN_DIGITS 와 같다

for (const u of [BASE, MOCK]) {
  const h = new URL(u);
  if (h.hostname !== '127.0.0.1') throw new Error(`로컬이 아닌 주소: ${u}`);
}

// ── 가림(lib.mjs BROWSER_FN 의 scrubText 와 같은 순서·대체 글자) ───────────────────────────────────────────────
const ORDER = ['email', 'url', 'rrn', 'phone', 'account', 'passport', 'plate', 'addr'];
const REP = { email: () => '', url: () => '', rrn: () => '', phone: () => '010-****-****', account: () => '', passport: () => '', plate: () => '12가 ****', addr: (m) => m.split(/\s+/).slice(0, 2).join(' ') };
const digits = (s) => (s.match(/\d/g) || []).length;
const stats = {};
function mask(s) {
  let o = s;
  // 가짜 이미지 서버 주소는 PII 표의 url 이 지우면 자리가 비므로 먼저 자리 표시로 바꾼다
  o = o.replace(/http:\/\/127\.0\.0\.1:3616\/[^\s"'\\\]]*/g, '[이미지 URL 가림]');
  for (const k of ORDER) {
    o = o.replace(new RegExp(PII[k], 'g'), (m) => {
      if (k === 'account' && digits(m) < ACC_MIN) return m;
      stats[k] = (stats[k] || 0) + 1;
      return REP[k](m);
    });
  }
  return o;
}
const deep = (v) => (typeof v === 'string' ? mask(v) : Array.isArray(v) ? v.map(deep) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)])) : v);
function strings(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out));
  return out;
}
function scan(obj) {
  const hits = [];
  for (const s of strings(obj)) {
    for (const k of Object.keys(PII)) {
      for (const m of s.matchAll(new RegExp(PII[k], 'g'))) {
        if (k === 'account' && digits(m[0]) < ACC_MIN) continue;
        hits.push(`${k}:${m[0].slice(0, 20)}`);
      }
    }
  }
  return { total: hits.length, samples: hits.slice(0, 5), patterns: Object.keys(PII), at: 'saved JSON strings (request + response + server_log) after masking' };
}

// ── 요청 ────────────────────────────────────────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const logSize = () => (fs.existsSync(APP_LOG) ? fs.statSync(APP_LOG).size : 0);
function logSince(off) {
  if (!fs.existsSync(APP_LOG)) return [];
  const buf = fs.readFileSync(APP_LOG);
  return buf.subarray(off).toString('utf8').split('\n').filter(Boolean);
}
const body = (key, utterance, params = {}) => ({
  userRequest: { utterance, user: { id: key, type: 'botUserKey' } },
  action: { params },
});
const secureimage = (...urls) => ({ secureimage: JSON.stringify({ secureUrls: urls }) });

async function post(req) {
  const t0 = Date.now();
  const r = await fetch(`${BASE}/api/kakao/skill`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req) });
  const text = await r.text();
  return { status: r.status, ms: Date.now() - t0, json: JSON.parse(text) };
}

function save(flow, n, slug, doc) {
  const dir = path.join(OUT, flow);
  fs.mkdirSync(dir, { recursive: true });
  const masked = deep(doc);
  const pii = scan(masked);
  if (pii.total > 0) throw new Error(`PII ${pii.total}건 — 저장 안 함 (${flow}/${slug}): ${pii.samples.join(', ')}`);
  masked.pii_scan = pii;
  const file = path.join(dir, `${String(n).padStart(2, '0')}-${slug}.json`);
  fs.writeFileSync(file, JSON.stringify(masked, null, 2) + '\n');
  console.log('saved', path.relative(ROOT, file));
}

async function runFlow(flow, key, steps, logKind) {
  let n = 0;
  let lastDoneLogs = [];
  for (const s of steps) {
    const off = logSize();
    const req = body(key, s.say, s.params || {});
    const { status, ms, json } = await post(req);
    if (status !== 200) throw new Error(`${flow}/${s.slug}: HTTP ${status}`);
    let serverLines = [];
    if (s.final) {
      // 응답 뒤 after() 로 도는 알림 로그를 기다린다(최대 8초)
      for (let i = 0; i < 32; i++) {
        serverLines = logSince(off).filter((l) => /\[DRY-RUN\]|\[notify\]/.test(l));
        if (serverLines.some((l) => /\[DRY-RUN\]|스킵|발송/.test(l))) break;
        await sleep(250);
      }
      lastDoneLogs = serverLines;
    }
    save(flow, n, s.slug, { request: req, response: json, note: s.note, http: { status, elapsed_ms: ms } });
    n++;
  }
  // 알림 분기 증거(서버 로그 줄)
  save(flow, n, logKind.slug, {
    request: null,
    response: null,
    note: logKind.note,
    server_log: lastDoneLogs,
  });
}

// ── 사전 점검 ───────────────────────────────────────────────────────────────────────────────────────────────
const health = await (await fetch(`${BASE}/api/health`)).json();
console.log('health', JSON.stringify(health));
if (health.notifyDryRun !== true) throw new Error('notifyDryRun !== true — 실발송 가능성, 중단');

await fetch(`${MOCK}/__mock/reset`, { method: 'POST' });
await fetch(`${MOCK}/__mock/seed`, {
  method: 'POST',
  body: JSON.stringify({ table: 'owner_tokens', rows: [{ role: 'owner', access_token: 'fake-access', refresh_token: 'fake-refresh', expires_at: new Date(Date.now() + 6 * 3600e3).toISOString() }] }),
});

const IMG = `${MOCK}/img/1.png`;
const welcome = { slug: 'welcome', say: '메뉴', note: '처음 화면. 전역 명령 「메뉴」 → 세션 삭제 후 웰컴(simpleText + 빠른 답변 7개).' };

fs.rmSync(OUT, { recursive: true, force: true });

await runFlow('repair', 'prism-fake-repair', [
  welcome,
  { slug: 'pick-repair', say: '방문 정비', note: '카테고리 선택 → 첫 질문(차량 정보 통합 질문).' },
  { slug: 'car-type', say: '어코드 2.4 2017', note: '차량 입력에 연식(2017)이 있어 연식 질문은 건너뛰고 차량번호 질문으로.' },
  { slug: 'car-number', say: '12가3456', note: '입력은 가짜 번호판. 저장 JSON 은 「12가 ****」로 가림.' },
  { slug: 'name', say: '김○○', note: '이미 가린 꼴의 이름.' },
  { slug: 'phone-invalid', say: '010-12', note: '전화번호 검사 실패 → 재질문(검사: 숫자만 남겨 /^01[016789]\\d{7,8}$/).' },
  { slug: 'phone', say: '010-0000-0000', note: '검사를 통과하는 가짜 번호. 저장 JSON 은 「010-****-****」로 가림.' },
  { slug: 'request-detail', say: '엔진오일 교환하고 싶어요. 토요일 오전 방문 희망', note: '선택 질문(요청 내용) 입력.' },
  { slug: 'photo-received', say: '', params: secureimage(IMG), note: '사진 단계: secureimage 플러그인이 action.params 로 주는 형태에 가짜 이미지 URL(목 서버) 1장. URL 글자는 「[이미지 URL 가림]」으로 바꿔 저장.' },
  { slug: 'photo-next', say: '다음으로', note: '사진 단계 종료 → 방문 정비만 있는 「추가 정보」 게이트.' },
  { slug: 'done', say: '바로 접수', final: true, note: '접수 확정(확인 단계 없이 곧바로 저장) → 완료 요약 simpleText + 「담당자에게 전달하기」 textCard(operator 버튼).' },
], { slug: 'memo-dryrun-log', note: '알림 분기 증거: 사고/긴급이 아닌 접수는 카카오 「나에게 보내기」 메모 경로. 로컬은 드라이런이라 [DRY-RUN] kakao/memo 로그만 남는다(운영 호출 0). 알림 대상 토큰은 목 DB 에 넣은 가짜.' });

await runFlow('accident', 'prism-fake-accident', [
  welcome,
  { slug: 'pick-accident', say: '사고/긴급', note: '카테고리 선택 → 첫 질문.' },
  { slug: 'car-type', say: 'CRV 2.4 AWD 2016', note: '차량 입력에 연식(2016)이 있어 연식 질문 생략.' },
  { slug: 'car-number', say: '34나5678', note: '가짜 번호판(저장 시 가림).' },
  { slug: 'name', say: '이○○', note: '이미 가린 꼴의 이름.' },
  { slug: 'phone', say: '010-0000-0001', note: '검사를 통과하는 가짜 번호(저장 시 가림).' },
  { slug: 'accident-detail', say: '주차 중 접촉사고가 났어요. 앞범퍼 파손', note: '사고 경위(필수 질문) → 보험 처리 질문(빠른 답변 3개).' },
  { slug: 'insurance', say: '보험 처리', note: '보험 처리 여부(빠른 답변 「보험 처리」) → 사진 단계.' },
  { slug: 'done', say: '사진 없이 진행', final: true, note: '사진 건너뛰기 → 곧바로 접수 확정. 알림톡 env 5개가 가짜로 설정돼 완료 요약에 「🚨 긴급 건이라 담당자에게 알림이 바로 전달돼요」 줄이 켜진다(운영에서도 같은 조건).' },
], { slug: 'alimtalk-dryrun-log', note: '알림 분기 증거: 사고/긴급만 솔라피 알림톡. 서버 로그의 [DRY-RUN] solapi/alimtalk 줄 = 수신 번호(가짜 env)·템플릿 ID(가짜)·변수 6개 JSON. 번호는 가림. 알림톡 템플릿 본문은 레포에 없다(솔라피 콘솔 승인본).' });

await runFlow('trouble', 'prism-fake-trouble', [
  welcome,
  { slug: 'pick-trouble', say: '차량 장애 문의', note: '카테고리 선택 → 증상 질문(진단·조치 안내는 일절 하지 않는 접수 전용).' },
  { slug: 'symptom', say: '시동이 안 걸려요', note: '증상(필수) → 차량 정보 질문.' },
  { slug: 'car-type', say: '파일럿 3.5 엘리트 2020', note: '차량 입력에 연식(2020)이 있어 연식 질문 생략.' },
  { slug: 'car-number', say: '56다7890', note: '가짜 번호판(저장 시 가림).' },
  { slug: 'name', say: '박○○', note: '이미 가린 꼴의 이름.' },
  { slug: 'phone', say: '010-0000-0002', note: '검사를 통과하는 가짜 번호(저장 시 가림) → 사진 단계.' },
  { slug: 'photo-received', say: '', params: secureimage(IMG), note: '사진 1장(가짜 이미지 URL, 저장 시 글자 가림).' },
  { slug: 'done', say: '다음으로', final: true, note: '장애 문의는 사진이 마지막 단계라 곧바로 접수 확정 → 완료 요약 + 「담당자에게 전달하기」 카드. 「자가 점검 영상 보기」 버튼은 운영 env(YOUTUBE_CHANNEL_URL)에만 있어 로컬엔 없다.' },
], { slug: 'memo-dryrun-log', note: '알림 분기 증거: 장애 문의는 사고/긴급이 아니라 카카오 「나에게 보내기」 메모 경로(드라이런 로그).' });

const ms = await (await fetch(`${MOCK}/__mock/stats`)).json();
const dump = await (await fetch(`${MOCK}/__mock/dump`)).json();
const summary = { mock_requests: ms, mock_rows: Object.fromEntries(Object.entries(dump).map(([k, v]) => [k, v.length])), masked_counts: stats, production_requests: 0 };
fs.writeFileSync(path.join(ROOT, 'sy-motors', 'capture', 'run-summary.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary));
