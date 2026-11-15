// npm is a project-owned build tool, deliberately outside node_modules (npm ci removes it).
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),config=require('./toolchain.json');
const tool=path.join(root,'.tools','npm-'+config.npmVersion),cli=path.join(tool,'node_modules/npm/bin/npm-cli.js');
const receipt=path.join(root,'.tools','install-receipt.json');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const samePath=(a,b)=>{const normalize=x=>path.resolve(x).replaceAll('\\','/');return process.platform==='win32'?normalize(a).toLowerCase()===normalize(b).toLowerCase():normalize(a)===normalize(b);};
function verifyTool(){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'package.json')));
 const minimum=/^>=(\d+)\.(\d+)\.(\d+)$/.exec(manifest.engines.node);
 if(!minimum)throw Error('Review the Node engine range before changing the toolchain');
 const current=process.versions.node.split('.').map(Number),required=minimum.slice(1).map(Number);
 const difference=current.findIndex((n,i)=>n!==required[i]);
 if(difference>=0&&current[difference]<required[difference])throw Error('Node.js does not meet package.json engines.node');
 if(!fs.existsSync(cli))throw Error('Project npm is missing. Run: node tools/npm/bootstrap.cjs');
 if(!samePath(fs.realpathSync(tool),tool)||!samePath(fs.realpathSync(cli),cli))throw Error('Project npm must not resolve through a link');
 const pkg=JSON.parse(fs.readFileSync(path.join(tool,'node_modules/npm/package.json')));
 if(pkg.version!==config.npmVersion)throw Error('Project npm version mismatch; bootstrap the configured tool');
 const record=JSON.parse(fs.readFileSync(path.join(tool,'provision.json')));
 if(record.integrity!==config.npmIntegrity||record.cliHash!==hash(cli)||record.packageHash!==hash(path.join(tool,'node_modules/npm/package.json')))throw Error('Project npm integrity check failed');
 if(manifest.packageManager!=='npm@'+config.npmVersion)throw Error('packageManager and tools/npm/toolchain.json disagree');
 return config;
}
function verifyInvocation(){verifyTool();if(!process.env.npm_execpath||!samePath(fs.realpathSync(process.env.npm_execpath),cli))throw Error('Use project npm: node tools/npm/run.cjs <command>. Global npm is not supported for this project.');}
module.exports={root,config,tool,cli,receipt,hash,verifyTool,verifyInvocation};
if(require.main===module){try{if(process.argv.includes('--start'))verifyTool();else verifyInvocation();}catch(error){console.error(error.message);process.exitCode=1;}}
