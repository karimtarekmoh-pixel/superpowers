#!/bin/bash
# record.sh <script.py> <out.mp4> <seconds>: runs the real script in a real xterm on a virtual screen and screen-records it
set -e
SCRIPT=$1; OUT=$2; SECS=$3; D=:99
Xvfb $D -screen 0 1920x960x24 >/dev/null 2>&1 & XV=$!; sleep 1.5
export DISPLAY=$D LC_ALL=C.UTF-8 LANG=C.UTF-8
xterm -u8 -fa 'DejaVu Sans Mono' -fs 32 -bg '#0e1220' -fg white -b 80 +sb -geometry 66x19+0+0 -e bash -c "cd $(pwd); sleep 0.7; python3 $SCRIPT; sleep 0.6" & XT=$!
ffmpeg -loglevel error -y -draw_mouse 0 -f x11grab -video_size 1920x960 -framerate 30 -i $D -t $SECS -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p "$OUT"
kill $XT $XV 2>/dev/null || true
