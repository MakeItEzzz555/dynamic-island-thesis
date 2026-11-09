// Island Studio: hash-routed static site. Data: data/thesis.json (curated),
// data/progress.json and data/milestones.json (written by scripts/sync_local.py).
const REPO = 'MakeItEzzz555/dynamic-island-thesis';
const ISSUES_API = `https://api.github.com/repos/${REPO}/issues?labels=feedback&state=all&per_page=100&sort=updated`;
const FEEDBACK_CACHE = 'island-studio-feedback-v1';
const THEME_KEY = 'island-studio-theme';

const NAV = [
  ['', 'Overview', 'i-overview'],
  ['journey', 'Journey', 'i-journey'],
  ['features', 'Features & architecture', 'i-features'],
  ['challenges', 'Engineering challenges', 'i-challenges'],
  ['decisions', 'Decisions', 'i-decisions'],
  ['roadmap', 'Roadmap', 'i-roadmap'],
  ['quality', 'Quality', 'i-quality'],
  ['review', 'Supervisor review', 'i-review'],
];
const KINDS = ['Feature', 'Fix', 'Architecture', 'Research', 'Testing', 'Decision', 'Release'];
const FB_STATUS = { pending: 'Pending', acknowledged: 'Acknowledged', addressed: 'Addressed', resolved: 'Resolved', closed: 'Closed' };

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (id, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const isNarrow = () => matchMedia('(max-width: 820px)').matches;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parseDate(s) { const [y, m, d] = String(s).split('-').map(Number); return { y, m, d }; }
function fmtDate(s) { if (!s) return 'Date unverified'; const { y, m, d } = parseDate(s); return `${d} ${MONTHS[m - 1]} ${y}`; }
function fmtRange(a, b) {
  if (!a) return '';
  if (!b || a === b) return fmtDate(a);
  const A = parseDate(a), B = parseDate(b);
  if (A.y === B.y && A.m === B.m) return `${A.d}–${B.d} ${MONTHS[A.m - 1]} ${A.y}`;
  if (A.y === B.y) return `${A.d} ${MONTHS[A.m - 1]} – ${B.d} ${MONTHS[B.m - 1]} ${A.y}`;
  return `${fmtDate(a)} – ${fmtDate(b)}`;
}

const state = { thesis: null, progress: null, milestones: [], generatedAt: null, loadError: null, feedback: { status: 'idle', items: [] }, explorer: { q: '', kind: 'All', phase: 'all' } };

/* ---------------- Data ---------------- */
async function getJSON(url) {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${url} returned ${r.status}`);
  return r.json();
}
async function loadData() {
  const [thesis, progress, milestones] = await Promise.allSettled([getJSON('data/thesis.json'), getJSON('data/progress.json'), getJSON('data/milestones.json')]);
  if (thesis.status === 'rejected') { state.loadError = thesis.reason; return; }
  state.thesis = thesis.value;
  if (progress.status === 'fulfilled' && progress.value.schemaVersion === 1) state.progress = progress.value;
  if (milestones.status === 'fulfilled' && milestones.value.schemaVersion === 1 && Array.isArray(milestones.value.milestones)) {
    state.milestones = milestones.value.milestones.filter((m) => m && typeof m.id === 'string');
    state.generatedAt = milestones.value.generatedAt;
  }
}
const phases = () => state.thesis.phases;
function phaseFor(date) {
  return phases().find((p) => date >= p.from && (!p.to || date <= p.to)) || null;
}
const journeyMilestones = () => state.milestones.filter((m) => m.status !== 'Planned').sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.id.localeCompare(a.id));
function phaseRange(p) {
  const ds = journeyMilestones().filter((m) => phaseFor(m.date)?.id === p.id).map((m) => m.date).sort();
  return ds.length ? fmtRange(ds[0], ds[ds.length - 1]) : fmtRange(p.from, p.to);
}
function milestoneStatus(m) {
  if (m.status === 'Review') return { key: 'awaiting', label: 'Write-up pending' };
  if (m.status === 'Done') return m.id.startsWith('pr-') ? { key: 'merged', label: 'Merged' } : { key: 'committed', label: 'Committed' };
  if (m.status === 'Blocked') return { key: 'open', label: 'Blocked' };
  if (m.status === 'In progress') return { key: 'awaiting', label: 'In progress' };
  return { key: 'planned', label: m.status };
}
function prNumber(m) { const x = /^pr-0*(\d+)$/.exec(m.id); return x ? Number(x[1]) : null; }

/* ---------------- Feedback (GitHub Issues) ---------------- */
function feedbackUrl(subject, title, kind) {
  const p = new URLSearchParams({ template: 'feedback.yml', title: title || 'Feedback: ', subject });
  if (kind) p.set('kind', kind);
  return `https://github.com/${REPO}/issues/new?${p}`;
}
function fbStatus(issue) {
  if (issue.state === 'closed') return issue.state_reason === 'not_planned' ? 'closed' : 'resolved';
  const names = (issue.labels || []).map((l) => (typeof l === 'string' ? l : l.name || '').toLowerCase());
  if (names.includes('status: addressed')) return 'addressed';
  if (names.includes('status: acknowledged')) return 'acknowledged';
  return 'pending';
}
function formField(body, label) {
  const m = new RegExp(`###\\s*${label}\\s*\\n+([^\\n]+)`, 'i').exec(body || '');
  const v = m ? m[1].trim() : '';
  return v === '_No response_' ? '' : v;
}
async function loadFeedback(force = false) {
  if (state.feedback.status === 'loading') return;
  try {
    const cached = JSON.parse(sessionStorage.getItem(FEEDBACK_CACHE) || 'null');
    if (!force && cached && Date.now() - cached.t < 5 * 60 * 1000) { state.feedback = { status: 'ok', items: cached.items }; return; }
  } catch { /* storage unavailable: fetch instead */ }
  state.feedback = { status: 'loading', items: state.feedback.items };
  try {
    const r = await fetch(ISSUES_API, { headers: { Accept: 'application/vnd.github+json' } });
    if (r.status === 403 || r.status === 429) throw new Error('GitHub rate limit reached; try again in a few minutes.');
    if (!r.ok) throw new Error(`GitHub returned ${r.status}.`);
    const raw = await r.json();
    const items = raw.filter((i) => !i.pull_request).map((i) => ({
      number: i.number, title: i.title, url: i.html_url, created: i.created_at?.slice(0, 10), updated: i.updated_at?.slice(0, 10),
      comments: i.comments, status: fbStatus(i), subject: formField(i.body, 'Subject'), kind: formField(i.body, 'Type of feedback'), author: i.user?.login,
    }));
    state.feedback = { status: 'ok', items };
    try { sessionStorage.setItem(FEEDBACK_CACHE, JSON.stringify({ t: Date.now(), items })); } catch { /* optional cache */ }
  } catch (e) {
    state.feedback = { status: 'error', items: [], message: e.message || 'Feedback could not be loaded.' };
  }
}
const threadsFor = (subject) => state.feedback.items.filter((i) => i.subject === subject);

/* ---------------- Shared pieces ---------------- */
function chip(statusKey, labelOverride) {
  const s = state.thesis.statuses[statusKey];
  const label = labelOverride || s?.label || statusKey;
  const ic = s ? `s-${statusKey}` : 's-merged';
  return `<span class="chip" data-status="${esc(statusKey)}" title="${esc(s?.help || '')}">${icon(ic)}${esc(label)}</span>`;
}
function fbChip(status) { return `<span class="chip fb-${status}">${esc(FB_STATUS[status])}</span>`; }
const ISSUE_NUMBERS = new Set([47, 49, 50, 51]);
function refLabel(r) { const n = Number(String(r).replace('#', '')); return `${ISSUE_NUMBERS.has(n) ? 'Issue' : 'PR'} ${r}`; }
function ref(r) { return `<span class="tag" title="Tracked in the private DynamicIsland repository">${esc(refLabel(r))}</span>`; }
function phaseName(id) { return phases().find((p) => p.id === id)?.title || ''; }
function feedbackLink(subject, title, text = 'Leave feedback') {
  return `<a class="text-link" href="${esc(feedbackUrl(subject, title))}" target="_blank" rel="noopener">${icon('i-review')}${esc(text)}<span class="visually-hidden"> (opens GitHub in a new tab)</span></a>`;
}
function threadList(items, emptyText) {
  if (state.feedback.status === 'loading' || state.feedback.status === 'idle') return `<p class="muted small" role="status">Loading feedback from GitHub…</p>`;
  if (state.feedback.status === 'error') return `<div class="error" role="alert"><p>${esc(state.feedback.message)}</p><button class="button" type="button" data-retry-feedback>Try again</button></div>`;
  if (!items.length) return `<p class="muted small">${esc(emptyText)}</p>`;
  return `<ul class="ruled-list">${items.map((i) => `<li class="thread"><div><h3><a href="${esc(i.url)}" target="_blank" rel="noopener">${esc(i.title)}</a></h3><p class="meta">#${i.number} · ${esc(i.kind || 'Feedback')} · opened ${esc(fmtDate(i.created))} · ${i.comments} ${i.comments === 1 ? 'reply' : 'replies'}${i.subject ? ` · ${esc(subjectLabel(i.subject))}` : ''}</p></div>${fbChip(i.status)}</li>`).join('')}</ul>`;
}
function subjectLabel(key) {
  const [type, id] = String(key).split(':');
  if (type === 'general') return 'General';
  if (type === 'challenge') return `Challenge: ${state.thesis.challenges.find((c) => c.id === id)?.title || id}`;
  if (type === 'phase') return `Phase: ${phaseName(id) || id}`;
  if (type === 'decision') return `Decision: ${state.thesis.decisions.find((d) => d.id === id)?.title || id}`;
  if (type === 'milestone') return `Milestone: ${state.milestones.find((m) => m.id === id)?.title || id}`;
  if (type === 'feature') return `Feature: ${id}`;
  return key;
}
function commitBars() {
  const p = state.progress;
  if (!p?.commitsByMonth?.length) return '<p class="muted small">Monthly activity is unavailable.</p>';
  const by = Object.fromEntries(p.commitsByMonth.map((x) => [x.month, x.commits]));
  const months = [];
  let [y, m] = p.commitsByMonth[0].month.split('-').map(Number);
  const [ey, em] = p.commitsByMonth[p.commitsByMonth.length - 1].month.split('-').map(Number);
  while (y < ey || (y === ey && m <= em)) { months.push(`${y}-${String(m).padStart(2, '0')}`); m++; if (m > 12) { m = 1; y++; } }
  const max = Math.max(...months.map((k) => by[k] || 0), 1);
  const lastMonth = p.lastCommit?.slice(0, 7);
  const rows = months.map((k, i) => {
    const v = by[k] || 0; const partial = k === lastMonth;
    const [yy, mm] = k.split('-').map(Number);
    return `<div class="bar-row" role="listitem"><span>${MONTHS[mm - 1]}</span><span class="bar-track">${v ? `<span class="bar${partial ? ' partial' : ''}" style="width:${Math.max(2, (v / max) * 100) * 0.78}%;--i:${i}"></span>` : ''}<span class="bar-value">${v.toLocaleString('en-GB')}${partial ? ' (to date)' : ''}</span></span><span class="visually-hidden">${MONTHS_LONG[mm - 1]} ${yy}: ${v} commits${partial ? ', month in progress' : ''}</span></div>`;
  }).join('');
  return `<div class="bars animate" role="list" aria-label="Commits per month">${rows}</div>`;
}
function evidenceFacts() {
  const p = state.progress;
  if (!p) return '<p class="muted small">Activity counters are unavailable right now.</p>';
  const n = (v) => Number(v).toLocaleString('en-GB');
  return `<div class="facts"><span>${n(p.reachableCommits)} reachable commits</span><span>${n(p.pullRequests)} pull requests, ${n(p.mergedPullRequests)} merged</span><span>${n(state.milestones.filter((m) => m.status !== 'Planned').length)} recorded milestones</span></div>`;
}
function phaseContents(link = true) {
  const latest = phases()[phases().length - 1].id;
  return `<ol class="phase-list">${phases().map((p) => {
    const inner = `<span class="title-row"><span class="n">0${p.n}</span><h3>${esc(p.title)}</h3>${p.id === latest ? '<span class="latest">Latest</span>' : ''}</span><span class="dateline">${esc(phaseRange(p))}</span><p>${esc(p.summary)}</p>`;
    return `<li>${link ? `<a class="phase-item" data-phase="${p.id}" href="#/journey/${p.id}">${inner}</a>` : `<div class="phase-item" data-phase="${p.id}">${inner}</div>`}</li>`;
  }).join('')}</ol>`;
}
const STATUS_LEGEND = ['merged', 'tests', 'hardware', 'open', 'planned'];

/* ---------------- Views ---------------- */
function viewOverview() {
  const t = state.thesis; const p = state.progress;
  const featured = t.challenges.find((c) => c.id === t.featuredChallenge);
  const openItems = t.roadmap.filter((r) => r.status === 'open').slice(0, 5);
  return `
  <div class="spread">
    <div class="stack">
      <div class="stack-s">
        <h1 class="page-title" tabindex="-1">${esc(t.project.title)}</h1>
        <p class="lede deck">${esc(t.project.deck)}</p>
      </div>
      <section class="thin-rule" aria-labelledby="ev-h">
        <div class="evidence">
          <div class="stack-s"><h2 class="h4" id="ev-h">Evidence</h2><p class="small muted">Counted from the private Git history${p ? `, ${esc(fmtRange(p.firstCommit, p.lastCommit))}` : ''}.</p>${evidenceFacts()}</div>
          <div class="stack-s"><h2 class="h4">Commits by month</h2>${commitBars()}</div>
        </div>
      </section>
      <section class="thin-rule stack-s" aria-labelledby="st-h">
        <h2 class="h4" id="st-h">How status is marked</h2>
        <p class="small" style="color:var(--ink-2)">Merged ≠ verified on hardware ≠ released. Every item on this site carries the status its evidence supports, drawn by line style as well as colour.</p>
        <div class="chips">${STATUS_LEGEND.map((s) => chip(s)).join('')}</div>
      </section>
    </div>
    <aside aria-labelledby="contents-h">
      <div class="contents-head"><h2 class="h3" id="contents-h">Contents: five phases</h2></div>
      ${phaseContents()}
    </aside>
  </div>

  <section class="section section-rule" aria-labelledby="why-h">
    <div class="spread">
      <div class="stack-s"><h2 class="h2" id="why-h">Why build it</h2><p class="prose" style="color:var(--ink)">${esc(t.project.why)}</p></div>
      <dl class="ruled-list" style="margin:0">${t.project.facts.map(([k, v]) => `<div style="display:grid;grid-template-columns:130px minmax(0,1fr);gap:12px;padding:12px 0;border-bottom:1px solid var(--hairline)"><dt class="label">${esc(k)}</dt><dd style="margin:0">${esc(v)}</dd></div>`).join('')}</dl>
    </div>
  </section>

  ${featured ? `
  <section class="section section-rule" aria-labelledby="feat-h">
    <div class="article-head">
      <h2 class="h2" id="feat-h" style="max-width:22ch">${esc(featured.title)}</h2>
      <div class="article-meta"><span class="label">Featured engineering challenge</span>${chip(featured.status)}<span class="small muted">Resolved in code. Not a hardware claim.</span></div>
    </div>
    <div class="spread">
      <div class="article-cols">
        <section><h3 class="h4">Problem</h3><p>${esc(featured.problem)}</p>
          <div class="pull-quote"><h3 class="h4">Root cause</h3><blockquote>${esc(featured.rootCause)}</blockquote></div>
          <a class="text-link" href="#/challenges/${featured.id}">Read the full case study${icon('i-arrow')}</a>
        </section>
        <section><h3 class="h4">Solution</h3><p>${esc(featured.solution)}</p>
          <figure style="margin:8px 0 0"><div class="diagram" role="img" aria-label="Diagram: a dashed fixed panel contains the expanded shell outline; the collapsed shell sits at the top centre."><div class="shell"><div class="pill"></div></div></div><figcaption>Dashed: the panel, fixed at maximum size. Outline: expanded shell. Solid: collapsed shell.</figcaption></figure>
          <h3 class="h4" style="margin-top:8px">Verification</h3><p>${esc(featured.verification)}</p>
        </section>
      </div>
      <aside class="stack">
        <div><div class="contents-head"><h2 class="h3">Still open</h2></div>
          <ul class="ruled-list" style="border-top:0">${openItems.map((r) => `<li class="stack-s" style="gap:2px"><span>${esc(r.title)}</span><span class="label">${r.ref ? `Tracked in ${esc(refLabel(r.ref).split(' ')[0])} <span class="num">${esc(r.ref)}</span>` : 'Not yet filed'}</span></li>`).join('')}</ul>
          <p style="margin-top:12px"><a class="text-link" href="#/roadmap">Full roadmap${icon('i-arrow')}</a></p>
        </div>
        <div class="cta-black">
          <h2 class="h3">Your feedback</h2>
          <p>Leave feedback on any phase, challenge or decision. It opens a GitHub issue with the context filled in, and its status shows on this site.</p>
          <p class="label">Pending → Acknowledged → Addressed → Resolved</p>
          <a class="button" href="#/review">${icon('i-review')}Leave feedback</a>
        </div>
      </aside>
    </div>
  </section>` : ''}`;
}

function viewJourney(phaseId) {
  const sel = phases().find((p) => p.id === phaseId);
  state.explorer.phase = sel ? sel.id : 'all';
  const list = sel ? [sel] : phases();
  const counts = Object.fromEntries(phases().map((p) => [p.id, journeyMilestones().filter((m) => phaseFor(m.date)?.id === p.id).length]));
  return `
  <div class="page-head">
    ${sel ? `<a class="back-link" href="#/journey">${icon('i-back')}All phases</a>` : ''}
    <h1 class="page-title wide" tabindex="-1">${sel ? `Phase ${sel.n}: ${esc(sel.title)}` : 'Development journey'}</h1>
    <p class="lede">${sel ? `${esc(phaseRange(sel))}. ${esc(sel.objective)}` : `Five phases, from the first commit on 2 July 2026 to today. Each phase states its objective, results, problems and lessons; the explorer below lists every recorded milestone.`}</p>
    <nav class="timeline-strip" aria-label="Phases">${phases().map((p) => `<a href="#/journey/${p.id}" data-phase="${p.id}" style="grid-column:span ${Math.max(1, counts[p.id])}" ${p.id === sel?.id ? 'aria-current="true"' : ''} title="Phase ${p.n}: ${esc(p.title)}"><span class="visually-hidden">Phase ${p.n}: ${esc(p.title)}, ${counts[p.id]} milestones</span></a>`).join('')}</nav>
    <p class="label">Strip width shows each phase's share of the ${journeyMilestones().length} recorded milestones.</p>
  </div>
  ${list.map((p) => `
  <section class="phase-band section" data-phase="${p.id}" aria-labelledby="ph-${p.id}" style="margin-top:var(--s7)">
    <div class="spread">
      <div class="stack-s">
        <h2 class="h2" id="ph-${p.id}">${sel ? 'Objective and results' : `<a href="#/journey/${p.id}" style="text-decoration:none">${esc(p.title)}</a>`}</h2>
        <p class="dateline">Phase 0${p.n} · ${esc(phaseRange(p))}</p>
        ${sel ? '' : `<p class="prose" style="color:var(--ink)">${esc(p.objective)}</p>`}
      </div>
      <div class="stack-s small">
        <p><strong>Lesson.</strong> ${esc(p.lessons)}</p>
        <p class="muted"><strong>Verification.</strong> ${esc(p.verification)}</p>
        <p class="muted"><strong>Limitations.</strong> ${esc(p.limitations)}</p>
      </div>
    </div>
    <div class="phase-grid">
      <div><h3 class="h4">Accomplished</h3><ul>${p.accomplishments.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div><h3 class="h4">Problems met</h3><ul>${p.problems.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div><h3 class="h4">Decisions</h3><ul>${p.decisions.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div>
    <p style="margin-top:var(--s5);display:flex;gap:20px;flex-wrap:wrap">${sel ? '' : `<a class="text-link" href="#/journey/${p.id}">Open phase (${counts[p.id]} milestones)${icon('i-arrow')}</a>`}${feedbackLink(`phase:${p.id}`, `Feedback on phase: ${p.title}`, 'Feedback on this phase')}</p>
  </section>`).join('')}

  <section class="section" aria-labelledby="ex-h">
    <h2 class="h2" id="ex-h" style="margin-bottom:var(--s4)">Engineering explorer</h2>
    <p class="prose" style="margin-bottom:var(--s5)">One line per milestone; open a row for its summary. Search the curated milestone record. Merged pull requests are marked as merged only; newly merged work appears as "Write-up pending" until its summary is reviewed.</p>
    <div class="explorer-bar">
      <div class="field"><label for="exq">Search</label><div class="search-box">${icon('i-search')}<input id="exq" class="input" type="search" placeholder="Title, summary or PR number" value="${esc(state.explorer.q)}" autocomplete="off"></div></div>
      <div class="field"><span class="legend" id="kind-l">Kind</span><div class="seg" role="group" aria-labelledby="kind-l">${['All', ...KINDS].map((k) => `<button type="button" data-kind="${k}" aria-pressed="${state.explorer.kind === k}">${k}</button>`).join('')}</div></div>
      <div class="field"><label for="exp">Phase</label><select id="exp" class="select"><option value="all">All phases</option>${phases().map((p) => `<option value="${p.id}" ${state.explorer.phase === p.id ? 'selected' : ''}>${p.n}. ${esc(p.title)}</option>`).join('')}</select></div>
    </div>
    <p class="label" id="excount" role="status" aria-live="polite" style="padding-top:12px"></p>
    <div id="exresults"></div>
  </section>`;
}
function renderExplorer() {
  const box = $('#exresults'); if (!box) return;
  const { q, kind, phase } = state.explorer; const ql = q.trim().toLowerCase();
  const items = journeyMilestones().filter((m) => (kind === 'All' || m.kind === kind) && (phase === 'all' || phaseFor(m.date)?.id === phase) &&
    (!ql || [m.title, m.summary, m.kind, m.id, prNumber(m) ? `#${prNumber(m)}` : ''].join(' ').toLowerCase().includes(ql)));
  $('#excount').textContent = `${items.length} of ${journeyMilestones().length} milestones`;
  if (!items.length) { box.innerHTML = `<div class="empty"><p>No milestones match these filters.</p><button class="button" type="button" data-clear-explorer>Clear filters</button></div>`; return; }
  const groups = new Map();
  for (const m of items) { const k = (m.date || '').slice(0, 7); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(m); }
  box.innerHTML = [...groups].map(([k, ms]) => {
    const [y, mo] = k.split('-').map(Number);
    return `<div class="month-head"><h3 class="h3">${MONTHS_LONG[mo - 1]} ${y}</h3><span class="label">${ms.length} milestone${ms.length === 1 ? '' : 's'}</span></div><ol style="list-style:none">${ms.map((m) => {
      const st = milestoneStatus(m); const ph = phaseFor(m.date); const pr = prNumber(m);
      return `<li class="milestone" data-phase="${ph?.id || ''}"><details${ql ? ' open' : ''}><summary><time class="date" datetime="${esc(m.date)}">${esc(fmtDate(m.date))}</time><span class="m-title"><span class="phase-dot" aria-hidden="true"></span>${esc(m.title)}</span>${chip(st.key, st.label)}</summary><div class="m-body"><p>${esc(m.summary)}</p><div class="meta"><span class="tag">${esc(m.kind)}</span>${pr ? `<span class="tag">PR #${pr}</span>` : ''}${ph ? `<span class="label">${esc(ph.title)}</span>` : ''}<a class="fb-link" href="${esc(feedbackUrl(`milestone:${m.id}`, `Feedback on milestone: ${m.title}`))}" target="_blank" rel="noopener">Feedback<span class="visually-hidden"> on ${esc(m.title)} (opens GitHub)</span></a></div>${m.caveat && !/^Recorded in merged private PR #\d+\. Merge alone/.test(m.caveat) ? `<p class="caveat">${esc(m.caveat)}</p>` : ''}</div></details></li>`;
    }).join('')}</ol>`;
  }).join('');
}

function viewFeatures() {
  const t = state.thesis;
  return `
  <div class="page-head">
    <h1 class="page-title wide" tabindex="-1">Features & architecture</h1>
    <p class="lede">What the island does today, how its parts fit together, and the evidence behind each status. Screenshots are real captures from the app with sample content.</p>
  </div>
  <section class="section-rule stack-s" aria-labelledby="arch-h">
    <h2 class="h2" id="arch-h">How it is built</h2>
    <p class="prose">One menu-bar app owns everything. Its composition root creates every store and controller; a single transparent panel hosts the SwiftUI views; three small helper programs carry AI-agent hook events into the app over an authenticated local connection.</p>
    <div class="arch" style="margin-top:var(--s4)">${t.architecture.map((l) => `<div class="arch-layer"><h3>${esc(l.layer)}</h3><ul>${l.parts.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div>
    <ol class="review-steps" style="margin-top:var(--s6)" aria-label="How an agent event reaches the island">
      <li>An AI agent (Codex or Claude Code) runs a hook that starts a helper relay.</li>
      <li>The relay reads a discovery file, signs the event with a derived key and sends it to the app on the loopback interface only. If anything fails, it exits quietly so the agent is never blocked.</li>
      <li>The app checks the signature, producer and protocol version, then the event store updates the island's views.</li>
    </ol>
  </section>
  ${t.featureGroups.map((g) => `
  <section class="feature-group" aria-labelledby="fg-${esc(g.title)}">
    <h2 class="h2" id="fg-${esc(g.title)}" style="margin-bottom:var(--s4)">${esc(g.title)}</h2>
    <ul class="feature-items">${g.items.map((f) => `
      <li class="feature"><div class="stack-s" style="gap:6px"><h3>${esc(f.name)}</h3><p>${esc(f.detail)}</p></div><div>${chip(f.status)}</div>
      ${f.shots?.length ? `<div class="shots">${f.shots.map((s) => `<figure class="shot"><button type="button" data-lightbox="${esc(s)}" aria-label="Enlarge: ${esc(t.screenshots.items[s] || s)}"><img src="assets/screenshots/${esc(s)}.webp" alt="${esc(t.screenshots.items[s] || s)}" loading="lazy" decoding="async"></button><figcaption>${esc(t.screenshots.items[s] || s)}</figcaption></figure>`).join('')}</div>` : ''}
      </li>`).join('')}</ul>
  </section>`).join('')}
  <p class="label" style="margin-top:var(--s7)">${esc(t.screenshots.provenance)}</p>`;
}

function viewChallenges() {
  const t = state.thesis;
  return `
  <div class="page-head">
    <h1 class="page-title wide" tabindex="-1">Engineering challenges</h1>
    <p class="lede">The hardest problems met while building the app. Each case runs Problem → Investigation → Root cause → Solution → Verification → Lessons, and its status says only what the evidence supports.</p>
  </div>
  <ul class="challenge-list">${t.challenges.map((c) => `
    <li><a class="challenge-row" data-phase="${c.phase}" href="#/challenges/${c.id}">
      <div class="stack-s" style="gap:6px"><h3>${esc(c.title)}</h3><span class="label">${esc(c.area)} · <span class="phase-dot" aria-hidden="true"></span> ${esc(phaseName(c.phase))}</span><p>${esc(c.problem)}</p></div>
      <div>${chip(c.status)}</div></a></li>`).join('')}</ul>`;
}
function viewChallenge(id) {
  const t = state.thesis; const i = t.challenges.findIndex((c) => c.id === id); const c = t.challenges[i];
  if (!c) return viewNotFound();
  const prev = t.challenges[i - 1], next = t.challenges[i + 1];
  const steps = [['Problem', c.problem], ['Investigation', c.investigation], ['Root cause', c.rootCause, true], ['Solution', c.solution], ['Verification', c.verification], ['Lessons', c.lessons]];
  const subject = `challenge:${c.id}`;
  return `
  <div class="page-head">
    <a class="back-link" href="#/challenges">${icon('i-back')}All challenges</a>
    <h1 class="page-title wide" tabindex="-1">${esc(c.title)}</h1>
    <div class="article-meta">${chip(c.status)}<span class="label">${esc(c.area)}</span><a class="label" href="#/journey/${c.phase}">Phase: ${esc(phaseName(c.phase))}</a>${(c.refs || []).map(ref).join('')}</div>
  </div>
  <div class="spread">
    <div class="steps">${steps.map(([h, v, key]) => `<section class="step${key ? ' key' : ''}"><h2 class="h4">${h}</h2><p>${esc(v)}</p></section>`).join('')}</div>
    <aside class="stack">
      <div class="cta-black"><h2 class="h3">Feedback on this case</h2><p>Questions, corrections or requested changes about this challenge open a GitHub issue with the context filled in.</p><a class="button" href="${esc(feedbackUrl(subject, `Feedback on: ${c.title}`))}" target="_blank" rel="noopener">${icon('i-review')}Leave feedback<span class="visually-hidden"> (opens GitHub)</span></a></div>
      <div><h2 class="h4" style="margin-bottom:10px">Feedback so far</h2><div data-threads="${esc(subject)}">${threadList(threadsFor(subject), 'No feedback on this case yet.')}</div></div>
    </aside>
  </div>
  <nav class="section thin-rule" aria-label="More challenges" style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap">
    ${prev ? `<a class="text-link" href="#/challenges/${prev.id}">${icon('i-back')}${esc(prev.title)}</a>` : '<span></span>'}
    ${next ? `<a class="text-link" href="#/challenges/${next.id}">${esc(next.title)}${icon('i-arrow')}</a>` : ''}
  </nav>`;
}

function viewDecisions(openId) {
  const t = state.thesis;
  return `
  <div class="page-head">
    <h1 class="page-title wide" tabindex="-1">Research & decisions</h1>
    <p class="lede">The choices that shaped the architecture: what was decided, the alternatives considered, and what each choice costs.</p>
  </div>
  <div class="block-rule">${t.decisions.map((d) => `
    <details class="decision" id="d-${d.id}" ${d.id === openId ? 'open' : ''}>
      <summary><time class="dateline" datetime="${d.date}">${esc(fmtDate(d.date))}</time><h2 class="h3" style="font-size:1.125rem">${esc(d.title)}</h2>${icon('i-arrow', 'icon chev')}</summary>
      <div class="body"><div>
        <div><h3 class="h4">Context</h3><p>${esc(d.context)}</p></div>
        <div><h3 class="h4">Decision</h3><p style="color:var(--ink)">${esc(d.decision)}</p></div>
        <div><h3 class="h4">Alternatives considered</h3><ul>${d.alternatives.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>
        <div><h3 class="h4">Consequences</h3><p>${esc(d.consequences)}</p></div>
        <p>${feedbackLink(`decision:${d.id}`, `Feedback on decision: ${d.title}`, 'Feedback on this decision')}</p>
      </div></div>
    </details>`).join('')}</div>`;
}

function viewRoadmap() {
  const t = state.thesis;
  const cols = [['awaiting', 'Awaiting merge'], ['open', 'Open'], ['planned', 'Planned']];
  const pending = journeyMilestones().filter((m) => m.status === 'Review');
  return `
  <div class="page-head">
    <h1 class="page-title wide" tabindex="-1">Roadmap</h1>
    <p class="lede">What is finished but not yet merged, what is known to be open, and what is planned. No dates are promised, and nothing moves to "done" without evidence.</p>
  </div>
  <div class="roadmap">${cols.map(([k, label]) => { const items = t.roadmap.filter((r) => r.status === k); return `
    <section class="roadmap-col" aria-labelledby="rm-${k}"><h2 id="rm-${k}">${chip(k, label)}<span class="count">${items.length}</span></h2>
      ${items.map((r) => `<div class="road-item"><h3>${esc(r.title)}</h3><p>${esc(r.detail)}</p>${r.ref ? `<p>${ref(r.ref)}</p>` : ''}</div>`).join('') || '<p class="muted small" style="padding:16px 0">Nothing here.</p>'}
    </section>`; }).join('')}</div>
  <section class="section section-rule" aria-labelledby="wp-h">
    <h2 class="h2" id="wp-h">Merged work awaiting a write-up</h2>
    <p class="prose" style="margin:var(--s3) 0 var(--s5)">The daily sync publishes only the number and merge date of new pull requests. Each gets a summary here once it has been reviewed for publication.</p>
    ${pending.length ? `<ul class="ruled-list">${pending.map((m) => `<li class="open-row"><span class="mono">${esc(fmtDate(m.date))}</span><span>${esc(m.title)}</span></li>`).join('')}</ul>` : '<p class="muted">None right now: every merged pull request has a public summary.</p>'}
  </section>`;
}

function viewQuality() {
  const q = state.thesis.quality;
  return `
  <div class="page-head">
    <h1 class="page-title wide" tabindex="-1">Testing & quality</h1>
    <p class="lede">How changes are checked, what the evidence covers, and what it does not. Only results that were actually run are listed.</p>
  </div>
  <section aria-labelledby="pl-h"><h2 class="h2" id="pl-h" style="margin-bottom:var(--s4)">The check every change must pass</h2>
    <ol class="pipeline">${q.pipeline.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></section>
  <section class="section" aria-labelledby="evq-h"><h2 class="h2" id="evq-h" style="margin-bottom:var(--s4)">Evidence</h2>
    <ul class="evidence-list">${q.evidence.map((e) => `<li><h3 class="h4">${esc(e.title)}</h3><p>${esc(e.detail)}</p>${chip(e.status)}</li>`).join('')}</ul></section>
  <section class="section section-rule" aria-labelledby="nc-h"><div class="spread"><div class="stack-s"><h2 class="h2" id="nc-h">What this site does not claim</h2>
    <ul class="prose" style="padding-left:20px;display:grid;gap:8px"><li>A merged pull request is not evidence of hardware, permission or release acceptance.</li><li>No frame rate, battery or performance figure is given without a recorded measurement.</li><li>No accessibility compliance level is claimed; Reduce Motion and keyboard paths exist, but no formal audit has been recorded.</li><li>Counts cover reachable Git history and GitHub metadata, not every hour of work.</li></ul></div>
    <div class="cta-black"><h2 class="h3">Spot a gap?</h2><p>If the evidence for a claim looks thin, say so. It becomes a tracked issue.</p><a class="button" href="${esc(feedbackUrl('general', 'Question about evidence: '))}" target="_blank" rel="noopener">${icon('i-review')}Ask about evidence<span class="visually-hidden"> (opens GitHub)</span></a></div></div></section>`;
}

function viewReview(preset) {
  const t = state.thesis;
  const subjects = [['general', 'The thesis as a whole'], ...phases().map((p) => [`phase:${p.id}`, `Phase ${p.n}: ${p.title}`]), ...t.challenges.map((c) => [`challenge:${c.id}`, `Challenge: ${c.title}`]), ...t.decisions.map((d) => [`decision:${d.id}`, `Decision: ${d.title}`]), ...t.featureGroups.map((g) => [`feature:${g.title}`, `Features: ${g.title}`])];
  return `
  <div class="page-head">
    <h1 class="page-title wide" tabindex="-1">Supervisor review</h1>
    <p class="lede">Your feedback becomes a GitHub issue on this site's public repository, so it persists, can be discussed, and shows its status here: Pending, Acknowledged, Addressed or Resolved.</p>
  </div>
  <div class="spread">
    <div class="stack">
      <section aria-labelledby="q-h"><h2 class="h2" id="q-h" style="margin-bottom:var(--s4)">What I need from you</h2>
        <ol class="questions">${t.supervisorQuestions.map((q, i) => `<li><div class="stack-s" style="gap:8px"><p>${esc(q)}</p><a class="fb-link" href="${esc(feedbackUrl('general', `Answer to Q${i + 1}: `, 'Question'))}" target="_blank" rel="noopener">Answer this question<span class="visually-hidden"> (opens GitHub)</span></a></div></li>`).join('')}</ol></section>
      <section aria-labelledby="c-h"><h2 class="h2" id="c-h" style="margin-bottom:var(--s4)">Write feedback</h2>
        <form class="composer" id="composer">
          <div class="row">
            <div class="field"><label for="fbk">Type</label><select id="fbk" class="select"><option>General feedback</option><option>Question</option><option>Requested change</option></select></div>
            <div class="field"><label for="fbs">About</label><select id="fbs" class="select">${subjects.map(([k, l]) => `<option value="${esc(k)}" ${k === preset ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
          </div>
          <div class="field"><label for="fbt">Short title</label><input id="fbt" class="input" maxlength="120" placeholder="For example: Evaluation chapter needs a hardware test plan" required></div>
          <p class="small muted">Continue on GitHub to write the full message. A free GitHub account is needed, and the issue is public.</p>
          <div><button class="button primary" type="submit">${icon('i-external')}Continue on GitHub</button></div>
        </form></section>
      <section aria-labelledby="how-h"><h2 class="h3" id="how-h" style="margin-bottom:var(--s4)">How it works</h2>
        <ol class="review-steps"><li>Choose a subject, or use "Feedback" beside any milestone, challenge or decision.</li><li>GitHub opens a feedback form with that subject already filled in.</li><li>The author labels it Acknowledged when read and Addressed when changed, and closes it when you agree it is resolved.</li></ol>
        <p class="small muted" style="margin-top:var(--s4)">Privacy: feedback is public on GitHub under your account. Do not include personal or confidential information. You can edit or delete your own comments; the author can remove an issue on request.</p></section>
    </div>
    <aside class="stack" aria-labelledby="th-h">
      <div><div class="contents-head" style="display:flex;justify-content:space-between;align-items:baseline;gap:12px"><h2 class="h3" id="th-h">Feedback so far</h2><button class="link-button small" type="button" data-retry-feedback>Refresh</button></div>
        <div id="fbcount">${feedbackCounts()}</div>
        <div data-threads="all">${threadList(state.feedback.items, 'No feedback yet. Yours will be the first.')}</div></div>
    </aside>
  </div>`;
}

function feedbackCounts() {
  if (state.feedback.status !== 'ok' || !state.feedback.items.length) return '';
  const parts = Object.keys(FB_STATUS).map((k) => [k, state.feedback.items.filter((i) => i.status === k).length]).filter(([, v]) => v);
  return `<p class="label" style="padding:12px 0">${parts.map(([k, v]) => `${v} ${FB_STATUS[k].toLowerCase()}`).join(' · ')}</p>`;
}

function viewNotFound() {
  return `<div class="page-head"><h1 class="page-title" tabindex="-1">Page not found</h1><p class="lede">This address does not match a section of the site.</p><p><a class="button primary" href="#/">Go to the overview</a></p></div>`;
}
function viewLoadError() {
  return `<div class="page-head"><h1 class="page-title" tabindex="-1">The record could not be loaded</h1><p class="lede">${esc(state.loadError?.message || 'A data file is missing.')} Check your connection and reload. If the problem continues, the site's data files may be updating.</p><p><button class="button primary" type="button" onclick="location.reload()">Reload</button></p></div>`;
}

/* ---------------- Router ---------------- */
function route() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path] = raw.split('?');
  const [section = '', id = ''] = path.split('/').map(decodeURIComponent);
  return { section, id };
}
const TITLES = { '': 'Overview', journey: 'Journey', features: 'Features & architecture', challenges: 'Engineering challenges', decisions: 'Decisions', roadmap: 'Roadmap', quality: 'Quality', review: 'Supervisor review' };
let firstRender = true;
function render() {
  const main = $('#main');
  if (state.loadError || !state.thesis) { main.innerHTML = viewLoadError(); return; }
  const { section, id } = route();
  const views = { '': viewOverview, journey: () => viewJourney(id), features: viewFeatures, challenges: () => (id ? viewChallenge(id) : viewChallenges()), decisions: () => viewDecisions(id), roadmap: viewRoadmap, quality: viewQuality, review: () => viewReview(id) };
  const view = views[section] || viewNotFound;
  const swap = () => {
    main.innerHTML = view();
    main.classList.remove('view-enter'); void main.offsetWidth; if (!reducedMotion()) main.classList.add('view-enter');
    if (section === 'journey') renderExplorer();
    updateNav(section);
    const sub = id && section === 'challenges' ? state.thesis.challenges.find((c) => c.id === id)?.title : id && section === 'journey' ? phaseName(id) : '';
    document.title = `${sub || TITLES[section] || 'Not found'} · Island Studio`;
    $('#folio').innerHTML = `<span>${esc(TITLES[section] || 'Not found')}</span>${sub ? `<span class="muted">· ${esc(sub)}</span>` : ''}`;
    if (!firstRender) { window.scrollTo({ top: 0, behavior: 'instant' }); $('h1', main)?.focus({ preventScroll: true }); }
    firstRender = false;
  };
  swap();
  if ((section === 'review' || (section === 'challenges' && id)) && state.feedback.status === 'idle') loadFeedback().then(refreshThreads);
}
function refreshThreads() {
  const { section, id } = route();
  if (section === 'review') { const c = $('#fbcount'); if (c) c.innerHTML = feedbackCounts(); }
  $$('[data-threads]').forEach((el) => { const s = el.dataset.threads; el.innerHTML = s === 'all' ? threadList(state.feedback.items, 'No feedback yet. Yours will be the first.') : threadList(threadsFor(s), 'No feedback on this case yet.'); });
}
function updateNav(section) {
  const path = location.hash.replace(/^#\/?/, '').split('?')[0];
  $$('#tree .sub').forEach((u) => { u.hidden = section !== 'journey'; });
  $$('#navLinks a, #tree a').forEach((a) => {
    const target = a.getAttribute('href').replace(/^#\/?/, '');
    const current = target.includes('/') ? target === path : target === section;
    if (current) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

/* ---------------- Chrome: nav, sidebar, theme ---------------- */
function buildNav() {
  $('#navLinks').innerHTML = NAV.map(([k, label], i) => `<li style="--i:${i}"><a href="#/${k}">${esc(label)}</a></li>`).join('');
  $('#tree').innerHTML = NAV.map(([k, label, ic]) => `<li><a href="#/${k}">${icon(ic)}<span>${esc(label)}</span></a>${k === 'journey' && state.thesis ? `<ul class="sub">${phases().map((p) => `<li><a href="#/journey/${p.id}" data-phase="${p.id}"><span class="phase-dot" aria-hidden="true"></span><span>${p.n}. ${esc(p.title)}</span></a></li>`).join('')}</ul>` : ''}</li>`).join('');
}
const sidebar = { mode: null, hoverTimer: 0, leaveTimer: 0 };
function openSidebar(mode) {
  const sb = $('#sidebar'), btn = $('#menuButton');
  if (sidebar.mode === 'click' && mode === 'hover') return;
  clearTimeout(sidebar.leaveTimer);
  const wasOpen = !!sidebar.mode; sidebar.mode = mode;
  sb.dataset.open = 'true'; btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Close menu');
  if (isNarrow()) {
    const scrim = $('#scrim'); scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('is-visible'));
    ['#main', '.masthead', '.site-foot'].forEach((s) => $(s)?.setAttribute('inert', ''));
  }
  if (mode === 'click' && !wasOpen) requestAnimationFrame(() => ($('#tree a[aria-current]') || $('#tree a'))?.focus({ preventScroll: true }));
}
function closeSidebar(returnFocus = false) {
  if (!sidebar.mode) return;
  sidebar.mode = null; clearTimeout(sidebar.hoverTimer); clearTimeout(sidebar.leaveTimer);
  const sb = $('#sidebar'), btn = $('#menuButton');
  const hadFocus = sb.contains(document.activeElement);
  sb.dataset.open = 'false'; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu');
  const scrim = $('#scrim'); scrim.classList.remove('is-visible'); setTimeout(() => { if (!sidebar.mode) scrim.hidden = true; }, 220);
  ['#main', '.masthead', '.site-foot'].forEach((s) => $(s)?.removeAttribute('inert'));
  if (returnFocus || hadFocus) btn.focus({ preventScroll: true });
}
function initChrome() {
  const nav = $('#primaryNav'), btn = $('#menuButton'), sb = $('#sidebar');
  new IntersectionObserver(([e]) => {
    const docked = !e.isIntersecting && e.boundingClientRect.top < 0;
    nav.classList.toggle('is-docked', docked);
    if (!docked && !isNarrow()) closeSidebar();
  }).observe($('.nav-sentinel'));
  // Hover opens after a short intent delay on a mouse; click, tap and keyboard pin it open.
  btn.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse' || isNarrow()) return; clearTimeout(sidebar.leaveTimer); sidebar.hoverTimer = setTimeout(() => openSidebar('hover'), 120); });
  const scheduleClose = () => { clearTimeout(sidebar.hoverTimer); clearTimeout(sidebar.leaveTimer); sidebar.leaveTimer = setTimeout(() => { if (sidebar.mode === 'hover') closeSidebar(); }, 280); };
  btn.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') scheduleClose(); });
  sb.addEventListener('pointerenter', () => clearTimeout(sidebar.leaveTimer));
  sb.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && sidebar.mode === 'hover') scheduleClose(); });
  btn.addEventListener('click', () => { if (sidebar.mode === 'click') closeSidebar(true); else openSidebar('click'); });
  $('#sidebarClose').addEventListener('click', () => closeSidebar(true));
  $('#scrim').addEventListener('click', () => closeSidebar(true));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sidebar.mode) { e.preventDefault(); closeSidebar(true); } });
  document.addEventListener('pointerdown', (e) => { if (sidebar.mode && !sb.contains(e.target) && !btn.contains(e.target)) closeSidebar(); });
  sb.addEventListener('focusout', (e) => { if (sidebar.mode && !isNarrow() && e.relatedTarget && !sb.contains(e.relatedTarget) && e.relatedTarget !== btn) closeSidebar(); });
  sb.addEventListener('click', (e) => { if (e.target.closest('a')) closeSidebar(); });
  matchMedia('(max-width: 820px)').addEventListener('change', () => closeSidebar());
  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', toggleTheme));
  syncThemeLabels();
}
function effectiveDark() { const t = document.documentElement.dataset.theme; return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
function toggleTheme() {
  const next = effectiveDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(THEME_KEY, next); } catch { /* per-viewer convenience only */ }
  syncThemeLabels();
}
function syncThemeLabels() {
  const dark = effectiveDark();
  $$('.theme-toggle').forEach((b) => { b.innerHTML = `${icon(dark ? 'i-sun' : 'i-moon')}<span>${dark ? 'Light appearance' : 'Dark appearance'}</span>`; });
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 2600); }
function lightbox(name) {
  const caption = state.thesis.screenshots.items[name] || name;
  const d = document.createElement('dialog'); d.className = 'lightbox';
  d.innerHTML = `<img src="assets/screenshots/${esc(name)}.webp" alt="${esc(caption)}"><p>${esc(caption)}</p><button class="icon-button" type="button" aria-label="Close">${icon('i-close')}</button>`;
  document.body.append(d);
  d.addEventListener('close', () => d.remove());
  d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('button')) d.close(); });
  d.showModal();
}

/* ---------------- Events ---------------- */
function initEvents() {
  window.addEventListener('hashchange', () => { closeSidebar(); render(); });
  document.addEventListener('input', (e) => { if (e.target.id === 'exq') { state.explorer.q = e.target.value; renderExplorer(); } });
  document.addEventListener('change', (e) => { if (e.target.id === 'exp') { state.explorer.phase = e.target.value; renderExplorer(); } });
  document.addEventListener('click', (e) => {
    const kind = e.target.closest('[data-kind]');
    if (kind) { state.explorer.kind = kind.dataset.kind; $$('[data-kind]').forEach((b) => b.setAttribute('aria-pressed', String(b === kind))); renderExplorer(); return; }
    if (e.target.closest('[data-clear-explorer]')) { state.explorer = { q: '', kind: 'All', phase: 'all' }; $('#exq').value = ''; $('#exp').value = 'all'; $$('[data-kind]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kind === 'All'))); renderExplorer(); return; }
    if (e.target.closest('[data-retry-feedback]')) { loadFeedback(true).then(refreshThreads); refreshThreads(); return; }
    const lb = e.target.closest('[data-lightbox]'); if (lb) lightbox(lb.dataset.lightbox);
  });
  document.addEventListener('submit', (e) => {
    if (e.target.id !== 'composer') return;
    e.preventDefault();
    const title = $('#fbt').value.trim();
    if (!title) { $('#fbt').focus(); toast('Add a short title first.'); return; }
    const kind = $('#fbk').value; const prefix = kind === 'Question' ? 'Question: ' : kind === 'Requested change' ? 'Change request: ' : '';
    window.open(feedbackUrl($('#fbs').value, prefix + title, kind), '_blank', 'noopener');
  });
}

/* ---------------- Boot ---------------- */
(async function boot() {
  buildNav(); initChrome(); initEvents();
  await loadData();
  buildNav(); updateNav(route().section);
  if (state.generatedAt || state.progress) $('#issueMeta').textContent = `DynamicIsland thesis · updated ${fmtDate((state.progress?.lastCommit) || (state.generatedAt || '').slice(0, 10))}`;
  render();
})();
