# Island Studio v2 — Thesis engineering dashboard

Static GitHub Pages website with an **approved public milestone timeline**, plus a private history inventory workflow. No backend and no paid hosting needed.

## Publish the dashboard

Copy these files into the **public** `MakeItEzzz555/dynamic-island-thesis` repository, commit to `main`. Its existing GitHub Pages branch deployment updates automatically on each push. The Milestones tab reads `data/milestones.json` (public, read-only). The existing issue tracker still saves browser edits in localStorage; GitHub does not automatically sync them.

## Collect history from your Mac (private, complete local refs)

The source is the **private** `MakeItEzzz555/DynamicIsland` repository, not the public site. From the website repo directory:

```bash
python3 scripts/collect_history.py --repo-dir ../DynamicIsland
```

The collector reads `git log --all` across local refs (branches and tags), including the full commit body. If `GH_TOKEN` is set, it also paginates GitHub pull requests and issues. The result is `.private/history-inventory.json` (gitignored, mode 600). **Never copy or commit this private inventory into the public site.** Running `git fetch --all --tags --prune` in your private repository before collecting makes its remote refs current, but does not recover deleted or unreachable history. Uncommitted changes and private documentation outside Git must be inventoried separately.

For GitHub API access without putting a token into the website, install `gh` and run `gh auth login`, then:

```bash
export GH_TOKEN="$(gh auth token)"
python3 scripts/collect_history.py --repo-dir ../DynamicIsland
unset GH_TOKEN
```

`gh` must have read access to the private repo. Do not print or commit tokens.

## Set up private scheduled inventories (optional)

Copy `scripts/collect_history.py` into **the private repo** at the same path, and copy `templates/private-repo-history.yml` into that repo as `.github/workflows/history-inventory.yml`. It runs on demand and daily, reads private history using the private repository's scoped `GITHUB_TOKEN`, and uploads a **private workflow artifact** retained 14 days. Never place its output into the public website. Actions may be delayed or blocked by billing/usage limits. GitHub-hosted Actions checkouts include reachable repo history with `fetch-depth: 0`; only your Mac can add unpushed local refs.

## Approve and publish milestones

1. Review `.private/history-inventory.json`, plus local documentation, screenshots, and branch history.
2. Create one factual, concise entry per approved milestone in `data/milestones.json`, using the schema in `data/milestones.example.json`. Set status based on actual evidence, not titles alone. Record commit/PR URLs, caveats and acceptance gates. **A PR created is not necessarily merged.**
3. Remove confidential discussions, internal implementation details, secrets, private file links not intended for viewers, identifying data and unreleased screenshots. Even titles, SHAs and PR numbers can disclose information; publication is intentional.
4. Run `python3 scripts/validate_public.py`; commit only the approved JSON. Your GitHub Pages deployment updates after that commit. The site then shows the timeline in a searchable and filterable Milestones tab.

The public repository CI workflow validates schema, not confidentiality. An explicit human approval gate is intentional. Automating private-to-public publication without reviewing the data is **not recommended**.

## Scope and limitations

- The site cannot independently read your private repo from a visitor's browser.
- The daily job is an inventory/monitoring workflow, **not** an autonomous AI interpretation engine. It does not consume ChatGPT Work usage.
- This version does not sync browser-local issue edits or screenshots across browsers. For shared editing, GitHub Issues/Projects (with owner authentication) or another backend is needed.
- Milestone and issue statuses are independent; fixture tests, CI tests, packaged builds and physical installed-app acceptance are distinct.
- Keep the public dashboard repo separate from the private macOS application repo.
