#!/usr/bin/env bash
# 완료 조건 증거를 한 파일로 모은다(읽기만 한다). 사용: bash tools/final-evidence.sh > docs/evidence/final-<날짜>.txt
cd "$(dirname "$0")/.." || exit 1
PROJ="sealkitt posco byclick fordex jipyeong maieventic medimajor sellfit nowflix"
echo "# 완료 조건 증거 · $(date -u +%FT%TZ) · prism-media $(git rev-parse --short HEAD)"
echo; echo "## 1. check.py (nowflix --tablet)"
for p in $PROJ; do
  if [ "$p" = nowflix ]; then python3 tools/check.py "$p" --tablet 2>&1 | tail -1; else python3 tools/check.py "$p" 2>&1 | tail -1; fi
done
echo; echo "## 2. OCR 보고서 첫 줄 + 판정 줄"
for p in $PROJ; do echo "$p: $(head -1 "$p/ocr-report.txt" 2>/dev/null)"; grep -h '판정' "$p/ocr-report.txt" 2>/dev/null | sed 's/^/    /' | head -3; done
echo; echo "## 3. json pii_scan.total != 0 인 파일"
python3 - <<'EOF'
import json, os
bad = 0; n = 0
for p in "sealkitt posco byclick fordex jipyeong maieventic medimajor sellfit nowflix".split():
    for dp, _, fns in os.walk(p):
        if '/capture' in dp: continue
        for fn in fns:
            if not fn.endswith('.json'): continue
            try: d = json.load(open(os.path.join(dp, fn), encoding='utf-8'))
            except Exception: continue
            if isinstance(d, dict) and 'pii_scan' in d:
                n += 1
                if (d['pii_scan'] or {}).get('total', 0) != 0: bad += 1; print('  ', os.path.join(dp, fn))
print(f"pii_scan 있는 json {n} · total≠0 {bad}")
EOF
echo; echo "## 4. 요소 묶음 글자 재검사(tmp/elements-scan.py)"
python3 tmp/elements-scan.py 2>&1
echo; echo "## 5. 95MB 넘는 파일"
find $PROJ -type f -size +95M | sed 's/^/  /'; echo "count=$(find $PROJ -type f -size +95M | wc -l)"
echo; echo "## 6. 고객 레포 git status 기준선 대조(빈 줄 무시)"
declare -A REPO=([sealkitt]=sealkitt [maimai-posco]=maimai-posco [bikeclickofficial]=bikeclickofficial [fordex]=fordex [maimai-jipyeong]=maimai-jipyeong [maimai-event-builder]=maimai-event-builder [Medimajor]=Medimajor [sellfit]=sellfit [nowflix-kiosk]=nowflix-kiosk)
for r in "${!REPO[@]}"; do
  if [ -d "$HOME/$r" ]; then
    if diff <(grep -v '^$' "docs/baseline/$r.status") <(git -C "$HOME/$r" status --porcelain) >/dev/null; then echo "  $r: same"; else echo "  $r: DIFF"; diff <(grep -v '^$' "docs/baseline/$r.status") <(git -C "$HOME/$r" status --porcelain) | head -6 | sed 's/^/      /'; fi
  else echo "  $r: (폴더 없음)"; fi
done
echo; echo "## 7. 임시 사본·서버"
echo "  tmp/*-src: $(ls -d tmp/*-src 2>/dev/null | wc -l)"
echo "  이 작업이 쓴 포트(3207 3260 3263 4310) LISTEN: $(ss -ltn 2>/dev/null | grep -cE ':(3207|3260|3263|4310) ')"
echo; echo "## 8. 커밋"
git log --oneline -25
