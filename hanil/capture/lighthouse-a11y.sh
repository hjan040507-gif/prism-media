#!/bin/bash
# 운영 공개 페이지 Lighthouse 접근성만(GET 만). Chrome for Testing 154(~/.cache/chrome-for-testing) + chrome-launcher 기본 플래그(--no-sandbox 없음).
# 사용: hanil/capture/lighthouse-a11y.sh  → hanil/capture/lighthouse-a11y.result.tsv (url · score · 실패 audit · 실행 시각)
ROOT=$HOME/prism-media
CHROME=$HOME/.cache/chrome-for-testing/154.0.8037.57/chrome-linux-arm64/chrome
OUT=$ROOT/hanil/capture/lighthouse-a11y.result.tsv
: > "$OUT"
for u in / /company/greeting /product /product/gas-nitriding /facility /support/quote; do
  f=$ROOT/tmp/lh-$(echo "$u" | tr '/' '_').json
  env -u CI CHROME_PATH=$CHROME nice -n 10 $ROOT/tmp/lh/node_modules/.bin/lighthouse "https://www.hanil-pnk.com$u" --only-categories=accessibility --output=json --output-path="$f" --form-factor=mobile --chrome-flags="--headless=new" --quiet > /dev/null 2>&1 &
  lp=$!
  sleep 12
  if [ "$u" = "/" ]; then ps -eo args | grep "$CHROME" | grep -v grep | grep -v "chrome-devtools-mcp" | head -3 | grep -c -- '--no-sandbox' > $ROOT/hanil/capture/lighthouse-nosandbox-count.txt; fi
  wait $lp
  python3 - "$u" "$f" >> "$OUT" <<'PY'
import json,sys
u,f=sys.argv[1:3]
try:
    j=json.load(open(f))
    bad=[k for k,a in j['audits'].items() if a['score']==0 and a['scoreDisplayMode'] in ('binary','numeric')]
    print(f"{u}\t{round(j['categories']['accessibility']['score']*100)}\t{','.join(bad) or '-'}\t{j['fetchTime']}\t{j['lighthouseVersion']}\t{j['environment']['hostUserAgent'].split(') ')[-1]}")
except Exception as e:
    print(f"{u}\tERROR\t{e}\t-")
PY
  sleep 3
done
cat "$OUT"
