"""Turn Blender frames into the composition's media: chapter plates (8 fps renders -> blended 30 fps, ping-pong, looped to the chapter) and
transparent VP9 sprites (looped sways, or play-once-then-hold dockings). usage: python3 tools/prep_media.py [frames_dir] [only_id ...]"""
import json, os, shutil, subprocess, sys, glob
FR = sys.argv[1] if len(sys.argv) > 1 else "/home/user/superpowers/space-whatif/artemis3/blender/frames3"
ONLY = set(sys.argv[2:])
M = json.load(open("audio/media.json")); os.makedirs("hf/plates", exist_ok=True); os.makedirs("hf/sprites", exist_ok=True); tmp = "out/_mtmp"; os.makedirs(tmp, exist_ok=True)
def run(cmd): subprocess.run(cmd, check=True)
for m in M:
    if ONLY and m["id"] not in ONLY: continue
    if m["kind"] == "plate":
        src = os.path.join(FR, m["id"]); frames = [os.path.join(src, f"f_{1 + 3 * k:04d}.png") for k in range(32)]
        frames = [f for f in frames if os.path.exists(f)]
        if len(frames) < 8: print("skip plate", m["id"], len(frames)); continue
        sq = os.path.join(tmp, m["id"]); shutil.rmtree(sq, ignore_errors=True); os.makedirs(sq)
        for i, f in enumerate(frames): shutil.copy(f, os.path.join(sq, f"{i:03d}.png"))
        # alpha plate: planets/rings opaque (Blender silhouette mask), sky transparent so the page's moving space shows through
        # and the glow stars and meteors sit behind the planets; a soft luma key keeps the atmosphere glow and bright stars
        msrc = src + "_mask"; mq = sq + "_m"; shutil.rmtree(mq, ignore_errors=True); os.makedirs(mq)
        for i, f in enumerate(frames): shutil.copy(os.path.join(msrc, os.path.basename(f)), os.path.join(mq, f"{i:03d}.png"))
        cyc = os.path.join(tmp, m["id"] + "_cycle.webm")
        run(["ffmpeg", "-y", "-v", "error", "-framerate", "8", "-i", os.path.join(sq, "%03d.png"), "-framerate", "8", "-i", os.path.join(mq, "%03d.png"), "-filter_complex",
             "[0]scale=1920:1080:flags=lanczos,format=rgb24,split[c][l];[l]format=gray,lut=y='clip((val-38)*3,0,255)'[lk];"
             "[1]scale=1920:1080:flags=bicubic,format=gray,gblur=sigma=1.1[mk];[mk][lk]blend=all_mode=lighten,framerate=fps=30[al];[c]framerate=fps=30[cf];"
             "[cf][al]alphamerge,format=rgba,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]",
             "-map", "[v]", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "24", "-row-mt", "1", "-deadline", "good", "-cpu-used", "4", "-auto-alt-ref", "0", cyc])
        run(["ffmpeg", "-y", "-v", "error", "-stream_loop", "-1", "-i", cyc, "-t", f"{m['dur'] + 0.5:.3f}", "-c", "copy", "-an", f"hf/plates/{m['id']}.webm"])
        print("plate", m["id"], len(frames), "frames")
    else:
        src = os.path.join(FR, m["src"]); n = len(glob.glob(os.path.join(src, "f_0*.png")))
        if n < 90: print("skip sprite", m["id"], n); continue
        vf = f"scale={m['w']}:{m['h']}:flags=lanczos,format=rgba"
        if m["mode"] == "loop": vf += f",loop=loop={int(m['dur'] / 4) + 2}:size=96:start=0"
        else: vf += f",tpad=stop_mode=clone:stop_duration={m['dur']:.2f}"
        run(["ffmpeg", "-y", "-v", "error", "-framerate", "24", "-start_number", "1", "-i", os.path.join(src, "f_%04d.png"), "-vf", vf, "-t", f"{m['dur'] + 0.5:.3f}",
             "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "30", "-row-mt", "1", "-deadline", "good", "-cpu-used", "4", "-auto-alt-ref", "0", "-an", f"hf/sprites/{m['id']}.webm"])
        print("sprite", m["id"])
