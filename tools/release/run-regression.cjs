// Preserve the original 85 tests and add the 4 + 4 + 8 reviewed dependency regressions.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const out=process.env.DBT_REGRESSION_EVIDENCE?path.resolve(process.env.DBT_REGRESSION_EVIDENCE):fs.mkdtempSync(path.join(os.tmpdir(),'dbt-regression-'));
fs.mkdirSync(out,{recursive:true});
const env={...process.env,DBT_MIGRATION_EVIDENCE:path.join(out,'compatibility'),DBT_TEMP_EVIDENCE:path.join(out,'temp'),DBT_PATCH_SAFETY_EVIDENCE:path.join(out,'patch-safety')};
const tests=fs.readdirSync(path.join(root,'test')).filter(n=>n.endsWith('.test.js')).map(n=>'test/'+n);
tests.push('tools/release/dependency-migration-regression.cjs','tools/release/temp-rimraf-regression.cjs','tools/release/patch-safety-regression.cjs');
// Limit concurrent Node test processes on GitHub-hosted runners to avoid memory exhaustion.
const ciOptions = process.env.GITHUB_ACTIONS === 'true' ? ['--test-concurrency=1'] : [];
const r=spawnSync(process.execPath,['--test',...ciOptions,...tests],{cwd:root,env,stdio:'inherit',windowsHide:true});
if(r.error)console.error(r.error.message);process.exitCode=r.status??1;
