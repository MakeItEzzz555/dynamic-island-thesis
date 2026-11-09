# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Primary: the owner's university supervisor.** Unfamiliar with Swift, AppKit or the codebase. Reviews a computer-science thesis project in short sessions, on a laptop or phone, and needs to understand what was built, how hard it was, what remains, and what the student needs from them, ideally within the first minute.
- **Secondary: the owner (thesis author).** Uses the site to present progress and to collect and track supervisor feedback.
- **Possible: academic evaluators** reading the finished thesis portfolio.

## Product Purpose
A public thesis portfolio that tells how a private native macOS application, DynamicIsland (a Dynamic Island-style overlay around the MacBook notch, SwiftUI hosted in AppKit), evolved from its first commit on 2 July 2026 to its current state, and that lets the supervisor review progress and leave feedback that persists and has a visible status. Success: a first-time supervisor can explain the project, its hardest engineering problems and its open work after one visit, and leaves actionable feedback.

## Positioning
The record is evidence-bound: every count comes from the private repository's own history, merged work is never presented as accepted or released, and the private source never leaves the private repository. A neighbouring project portfolio cannot truthfully copy the long, documented engineering journey (1,000+ reachable commits, ~80 PRs) or its explicit separation of "merged" from "verified on hardware".

## Operating Context
- Static GitHub Pages site (`MakeItEzzz555/dynamic-island-thesis`), no build server. URL must stay `https://makeitezzz555.github.io/dynamic-island-thesis/`.
- A local macOS launchd job (`scripts/sync_local.py`) rewrites `data/progress.json` and appends privacy-safe PR placeholders to `data/milestones.json` daily. Those schemas must remain readable by the site.
- GitHub Actions minutes are exhausted: no scheduled Actions, hosted CI or paid compute.
- Supervisor feedback goes through GitHub Issues on the public repository (owner decision 2026-11-09); a free GitHub account is required and feedback is public.

## Capabilities and Constraints
- Never publish private source, raw commit messages, PR bodies, branch names, tokens, agent transcripts or unapproved screenshots.
- App screenshots appear only after the owner approves each one.
- Statuses must not be invented: merged ≠ physically verified ≠ released.
- The former browser-local issue tracker is kept, unlinked, at `workspace.html` for the owner's drafts.

## Brand Commitments
- Name: "Island Studio" for the thesis site; the app is "DynamicIsland".
- Apple-native quality bar (HIG-informed, original visual language, no Apple assets).

## Evidence on Hand
Public JSON (progress counters, 81+ curated milestones), the private repository's docs, validation records and PR history (read-only), and owner-approved screenshots once approved.
