#!/usr/bin/env python3
"""Install the per-user local-first thesis collector launchd job.

No sudo, no sleep-prevention loop, no GitHub Actions. Runs while the owner
is logged in and macOS can execute user LaunchAgents.
"""
import os
import pathlib
import plistlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
LABEL = "app.islandstudio.thesis-sync"
PLIST = pathlib.Path.home() / "Library" / "LaunchAgents" / (LABEL + ".plist")
LOG = ROOT / ".private" / "logs"

def run(*args, check=True):
    return subprocess.run(args, capture_output=True, text=True, check=check)

def main():
    LOG.mkdir(parents=True, exist_ok=True)
    PLIST.parent.mkdir(parents=True, exist_ok=True)
    py = sys.executable
    data = {
        "Label": LABEL,
        "ProgramArguments": [py, str(ROOT / "scripts" / "sync_local.py")],
        "WorkingDirectory": str(ROOT),
        "RunAtLoad": False,
        "StartCalendarInterval": {"Hour": 7, "Minute": 15},
        "StandardOutPath": str(LOG / "launchd.out.log"),
        "StandardErrorPath": str(LOG / "launchd.err.log"),
        "EnvironmentVariables": {
            "PATH": str(pathlib.Path.home()/".local"/"bin")+":/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin",
            "HOME": str(pathlib.Path.home()),
            "GIT_TERMINAL_PROMPT": "0"
        },
        "ProcessType": "Background",
    }
    # Replacing only our own dedicated LaunchAgent. Never modify another job.
    domain = f"gui/{os.getuid()}"
    run("launchctl","bootout",domain+"/"+LABEL,check=False)
    PLIST.write_bytes(plistlib.dumps(data))
    os.chmod(PLIST,0o600)
    run("plutil","-lint",str(PLIST))
    result=run("launchctl","bootstrap",domain,str(PLIST),check=False)
    if result.returncode:
        raise SystemExit("launchctl bootstrap failed: "+result.stderr.strip())
    check=run("launchctl","print",domain+"/"+LABEL)
    print("Installed:",PLIST)
    print("Schedule: daily at 07:15 local time, if macOS permits the user agent to run")
    print("Executable:",py)
    print("Verified launchctl registration:",LABEL in check.stdout)
    print("Logs:",LOG)
    print("Uninstall: launchctl bootout "+domain+"/"+LABEL+"; remove "+str(PLIST))
if __name__=="__main__":
    main()
