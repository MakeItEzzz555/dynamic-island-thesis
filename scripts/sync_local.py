#!/usr/bin/env python3
"""Local, privacy-first thesis progress sync.

Daily: regenerate a PRIVATE inventory, derive public aggregate counters only,
commit/push only data/progress.json when clean and safely fast-forwardable.
Never pushes raw history, PR titles, branch names, or source to the public repo.
"""
from __future__ import annotations
import collections
import datetime as dt
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / "DynamicIsland"
PRIVATE = ROOT / ".private"
PROGRESS = ROOT / "data" / "progress.json"
LOG_DIR = PRIVATE / "logs"

def run(args, cwd=ROOT, env=None, check=True):
    return subprocess.run(args, cwd=cwd, env=env, text=True, capture_output=True, check=check)

def out(args, cwd=ROOT):
    return run(args, cwd).stdout.strip()

def log(message):
    print(f"[{dt.datetime.now(dt.timezone.utc).isoformat()}] {message}", flush=True)

def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-push", action="store_true", help="Collect locally and write public counters but do not push")
    ap.add_argument("--collect-only", action="store_true", help="Collect inventory only; do not change public files")
    args = ap.parse_args()
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    if not (ROOT / ".git").exists() or not (SOURCE / ".git").exists():
        raise SystemExit("Missing expected website or DynamicIsland Git repository")
    if out(["git","check-ignore",".private/history-inventory.json"]) != ".private/history-inventory.json":
        raise SystemExit("PRIVATE INVENTORY IS NOT GIT-IGNORED; refusing to continue")
    if out(["git","ls-files","--",".private/history-inventory.json"]):
        raise SystemExit("Private inventory is Git-tracked; refusing to continue")
    # Do not fetch/update source branches: protects active macOS development and worktrees.
    env = os.environ.copy()
    if not (env.get("GH_TOKEN") or env.get("GITHUB_TOKEN")) and shutil.which("gh"):
        auth = run(["gh","auth","token"], check=False)
        if auth.returncode == 0:
            env["GH_TOKEN"] = auth.stdout.strip()
    try:
        call = run([sys.executable, str(ROOT/"scripts/collect_history.py"),
                    "--repo-dir", str(SOURCE), "--output", str(PRIVATE/"history-inventory.json")],
                   env=env)
        log(call.stdout.strip().splitlines()[0])
    finally:
        env.pop("GH_TOKEN",None)
        env.pop("GITHUB_TOKEN",None)
    if args.collect_only:
        return
    inv = json.loads((PRIVATE/"history-inventory.json").read_text())
    if inv.get("github") is None:
        raise SystemExit("Private inventory lacks GitHub PR/issue data; refusing to publish incomplete counters")
    commits = inv["local"]["commits"]
    prs = inv["github"]["pullRequests"]
    issues = inv["github"]["issues"]
    months = collections.Counter(c["authored"][:7] for c in commits)
    dates = sorted(c["authored"][:10] for c in commits)
    # Publish counts only, no source text or private URLs/identifiers.
    public = {
        "schemaVersion": 1,
        "firstCommit": dates[0] if dates else None,
        "lastCommit": dates[-1] if dates else None,
        "reachableCommits": len(commits),
        "pullRequests": len(prs),
        "mergedPullRequests": sum(bool(p["mergedAt"]) for p in prs),
        "issues": len(issues),
        "commitsByMonth": [{"month":k,"commits":months[k]} for k in sorted(months)],
        "scope": "Reachable local Git refs and GitHub PR/issue metadata; not all work or tests.",
        "verification": "Counts are evidence of recorded activity, not proof of feature or release acceptance."
    }
    # Idempotent: no timestamps to create spurious commits each day.
    new = json.dumps(public, indent=2, ensure_ascii=False)+"\n"
    old = PROGRESS.read_text() if PROGRESS.exists() else ""
    if old == new:
        log("Progress unchanged; no public update needed")
        return
    # Refuse to overwrite manual edits or synchronize on anything but main.
    if out(["git","branch","--show-current"]) != "main":
        raise SystemExit("Website not on main; public update withheld")
    if run(["git","diff","--quiet","--","data/progress.json"],check=False).returncode != 0:
        raise SystemExit("Uncommitted edits in progress.json; refusing overwrite")
    if out(["git","ls-files","--others","--exclude-standard","--","data/progress.json"]):
        raise SystemExit("Untracked progress.json already present; refusing overwrite")
    PROGRESS.write_text(new)
    log("Wrote safe aggregate progress snapshot")
    if args.no_push:
        return
    # Never stage unrelated changes. Do not use GitHub Actions minutes.
    try:
        run(["python3",str(ROOT/"scripts/validate_public.py")])
        run(["git","fetch","origin","main"])
        head=out(["git","rev-parse","HEAD"])
        remote=out(["git","rev-parse","origin/main"])
        ancestor=run(["git","merge-base","--is-ancestor",remote,head],check=False).returncode==0
        if not ancestor:
            log("Remote main moved; leave generated progress local for manual integration")
            return
        run(["git","add","--","data/progress.json"])
        run(["git","commit","-m","docs(thesis): refresh verified project activity counts","--only","data/progress.json"])
        r=run(["git","push","origin","main"],check=False)
        if r.returncode != 0:
            log("Push failed; local commit retained: "+r.stderr.strip()[:300])
            return
        log("Pushed aggregate progress to GitHub Pages source")
    except Exception as e:
        log("Public publish withheld: "+str(e))
        raise

if __name__=="__main__":
    main()
