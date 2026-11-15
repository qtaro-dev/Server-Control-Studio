const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const pkg=require('../package.json'),{releaseBlockers}=require('../scripts/verify-release.cjs');
test('release approval cannot be inferred from a successful build or individual checkbox',()=>{
 assert.equal(releaseBlockers().length,3);const copy=structuredClone(pkg);copy.distribution.publicationApproved=true;assert.equal(releaseBlockers(copy).length,2);copy.distribution.assetsApproved=true;copy.distribution.thirdPartyComplianceApproved=true;assert.deepEqual(releaseBlockers(copy),[]);
});
test('license excludes third-party rights and notices include exact runtime texts',()=>{
 assert.equal(pkg.private,true);assert.equal(pkg.license,'SEE LICENSE IN LICENSE.txt');
 assert.match(fs.readFileSync('LICENSE.txt','utf8'),/第三者ライセンスにより許諾・要求される行為を除きます/);
 for(const [from,to]of [['node_modules/electron/dist/LICENSE','legal/third-party/Electron-LICENSE.txt'],['node_modules/yaml/LICENSE','legal/third-party/yaml-LICENSE.txt'],['node_modules/electron/dist/LICENSES.chromium.html','legal/third-party/LICENSES.chromium.html']]){
  // Git stores LF; Electron's Windows archive uses CRLF for the Chromium notices.
  const readLicense=file=>fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
  assert.ok(readLicense(from)===readLicense(to), `Bundled license text differs: ${from} vs ${to}`);
 }
});

test('About metadata works after builder removes development build configuration',()=>{
 const metadata=structuredClone(pkg);delete metadata.build;delete metadata.devDependencies;
 const sandbox={module:{exports:{}},require:name=>{assert.equal(name,'./package.json');return metadata;}};
 require('node:vm').runInNewContext(fs.readFileSync('app-info.js','utf8'),sandbox);
 assert.equal(sandbox.module.exports.describeApp().title,`${pkg.productName} ${pkg.version} Release ${pkg.release.number}`);
});
