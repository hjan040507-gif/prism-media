// 관리자 웹 사본(tmp/nowflix-src/admin-web)에 가짜 env 와 가짜 세션 토큰을 만든다. 진짜 값은 쓰지 않는다.
// 실행: node nowflix/capture/setup-fake-env.mjs <mockPort>   (사본에 npm ci 가 끝난 뒤)
// 만드는 것: admin-web/.env.local (SUPABASE_URL=목 서버, 나머지는 무작위 가짜 값), tmp/nowflix-src/fake-session.json {token, hash}
import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', '..', 'tmp', 'nowflix-src');
const APP = path.join(SRC, 'admin-web');
const require = createRequire(path.join(APP, 'package.json'));
const bcrypt = require('bcryptjs');
const { SignJWT } = require('jose');

const mockPort = process.argv[2];
if (!mockPort) throw new Error('mock 포트 필요');
const rnd = (n) => crypto.randomBytes(n).toString('hex');
const secret = rnd(32);
const fakePassword = rnd(8);
const hash = bcrypt.hashSync(fakePassword, 4);
const token = await new SignJWT({ role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('8h').sign(new TextEncoder().encode(secret));

fs.writeFileSync(path.join(APP, '.env.local'), [
  `SUPABASE_URL=http://127.0.0.1:${mockPort}`,
  `SUPABASE_ANON_KEY=fake-anon-${rnd(6)}`,
  `SUPABASE_SERVICE_ROLE_KEY=fake-service-${rnd(6)}`,
  `YOUTUBE_API_KEY=fake-youtube-${rnd(6)}`,
  `SESSION_SECRET=${secret}`, '',
].join('\n'), { mode: 0o600 });
fs.writeFileSync(path.join(SRC, 'fake-session.json'), JSON.stringify({ token, hash }), { mode: 0o600 });
console.log('fake env written (값은 출력하지 않는다)');
