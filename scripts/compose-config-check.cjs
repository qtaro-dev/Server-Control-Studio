// 現行35レシピを本体から生成しconfigだけ検証する。pull/up/downは実行しない。
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const {recipes}=require('./lib/manual-recipe-plan.cjs'),{prepare}=require('./lib/manual-recipe-generation.cjs');
const output=process.env.COMPOSE_CONFIG_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'dbt-compose-config-'));
fs.mkdirSync(output,{recursive:true});const results=[];
for(const recipe of recipes){const dir=path.join(output,recipe.id);fs.mkdirSync(dir,{recursive:true});prepare(recipe,dir);const args=[];if(process.env.DOCKER_CONTEXT)args.push('--context',process.env.DOCKER_CONTEXT);args.push('compose','--project-name','dbt-config-validation','-f',path.join(dir,'docker-compose.yml'));if(fs.existsSync(path.join(dir,'compose.manual.yml')))args.push('-f',path.join(dir,'compose.manual.yml'));args.push('config','-q');
 const r=spawnSync('docker',args,{cwd:dir,encoding:'utf8',shell:false,timeout:30000});const text=(r.stdout||'')+(r.stderr||'')+(r.error?.message||'');fs.writeFileSync(path.join(dir,'config.log'),text);const obsolete=/version[^\n]*obsolete|obsolete[^\n]*version/i.test(text);results.push({recipe:recipe.id,passed:r.status===0&&!obsolete,exitCode:r.status,obsoleteVersionWarning:obsolete});}
fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({output,passed:results.filter(r=>r.passed).length,total:results.length}));if(results.some(r=>!r.passed))process.exitCode=1;
