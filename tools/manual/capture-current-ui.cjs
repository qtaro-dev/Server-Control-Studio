// 文書用の実画面撮影。アプリは一時コピー・専用プロファイルで起動する。
// OSの保存先/確認ダイアログだけを置換し、Docker操作・既存プロジェクト操作は行わない。
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
if(!process.versions.electron){
 const {spawnSync}=require('node:child_process');
 const source=path.resolve(__dirname,'../..');
 const parent=fs.realpathSync.native(path.join(process.env.SystemRoot,'Temp'));
 const temporary=fs.mkdtempSync(path.join(parent,'dbt-manual-'));
 try{
  for(const name of ['main.js','preload.js','security.js','image-catalog.js','app-info.js','app-paths.js','user-manual.js','package.json','app'])fs.cpSync(path.join(source,name),path.join(temporary,name),{recursive:true});
  // Aboutの第三者表示も、開発版と同じ固定ファイルを隔離コピーから読む。
  fs.copyFileSync(path.join(source,'THIRD_PARTY_NOTICES.txt'),path.join(temporary,'THIRD_PARTY_NOTICES.txt'));
  fs.cpSync(path.join(source,'legal/third-party'),path.join(temporary,'legal/third-party'),{recursive:true,filter:p=>fs.statSync(p).isDirectory()||/\.(txt|html)$/.test(p)});
  fs.cpSync(path.dirname(require.resolve('yaml/package.json')),path.join(temporary,'node_modules/yaml'),{recursive:true});
  fs.copyFileSync(__filename,path.join(temporary,'capture.cjs'));
  const pkg=JSON.parse(fs.readFileSync(path.join(temporary,'package.json')));pkg.main='capture.cjs';fs.writeFileSync(path.join(temporary,'package.json'),JSON.stringify(pkg));
  const env={...process.env,DBT_MANUAL_SOURCE:source};delete env.ELECTRON_RUN_AS_NODE;
  const result=spawnSync(require('electron'),[temporary],{env,stdio:'inherit',timeout:180000});
  if(result.error)throw result.error;process.exitCode=result.status===0?0:1;
 }finally{
  assert.equal(path.dirname(temporary),parent);assert.ok(path.basename(temporary).startsWith('dbt-manual-'));
  fs.rmSync(temporary,{recursive:true,force:true,maxRetries:10,retryDelay:200});
 }
}else{
 const {app,BrowserWindow,dialog}=require('electron');
 app.setPath('userData',path.join(__dirname,'profile'));app.setPath('sessionData',path.join(__dirname,'session'));
 require('./main');
 (async()=>{
  await app.whenReady();const win=BrowserWindow.getAllWindows()[0],wc=win.webContents;
  win.setContentSize(1280,900);
  const run=s=>wc.executeJavaScript(s,true),delay=()=>new Promise(r=>setTimeout(r,50));
  const until=async s=>{for(let n=0;n<150;n++){if(await run(s))return;await delay();}throw Error('Timeout: '+s);};
  const out=path.join(process.env.DBT_MANUAL_SOURCE,'docs/manual/images');
  const evidence=path.join(process.env.DBT_MANUAL_SOURCE,'tools/manual/qa/full-refresh');fs.mkdirSync(evidence,{recursive:true});
  // 差分撮影では指定キーだけを更新し、それ以外の画像・メタデータを保持する。
  const selected=process.env.DBT_CAPTURE_KEYS?new Set(process.env.DBT_CAPTURE_KEYS.split(',').filter(Boolean)):null;
  const captures=selected?JSON.parse(fs.readFileSync(path.join(evidence,'capture.json'),'utf8')):{};
  if(selected)for(const key of selected)assert.ok(captures[key],'Unknown capture key: '+key);
  const refreshed=[];
  const shot=async name=>{
   if(selected&&!selected.has(name))return;
   await run('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
   // DOM更新だけでなくChromiumの合成フレームを待ち、前画面のキャプチャを避ける。
   await new Promise(r=>setTimeout(r,300));
   const png=(await wc.capturePage()).toPNG(),sha256=crypto.createHash('sha256').update(png).digest('hex');
   const file='ui-'+new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replaceAll('-','')+'-'+name+'-'+sha256.slice(0,10)+'.png';fs.writeFileSync(path.join(out,file),png);
   captures[name]={file,sha256,size:win.getContentSize(),state:await run('({theme:window.__rendererCore.getTheme(),tab:document.querySelector(".tabs .active").dataset.tab,dialogs:Array.from(document.querySelectorAll("dialog[open]"),d=>d.id)})')};
   refreshed.push(name);
   fs.writeFileSync(path.join(evidence,'capture.json'),JSON.stringify(captures,null,2));
  };
  const idle=()=>until('document.getElementById("tab-management").getAttribute("aria-busy")==="false"');
  const click=async id=>{await run(`document.getElementById('mgr-${id}').click()`);await idle();};
  const panel=async name=>run(`document.querySelector('#tab-management [data-panel="${name}"]').click()`);
  await until('document.querySelectorAll(".module-row").length===19');
  await until('document.getElementById("aboutVersion").textContent.includes('+JSON.stringify(require('./package.json').version)+')');
  await until('document.getElementById("aboutThirdPartyNotices").children.length>0');
  await until('document.querySelector(\'[data-tab="config"]\').dataset.tabBound==="1"');
  await run('window.__rendererCore.applyTheme("light");document.querySelector(\'.module-row[data-module-id="nodejs"]\').click()');
  await shot('modules');
  await run('document.querySelector(\'[data-tab="config"]\').click();document.getElementById("projectNameInput").value="nodejs-basic";const port=document.querySelector(\'input[data-field-name="hostPort"]\');port.value="18080";port.dispatchEvent(new Event("change",{bubbles:true}))');
  await shot('config');
  await run('document.querySelectorAll(".module-review-checkbox").forEach(c=>c.click());document.getElementById("generateButton").click();document.querySelector(\'[data-tab="output"]\').click()');
  await until('document.getElementById("composeOutput").value.startsWith("services:")');await shot('output');
  assert.ok((await run('document.getElementById("composeOutput").value')).includes('18080:3000'));
  await run('document.getElementById("generatedFileSelect").value="1";document.getElementById("generatedFileSelect").dispatchEvent(new Event("change"))');await shot('node-files');
  await run('document.getElementById("generatedFileSelect").value="0";document.getElementById("generatedFileSelect").dispatchEvent(new Event("change"));document.getElementById("generationGuideButton").click()');
  await until('document.getElementById("generationGuideDialog").open');await shot('guide');
  await run('document.getElementById("generationGuideCloseButton").click()');
  const destination=path.join(__dirname,'DockerProjects');fs.mkdirSync(destination);
  dialog.showOpenDialog=async()=>({canceled:false,filePaths:[destination]});
  await run('document.getElementById("generatedBundleSaveBtn").click()');
  await until('document.getElementById("generatedSaveStatus").textContent.includes("nodejs-basic")');
  const compose=path.join(destination,'nodejs-basic/docker-compose.yml');assert.ok(fs.existsSync(compose));
  // 不足診断の実画面は専用の不完全データで撮影し、生成した原本3点は別フォルダへ保全する。
  const initial=path.join(destination,'initial-generated-node');fs.mkdirSync(initial);
  for(const name of ['package.json','package-lock.json','server.cjs'])fs.renameSync(path.join(destination,'nodejs-basic/nodejs',name),path.join(initial,name));
  await run('document.querySelector(\'[data-tab="management"]\').click()');await idle();
  dialog.showOpenDialog=async()=>({canceled:false,filePaths:[compose]});
  dialog.showMessageBox=async()=>({response:0});
  await click('register');await shot('diagnosis');
  const external=path.join(__dirname,'external-example');fs.mkdirSync(external);fs.writeFileSync(path.join(external,'compose.yaml'),'services:\n  static:\n    image: nginx:alpine\n');
  dialog.showOpenDialog=async()=>({canceled:false,filePaths:[path.join(external,'compose.yaml')]});await click('register');await shot('project-list');
  await run('document.querySelector("#mgr-projects button").click()');await idle();
  await run('window.__rendererCore.applyTheme("dark")');await shot('diagnosis-dark');
  await run('window.__rendererCore.applyTheme("light");document.querySelector("#mgr-completion button").click()');await idle();await shot('completed');
  await run('Array.from(document.querySelectorAll("#mgr-fileList button")).find(b=>b.textContent.startsWith("nodejs/server.cjs")).click()');await idle();
  await run('document.getElementById("mgr-editText").value+="\\n// HTTP確認用の説明コメント\\n";document.getElementById("mgr-editText").dispatchEvent(new Event("input",{bubbles:true}))');await click('preview');await shot('edit');
  await click('saveFile');const backup=await run('document.getElementById("mgr-status").textContent.split("バックアップ：")[1]');assert.ok(backup&&fs.existsSync(backup));await shot('backup');
  await panel('settings');await shot('target');
  await panel('operations');await shot('operations');
  await run('window.__rendererCore.applyTheme("dark")');await shot('operations-dark');
  win.setContentSize(1280,720);await shot('management-720');
  win.setContentSize(1280,900);
  await run('window.__rendererCore.applyTheme("light");window.__rendererUI.resetConfiguration();document.querySelector(\'[data-tab="modules"]\').click()');
  for(const id of ['nginx','nodejs','mysql'])await run(`document.querySelector('.module-row[data-module-id="${id}"]').click()`);
  await shot('selected-light');await run('window.__rendererCore.applyTheme("dark")');await shot('selected-dark');
  await run('window.__rendererCore.applyTheme("light");document.querySelector(\'[data-tab="config"]\').click();window.scrollTo(0,0)');await shot('accordion');
  // 確認件数とマスク表示はMySQL単体の専用入力で撮影する。
  await run('window.__rendererUI.resetConfiguration();document.querySelector(\'[data-tab="modules"]\').click();document.querySelector(\'.module-row[data-module-id="mysql"]\').click();document.querySelector(\'[data-tab="config"]\').click();document.getElementById("projectNameInput").value="mysql-basic";document.querySelectorAll(\'input[type="password"]\').forEach(i=>{i.value="sample-only-not-secret";i.dispatchEvent(new Event("input",{bubbles:true}))});document.querySelector(".module-review-checkbox").click();window.scrollTo(0,0)');await shot('confirmed');
  await run('const db=document.querySelector(\'input[data-field-name="database"]\');db.value="example_changed";db.dispatchEvent(new Event("input",{bubbles:true}))');await shot('review-reset');
  await run('document.querySelector(\'section.card[data-module-id="mysql"]\').scrollIntoView({block:"start"})');await shot('password');
  await run('window.scrollTo(0,0);window.__rendererUI.openSettingsDialog()');await until('document.getElementById("settingsDialog").open');
  await run('document.getElementById("settingsInitializePathsButton").click()');await until('!document.getElementById("settingsInitializePathsButton").disabled');await shot('folders');
  await run('document.getElementById("settingsProjectRootPath").value="missing-folder";document.getElementById("settingsSaveButton").click()');
  await until('!document.getElementById("settingsSaveError").hidden&&!document.getElementById("settingsSaveButton").disabled');await shot('folder-error');
  await run('document.getElementById("settingsCloseButton").click()');await until('!document.getElementById("settingsDialog").open');
  await run('window.__rendererUI.openSettingsDialog()');await until('document.getElementById("settingsDialog").open');
  await run('document.querySelector(\'[data-section="appearance"]\').click();document.querySelector(\'.settings-theme-card[data-theme-id="blue"]\').click()');await shot('theme-select');
  await run('document.getElementById("settingsApplyThemeButton").click()');await until('!document.getElementById("settingsCloseButton").disabled');
  assert.equal(await run('window.__rendererCore.getTheme()'),'blue');await shot('theme-applied');
  await run('document.getElementById("settingsCloseButton").click()');await until('!document.getElementById("settingsDialog").open');
  await run('window.__rendererCore.applyTheme("light")');
  require('electron').Menu.getApplicationMenu().items[5].submenu.items[0].click();await until('document.getElementById("aboutDialog").open&&document.querySelector(".about-illustration").complete');
  if(selected)win.setContentSize(1280,720);
  await shot('about');
  if(selected)win.setContentSize(1280,900);
  await run('document.getElementById("aboutCloseButton").click()');await until('!document.getElementById("aboutDialog").open');
  // レシピの設定値を唯一の入力元にし、旧画面の構成入力/出力画像も更新する。
  const recipes=require(path.join(process.env.DBT_MANUAL_SOURCE,'tools/manual/recipe-inputs.json'));
  for(const id of recipes.map(r=>r.id)){
   const recipe=recipes.find(r=>r.id===id);assert.ok(recipe);
   await run('window.__rendererCore.applyTheme("light");window.__rendererUI.resetConfiguration();document.querySelector(\'[data-tab="modules"]\').click()');
   for(const module of recipe.modules)await run(`document.querySelector('.module-row[data-module-id="${module}"]').click()`);
   await run(`document.querySelector('[data-tab="config"]').click();document.getElementById('projectNameInput').value=${JSON.stringify(recipe.projectName)}`);
   for(const [module,fields] of Object.entries(recipe.configs))for(const [name,value] of Object.entries(fields)){
    await run(`(()=>{const section=document.querySelector('section.card[data-module-id="${module}"]');const field=section.querySelector('input[data-field-name="${name}"],select[data-field-name="${name}"]');if(!field)throw Error('Missing field ${name}');if(field.type==='checkbox')field.checked=${JSON.stringify(value)};else field.value=${JSON.stringify(String(value))};field.dispatchEvent(new Event('change',{bubbles:true}));if(${JSON.stringify(name)}==='framework'){const toggle=section.querySelector('.framework-toggle-checkbox');toggle.checked=${JSON.stringify(value)}==='flask';toggle.dispatchEvent(new Event('change',{bubbles:true}));}})()`);
   }
   await shot(id+'-config');
   await run('document.querySelectorAll(".module-review-checkbox").forEach(c=>c.click());document.getElementById("generateButton").click();document.querySelector(\'[data-tab="output"]\').click()');
   await until('document.getElementById("composeOutput").value.startsWith("services:")');
   const expected=path.join(__dirname,'expected',id);fs.mkdirSync(expected,{recursive:true});
   require(path.join(process.env.DBT_MANUAL_SOURCE,'scripts/lib/manual-recipe-generation.cjs')).prepare(recipe,expected);
   assert.equal(await run('document.getElementById("composeOutput").value'),fs.readFileSync(path.join(expected,'docker-compose.yml'),'utf8'),id+' UI/recipe output equality');
   await shot(id+'-output');
  }
  if(selected)assert.equal(refreshed.length,selected.size);
  console.log('Captured '+refreshed.length+' changed screens; retained '+(Object.keys(captures).length-refreshed.length)+' others; all 35 recipe UI outputs match generation; real file backup verified; no Docker commands.');
  app.exit(0);
 })().catch(e=>{console.error(e);app.exit(1)});
}

