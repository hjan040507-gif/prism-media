// byclick 촬영용 가짜 Supabase — node http, 메모리 표. 진짜 키·진짜 데이터 없음(데이터는 mock-data.mjs 의 가짜 값).
// PostgREST(/rest/v1/<table>, /rest/v1/rpc/<fn>) · GoTrue(/auth/v1/user·token) · Storage 서명(/storage/v1/object/sign/…)만 흉내 낸다.
// 쓰기(POST/PATCH/DELETE)는 아무것도 저장하지 않고 성공만 돌려준다(RPC 는 handler 가 있으면 그것).
// 실행: MOCK_PORT=3263 node byclick/capture/mock-supabase.mjs   (이 세션이 띄운 PID 만 끈다)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TABLES, RPC, REL, NOW, userFromToken, imageFor, SESSION_USERS, WON, VEH, IDS, EXTRA_SR } from './mock-data.mjs';

const PORT = Number(process.env.MOCK_PORT || 3263);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const LOG = process.env.MOCK_LOG || path.join(HERE, '..', '..', 'tmp', 'byclick-mock.log');
fs.mkdirSync(path.dirname(LOG), { recursive: true });
const log = (...a) => fs.appendFileSync(LOG, a.join(' ') + '\n');
const missing = new Set();
const DEALER_OWN = new Set(['dealer_won_auctions', 'bids', 'dealer_interests', 'dealer_watchlist', 'release_requests', 'dealer_sanctions', 'dealer_sanction_notices', 'bid_auto_limits']);
const DEALER_ME = VEH.length ? IDS.dealerId(1) : null;

// ───────── 쿼리 평가 ─────────
const singular = (s) => s.replace(/ies$/, 'y').replace(/ses$/, 's').replace(/s$/, '');
function getCol(row, col) {
  if (col.includes('->')) {
    const [c, ...p] = col.split(/->>?/);
    let v = row[c];
    for (const k of p) v = v == null ? v : v[k];
    return v;
  }
  return row[col];
}
function coerce(v) {
  if (v === null || v === undefined) return null;
  return v;
}
function cmp(a, b) {
  if (a == null || b == null) return null;
  const na = Number(a), nb = Number(b);
  if (typeof a !== 'boolean' && !Number.isNaN(na) && !Number.isNaN(nb) && String(a).trim() !== '' && String(b).trim() !== '') return na - nb;
  const da = Date.parse(a), db = Date.parse(b);
  if (!Number.isNaN(da) && !Number.isNaN(db) && /\d{4}-\d\d/.test(String(a)) && /\d{4}-\d\d/.test(String(b))) return da - db;
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
}
function splitTop(s, sep = ',') {
  const out = []; let depth = 0, q = false, cur = '';
  for (const ch of s) {
    if (ch === '"') q = !q;
    if (!q && ch === '(') depth++;
    if (!q && ch === ')') depth--;
    if (!q && depth === 0 && ch === sep) { out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur !== '') out.push(cur);
  return out;
}
const unq = (s) => (s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s);
function opTest(op, val, row, col) {
  const v = coerce(getCol(row, col));
  switch (op) {
    case 'eq': return v != null && String(v) === String(unq(val));
    case 'neq': return v == null ? true : String(v) !== String(unq(val));
    case 'gt': { const c = cmp(v, unq(val)); return c !== null && c > 0; }
    case 'gte': { const c = cmp(v, unq(val)); return c !== null && c >= 0; }
    case 'lt': { const c = cmp(v, unq(val)); return c !== null && c < 0; }
    case 'lte': { const c = cmp(v, unq(val)); return c !== null && c <= 0; }
    case 'like': case 'ilike': {
      const re = new RegExp('^' + unq(val).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/\*/g, '.*').replace(/_/g, '.') + '$', op === 'ilike' ? 'i' : '');
      return v != null && re.test(String(v));
    }
    case 'is': return val === 'null' ? v == null : val === 'true' ? v === true : val === 'false' ? v === false : false;
    case 'in': { const list = splitTop(val.replace(/^\(|\)$/g, '')).map(unq); return v != null && list.includes(String(v)); }
    case 'cs': { const arr = Array.isArray(v) ? v.map(String) : []; const want = splitTop(val.replace(/^[{[(]|[}\])]$/g, '')).map(unq); return want.every((w) => arr.includes(w)); }
    case 'ov': { const arr = Array.isArray(v) ? v.map(String) : []; const want = splitTop(val.replace(/^[{[(]|[}\])]$/g, '')).map(unq); return want.some((w) => arr.includes(w)); }
    default: missing.add('op:' + op); return true;
  }
}
function condTest(expr, row) {
  // "col.op.value" or "not.col.op"? (inside or=( ) the form is col.op.val ; nested and(...)/or(...))
  let m = expr.match(/^(and|or)\((.*)\)$/s);
  if (m) {
    const parts = splitTop(m[2]);
    return m[1] === 'and' ? parts.every((p) => condTest(p, row)) : parts.some((p) => condTest(p, row));
  }
  m = expr.match(/^([^.]+(?:->>?[^.]+)?)\.(not\.)?([a-z]+)\.(.*)$/s);
  if (!m) { missing.add('cond:' + expr); return true; }
  const r = opTest(m[3], m[4], row, m[1]);
  return m[2] ? !r : r;
}
function filterRows(rows, params, table) {
  let out = rows;
  for (const [k, v] of params) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(k)) continue;
    if (k === 'or' || k === 'and') { out = out.filter((r) => condTest(`${k}${v}`, r)); continue; }
    if (k.includes('.') && !k.includes('->')) continue; // 임베드 필터 — 무시(필요하면 REL 로)
    const m = v.match(/^(not\.)?([a-z]+)\.(.*)$/s);
    if (!m) { missing.add(`filter:${table}.${k}=${v}`); continue; }
    out = out.filter((r) => { const t = opTest(m[2], m[3], r, k); return m[1] ? !t : t; });
  }
  return out;
}
function sortRows(rows, order) {
  if (!order) return rows;
  const keys = order.split(',').map((s) => { const [c, ...f] = s.split('.'); return { c, desc: f.includes('desc'), nullsFirst: f.includes('nullsfirst') }; });
  return [...rows].sort((a, b) => {
    for (const k of keys) {
      const x = getCol(a, k.c), y = getCol(b, k.c);
      if (x == null && y == null) continue;
      if (x == null) return k.nullsFirst || (k.desc && !f_nl(keys)) ? -1 : 1;
      if (y == null) return k.nullsFirst || (k.desc && !f_nl(keys)) ? 1 : -1;
      const c = cmp(x, y) || 0;
      if (c) return k.desc ? -c : c;
    }
    return 0;
  });
}
const f_nl = () => false;

// ───────── select / 임베드 ─────────
function parseSelect(sel) {
  const items = [];
  for (const tok of splitTop(sel || '*')) {
    const t = tok.trim();
    if (!t) continue;
    const m = t.match(/^(?:([A-Za-z0-9_]+):)?([A-Za-z0-9_]+)((?:![A-Za-z0-9_]+)*)\((.*)\)$/s);
    if (m) { const hints = m[3].split('!').filter(Boolean); items.push({ embed: true, alias: m[1] || m[2], name: m[2], hints, inner: hints.includes('inner'), sub: parseSelect(m[4]) }); continue; }
    const c = t.match(/^(?:([A-Za-z0-9_]+):)?([A-Za-z0-9_*]+(?:->>?[A-Za-z0-9_]+)*)(?:::[a-z]+)?$/);
    if (c) items.push({ col: c[2], alias: c[1] || c[2] }); else missing.add('select:' + t);
  }
  return items;
}
function rel(table, name, hints) {
  const k = `${table}.${name}`;
  if (REL[k]) return REL[k];
  const tgt = TABLES[name] ? name : null;
  if (!tgt) return null;
  const fkHint = hints.find((h) => h !== 'inner' && !h.endsWith('_fkey')) || (hints.find((h) => h.endsWith('_fkey')) || '').replace(/^.*?_([a-z_]+?)_fkey$/, '$1');
  const rows = TABLES[table] || [];
  const sample = rows[0] || {};
  const tsample = TABLES[tgt][0] || {};
  if (fkHint && fkHint in sample) return { type: 'one', fk: fkHint, ref: 'id' };
  if (fkHint && fkHint in tsample) return { type: 'many', fk: fkHint, ref: 'id' };
  const colHere = `${singular(tgt)}_id`;
  if (colHere in sample || rows.some((r) => colHere in r)) return { type: 'one', fk: colHere, ref: 'id' };
  const colThere = `${singular(table)}_id`;
  if (colThere in tsample || TABLES[tgt].some((r) => colThere in r)) return { type: 'many', fk: colThere, ref: 'id' };
  return null;
}
function project(rows, items, table, params) {
  return rows.map((r) => projectOne(r, items, table));
}
function projectOne(row, items, table) {
  const out = {};
  for (const it of items) {
    if (it.col === '*') { Object.assign(out, row); continue; }
    if (it.col) { out[it.alias] = getCol(row, it.col) ?? null; continue; }
    const rl = rel(table, it.name, it.hints);
    if (!rl) { missing.add(`rel:${table}.${it.name}`); out[it.alias] = null; continue; }
    const targetRows = TABLES[it.name] || [];
    if (rl.type === 'one') {
      const t = targetRows.find((x) => String(x[rl.ref]) === String(row[rl.fk]));
      out[it.alias] = t ? projectOne(t, it.sub, it.name) : null;
    } else {
      const ts = targetRows.filter((x) => String(x[rl.fk]) === String(row[rl.ref || 'id']));
      if (it.sub.length === 1 && it.sub[0].col === 'count') out[it.alias] = [{ count: ts.length }];
      else out[it.alias] = ts.map((t) => projectOne(t, it.sub, it.name));
    }
  }
  return out;
}
function innerFilter(rows, items, table) {
  let out = rows;
  for (const it of items) {
    if (!it.embed || !it.inner) continue;
    const rl = rel(table, it.name, it.hints);
    if (!rl) continue;
    const targetRows = TABLES[it.name] || [];
    out = out.filter((r) => (rl.type === 'one' ? targetRows.some((x) => String(x[rl.ref]) === String(r[rl.fk])) : targetRows.some((x) => String(x[rl.fk]) === String(r[rl.ref || 'id']))));
  }
  return out;
}

// ───────── 보조 ─────────
function bearerUser(req) {
  const a = req.headers['authorization'] || '';
  const tok = a.replace(/^Bearer\s+/i, '');
  return userFromToken(tok);
}
function send(res, status, body, headers = {}) {
  const buf = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, { 'content-type': typeof body === 'string' || Buffer.isBuffer(body) ? (headers['content-type'] || 'text/plain') : 'application/json', ...headers });
  res.end(buf);
}
async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const s = Buffer.concat(chunks).toString('utf8');
  try { return s ? JSON.parse(s) : null; } catch { return s; }
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  const cors = {
    'access-control-allow-origin': origin || '*',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': req.headers['access-control-request-headers'] || '*',
    'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,HEAD,OPTIONS',
    'access-control-expose-headers': 'content-range,content-type',
  };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const p = url.pathname;
  const user = bearerUser(req);
  const sendC = (st, body, h = {}) => send(res, st, body, { ...cors, ...h });
  const entry = `${req.method} ${p}${url.search.slice(0, 260)}`;
  try {
    if (p === '/__mock/now') return sendC(200, { now: NOW, iso: new Date(NOW).toISOString() });
    if (p === '/__mock/ids') return sendC(200, { won: WON[1], settle: { sr: WON[1].sr }, perf: { ins: VEH[0].ins }, extra: EXTRA_SR, veh: VEH.map((v) => ({ i: v.i, au: v.au, li: v.li, sr: v.sr, ins: v.ins, status: v.status })), now: NOW });
    if (p === '/__mock/missing') return sendC(200, [...missing]);
    // ── Auth ──
    if (p === '/auth/v1/user' && req.method === 'GET') {
      if (!user) return sendC(401, { code: 401, error_code: 'bad_jwt', msg: 'invalid JWT' });
      return sendC(200, user.authUser);
    }
    if (p === '/auth/v1/token' && req.method === 'POST') {
      const body = await readBody(req);
      const rt = String(body?.refresh_token || '');
      const u = SESSION_USERS[rt.replace(/^rt\./, '')];
      if (!u) return sendC(400, { code: 400, error_code: 'refresh_token_not_found', msg: 'Invalid Refresh Token' });
      return sendC(200, u.session());
    }
    if (p === '/auth/v1/admin/users' && req.method === 'GET') return sendC(200, { users: Object.values(SESSION_USERS).map((x) => x.authUser), aud: 'authenticated', total: Object.keys(SESSION_USERS).length });
    if (/^\/auth\/v1\/admin\/users\/[^/]+\/factors$/.test(p) && req.method === 'GET') return sendC(200, []);
    if (p.startsWith('/auth/v1/')) { log('AUTH?', entry); return sendC(200, {}); }
    // ── Storage ──
    let m = p.match(/^\/storage\/v1\/object\/sign\/([^/]+)$/);
    if (m && req.method === 'POST') {
      const body = await readBody(req);
      return sendC(200, (body?.paths || []).map((pp) => ({ error: null, path: pp, signedURL: `/object/sign/${m[1]}/${pp}?token=mock` })));
    }
    m = p.match(/^\/storage\/v1\/object\/sign\/([^/]+)\/(.+)$/);
    if (m && req.method === 'POST') return sendC(200, { signedURL: `/object/sign/${m[1]}/${m[2]}?token=mock` });
    m = p.match(/^\/storage\/v1\/(?:render\/image\/)?(?:object\/)?(?:sign|public|authenticated)\/([^/]+)\/(.+)$/) || p.match(/^\/storage\/v1\/object\/(?:sign|public)\/([^/]+)\/(.+)$/);
    if (m && req.method === 'GET') {
      const img = imageFor(m[1], decodeURIComponent(m[2]));
      return sendC(200, fs.readFileSync(img.file), { 'content-type': img.type, 'cache-control': 'public, max-age=3600' });
    }
    if (p.startsWith('/storage/v1/')) { log('STORAGE?', entry); return sendC(200, {}); }
    // ── PostgREST RPC ──
    m = p.match(/^\/rest\/v1\/rpc\/([a-z_0-9]+)$/);
    if (m) {
      const args = req.method === 'POST' ? await readBody(req) : Object.fromEntries(url.searchParams);
      const fn = RPC[m[1]];
      log('RPC', m[1], JSON.stringify(args || {}).slice(0, 160), user ? `as ${user.role}` : 'anon');
      if (!fn) { missing.add('rpc:' + m[1]); return sendC(200, null); }
      const out = await fn(args || {}, { user, req });
      return sendC(200, out === undefined ? null : out);
    }
    // ── PostgREST 표 ──
    m = p.match(/^\/rest\/v1\/([a-z_0-9]+)$/);
    if (m) {
      const table = m[1];
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const body = await readBody(req);
        log('WRITE-IGNORED', req.method, table, JSON.stringify(body || {}).slice(0, 100));
        const prefer = req.headers.prefer || '';
        return sendC(req.method === 'POST' ? 201 : 200, prefer.includes('return=representation') ? (Array.isArray(body) ? body : body ? [body] : []) : '', prefer.includes('return=representation') ? {} : { 'content-type': 'application/json' });
      }
      if (!TABLES[table]) { missing.add('table:' + table); log('TABLE?', entry); }
      let base = TABLES[table] || [];
      // RLS 흉내: 딜러 세션이 읽는 본인 행 표(딜러 A) — service_role(서버 admin 클라이언트)은 user 가 없어 전체
      if (user && user.role === 'dealer' && DEALER_OWN.has(table)) base = base.filter((r) => r.dealer_id === DEALER_ME);
      const params = [...url.searchParams.entries()];
      const items = parseSelect(url.searchParams.get('select') || '*');
      let rows = filterRows(base, params, table);
      rows = innerFilter(rows, items, table);
      rows = sortRows(rows, url.searchParams.get('order'));
      const total = rows.length;
      const range = (req.headers.range || '').match(/^(\d+)-(\d+)$/);
      const off = Number(url.searchParams.get('offset') || (range ? range[1] : 0));
      const lim = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : range ? Number(range[2]) - Number(range[1]) + 1 : Infinity;
      rows = rows.slice(off, off + lim);
      const out = project(rows, items, table);
      const prefer = req.headers.prefer || '';
      const headers = prefer.includes('count=') ? { 'content-range': `${out.length ? off : '*'}${out.length ? '-' + (off + out.length - 1) : ''}/${total}` } : {};
      log('GET', entry, '->', out.length);
      if (req.method === 'HEAD') return sendC(200, '', { ...headers, 'content-type': 'application/json' });
      if ((req.headers.accept || '').includes('vnd.pgrst.object+json')) {
        if (out.length !== 1) return sendC(406, { code: 'PGRST116', details: `The result contains ${out.length} rows`, hint: null, message: 'JSON object requested, multiple (or no) rows returned' }, headers);
        return sendC(200, out[0], headers);
      }
      return sendC(200, out, headers);
    }
    log('UNHANDLED', entry);
    return sendC(404, { message: 'mock: not handled', path: p });
  } catch (e) {
    log('ERROR', entry, String(e.stack || e).slice(0, 400));
    return sendC(500, { message: 'mock error: ' + e.message });
  }
});
server.listen(PORT, '127.0.0.1', () => console.log(`mock-supabase listening ${PORT} pid ${process.pid}`));
