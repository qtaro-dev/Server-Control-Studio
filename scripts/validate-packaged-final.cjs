// 実配布EXEを専用フォルダで起動し、CDPで表示/生成/設定の永続化を検査する。
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),net=require('node:net');
const executable=path.resolve(process.argv[2]),mode=process.argv[3],output=path.resolve(process.argv[4]);
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function port(){return new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});}
async function launch(round){
 const p=await port(),env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 const child=spawn(executable,['--remote-debugging-port='+p,'--user-data-dir='+path.join(output,'browser-profile')],{env,windowsHide:false,stdio:'ignore'});
 let ws,session=0;const pending=new Map();
 try{
  let target;for(let i=0;i<120;i++){try{const tabs=await(await fetch('http://127.0.0.1:'+p+'/json/list')).json();target=tabs.find(t=>t.type==='page'&&t.url.startsWith('file:'));if(target)break;}catch{}await delay(500);}
  assert.ok(target,'Actual EXE renderer is reachable');ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  ws.onmessage=event=>{const r=JSON.parse(event.data);if(pending.has(r.id)){const f=pending.get(r.id);pending.delete(r.id);r.error?f.reject(new Error(JSON.stringify(r.error))):f.resolve(r.result);}};
  ws.onclose=()=>{for(const f of pending.values())f.reject(new Error('Test renderer closed'));pending.clear();};
  const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++session;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const run=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  for(let i=0;i<120;i++){if(await run('document.querySelectorAll(".module-row").length===19&&!!window.__rendererGenerate&&!!document.querySelector("[data-tab=config]").dataset.tabBound'))break;await delay(100);}
  const about=await run('window.electronAPI.getAboutInfo()');assert.equal(about.version,'0.1.0');assert.ok(about.thirdPartyDocuments.length>=14);
  assert.equal(await run('document.querySelectorAll(".module-row").length'),19);
  if(round===1){
   await run(`window.__rendererUI.resetConfiguration();['nginx','mariadb','nodejs'].forEach(id=>document.querySelector('.module-row[data-module-id="'+id+'"]').click());document.querySelector('[data-tab=config]').click();document.getElementById('projectNameInput').value='myapp';document.querySelectorAll('.module-review-checkbox').forEach(c=>{if(!c.checked)c.click()});window.__rendererGenerate.generateConfigs();document.querySelector('[data-tab=output]').click()`);
   assert.ok((await run('document.getElementById("composeOutput").value')).startsWith('services:\n'));
   const files=await run('window.GeneratedFiles.all().map(f=>f.relativePath)');for(const f of ['nodejs/package.json','nodejs/package-lock.json','nodejs/server.cjs','nginx/conf/default.conf'])assert.ok(files.includes(f),f);
   // Optional real native folder selection. No dialog is stubbed in this packaged-EXE check.
   if(mode==='portable'&&process.env.DBT_NATIVE_BUNDLE_PARENT){
    const parent=path.resolve(process.env.DBT_NATIVE_BUNDLE_PARENT),workspace=path.resolve(__dirname,'..');
    assert.ok(parent.startsWith(workspace+path.sep+'release'+path.sep),'Native-save fixture must stay under release');
    fs.mkdirSync(parent,{recursive:true});
    await run(`(async()=>{const settings=await window.electronAPI.getSettings();await window.electronAPI.saveSettings({paths:{...settings.paths,projectRoot:${JSON.stringify(parent)}}})})()`);
    const generated=await run('[{relativePath:"docker-compose.yml",content:document.getElementById("composeOutput").value},...window.GeneratedFiles.all()]');
    fs.writeFileSync(path.join(output,'native-save-awaiting.json'),JSON.stringify({parent,projectName:'myapp'}));
    const saved=await run('window.electronAPI.saveGeneratedBundle([{relativePath:"docker-compose.yml",content:document.getElementById("composeOutput").value},...window.GeneratedFiles.all()],"myapp")');
    assert.ok(!saved.error&&!saved.canceled,JSON.stringify(saved));
    for(const file of generated)assert.equal(fs.readFileSync(path.join(parent,'myapp',file.relativePath),'utf8'),file.content);
    fs.writeFileSync(path.join(output,'native-save-result.json'),JSON.stringify({success:true,files:generated.length,directory:path.join(parent,'myapp')},null,2));
   }
   if(mode==='portable')await run('window.electronAPI.saveSettings({theme:"green",defaultProjectName:"portable-check"})');
  }else if(mode==='portable'){
   const settings=await run('window.electronAPI.getSettings()');assert.equal(settings.theme,'green');assert.equal(settings.defaultProjectName,'portable-check');assert.equal(await run('window.__rendererCore.getTheme()'),'green');
  }
  fs.writeFileSync(path.join(output,'round-'+round+'.json'),JSON.stringify({mode,round,version:about.version,logPath:about.logFilePath,modules:19,success:true},null,2));
  await run('window.close()').catch(()=>{});ws.close();
  for(let i=0;i<100;i++){if(child.exitCode!==null)break;await delay(100);}
  // Portableのランチャーはrendererより早く終了する場合がある。別のアプリをkillしない。
 }finally{if(ws?.readyState===1)ws.close();}
}
(async()=>{fs.mkdirSync(output,{recursive:true});await launch(1);if(mode==='portable'){await delay(1000);await launch(2);}console.log('PASS actual '+mode+' EXE: 19 modules, generation, About'+(mode==='portable'?', settings save/restart persistence':''));})().catch(e=>{console.error(e);process.exitCode=1});
