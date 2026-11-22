#!/usr/bin/env python3
"""run_sealed.py <run folder>

Starts one clean animation run: the newest Opus model at extra high thinking, given ONLY the run folder's
PROMPT.md. None of your own Claude settings, notes, memory, skills or connected apps load, your private
folders are blocked, the internet is on, and it stops after 5 hours at most.

It writes everything the run says to <run>/run.log and the run's process id to <run>/.pid, and returns
when the run ends. Start it in the background (Bash run_in_background) and watch it with watch_run.py.
"""
import json, os, shutil, signal, subprocess, sys
from pathlib import Path

RUNS = Path.home() / "stickman-runs"
LIMIT_SECONDS = 5 * 3600
TOOLS = "Bash,Read,Write,Edit,Glob,Grep,WebFetch,WebSearch,Task,TodoWrite"


def write_lock(path):
    """Block list: no notes or memory from the home folder, no reading or writing private folders."""
    h = str(Path.home())
    private = ["Documents", "Desktop", "Downloads", "Pictures", "Movies", "Music", ".claude", ".ssh", ".aws",
               ".config", "Library/Keychains", "Library/Mail", "Library/Messages", ".claude.json", ".zshrc",
               ".zprofile", ".bashrc", ".bash_profile", ".gitconfig", ".netrc"]
    deny = []
    for p in private:
        for tool in ("Read", "Edit", "Write"):
            deny += [f"{tool}(/{h}/{p}/**)", f"{tool}(/{h}/{p})"]
    for w in ["Documents", "Desktop", "Downloads", ".claude", ".ssh", ".aws", ".zshrc", ".zprofile", "Keychains",
              "security ", "ssh ", "scp ", "sudo ", "osascript", "launchctl", "crontab", "git push"]:
        deny.append(f"Bash(*{w}*)")
    json.dump({"claudeMdExcludes": [f"{h}/**"], "autoMemoryEnabled": False, "permissions": {"deny": deny}},
              open(path, "w"), indent=1)


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: run_sealed.py <run folder>")
    run = Path(sys.argv[1]).expanduser().resolve()
    if run.parent != RUNS.resolve() or not run.is_dir():
        sys.exit(f"refused: the run folder must sit directly inside {RUNS} (make it with make_run.py)")
    if not (run / "PROMPT.md").is_file():
        sys.exit("refused: no PROMPT.md in the run folder")
    for c in (run / ".claude", run / "CLAUDE.md", RUNS / ".claude", RUNS / "CLAUDE.md"):
        if c.exists():
            sys.exit(f"refused: {c} exists (a clean run never loads outside settings or notes)")
    claude = shutil.which("claude")
    for guess in (Path.home() / ".local/bin/claude", Path("/usr/local/bin/claude"), Path("/opt/homebrew/bin/claude")):
        if not claude and guess.is_file():
            claude = str(guess)
    if not claude:
        sys.exit("refused: the claude command is not installed (see First-time setup in SKILL.md)")
    lock = RUNS / "lock-settings.json"
    write_lock(lock)
    cmd = [claude, "-p", (run / "PROMPT.md").read_text(), "--model", "opus", "--effort", "xhigh",
           "--setting-sources", "project", "--settings", str(lock),
           "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}', "--disable-slash-commands",
           "--tools", TOOLS, "--permission-mode", "bypassPermissions", "--output-format", "stream-json", "--verbose"]
    with open(run / "run.log", "w") as log:
        p = subprocess.Popen(cmd, cwd=run, stdout=log, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
                             start_new_session=True)
        (run / ".pid").write_text(str(p.pid))
        try:
            code = p.wait(timeout=LIMIT_SECONDS)
        except subprocess.TimeoutExpired:
            os.killpg(p.pid, signal.SIGTERM)
            code = p.wait()
            print("stopped: the run hit the 5-hour limit")
    (run / ".pid").unlink(missing_ok=True)
    print(f"run ended (exit code {code}): {run}")


if __name__ == "__main__":
    main()
