// 4개 계정 로그인 세션 저장(로컬 앱 :3612) + 주문 id 목록(ids.json) 저장. 실행: set -a; . tmp/matchsat-pw.env; set +a; node matchsat/capture/setup-login.mjs
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { launch } from '../../tools/lib.mjs';
import { loginAs, STATE_DIR } from './common.mjs';

const DB = 'postgresql://postgres:postgres@127.0.0.1:57021/postgres';
const q = (s) => execFileSync('psql', [DB, '-At', '-F', '\t', '-c', s], { encoding: 'utf8' }).trim();
fs.mkdirSync(STATE_DIR, { recursive: true });
const rows = q(`select title, id from public.rfqs`).split('\n').map((l) => l.split('\t'));
const T = Object.fromEntries(rows);
const ids = {
  bidded: T['서해안 갯벌 변화 관측 위성영상'], urgent: T['산불 피해 구역 긴급 촬영'], edit: T['항만 야적장 적재 현황 촬영'], analysis: T['농경지 작황 영상 및 객체분석'],
  won: T['댐 수위 변화 SAR 관측'], lost: T['도심 열섬 분석용 야간 촬영'], spPending: T['해안 침식 정밀 지정 촬영'], spRej1: T['국가산단 시설 정기 지정 촬영'], spRej2: T['철새 도래지 지정 관측'],
};
if (Object.values(ids).some((v) => !v)) throw new Error('주문 id 누락 ' + JSON.stringify(ids));
fs.writeFileSync(`${STATE_DIR}/ids.json`, JSON.stringify(ids, null, 1));
const browser = await launch();
try { for (const who of ['reqA', 'reqB', 'supA', 'admin']) await loginAs(browser, who); } finally { await browser.close(); }
