#!/usr/bin/env python3
"""Generate a PRIVATE evidence inventory. Never publish its raw output to GitHub Pages.

Run locally: python3 scripts/collect_history.py --repo-dir ../DynamicIsland
Optional API access: export GH_TOKEN=... (or GITHUB_TOKEN in private Actions).
On GitHub Actions the token must belong to the PRIVATE source repository.
"""
import argparse, datetime as dt, json, os, pathlib, subprocess, urllib.parse, urllib.request, urllib.error

DEFAULT_REPO = 'MakeItEzzz555/DynamicIsland'

def git(repo, *args):
    return subprocess.check_output(['git','-C',str(repo),*args], text=True, stderr=subprocess.DEVNULL).strip()

def api(path, token):
    req=urllib.request.Request('https://api.github.com'+path,headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Authorization':'Bearer '+token,'User-Agent':'island-studio-inventory'})
    with urllib.request.urlopen(req,timeout=35) as r: return json.load(r)

def github_pages(path, token):
    items=[];page=1
    while True:
        sep='&' if '?' in path else '?'
        batch=api(f'{path}{sep}per_page=100&page={page}',token)
        if not isinstance(batch,list):raise RuntimeError('Expected GitHub API list')
        items+=batch
        if len(batch)<100: break
        page+=1
        if page>200: raise RuntimeError('Pagination safety limit reached')
    return items

def main():
    p=argparse.ArgumentParser();p.add_argument('--repo-dir',default='.')
    p.add_argument('--repository',default=DEFAULT_REPO)
    p.add_argument('--output',default='.private/history-inventory.json')
    p.add_argument('--skip-github',action='store_true')
    args=p.parse_args(); repo=pathlib.Path(args.repo_dir).resolve()
    if not (repo/'.git').exists(): raise SystemExit('Expected a local Git repository at '+str(repo))
    # NUL field separators preserve multi-line commit messages; --all collects local branches and tags.
    raw=subprocess.check_output(['git','-C',str(repo),'log','--all','--format=%H%x00%aI%x00%cI%x00%s%x00%b%x00%D%x00%x1e'],stderr=subprocess.DEVNULL).decode('utf-8','replace')
    records=[]
    for part in raw.split('\x1e'):
        bits=part.strip('\r\n').split('\x00')
        if len(bits)<6 or len(bits[0])!=40:continue
        sha,authored,committed,subject,body,refs=bits[:6]
        records.append({'sha':sha,'authored':authored,'committed':committed,'title':subject,'message':body.strip(),'refs':refs.strip()})
    out={'schemaVersion':1,'sourceRepository':args.repository,'generatedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'local':{'branches':git(repo,'branch','-a'),'tags':git(repo,'tag','--list'),'commits':records},'github':None,'warnings':['PRIVATE DRAFT. Commit messages, bodies, PR discussion and local branch names may contain sensitive information. Never publish this JSON.','Commits from deleted/unreachable refs and uncommitted working-tree changes are not recoverable from git log --all.']}
    token=os.getenv('GH_TOKEN') or os.getenv('GITHUB_TOKEN')
    if not args.skip_github and token:
        try:
            name=urllib.parse.quote(args.repository,safe='/')
            pull=github_pages('/repos/'+name+'/pulls?state=all&sort=created&direction=asc',token)
            issues=github_pages('/repos/'+name+'/issues?state=all&sort=created&direction=asc',token)
            out['github']={'pullRequests':[{'number':x['number'],'title':x['title'],'state':x['state'],'draft':x.get('draft',False),'mergedAt':x.get('merged_at'),'createdAt':x.get('created_at'),'closedAt':x.get('closed_at'),'updatedAt':x.get('updated_at'),'url':x['html_url'],'body':x.get('body') or '','head':x['head']['ref'],'base':x['base']['ref']} for x in pull], 'issues':[{'number':x['number'],'title':x['title'],'state':x['state'],'createdAt':x.get('created_at'),'closedAt':x.get('closed_at'),'url':x['html_url'],'body':x.get('body') or ''} for x in issues if 'pull_request' not in x]}
        except (urllib.error.HTTPError,urllib.error.URLError) as exc:out['warnings'].append('GitHub API collection failed: '+str(exc))
    else:out['warnings'].append('GitHub PR/issue history not collected: GH_TOKEN/GITHUB_TOKEN missing or --skip-github supplied.')
    dest=pathlib.Path(args.output);dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n');os.chmod(dest,0o600)
    print('PRIVATE INVENTORY:',dest,'| git commits:',len(records),'| GitHub PRs:',len((out['github'] or {}).get('pullRequests',[])),'| issues:',len((out['github'] or {}).get('issues',[])))
    print('Review and curate milestones separately. DO NOT upload this inventory to the public site.')
if __name__=='__main__':main()
