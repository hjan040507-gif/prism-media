#!/usr/bin/env python3
# 사본(tmp/hanil-src)의 .env.local 을 로컬 Supabase 값으로만 새로 만든다. `supabase status -o env` 를 stdin 으로 받는다.
# 값은 출력하지 않는다(키 이름만). 운영 .env.local 은 읽지 않는다.
import re, sys
d = {}
for l in sys.stdin:
    m = re.match(r'^([A-Z_]+)="?(.*?)"?\s*$', l)
    if m:
        d[m.group(1)] = m.group(2)
out = sys.argv[1]
assert d['API_URL'].startswith('http://127.0.0.1:57031'), d['API_URL']
open(out, 'w').write(
    f"NEXT_PUBLIC_SUPABASE_URL={d['API_URL']}\n"
    f"NEXT_PUBLIC_SUPABASE_ANON_KEY={d['ANON_KEY']}\n"
    f"SUPABASE_SERVICE_ROLE_KEY={d['SERVICE_ROLE_KEY']}\n"
    "NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3613\n"
)
print('wrote keys: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL (local 127.0.0.1:57031 only)')
