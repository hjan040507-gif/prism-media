#!/usr/bin/env bash
# 2차 완료 조건 증거를 한 파일로 모은다(읽기만 한다). 사용: bash tools/final-evidence-2.sh > docs/evidence/final2-<날짜>.txt
cd "$(dirname "$0")/.." || exit 1
PROJ="okjob matchsat hanil eureka sy-motors pscompany edubily switin soopon waylog"
echo "# 2차 완료 조건 증거 · $(date -u +%FT%TZ) · prism-media $(git rev-parse --short HEAD) · origin $(git rev-parse --short origin/main)"
echo; echo "## 1. check.py 요약 줄 + BLOCKED.md 유무"
for p in $PROJ; do echo "$(python3 tools/check.py "$p" 2>&1 | grep -E "^$p:") · BLOCKED.md $( [ -f "$p/BLOCKED.md" ] && echo 있음 || echo 없음)"; done
echo; echo "## 2. OCR 보고서 첫 줄"
for p in $PROJ; do echo "$p: $(head -1 "$p/ocr-report.txt" 2>/dev/null || echo '(PNG 없음 또는 미실행)')"; done
echo; echo "## 3. json pii_scan.total != 0 인 파일(capture/ 제외)"
python3 - "$PROJ" <<'EOF'
import json, os, sys
bad = 0; n = 0
for p in sys.argv[1].split():
    for dp, _, fns in os.walk(p):
        if '/capture' in dp: continue
        for fn in fns:
            if not fn.endswith('.json'): continue
            try: d = json.load(open(os.path.join(dp, fn), encoding='utf-8'))
            except Exception: continue
            if isinstance(d, dict) and 'pii_scan' in d:
                n += 1
                ps = d['pii_scan'] or {}
                if (ps.get('total', 0) if isinstance(ps, dict) else ps) != 0: bad += 1; print('  ', os.path.join(dp, fn))
print(f"pii_scan 있는 json {n} · total≠0 {bad}")
EOF
echo; echo "## 4. 95MB 넘는 파일 · 폴더 크기"
find $PROJ -type f -size +95M 2>/dev/null | sed 's/^/  /'; echo "count=$(find $PROJ -type f -size +95M 2>/dev/null | wc -l)"
du -sh $PROJ 2>/dev/null | tr '\n' ' '; echo
echo; echo "## 5. 고객 레포 git status 기준선 대조(docs/baseline2, 소스 없는 eureka·pscompany·edubily·switin 제외)"
for r in Okjob satorder hanil kakaoauto Soopon waylog1; do
  if diff <(grep -v '^$' "docs/baseline2/$r.status") <(git -C "$HOME/$r" status --porcelain) >/dev/null; then echo "  $r: same"; else echo "  $r: DIFF"; diff <(grep -v '^$' "docs/baseline2/$r.status") <(git -C "$HOME/$r" status --porcelain) | head -6 | sed 's/^/      /'; fi
  if diff <(cat "docs/baseline2/$r.worktrees" | awk '{print $1}') <(git -C "$HOME/$r" worktree list | awk '{print $1}') >/dev/null; then echo "     worktree 목록 same"; else echo "     worktree 목록 DIFF"; fi
done
echo; echo "## 6. 임시 사본·서버·로컬 Supabase"
echo "  tmp/*-src: $(ls -d tmp/*-src 2>/dev/null | wc -l)"
echo "  배정 포트(57010-57039·3611-3616) LISTEN: $(ss -ltn 2>/dev/null | grep -cE ':(570[1-3][0-9]|361[1-6]) ')"
echo "  pm-* 컨테이너: $(docker ps -a --format '{{.Names}}' 2>/dev/null | grep -c 'pm-')  · pm-* 볼륨: $(docker volume ls -q 2>/dev/null | grep -c 'pm-')"
echo; echo "## 7. 2차 커밋(push 상태: $(git status -sb | head -1))"
git log --oneline 4592832^..HEAD
