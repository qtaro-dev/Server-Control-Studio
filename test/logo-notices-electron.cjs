const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {shell,BrowserWindow,Menu}=require('electron');
module.exports=async({run,until,wc,win})=>{
 const before=win.getContentSize(),originalTheme=await run('window.__rendererCore.getTheme()');
 const opened=[],external=shell.openExternal;shell.openExternal=async url=>{opened.push(url);};
 try{
  const info=await run('window.electronAPI.getAboutInfo()'),icons=info.moduleIconAttributions,marks=info.logoNotices.entries||[];
  assert.equal(icons.items.length,19);assert.equal(new Set(icons.items.map(i=>i.id)).size,19);
  assert.equal(marks.length,4);assert.equal(new Set(marks.map(i=>i.id)).size,4);
  for(const entry of marks){
   assert.ok(entry.website.startsWith('https://'));
   assert.equal(entry.canvas,undefined,'legacy logo canvas must not decorate the generic icon');
   assert.equal(entry.downloadURL,undefined,'old official PNG URL must not be represented as a current app asset');
   assert.equal(entry.deviceTrademark,undefined,'old official-logo badge must not decorate the generic icon');
   assert.doesNotMatch(entry.text||'',/official PNG reproduced|Unmodified official logo|official logo\.png/i);
  }
  const selected=await run('Array.from(document.querySelectorAll(".module-row.is-selected"),r=>r.dataset.moduleId)');
  await run('document.querySelector(\'[data-tab="modules"]\').click()');
  assert.equal(await run('document.getElementById("moduleLogoNotices")===null'),true,'rights notice belongs in About, not below module list');
  assert.equal(await run('document.getElementById("moduleLogoLinkStatus")===null'),true);
  for(const theme of ['system','light','dark','blue','green','yellow','orange','red','pink']){
   win.setContentSize(1280,720);await run(`window.__rendererCore.applyTheme(${JSON.stringify(theme)})`);
   const report=await run(`(async()=>{const imgs=Array.from(document.querySelectorAll('.module-icon'));await Promise.all(imgs.map(i=>i.decode()));return {count:imgs.length,loaded:imgs.every(i=>i.complete&&i.naturalWidth>0),overflow:document.documentElement.scrollWidth>innerWidth,boxes:imgs.map(i=>({w:i.getBoundingClientRect().width,h:i.getBoundingClientRect().height,fit:getComputedStyle(i).objectFit})),brandDecorations:document.querySelectorAll('.module-logo-canvas,.official-logo-trademark').length}})()`);
   assert.equal(report.count,19,theme);assert.equal(report.loaded,true,theme);assert.equal(report.overflow,false,theme+' horizontal overflow');
   assert.equal(report.brandDecorations,0,theme+' obsolete official-logo decoration');
   assert.ok(report.boxes.every(b=>b.w===48&&b.h===48&&b.fit==='contain'),theme+' icon size/fit');
   if(process.env.DOCKER_BUILDER_SCREENSHOT_DIR&&['light','dark'].includes(theme)){
    fs.mkdirSync(process.env.DOCKER_BUILDER_SCREENSHOT_DIR,{recursive:true});
    await run('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    fs.writeFileSync(path.join(process.env.DOCKER_BUILDER_SCREENSHOT_DIR,'logos-'+theme+'.png'),(await wc.capturePage()).toPNG());
   }
  }
  assert.deepEqual(await run('Array.from(document.querySelectorAll(".module-row.is-selected"),r=>r.dataset.moduleId)'),selected,'theme changes preserve selection');
  assert.deepEqual(opened,[],'opening Modules and changing themes must not open external pages');

  const beforeURL=wc.getURL();
  Menu.getApplicationMenu().items[5].submenu.items[0].click();
  await until('document.getElementById("aboutDialog").open');
  await until('document.querySelector("#aboutThirdPartyNotices .about-reference-link")');
  assert.equal(await run('document.getElementById("aboutThirdPartyScroll")!==null'),true);
  assert.equal(await run('document.querySelectorAll("#aboutThirdPartyNotices details[open]").length'),0,'notices are collapsed initially');
  const noticeView=await run(`(()=>{const panel=document.getElementById('aboutThirdPartyScroll'),content=document.getElementById('aboutThirdPartyNotices'),footer=document.querySelector('.about-footer'),dialog=document.getElementById('aboutDialog');return {panelFits:panel.getBoundingClientRect().bottom<=innerHeight,overflow:getComputedStyle(panel).overflowY,scrollHeight:panel.scrollHeight,clientHeight:panel.clientHeight,contentScroll:document.querySelector('.about-content').scrollTop,footerBottom:footer.getBoundingClientRect().bottom,dialogBottom:dialog.getBoundingClientRect().bottom,buttonCount:content.querySelectorAll('button[data-reference-id]').length}})()`);
  assert.equal(noticeView.panelFits,true);assert.match(noticeView.overflow,/auto|scroll/);assert.ok(noticeView.scrollHeight>noticeView.clientHeight,'About third-party notice has its own scroll area');
  assert.ok(noticeView.buttonCount>=icons.items.length+marks.length,'fixed reference button count follows metadata');
  const scrollCheck=await run(`(()=>{const panel=document.getElementById('aboutThirdPartyScroll'),content=document.querySelector('.about-content'),footer=document.querySelector('.about-footer'),before=[content.scrollTop,footer.getBoundingClientRect().bottom];panel.scrollTop=panel.scrollHeight;return {moved:panel.scrollTop>0,outerUnchanged:content.scrollTop===before[0],footerBottom:footer.getBoundingClientRect().bottom,oldFooterBottom:before[1]}})()`);
  assert.equal(scrollCheck.moved,true);assert.equal(scrollCheck.outerUnchanged,true,'notice scroll must not move About hero/footer');assert.equal(scrollCheck.footerBottom,noticeView.footerBottom,'footer stays fixed while notice pane scrolls');

  for(const item of icons.items){
   const link=await run(`(()=>{const b=[...document.querySelectorAll('#aboutThirdPartyNotices button[data-reference-id]')].find(x=>x.dataset.referenceId===${JSON.stringify(item.id)});return b&&{id:b.dataset.referenceId,text:b.textContent}})()`);
   assert.ok(link,item.id+' fixed Tabler reference missing');assert.equal(link.text,'Tabler SVG');
   await run(`(()=>{[...document.querySelectorAll('#aboutThirdPartyNotices button[data-reference-id]')].find(x=>x.dataset.referenceId===${JSON.stringify(item.id)}).click()})()`);
   await run('window.electronAPI.getAboutInfo()');assert.equal(opened.at(-1),item.sourceUrl,item.id+' opens its pinned Tabler source');
  }
  for(const entry of marks){
   await run(`(()=>{[...document.querySelectorAll('#aboutThirdPartyNotices button[data-reference-id]')].find(x=>x.dataset.referenceId===${JSON.stringify(entry.id)}).click()})()`);
   await run('window.electronAPI.getAboutInfo()');assert.equal(opened.at(-1),entry.website,entry.id+' opens its fixed factual reference');
  }
  for(const value of ['https://attacker.invalid/','file:///C:/Windows','not-a-fixed-reference',{},null])
   assert.equal(await run(`(async()=>{try{await window.electronAPI.openLogoReference(${JSON.stringify(value)});return false}catch{return true}})()`),true,'reject untrusted reference '+String(value));
  const foreign=new BrowserWindow({show:false,webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,sandbox:true,nodeIntegration:false}});
  try{await foreign.loadURL('data:text/html,<title>Untrusted logo reference</title>');assert.equal(await foreign.webContents.executeJavaScript('(async()=>{try{await window.electronAPI.openLogoReference("nginx");return false}catch{return true}})()'),true,'other frame cannot invoke fixed references');}finally{foreign.destroy();}
  assert.equal(wc.getURL(),beforeURL,'About stays in the app window');
  assert.deepEqual(opened,[...icons.items.map(i=>i.sourceUrl),...marks.map(i=>i.website)],'only fixed metadata URLs were opened');
  console.log('PASS 19 generic module icons, 4 word-mark references, About-only notice pane, fixed-ID links, invalid/untrusted IPC rejection, 9 themes at 1280x720');
 }finally{shell.openExternal=external;await run(`window.__rendererCore.applyTheme(${JSON.stringify(originalTheme)})`);win.setContentSize(...before);}
};
