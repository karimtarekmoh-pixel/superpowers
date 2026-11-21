#!/usr/bin/env python3
"""check_setup.py: one line per thing this skill needs, marked OK or MISSING, then ALL GOOD or what to fix."""
import os, shutil, subprocess, sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
RUNS = Path.home() / "stickman-runs"
missing = []


def ok(name):
    print(f"OK       {name}")


def miss(name, fix):
    print(f"MISSING  {name}  ({fix})")
    missing.append(name)


for tool, fix in [("ffmpeg", "install ffmpeg"), ("ffprobe", "comes with ffmpeg"), ("node", "install node"),
                  ("npm", "comes with node")]:
    ok(tool) if shutil.which(tool) else miss(tool, fix)
try:
    import faster_whisper  # noqa: F401
    ok("faster-whisper")
except Exception:
    miss("faster-whisper", "pip install faster-whisper, then download a model folder (see SKILL.md)")
chrome_paths = [os.environ.get("CHROME", ""), "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome", shutil.which("google-chrome") or "", shutil.which("chromium") or ""]
if any(p and Path(p).is_file() for p in chrome_paths):
    ok("Chrome or Chromium")
else:
    miss("Chrome or Chromium", "set CHROME to its path; it draws the animation frames")

claude = shutil.which("claude") or next((str(p) for p in (Path.home() / ".local/bin/claude",
                                                           Path("/usr/local/bin/claude"),
                                                           Path("/opt/homebrew/bin/claude")) if p.is_file()), None)
if claude:
    try:
        status = subprocess.run([claude, "auth", "status"], capture_output=True, text=True, timeout=30).stdout
    except Exception:
        status = ""
    if '"loggedIn": true' in status:
        ok("claude command, signed in")
    else:
        miss("claude sign-in", "open a terminal and run: claude auth login")
else:
    miss("claude command", "curl -fsSL https://claude.ai/install.sh | bash")

try:
    RUNS.mkdir(parents=True, exist_ok=True)
    ok(f"runs folder {RUNS}")
except Exception as e:
    miss("runs folder", f"could not make {RUNS}: {e}")

for f in ["style/BRAND.md", "style/sheets", "style/frames", "style/approved-look",
          "scripts/make_run.py"]:
    if not (SKILL / f).exists():
        miss(f"skill file {f}", "the skill folder is incomplete; ask for a fresh copy")

free_gb = shutil.disk_usage(Path.home()).free / 1e9
ok(f"disk: {free_gb:.0f} GB free") if free_gb >= 4 else miss("disk space", f"only {free_gb:.0f} GB free; need about 4 GB for frames and renders")
print("ALL GOOD" if not missing else f"{len(missing)} thing(s) to fix: " + ", ".join(missing))
