// 管理状態はこのモジュール内だけに保持し、ジェネレーターの編集状態と混在させない。
const root=document.getElementById('tab-management'),api=window.managementAPI;
const $=id=>root.querySelector('#mgr-'+id);
let items=[],selected=null,editing=null,busy=false;
async function call(method,...args){const r=await api[method](...args);if(!r.ok)throw Error(r.error);return r.value;}
function message(text,error=false,kind='info'){
 const state=error?'error':kind;
 const labels={info:'案内',success:'正常',warning:'注意',error:'エラー',busy:'実行中'};
 $('status').textContent=labels[state]+'：'+text;$('status').dataset.state=state;
}
async function task(label,fn){
 if(busy)return;busy=true;root.setAttribute('aria-busy','true');
 const start=Date.now();message(label+'…',false,'busy');
 const timer=setInterval(()=>message(label+'… '+Math.floor((Date.now()-start)/1000)+'秒',false,'busy'),1000);
 try{await fn();}catch(e){message(e.message,true);}
 finally{clearInterval(timer);busy=false;root.setAttribute('aria-busy','false');}
}
function panel(id){
 for(const p of root.querySelectorAll('.manager-panel'))p.hidden=p.id!=='mgr-'+id;
 root.querySelectorAll('.manager-tabs [data-panel]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.panel===id)));
}
function showDiff(id,text,other,kind){
 const target=$(id),reference=other.split('\n');target.replaceChildren();
 text.split('\n').forEach((line,i)=>{const span=document.createElement('span');span.textContent=line+'\n';if(line!==reference[i])span.className=kind;target.append(span);});
}
function clearEdit(){editing=null;$('editText').value='';$('editingPath').textContent='ファイルを選択してください';$('preview').disabled=true;$('saveFile').disabled=true;$('diff').hidden=true;$('validation').textContent='';}
function showProjects(){
 $('projects').replaceChildren();
 for(const p of items){
  const b=document.createElement('button'),title=document.createElement('strong'),services=document.createElement('small'),location=document.createElement('small');
  title.textContent=p.name;services.textContent=p.services?.length?p.services.join('・'):'サービス未確認';location.textContent=p.root;
  b.append(title,services,location);b.setAttribute('aria-current',String(selected?.id===p.id));b.onclick=()=>task('プロジェクトを読み込み中',()=>select(p.id));$('projects').append(b);
 }
 $('unregister').disabled=!selected;
}
async function load(){
 items=await call('list');
 if(selected){selected=items.find(p=>p.id===selected.id)||null;if(!selected){$('detail').hidden=true;$('empty').hidden=false;clearEdit();}}
 showProjects();
}
async function select(id){
 selected=items.find(p=>p.id===id);if(!selected)return;
 clearEdit();$('operationOutput').textContent='';$('detail').hidden=false;$('empty').hidden=true;
 $('projectTitle').textContent=selected.name;$('projectRoot').textContent=selected.root;$('serviceList').textContent='サービス：'+selected.services.join('、');
 $('projectName').value=selected.name;$('context').value=selected.context;$('composeFiles').value=selected.files.join('\n');$('envName').textContent=selected.envFile||'.env（存在する場合に自動利用）';
 panel('configuration');await diagnosis();showProjects();
 message(selected.error||'登録情報を読み込みました。Docker操作は実行していません。',Boolean(selected.error));
}
function completionButton(service){
 const b=document.createElement('button');b.className='manager-primary diagnostic-complete';b.textContent='HTTPサンプル一式の追加内容を確認';
 b.onclick=()=>task('補完処理',async()=>{const r=await call('complete',selected.id,service);if(r.canceled){message('補完をキャンセルしました。');return;}await diagnosis();message('不足ファイルを追加しました。ビルド・起動で動作を確認してください。',false,'success');});
 return b;
}
async function diagnosis(){
 const d=await call('inspect',selected.id),required=d.issues.filter(i=>i.required).length,optional=d.issues.length-required;
 $('diagnosisSummary').textContent='必須の要確認 '+required+'件 ／ 任意 '+optional+'件';
 $('issues').replaceChildren();
 for(const issue of d.issues){
  const li=document.createElement('li'),badge=document.createElement('span'),name=document.createElement('code'),reasons=document.createElement('ul');
  badge.className='manager-badge';badge.dataset.required=String(issue.required);badge.textContent=issue.required?'必須':'任意';name.textContent=issue.path;
  for(const reason of issue.reasons||[issue.message]){const item=document.createElement('li');item.textContent=reason;reasons.append(item);}
  li.append(badge,name,reasons);
  const matches=d.completions.filter(c=>c.paths.some(p=>p.replace(/^\.\//,'').toLowerCase()===issue.path.toLowerCase()));
  const completable=matches.find(c=>c.kind);
  if(completable)li.append(completionButton(completable.id));
  const note=document.createElement('p');note.className='manager-completion-note';
  note.textContent=completable?completable.reason:matches.length?[...new Set(matches.map(c=>c.reason))].join(' '):issue.required?'自動補完の対象外です。上記の参照先と必要な配置を確認してください。':'任意ファイルです。利用する場合に準備してください。';
  li.append(note);$('issues').append(li);
 }
 if(!d.issues.length){const li=document.createElement('li');li.textContent='静的に確認できる範囲で不足はありません。Docker構成検証も実行してください。';$('issues').append(li);}
 $('notices').replaceChildren();for(const n of d.notices){const li=document.createElement('li');li.textContent=n;$('notices').append(li);}
 $('fileList').replaceChildren();for(const f of d.files){
  const b=document.createElement('button');b.textContent=f.path+(f.editable?' — 表示・編集':' — 機密ファイル（内容非表示）');b.disabled=!f.editable;
  b.onclick=()=>task('ファイルを読み込み中',async()=>{editing=await call('open',selected.id,f.path);$('editingPath').textContent=editing.path;$('editText').value=editing.text;$('editNotice').textContent=editing.notice;$('preview').disabled=false;$('saveFile').disabled=true;$('diff').hidden=true;panel('editor');message('編集後に「変更差分を確認」を押してください。');});
  $('fileList').append(b);
 }
 return {required,optional};
}
$('register').onclick=()=>task('登録ファイルを選択中',async()=>{const p=await call('register');if(p.canceled){message('登録をキャンセルしました。');return;}await load();await select(p.id);});
$('refresh').onclick=()=>task('一覧を読み込み中',async()=>{await load();if(selected)await select(selected.id);else message('一覧を更新しました。',false,'success');});
$('saveTarget').onclick=()=>task('実行対象を保存中',async()=>{await call('update',{id:selected.id,name:$('projectName').value,context:$('context').value,files:$('composeFiles').value.split('\n').map(s=>s.trim()).filter(Boolean)});await load();await select(selected.id);panel('settings');message('実行対象を保存しました。Dockerの既定Contextは変更していません。',false,'success');});
$('env').onclick=()=>task('環境変数ファイルを選択中',async()=>{const result=await call('env',selected.id);await load();await select(selected.id);panel('settings');message(result.canceled?'ファイル選択をキャンセルしました。':'環境変数ファイルの指定を保存しました。');});
$('unregister').onclick=()=>task('登録を解除中',async()=>{await call('remove',selected.id);selected=null;$('detail').hidden=true;$('empty').hidden=false;clearEdit();await load();message('管理一覧から除外しました。ファイルやコンテナは変更していません。',false,'success');});
$('diagnose').onclick=()=>task('不足ファイルを診断中',async()=>{const d=await diagnosis();message('診断を更新しました。必須の要確認 '+d.required+'件 ／ 任意 '+d.optional+'件',false,d.required?'warning':'success');});
root.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>panel(b.dataset.panel));
$('editText').oninput=()=>{$('saveFile').disabled=true;$('diff').hidden=true;};
$('preview').onclick=()=>task('差分を確認中',async()=>{if(!editing)throw Error('先にファイルを選択してください。');const r=await call('preview',selected.id,editing.token,$('editText').value);showDiff('before',r.before,r.after,'diff-removed');showDiff('after',r.after,r.before,'diff-added');$('validation').textContent=r.validation;$('diff').hidden=false;$('saveFile').disabled=false;message('変更前後の強調行を確認し、保存ボタンを押してください。');});
$('saveFile').onclick=()=>task('検証・バックアップ保存中',async()=>{const r=await call('save',selected.id,editing.token,$('editText').value);if(r.canceled){message('保存をキャンセルしました。');return;}clearEdit();await diagnosis();message('保存しました。バックアップ：'+r.backup,false,'success');});
async function operation(action){const r=await call('operation',selected.id,action);panel('operations');if(r.canceled){message('操作をキャンセルしました。');return;}$('operationOutput').textContent=r.output||r.reason;message(r.reason,!r.ok,'success');}
root.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>task(b.textContent+'を実行中',()=>operation(b.dataset.action)));
$('connection').onclick=()=>task('Docker Engineへ接続確認中',async()=>{const r=await call('connection',selected.id);$('operationOutput').textContent=r.output||r.reason;message(r.ok?'Docker Engineへの接続に成功しました。':r.reason,!r.ok,'success');});
// 配色はメイン画面の共通テーマ/CSS変数にそのまま追従する。専用テーマ管理は持たない。
(async()=>{try{await load();message('Composeファイルを登録するか、登録済みプロジェクトを選択してください。');}catch(e){message(e.message,true);}finally{root.setAttribute('aria-busy','false');}})();
