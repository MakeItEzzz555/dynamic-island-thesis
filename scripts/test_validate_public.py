#!/usr/bin/env python3
"""Self-check: the publish gate must accept the real data and reject broken thesis content."""
import copy, importlib.util, json, pathlib, tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('validate_public', ROOT / 'scripts' / 'validate_public.py')
v = importlib.util.module_from_spec(spec); spec.loader.exec_module(v)
base = json.loads((ROOT / 'data' / 'thesis.json').read_text())

def check(mutate):
    d = copy.deepcopy(base); mutate(d)
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as f: json.dump(d, f)
    v.validate_thesis(f.name)

v.validate_milestones(ROOT / 'data' / 'milestones.json')
check(lambda d: None)
bad = {
    'unknown status': lambda d: d['challenges'][0].update(status='done'),
    'closed latest phase': lambda d: d['phases'][-1].update(to='2026-11-30'),
    'missing screenshot file': lambda d: d['screenshots']['items'].update(nope='x'),
    'forbidden key': lambda d: d['challenges'][1].update(secret='x'),
    'overlapping phases': lambda d: d['phases'][1].update({'from': '2026-07-15'}),
}
for name, mutate in bad.items():
    try: check(mutate)
    except AssertionError: continue
    raise SystemExit(f'validator accepted bad data: {name}')
print('validate_public self-check passed:', len(bad), 'bad inputs rejected')
