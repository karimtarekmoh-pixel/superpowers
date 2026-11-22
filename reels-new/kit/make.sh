#!/bin/bash
# usage: make.sh <reel-dir>   (needs <reel-dir>/src/spec.json). Builds everything except the final render+mux; see render.sh
set -e
K=/home/user/superpowers/reels-new/kit; R=$1; cd "$R"; PY=/tmp/claude-0/kokoro/venv/bin/python
export PATH=/home/user/superpowers/hf-test/node_modules/.bin:$PATH
mkdir -p src tools audio hf out public
cp $K/src/timeline.js $K/src/cues.js src/; cp $K/tools/* tools/; cp -r $K/hf/fonts $K/hf/gsap.min.js hf/
python3 tools/spec_to_script.py
$PY tools/tts.py 0.95
$PY tools/build_vo.py audio/vo_full_raw.wav 1.0 0.4 | head -9
node tools/export_events.mjs | cut -c1-60
CLEAN=1 ARP=1 BED_LUFS=-21 BED_START=3 $PY tools/mix.py 2>&1 | tail -1 | cut -c1-50
cp public/mix.wav hf/mix.wav
node tools/build_kit.mjs
node tools/safe_check.mjs
(cd hf && hyperframes lint 2>&1 | grep -E "✗|error\(s\)")
