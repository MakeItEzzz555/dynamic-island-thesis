#!/usr/bin/env python3
"""Small deterministic website patch: expose public counters and label local draft issue views."""
from pathlib import Path
p=Path(__file__).resolve().parents[1]/"index.html"
s=p.read_text()
before="let publicHistory={schemaVersion:1,milestones:[],generatedAt:null};"
after="let publicProgress=null;"+before
assert s.count(before)==1
s=s.replace(before,after)
before="function overview(){"
after="""function progressPanel(){
if(!publicProgress)return '';
const p=publicProgress;
const tiles=[
['Reachable Git commits',p.reachableCommits],
['Pull requests',p.pullRequests],
['Merged pull requests',p.mergedPullRequests],
['Tracked GitHub issues',p.issues]
];
return `<section class="panel" style="padding:18px 21px;margin-bottom:18px">
<div class="panel-head"><div><h2>Source-backed development activity</h2><p>${esc(p.firstCommit||'')} – ${esc(p.lastCommit||'')} · Local Git refs + GitHub metadata</p></div><button class="small-link" data-nav="Milestones">Explore milestones →</button></div>
<div class="stats" style="margin-bottom:12px">${tiles.map(([k,v])=>`<div class="stat"><div class="stat-top">${esc(k)}</div><div class="stat-value">${esc(Number(v).toLocaleString())}</div></div>`).join('')}</div>
<div style="color:#697486;font-size:12px;line-height:1.6">Counts reflect recorded development activity, not proof of release readiness. Private source code and raw commit/PR descriptions are excluded. Newly merged PRs may appear before their local commit refs are fetched.</div>
<div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap">${(p.commitsByMonth||[]).map(x=>`<span class="pill" style="background:#f0f4fa">${esc(x.month)}: ${esc(x.commits)} commits</span>`).join('')}</div></section>`;
}
function overview(){"""
assert s.count(before)==1
s=s.replace(before,after)
before="return heading('PROJECT CONTROL CENTER','A clearer path to ship.','Track design quality, implementation progress and thesis evidence in one place.')+"
after="return heading('PROJECT CONTROL CENTER','From first commit to release.','Verified development activity alongside editable local planning drafts.')+progressPanel()+"
assert s.count(before)==1
s=s.replace(before,after)
before="return heading('EVIDENCE-BASED PROJECT JOURNEY','Development milestones.','A curated record of decisions, implementation, regressions and verified acceptance evidence.')+"
after="return heading('EVIDENCE-BASED PROJECT JOURNEY','Development milestones.','A curated record of engineering achievements, investigations, fixes and remaining verification work.')+progressPanel()+"
assert s.count(before)==1
s=s.replace(before,after)
s=s.replace("${total} approved milestones","${total} curated milestones")
before="async function loadPublicHistory(){"
after="""async function loadPublicProgress(){try{const r=await fetch('./data/progress.json',{cache:'no-store'});if(!r.ok)throw Error(r.status);const p=await r.json();if(p.schemaVersion===1&&Number.isInteger(p.reachableCommits)&&Number.isInteger(p.pullRequests)){publicProgress=p;if(!selectedId)render()}}catch(e){console.warn('Public activity counters unavailable',e)}}
async function loadPublicHistory(){"""
assert s.count(before)==1
s=s.replace(before,after)
before="loadPublicHistory();"
after="loadPublicHistory();loadPublicProgress();"
assert s.count(before)==1
s=s.replace(before,after)
s=s.replace("Local workspace</div><div>macOS · Thesis development","Local drafts + public milestones</div><div>macOS · Thesis development")
p.write_text(s)
print("Patched island dashboard source-backed counters and clarified drafts")
