from pathlib import Path
import re
src=Path(r'e:/Websites/Team-Church-Glasgow/src/App.css')
css=src.read_text(encoding='utf-8')

def parse_blocks(s):
    blocks=[]
    i=0
    n=len(s)
    while i<n:
        if s[i].isspace():
            i+=1; continue
        if s.startswith('/*', i):
            j=s.find('*/', i+2)
            if j==-1: break
            i=j+2; continue
        j=i
        while j<n and s[j] != '{':
            j+=1
        if j>=n: break
        prelude=s[i:j].strip()
        depth=0
        k=j
        while k<n:
            if s[k]=='{': depth+=1
            elif s[k]=='}':
                depth-=1
                if depth==0:
                    k+=1
                    break
            k+=1
        body=s[j+1:k-1]
        blocks.append((prelude, body))
        i=k
    return blocks

def classify_selector(sel):
    s=sel
    if '.about-' in s: return 'about'
    if '.connect-' in s: return 'connect'
    if '.groups-' in s: return 'groups'
    if '.watch-' in s: return 'watch'
    if any(x in s for x in ['.welcome-','.latest-','.next-','.hero-','.video-']): return 'home'
    if '.events-' in s: return 'events'
    if any(x in s for x in ['html','body','.app-shell','.site-header','.nav-','.brand','.logo-','.action-','.page-content','.page','.site-footer','.sr-only']):
        return 'globals'
    if '@keyframes' in s:
        return 'globals'
    return 'globals'

def split_blocks(blocks):
    out={'globals':[], 'home':[], 'watch':[], 'about':[], 'connect':[], 'groups':[], 'events':[]}
    for prelude, body in blocks:
        if prelude.startswith('@media'):
            inner=parse_blocks(body)
            buckets=set()
            for p2,_ in inner:
                buckets.add(classify_selector(p2))
            if len(buckets)==1:
                target=buckets.pop()
                out[target].append((prelude, body))
            else:
                out['globals'].append((prelude, body))
        else:
            target=classify_selector(prelude)
            out[target].append((prelude, body))
    return out

blocks=parse_blocks(css)
parts=split_blocks(blocks)
style_dir=Path(r'e:/Websites/Team-Church-Glasgow/src/styles')
style_dir.mkdir(parents=True, exist_ok=True)
for key in ['globals','home','watch','about','connect','groups','events']:
    content='\n\n'.join(['{} {{\n{}\n}}'.format(p,b) for p,b in parts[key]]).strip() + '\n'
    (style_dir/('{0}.css'.format(key))).write_text(content, encoding='utf-8')

app=Path(r'e:/Websites/Team-Church-Glasgow/src/App.tsx')
app_text=app.read_text(encoding='utf-8')
app_text=re.sub(r"import './App.css'", "import './styles/globals.css'", app_text)
app.write_text(app_text, encoding='utf-8')

page_map={
    'HomePage.tsx':'home.css',
    'WatchPage.tsx':'watch.css',
    'AboutPage.tsx':'about.css',
    'ConnectPage.tsx':'connect.css',
    'GroupsPage.tsx':'groups.css',
    'EventsPage.tsx':'events.css',
}
for filename, cssfile in page_map.items():
    path=Path(r'e:/Websites/Team-Church-Glasgow/src/pages')/filename
    text=path.read_text(encoding='utf-8')
    if "import '../styles/{0}'".format(cssfile) not in text:
        text=text.replace('import', "import '../styles/{0}'\nimport".format(cssfile), 1)
    path.write_text(text, encoding='utf-8')
