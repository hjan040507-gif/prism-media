#!/bin/bash
# 안전 절차 4: 시드·마이그레이션 직전 접속 주소 확인(사본 폴더 tmp/okjob-src 에서). API_URL·DB_URL 이 127.0.0.1:57010/57011 이 아니면 exit 1.
cd ~/prism-media/tmp/okjob-src || exit 1
out=$(env -u SUPABASE_ACCESS_TOKEN -u SUPABASE_DB_PASSWORD -u SUPABASE_PROJECT_REF -u SUPABASE_URL -u SUPABASE_SERVICE_ROLE_KEY supabase status -o env 2>/dev/null | grep -E '^(API_URL|DB_URL)=' | sed -E 's#//[^@/]*@#//***@#')
echo "$out"
echo "--- $(date -u +%FT%TZ) $1" >> ~/prism-media/okjob/capture/local-db-check.txt
echo "$out" >> ~/prism-media/okjob/capture/local-db-check.txt
echo "$out" | grep -q '^API_URL="http://127.0.0.1:57010"' && echo "$out" | grep -q '127.0.0.1:57011/' || { echo "주소 불일치 — 중단"; exit 1; }
echo ADDR_OK
