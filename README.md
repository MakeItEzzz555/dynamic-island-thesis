# Island Studio — DynamicIsland thesis dashboard

Public GitHub Pages site for documenting the evolution of a private native macOS Dynamic Island-style application, from the initial **July 2, 2026** commit through current development.

Live site: https://makeitezzz555.github.io/dynamic-island-thesis/

## Current features

- Searchable, dated engineering timeline in **Milestones**, with curated historical events and a future acceptance roadmap.
- Source-backed public aggregates in **Overview** and **Milestones**: reachable commits, PRs created, PRs merged, issues, and monthly activity. Numbers are evidence of recorded work, not claims of production acceptance.
- Existing eight module/issue cards remain browser-local **editable planning drafts**; they are independent from actual app development status.
- Public `data/milestones.json` and `data/progress.json` are static, readable JSON, consumed automatically by the site.
- No proprietary Swift code or raw private history is copied to this repository.

## Local-first automatic synchronization

A per-user macOS **launchd** job runs at **07:15 local time daily** on the registered Mac and invokes `scripts/sync_local.py`.

The script safely fetches private remote-tracking refs, collects raw private history into the Git-ignored `.private/history-inventory.json`, derives public-only activity counters and publishes changes with selective Git commits/pushes when appropriate.

For newly merged private PRs, it publishes only a **content-free Review placeholder** with the PR number and date. It never publishes private PR titles/bodies automatically. Detailed descriptions must be curated.

```bash
python3 scripts/sync_local.py --collect-only  # only private inventory
python3 scripts/sync_local.py --no-push       # prepare public JSON locally
python3 scripts/sync_local.py                 # safely publish changed public JSON
python3 scripts/validate_public.py
```

The scheduler is installed by `python3 scripts/install_launchd.py`. It does not require Desktop Commander to be connected and consumes **zero GitHub Actions runner minutes for collection**. GitHub Pages deployments remain governed by GitHub's hosting service.

Full setup, schedule, safety boundaries, troubleshooting and recovery: **[Local synchronization guide](docs/LOCAL_SYNC.md)**.

## Historical milestones and roadmap

The initial manually curated timeline was constructed from private Git commits and merge-confirmed PR metadata, using intentionally high-level public summaries. The one-time curation builder is `scripts/build_curated_milestones.py`.

**Do not schedule the curation builder**: it rewrites the seed snapshot and may replace subsequently reviewed milestone entries. The ongoing scheduler adds only privacy-safe placeholders for new merges.

PR numbers can have gaps, and a closed PR is not necessarily merged. A merge is not evidence that installed-app, hardware, permission or distribution acceptance has been completed.

## Privacy and collaboration

- The macOS application source repository remains private: `MakeItEzzz555/DynamicIsland`.
- The GitHub Pages source repository is public: `MakeItEzzz555/dynamic-island-thesis`.
- Raw history, private branch names, internal code and tokens must never be committed to the public repository. Local inventory lives under `.private/`, excluded by `.gitignore`.
- Browser-local issue edits and screenshots do not automatically synchronize across devices. For shared changes use explicit export/import or a future authenticated backend.
- The separate private GitHub Actions history workflow has been **disabled** to conserve the account's GitHub Actions quota. The local launchd scheduler is the active automation.
- `scripts/validate_public.py` checks JSON shape and links, but cannot prove that an authored narrative is confidentially safe. Public descriptions still require judgment.

This static site has no client-side GitHub access token or private repository credentials.
