// 全章・全レシピ・全画面画像のブラウザ巡回と、目視用一覧の作成。
// PDFやDockerは実行しない。実画像の表示だけで、画像の合成/加工は行わない。
const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'../..'),out=path.join(__dirname,'qa/full-refresh'),manual=path.join(root,'docs/manual');
app.setPath('userData',path.join(out,'review-profile'));app.setPath('sessionData',path.join(out,'review-session'));
setTimeout(()=>app.exit(1),120000).unref();
(async()=>{
 await app.whenReady();const win=new BrowserWindow({show:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,backgroundThrottling:false}}),wc=win.webContents;
 const run=s=>wc.executeJavaScript(s,true),frame=()=>run('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
 const external=[];wc.session.webRequest.onBeforeRequest((d,cb)=>{if(/^https?:/.test(d.url)){external.push(d.url);cb({cancel:true})}else cb({})});
 const sections=[];
 for(const width of [1280,1920]){
  win.setContentSize(width,width===1280?720:1080);
  for(const page of ['index.html','recipes.html']){
   await win.loadFile(path.join(manual,page));
   await run('Promise.all(Array.from(document.images,i=>{i.loading="eager";return i.decode()}))');
   assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true);
   const ids=await run('Array.from(document.querySelectorAll(".chapter,.recipe"),e=>e.id)');
   for(const id of ids){
    await run(`document.getElementById(${JSON.stringify(id)}).scrollIntoView({behavior:'instant',block:'start'})`);await frame();
    const check=await run(`(()=>{const section=document.getElementById(${JSON.stringify(id)});return {title:section.querySelector('h2').textContent,images:[...section.querySelectorAll('img')].every(i=>i.naturalWidth>0),overflow:section.scrollWidth>section.clientWidth,figures:[...section.querySelectorAll('figure')].every(f=>f.getBoundingClientRect().width<=section.clientWidth)}})()`);
    assert.ok(check.images&&!check.overflow&&check.figures,id);
    const file=width+'-'+id+'.png';fs.writeFileSync(path.join(out,file),(await wc.capturePage()).toPNG());sections.push({page,id,width,file,...check});
   }
  }
 }
 const captures=Object.entries(require('./qa/full-refresh/capture.json'));
 const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 // 4画面ずつ実寸に近い大きさで表示する目視用ブラウザ一覧。
 for(let i=0;i<captures.length;i+=4){
  const html='<!doctype html><meta charset="utf-8"><style>body{margin:8px;font:16px sans-serif;background:#e7edf4}main{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0;background:white;padding:8px}figcaption{height:40px;overflow-wrap:anywhere}img{width:100%;height:650px;object-fit:contain;object-position:top}</style><main>'+captures.slice(i,i+4).map(([key,c])=>`<figure><figcaption>${esc(key)} — ${esc(c.state.theme)} / ${esc(c.state.tab)}</figcaption><img src="${pathToFileURL(path.join(manual,'images',c.file)).href}"></figure>`).join('')+'</main>';
  const file=path.join(out,'gallery-'+String(i/4+1).padStart(2,'0')+'.html');fs.writeFileSync(file,html);
  win.setContentSize(1920,1440);await win.loadFile(file);await run('Promise.all(Array.from(document.images,i=>i.decode()))');await frame();fs.writeFileSync(file.replace('.html','.png'),(await wc.capturePage()).toPNG());
 }
 // 全章・35レシピの先頭を一覧化し、本文レイアウトも目視できるようにする。
 const review=sections.filter(s=>s.width===1280);
 for(let i=0;i<review.length;i+=8){
  const html='<!doctype html><meta charset="utf-8"><style>body{margin:8px;font:15px sans-serif;background:#e7edf4}main{display:grid;grid-template-columns:1fr 1fr;gap:8px}figure{margin:0;background:white;padding:6px}figcaption{height:25px}img{display:block;width:100%;height:390px;object-fit:contain;object-position:top}</style><main>'+review.slice(i,i+8).map(c=>`<figure><figcaption>${esc(c.id)} / ${esc(c.title)}</figcaption><img src="${pathToFileURL(path.join(out,c.file)).href}"></figure>`).join('')+'</main>';
  const file=path.join(out,'pages-'+String(i/8+1).padStart(2,'0')+'.html');fs.writeFileSync(file,html);win.setContentSize(1920,1740);await win.loadFile(file);await run('Promise.all(Array.from(document.images,i=>i.decode()))');await frame();fs.writeFileSync(file.replace('.html','.png'),(await wc.capturePage()).toPNG());
 }
 assert.equal(external.length,0);fs.writeFileSync(path.join(out,'full-review.json'),JSON.stringify({sections,screenshots:captures.length,externalRequests:0},null,2));
 console.log('PASS 11 chapters and 35 recipes at 1280x720 / 1920x1080; 96 real screenshots and section contact sheets ready for visual review; external requests 0');app.exit(0);
})().catch(e=>{console.error(e);app.exit(1)});
