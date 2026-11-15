const assert=require('node:assert/strict');
module.exports=async({run})=>{
 await run(`window.__rendererUI.resetConfiguration();document.querySelector('.module-row[data-module-id="nodejs"]').click();document.querySelector('[data-tab="config"]').click()`);
 const field=`document.querySelector('input[data-field-name="generateStarter"]')`;
 assert.equal(await run(field+'.checked'),true);
 assert.match(await run(field+'.closest(".field-row").textContent'),/本番運用向け.*ありません/);
 await run('window.__testConfirmModules();window.__rendererGenerate.generateConfigs()');
 assert.equal(await run('window.GeneratedFiles.all().filter(f=>["package.json","package-lock.json","server.cjs"].includes(f.filename)).length'),3);
 await run(field+'.click()');
 assert.equal(await run('window.__rendererModulesUI.areAllSettingsConfirmed()'),false);
 await run('window.__rendererModulesUI.renderConfigSections()');
 assert.equal(await run(field+'.checked'),false);
 await run('window.__testConfirmModules();window.__rendererGenerate.generateConfigs()');
 assert.equal(await run('window.GeneratedFiles.all().filter(f=>["package.json","package-lock.json","server.cjs"].includes(f.filename)).length'),0);
 assert.ok(await run('document.querySelector(".node-runtime-notice").textContent.includes("生成はOFF")'));
 await run(field+'.click();window.__testConfirmModules();window.__rendererGenerate.generateConfigs()');
 assert.equal(await run('window.GeneratedFiles.all().filter(f=>f.filename==="server.cjs").length'),1);
 console.log('PASS Node starter default ON/OFF, notice, confirmation invalidation, draft persistence, exact three generated files');
};
