"""Overlay the Blender clips (transparent PNG sequences) onto the Hyperframes render with ffmpeg. usage: python composite.py <base.mp4> <out.mp4>"""
import json, subprocess, sys, os
ROOT = "/home/user/superpowers/space-whatif/artemis3"; BL = f"{ROOT}/blender"
base, out = sys.argv[1], sys.argv[2]
T = json.load(open(f"{ROOT}/build/audio/overlay.json"))
FPS = 30
# name, frames dir, (w,h), centre (cx,cy), appear, end, mode
jobs = [
    ("hook_lander", "lander", (320, 320), (960, 690), T["c1"]["appear"], T["c1"]["end"], "loop"),
    ("c3_sls", "sls", (277, 480), (380, 420), T["c3"]["sls"], T["c3"]["end"], "loop"),
    ("c3_lander", "lander", (400, 400), (960, 430), T["c3"]["lander"], T["c3"]["end"], "loop"),
    ("c3_ship", "ship", (277, 480), (1540, 425), T["c3"]["ship"], T["c3"]["end"], "loop"),
    ("c5_dock_lander", "dock_lander", (482, 392), (480, 470), T["c5"]["lander"], T["c5"]["end"], "hold"),
    ("c5_dock_ship", "dock_ship", (430, 430), (1440, 460), T["c5"]["ship"], T["c5"]["end"], "hold"),
]
os.makedirs(f"{BL}/clips", exist_ok=True)
movs = {}
for name, d, *_ in jobs:
    if d in movs: continue
    mov = f"{BL}/clips/{d}.mov"
    if not os.path.exists(mov):
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "24", "-i", f"{BL}/frames2/{d}/f_%04d.png", "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", mov], check=True)
    movs[d] = mov
cmd = ["ffmpeg", "-y", "-v", "error", "-i", base]; filt = []; last = "0:v"; idx = 1
for name, d, (w, h), (cx, cy), a, e, mode in jobs:
    dur = e - a
    if mode == "loop": cmd += ["-stream_loop", "-1", "-i", movs[d]]
    else: cmd += ["-i", movs[d]]
    chain = f"[{idx}:v]fps={FPS},scale={w}:{h}:flags=lanczos,format=yuva444p10le"
    if mode == "hold": chain += f",tpad=stop_mode=clone:stop_duration={dur:.2f}"
    chain += f",trim=duration={dur:.3f},setpts=PTS-STARTPTS+{a:.3f}/TB,fade=t=in:st={a:.3f}:d=0.6:alpha=1,fade=t=out:st={e - 0.3:.3f}:d=0.3:alpha=1[o{idx}]"
    filt.append(chain)
    filt.append(f"[{last}][o{idx}]overlay=x={cx - w // 2}:y={cy - h // 2}:format=auto:eof_action=pass:enable='between(t,{a:.3f},{e:.3f})'[v{idx}]")
    last = f"v{idx}"; idx += 1
cmd += ["-filter_complex", ";".join(filt), "-map", f"[{last}]", "-an", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", out]
print(" ".join(cmd[:8]), "... jobs", len(jobs)); subprocess.run(cmd, check=True); print("ok", out)
