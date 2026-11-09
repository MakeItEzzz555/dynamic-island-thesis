# Island Studio — DynamicIsland thesis site

Public GitHub Pages site documenting how a private native macOS application, DynamicIsland, evolved from its first commit on **2 July 2026** to today, written for a university supervisor who is not a Swift specialist.

Live site: https://makeitezzz555.github.io/dynamic-island-thesis/

## What the site contains

| Section | Route | Source |
|---|---|---|
| Overview | `#/` | `data/thesis.json`, `data/progress.json` |
| Journey (five phases + searchable explorer) | `#/journey`, `#/journey/<phase>` | `data/thesis.json` phases, `data/milestones.json` |
| Features & architecture | `#/features` | `data/thesis.json`, `assets/screenshots/` |
| Engineering challenges | `#/challenges`, `#/challenges/<id>` | `data/thesis.json` |
| Research & decisions | `#/decisions` | `data/thesis.json` |
| Roadmap | `#/roadmap` | `data/thesis.json`, review placeholders in `data/milestones.json` |
| Testing & quality | `#/quality` | `data/thesis.json` |
| Supervisor review | `#/review` | GitHub Issues labelled `feedback` |

The former browser-local tracker is preserved unchanged at `workspace.html` (not linked from the main navigation; drafts saved in a browser stay readable there).

Architecture, data contracts, feedback flow and maintenance: **[Site architecture](docs/SITE_ARCHITECTURE.md)**. Visual system: **[DESIGN.md](DESIGN.md)**.

## Supervisor feedback

Feedback is a GitHub issue on this public repository, created from the form in `.github/ISSUE_TEMPLATE/feedback.yml`. The site links to it with the subject prefilled and reads status from GitHub's public API (no token in the page):

- open, no status label → **Pending**
- label `status: acknowledged` → **Acknowledged**
- label `status: addressed` → **Addressed**
- closed as completed → **Resolved** (closed as not planned → **Closed**)

A supervisor needs a free GitHub account, and feedback is public.

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
- The owner workspace (`workspace.html`) stores drafts in one browser only; shared feedback goes through GitHub Issues.
- The separate private GitHub Actions history workflow has been **disabled** to conserve the account's GitHub Actions quota. The local launchd scheduler is the active automation.
- `scripts/validate_public.py` checks JSON shape and links, but cannot prove that an authored narrative is confidentially safe. Public descriptions still require judgment.

This static site has no client-side GitHub access token or private repository credentials.
