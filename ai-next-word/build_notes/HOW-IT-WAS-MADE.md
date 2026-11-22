# "AI doesn't know anything" (33.6 s, 1920x1080, wide with letterbox bars)

- Voice: Higgsfield seed_audio, preset Arthur (one generation, 3.2 credits). Word times from faster-whisper small.en.
- Footage (captured, not drawn): live GPT-2 small runs recorded from a real xterm (capture/), real recordings of platform.claude.com docs and two Wikipedia articles (capture/capture_pages.cjs).
- Animation: HyperFrames (HTML + one paused GSAP timeline), built from src_build/template.html by src_build/build.py; orange-jacket stickman is an SVG rig; wipes between scenes; quiet code-made SFX from src_build/mix.py; loudnorm to -14 LUFS.
- Render: `hyperframes render -q delivery` from hf/ (about 2 minutes), then mux with audio/mix_final.wav.
