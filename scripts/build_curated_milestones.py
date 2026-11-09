#!/usr/bin/env python3
"""Build a public-readable milestone catalog from an explicitly curated allowlist.

Only these deliberately written high-level labels reach the public dashboard.
Raw commit subjects, private PR descriptions, usernames, and source paths do not.
Run manually after reviewing this file. Scheduled collection DOES NOT run this.
"""
import datetime as dt
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
src = json.loads((ROOT/".private/history-inventory.json").read_text())
prs = {p["number"]:p for p in src["github"]["pullRequests"]}
# Curated, publication-safe entries. Each entry is one independently reviewed
# engineering change; verified merge timestamps come from GitHub.
CURATED = """
1|Architecture|Early interface development|Iterated on the initial native notch-aware interface and core window behavior
2|Architecture|Notch shoulder composition|Developed layered blending around the collapsed island shell
3|Fix|Compact shoulder refinements|Adjusted the collapsed island contour and proportions
4|Feature|Island theme foundations|Introduced customization for the island visual appearance
5|Fix|Compact activity balance|Balanced left and right activity regions in compact mode
6|Feature|Live Activity visibility settings|Added controls governing visibility of expanded live activities
7|Fix|Media artwork transition timing|Aligned artwork changes to visual transition timing
8|Feature|Clipboard history engine|Added a native clipboard-history capability
9|Feature|Clipboard history interface|Implemented in-island clipboard history interaction
10|Fix|Clipboard keyboard and capture handling|Corrected Escape routing and long-text clipboard handling
11|Fix|Foundational reliability audit|Addressed issues identified in the initial engineering audit
12|Fix|Correctness stabilization|Completed a targeted correctness and regression repair
13|Decision|Agent activity architecture checkpoint|Established a technical checkpoint before deeper agent integration
14|Feature|Initial agent activity integration|Connected agent activity to the island experience
15|Feature|Agent activity iteration|Extended the first agent activity implementation
16|Feature|Agent activity continuation|Expanded the managed activity and chat interaction flow
17|Testing|Agent activity validation|Strengthened tests and completion evidence for agent activity
18|Architecture|Agents interface overhaul|Reorganized the presentation and interaction of the agent experience
21|Fix|Navigation geometry transition|Deferred geometry changes until page selection was committed
22|Feature|Managed agent controls|Extended agent session control capabilities
24|Feature|Agent interface continuation|Refined the agents interface after the initial overhaul
25|Feature|Agent experience stabilization|Continued integration and refinement of the agents interface
26|Feature|Two-finger navigation|Introduced gesture-only navigation and native Settings organization
27|Fix|Gesture-only layout alignment|Corrected notch-centered positioning in gesture-only mode
28|Fix|Gesture navigation settings|Improved gesture navigation preferences and handling
29|Fix|Gesture navigation consistency|Follow-up corrections for gesture configuration
30|Fix|Media and agent interaction continuity|Repaired page attachment, tab continuity and message sending priorities
32|Feature|Camera navigation gestures|Added separate hand and pointer navigation paths for the camera
33|Feature|Native widget and audio integration|Integrated native widgets, audio surfaces and notch menu behavior
34|Feature|Native experience refinement|Continued the native interface integration effort
35|Testing|CI reliability repairs|Improved post-merge validation without removing native assertions
36|Fix|Agent send-button feedback|Restored native hover feedback and removed duplicate glow effects
37|Feature|Voice recording widget|Introduced a native recorder with optional transcription
38|Fix|Camera and audio synchronization|Improved deterministic waits and pointer-driven feedback
39|Feature|Per-app audio controls|Implemented an experimental per-app volume mixing interface
40|Research|Lock Screen widget experiment|Documented and integrated an opt-in experimental lock-screen prototype
43|Research|Interaction and roadmap review|Captured an implementation review and interaction roadmap checkpoint
44|Testing|Stabilization checkpoint|Integrated final-review fixes and additional validation evidence
45|Feature|Terminal, lyrics and Mac Duo|Advanced the native terminal, synchronized lyrics and display-fold experience
46|Feature|Productivity widget expansion|Expanded widgets, connection status and related island behavior
48|Decision|Native Shortcuts rearchitecture|Documented the shift toward independently addressable native widgets
52|Research|Motion and notification research|Recorded clean-room interface observations and performance baseline work
53|Fix|Notes persistence resilience|Improved editing and save-failure behavior in Notes
54|Research|Notification and ProMotion investigation|Refined notification geometry and gathered controlled performance evidence
55|Fix|Widget feature reconciliation|Reconciled Notes, Keep Awake, Notifications and connectivity behavior
57|Fix|Media refresh efficiency|Reduced redundant running-application snapshots during media refresh
59|Research|Design-reference research|Documented a clean-room reference investigation for native interaction design
60|Architecture|Unified native widget registry|Consolidated widget registration and navigation into a native Shortcuts system
61|Fix|Shortcuts carousel polish|Refined carousel alignment and added scroll verification
62|Feature|Launcher and Window Snap|Improved native launcher morphing and Window Snap controls
63|Feature|Standalone widgets, package A|Expanded independently accessible widgets and Keep Awake controls
64|Feature|Window Snap standalone widget|Developed a dedicated native window management surface
65|Feature|Rich Notes persistence|Improved structured Notes editing and Shortcuts interaction
66|Feature|Voice, Reminders and image tools|Added standalone voice, reminder and background-removal surfaces
67|Feature|Camera, lyrics and recording widgets|Expanded access to camera, lyrics and screen recording tools
68|Architecture|Integrated Shortcuts widget packages|Combined feature packages into the unified widget system
69|Feature|AirDrop and file conversion|Added native file-sharing and format-conversion widgets
70|Feature|Calendar and communication tools|Advanced Calendar, audio control and communication launchers
71|Testing|Release acceptance handoff|Recorded validation evidence and outstanding native acceptance requirements
73|Architecture|Widget and agents lifecycle|Refined widget lifecycles, chat-only workspace and Shortcuts integration
75|Feature|Teleprompter and speech support|Added script reading, voice follow, transcript and permission-aware agent assistance
76|Testing|Speech and accessibility validation|Improved native capture isolation and accessibility validation coverage
77|Feature|Workspace widgets and privacy controls|Integrated native widgets, notifications, connections, Shortcuts and permission prompts
78|Feature|Calmer agent composer|Refined idle-state presentation and agent chat feedback
79|Feature|Animation timing preferences|Adjusted island animation presets and interaction timing
80|Feature|Agent model and reasoning controls|Improved message composer, model selection and reasoning controls
81|Fix|Motion, tabs and Shortcuts polish|Addressed collapse motion, tab transitions and launcher behavior
82|Decision|Private development-history automation|Established private read-only history collection with scheduled workflow support
"""
def make(kind,title,summary,date,id,status="Done",caveat="",evidence=None):
    return dict(id=id,date=date,kind=kind,title=title,summary=summary+".",status=status,
                caveat=caveat,evidence=evidence or [])
items=[]
# Early git history provides a documented beginning before GitHub PR #1.
first = {c["title"]:c for c in src["local"]["commits"]}
foundation = [
("Initial DynamicIsland macOS app","Architecture","First native macOS application","Created the first macOS Dynamic Island-style app foundation"),
("Refine island behavior and Spotify media support","Feature","Early Spotify integration","Extended initial island behavior and Spotify media support"),
("Polish expanded island entrance animation","Feature","First expansion animations","Began iterating on expanded island entrance motion"),
("Anchor expanded island to top bezel","Fix","Top-bezel island alignment","Corrected the expanded island position against the top bezel"),
("Stabilize island sizing and expansion state","Fix","Island sizing stability","Reduced inconsistencies in expansion geometry and state"),
("Restore stable notch-sized island","Fix","Stable compact notch geometry","Reworked compact island sizing and placement stability"),
("Make media controls functional and animate transitions","Feature","Functional media controls","Connected initial playback controls with the animated island"),
("Animate island surface instead of panel frame","Architecture","Stable overlay animation strategy","Shifted animations toward the island surface instead of changing the panel frame")
]
for i,(key,kind,title,summary) in enumerate(foundation,1):
    commit=first.get(key)
    if not commit:
        raise RuntimeError("Missing foundation commit: "+key)
    items.append(make(kind,title,summary,commit["authored"][:10],f"foundation-{i:02}",
       caveat=f"Grounded in a July 2026 Git commit; implementation history, not release certification."))
for line in CURATED.strip().splitlines():
    n,kind,title,summary=line.split("|",3);n=int(n);p=prs.get(n)
    if not p or not p.get("mergedAt"):
        # Skip unmerged items; never present a draft as completed.
        continue
    items.append(make(kind,title,summary,p["mergedAt"][:10],f"pr-{n:03d}",
        caveat=f"Recorded in merged private PR #{n}. Merge alone does not establish installed-app, device or release acceptance."))
roadmap=[
("Architecture","Complete cross-display native acceptance","Validate notch-aware geometry, widget sizing and navigation across supported displays"),
("Testing","Physical hardware and permission verification","Finish supervised physical Mac testing, privacy/permissions checks and installed-app acceptance"),
("Testing","Performance acceptance measurements","Capture device-specific frame timing, energy and interaction measurements rather than assuming 120 fps"),
("Fix","Outstanding notification and file tray UX","Resolve any remaining notification permission and file tray layout regressions against observed builds"),
("Release","Distribution readiness","Complete packaged-app regression, signing, rollback and release documentation")
]
for i,(kind,title,summary) in enumerate(roadmap,1):
    items.append(make(kind,title,summary,"2026-11-09",f"roadmap-{i:02}",status="Planned",
        caveat="Planning snapshot, not a verified implementation or promised completion date."))
items.sort(key=lambda x:(x["date"],x["id"]),reverse=True)
out=dict(schemaVersion=1,generatedAt=dt.datetime.now(dt.timezone.utc).isoformat(),milestones=items)
(ROOT/"data/milestones.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n")
print("Curated",len(items),"public milestones:",sum(i["status"]=="Done" for i in items),"merged/history entries;",len(roadmap),"roadmap items")
