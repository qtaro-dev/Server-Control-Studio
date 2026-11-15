// 配布物に実在するファイルだけを削除するNSISマクロ。利用者の追加ファイルは列挙しない。
const fs=require('node:fs'),path=require('node:path');
const { createHash } = require('node:crypto');
const redist = require('./windows-sdk-redist.json');
const sha256 = data => createHash('sha256').update(data).digest('hex');
module.exports=async context=>{
 const installer=context.targets.find(target=>target.name==='nsis');
 if(installer)require('./shell-shortcut-templates.cjs')(context,installer);
 // Use the supported Windows versions' native System32 component.
 const compiler=path.join(context.appOutDir,redist.file);
 if(sha256(fs.readFileSync(compiler))!==redist.electronOriginalSha256)
  throw new Error('Review D3DCompiler exclusion for the updated Electron distribution');
 fs.unlinkSync(compiler);

 // PortableOptions does not expose the NSIS elevation-helper flag in builder 26.
 // This application has no updater. Opt out before the Portable archive is created.
 const portable=context.targets.find(target=>target.name==='portable');
 if(portable){
  if(!portable.options || portable.options.perMachine===true)throw new Error('Unexpected Portable target options');
  portable.options.packElevateHelper=false;
 }

 // electronDist指定時に残るElectronのサンプルアプリは製品に同梱しない。
 // 既知の配布原本と一致する場合だけ、今回の出力先から個別に除外する。
 const sample=path.join(context.appOutDir,'resources/default_app.asar');
 if(fs.existsSync(sample)){
  const original=path.join(__dirname,'../node_modules/electron/dist/resources/default_app.asar');
  if(!fs.existsSync(original)||!fs.readFileSync(sample).equals(fs.readFileSync(original)))throw new Error('Unexpected Electron sample archive');
  const output=path.resolve(context.appOutDir),target=path.resolve(sample);
  if(!target.startsWith(output+path.sep))throw new Error('Sample archive outside build output');
  fs.unlinkSync(target);
 }
 const files=[],dirs=[];
 const walk=(dir,relative='')=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const name=relative?relative+'/'+e.name:e.name;if(e.isDirectory()){walk(path.join(dir,e.name),name);dirs.push(name);}else files.push(name);}};
 walk(context.appOutDir);
 const escape=s=>s.replaceAll('$','$$').replaceAll('/','\\');
 const lines=['; Generated from this exact packaged application. Never recursively remove install directory.','!macro RemoveOwnedFiles',...files.map(n=>'  Delete "$INSTDIR\\'+escape(n)+'"'),...dirs.map(n=>'  RMDir "$INSTDIR\\'+escape(n)+'"'),'  Delete "$INSTDIR\\${UNINSTALL_FILENAME}"','  RMDir "$INSTDIR"','!macroend'];
 const rootOwned=fs.readdirSync(context.appOutDir);
 lines.push('!macro IsOwnedRoot entry result','  StrCpy ${result} "false"',...rootOwned.flatMap(n=>['  ${If} ${entry} == "'+escape(n)+'"','    StrCpy ${result} "true"','  ${EndIf}']),'!macroend');
 lines.push('!macro IsOwnedPath entry result','  StrCpy ${result} "false"','  ${If} ${entry} == "'+redist.file+'"','    StrCpy ${result} "true"','  ${EndIf}',...files.flatMap(n=>['  ${If} ${entry} == "'+escape(n)+'"','    StrCpy ${result} "true"','  ${EndIf}']),'  ${If} ${entry} == "Uninstall ${PRODUCT_FILENAME}.exe"','    StrCpy ${result} "true"','  ${EndIf}','!macroend');
 fs.writeFileSync(path.join(__dirname,'owned-files.nsh'),lines.join('\r\n'));
};
