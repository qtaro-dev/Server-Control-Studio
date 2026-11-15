"""正規マニュアルの全HTMLを辿り、全ハイパーリンクとフラグメントを検査する。"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
from collections import Counter
import json
root=Path(__file__).resolve().parents[2];base=root/'docs/manual';qa=root/'tools/manual/qa'
# 帰属ページの外部参照は、採用した固定コミットの素材一覧だけを許可する。
icon_metadata=json.loads((root/'app/data/module-icon-attributions.json').read_text(encoding='utf-8'))
icon_references={item['sourceUrl'] for item in icon_metadata['items']}|{icon_metadata['licenseUrl']}
class P(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=[]
 def handle_starttag(self,t,a):
  d=dict(a)
  if t=='a' and 'href'in d:self.links.append(d['href'])
  if d.get('id'):self.ids.append(d['id'])
parsed={};targets={};broken=[];types=Counter()
for file in base.rglob('*.html'):
 # 原文維持の第三者クレジットはアプリのナビゲーション検査と分離。全文の同一性はpackage検証で検査。
 if file.is_relative_to(base/'third-party'): continue
 p=P();p.feed(file.read_text(encoding='utf-8-sig'));parsed[file.resolve()]=p
for file,p in parsed.items():
 for href in p.links:
  u=urlsplit(href)
  if u.scheme or u.netloc:
   if (file.is_relative_to(base/'third-party') or (file.name in ('index.html','recipes.html','logo-notices.html') and href in {e['website'] for e in json.loads((root/'app/data/logo-notices.json').read_text(encoding='utf-8'))['entries']}) or (file.name=='logo-notices.html' and href in icon_references)) and u.scheme in ('http','https','mailto'):types['external-license-reference-not-fetched']+=1
   elif href=='https://github.com/qtaro-dev/Server-Control-Studio/actions/runs/40524380569':types['external-evidence']+=1
   else:broken.append(dict(source=str(file.relative_to(base)),href=href,reason='unexpected external link'))
   continue
  target=(file.parent/unquote(u.path)).resolve() if u.path else file
  kind='fragment' if not u.path else 'html' if target.suffix=='.html' else 'file';types[kind]+=1
  if not target.is_relative_to(base):broken.append(dict(source=str(file.relative_to(base)),href=href,reason='outside manual'));continue
  if not target.is_file():broken.append(dict(source=str(file.relative_to(base)),href=href,reason='missing'));continue
  if u.fragment and (target not in parsed or unquote(u.fragment)not in parsed[target].ids):broken.append(dict(source=str(file.relative_to(base)),href=href,reason='missing fragment'))
  targets[target.relative_to(base).as_posix()]=kind
result=dict(htmlDocuments=len(parsed),hyperlinks=sum(types.values()),kinds=dict(types),uniqueFiles=len(targets),broken=broken)
(qa/'link-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
(qa/'link-targets.json').write_text(json.dumps(list(targets),ensure_ascii=False,indent=2),encoding='utf-8')
assert not broken,broken
print(json.dumps(result,ensure_ascii=True))
