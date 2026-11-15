const {spawn}=require('node:child_process'),fs=require('node:fs/promises'),path=require('node:path');
const safe=require('./safe');
const actions={validate:['config','-q'],up:['up','-d','--build'],stop:['stop'],restart:['restart'],build:['build'],rebuild:['build','--no-cache'],status:['ps','--all','--format','json'],logs:['logs','--no-color','--tail','150']};
async function secrets(project){const values=[],files=['.env',project.envFile,...project.files].filter(Boolean);try{const {model}=await require('./projects').describe(project);for(const s of Object.values(model.services)){for(const e of s.env_file?Array.isArray(s.env_file)?s.env_file:[s.env_file]:[]){const p=typeof e==='string'?e:e.path;if(p)files.push(p.replace(/^\.\//,''));}for(const [key,value]of Object.entries(s.environment||{}))if(safe.secretName.test(key)&&typeof value==='string'&&!value.includes('${'))values.push(value);}}catch{}
 for(const f of [...new Set(files)]){try{const text=await safe.read(project.root,f);values.push(...safe.mask(text).values);if(path.basename(f).startsWith('.env'))for(const line of text.split(/\r?\n/)){const m=line.match(/^\s*(?:export\s+)?([\w]+)\s*=\s*(.*)$/);if(m&&m[2].length>=3)values.push(m[2].replace(/^['"]|['"]$/g,''));}}catch{/* 任意.env・欠落ファイルはconfigで診断する。 */}}return values;}
function environment(){const result={};for(const key of ['PATH','Path','PATHEXT','SystemRoot','WINDIR','TEMP','TMP','HOME','USERPROFILE','APPDATA','LOCALAPPDATA','ProgramFiles','ProgramFiles(x86)','ProgramW6432','ProgramData','DOCKER_CONFIG'])if(process.env[key])result[key]=process.env[key];return result;}
function execute(args,{cwd,timeout=120000,redact=safe.redactor(),onProgress=()=>{},spawnProcess=spawn}={}){
 return new Promise(resolve=>{let output='',settled=false,timedOut=false,overflow=false;const child=spawnProcess('docker',args,{cwd,env:environment(),shell:false,windowsHide:true,stdio:['ignore','pipe','pipe']});
  const finish=result=>{if(settled)return;settled=true;clearTimeout(timer);resolve({...result,output:redact(output),timedOut,overflow});};
  const timer=setTimeout(()=>{timedOut=true;child.kill();},timeout);
  const append=chunk=>{output+=chunk.toString();if(output.length>2*1024*1024){overflow=true;output=output.slice(-200000);child.kill();}};
  child.stdout.on('data',append);child.stderr.on('data',append);child.on('error',e=>finish({ok:false,code:null,reason:e.code==='ENOENT'?'Docker CLIが見つかりません。Docker Desktopをインストールし、PATH反映後にアプリを再起動してください。':'Dockerを実行できません。実行権限を確認してください。'}));
  child.on('close',code=>finish({ok:code===0&&!timedOut&&!overflow,code,reason:timedOut?'制限時間を超えました。Docker側の状態を再確認してください。':overflow?'ログが上限を超えました。':code===0?'完了':'Docker Engineへの接続・Context・構成内容を確認してください。'}));onProgress({state:'running'});
 });
}
function args(project,action,files=project.files){if(!actions[action])throw Error('許可されていないDocker操作です。');const a=['--context',project.context,'compose','--project-directory',project.root,'--project-name',project.name];for(const f of files)a.push('-f',path.join(project.root,f));if(project.envFile)a.push('--env-file',path.join(project.root,project.envFile));a.push(...actions[action]);return a;}
async function run(project,action,options={}){for(const f of project.files)await safe.local(project.root,f);if(project.envFile)await safe.local(project.root,project.envFile);return execute(args(project,action,options.files),{...options,cwd:project.root,timeout:['up','build','rebuild'].includes(action)?10*60000:120000,redact:safe.redactor(await secrets(project))});}
async function connection(context,options={}){if(!/^[-a-zA-Z0-9_.]{1,100}$/.test(context))throw Error('Contextが不正です。');return execute(['--context',context,'version','--format','{{json .}}'],options);}
module.exports={actions,args,run,connection,execute,secrets};
