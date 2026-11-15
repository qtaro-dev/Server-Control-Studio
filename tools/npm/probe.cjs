// Check the same PATH-based invocation used by child build tools, as well as the direct launcher.
const {spawnSync}=require('node:child_process'),assert=require('node:assert/strict'),env=require('./environment.cjs');
env.verifyInvocation();
const r=process.platform==='win32'
 ?spawnSync(process.env.ComSpec||'cmd.exe',['/d','/s','/c','npm --version'],{encoding:'utf8',windowsHide:true})
 :spawnSync('npm',['--version'],{encoding:'utf8',windowsHide:true});
assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trim(),env.config.npmVersion);
console.log('PASS direct and child PATH npm: '+env.config.npmVersion);
