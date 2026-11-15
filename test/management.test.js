const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),fsp=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{EventEmitter}=require('node:events');
const {Projects,describe}=require('../app/management/projects'),{diagnose,completeNode}=require('../app/management/diagnostics'),{Editor}=require('../app/management/editor'),safe=require('../app/management/safe'),docker=require('../app/management/docker');
const {generateCase}=require('../scripts/lib/headless-generation.cjs');
const {groupIssues}=require('../app/management/diagnostic-view');
const {entryURL}=require('../security');
async function fixture(fn){const parent=fs.realpathSync.native(os.tmpdir()),dir=fs.mkdtempSync(path.join(parent,'dbt-manager-'));try{const root=path.join(dir,'project');fs.mkdirSync(root);const file=path.join(root,'compose.yaml');fs.writeFileSync(file,'services:\n  web:\n    image: nginx:alpine\n');await fn({dir,root,file,store:new Projects(path.join(dir,'state'))});}finally{assert.equal(path.dirname(dir),parent);fs.rmSync(dir,{recursive:true,force:true});}}
test('manager registers without Docker, persists multiple Compose order/env and unregisters without file removal',()=>fixture(async({dir,root,file,store})=>{
 const overlay=path.join(root,'extra.yaml');fs.writeFileSync(overlay,'services:\n  web:\n    environment:\n      MODE: test\n');fs.writeFileSync(path.join(root,'.env.local'),'PASSWORD=not-public\n');fs.writeFileSync(path.join(root,'.env'),'COMPOSE_PROJECT_NAME=from-env\n');
 const p=await store.register([file,overlay]);assert.equal(p.name,'from-env');assert.deepEqual((await describe(p)).services,['web']);assert.equal((await describe(p)).model.services.web.image,'nginx:alpine');await store.env(p.id,path.join(root,'.env.local'));await store.update(p.id,{name:'explicit-project',context:'desktop-linux',files:['extra.yaml','compose.yaml']});
 const reload=new Projects(path.join(dir,'state')),saved=await reload.get(p.id);assert.equal(saved.name,'explicit-project');assert.equal(saved.envFile,'.env.local');assert.deepEqual(saved.files,['extra.yaml','compose.yaml']);await reload.remove(p.id);assert.equal((await reload.list()).length,0);assert.ok(fs.existsSync(file));assert.ok(fs.existsSync(path.join(root,'.env.local')));
 await assert.rejects(store.update(p.id,{name:'x;whoami',context:'desktop-linux'}));
}));
test('manager preserves legacy Compose version during registration, diagnosis and removal',()=>fixture(async({file,store})=>{
 const original='version: "3.9"\nservices:\n  web:\n    image: nginx:alpine\n';
 fs.writeFileSync(file,original);
 const project=await store.register([file]);await describe(project);await diagnose(project);await store.remove(project.id);
 assert.equal(fs.readFileSync(file,'utf8'),original);
}));

test('manager rejects outside paths, links, invalid YAML and foreign env registration',()=>fixture(async({dir,root,file,store})=>{
 const p=await store.register([file]);await assert.rejects(safe.local(root,'../outside'));await assert.rejects(safe.local(root,'C:/outside'));await assert.rejects(safe.local(root,'.git/config'));fs.writeFileSync(path.join(dir,'.env'),'secret=x');await assert.rejects(store.env(p.id,path.join(dir,'.env')));
 const outside=path.join(dir,'outside');fs.mkdirSync(outside);fs.symlinkSync(outside,path.join(root,'link'),process.platform==='win32'?'junction':'dir');await assert.rejects(safe.local(root,'link/file',{missing:true}),/リンク/);assert.throws(()=>safe.parse('services: [broken'));assert.throws(()=>safe.parse('x: 1\nx: 2'));
 assert.throws(()=>safe.parse('__proto__:\n  polluted: true'));assert.throws(()=>safe.parse('x: &a\n  self: *a'));assert.equal({}.polluted,undefined);
}));
test('editor masks secrets, previews/restores originals, rejects stale writes and keeps backup',()=>fixture(async({dir,root,file,store})=>{
 fs.writeFileSync(file,'services:\n  web:\n    image: nginx:alpine\n    environment:\n      PASSWORD: never-show-this\n');const p=await store.register([file]),editor=new Editor(path.join(dir,'backups'));const opened=await editor.open(p,'compose.yaml');assert.ok(!opened.text.includes('never-show-this'));assert.match(opened.text,/非表示-/);
 const edited=opened.text.replace('nginx:alpine','nginx:stable'),preview=await editor.preview(p,opened.token,edited);assert.ok(!preview.before.includes('never-show-this'));assert.ok(preview.content.includes('never-show-this'));await assert.rejects(editor.preview(p,opened.token,edited.replace(/\[非表示-[^\]]+\]/,'')),/非表示行/);
 const saved=await editor.save(p,preview);assert.match(fs.readFileSync(file,'utf8'),/nginx:stable/);assert.match(fs.readFileSync(file,'utf8'),/never-show-this/);assert.match(fs.readFileSync(saved.backup,'utf8'),/nginx:alpine/);assert.equal(saved.backup.startsWith(root+path.sep),false);
 const again=await editor.open(p,'compose.yaml');fs.appendFileSync(file,'# another editor\n');await assert.rejects(editor.preview(p,again.token,again.text),/変更/);
 fs.writeFileSync(path.join(root,'.env'),'PASSWORD=x');await assert.rejects(editor.open(p,'.env'),/対象外/);
}));
test('known Node template diagnoses and completes only missing sample files without replacing existing application',()=>fixture(async({root,file,store})=>{
 const g=generateCase('nodejs','managed-node');fs.writeFileSync(file,g.compose);for(const f of g.model.files){const target=path.join(root,f.relativePath);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,f.content);}const p=await store.register([file]);let d=await diagnose(p);assert.equal(d.completions[0].kind,'node-http');assert.equal(d.issues.filter(i=>i.required).length,3);assert.equal(d.issues.find(i=>i.path==='.env').required,false);assert.equal(d.issues.filter(i=>i.path==='nodejs/package.json').length,1);assert.equal(d.issues.find(i=>i.path==='nodejs/package.json').reasons.length,2);await completeNode(p,d.completions[0].id);assert.match(fs.readFileSync(path.join(root,'nodejs/server.cjs'),'utf8'),/HTTP sample OK/);assert.ok(fs.existsSync(path.join(root,'nodejs/package-lock.json')));await assert.rejects(completeNode(p,'managed-node-nodejs'));
 fs.unlinkSync(path.join(root,'nodejs/server.cjs'));d=await diagnose(p);assert.equal(d.completions[0].kind,null);assert.ok(fs.existsSync(path.join(root,'nodejs/package.json')));
 fs.appendFileSync(path.join(root,'nodejs/Dockerfile.nodejs'),'RUN echo external\n');assert.equal((await diagnose(p)).completions.length,0);
}));
test('Docker command builder has fixed allowlist, scoped context/project/files and no destructive operation',()=>fixture(async({file,store})=>{
 const p=await store.register([file]);p.name='manager-test';p.context='desktop-linux';const args=docker.args(p,'up');assert.deepEqual(args.slice(0,3),['--context','desktop-linux','compose']);assert.ok(args.includes('--project-directory'));assert.ok(args.includes('--project-name'));assert.equal(args.at(-1),'--build');for(const forbidden of ['down','rm','prune','exec','up;whoami'])assert.throws(()=>docker.args(p,forbidden));
}));
test('Docker executor uses argument array, redacts known values and returns CLI-unavailable errors',async()=>{
 const fake=(fail=false)=>(command,args,options)=>{assert.equal(command,'docker');assert.equal(options.shell,false);assert.ok(Array.isArray(args));const c=new EventEmitter();c.stdout=new EventEmitter();c.stderr=new EventEmitter();c.kill=()=>{};process.nextTick(()=>{if(fail)c.emit('error',{code:'ENOENT'});else{c.stdout.emit('data',Buffer.from('PASSWORD=private-test-value\nprivate-test-value'));c.emit('close',0);}});return c;};
 const r=await docker.execute(['version'],{spawnProcess:fake(),redact:safe.redactor(['private-test-value'])});assert.equal(r.ok,true);assert.ok(!r.output.includes('private-test-value'));const missing=await docker.execute(['version'],{spawnProcess:fake(true)});assert.equal(missing.ok,false);assert.match(missing.reason,/見つかりません/);
 assert.equal(safe.redactor(['xy'])('xy'),'[非表示]');
});
test('diagnostic view groups normalized paths and preserves required status and multiple reasons',()=>{
 const result=groupIssues([{path:'./nodejs/package.json',message:'アプリ用',required:true},{path:'nodejs\\package.json',message:'ビルド入力用',required:true},{path:'NODEJS/package.json',message:'アプリ用',required:false},{path:'.env',message:'任意',required:false}],'win32');
 assert.equal(result.length,2);assert.deepEqual(result[0].reasons,['アプリ用','ビルド入力用']);assert.equal(result[0].required,true);assert.equal(result[1].required,false);
});
test('integrated management IPC accepts only the trusted main frame and retains method allowlist',()=>fixture(async({dir})=>{
 let handler;const frame={url:entryURL},webContents={mainFrame:frame},window={webContents,isDestroyed:()=>false};
 const installed=require('../app/management/main').install({app:{getPath:()=>dir},ipcMain:{handle:(channel,fn)=>{assert.equal(channel,'management:request');handler=fn;}},dialog:{},getWindow:()=>window});
 assert.equal(installed.open,undefined);
 for(const event of [{sender:{},senderFrame:frame},{sender:webContents,senderFrame:{url:entryURL}},{sender:webContents}])await assert.rejects(handler(event,'list'),/Untrusted/);
 assert.deepEqual(await handler({sender:webContents,senderFrame:frame},'list'),{ok:true,value:[]});
 assert.equal((await handler({sender:webContents,senderFrame:frame},'exec',{command:'whoami'})).ok,false);
 frame.url='https://example.invalid/';await assert.rejects(handler({sender:webContents,senderFrame:frame},'list'),/Untrusted/);
}));
