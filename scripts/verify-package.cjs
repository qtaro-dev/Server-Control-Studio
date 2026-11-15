const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const asar = require('@electron/asar');
const verifyHistoricalLogo = require('./lib/historical-logo-evidence.cjs');

async function verify() {
const root = path.resolve(__dirname, '..');
const decisions=require('../tools/release/logo-decisions.json');
const logoBaseline=require('../tools/release/logo-review-20261031/asset-inventory-before.json');
const icons=require('../app/data/module-icon-attributions.json');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const archive = path.resolve(process.argv[2] || path.join(root, 'release/win-unpacked/resources/app.asar'));
const entries = asar.listPackage(archive).map(name => name.replaceAll('\\', '/').replace(/^\//, ''));
const files = entries.filter(name => !asar.statFile(archive, path.normalize(name)).files);
const expected = ['main.js', 'preload.js', 'security.js', 'image-catalog.js', 'app-info.js', 'app-paths.js', 'user-manual.js', 'package.json'];
const junk = relative => relative.split('/').some(p=>['thumbs.db','desktop.ini','.ds_store'].includes(p.toLowerCase()));
function walk(directory) {
  for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory()) walk(relative);
    else if(!junk(relative)) expected.push(relative);
  }
}
walk('app');
// 唯一のproduction依存。builderが同梱したファイルだけをソースとバイト比較する。
const yamlFiles=files.filter(name=>name.startsWith('node_modules/yaml/'));
assert.ok(yamlFiles.includes('node_modules/yaml/package.json'),'YAML parser runtime is required');
expected.push(...yamlFiles);
assert.deepEqual([...files].sort(), expected.sort(), 'Only application runtime files may be distributed');
// Verify all module icons against the pinned attribution records, including files inside app.asar.
assert.equal(decisions.length,19);assert.equal(icons.items.length,19);
assert.equal(icons.commit,'6904efd245391ad396df17654738f52f6da8c40e');
const modulePngs=files.filter(name=>/^app\/src\/modules\/[^/]+\.png$/.test(name)).sort();
assert.deepEqual(modulePngs,icons.items.map(item=>'app/src/modules/'+item.moduleFile).sort(),'Every module PNG must have a generic-icon record');
const decisionsByFile=new Map(decisions.map(record=>[record.file,record]));
for(const item of icons.items){
 const appFile='app/src/modules/'+item.moduleFile,manualFile='icons/'+item.manualFile;
 const appBytes=asar.extractFile(archive,path.normalize(appFile)),record=decisionsByFile.get(item.moduleFile);
 assert.ok(record&&record.replacement,'Module has no generic replacement record: '+item.moduleFile);
 assert.equal(record.originalLogoAdopted,false,item.moduleFile+' retains a former mark');
 assert.notEqual(record.adopt,true,item.moduleFile+' is still marked as an adopted logo');
 assert.equal(record.replacement.collection,'Tabler Icons');assert.equal(record.replacement.commit,icons.commit);
 assert.equal(record.replacement.icon,item.icon);assert.equal(record.replacement.sha256,item.sha256);
 assert.equal(sha(appBytes),item.sha256,appFile+' differs from the pinned generic asset');
 assert.equal(sha(fs.readFileSync(path.join(root,'docs/manual',manualFile))),item.sha256,manualFile+' differs from the pinned generic asset');
 assert.equal(sha(fs.readFileSync(path.join(root,item.sourceFile))),item.sourceSha256,item.id+' Tabler source SVG changed');
 assert.equal(item.sourceUrl,`https://github.com/tabler/tabler-icons/blob/${icons.commit}/icons/outline/${item.icon}.svg`);
 assert.equal(item.sourceFile,`legal/third-party/tabler-icons-v3.50.0/outline/${item.icon}.svg`);
 assert.equal(item.width,160);assert.equal(item.height,160);
 assert.notEqual(sha(appBytes),logoBaseline.logos.find(row=>row.file===appFile)?.sha256,'Former brand icon remains: '+appFile);
}
// electron-builderは依存パッケージの開発用scripts/keywordsだけを除去する。
// 実行コードとライセンスは引き続きバイト一致、残りのメタデータは構造一致を要求する。
const yamlManifestPath=path.normalize('node_modules/yaml/package.json');
const packagedYaml=JSON.parse(asar.extractFile(archive,yamlManifestPath));
const sourceYaml=JSON.parse(fs.readFileSync(path.join(root,yamlManifestPath)));
for(const key of ['keywords','scripts'])delete sourceYaml[key];
assert.deepEqual(packagedYaml,sourceYaml,'Only builder-documented dependency metadata trimming is allowed');
for (const file of files.filter(name => name !== 'package.json' && name !== 'node_modules/yaml/package.json')) {
  assert.deepEqual(asar.extractFile(archive, path.normalize(file)), fs.readFileSync(path.join(root, file)), `${file} differs from source`);
}
const manifest = JSON.parse(asar.extractFile(archive, 'package.json'));
const source = require('../package.json');
assert.equal(manifest.version, source.version);
assert.equal(manifest.productName,source.productName);
assert.equal(manifest.license,source.license);
assert.equal(manifest.distribution.licenseDisplayName,source.distribution.licenseDisplayName);
const sandbox={module:{exports:{}},require:name=>{assert.equal(name,'./package.json');return manifest;}};
require('node:vm').runInNewContext(asar.extractFile(archive,'app-info.js').toString(),sandbox);
assert.equal(sandbox.module.exports.describeApp().title,require('../app-info').describeApp().title,'Stripped packaged metadata must still start successfully');
assert.deepEqual(manifest.release, source.release);
assert.equal(manifest.main, 'main.js');
assert.equal(source.devDependencies.electron, '45.0.0');
assert.equal(files.filter(name => /^app\/src\/modules\/.*\.js$/.test(name)).length, 19);
const resources = fs.readdirSync(path.dirname(archive));
const expectedResources=['app.asar','manual','LICENSE.txt','THIRD_PARTY_NOTICES.txt','third-party'];
if(resources.includes('elevate.exe')) {
  assert.notEqual(process.argv[3],'installer','Installer has elevation helper disabled');
  // Portable/共有展開物ではビルダー標準ヘルパーが追加される。任意のEXEは許可しない。
  const cache=process.env.ELECTRON_BUILDER_CACHE||path.join(process.env.LOCALAPPDATA,'electron-builder','Cache');
  assert.ok(fs.existsSync(cache),'Builder cache unavailable: set ELECTRON_BUILDER_CACHE to the cache used for this build');
  const candidates=[];
  for(const outer of fs.readdirSync(cache,{withFileTypes:true}).filter(e=>e.isDirectory()&&e.name.startsWith('nsis-'))) {
    const folder=path.join(cache,outer.name);
    for(const inner of fs.readdirSync(folder,{withFileTypes:true}).filter(e=>e.isDirectory())) {
      const file=path.join(folder,inner.name,'elevate.exe');if(fs.existsSync(file))candidates.push(file);
    }
  }
  const binary=fs.readFileSync(path.join(path.dirname(archive),'elevate.exe'));
  assert.ok(candidates.some(file=>binary.equals(fs.readFileSync(file))),'Only exact builder-provided cached elevation helper allowed');
  expectedResources.push('elevate.exe');
}
assert.deepEqual(resources.sort(), expectedResources.sort(), 'Only known runtime resources and official manual may be bundled');
const manualRoot=path.join(root,'docs/manual'),packagedManual=path.join(path.dirname(archive),'manual');
function walkFiles(directory,prefix='') {
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walkFiles(path.join(directory,entry.name),prefix+entry.name+'/'):[prefix+entry.name]);
}
const allowed=['index.html','recipes.html','logo-notices.html','manual.css','manual.js','LICENSE.txt','THIRD_PARTY_NOTICES.txt',...['art','images','icons','examples','third-party'].flatMap(dir=>walkFiles(path.join(manualRoot,dir),dir+'/'))].filter(f=>!junk(f)&&!f.endsWith('.log')&&!f.split('/').some(p=>['.env','node_modules','vendor'].includes(p)));
for(const name of ['LICENSE.txt','THIRD_PARTY_NOTICES.txt'])assert.deepEqual(fs.readFileSync(path.join(path.dirname(archive),name)),fs.readFileSync(path.join(root,name)));
const legalSource=path.join(root,'legal/third-party'), legalBundle=path.join(path.dirname(archive),'third-party');
const legalNames=walkFiles(legalSource).filter(f=>/\.(txt|html)$/.test(f));
assert.deepEqual(walkFiles(legalBundle).sort(),legalNames.sort());
for(const name of legalNames)assert.deepEqual(fs.readFileSync(path.join(legalBundle,name)),fs.readFileSync(path.join(legalSource,name)));
const bundled=walkFiles(packagedManual);assert.deepEqual(bundled.sort(),allowed.sort(),'No old/QA/ZIP or unrelated development files in manual');
for(const name of bundled)assert.deepEqual(fs.readFileSync(path.join(packagedManual,name)),fs.readFileSync(path.join(manualRoot,name)),name+' manual source bytes');
assert.deepEqual(bundled.filter(name=>name.startsWith('icons/')&&name.endsWith('.png')).sort(),icons.items.map(item=>'icons/'+item.manualFile).sort(),'Manual must contain exactly the 19 attributed module icons');
const oldOfficial=decisions.filter(record=>record.originalLogoSha256);
assert.equal(oldOfficial.length,4,'Exactly four prior official PNGs need a removal check');
const bundledPngHashes=new Set(bundled.filter(name=>name.toLowerCase().endsWith('.png')).map(name=>sha(fs.readFileSync(path.join(packagedManual,name)))));
const appPngHashes=new Set(files.filter(name=>name.toLowerCase().endsWith('.png')).map(name=>sha(asar.extractFile(archive,path.normalize(name)))));
for(const record of oldOfficial){
 const oldHash=record.originalLogoSha256;
 verifyHistoricalLogo(root,record.file,oldHash);
 assert.ok(!appPngHashes.has(oldHash),'Former official PNG is still in app.asar: '+record.file);
 assert.ok(!bundledPngHashes.has(oldHash),'Former official PNG is still in the packaged manual: '+record.file);
}
console.log(`PASS packaged ${manifest.version} Release ${manifest.release.number}: ${files.length} runtime files, ${bundled.length} manual files, 19 modules, exact source bytes; no settings/logs/tests/credentials/old manual/ZIP`);
}
verify().catch(error=>{console.error(error);process.exitCode=1;});
