// About の実Electron表示、独立通知スクロール、全文展開、固定リンクを検証する。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Menu, shell, BrowserWindow } = require('electron');
const luminance = rgb => rgb.match(/[\d.]+/g).slice(0,3).map(v=>{
  const c = Number(v)/255; return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;
}).reduce((total,c,i)=>total+c*[.2126,.7152,.0722][i],0);
const contrast = (a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);

module.exports = async ({ run, until, wc, win }) => {
  const originalTheme = await run('window.__rendererCore.getTheme()');
  const originalSize = win.getContentSize();
  if (process.env.DOCKER_BUILDER_SCREENSHOT_DIR) fs.mkdirSync(process.env.DOCKER_BUILDER_SCREENSHOT_DIR, {recursive:true});
  const external = shell.openExternal;
  const opened = [];
  const target = require('./app-info').describeApp().projectURL;
  shell.openExternal = async url=>{opened.push(url);};
  const open = async ()=>{
    Menu.getApplicationMenu().items[5].submenu.items[0].click();
    await until('document.getElementById("aboutDialog").open');
    await until('document.querySelector(".about-illustration").complete && document.querySelector(".about-illustration").naturalWidth > 0');
    await until('document.querySelector("#aboutThirdPartyNotices .about-reference-link")');
  };
  const close = async ()=>{
    await run('document.getElementById("aboutCloseButton").click()');
    await until('!document.getElementById("aboutDialog").open');
  };
  try {
    win.setContentSize(1280,720);
    const appInfo = require('./app-info').describeApp();
    await open();
    await until(`document.getElementById('aboutVersion').textContent===${JSON.stringify(appInfo.displayVersion)} && document.getElementById('aboutLicense').textContent.includes(${JSON.stringify(appInfo.license)})`);
    assert.equal(await run('document.getElementById("aboutTitle").textContent'), 'Server Control Studio');
    assert.equal(await run('document.querySelector(".about-subtitle").textContent'), 'Docker 構成ジェネレーター');
    assert.equal(await run('document.getElementById("aboutLogPath").textContent'), path.join(__dirname, 'docker-builder.log'));
    const themes = await run('window.__rendererCore.themes.map(t=>t[0])');
    assert.equal(themes.length,9);
    for (const theme of themes) {
      await run(`window.__rendererCore.applyTheme(${JSON.stringify(theme)})`);
      const layout = await run(`(() => {
        const dialog=document.getElementById('aboutDialog'),content=document.querySelector('.about-content'),panel=document.getElementById('aboutThirdPartyScroll'),img=document.querySelector('.about-illustration'),footer=document.querySelector('.about-footer');
        const rect=dialog.getBoundingClientRect(),ir=img.getBoundingClientRect(),fr=footer.getBoundingClientRect();
        const pairs=['#aboutTitle','.about-subtitle','#aboutDescription','.about-details dt','#aboutProjectLink','.about-log-path'].map(s=>[
          getComputedStyle(document.querySelector(s)).color,getComputedStyle(document.querySelector(s).closest('.about-hero')||dialog).backgroundColor]);
        return { inside: rect.top>=0 && rect.bottom<=innerHeight && rect.left>=0 && rect.right<=innerWidth,
          noHorizontal:content.scrollWidth<=content.clientWidth && panel.scrollWidth<=panel.clientWidth,
          panelFits:panel.getBoundingClientRect().bottom<=innerHeight,
          panelScroll:getComputedStyle(panel).overflowY, panelHasOverflow:panel.scrollHeight>panel.clientHeight,
          imageFits:ir.left>=rect.left && ir.right<=rect.right && ir.top>=rect.top && ir.bottom<=rect.bottom,
          imageRatio:ir.width/ir.height, originalRatio:img.naturalWidth/img.naturalHeight,
          objectFit:getComputedStyle(img).objectFit, footerVisible:fr.top>=rect.top && fr.bottom<=rect.bottom, pairs };
      })()`);
      assert.equal(layout.inside,true,theme+' dialog fits 1280x720');
      assert.equal(layout.noHorizontal,true,theme+' no horizontal overflow');
      assert.equal(layout.panelFits,true,theme+' notice panel is inside About');
      assert.match(layout.panelScroll,/auto|scroll/,theme+' notice panel scrolls independently');
      assert.equal(layout.panelHasOverflow,true,theme+' notice content exceeds its scroll viewport');
      assert.equal(layout.imageFits,true,theme+' illustration fits');
      assert.ok(Math.abs(layout.imageRatio-layout.originalRatio)<.001,theme+' illustration aspect ratio');
      assert.equal(layout.objectFit,'contain');
      assert.equal(layout.footerVisible,true,theme+' close footer stays visible');
      for(const pair of layout.pairs)assert.ok(contrast(...pair)>=4.5,theme+' About text contrast');
      await run('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
      if(process.env.DOCKER_BUILDER_SCREENSHOT_DIR)fs.writeFileSync(path.join(process.env.DOCKER_BUILDER_SCREENSHOT_DIR,'about-'+theme+'.png'),(await wc.capturePage()).toPNG());
    }

    const info = await run('window.electronAPI.getAboutInfo()');
    assert.equal(typeof info.thirdPartyNotices,'string');
    assert.ok(info.thirdPartyNotices.length>0,'aggregate third-party notice is supplied');
    assert.ok(Array.isArray(info.thirdPartyDocuments));
    const docFiles = info.thirdPartyDocuments.map(d=>d.file);
    assert.equal(new Set(docFiles).size,docFiles.length,'fixed document names are unique');
    assert.deepEqual([...docFiles].sort(),info.logoNotices.documents.map(d=>d.file).sort(),'every manifest-allowlisted document is displayed and none are omitted');
    for (const required of ['TABLER-ICONS-LICENSE.txt','Electron-LICENSE.txt','LICENSES.chromium.html']) assert.ok(docFiles.includes(required),'About includes '+required);
    for (const item of info.thirdPartyDocuments) {
      assert.ok(/^[A-Za-z0-9._-]+\.(?:txt|html)$/.test(item.file), 'fixed basename only');
      assert.ok(item.text.length>0, item.file+' is read from the fixture package');
      await run(`(()=>{const d=[...document.querySelectorAll('#aboutThirdPartyNotices details[data-document-file]')].find(x=>x.dataset.documentFile===${JSON.stringify(item.file)});if(d)d.open=true})()`);
      await until(`(()=>{const d=[...document.querySelectorAll('#aboutThirdPartyNotices details[data-document-file]')].find(x=>x.dataset.documentFile===${JSON.stringify(item.file)});return !!d?.querySelector('pre')})()`);
      const expanded = await run(`(()=>[...document.querySelectorAll('#aboutThirdPartyNotices details[data-document-file]')].find(x=>x.dataset.documentFile===${JSON.stringify(item.file)})?.querySelector('pre')?.textContent??null)()`);
      assert.equal(expanded,item.text,item.file+' displays its complete source text');
    }
    const noticeLabel=info.logoNotices.copyrightNoticeLabel;
    await run(`(()=>{const d=[...document.querySelectorAll('#aboutThirdPartyNotices details')].find(x=>x.querySelector('summary')?.textContent===${JSON.stringify(noticeLabel)});if(d)d.open=true})()`);
    await until(`(()=>{const d=[...document.querySelectorAll('#aboutThirdPartyNotices details')].find(x=>x.querySelector('summary')?.textContent===${JSON.stringify(noticeLabel)});return !!d?.querySelector('pre')})()`);
    const noticesExpanded = await run(`(()=>[...document.querySelectorAll('#aboutThirdPartyNotices details')].find(x=>x.querySelector('summary')?.textContent===${JSON.stringify(noticeLabel)})?.querySelector('pre')?.textContent??null)()`);
    assert.equal(noticesExpanded,info.thirdPartyNotices,'aggregate notice expands to the complete supplied text');

    const beforeURL = wc.getURL();
    await run('document.getElementById("aboutProjectLink").click()');
    await until('document.getElementById("aboutLinkStatus").textContent===""');
    await run('window.electronAPI.getAboutInfo()');
    assert.deepEqual(opened,[target]);
    assert.equal(wc.getURL(),beforeURL);
    await run('window.electronAPI.openProjectPage("file:///C:/Windows/notepad.exe")');
    assert.deepEqual(opened,[target,target], 'Caller URL must be ignored');
    shell.openExternal = async ()=>{throw new Error('simulated browser failure');};
    await run('document.getElementById("aboutProjectLink").click()');
    await until('document.getElementById("aboutLinkStatus").textContent.includes("ブラウザを開けませんでした")');
    assert.equal(await run('document.getElementById("aboutDialog").open'),true);
    await close();
    await open();
    win.focus();wc.focus();
    wc.sendInputEvent({type:'keyDown',keyCode:'ESC'});wc.sendInputEvent({type:'keyUp',keyCode:'ESC'});
    await until('!document.getElementById("aboutDialog").open');
    const foreign = new BrowserWindow({show:false,webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,sandbox:true,nodeIntegration:false}});
    try {
      await foreign.loadURL('data:text/html,<title>About IPC boundary</title>');
      for(const operation of ['getAboutInfo','openProjectPage'])assert.equal(await foreign.webContents.executeJavaScript(`(async()=>{try{await window.electronAPI.${operation}();return false;}catch{return true;}})()`),true);
    } finally {foreign.destroy();}
    win.setContentSize(480,480);
    await open();
    assert.equal(await run('document.getElementById("aboutDialog").getBoundingClientRect().bottom<=innerHeight && document.querySelector("#aboutThirdPartyScroll").scrollHeight>document.querySelector("#aboutThirdPartyScroll").clientHeight'),true);
    await close();
    console.log('PASS About: nine themes at 1280x720, independently scrolling notice area, full notice/document expansion, fixed project URL, failure/close/Escape and untrusted IPC');
  } finally {
    shell.openExternal=external;
    await run(`document.getElementById('aboutDialog').close();window.__rendererCore.applyTheme(${JSON.stringify(originalTheme)})`);
    win.setContentSize(...originalSize);
  }
};
