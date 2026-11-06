#!/bin/bash
# waylog 전체 재촬영(서버가 포트 3614 에서 떠 있어야 한다 — common.mjs 머리 주석). 사용: cd ~/prism-media && bash waylog/capture/rerun-all.sh
set -u
cd /home/dev/prism-media
rm -rf waylog/mobile waylog/desktop waylog/states waylog/seq
node waylog/capture/mobile-pages.mjs > tmp/waylog-mp.log 2>&1
node waylog/capture/desktop-pages.mjs > tmp/waylog-dp.log 2>&1
node waylog/capture/mobile-states.mjs > tmp/waylog-ms.log 2>&1
python3 waylog/capture/make-shots-md.py > tmp/waylog-shots.log 2>&1
nice -n 10 python3 -I waylog/capture/brand-ocr.py waylog -j 3 --all > tmp/waylog-brandocr-all.log 2>&1
nice -n 10 python3 tools/ocr.py waylog -j 3 > tmp/waylog-ocr.log 2>&1
python3 tools/check.py waylog > tmp/waylog-check.log 2>&1
echo "RERUN-DONE"
