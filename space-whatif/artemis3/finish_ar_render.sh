#!/bin/bash
# Arabic dub: render + loudness + mux (page and mix already built by finish_ar.sh)
H=/home/user/superpowers/space-whatif/artemis3/build_ar
cd $H; export PATH=/home/user/superpowers/hf-test/node_modules/.bin:$PATH
rm -f out/_silent.mp4; (cd hf && hyperframes render -q delivery -o ../out/_silent.mp4 --quiet > ../out/render.log 2>&1)
ffmpeg -v error -y -i public/mix.wav -af "loudnorm=I=-14:TP=-2:LRA=11,aresample=48000" audio/_pre.wav
ffmpeg -v error -y -i out/_silent.mp4 -i audio/_pre.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest out/artemis3-longform-ar.mp4
echo "FINAL $(ffprobe -v error -show_entries format=duration,size -of csv=p=0 out/artemis3-longform-ar.mp4) $(ffmpeg -nostats -i out/artemis3-longform-ar.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+(I:|Peak:)' | tr -s ' ' | tr '\n' ' ')" > out/final_ar.txt
