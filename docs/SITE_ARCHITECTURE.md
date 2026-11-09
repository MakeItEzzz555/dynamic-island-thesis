# Site architecture

Static site for GitHub Pages: no build step, no framework, no dependencies. Everything is served as written.

```
index.html              page shell: masthead, nav, sidebar, icon sprite, footer
assets/site.css         design tokens and components (light, dark, Reduce Motion, Increase Contrast)
assets/app.js           hash router, views, sidebar controller, feedback client
assets/screenshots/     owner-approved app captures (WebP)
data/thesis.json        curated narrative (hand-edited)
data/progress.json      aggregate counters (written by scripts/sync_local.py)
data/milestones.json    milestone record (curated + placeholders appended by sync)
workspace.html          the former browser-local tracker, kept unchanged for the owner
.github/ISSUE_TEMPLATE/ supervisor feedback form
```

**Why no framework:** the content is a few hundred kilobytes of JSON and text, there is no build server, and GitHub Actions minutes are constrained. A framework would add a build pipeline and dependencies without making the pages better. Views are template functions in `app.js`; all dynamic text passes through `esc()`.

## Routing

Hash routes keep every page deep-linkable on GitHub Pages without server rewrites: `#/`, `#/journey`, `#/journey/<phaseId>`, `#/features`, `#/challenges`, `#/challenges/<id>`, `#/decisions`, `#/roadmap`, `#/quality`, `#/review`, `#/review/<subject>`. On each route change the page title updates and focus moves to the page heading so screen readers announce the new page.

## Data contracts

- `progress.json` and `milestones.json` keep `schemaVersion: 1` and are owned by `scripts/sync_local.py`. The site only reads them. Planned milestones appear under Roadmap and are excluded from the Journey.
- `thesis.json` (`schemaVersion: 1`) is never written by automation. A milestone belongs to the phase whose `from`/`to` window contains its date; the latest phase has `to: null`, so placeholders added by the daily sync land in it automatically. Phase date labels are computed from the milestones actually in the phase.
- Status keys used anywhere in `thesis.json` must exist in its `statuses` map. `python3 scripts/validate_public.py` checks this, plus phase order, challenge fields, screenshot files and forbidden keys. `sync_local.py` runs it before every publish.

## Supervisor feedback

1. The site builds `https://github.com/MakeItEzzz555/dynamic-island-thesis/issues/new?template=feedback.yml&title=…&subject=<key>`. Subject keys: `general`, `phase:<id>`, `challenge:<id>`, `decision:<id>`, `milestone:<id>`, `feature:<group>`.
2. The issue form applies the `feedback` label; the subject is stored in the issue body under "Subject".
3. The site reads `GET /repos/MakeItEzzz555/dynamic-island-thesis/issues?labels=feedback&state=all` without a token (60 requests per hour per visitor IP), caches the result for five minutes in `sessionStorage`, and shows loading, empty and error states.
4. Status comes from labels and state (see README). To move a thread forward, add `status: acknowledged` or `status: addressed`, or close it.

Security: no credentials in the page; issue titles and bodies are rendered as escaped text only; abuse control, spam handling and account requirements are GitHub's. Retention: the owner can delete issues; lock or limit interactions in the repository settings if needed.

## Screenshots

Captured with the app's built-in acceptance modes (`--validate-features`, `--validate-settings`, `--validate-parity`), which render the app's own windows with sample content. They do not record the desktop. Every image was reviewed for personal data before inclusion (terminal captures showing the user's temp path and the clipboard pane listing installed apps were excluded), then converted with `cwebp -q 86`. To add one: put `<name>.webp` in `assets/screenshots/`, add a caption under `screenshots.items` in `thesis.json`, reference it from a feature's `shots`, and run the validator.

## Updating content

- New merged PR: the daily job adds a "Write-up pending" placeholder. Replace its title and summary in `milestones.json` and set `kind`/`status` by hand when the summary is approved.
- New challenge or decision: add it to `thesis.json` and run `python3 scripts/validate_public.py`.
- After changing `assets/site.css` or `assets/app.js`, bump the `?v=` suffix on both links in `index.html` so returning visitors do not get cached files.
- Before publishing: preview locally with `python3 -m http.server` from the parent folder and open `/dynamic-island-thesis/`, which matches the Pages path.

## Verification performed (9 Nov 2026)

WebKit via `playwright-cli`, served under `/dynamic-island-thesis/`: every route at 1440×900 and 390×844, light and dark, no console errors, no horizontal overflow; nav docking; sidebar hover with an intent delay, click, keyboard open, Escape and focus return; phone sheet with inert background; Reduce Motion removes the morph transforms; focusable order checked at the top of the page and in the docked state. Not tested: Chromium and Firefox engines, VoiceOver, physical touch devices, and a production Lighthouse run.
