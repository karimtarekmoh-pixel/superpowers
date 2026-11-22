#!/usr/bin/env python3
"""watch_run.py <run folder> [report_every_s=900] [stall_s=1200]      (use it as a Monitor command)
watch_run.py --stop <run folder>                                      (stops a run)

Prints one line per event worth acting on:
  progress ...   every report_every_s seconds: minutes, steps so far, the latest step
  STALLED ...    run.log has not grown for stall_s seconds (stop it and start the part again)
  OVERAGE ...    the run started using paid extra usage (stop it and ask the channel owner)
  LIMIT ...      the plan's usage limit was hit or a request was rejected
  RESULT ...     the run's final result line
  ENDED ...      the run is over (then run finish_part.py)
Single failed tool calls inside the run are normal and are not reported.
"""
import json, os, signal, sys, time


def run_pid(run):
    try:
        pid = int(open(os.path.join(run, ".pid")).read().strip())
        os.kill(pid, 0)
        return pid
    except Exception:
        return None


def main():
    if sys.argv[1] == "--stop":
        pid = run_pid(os.path.realpath(sys.argv[2]))
        if pid:
            os.killpg(pid, signal.SIGTERM)
            print(f"stopped run process {pid}")
        else:
            print("that run is not running")
        return
    run = os.path.realpath(sys.argv[1])
    every = int(sys.argv[2]) if len(sys.argv) > 2 else 900
    stall = int(sys.argv[3]) if len(sys.argv) > 3 else 1200
    log = os.path.join(run, "run.log")
    start = last_report = last_growth = time.time()
    last_size, pos, steps, latest, said, missing = -1, 0, 0, "", set(), 0
    while True:
        size = os.path.getsize(log) if os.path.exists(log) else 0
        if size != last_size:
            last_size, last_growth = size, time.time()
        chunk = ""
        if os.path.exists(log):
            with open(log, errors="ignore") as f:
                f.seek(pos)
                chunk = f.read()
                pos = f.tell()
        for line in chunk.splitlines():
            try:
                d = json.loads(line)
            except Exception:
                if "usage limit" in line.lower() and "LIMIT" not in said:
                    said.add("LIMIT"); print(f"LIMIT: {line[:250]}", flush=True)
                continue
            kind = d.get("type")
            if kind == "rate_limit_event":
                info = d.get("rate_limit_info", {})
                if info.get("isUsingOverage") and "OVERAGE" not in said:
                    said.add("OVERAGE"); print("OVERAGE: the run is now using paid extra usage", flush=True)
                if info.get("status") not in (None, "allowed", "allowed_warning") and "LIMIT" not in said:
                    said.add("LIMIT"); print(f"LIMIT: status {info.get('status')}, resets at epoch {info.get('resetsAt')}", flush=True)
            elif kind == "assistant":
                for c in d.get("message", {}).get("content", []):
                    if c.get("type") == "tool_use":
                        steps += 1
                        i = c.get("input", {})
                        latest = f'{c["name"]}: {str(i.get("description") or i.get("file_path") or i.get("command") or "")[:110]}'
                    elif c.get("type") == "text":
                        latest = "says: " + c["text"][:110].replace("\n", " ")
            elif kind == "result":
                res = str(d.get("result", ""))[:200].replace("\n", " ")
                print(f'RESULT: {d.get("subtype")} error={d.get("is_error")} turns={d.get("num_turns")} {res}', flush=True)
                if "limit" in res.lower() and d.get("is_error") and "LIMIT" not in said:
                    said.add("LIMIT"); print("LIMIT: the run ended on a usage limit", flush=True)
        now = time.time()
        missing = missing + 1 if run_pid(run) is None else 0
        if missing >= 2:
            print(f"ENDED: after {int((now - start) / 60)} min watched, {steps} steps", flush=True)
            break
        if now - last_growth > stall:
            print(f"STALLED: no log growth for {int((now - last_growth) / 60)} min (latest {latest})", flush=True)
            last_growth = now
        if now - last_report >= every:
            last_report = now
            print(f"progress: {int((now - start) / 60)} min watched, {steps} steps, latest {latest}", flush=True)
        time.sleep(30)


if __name__ == "__main__":
    main()
