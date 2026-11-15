// 現行の撮影メタデータから対応表を更新し、過去の監査記録は保持する。
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),base=path.join(root,'docs/manual');
const captures=require('./qa/full-refresh/capture.json'),pkg=require('../../package.json');
const file=path.join(__dirname,'screenshot-inventory.md');
const marker='<!-- CURRENT-SCREENSHOT-INVENTORY -->';
let old=fs.readFileSync(file,'utf8');
// 旧撮影記録は消さず、機械生成する現行一覧だけを入れ替える。
const humanCurrent=old.indexOf('\n## 2026-11-01 現行画像');
if(humanCurrent>=0)old=old.slice(0,humanCurrent);
old=old.split(marker)[0];
const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let text=marker+`\n## ${date} 現行画像\n\n対象アプリ：${pkg.version} Release ${pkg.release.number}。全画像は専用コピーの実Electronから撮影。読み込み・拡大・レイアウトは描画検査で確認し、目視の範囲とネイティブ操作の未確認事項はtools/release/RESULTS.mdの最新記録に区別します。旧画像・撮影時のハッシュはdocs/OLDのmanifestとqa/full-refresh/capture.jsonで保持します。\n\n|画面|参照先|テーマ・寸法|\n|---|---|---|\n`;
const used=[];
for(const page of ['index.html','recipes.html'])for(const match of fs.readFileSync(path.join(base,page),'utf8').matchAll(/<figure\b[\s\S]*?<\/figure>/g)){
 const key=match[0].match(/data-capture="([^"]+)"/)?.[1];if(!key)continue;
 const id=match[0].match(/\bid="([^"]+)"/)?.[1],c=captures[key];assert.ok(c&&id);
 assert.ok(fs.existsSync(path.join(base,'images',c.file)));used.push(key);
 text+=`|[${key}](../../docs/manual/images/${c.file})|[${page}#${id}](../../docs/manual/${page}#${id})|${c.state.theme} / ${c.size.join('×')}|\n`;
}
assert.equal(used.length,96);assert.equal(new Set(used).size,96);
fs.writeFileSync(file,old+'\n'+text);console.log('Updated 96 current screenshot references; historical record retained.');
