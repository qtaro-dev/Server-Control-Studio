const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {BrowserWindow,Menu,dialog}=require('electron');
module.exports=async({run,wc,win})=>{
 const root=path.join(__dirname,'managed-fixture');fs.mkdirSync(path.join(root,'nodejs'),{recursive:true});
 const source=process.env.DOCKER_BUILDER_SOURCE_ROOT,g=require(path.join(source,'scripts/lib/headless-generation.cjs')).generateCase('nodejs','managed-ui');
 fs.writeFileSync(path.join(root,'compose.yaml'),g.compose);for(const f of g.model.files)fs.writeFileSync(path.join(root,f.relativePath),f.content);
 fs.writeFileSync(path.join(root,'override.yaml'),'services:\n  managed-ui-nodejs:\n    environment:\n      MODE: test\n');
 const external=path.join(__dirname,'external-compose');fs.mkdirSync(external);fs.writeFileSync(path.join(external,'compose.yaml'),'services:\n  static:\n    image: nginx:alpine\n');
 const originalOpen=dialog.showOpenDialog,originalMessage=dialog.showMessageBox,docker=require('./app/management/docker'),originalRun=docker.run,originalConnection=docker.connection;
 let dockerCalls=0,connectionCalls=0,failConfig=false,selection=[path.join(root,'compose.yaml'),path.join(root,'override.yaml')],confirmResponse=0;
 const actions=[];
 docker.run=async(project,action,options)=>{dockerCalls++;actions.push(action);assert.equal(project.root,root);if(action==='validate'&&options?.files){assert.ok(options.files.some(f=>f.startsWith('.dbt-validate-')));if(failConfig)return {ok:false,output:'simulated invalid configuration',reason:'検証失敗'};}return {ok:true,output:'fixture Docker response (simulated)',reason:'完了'};};
 docker.connection=async()=>{connectionCalls++;return {ok:true,output:'simulated connected',reason:'完了'};};
 dialog.showOpenDialog=async()=>({canceled:false,filePaths:selection});dialog.showMessageBox=async()=>({response:confirmResponse});
 const until=async code=>{for(let i=0;i<100;i++){if(await run(code))return;await new Promise(r=>setTimeout(r,50));}throw Error('Manager timeout: '+code+'; '+await run('document.getElementById("mgr-status").textContent'));};
 const idle=()=>until('document.getElementById("tab-management").getAttribute("aria-busy")==="false"');
 const click=async id=>{await run('document.getElementById('+JSON.stringify('mgr-'+id)+').click()');await idle();};
 const internal=async name=>run('document.querySelector("#tab-management [data-panel='+name+']").click()');
 try{
  assert.deepEqual(await run('Array.from(document.querySelectorAll(".tabs .tab-button")).map(b=>b.textContent.trim())'),['モジュール','構成入力','生成結果','Docker環境管理']);
  assert.equal(Menu.getApplicationMenu().items.some(i=>i.label==='Docker環境管理'),false);
  assert.equal(BrowserWindow.getAllWindows().length,1);
  const title=win.getTitle();
  await run('document.getElementById("composeOutput").value="generator compose draft";document.getElementById("dockerfileOutput").value="generator file draft";document.querySelector("[data-tab=management]").click()');await idle();
  assert.equal(await run('document.getElementById("tab-management").classList.contains("active")'),true);
  assert.equal(await run('typeof window.managementAPI.operation'), 'function');
  assert.equal(await run('window.managementAPI.invoke===undefined&&window.managementAPI.exec===undefined'),true);
  const prefs=wc.getLastWebPreferences();assert.equal(prefs.nodeIntegration,false);assert.equal(prefs.contextIsolation,true);assert.equal(prefs.sandbox,true);
  await click('register');await until('!document.getElementById("mgr-detail").hidden&&document.querySelector("#mgr-completion button")');assert.equal(dockerCalls,0);
  assert.match(await run('document.getElementById("mgr-diagnosisSummary").textContent'),/必須.*3件.*任意.*1件/);
  const paths=await run('Array.from(document.querySelectorAll("#mgr-issues code")).map(e=>e.textContent)');assert.equal(new Set(paths).size,paths.length);
  assert.equal(await run('Array.from(document.querySelectorAll("#mgr-issues>li")).find(e=>e.querySelector("code").textContent==="nodejs/package.json").querySelectorAll("ul li").length'),2);
  await click('diagnose');assert.equal(await run('document.getElementById("mgr-status").dataset.state'),'warning');
  assert.equal(await run('document.getElementById("mgr-settings").hidden'),true);
  confirmResponse=1;await run('document.querySelector("#mgr-completion button").click()');await idle();assert.equal(fs.existsSync(path.join(root,'nodejs/server.cjs')),false);
  confirmResponse=0;await run('document.querySelector("#mgr-completion button").click()');await idle();assert.ok(fs.existsSync(path.join(root,'nodejs/server.cjs')));assert.equal(dockerCalls,0);
  await click('diagnose');assert.equal(await run('document.getElementById("mgr-status").dataset.state'),'success');
  fs.writeFileSync(path.join(root,'.env'),'PASSWORD=ui-private-value\n');await click('diagnose');
  assert.equal(await run('Array.from(document.querySelectorAll("#mgr-fileList button")).find(b=>b.textContent.startsWith(".env")).disabled'),true);
  await internal('settings');await run('document.getElementById("mgr-projectName").value="managed-edited";document.getElementById("mgr-context").value="desktop-linux";document.getElementById("mgr-composeFiles").value="override.yaml\\ncompose.yaml"');await click('saveTarget');
  assert.equal(await run('document.getElementById("mgr-settings").hidden'),false);
  selection=[path.join(root,'.env')];await click('env');assert.equal(await run('document.getElementById("mgr-envName").textContent'),'.env');
  await click('refresh');assert.equal(await run('document.getElementById("mgr-projectName").value'),'managed-edited');
  assert.equal(await run('document.getElementById("mgr-composeFiles").value'),'override.yaml\ncompose.yaml');
  await run('Array.from(document.querySelectorAll("#mgr-fileList button")).find(b=>b.textContent.startsWith("nodejs/server.cjs")).click()');await idle();
  await run(String.raw`document.getElementById('mgr-editText').value+='\n// UI edit test\n';document.getElementById('mgr-editText').dispatchEvent(new Event('input'))`);
  const draft=await run('document.getElementById("mgr-editText").value');
  for(const tab of ['modules','config','output','management']){await run('document.querySelector("[data-tab='+tab+']").click()');assert.equal(await run('document.querySelectorAll(".tabs .tab-button.active").length'),1);assert.equal(await run('document.querySelectorAll(".app-main>.tab-content.active").length'),1);}
  assert.equal(await run('document.getElementById("mgr-editText").value'),draft);
  assert.equal(await run('document.getElementById("composeOutput").value'),'generator compose draft');assert.equal(await run('document.getElementById("dockerfileOutput").value'),'generator file draft');
  await internal('operations');await internal('editor');assert.equal(await run('document.getElementById("mgr-editText").value'),draft);
  await click('preview');assert.equal(await run('document.getElementById("mgr-diff").hidden'),false);assert.equal(await run('document.getElementById("mgr-after").textContent.includes("UI edit test")'),true);
  await click('saveFile');assert.match(fs.readFileSync(path.join(root,'nodejs/server.cjs'),'utf8'),/UI edit test/);
  const backup=await run('document.getElementById("mgr-status").textContent.split("バックアップ：")[1]');assert.ok(fs.existsSync(backup));assert.equal(backup.startsWith(root+path.sep),false);
  await internal('operations');await click('connection');assert.equal(connectionCalls,1);
  docker.connection=async()=>({ok:false,output:'simulated unavailable',reason:'Dockerに接続できません。'});await click('connection');assert.equal(await run('document.getElementById("mgr-status").dataset.state'),'error');assert.match(await run('document.getElementById("mgr-status").textContent'),/^エラー/);
  docker.connection=async()=>({ok:true,output:'simulated connected',reason:'完了'});
  for(const action of ['validate','up','stop','restart','build','rebuild','status','logs']){await run('document.querySelector("#tab-management [data-action='+action+']").click()');await idle();assert.match(await run('document.getElementById("mgr-operationOutput").textContent'),/simulated/);}
  assert.equal(dockerCalls,8);
  await run('(async()=>{const list=await window.managementAPI.list();window.__managerProject=list.value[0];window.__composeEdit=(await window.managementAPI.open(window.__managerProject.id,"compose.yaml")).value;})()');
  const composeBefore=fs.readFileSync(path.join(root,'compose.yaml'),'utf8');failConfig=true;
  assert.equal(await run(String.raw`window.managementAPI.save(window.__managerProject.id,window.__composeEdit.token,window.__composeEdit.text+'\n# compose edit\n').then(r=>r.ok)`),false);assert.equal(fs.readFileSync(path.join(root,'compose.yaml'),'utf8'),composeBefore);
  failConfig=false;const saved=await run(String.raw`window.managementAPI.save(window.__managerProject.id,window.__composeEdit.token,window.__composeEdit.text+'\n# compose edit\n')`);assert.equal(saved.ok,true);assert.ok(fs.existsSync(saved.value.backup));assert.equal(dockerCalls,10);
  selection=[path.join(external,'compose.yaml')];await click('register');assert.equal(await run('document.querySelectorAll("#mgr-projects button").length'),2);assert.equal(dockerCalls,10);
  await run('document.querySelector("#mgr-projects button").click()');await idle();
  const shots=path.join(source,'release/management-tab-ui');fs.mkdirSync(shots,{recursive:true});
  for(const [width,height]of [[1280,720],[1920,1080]]){
   win.setContentSize(width,height);
   for(const theme of ['system','light','dark','blue','green','yellow','orange','red','pink']){
    await run('window.__rendererCore.applyTheme('+JSON.stringify(theme)+');new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true);
    assert.equal(await run('document.querySelector(".manager-layout").getBoundingClientRect().bottom<=innerHeight'),true);
    assert.equal(await run('document.querySelector("#mgr-projects button").getAttribute("aria-current")'), 'true');
    for(const name of ['configuration','editor','operations','settings']){await internal(name);assert.equal(await run('document.querySelector("#tab-management [data-panel='+name+']").getAttribute("aria-selected")'),'true');assert.equal(await run('document.getElementById("mgr-'+name+'").hidden'),false);}
    if(['light','dark'].includes(theme)){await internal('configuration');await run('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');fs.writeFileSync(path.join(shots,theme+'-'+width+'x'+height+'.png'),(await wc.capturePage()).toPNG());}
    const primary=await run('getComputedStyle(document.getElementById("mgr-register")).backgroundColor'),normal=await run('getComputedStyle(document.getElementById("mgr-refresh")).backgroundColor');assert.notEqual(primary,normal);
   }
   if(width===1920)assert.ok(await run('document.querySelector(".app-main").getBoundingClientRect().width>1800'));
   for(const name of ['configuration','editor','operations','settings']){await internal(name);const element=name==='configuration'?'diagnose':name==='editor'?'preview':name==='operations'?'connection':'saveTarget';await run('document.getElementById("mgr-'+element+'").scrollIntoView({block:"nearest"});new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');assert.equal(await run('(()=>{const b=document.getElementById("mgr-'+element+'").getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight})()'),true);}
  }
  await run('document.getElementById("mgr-projectRoot").textContent="C:/long-project-path/".repeat(80)');assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true);
  assert.equal(await run('document.getElementById("tab-management").textContent.includes("ui-private-value")'),false);
  assert.equal(BrowserWindow.getAllWindows().length,1);assert.equal(win.getTitle(),title);
  await click('unregister');assert.ok(fs.existsSync(path.join(root,'compose.yaml')));assert.equal(dockerCalls,10);
  await run('document.querySelector("#mgr-projects button").click()');await idle();await click('unregister');assert.ok(fs.existsSync(path.join(external,'compose.yaml')));
  win.setContentSize(1280,720);await run('window.__rendererCore.applyTheme("dark");document.querySelector("[data-tab=modules]").click();window.__rendererUI.clearResultsOnly()');
  assert.equal(await run('getComputedStyle(document.querySelector(".app-main")).maxWidth'),'1400px');assert.equal(await run('getComputedStyle(document.body).display'),'block');
 }finally{docker.run=originalRun;docker.connection=originalConnection;dialog.showOpenDialog=originalOpen;dialog.showMessageBox=originalMessage;}
 console.log('PASS integrated four tabs/no extra window, generator/manager draft separation, deduplicated required/optional diagnostics, source completion, editor/diff/backup, all simulated Docker actions, settings persistence, nine shared themes at 1280x720/1920x1080, unregister safety');
};
