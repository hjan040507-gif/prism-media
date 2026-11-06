// fordex 가짜 데이터 층 — UI 코드·API 응답 모양은 그대로, "값"만 바꾼다(shots.md '가짜 데이터').
//  · 복제 DB 에 e2e 시험 흔적(e2e-·qa… 이름 매물)이 많아 → 제목·설명을 그럴듯한 카드명으로, 닉네임·이름·전화·주소를 가림 값으로
//  · 시드 카드 사진(단색 줄무늬 PNG) → 실제 카드 이미지(images.pokemontcg.io 공개 이미지를 tmp/fordex-cards 에 내려받아 둔 것)
//  · auction_enabled 꺼짐·경매 매물 없음 → 설정·매물 응답을 가짜로(UI 코드는 그대로)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../../tools/lib.mjs';
import { allowRpc } from './common.mjs';

const CARD_DIR = path.join(ROOT, 'tmp', 'fordex-cards');
export const CARDS = [
  { f: 'c4.png', ko: '리자몽', set: '베이스 세트', rarity: 'Holo', no: '4/102' },
  { f: 'c58.png', no: '58/102', ko: '피카츄', set: '베이스 세트', rarity: 'C' },
  { f: 'c6.png', no: '6/102', ko: '갸라도스', set: '베이스 세트', rarity: 'Holo' },
  { f: 'c2.png', no: '2/102', ko: '거북왕', set: '베이스 세트', rarity: 'Holo' },
  { f: 'c15.png', no: '15/102', ko: '이상해꽃', set: '베이스 세트', rarity: 'Holo' },
  { f: 'c10.png', no: '10/102', ko: '뮤츠', set: '베이스 세트', rarity: 'Holo' },
  { f: 'c16.png', no: '16/102', ko: '피존투', set: '베이스 세트', rarity: 'Holo' },
  { f: 'c8.png', no: '8/102', ko: '괴력몬', set: '베이스 세트', rarity: 'Holo' },
  { f: 'c7.png', no: '7/102', ko: '시라소몬', set: '베이스 세트', rarity: 'Holo' },
  { f: 'c3.png', no: '3/102', ko: '럭키', set: '베이스 세트', rarity: 'Holo' },
];
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const SEED_CARD = { c1: 4, c2: 2, c3: 3, c4: 1, c5: 0 }; // 복제 시드 카드 5종(c1..c5) → 실카드 이미지 배정
const cardById = (id) => { const m = String(id || '').match(/-0000000000(c[1-5])$/); return m ? CARDS[SEED_CARD[m[1]]] : null; };
const pick = (id) => cardById(id) || CARDS[hash(id) % CARDS.length];
export const cardFor = pick;
const BAD = /e2e|qa\d{3,}|replica|복제|시험|합성|숨김|admin2|common\d|e2e-/i;
const imgUrl = (c) => `http://127.0.0.1:54400/storage/v1/object/public/card-images/fordex-demo/${c.f}`;

const NICK_KEYS = /^(nickname|seller_nickname|buyer_nickname|reporter_nickname|reported_nickname|username|other_nickname|bidder_nickname|display_name|author_nickname|target_nickname)$/;
const NAME_KEYS = /^(full_name|real_name|recipient_name|receiver_name|buyer_name|seller_name|name_kr|depositor_name|account_holder|holder_name)$/;
const PHONE_KEYS = /(phone|mobile|tel)/i;
const ADDR_KEYS = /^(address\w*|addr|road_address|recipient_address|zipcode|zip_code|postal_code)$/i;
const MEMO_KEYS = /^(shipping_memo|delivery_memo|memo)$/i;

export function walk(v, key = '', ctxObj = null) {
  if (Array.isArray(v)) return v.map((x) => walk(x, key));
  if (v && typeof v === 'object') {
    const out = {};
    // 매물 모양(custom_title) 객체: 카드·사진을 id 로 고정 배정
    const isListing = 'custom_title' in v || ('listing_type' in v && 'price' in v && 'seller_id' in v);
    const card = isListing ? (cardById(v.card_id) || pick(v.id)) : null;
    for (const [k, val] of Object.entries(v)) out[k] = walk(val, k, v);
    if (isListing) {
      out.custom_title = `${card.ko} ${card.set} ${card.rarity}`;
      if ('card_name' in out) out.card_name = card.ko;
      if ('card_set_name' in out && out.card_set_name) out.card_set_name = card.set;
      if ('card_rarity' in out && out.card_rarity) out.card_rarity = card.rarity;
      if (Array.isArray(out.image_urls)) out.image_urls = [imgUrl(card), imgUrl(card)];
      if (out.cards && typeof out.cards === 'object' && !Array.isArray(out.cards)) {
        Object.assign(out.cards, { card_number: card.no, name: card.ko, korean_name: card.ko, name_en: card.ko, set_name: card.set, korean_set_name: card.set, rarity: card.rarity, image_url: imgUrl(card) });
      }
      if ('card_image_url' in out && !out.card_image_url) out.card_image_url = imgUrl(card);
      if (typeof out.description === 'string') out.description = '개봉 후 바로 슬리브에 보관했습니다. 앞뒤 사진 확인 부탁드려요.';
    }
    if (typeof out.name === 'string' && 'card_number' in out && 'external_source' in out) {
      const c = pick(out.id); out.card_number = c.no; out.rarity = c.rarity; out.korean_rarity = c.rarity; out.name = c.ko; out.korean_name = c.ko; out.name_en = c.ko; out.set_name = c.set; out.korean_set_name = c.set; out.image_url = imgUrl(c);
    }
    if (typeof out.image_url === 'string' && /fordex-demo|replica-cards/.test(out.image_url)) out.image_url = imgUrl(pick(out.id || out.image_url));
    return out;
  }
  if (typeof v === 'string') {
    if (NICK_KEYS.test(key) || (key === 'nickname')) return 'user***';
    if (NAME_KEYS.test(key)) return '김○○';
    if (PHONE_KEYS.test(key) && /\d{3}/.test(v)) return '010-****-****';
    if (ADDR_KEYS.test(key)) return /zip|postal/i.test(key) ? '12345' : /2$|detail/i.test(key) ? '' : '서울특별시 강남구';
    if (MEMO_KEYS.test(key)) return '';
    if (/@/.test(v) && /^[^\s@]+@[^\s@]+$/.test(v)) return 'user***';
    if (key === 'title' || key === 'content') return BAD.test(v) ? '카드 거래 안내' : v;
  }
  return v;
}

const jsonHeaders = (r) => { const h = { ...r.headers() }; delete h['content-length']; delete h['content-encoding']; return h; };

/** ctx 에 가짜 층을 건다. 나중에 등록한 route 가 먼저 돈다 → guard 보다 앞선다. */
export async function installFake(ctx, { overrides = [], patch = null } = {}) {
  const stats = { transformed: 0, images: 0, reads: [], overridden: [] };
  ctx.__fake = stats;
  // 1) 시드 줄무늬 카드 사진 → 실제 카드 이미지
  await ctx.route(/\/storage\/v1\/(object|render\/image)\/public\/[^/]+\/.*\.(png|jpe?g|webp)/i, async (route) => {
    const u = route.request().url();
    const m = u.match(/fordex-demo\/(c\d+\.png)/);
    const file = m ? m[1] : pick(u).f;
    stats.images++;
    return route.fulfill({ status: 200, contentType: 'image/png', body: fs.readFileSync(path.join(CARD_DIR, file)) });
  });
  // 2) PostgREST 읽기: 응답 값 치환 + 프로젝트별 override
  await ctx.route(/\/rest\/v1\//, async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();
    const isRead = method === 'GET' || (method === 'POST' && allowRpc.test(url));
    if (!isRead) return route.fallback();
    for (const o of overrides) {
      if (o.match.test(url) && (!o.method || o.method === method)) {
        stats.overridden.push(`${method} ${new URL(url).pathname}`);
        if (o.json !== undefined) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(typeof o.json === 'function' ? o.json(req) : o.json) });
        if (o.transform) {
          const r = await route.fetch();
          let body; try { body = await r.json(); } catch { return route.fulfill({ response: r }); }
          return route.fulfill({ status: r.status(), headers: jsonHeaders(r), body: JSON.stringify(walk(o.transform(body, req))) });
        }
      }
    }
    let r;
    try { r = await route.fetch(); } catch (e) { return route.abort(); }
    const ct = r.headers()['content-type'] || '';
    stats.reads.push(`${method} ${new URL(url).pathname}`);
    if (!/json/.test(ct)) return route.fulfill({ response: r });
    let body; try { body = await r.json(); } catch { return route.fulfill({ response: r }); }
    stats.transformed++;
    return route.fulfill({ status: r.status(), headers: jsonHeaders(r), body: JSON.stringify(walk(patch ? patch(body, url) : body)) });
  });
  return stats;
}
