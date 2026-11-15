// The golden contract was captured from the preserved pre-migration packages; CI need not install vulnerable old dependencies.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),original=process.env.DBT_BASELINE_ROOT,contract=require('../../test/fixtures/dependency-contract.json');
const output=path.resolve(process.env.DBT_MIGRATION_EVIDENCE);fs.mkdirSync(output,{recursive:true});
const fixtures=path.join(output,'fixture');if(fs.existsSync(fixtures))throw Error('Fixture already exists');
const contents=contract.contents;
for(const [name,text]of Object.entries(contents)){fs.mkdirSync(path.dirname(path.join(fixtures,name)),{recursive:true});fs.writeFileSync(path.join(fixtures,name),text);}
function req(base,name){return require(require.resolve(name,{paths:[base]}));}
test('actual builder FileMatcher preserves baseline include/exclude selection and Windows paths',()=>{
 const now=req(root,'app-builder-lib/out/fileMatcher.js').FileMatcher,records=[];
 for(const expected of contract.matches){const select=Type=>{const m=new Type(fixtures,output,s=>s,expected.patterns),filter=m.createFilter();return Object.keys(contents).filter(n=>filter(path.join(fixtures,n),fs.statSync(path.join(fixtures,n)))).sort();};const selected=select(now);assert.deepEqual(selected,expected.selected);if(original)assert.deepEqual(selected,select(req(original,'app-builder-lib/out/fileMatcher.js').FileMatcher));records.push({patterns:expected.patterns,selected});}assert.ok(!records[0].selected.some(n=>n.endsWith('.log')||n.endsWith('.env')||n.endsWith('Thumbs.db')));fs.writeFileSync(path.join(output,'file-selection.json'),JSON.stringify(records,null,2));
});
test('actual ASAR create/list/stat/extract and unpacked payload are byte equivalent',async()=>{
 const sources=original?[['before',req(original,'@electron/asar')],['after',req(root,'@electron/asar')]]:[['after',req(root,'@electron/asar')]],results=[];
 for(const [name,api]of sources){const archive=path.join(output,name+'.asar');await api.createPackageWithOptions(fixtures,archive,{unpack:'**/*.node',dot:true});const list=api.listPackage(archive).map(n=>n.replaceAll('\\','/').replace(/^\//,''));const files=list.filter(n=>!api.statFile(archive,path.normalize(n)).files).sort();assert.deepEqual(files,Object.keys(contents).sort());for(const n of files)assert.equal(api.extractFile(archive,path.normalize(n)).toString(),contents[n]);assert.equal(fs.readFileSync(archive+'.unpacked/native/addon.node','utf8'),contents['native/addon.node']);results.push({name,files});}if(original)assert.deepEqual(results[0].files,results[1].files);fs.writeFileSync(path.join(output,'asar-comparison.json'),JSON.stringify(results,null,2));
});
test('EJS consumer rendering stays byte equivalent for escaping, raw text, loops and conditions',()=>{
 for(const {template,data,result}of contract.ejsCases){assert.equal(req(root,'ejs').render(template,data),result);if(original)assert.equal(req(original,'ejs').render(template,data),result);}
});
test('fixed matcher bounds preprocessing and updated glob rejects an already-aborted traversal',async()=>{
 const mm=req(root,'minimatch');const x=new mm.Minimatch(Array(8).fill('**/../a/b').join('/'),{optimizationLevel:2,braceExpandMax:64});assert.ok(x.set.length<=64);
 const asarRoot=path.dirname(require.resolve('@electron/asar',{paths:[root]}));const glob=require(require.resolve('glob',{paths:[asarRoot]}));await assert.rejects(glob.glob('**/*',{cwd:fixtures,signal:AbortSignal.abort()}),e=>e.name==='AbortError');
});
