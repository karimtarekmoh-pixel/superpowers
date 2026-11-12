#!/bin/bash
# usage: render.sh <reel-dir> <outname>  : silent render (delivery quality) + mux + loudness
set -e
R=$1; N=$2; cd "$R"; export PATH=/home/user/superpowers/hf-test/node_modules/.bin:$PATH
rm -f out/_silent.mp4; (cd hf && hyperframes render -q delivery -o ../out/_silent.mp4 --quiet > ../out/render.log 2>&1)
ffmpeg -v error -y -i public/mix.wav -af "acompressor=threshold=-24dB:ratio=3:attack=5:release=150:makeup=4,loudnorm=I=-14:TP=-3:LRA=9,aresample=48000" audio/_pre.wav
ffmpeg -v error -y -i out/_silent.mp4 -i audio/_pre.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest out/$N.mp4
echo "$N: $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/$N.mp4)s $(ffmpeg -nostats -i out/$N.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+(I:|Peak:)' | tr -s ' ' | tr '\n' ' ')"
