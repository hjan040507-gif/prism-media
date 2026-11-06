#!/bin/bash
# (source) 로컬 Supabase 값을 환경변수로 내보낸다 — 값은 출력하지 않는다. 앱 .env.local 도 이 값으로만 만든다(NEXT_PUBLIC_SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY 3개, 발송·결제·AI 키 없음).
cd ~/prism-media/tmp/okjob-src || return 1
eval "$(env -u SUPABASE_ACCESS_TOKEN -u SUPABASE_DB_PASSWORD -u SUPABASE_PROJECT_REF -u SUPABASE_URL -u SUPABASE_SERVICE_ROLE_KEY supabase status -o env 2>/dev/null | grep -E '^(API_URL|ANON_KEY|SERVICE_ROLE_KEY)=' | sed 's/^/export LOCAL_/')"
export NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:57010"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="$LOCAL_ANON_KEY"
export SUPABASE_SERVICE_ROLE_KEY="$LOCAL_SERVICE_ROLE_KEY"
[ "$LOCAL_API_URL" = "http://127.0.0.1:57010" ] || { echo "API_URL 불일치"; return 1; }
