# Island Studio — local-first synchronization

## Verified architecture

- Private app: `MakeItEzzz555/DynamicIsland`. Public dashboard: `MakeItEzzz555/dynamic-island-thesis`.
- `scripts/sync_local.py` fetches Git remote-tracking references from the private app without pulling into or changing the working branch. It collects reachable history plus GitHub PR and issue metadata.
- Raw history is kept **only** in `.private/history-inventory.json` (0600, Git-ignored).
- Public `data/progress.json` contains aggregate counters and monthly commit totals, never commit subjects, private source paths or PR descriptions.
- Newly merged PRs without curated entries get content-free `Review` placeholders: PR number, merge date and a message indicating that detailed review is pending. It never automatically copies PR titles or bodies.
- `data/milestones.json` contains carefully written engineering summaries grounded in historical commits and merged PR events, plus clearly marked roadmap plans.
- The script validates public data and selectively commits/pushes only changed public JSON files. If files were manually edited or the remote branch advanced unexpectedly, publication is withheld for safety.

## Automatic schedule

A **per-user** macOS LaunchAgent is installed at `~/Library/LaunchAgents/app.islandstudio.thesis-sync.plist`.

- Label: `app.islandstudio.thesis-sync`
- Schedule: **07:15 local Mac time daily**; requires the Mac to be available and the user LaunchAgent to run.
- Local logs: `.private/logs/launchd.out.log` and `.private/logs/launchd.err.log`
- No GitHub Actions runner minutes are consumed for collection.
- Inspect status: `launchctl print gui/$(id -u)/app.islandstudio.thesis-sync`
- Manually run: `launchctl kickstart -k gui/$(id -u)/app.islandstudio.thesis-sync`
- Reinstall: `python3 scripts/install_launchd.py`
- Pause: `launchctl bootout gui/$(id -u)/app.islandstudio.thesis-sync`; to keep it off across logins also remove the dedicated plist.

From `~/Documents/Projects/island-studio-site`:

```bash
python3 scripts/sync_local.py --collect-only  # private inventory only
python3 scripts/sync_local.py --no-push       # local JSON only
python3 scripts/sync_local.py                 # collect and safely publish changed data
python3 scripts/validate_public.py
```

`scripts/build_curated_milestones.py` is a **manual history reconstruction tool**; it is not scheduled, because rerunning it could replace later reviewed timeline edits.

## Limits and source of truth

- `git log --all` includes reachable commits, not unreachable or deleted history, uncommitted files, or hidden development on other machines.
- Pull request totals are PR objects, not PR number, and "merged" does not imply shipped or physically verified.
- GitHub PR merge timestamps and Git commit dates ground the historical dates. The July starting point is July 2, 2026.
- The owner workspace (`workspace.html`, the former main page) keeps its browser-local draft cards; they are **not** canonical verified app status.
- Scheduled updates cannot use AI to reconstruct meaningful resolution narratives: newly merged PRs remain labeled `Review` until their technical details are curated.

## Security and recovery

- Never publish `.private/`, GitHub tokens, raw PR/issue descriptions, private code, local screenshots or unapproved internal documents.
- The private repository GitHub Actions inventory workflow is intentionally disabled due to usage limits. This local job is independent of it.
- `validate_public.py` validates structure and evidence links, **not** confidentiality or factual correctness of authored text.
- GitHub CLI authentication uses the existing Mac login and is never embedded in the LaunchAgent plist.
- No force-pushes or automated merges. A failed push leaves a local commit for inspection.
- GitHub Pages publication is asynchronous: check the public `data/progress.json` endpoint before assuming a new site version has deployed.
