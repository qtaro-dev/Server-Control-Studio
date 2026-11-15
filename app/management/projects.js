const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {parse,read,local,privateFile}=require('./safe');
const validName=n=>typeof n==='string'&&/^[a-z0-9][a-z0-9_-]{0,99}$/.test(n);
async function describe(project){
 let model={services:{}};const notices=[];
 const merge=(a,b)=>{const result={...a};for(const [key,value]of Object.entries(b||{}))result[key]=value&&typeof value==='object'&&!Array.isArray(value)?merge(a?.[key]&&typeof a[key]==='object'?a[key]:{},value):value;return result;};
 for(const relative of project.files){const data=parse(await read(project.root,relative));if(data.services&&(typeof data.services!=='object'||Array.isArray(data.services)))throw Error('servicesはサービス定義のオブジェクトで指定してください。');model=merge(model,data);if(data.include||data.extends||Object.values(data.services||{}).some(s=>s?.extends))notices.push('include/extendsはDocker構成検証で解決してください。登録時には外部参照を実行しません。');}
 return {services:Object.keys(model.services),notices,model};
}
class Projects{
 constructor(directory){this.directory=directory;this.file=path.join(directory,'projects-v1.json');this.items=null;}
 async list(){if(!this.items){try{const data=JSON.parse(await fs.readFile(this.file,'utf8'));if(data.version!==1||!Array.isArray(data.projects))throw Error('登録情報の形式が不正です。');this.items=data.projects;}catch(e){if(e.code!=='ENOENT')throw e;this.items=[];}}return this.items;}
 async save(){await fs.mkdir(this.directory,{recursive:true});const tmp=this.file+'.'+crypto.randomUUID()+'.tmp';await fs.writeFile(tmp,JSON.stringify({version:1,projects:this.items},null,2),{flag:'wx'});await fs.rename(tmp,this.file);}
 async get(id){const p=(await this.list()).find(p=>p.id===id);if(!p)throw Error('登録済みプロジェクトを選択してください。');return p;}
 async register(paths){
  if(!Array.isArray(paths)||!paths.length||paths.length>10)throw Error('Composeは1～10ファイルで指定してください。');
  const full=await Promise.all(paths.map(p=>fs.realpath(p))),root=path.dirname(full[0]);if(full.some(p=>path.dirname(p)!==root))throw Error('複数Composeは同じ親フォルダ内で選択してください。');
  const files=full.map(p=>path.basename(p));if(new Set(files).size!==files.length||files.some(p=>!/^.+\.ya?ml$/i.test(p)))throw Error('ComposeのYAMLファイルを指定してください。');
  const combined=await describe({root,files});let name=combined.model.name;
  // 既存プロジェクトのCOMPOSE_PROJECT_NAMEも考慮する。値の読取りだけでDockerは呼ばない。
  try{const env=await read(root,'.env');const match=env.match(/^\s*(?:export\s+)?COMPOSE_PROJECT_NAME\s*=\s*([^\r\n#]+)\s*$/m);if(match){const value=match[1].trim().replace(/^['"]|['"]$/g,'');if(validName(value))name=value;}}catch{}
  if(!validName(name))name=path.basename(root).toLowerCase().replace(/[^a-z0-9_-]/g,'').replace(/^[^a-z0-9]+/,'').slice(0,90)||'managed-project';
  const entry={id:crypto.randomUUID(),root,files,name,context:process.platform==='win32'?'desktop-linux':'default',envFile:null};
  await describe(entry);const items=await this.list();const existing=items.find(p=>p.root===root&&JSON.stringify(p.files)===JSON.stringify(files));if(existing)return existing;items.push(entry);await this.save();return entry;
 }
 async update(id,patch){const p=await this.get(id);if(!validName(patch.name)||typeof patch.context!=='string'||!/^[-a-zA-Z0-9_.]{1,100}$/.test(patch.context))throw Error('プロジェクト名またはContextが不正です。');if(patch.files){if(!Array.isArray(patch.files)||patch.files.length!==p.files.length||JSON.stringify([...patch.files].sort())!==JSON.stringify([...p.files].sort()))throw Error('Composeの順序だけを変更できます。追加・変更時は登録し直してください。');p.files=[...patch.files];}p.name=patch.name;p.context=patch.context;await this.save();return p;}
 async env(id,absolute){const p=await this.get(id);if(absolute===null)p.envFile=null;else{const full=await fs.realpath(absolute);const relative=path.relative(p.root,full).split(path.sep).join('/');await local(p.root,relative);if(!privateFile(relative)||!path.basename(relative).startsWith('.env'))throw Error('プロジェクト内の.env系ファイルを選択してください。');p.envFile=relative;}await this.save();return p;}
 async remove(id){this.items=(await this.list()).filter(p=>p.id!==id);await this.save();}
}
module.exports={Projects,describe,validName};
