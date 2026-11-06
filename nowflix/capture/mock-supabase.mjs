// nowflix 관리자 웹 촬영용 가짜 Supabase(PostgREST + Storage 일부). node http 만 쓴다.
// 실행: MOCK_PORT=<빈 포트> MOCK_PASSWORD_HASH=<bcrypt 해시> node nowflix/capture/mock-supabase.mjs
// admin-web 이 부르는 경로(admin-web/src/lib/db.ts)만 흉내 낸다. 상태는 메모리에만 있다. 운영 DB 와 무관.
//   GET/POST/PATCH/DELETE /rest/v1/{parts,settings,web_auth}?id=eq.X&order=col.dir&limit=N  (select 는 전체 행 반환)
//   GET /storage/v1/object/public/thumbnails/<파일>  → nowflix/media/posters/<파일>
//   POST /__mock/add-part {title, playlist_id}  — 촬영 스크립트가 '저장 뒤 목록'을 만들 때만 쓴다
//   POST /__mock/reset {n}  — 파트를 처음 n개로 되돌린다(상태 흐름을 한 화면에 담으려고)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const POSTERS = path.join(HERE, '..', 'media', 'posters');
const PORT = Number(process.env.MOCK_PORT);
if (!PORT) throw new Error('MOCK_PORT 필요');
const HASH = process.env.MOCK_PASSWORD_HASH || '';
const origin = `http://127.0.0.1:${PORT}`;
const thumb = (f) => `${origin}/storage/v1/object/public/thumbnails/${f}`;

// 가짜 데이터: 파트 이름·재생목록 ID·포스터는 앱 번들(app/src/main/assets/parts.json · res/drawable-nodpi)과 같은 값
const parts = [
  ['knee', '괜찮Knee TV', 'part_01_knee', 'PLfxolKs8oDR66iswGEXMQz10w1seo8O80'],
  ['chuk', '척척박사 TV', 'part_02_chuk', 'PLfxolKs8oDR7o8U1FaBEa60UNFGwEsopE'],
  ['son', '손봐줘 TV', 'part_03_son', 'PLfxolKs8oDR4vTPuHa9Bp5CV22IHCC7H7'],
  ['hip', 'Hip한 NOW', 'part_04_hip', 'PLfxolKs8oDR6LzV8jvySqtmcNfaBaA9pN'],
  ['shoulder', '어깨의 정석', 'part_05_shoulder', 'PLfxolKs8oDR6a7TCf6Ok1ilR8I5ZqkdC1'],
  ['jokjipge', '족집게 TV', 'part_06_jokjipge', 'PLfxolKs8oDR4x2gGkTk29RpJ7aysqo0J3'],
].map(([k, title, img, playlist_id], i) => ({
  id: `00000000-0000-4000-8000-00000000000${i + 1}`, position: i + 1, title, thumbnail_url: thumb(img + '.png'), playlist_id, is_active: true,
}));
const db = {
  parts,
  settings: [{ id: 1, idle_return_seconds: 120, admin_pin_hash: null, header_text: '오늘 대한민국의 TOP 콘텐츠' }],
  web_auth: [{ id: 1, password_hash: HASH, is_default: false, failed_count: 0, locked_until: null }],
};
const log = [];

function query(table, sp) {
  let rows = db[table];
  for (const [k, v] of sp) {
    const m = /^eq\.(.*)$/.exec(v);
    if (m && !['select', 'order', 'limit'].includes(k)) rows = rows.filter((r) => String(r[k]) === m[1]);
  }
  const ord = sp.get('order');
  if (ord) {
    const [col, dir] = ord.split('.');
    rows = [...rows].sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (dir === 'desc' ? -1 : 1));
  }
  const lim = Number(sp.get('limit'));
  if (lim) rows = rows.slice(0, lim);
  return rows;
}
const send = (res, code, body, type = 'application/json') => { res.writeHead(code, { 'content-type': type }); res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };
const readBody = (req) => new Promise((r) => { const c = []; req.on('data', (d) => c.push(d)); req.on('end', () => r(Buffer.concat(c).toString())); });

http.createServer(async (req, res) => {
  const u = new URL(req.url, origin);
  log.push(`${req.method} ${u.pathname}`);
  if (req.method === 'GET' && u.pathname === '/__mock/log') return send(res, 200, log.slice(-200));
  const rest = /^\/rest\/v1\/(parts|settings|web_auth)$/.exec(u.pathname);
  if (rest) {
    const t = rest[1];
    if (req.method === 'GET') return send(res, 200, query(t, u.searchParams));
    const body = JSON.parse((await readBody(req)) || '{}');
    if (req.method === 'POST') { const row = { id: `00000000-0000-4000-8000-${String(db[t].length + 1).padStart(12, '0')}`, ...body }; db[t].push(row); return send(res, 201, [row]); }
    if (req.method === 'PATCH') { const rows = query(t, u.searchParams); rows.forEach((r) => Object.assign(r, body)); return send(res, 200, rows); }
    if (req.method === 'DELETE') { const ids = new Set(query(t, u.searchParams).map((r) => r.id)); db[t] = db[t].filter((r) => !ids.has(r.id)); return send(res, 204, ''); }
  }
  const st = /^\/storage\/v1\/object\/public\/thumbnails\/([\w.-]+)$/.exec(u.pathname);
  if (st && req.method === 'GET') {
    const f = path.join(POSTERS, st[1]);
    if (!f.startsWith(POSTERS) || !fs.existsSync(f)) return send(res, 404, { error: 'not found' });
    return send(res, 200, fs.readFileSync(f), 'image/png');
  }
  if (req.method === 'POST' && u.pathname === '/__mock/add-part') {
    const { title, playlist_id, poster } = JSON.parse((await readBody(req)) || '{}');
    const row = { id: `00000000-0000-4000-8000-${String(db.parts.length + 1).padStart(12, '0')}`, position: db.parts.length + 1, title, thumbnail_url: poster ? thumb(poster) : null, playlist_id, is_active: true };
    db.parts.push(row);
    return send(res, 200, row);
  }
  if (req.method === 'POST' && u.pathname === '/__mock/reset') {
    const { n } = JSON.parse((await readBody(req)) || '{}');
    db.parts = parts.slice(0, n || parts.length).map((p) => ({ ...p }));
    return send(res, 200, { parts: db.parts.length });
  }
  send(res, 404, { error: 'mock: no route', path: u.pathname });
}).listen(PORT, '127.0.0.1', () => console.log(`mock-supabase listening ${PORT}`));
