#!/usr/bin/env python3
"""Validate explicitly approved, public-safe milestones (no automatic private-data publishing)."""
import argparse, datetime, json, pathlib, re, sys, urllib.parse
p=argparse.ArgumentParser();p.add_argument('file',nargs='?',default='data/milestones.json');a=p.parse_args()
d=json.loads(pathlib.Path(a.file).read_text());assert d.get('schemaVersion')==1 and isinstance(d.get('milestones'),list)
seen=set()
for x in d['milestones']:
    assert isinstance(x,dict)
    assert all(isinstance(x.get(k),str) for k in ('id','title','date','kind','summary','status'))
    assert x['id'] not in seen;seen.add(x['id'])
    assert x['kind'] in {'Feature','Fix','Research','Architecture','Testing','Release','Decision'}
    assert x['status'] in {'Done','In progress','Review','Blocked','Planned'}
    assert re.fullmatch(r'\d{4}-\d{2}-\d{2}',x['date']);datetime.date.fromisoformat(x['date'])
    for e in x.get('evidence',[]):
        assert e.get('label') and e.get('url')
        url=urllib.parse.urlparse(e['url']);assert url.scheme=='https' and url.hostname in {'github.com','docs.github.com','developer.apple.com'},'Unexpected evidence hostname'
    assert not any(k in x for k in ('token','source','rawDiff','privateCode','secret'))
print('Valid public milestone snapshot:',len(d['milestones']),'items. NOTE: this cannot certify text is non-confidential; manual review remains mandatory.')
