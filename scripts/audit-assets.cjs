// 19件全てのモジュール画像を、固定されたTabler汎用アイコンとして検証する。
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const decisions=require('../tools/release/logo-decisions.json');
const baseline=require('../tools/release/logo-review-20261031/asset-inventory-before.json');
const icons=require('../app/data/module-icon-attributions.json');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const oldGenericHashes={
 nginx:'74c5bf8218333863849d8a2a89d627ebb4b853eeac984f3d770324648e98ecc7',apache:'ada5f79e7bdf5c4bcd401e980a34c713bef9de69963760df8a86e913083a3452',
 certbot:'522f79bc103c62d7c24ef70d9f522dc593f06a0815395fc328e86dfa5c3e4630',laravel:'a35767eb211b90535f5880c41aa2bd9af904b0c46b2680b279af9c6955c5a714',
 nodejs:'881dabf34dfac9db12ab5fc0af3fc4929ed4200c6b53feccaf06d6fbec09de36',mysql:'92c9d3104b2f1ebb965c7b013d425142033242f30a3d41ba1053eff3ac71ca8e',
 mariadb:'1ab99dafe979ff03cef169f62383e641fa605423309a0e129acacd8b26f92dea',postgresql:'e7b2e242c226f1a1b722b05b35b7f53a8244dc80455dc21e3d42e99bdb434114',
 redis:'e43cf6708fb67fcf7f45ea2de0a52c09cd006d0a02ac84ceb3fa182b4196ede7',memcached:'a61b1f04d360459f120df76e071544e0ce56944a4e54f8b8dd0ac6c2fcf10ca1',
 phpmyadmin:'ba0063241d510a2bc6ed2f2336b7fade50d3e03500d8e056fe7474801408bcd0',portainer:'ec56d13d948a6df4feb93c342cfbaad843e3811bb2560d6a574b2df8a14cd189',
 rabbitmq:'0054e47abe22756473d6fb9e961b73bfb2dd4b89f55d7ab2dd60c0298de1f934',ollama:'ddad424dcebedc602af51058b17d816deb7f10a9ce5b589da7a0747b5697d62e',
 steamcmd:'25ca712d584167ab75a5737915e36b6a1fb18bc86cd7f17601a13958a121e988'
};
const oldOfficialHashes={
 'python.png':'4008a934b415c152bfa513be3e9b05de4212ae41549a27f2c6c8d41b3a24a4da',
 'wordpress.png':'06049b810ea5605edc375f6208fb788efaa5a95ee40d6ee0d84b9d2e2639ecb3',
 'redmine.png':'2d70f2e2780cd182615f6d706491d153559b1ad8dba1c3a07193876c66b8ffbf',
 'jenkins.png':'03a54998db7d39111b1199341565d90ccadcb43093972ed8c2cce3f7c670e089'
};
const inventory=require('../tools/release/asset-inventory.json');
for(const item of [...inventory.originals,...inventory.art])assert.equal(hash(item.file),item.sha256,'AI artwork changed: '+item.file);
assert.equal(decisions.length,19);assert.equal(icons.items.length,19);
assert.equal(icons.commit,'6904efd245391ad396df17654738f52f6da8c40e');
assert.equal(new Set(icons.items.map(i=>i.id)).size,19);assert.equal(new Set(icons.items.map(i=>i.moduleFile)).size,19);
const replacements=new Map(icons.items.map(item=>[item.moduleFile,item]));
const current=decisions.map(record=>{
 const file='app/src/modules/'+record.file,manualFile='docs/manual/icons/'+replacements.get(record.file)?.manualFile;
 const sha256=hash(file),item=replacements.get(record.file);
 assert.ok(item,'Missing generic attribution: '+record.file);
 assert.ok(record.replacement,'Missing Tabler replacement: '+record.file);
 assert.equal(record.originalLogoAdopted,false,'Brand mark retained: '+record.file);
 assert.notEqual(record.adopt,true,'Legacy official logo still marked adopted: '+record.file);
 assert.equal(record.replacement.collection,'Tabler Icons');assert.equal(record.replacement.commit,icons.commit);
 assert.equal(record.replacement.icon,item.icon);assert.equal(record.replacement.sha256,item.sha256);
 assert.equal(sha256,item.sha256,'Current app icon differs from attribution: '+file);
 assert.equal(hash(manualFile),sha256,'Manual icon differs from app icon: '+record.file);
 assert.equal(hash(item.sourceFile),item.sourceSha256,'Pinned Tabler SVG changed: '+item.id);
 assert.equal(item.width,160);assert.equal(item.height,160);
 assert.equal(item.sourceUrl,`https://github.com/tabler/tabler-icons/blob/${icons.commit}/icons/outline/${item.icon}.svg`);
 assert.equal(item.sourceFile,`legal/third-party/tabler-icons-v3.50.0/outline/${item.icon}.svg`);
 assert.notEqual(sha256,baseline.logos.find(b=>b.file===file)?.sha256,'Original mark remains: '+file);
 return {...record,file,sha256,approved:true,iconSource:item.sourceUrl,iconLicense:'MIT',originalMarkRetained:false};
});
assert.equal(replacements.size,19);
for(const [id,sha256] of Object.entries(oldGenericHashes))assert.equal(replacements.get(id==='laravel'?'laravel_app.png':id+'.png')?.sha256,sha256,'Previously replaced icon changed: '+id);
for(const [file,sha256] of Object.entries(oldOfficialHashes)){
 const record=decisions.find(r=>r.file===file),item=replacements.get(file),manual='docs/manual/icons/'+item?.manualFile;
 assert.ok(item,'Missing generic replacement for former official image: '+file);
 assert.equal(record.originalLogoSha256,sha256,'Historical official image baseline changed: '+file);
 assert.equal(hash('tools/release/logo-review-20261031/downloads/'+file),sha256,'Official source evidence changed: '+file);
 assert.notEqual(hash('app/src/modules/'+file),sha256,'Former official image remains in app: '+file);
 assert.notEqual(hash(manual),sha256,'Former official image remains in manual: '+file);
}
for(const name of ['TABLER-ICONS-LICENSE.txt','MODULE-ICON-NOTICES.txt'])assert.deepEqual(fs.readFileSync(path.join(root,'legal/third-party',name)),fs.readFileSync(path.join(root,'docs/manual/third-party',name)));
assert.match(fs.readFileSync(path.join(root,'docs/manual/logo-notices.html'),'utf8'),new RegExp(icons.heading));
// Markdownの追記・法的判断と歴史上のchanges.jsonは、人間の監査証跡として保全する。
fs.writeFileSync(path.join(root,'tools/release/asset-inventory.json'),JSON.stringify({...inventory,logos:current},null,2)+'\n');
console.log('PASS 19 module icons: all pinned Tabler MIT glyphs, prior 15 unchanged, four former official PNGs absent; active artwork matches its inventory and historical logo evidence is intact.');
