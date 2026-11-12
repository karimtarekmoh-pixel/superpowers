#!/bin/bash
# waits for the Blender batch, re-renders the hook plate with less haze, builds media, renders the video, muxes audio
B=/home/user/superpowers/space-whatif/artemis3/blender; H=/home/user/superpowers/space-whatif/artemis3/build
until [ -f $B/frames3/done.txt ]; do sleep 30; done
mkdir -p $B/frames3/p1_old; mv $B/frames3/p1/f_*.png $B/frames3/p1_old/ 2>/dev/null
/tmp/bl311/bin/python $B/scene3d_v2.py p1 1 96 8 80 3 > $B/frames3/log_p1b.txt 2>&1
cd $H && python3 tools/prep_media.py $B/frames3 > out/prep.log 2>&1
export PATH=/home/user/superpowers/hf-test/node_modules/.bin:$PATH
node tools/build_long.mjs > out/build.log 2>&1
CLEAN=1 BED=none NOEND=1 AMBIENT=1 /tmp/claude-0/kokoro/venv/bin/python tools/mix.py > out/mix.log 2>&1; cp public/mix.wav hf/mix.wav
(cd hf && hyperframes lint > ../out/lint.log 2>&1)
rm -f out/_silent.mp4; (cd hf && hyperframes render -q delivery -o ../out/_silent.mp4 --quiet > ../out/render.log 2>&1)
ffmpeg -v error -y -i public/mix.wav -af "loudnorm=I=-14:TP=-2:LRA=11,aresample=48000" audio/_pre.wav
ffmpeg -v error -y -i out/_silent.mp4 -i audio/_pre.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest out/artemis3-longform-v3.mp4
echo "FINAL $(ffprobe -v error -show_entries format=duration,size -of csv=p=0 out/artemis3-longform-v3.mp4) $(ffmpeg -nostats -i out/artemis3-longform-v3.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+(I:|Peak:)' | tr -s ' ' | tr '\n' ' ')" > out/final_v3.txt
