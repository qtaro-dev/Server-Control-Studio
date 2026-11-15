const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const records=require('../tools/release/logo-decisions.json'),baseline=require('../tools/release/logo-review-20261031/asset-inventory-before.json'),icons=require('../app/data/module-icon-attributions.json');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const oldGenericHashes={
 nginx:'74c5bf8218333863849d8a2a89d627ebb4b853eeac984f3d770324648e98ecc7',
 apache:'ada5f79e7bdf5c4bcd401e980a34c713bef9de69963760df8a86e913083a3452',
 certbot:'522f79bc103c62d7c24ef70d9f522dc593f06a0815395fc328e86dfa5c3e4630',
 laravel:'a35767eb211b90535f5880c41aa2bd9af904b0c46b2680b279af9c6955c5a714',
 nodejs:'881dabf34dfac9db12ab5fc0af3fc4929ed4200c6b53feccaf06d6fbec09de36',
 mysql:'92c9d3104b2f1ebb965c7b013d425142033242f30a3d41ba1053eff3ac71ca8e',
 mariadb:'1ab99dafe979ff03cef169f62383e641fa605423309a0e129acacd8b26f92dea',
 postgresql:'e7b2e242c226f1a1b722b05b35b7f53a8244dc80455dc21e3d42e99bdb434114',
 redis:'e43cf6708fb67fcf7f45ea2de0a52c09cd006d0a02ac84ceb3fa182b4196ede7',
 memcached:'a61b1f04d360459f120df76e071544e0ce56944a4e54f8b8dd0ac6c2fcf10ca1',
 phpmyadmin:'ba0063241d510a2bc6ed2f2336b7fade50d3e03500d8e056fe7474801408bcd0',
 portainer:'ec56d13d948a6df4feb93c342cfbaad843e3811bb2560d6a574b2df8a14cd189',
 rabbitmq:'0054e47abe22756473d6fb9e961b73bfb2dd4b89f55d7ab2dd60c0298de1f934',
 ollama:'ddad424dcebedc602af51058b17d816deb7f10a9ce5b589da7a0747b5697d62e',
 steamcmd:'25ca712d584167ab75a5737915e36b6a1fb18bc86cd7f17601a13958a121e988'
};
const oldOfficialHashes={
 'python.png':'4008a934b415c152bfa513be3e9b05de4212ae41549a27f2c6c8d41b3a24a4da',
 'wordpress.png':'06049b810ea5605edc375f6208fb788efaa5a95ee40d6ee0d84b9d2e2639ecb3',
 'redmine.png':'2d70f2e2780cd182615f6d706491d153559b1ad8dba1c3a07193876c66b8ffbf',
 'jenkins.png':'03a54998db7d39111b1199341565d90ccadcb43093972ed8c2cce3f7c670e089'
};

test('all nineteen module images are pinned Tabler glyphs; the prior fifteen stay byte-identical',()=>{
 assert.equal(records.length,19);assert.equal(new Set(records.map(r=>r.file)).size,19);
 assert.equal(icons.items.length,19);assert.equal(new Set(icons.items.map(i=>i.id)).size,19);
 assert.equal(icons.commit,'6904efd245391ad396df17654738f52f6da8c40e');assert.match(icons.licenseText,/Permission is hereby granted/);
 assert.equal(icons.copyright,icons.licenseText.match(/^Copyright[^\r\n]*/m)?.[0],'copyright line must match the bundled MIT text exactly');
 const byModule=new Map(icons.items.map(item=>[item.moduleFile,item])),byId=new Map(icons.items.map(item=>[item.id,item]));
 for(const r of records){
  const item=byModule.get(r.file),current='app/src/modules/'+r.file,manual='docs/manual/icons/'+item?.manualFile;
  assert.ok(item,'missing generic attribution for '+r.file);assert.ok(r.replacement,'missing generic replacement record for '+r.file);
  assert.equal(r.originalLogoAdopted,false,r.file+' must not retain a brand mark');assert.notEqual(r.adopt,true,r.file+' must not retain an adopted logo');
  assert.equal(r.replacement.collection,'Tabler Icons',r.file);assert.equal(r.replacement.commit,icons.commit,r.file);
  assert.equal(r.replacement.icon,item.icon,r.file);assert.equal(r.replacement.sha256,item.sha256,r.file);
  assert.equal(sha(current),item.sha256,item.id);assert.equal(sha(manual),item.sha256,item.id+' manual');
  assert.equal(sha(item.sourceFile),item.sourceSha256,item.id+' pinned SVG');
  assert.equal(item.width,160);assert.equal(item.height,160);
  assert.equal(item.sourceUrl,`https://github.com/tabler/tabler-icons/blob/${icons.commit}/icons/outline/${item.icon}.svg`);
  assert.equal(item.sourceFile,`legal/third-party/tabler-icons-v3.50.0/outline/${item.icon}.svg`);
  assert.notEqual(item.sha256,baseline.logos.find(b=>b.file===current)?.sha256,item.id+' old mark removed');
 }
 assert.equal(byModule.size,19);
 for(const [id,hash] of Object.entries(oldGenericHashes))assert.equal(byId.get(id)?.sha256,hash,id+' existing generic preserved');
 for(const [file,hash] of Object.entries(oldOfficialHashes)){
  const decision=records.find(r=>r.file===file),item=byModule.get(file);
  assert.ok(item,file+' generic attribution missing');
  assert.equal(decision.originalLogoSha256,hash,file+' historical official image baseline');
  assert.notEqual(sha('app/src/modules/'+file),hash,file+' official image removed');
  assert.notEqual(sha('docs/manual/icons/'+item.manualFile),hash,file+' official manual image removed');
 }
 for(const f of ['TABLER-ICONS-LICENSE.txt','MODULE-ICON-NOTICES.txt'])assert.deepEqual(fs.readFileSync('legal/third-party/'+f),fs.readFileSync('docs/manual/third-party/'+f));
 assert.match(fs.readFileSync('docs/manual/logo-notices.html','utf8'),new RegExp(icons.heading));
});

test('AI illustrations and About/manual copies retain their pre-task hashes',()=>{
 const b=require('../tools/release/asset-inventory.json');assert.ok(b.originals.length>0);
 for(const r of [...b.originals,...b.art])assert.equal(sha(r.file),r.sha256);
});
