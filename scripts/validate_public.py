#!/usr/bin/env python3
"""Validate explicitly approved, public-safe site data (no automatic private-data publishing).

Default run (used by sync_local.py): validates data/milestones.json and, when present,
data/thesis.json. A positional path validates that milestone file only.
"""
import argparse, datetime, json, pathlib, re, sys, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
FORBIDDEN = ('token', 'source', 'rawDiff', 'privateCode', 'secret')

def validate_milestones(path):
    d = json.loads(pathlib.Path(path).read_text()); assert d.get('schemaVersion') == 1 and isinstance(d.get('milestones'), list)
    seen = set()
    for x in d['milestones']:
        assert isinstance(x, dict)
        assert all(isinstance(x.get(k), str) for k in ('id', 'title', 'date', 'kind', 'summary', 'status'))
        assert x['id'] not in seen; seen.add(x['id'])
        assert x['kind'] in {'Feature', 'Fix', 'Research', 'Architecture', 'Testing', 'Release', 'Decision'}
        assert x['status'] in {'Done', 'In progress', 'Review', 'Blocked', 'Planned'}
        assert re.fullmatch(r'\d{4}-\d{2}-\d{2}', x['date']); datetime.date.fromisoformat(x['date'])
        for e in x.get('evidence', []):
            assert e.get('label') and e.get('url')
            url = urllib.parse.urlparse(e['url']); assert url.scheme == 'https' and url.hostname in {'github.com', 'docs.github.com', 'developer.apple.com'}, 'Unexpected evidence hostname'
        assert not any(k in x for k in FORBIDDEN)
    print('Valid public milestone snapshot:', len(d['milestones']), 'items. NOTE: this cannot certify text is non-confidential; manual review remains mandatory.')

def walk_keys(node):
    if isinstance(node, dict):
        for k, v in node.items():
            yield k; yield from walk_keys(v)
    elif isinstance(node, list):
        for v in node: yield from walk_keys(v)

def validate_thesis(path):
    d = json.loads(pathlib.Path(path).read_text())
    assert d.get('schemaVersion') == 1, 'thesis.json schemaVersion must be 1'
    statuses = set(d['statuses'])
    assert not set(walk_keys(d)) & set(FORBIDDEN), 'forbidden key in thesis.json'
    phases = d['phases']; ids = [p['id'] for p in phases]
    assert ids and len(ids) == len(set(ids)), 'phase ids must be unique'
    prev_to = None
    for p in phases:
        datetime.date.fromisoformat(p['from'])
        if p['to'] is not None:
            assert datetime.date.fromisoformat(p['to']) >= datetime.date.fromisoformat(p['from']), p['id']
        assert prev_to is None or p['from'] > prev_to, f"phases overlap at {p['id']}"
        prev_to = p['to'] or '9999-12-31'
        for k in ('title', 'summary', 'objective', 'lessons', 'verification', 'limitations'): assert isinstance(p[k], str) and p[k], (p['id'], k)
        for k in ('accomplishments', 'problems', 'decisions'): assert isinstance(p[k], list) and p[k], (p['id'], k)
    assert phases[-1]['to'] is None, 'the latest phase must be open-ended so new milestones land in it'
    cids = set()
    for c in d['challenges']:
        assert c['id'] not in cids; cids.add(c['id'])
        assert c['status'] in statuses and c['phase'] in ids, c['id']
        for k in ('title', 'area', 'problem', 'investigation', 'rootCause', 'solution', 'verification', 'lessons'): assert isinstance(c[k], str) and c[k], (c['id'], k)
    assert d['featuredChallenge'] in cids
    shots = d['screenshots']['items']
    for name in shots: assert (ROOT / 'assets' / 'screenshots' / f'{name}.webp').is_file(), f'missing screenshot {name}'
    for g in d['featureGroups']:
        for f in g['items']:
            assert f['status'] in statuses, f['name']
            for s in f.get('shots', []): assert s in shots, f'unknown screenshot {s}'
    for x in d['decisions']:
        datetime.date.fromisoformat(x['date']); assert x['alternatives'], x['id']
    for r in d['roadmap']: assert r['status'] in statuses, r['title']
    for e in d['quality']['evidence']: assert e['status'] in statuses, e['title']
    print('Valid thesis content:', len(phases), 'phases,', len(cids), 'challenges,', len(d['decisions']), 'decisions,', len(shots), 'screenshots.')

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('file', nargs='?'); a = ap.parse_args()
    if a.file:
        validate_milestones(a.file); sys.exit()
    validate_milestones(ROOT / 'data' / 'milestones.json')
    if (ROOT / 'data' / 'thesis.json').exists():
        validate_thesis(ROOT / 'data' / 'thesis.json')
