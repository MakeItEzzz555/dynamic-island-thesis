# Island Studio — macOS Engineering Workspace

A responsive, Apple-inspired static dashboard for tracking development of a macOS Dynamic Island-style app and documenting thesis progress.

## Run locally

Open `index.html` in your browser. No dependencies, build tool, backend, package install, or paid hosting required.

## Deploy to GitHub Pages

1. Create a **public repository** (for instance `island-studio`) or add these files to an existing public repository in a subdirectory you can publish.
2. Commit `index.html` and `.nojekyll` at the repository root.
3. Under **Settings → Pages → Build and deployment**, select **Deploy from a branch**, `main`, `/ (root)`, then Save.
4. Visit `https://YOUR_GITHUB_USERNAME.github.io/island-studio/` when GitHub Pages publishes it.

No custom domain is required. Follow [GitHub Pages documentation](https://docs.github.com/en/pages) for current publishing requirements and availability for your plan/repository visibility.

## Persistence and collaboration

The site uses browser **localStorage**. Edits (status, issue text, checklists, small screenshots) stay in the browser and are **not synchronized** with GitHub or other visitors. Use **Export JSON** to back up and share editable records; import through **Release Readiness → Import JSON**. Keep a project snapshot in the repository when desired, but the site does not currently load that snapshot automatically. This starter is best treated as a working prototype, not a multiuser issue tracker. Do not put confidential information in a public repo.

For real shared collaboration, make GitHub Issues/Projects the canonical backend and add GitHub Actions to produce a sanitized public JSON snapshot during deploy. Never put a personal access token in client JavaScript.

## Existing issue scope

Seeded reports: File Tray horizontal layout, MCP Connections scroll height, Notifications/Focus privacy and permissions. Other modules (Agents Chat, Teleprompter, Window Snap, Keep Awake and Shortcuts) are planning entries, not verified defects or claims of implementation status. All statuses are illustrative until checked against the source repository.

## Accessibility and design

System-first font stack, keyboard-visible focus, responsive sidebar, semantic table, labeled fields, reduced-motion support, clear selected states and readable contrast. For implementation decisions reference official [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) and [Apple Developer Documentation](https://developer.apple.com/documentation/).

## Dependencies

None. Site is fully static and does not consume Vercel, Work or cloud build model credits when viewed on GitHub Pages.
