const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const safe=require('./safe'),{diagnose}=require('./diagnostics');
class Editor{
 constructor(backupDirectory){if(!path.isAbsolute(backupDirectory||''))throw Error('バックアップ先が未設定です。');this.backupDirectory=backupDirectory;this.sessions=new Map();}
 async open(project,relative){const d=await diagnose(project);if(!d.files.some(f=>f.path===relative&&f.editable)||safe.privateFile(relative))throw Error('このファイルは編集対象外です。機密ファイルは外部エディターで管理してください。');const original=await safe.read(project.root,relative),masked=safe.mask(original),token=crypto.randomUUID();this.sessions.set(token,{id:project.id,relative,original,hash:safe.hash(original),masked,created:Date.now()});if(this.sessions.size>30)this.sessions.delete(this.sessions.keys().next().value);return {token,path:relative,text:masked.text,notice:'非表示行には機密値が保持されています。行の削除・複製・変更はできません。'};}
 async preview(project,token,text){const state=this.sessions.get(token);if(!state||state.id!==project.id||Date.now()-state.created>3600000)throw Error('編集セッションを開き直してください。');if(typeof text!=='string'||Buffer.byteLength(text)>1024*1024)throw Error('編集内容が大きすぎます。');if(safe.hash(await safe.read(project.root,state.relative))!==state.hash)throw Error('元ファイルが別の処理で変更されました。開き直してください。');const content=safe.restore(text,state.masked.hidden);let validation='静的確認のみ。Dockerfile/設定ファイルの完全な検証はビルド・起動時に行ってください。';
  if(/\.ya?ml$/i.test(state.relative)){safe.parse(content);validation='YAML構文：正常。Composeファイルは保存前にDockerでも構成検証します。';}
  if(/\.json$/i.test(state.relative)){try{JSON.parse(content);}catch{throw Error('JSON構文が不正です。');}validation='JSON構文：正常';}
  if(/\.(?:cjs|js)$/i.test(state.relative)&&!/^\s*(?:import|export)\s/m.test(content)){try{new (require('node:vm').Script)(content);}catch{throw Error('JavaScript構文が不正です。コードは実行していません。');}validation='JavaScript構文：正常（コードは未実行）';}
  if(/(?:^|\/)Dockerfile(?:\.|$)/.test(state.relative)&&!state.relative.endsWith('.dockerignore')&&!/^\s*FROM\s+\S+/mi.test(content))throw Error('DockerfileにFROMがありません。');
  const after=safe.mask(content);if(after.hidden.length!==state.masked.hidden.length)throw Error('初期版では機密値行の追加・編集を扱いません。外部エディターで管理してください。');
  return {state,content,text,validation,before:state.masked.text};
 }
 async save(project,prepared){const {state,content}=prepared;if(safe.hash(await safe.read(project.root,state.relative))!==state.hash)throw Error('保存確認後に元ファイルが変更されました。開き直してください。');const target=await safe.local(project.root,state.relative),suffix=crypto.randomUUID(),backup=path.join(this.backupDirectory,safe.hash(project.root),suffix,...state.relative.split('/')),tmp=target+'.dbt-edit-'+suffix;
  // バックアップはuserDataへ分離し、COPY . . のビルドコンテキストに混入させない。
  await fs.mkdir(path.dirname(backup),{recursive:true});
  await fs.copyFile(target,backup,fs.constants.COPYFILE_EXCL);try{await fs.writeFile(tmp,content,{flag:'wx'});await safe.local(project.root,state.relative);if(safe.hash(await safe.read(project.root,state.relative))!==state.hash)throw Error('保存中に元ファイルが変更されました。');await fs.rename(tmp,target);}catch(e){await fs.unlink(tmp).catch(()=>{});throw Error('保存できませんでした。元ファイルとバックアップを保持しています。');}
  for(const [key,value]of this.sessions)if(value===state)this.sessions.delete(key);return {backup};
 }
}
module.exports={Editor};
