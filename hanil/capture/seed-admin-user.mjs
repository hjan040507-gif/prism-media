// 로컬 Supabase(127.0.0.1:57031)에 가짜 관리자 계정 생성 — GoTrue admin API. 키는 사본 .env.local(로컬 값)에서 읽고 출력하지 않는다.
import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync(new URL('../../tmp/hanil-src/.env.local', import.meta.url), 'utf8').split('\n').filter((l) => l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]; }));
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
if (URL_ !== 'http://127.0.0.1:57031') throw new Error('로컬 주소가 아니다: ' + URL_);
const r = await fetch(`${URL_}/auth/v1/admin/users`, {
  method: 'POST',
  headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'admin@example.com', password: process.env.FAKE_ADMIN_PW, email_confirm: true }),
});
console.log('create admin user', r.status);
