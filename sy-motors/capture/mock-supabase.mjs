// sy-motors 촬영용 목 서버 — 메모리 속 PostgREST + Storage 흉내. 포트 3616(127.0.0.1 만 listen).
// 봇 사본(tmp/sy-motors-src)의 SUPABASE_URL 이 이 서버를 가리킨다. 외부 접속·운영 DB 접속 0.
// 지원: /rest/v1/<table> GET·POST(upsert/on_conflict)·PATCH·DELETE, 필터 eq·neq·gt·gte·lt·lte·is·in,
//       select 별칭(name:payload->>name), order, limit, Accept: application/vnd.pgrst.object+json(.single())
//       /storage/v1/object/<bucket>/<path> POST(업로드) · /storage/v1/object/sign/... POST(서명) · GET(가짜 PNG)
//       /img/<n>.png 가짜 이미지(1x1 PNG) · /__mock/seed·dump·stats 촬영 스크립트 전용
// 실행: node sy-motors/capture/mock-supabase.mjs   (PID 는 호출자가 tmp/sy-motors-mock.pid 에 적는다)
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.MOCK_PORT || 3616);
const LOG = process.env.MOCK_LOG || '';
const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const tables = {}; // name -> rows[]
const conflictKey = { chat_sessions: 'bot_user_key', customers: 'bot_user_key', owner_tokens: 'role' };
const stats = { total: 0, byTable: {}, storageUploads: 0, storageSigns: 0 };
const T = (n) => (tables[n] ||= []);

function logReq(line) {
  if (LOG) fs.appendFileSync(LOG, `${new Date().toISOString()} ${line}\n`);
}

function coerce(v) {
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null') return null;
  return v;
}
function getField(row, col) {
  if (col.includes('->>')) {
    const [c, k] = col.split('->>');
    const v = row[c];
    return v && typeof v === 'object' ? (v[k] == null ? null : String(v[k])) : null;
  }
  return row[col];
}
function cmp(a, b) {
  const na = Number(a), nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb) && String(a).trim() !== '' && /^-?\d+(\.\d+)?$/.test(String(a)) && /^-?\d+(\.\d+)?$/.test(String(b))) return na - nb;
  const ta = Date.parse(a), tb = Date.parse(b);
  if (!Number.isNaN(ta) && !Number.isNaN(tb)) return ta - tb;
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
}
function filtersFrom(params) {
  const RESERVED = new Set(['select', 'order', 'limit', 'offset', 'on_conflict', 'columns']);
  const fs_ = [];
  for (const [k, v] of params) {
    if (RESERVED.has(k)) continue;
    const dot = v.indexOf('.');
    fs_.push({ col: k, op: v.slice(0, dot), val: v.slice(dot + 1) });
  }
  return fs_;
}
function match(row, f) {
  const cur = getField(row, f.col);
  switch (f.op) {
    case 'eq': return String(cur) === f.val;
    case 'neq': return String(cur) !== f.val;
    case 'gt': return cur != null && cmp(cur, f.val) > 0;
    case 'gte': return cur != null && cmp(cur, f.val) >= 0;
    case 'lt': return cur != null && cmp(cur, f.val) < 0;
    case 'lte': return cur != null && cmp(cur, f.val) <= 0;
    case 'is': return cur === coerce(f.val) || (f.val === 'null' && cur == null);
    case 'in': return f.val.replace(/^\(|\)$/g, '').split(',').map((s) => s.replace(/^"|"$/g, '')).includes(String(cur));
    default: return true;
  }
}
function project(row, select) {
  if (!select || select === '*') return { ...row };
  const out = {};
  for (const part of select.split(',').map((s) => s.trim()).filter(Boolean)) {
    if (part === '*') { Object.assign(out, row); continue; }
    const m = part.match(/^([^:]+):(.+)$/);
    if (m) out[m[1]] = getField(row, m[2]);
    else out[part] = getField(row, part);
  }
  return out;
}
function defaults(table, row) {
  const now = new Date().toISOString();
  const r = { ...row };
  if (!('id' in r) && table !== 'chat_sessions' && table !== 'owner_tokens') r.id = crypto.randomUUID();
  if (!('created_at' in r)) r.created_at = now;
  return r;
}

function send(res, status, body, extraHeaders = {}) {
  const buf = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', ...extraHeaders });
  res.end(buf);
}

const server = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const raw = Buffer.concat(chunks);
    const url = new URL(req.url, 'http://127.0.0.1');
    const p = url.pathname;
    stats.total++;
    try {
      // ── 촬영 스크립트 전용
      if (p === '/__mock/seed' && req.method === 'POST') {
        const { table, rows } = JSON.parse(raw.toString() || '{}');
        for (const r of rows) T(table).push(defaults(table, r));
        return send(res, 200, { ok: true, count: T(table).length });
      }
      if (p === '/__mock/dump') return send(res, 200, tables);
      if (p === '/__mock/stats') return send(res, 200, stats);
      if (p === '/__mock/reset' && req.method === 'POST') { for (const k of Object.keys(tables)) delete tables[k]; return send(res, 200, { ok: true }); }

      // ── 가짜 이미지
      if (p.startsWith('/img/') || (req.method === 'GET' && p.startsWith('/storage/v1/object/sign/'))) {
        logReq(`GET ${p} -> png`);
        res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': PNG_1x1.length });
        return res.end(PNG_1x1);
      }

      // ── Storage
      if (p.startsWith('/storage/v1/object/')) {
        const rest = p.slice('/storage/v1/object/'.length);
        if (rest.startsWith('sign/') && req.method === 'POST') {
          stats.storageSigns++;
          logReq(`POST ${p} (sign)`);
          return send(res, 200, { signedURL: `/object/${rest}?token=mock-token` });
        }
        if (req.method === 'POST' || req.method === 'PUT') {
          stats.storageUploads++;
          logReq(`POST ${p} (upload ${raw.length} bytes)`);
          return send(res, 200, { Key: rest, Id: crypto.randomUUID() });
        }
      }

      // ── PostgREST
      const m = p.match(/^\/rest\/v1\/([a-z_]+)$/);
      if (m) {
        const table = m[1];
        stats.byTable[table] = (stats.byTable[table] || 0) + 1;
        const accept = String(req.headers['accept'] || '');
        const prefer = String(req.headers['prefer'] || '');
        const wantObject = accept.includes('application/vnd.pgrst.object+json');
        const wantRows = prefer.includes('return=representation');
        const select = url.searchParams.get('select');
        const filters = filtersFrom(url.searchParams);
        const rows = T(table);
        logReq(`${req.method} ${table} ${url.search.slice(0, 120)}`);

        const reply = (list, status = 200) => {
          if (wantObject) {
            if (list.length !== 1) {
              return send(res, 406, { code: 'PGRST116', details: `The result contains ${list.length} rows`, hint: null, message: 'JSON object requested, multiple (or no) rows returned' });
            }
            return send(res, status, project(list[0], select), { 'Content-Type': 'application/vnd.pgrst.object+json' });
          }
          return send(res, status, list.map((r) => project(r, select)));
        };

        if (req.method === 'GET') {
          let list = rows.filter((r) => filters.every((f) => match(r, f)));
          const order = url.searchParams.get('order');
          if (order) {
            const [col, dir] = order.split('.');
            list = list.sort((a, b) => cmp(getField(a, col) ?? '', getField(b, col) ?? '') * (dir === 'desc' ? -1 : 1));
          }
          const limit = url.searchParams.get('limit');
          if (limit) list = list.slice(0, Number(limit));
          return reply(list);
        }
        if (req.method === 'POST') {
          const body = JSON.parse(raw.toString() || '{}');
          const items = Array.isArray(body) ? body : [body];
          const onConflict = url.searchParams.get('on_conflict') || conflictKey[table];
          const merge = prefer.includes('resolution=merge-duplicates');
          const out = [];
          for (const it of items) {
            const idx = merge && onConflict ? rows.findIndex((r) => String(r[onConflict]) === String(it[onConflict])) : -1;
            if (idx >= 0) { rows[idx] = { ...rows[idx], ...it }; out.push(rows[idx]); }
            else { const r = defaults(table, it); rows.push(r); out.push(r); }
          }
          return wantRows ? reply(out, 201) : send(res, 201, '');
        }
        if (req.method === 'PATCH') {
          const body = JSON.parse(raw.toString() || '{}');
          const hit = rows.filter((r) => filters.every((f) => match(r, f)));
          hit.forEach((r) => Object.assign(r, body));
          return wantRows ? reply(hit) : send(res, 204, '');
        }
        if (req.method === 'DELETE') {
          const keep = rows.filter((r) => !filters.every((f) => match(r, f)));
          const removed = rows.length - keep.length;
          tables[table] = keep;
          logReq(`  deleted ${removed}`);
          return send(res, 204, '');
        }
      }
      logReq(`404 ${req.method} ${p}`);
      return send(res, 404, { message: 'mock: not found', path: p });
    } catch (e) {
      logReq(`500 ${req.method} ${p} ${e instanceof Error ? e.message : e}`);
      return send(res, 500, { message: String(e instanceof Error ? e.message : e) });
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[mock-supabase] listening 127.0.0.1:${PORT} pid=${process.pid}`);
});
