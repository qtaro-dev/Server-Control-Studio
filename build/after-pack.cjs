// 配布物に実在するファイルだけを削除するNSISマクロ。利用者の追加ファイルは列挙しない。
const fs=require('node:fs'),path=require('node:path');
module.exports=async context=>{
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
 lines.push('!macro IsOwnedPath entry result','  StrCpy ${result} "false"',...files.flatMap(n=>['  ${If} ${entry} == "'+escape(n)+'"','    StrCpy ${result} "true"','  ${EndIf}']),'  ${If} ${entry} == "Uninstall ${PRODUCT_FILENAME}.exe"','    StrCpy ${result} "true"','  ${EndIf}','!macroend');
 fs.writeFileSync(path.join(__dirname,'owned-files.nsh'),lines.join('\r\n'));
};
