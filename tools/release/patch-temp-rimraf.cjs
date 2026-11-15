// Apply only the reviewed dev-tool compatibility change; unknown sources fail closed.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const config=require('./temp-compatibility.json');
const root=path.resolve(__dirname,'../..'),pkg=require(require.resolve('temp/package.json',{paths:[root]})),entry=require.resolve('temp',{paths:[root]});
// Reject hoisted fallbacks and symlinked packages before any read/write of the entry.
const allowed=path.join(fs.realpathSync(root),'node_modules','temp'),expected=path.join(allowed,'lib','temp.js');
assert.equal(fs.realpathSync(path.dirname(require.resolve('temp/package.json',{paths:[root]}))),allowed,'temp must be local and not symlinked');
assert.equal(fs.realpathSync(entry),expected,'temp entry must be the reviewed local file');
assert.equal(fs.lstatSync(entry).isSymbolicLink(),false,'Reject symlinked patch target');
assert.equal(fs.lstatSync(entry).nlink,1,'Reject hardlinked patch target');
assert.equal(require(require.resolve('rimraf/package.json',{paths:[allowed]})).version,config.rimrafVersion);
assert.equal(pkg.version,config.tempVersion);
const source=fs.readFileSync(entry,'utf8'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
if(sha(source)!==config.patchedSha256){assert.equal(sha(source),config.originalSha256,'Unreviewed temp source');const patched=source.replace(config.originalText,config.replacementText);assert.equal(sha(patched),config.patchedSha256);fs.writeFileSync(entry,patched);}
console.log('Applied reviewed temp 0.9.4 / rimraf 6 callback compatibility');
