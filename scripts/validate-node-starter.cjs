// 今回生成した専用Composeだけで3配置方式を確認。既存Dockerリソースは操作しない。
const fs=require('node:fs'),path=require('node:path'),net=require('node:net'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const {loadModules}=require('./lib/headless-generation.cjs'),generation=require('../app/src/project-generation'),catalog=require('../app/data/image-catalog.json'),{renderComposeYaml}=require('../app/src/compose-serialization');
const root=path.resolve(process.argv[2]||'release/validation-final-fixes/docker');
const modes=['image','bind','named'],rows=[],stamp=Date.now().toString(36);
function command(args,dir,log){const result=spawnSync('docker',['--context','desktop-linux',...args],{cwd:dir,encoding:'utf8',timeout:240000,windowsHide:true,maxBuffer:8*1024*1024});fs.appendFileSync(log,'docker '+args.join(' ')+'\n'+(result.stdout||'')+(result.stderr||'')+'\n');if(result.status!==0)throw new Error('Docker command failed: '+args.join(' ')+'; '+(result.error?.message||result.stderr));return result.stdout;}
function port(){return new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>resolve(n));});});}
(async()=>{
 fs.mkdirSync(root,{recursive:true});
 const before=command(['ps','-a','--format','{{.ID}} {{.Names}}'],root,path.join(root,'environment.log'));
 for(const mode of modes){
  const directory=path.join(root,mode);if(fs.existsSync(directory))throw new Error('Test output exists: '+directory);fs.mkdirSync(directory);
  const project='dbt-r1-'+stamp+'-'+mode,hostPort=await port(),log=path.join(directory,'docker.log'),row={mode,project,hostPort,status:'FAIL',cleanup:'NOT_RUN'};rows.push(row);
  const modules=loadModules().filter(m=>m.id==='nodejs'),configs=new Map(modules.map(m=>[m.id,{...Object.fromEntries(m.fields.map(f=>[f.name,f.default??''])),generateStarter:true,dataStoreType:mode,hostPort}]));
  const output=generation.build({modules,configs,catalog,projectName:project});assert.deepEqual(output.errors,[]);
  fs.writeFileSync(path.join(directory,'docker-compose.yml'),renderComposeYaml(output));for(const file of output.files){const target=path.resolve(directory,file.relativePath);assert.ok(target.startsWith(directory+path.sep));fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,file.content);}
  const args=['compose','--project-name',project,'--file',path.join(directory,'docker-compose.yml')];
  try {
   command([...args,'config','-q'],directory,log);row.compose='PASS';
   command([...args,'build'],directory,log);row.build='PASS';
   command([...args,'up','-d'],directory,log);row.up='PASS';
   const deadline=Date.now()+90000;let response,body;
   while(Date.now()<deadline){try{response=await fetch('http://127.0.0.1:'+hostPort,{signal:AbortSignal.timeout(3000)});body=await response.text();if(response.status===200&&body.includes('Server Control Studio Node.js startup OK'))break;}catch{}await new Promise(r=>setTimeout(r,1000));}
   assert.equal(response?.status,200);assert.ok(body?.includes('Server Control Studio Node.js startup OK'));row.http={status:response.status,body};
   command([...args,'ps'],directory,log);row.status='OK';
  }catch(error){row.error=error.message;}
  finally {
   try{command([...args,'logs','--no-color','--tail','50'],directory,log);}catch{}
   try{command([...args,'down','--volumes','--remove-orphans'],directory,log);row.cleanup='PASS';}catch(error){row.cleanup='FAIL';row.status='FAIL';row.cleanupError=error.message;}
   fs.writeFileSync(path.join(root,'results.json'),JSON.stringify(rows,null,2));
  }
 }
 const after=command(['ps','-a','--format','{{.ID}} {{.Names}}'],root,path.join(root,'environment.log'));assert.deepEqual(after.trim().split('\n').sort(),before.trim().split('\n').sort(),'Existing containers remain untouched');
 console.log(JSON.stringify(rows,null,2));if(rows.some(r=>r.status!=='OK'||r.cleanup!=='PASS'))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
