// 実配布EXEを隔離プロファイルで起動し、公開済みRenderer APIと実UIを検査する。
// Docker操作・既存設定の変更・ダイアログのスタブは行わない。
const fs=require('node:fs'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),pkg=require('../../package.json');
const exe=path.resolve(process.argv[2]||''),out=path.resolve(process.argv[3]||'');
const portable=process.argv.includes('--portable'),hold=process.argv.includes('--hold');
assert.ok(exe.startsWith(path.join(root,'release')+path.sep));
assert.ok(out.startsWith(path.join(root,'release')+path.sep));
fs.mkdirSync(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const port=()=>new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>resolve(n))})});
async function connect(debugPort){
 for(let n=0;n<120;n++){
  try{
   const targets=await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(r=>r.json());
   const page=targets.find(t=>t.type==='page'&&t.url.includes('/app/index.html'));
   if(page){
    const ws=new WebSocket(page.webSocketDebuggerUrl),pending=new Map();let id=0;
    ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result)}});
    await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
    const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
    const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
    return {ws,send,run};
   }
  }catch{}
  await pause(250);
 }
 throw Error('Packaged renderer did not expose the dedicated test endpoint');
}
async function launch(label){
 const debugPort=await port(),env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 delete env.PORTABLE_EXECUTABLE_DIR;delete env.PORTABLE_EXECUTABLE_FILE;
 const profile=path.join(out,'profile');
 // Portableランチャーが設定する永続ルートを、テスト専用EXEの場所に限定する。
 if(portable)env.PORTABLE_EXECUTABLE_DIR=path.dirname(exe);
 const child=spawn(exe,[`--user-data-dir=${profile}`,`--remote-debugging-port=${debugPort}`,'--remote-debugging-address=127.0.0.1'],{env,windowsHide:!hold,stdio:'ignore'});
 const c=await connect(debugPort);c.child=child;c.debugPort=debugPort;
 for(let n=0;n<120;n++){if(await c.run('Boolean(window.__rendererUI&&window.__rendererCore&&document.querySelectorAll(".module-row").length===19)'))break;await pause(100);}
 const settingsPath=await c.run('window.electronAPI.getSettingsPath()');
 assert.equal(path.dirname(settingsPath).toLowerCase(),path.dirname(exe).toLowerCase(),'Settings must stay in the dedicated executable directory');
 c.capture=async name=>{const r=await c.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,label+'-'+name+'.png'),Buffer.from(r.data,'base64'))};
 return c;
}
async function close(c){
 // Portableの親ランチャーPIDをアプリ本体と混同せず、接続した画面だけを閉じる。
 await Promise.race([c.run('window.close()').catch(()=>{}),pause(1000)]);c.ws.close();
 for(let n=0;n<40;n++){try{await fetch(`http://127.0.0.1:${c.debugPort}/json/list`)}catch{return}await pause(200)}
 throw Error('Dedicated packaged test application did not close');
}
(async()=>{
 const report={version:pkg.version,format:portable?'portable':'installed',nativeSaveDialog:'NOT_RUN',nativeManualMenu:'NOT_RUN'};
 let c=await launch('first');const {run}=c;
 const info=await run('window.electronAPI.getAboutInfo()');assert.equal(info.version,pkg.version);
 await run('window.__rendererUI.openAboutDialog()');await pause(150);
 assert.equal(await run('document.getElementById("aboutVersion").textContent'),`${pkg.version} Release ${pkg.release.number}`);
 await c.capture('about');report.about=true;
 await run('document.getElementById("aboutCloseButton").click()');
 const images=await run('(async()=>{const a=[...document.querySelectorAll(".module-icon")];await Promise.all(a.map(i=>i.decode()));return a.length===19&&a.every(i=>i.naturalWidth>0)})()');assert.ok(images);report.images=19;
 await run('window.__rendererUI.resetConfiguration();document.querySelector(\'[data-tab="modules"]\').click();for(const id of ["nginx","nodejs"])document.querySelector(`.module-row[data-module-id="${id}"]`).click();document.querySelector(\'[data-tab="config"]\').click();document.getElementById("projectNameInput").value="packaged-validation";document.querySelectorAll(".module-review-checkbox").forEach(c=>c.click());document.getElementById("generateButton").click();document.querySelector(\'[data-tab="output"]\').click()');
 const compose=await run('document.getElementById("composeOutput").value');assert.ok(compose.startsWith('services:')&&compose.includes('nodejs'));assert.ok(!/^version:/m.test(compose));fs.writeFileSync(path.join(out,'generated-compose.yml'),compose);report.generation=true;
 await c.capture('output');
 await run('window.__rendererUI.openSettingsDialog()');await pause(150);
 await run('document.querySelector(\'[data-section="appearance"]\').click();document.querySelector(\'.settings-theme-card[data-theme-id="blue"]\').click();document.getElementById("settingsApplyThemeButton").click()');
 for(let n=0;n<100;n++){if(await run('!document.getElementById("settingsCloseButton").disabled'))break;await pause(100);}
 assert.equal(await run('window.__rendererCore.getTheme()'),'blue');await run('document.getElementById("settingsCloseButton").click()');
 report.settingsSaved=true;await close(c);
 c=await launch('restart');assert.equal(await c.run('window.__rendererCore.getTheme()'),'blue');report.restartPersistence=true;
 await c.capture('modules');
 if(hold){report.debugPort=c.debugPort;report.pid=c.child.pid;c.ws.close();}
 else await close(c);
 fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 // UI確認中も親セッションを維持し、実行環境による子プロセス回収を避ける。
 if(hold&&c.child.exitCode===null)await new Promise(resolve=>c.child.once('exit',resolve));
})().catch(e=>{console.error(e);process.exitCode=1});
