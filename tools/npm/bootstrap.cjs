// Provision only this project's npm. The downloaded official archive is SRI-checked before installation.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const env=require('./environment.cjs');
(async()=>{
 if(!/^\d+\.\d+\.\d+$/.test(env.config.npmVersion))throw Error('Invalid configured npm version');
 const url=new URL(env.config.npmTarball);
 if(url.origin!=='https://registry.npmjs.org'||url.pathname!=='/npm/-/npm-'+env.config.npmVersion+'.tgz')throw Error('Unexpected npm archive URL');
 if(fs.existsSync(env.tool)){env.verifyTool();console.log('Project npm already verified: '+env.config.npmVersion);return;}
 const nodeDir=path.dirname(process.execPath);
 const candidates=[path.join(nodeDir,'node_modules/npm/bin/npm-cli.js'),path.resolve(nodeDir,'../lib/node_modules/npm/bin/npm-cli.js'),'/usr/share/nodejs/npm/bin/npm-cli.js'];
 const bootstrapCli=candidates.find(p=>fs.existsSync(p)&&JSON.parse(fs.readFileSync(path.resolve(p,'../../package.json'))).name==='npm');
 if(!bootstrapCli)throw Error('Cannot locate the Node installation npm CLI for explicit bootstrap; no fallback install was attempted');
 fs.mkdirSync(path.dirname(env.tool),{recursive:true});
 const stage=fs.mkdtempSync(path.join(path.dirname(env.tool),'.npm-stage-'));
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw Error('npm archive download failed: '+response.status);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length>50*1024*1024)throw Error('npm archive exceeds size limit');
 if('sha512-'+crypto.createHash('sha512').update(bytes).digest('base64')!==env.config.npmIntegrity)throw Error('npm archive integrity mismatch');
 const archive=path.join(stage,'npm.tgz');fs.writeFileSync(archive,bytes);
 fs.writeFileSync(path.join(stage,'package.json'),JSON.stringify({private:true,name:require('../../package.json').name+'-project-npm',version:'1.0.0'}));
 // No global install/config mutation. npm itself needs no lifecycle scripts during provisioning.
 const result=spawnSync(process.execPath,[bootstrapCli,'install','--prefix',stage,'--ignore-scripts','--no-audit','--no-fund','--registry=https://registry.npmjs.org',archive],{cwd:stage,stdio:'inherit',windowsHide:true});
 if(result.status!==0)throw Error('Project npm bootstrap install failed');
 const cli=path.join(stage,'node_modules/npm/bin/npm-cli.js'),pkg=path.join(stage,'node_modules/npm/package.json');
 if(JSON.parse(fs.readFileSync(pkg)).version!==env.config.npmVersion)throw Error('Provisioned npm has an unexpected version');
 fs.writeFileSync(path.join(stage,'provision.json'),JSON.stringify({version:env.config.npmVersion,integrity:env.config.npmIntegrity,cliHash:env.hash(cli),packageHash:env.hash(pkg)},null,2));
 fs.renameSync(stage,env.tool);env.verifyTool();console.log('Provisioned project npm '+env.config.npmVersion);
})().catch(error=>{console.error(error.message);process.exitCode=1;});
