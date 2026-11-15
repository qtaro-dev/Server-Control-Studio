const fs=require('node:fs/promises'),path=require('node:path');
const {describe}=require('./projects'),safe=require('./safe');
const {groupIssues}=require('./diagnostic-view');
async function diagnose(project){
 const {model,services,notices}=await describe(project);const files=new Map(project.files.map(p=>[p,{path:p,editable:true}])),issues=[],completions=[];
 const add=async(relative,purpose,{required=true}={})=>{try{const full=await safe.local(project.root,relative,{missing:true});const s=await fs.stat(full).catch(()=>null);if(s?.isFile())files.set(relative,{path:relative,editable:!safe.privateFile(relative),purpose});else if(!s)issues.push({path:relative,message:purpose+' がありません。',required});return Boolean(s);}catch{issues.push({path:relative,message:'プロジェクト外・変数を含むパス・リンクのため自動処理しません。手動で配置を確認してください。',required});return false;}};
 await add('.env','環境変数ファイル（任意）',{required:false});
 for(const env of project.envFile?[project.envFile]:[])await add(env,'選択した環境変数ファイル');
 for(const group of ['configs','secrets'])for(const item of Object.values(model[group]||{})){if(typeof item?.file==='string'){const relative=item.file.replace(/^\.\//,'');await add(relative,group+' の参照ファイル');if(group==='secrets'&&files.has(relative))files.get(relative).editable=false;}}
 for(const [service,config] of Object.entries(model.services)){
  const build=config.build;if(build){const context=typeof build==='string'?build:build.context||'.';const dockerfile=typeof build==='object'?build.dockerfile||'Dockerfile':'Dockerfile';
   const normalize=s=>s.replace(/^\.\//,'');const relative=normalize(path.posix.join(context,dockerfile));
   if(await add(relative,service+' のDockerfile')){
    await add(relative+'.dockerignore','専用dockerignore（任意）',{required:false});
    const text=await safe.read(project.root,relative);
    // 不明な外部Dockerfileを推測しない。現行ジェネレーターの既知の内容と完全照合する。
    const generation=require('../src/project-generation'),versions=require('../src/image-versions'),catalog=require('../data/image-catalog.json');
    const knownNode=context==='./nodejs'&&versions.candidates(catalog,'nodejs').some(entry=>generation.dockerfile('nodejs',{},entry).trim()===text.replaceAll('\r\n','\n').trim());
    if(knownNode){let source='server.cjs';try{const pkg=JSON.parse(await safe.read(project.root,normalize(path.posix.join(context,'package.json'))));const match=pkg.scripts?.dev?.match(/^node\s+(?:\.\/)?([\w./-]+\.(?:js|cjs|mjs))$/);source=match?match[1]:null;if(!match)notices.push(service+'：scripts.devの起動ソースは自動判定できません。手動で確認してください。');}catch{}
     const required=['package.json','package-lock.json',...(source?[source]:[])];const missing=[];let any=false;
     for(const name of required){const rel=normalize(path.posix.join(context,name));if(!await add(rel,service+' のNode.jsアプリ'))missing.push(rel);else any=true;}
     if(missing.length)completions.push({id:service,kind:!any&&missing.length===3?'node-http':null,paths:missing,reason:!any?'既知のNode.jsテンプレートです。依存なしのHTTPサンプル（3000番）を追加できます。':'既存のアプリファイルがあります。互換性を推測して置換せず、対応するソース/lockfileを利用者が用意してください。'});
    }
    for(const line of text.split(/\r?\n/).filter(l=>/^\s*(?:COPY|ADD)\s+/i.test(l)&&!l.includes('--from='))){
     let sources=line.replace(/^\s*(?:COPY|ADD)\s+/i,'').trim();if(sources.startsWith('[')){try{sources=JSON.parse(sources).slice(0,-1);}catch{issues.push({path:relative,message:'COPY/ADDのJSON形式を確認してください。'});continue;}}else sources=sources.split(/\s+/).slice(0,-1);
     for(const source of sources){if(source==='.'||source.startsWith('--'))continue;if(/[*?$]|https?:/.test(source)){notices.push(service+'：動的/外部COPY・ADD参照は自動診断の対象外です。');continue;}const rel=normalize(path.posix.join(context,source.replace(/\/$/,'')));await add(rel,service+' のビルド入力');try{const publicIndex=path.posix.join(rel,'index.html'),full=await safe.local(project.root,publicIndex);if((await fs.stat(full)).isFile())files.set(publicIndex,{path:publicIndex,editable:true,purpose:'初期HTML'});}catch{}}
    }
   }
  }
  for(const env of config.env_file?Array.isArray(config.env_file)?config.env_file:[config.env_file]:[]){const value=typeof env==='string'?env:env.path;if(value)await add(value.replace(/^\.\//,''),'サービス環境変数ファイル',{required:typeof env==='string'||env.required!==false});}
  for(const v of config.volumes||[]){const source=typeof v==='string'?v.split(':')[0]:v.source;if(!source||!source.startsWith('.'))continue;const rel=source.replace(/^\.\//,'');try{const target=await safe.local(project.root,rel,{missing:true});const s=await fs.stat(target).catch(()=>null);if(!s)issues.push({path:rel,message:service+' のバインドマウント元がありません。'});else if(s.isFile())files.set(rel,{path:rel,editable:!safe.privateFile(rel),purpose:'バインド設定ファイル'});else if(s.isDirectory())await add(path.posix.join(rel,'index.html'),'公開ページ（任意）',{required:false});}catch{issues.push({path:rel,message:'マウント元は安全なプロジェクト内パスとして扱えません。'});}}
 }
 return {services,files:[...files.values()],issues:groupIssues(issues),completions,notices:[...new Set(notices)]};
}
function nodeSample(){const pkg={name:'docker-builder-http-sample',version:'1.0.0',private:true,scripts:{dev:'node server.cjs'}};return {'nodejs/package.json':JSON.stringify(pkg,null,2)+'\n','nodejs/package-lock.json':JSON.stringify({name:pkg.name,version:pkg.version,lockfileVersion:3,requires:true,packages:{'':pkg}},null,2)+'\n','nodejs/server.cjs':"// 構築確認専用の最小HTTPアプリ。業務アプリではありません。\nconst http=require('node:http');\nhttp.createServer((_req,res)=>{res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'});res.end('Server Control Studio HTTP sample OK');}).listen(3000,'0.0.0.0');\n"};}
async function completeNode(project,service){const diagnosis=await diagnose(project);if(!diagnosis.completions.some(c=>c.id===service&&c.kind==='node-http'))throw Error('安全に補完できる既知の未作成Node.js構成ではありません。');const created=[];try{for(const [relative,content] of Object.entries(nodeSample())){const target=await safe.local(project.root,relative,{missing:true});await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,content,{flag:'wx'});created.push(target);}}catch(e){for(const target of created)await fs.unlink(target);throw e;}return diagnose(project);}
module.exports={diagnose,nodeSample,completeNode};
