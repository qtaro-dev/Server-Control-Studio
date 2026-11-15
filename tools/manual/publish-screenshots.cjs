// 実撮影マニフェストだけを参照し、HTMLとREADMEの画像を差し替える。
// 未参照画像は削除せずdocs/OLDへ退避する。アプリ/ユーザープロジェクトは対象外。
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),base=path.join(root,'docs/manual');
const captures=require('./qa/full-refresh/capture.json'),before=require('./qa/full-refresh/before.json');
const recipes=require('./recipe-inputs.json');
assert.equal(Object.keys(captures).length,96);
const figure=(key,title,caption,id='screen-'+key)=>{
 const c=captures[key];assert.ok(c,key);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(base,'images',c.file))).digest('hex'),c.sha256);
 return `<figure class="screenshot" id="${id}" data-capture="${key}"><h4>${title}</h4><button class="zoom-image" type="button" aria-label="${title}を拡大"><span class="image-wrap"><img src="images/${c.file}" width="${c.size[0]}" height="${c.size[1]}" alt="現行開発版：${title}" loading="lazy"></span><span class="zoom-label">クリックで拡大</span></button><figcaption>${caption}</figcaption></figure>`;
};
for(const name of ['index.html','recipes.html']){
 let html=fs.readFileSync(path.join(base,name),'utf8');
 html=html.replace(/<figure\b[\s\S]*?<\/figure>/g,block=>{
  const m=block.match(/src="images\/([^"/]+)\.png"/);if(!m)return block;
  const key=(block.match(/data-capture="([^"]+)"/)||[])[1]||m[1].replace(/^current-/,'');assert.ok(captures[key],key);
  let caption=(block.match(/<figcaption>([\s\S]*?)<\/figcaption>/)||[])[1]||'';
  // 過去画像の座標注記は引き継がず、操作番号は画像直下の説明に統一する。
  caption=caption.replace(/<b>\d+<\/b>/g,'').replace('class="callouts"','class="screen-steps"');
  const title=(block.match(/<h4>(.*?)<\/h4>/)||[])[1],id=(block.match(/\bid="([^"]+)"/)||[])[1];
  return figure(key,title,caption,id);
 });
 if(name==='index.html'){
  const injectAfter=(key,extra)=>{const first=(extra.match(/data-capture="([^"]+)"/)||[])[1];if(html.includes('data-capture="'+first+'"'))return;const pattern=new RegExp('(<figure\\b[^>]*data-capture="'+key+'"[\\s\\S]*?<\\/figure>)');assert.ok(pattern.test(html));html=html.replace(pattern,(_,b)=>b+extra);};
  injectAfter('output',figure('node-files','追加ファイルを切り替える','<p>右の選択欄でDockerfileや専用dockerignore等を切り替えます。ダウンロードは表示中のファイル、一式保存は生成された全ファイルを対象にします。</p>')+figure('guide','構成ファイルの配置・起動ガイド','<p>下部のボタンで開くガイドです。「閉じる」で生成結果に戻ります。必要なソースや配置は構成ごとに確認してください。</p>'));
  injectAfter('diagnosis',figure('project-list','登録済みComposeプロジェクトの一覧','<p>左の名前をクリックして対象を切り替えます。nodejs-basicと外部Composeの説明用プロジェクトを登録した例です。登録だけでは起動しません。</p>'));
  injectAfter('edit',figure('backup','保存完了とバックアップ先','<p>専用サンプルを実際に保存した後の表示です。成功時に出る「バックアップ：」以降が保存先です。編集欄はクリアされるため、続けて編集する場合はファイルを選び直します。</p>'));
 }else{
  html=html.replace(/<article class="recipe"[\s\S]*?<\/article>/g,block=>{
   const id=(block.match(/id="recipe-([^"]+)"/)||[])[1],r=recipes.find(r=>r.id===id);assert.ok(r,id);
   if(block.includes('data-capture="'+id+'-config"'))return block;
   const screenshots='<h3>現行アプリの構成入力と生成結果</h3><p>設定値は上の表と照合してください。複数モジュールでは一部のパネルを開いた状態を示しています。ほかのパネルも開いて設定し、全件の「設定確認」をチェックしてから生成します。</p>'+figure(id+'-config',r.title+'：構成入力','<p>このレシピの設定値を実際に入力した画面です。公開ポート・永続化・秘密値等は各モジュールのパネルで確認します。</p>')+figure(id+'-output',r.title+'：生成結果','<p>同じ入力から生成したComposeと追加ファイルです。Composeはservices:から始まります。利用者が用意するコードや追加設定は、この下のファイル配置手順に従って別途準備してください。</p>');
   const marker=block.includes('<h3>ファイルの区別と配置</h3>')?'<h3>ファイルの区別と配置</h3>':(block.match(/<h3>[^<]*ファイル[^<]*<\/h3>/)||[])[0];
   assert.ok(marker,id);return block.replace(marker,screenshots+marker);
  });
 }
 fs.writeFileSync(path.join(base,name),html);
}
let readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
readme=readme.replace(/docs\/manual\/images\/current-([^/)]+)\.png/g,(_,key)=>'docs/manual/images/'+captures[key].file);
fs.writeFileSync(path.join(root,'README.md'),readme);
// この時点で全新規撮影画像をHTMLから参照していることを確認する。
const pages=['index.html','recipes.html'].map(n=>fs.readFileSync(path.join(base,n),'utf8'));
const kept=new Set(Object.values(captures).map(c=>c.file));
for(const f of kept)assert.ok(pages.some(s=>s.includes('images/'+f)),'Unused capture '+f);
const archive=path.resolve(root,'docs/OLD/screenshots-before-2026-10-30');
assert.ok(archive.startsWith(path.resolve(root,'docs/OLD')+path.sep));assert.ok(!fs.existsSync(archive),'Archive already exists');
fs.mkdirSync(path.join(archive,'images'),{recursive:true});
const moved=[];
for(const file of fs.readdirSync(path.join(base,'images'))){
 if(kept.has(file))continue;
 // HTML・READMEの参照を再確認してから、ファイル単位で移動する。
 assert.ok(![...pages,readme].some(s=>s.includes('images/'+file)),'Referenced old image '+file);
 const from=path.resolve(base,'images',file),to=path.resolve(archive,'images',file);
 assert.equal(path.dirname(from),path.resolve(base,'images'));assert.equal(path.dirname(to),path.resolve(archive,'images'));
 const sha256=crypto.createHash('sha256').update(fs.readFileSync(from)).digest('hex');fs.renameSync(from,to);
 moved.push({file,sha256,kind:before.inventory.some(i=>i.file===file)?'previous':'unused-capture-attempt'});
}
fs.writeFileSync(path.join(archive,'manifest.json'),JSON.stringify(moved,null,2));
fs.writeFileSync(path.join(archive,'README.md'),'# 画面画像の旧版\n\n現行マニュアルから未参照になった旧画像と、不採用の途中撮影を保全しています。現行版は../../manual/index.htmlを参照してください。manifest.jsonに退避前のSHA-256を記録しています。\n');
fs.writeFileSync(path.join(__dirname,'qa/full-refresh/archive.json'),JSON.stringify({archive,moved},null,2));
console.log(JSON.stringify({captures:kept.size,archived:moved.length,previousPNG:moved.filter(f=>f.kind==='previous'&&f.file.endsWith('.png')).length,unusedAttempts:moved.filter(f=>f.kind==='unused-capture-attempt').length},null,2));
