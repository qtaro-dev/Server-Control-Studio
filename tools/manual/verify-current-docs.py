"""現行開発版マニュアルの画像・リンク・説明を検査する。アプリには書き込まない。"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json, re, struct, hashlib

root = Path(__file__).resolve().parents[2]
base = root / 'docs/manual'
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.assets=[]; self.links=[]
    def handle_starttag(self, tag, attributes):
        a=dict(attributes)
        if 'id' in a: self.ids.append(a['id'])
        if tag == 'a': self.links.append(a.get('href',''))
        if tag in ('img','script') and a.get('src'): self.assets.append(a['src'])
        if tag == 'link' and a.get('href'): self.assets.append(a['href'])

pages={}
for file in base.rglob('*.html'):
    # 原文維持の第三者クレジットはアプリのナビゲーション検査と分離。全文の同一性はpackage検証で検査。
    if file.is_relative_to(base/'third-party'): continue
    p=Page(); p.feed(file.read_text(encoding='utf-8-sig')); pages[file.resolve()]=p
    assert len(p.ids)==len(set(p.ids)),file
assets=set(); links=0
for file,p in pages.items():
    for value in p.assets+p.links:
        u=urlsplit(value)
        if u.scheme or u.netloc: continue  # 外部証跡は既存記録。通信による再検証はしない。
        target=(file.parent/unquote(u.path)).resolve() if u.path else file
        assert target.is_relative_to(base) and target.is_file(),(file,value)
        if u.fragment: assert unquote(u.fragment) in pages[target].ids,(file,value)
    links+=len(p.links)
    for value in p.assets: assets.add((file.parent/value).resolve())
for page in ('index.html','recipes.html'):
    text=(base/page).read_text(encoding='utf-8')
    assert 'index.html#management' in text or 'id="management"' in text
    for term in ('D:\\Dev\\docker-builder-tool','C:\\Users\\RDP','一括フォルダ保存はありません','current-draft'):
        assert term not in text,(page,term)
    for block in re.findall(r'<figure\b.*?</figure>',text,re.S):
        assert re.findall(r'<b class="annotation-marker" data-number="(\d+)"',block)==re.findall(r'<li><b>(\d+)</b><span>',block)
manifest=json.loads((root/'tools/manual/qa/full-refresh/capture.json').read_text(encoding='utf-8'))
shots=list((base/'images').glob('*.png'))
assert len(shots)==len(manifest)==96
assert {p.name for p in shots}=={c['file'] for c in manifest.values()}
for file in shots:
    raw=file.read_bytes(); assert raw[:8]==b'\x89PNG\r\n\x1a\n'
    width,height=struct.unpack('>II',raw[16:24]); assert width==1280 and height in (720,900)
    assert file.resolve() in assets,('unused screenshot',file)
    assert re.match(r'ui-\d{8}-',file.name),file
for item in manifest.values():
    file=base/'images'/item['file']
    assert hashlib.sha256(file.read_bytes()).hexdigest()==item['sha256'],file
for folder in ('art','icons'):
    for file in (base/folder).glob('*.png'):
        assert file.resolve() in assets,('unused asset',file)
archive=root/'docs/OLD/screenshots-before-2026-10-30'
for item in json.loads((archive/'manifest.json').read_text(encoding='utf-8')):
    file=archive/(item['file'] if item['kind']=='unused-illustration' else 'images/'+item['file'])
    assert hashlib.sha256(file.read_bytes()).hexdigest()==item['sha256'],('archive changed',file)
for href in re.findall(r'!?\[[^\]]*\]\(([^)]+)\)',(root/'README.md').read_text(encoding='utf-8')):
    if '://' not in href: assert (root/href.split('#')[0]).is_file(),href
result={'htmlDocuments':len(pages),'linksChecked':links,'linkedAssets':len(assets),'newCurrentScreenshots':len(shots),'brokenLinks':0,'missingAssets':0,'annotations':'PASS'}
out=root/'tools/manual/qa/current-update';out.mkdir(parents=True,exist_ok=True)
(out/'static-result.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result))
