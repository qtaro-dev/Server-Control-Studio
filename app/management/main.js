const path=require('node:path'),fs=require('node:fs/promises'),crypto=require('node:crypto');
const {assertTrustedSender}=require('../../security');
const {Projects,describe}=require('./projects'),{diagnose,completeNode,nodeSample}=require('./diagnostics'),{Editor}=require('./editor'),docker=require('./docker'),safe=require('./safe');
function install({app,ipcMain,dialog,getWindow}){
 const projects=new Projects(path.join(app.getPath('userData'),'compose-management')),editor=new Editor(path.join(app.getPath('userData'),'compose-management','backups'));const active=new Set();
 const confirm=async(title,message,detail)=>{const r=await dialog.showMessageBox(getWindow(),{type:'warning',title,message,detail,buttons:['実行する','キャンセル'],defaultId:1,cancelId:1,noLink:true});return r.response===0;};
 const handlers={
  list:async()=>Promise.all((await projects.list()).map(async p=>{try{const d=await describe(p);return {...p,services:d.services};}catch{return {...p,services:[],error:'構成ファイルが見つからないか、読み取れません。登録解除は元ファイルを削除しません。'};}})),
  register:async()=>{const r=await dialog.showOpenDialog(getWindow(),{title:'Composeファイルを選択（複数の場合は基底→上書きの順）',properties:['openFile','multiSelections'],filters:[{name:'Compose YAML',extensions:['yml','yaml']}]});if(r.canceled)return {canceled:true};return projects.register(r.filePaths);},
  update:async({id,name,context,files})=>projects.update(id,{name,context,files}),
  env:async({id})=>{const r=await dialog.showOpenDialog(getWindow(),{title:'プロジェクト内の.envファイルを選択',properties:['openFile','showHiddenFiles']});if(r.canceled)return {canceled:true};return projects.env(id,r.filePaths[0]);},
  remove:async({id})=>{await projects.remove(id);return {ok:true};},
  inspect:async({id})=>diagnose(await projects.get(id)),
  connection:async({id})=>{const p=await projects.get(id);return docker.connection(p.context);},
  operation:async({id,action})=>{
   const p=structuredClone(await projects.get(id));if(!docker.actions[action])throw Error('許可されていない操作です。');if(active.has(id))throw Error('このプロジェクトは処理中です。完了を待ってください。');
   const label={up:'起動',stop:'停止',restart:'再起動',build:'ビルド',rebuild:'再構築'}[action]||action;
   if(!['validate','status','logs'].includes(action)&&!await confirm('Docker操作の確認',`${p.name}：${label}`,`Context: ${p.context}\n作業フォルダ: ${p.root}\nCompose: ${p.files.join(' → ')}\n.env: ${p.envFile||'.env（存在する場合）'}\nこの構成のコード/イメージ/ホストマウントを信頼する場合のみ実行してください。起動・ビルドでは外部取得やComposeの指定したコード実行が発生します。ボリューム削除は実行しません。`))return {canceled:true};
   if(active.has(id))throw Error('このプロジェクトは処理中です。');active.add(id);try{return await docker.run(p,action);}finally{active.delete(id);}
  },
  open:async({id,path:relative})=>editor.open(await projects.get(id),relative),
  preview:async({id,token,text})=>{const result=await editor.preview(await projects.get(id),token,text);return {before:result.before,after:result.text,validation:result.validation};},
  save:async({id,token,text})=>{
   if(active.has(id))throw Error('Docker処理の完了後に保存してください。');const p=await projects.get(id),prepared=await editor.preview(p,token,text);
   if(p.files.includes(prepared.state.relative)){
    const relative='.dbt-validate-'+crypto.randomUUID()+'.yaml',temporary=await safe.local(p.root,relative,{missing:true});await fs.writeFile(temporary,prepared.content,{flag:'wx'});
    try{const files=p.files.map(f=>f===prepared.state.relative?relative:f),r=await docker.run(p,'validate',{files});if(!r.ok)throw Error('保存前のCompose構成検証に失敗しました：'+r.reason+'\n'+r.output);}finally{await fs.unlink(temporary);}
   }
   if(!await confirm('構成ファイルの保存',prepared.state.relative+' をバックアップして保存しますか？',prepared.validation+'\n差分プレビューを確認してください。既存バックアップは削除しません。'))return {canceled:true};
   return editor.save(p,prepared);
  },
  complete:async({id,service})=>{const p=await projects.get(id);if(active.has(id))throw Error('Docker処理中は補完できません。');const d=await diagnose(p);if(!d.completions.some(c=>c.id===service&&c.kind==='node-http'))throw Error('この構成は自動補完できません。');if(!await confirm('不足ファイルの補完','最小HTTPサンプルを追加しますか？',Object.entries(nodeSample()).map(([f,c])=>f+'\n'+c).join('\n\n')+'\n業務アプリの自動生成ではありません。既存ファイルは置換しません。'))return {canceled:true};return completeNode(p,service);},
 };
 ipcMain.handle('management:request',async(event,method,input={})=>{
  assertTrustedSender(event,getWindow());
  try{if(!Object.hasOwn(handlers,method)||!input||typeof input!=='object'||Array.isArray(input))throw Error('不正な操作です。');return {ok:true,value:await handlers[method](input)};}catch(e){return {ok:false,error:safe.redactor()(e.message)};}
 });
 return {projects,editor};
}
module.exports={install};
