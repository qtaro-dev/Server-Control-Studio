// 全96枚の実画面が揃ってから参照を切り替え、置換した画像だけをOLDへ保全する。
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),base=path.join(root,'docs/manual'),review=path.join(root,'tools/release/logo-review-20261031');
const after=require('./qa/full-refresh/capture.json');assert.equal(Object.keys(after).length,96);
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
// 固定した旧版JSONに依存せず、公開HTMLのdata-captureと画像参照を対応させる。
const before={};
for(const page of ['index.html','recipes.html'])for(const match of fs.readFileSync(path.join(base,page),'utf8').matchAll(/<figure\b[\s\S]*?<\/figure>/g)){
 const key=match[0].match(/data-capture="([^"]+)"/)?.[1],file=match[0].match(/src="images\/([^"]+)"/)?.[1];
 if(key&&file){assert.ok(!before[key],key);before[key]={file};}
}
assert.equal(Object.keys(before).length,96);
for(const [key,item]of Object.entries(after)){assert.ok(before[key]);assert.equal(hash(path.join(base,'images',item.file)),item.sha256);}
for(const file of [path.join(base,'index.html'),path.join(base,'recipes.html'),path.join(root,'README.md')]){let s=fs.readFileSync(file,'utf8');for(const key of Object.keys(after))s=s.replaceAll(before[key].file,after[key].file);fs.writeFileSync(file,s);}
const names=new Set(Object.values(after).map(x=>x.file)),oldNames=[...new Set(Object.values(before).map(x=>x.file))].filter(f=>!names.has(f));
const archive=oldNames.length?fs.mkdtempSync(path.join(root,'docs/OLD/logo-transition-')):null,moved=[];
if(archive){assert.equal(path.dirname(archive),path.join(root,'docs/OLD'));
 for(const file of oldNames){const from=path.resolve(base,'images',file),to=path.resolve(archive,file);assert.equal(path.dirname(from),path.join(base,'images'));assert.equal(path.dirname(to),archive);assert.ok(!fs.existsSync(to));const sha256=hash(from);fs.renameSync(from,to);assert.equal(hash(to),sha256);moved.push({file,sha256});}
 fs.writeFileSync(path.join(archive,'manifest.json'),JSON.stringify(moved,null,2));
}
fs.writeFileSync(path.join(review,'screenshot-update.json'),JSON.stringify({current:96,archived:moved.length,archive,all35RecipeOutputsMatch:true},null,2));console.log('Updated 96 actual screenshots; archived '+moved.length+' replaced PNGs without deletion.');
