// Never search PATH or fall back to global npm for project operations.
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process'),env=require('./environment.cjs');
try{
 env.verifyTool();const args=process.argv.slice(2);if(!args.length)throw Error('Usage: node tools/npm/run.cjs <npm arguments>');
 const installs=['ci','install','i'].includes(args[0]);
 if(installs&&fs.existsSync(env.receipt))fs.unlinkSync(env.receipt);
 const childEnv={...process.env},pathKey=Object.keys(childEnv).find(k=>k.toLowerCase()==='path')||'PATH';
 // Child build tools that spawn `npm` also resolve the project CLI; the parent/system PATH is unchanged.
 // Use npm's installed command shim, not the distribution-template npm/bin/npm.cmd.
 childEnv[pathKey]=path.join(env.tool,'node_modules','.bin')+path.delimiter+(childEnv[pathKey]||'');
 const child=spawn(process.execPath,[env.cli,...args],{cwd:env.root,env:childEnv,stdio:'inherit',windowsHide:true});
 child.on('error',error=>{console.error(error.message);process.exitCode=1;});
 child.on('exit',code=>{try{if(code===0&&installs){if(!fs.existsSync(env.receipt))throw Error('Project postinstall did not complete; install scripts may have been disabled. No global npm fallback was used.');const r=JSON.parse(fs.readFileSync(env.receipt));if(r.lockHash!==env.hash(env.root+'/package-lock.json')||r.npm!==env.config.npmVersion)throw Error('Install receipt does not match this lock/toolchain');}process.exitCode=code??1;}catch(error){console.error(error.message);process.exitCode=1;}});
}catch(error){console.error(error.message);process.exitCode=1;}
