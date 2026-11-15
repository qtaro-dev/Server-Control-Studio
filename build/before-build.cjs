// 日本語のLicenseDataをシステムANSIとして解釈させない。原本の文面は変更しない。
const fs=require('node:fs'),path=require('node:path');
module.exports=async()=>{
 const root=path.resolve(__dirname,'..');
 const text=fs.readFileSync(path.join(root,'LICENSE.txt'),'utf8').replace(/^\uFEFF/,'').replace(/\r?\n/g,'\r\n');
 fs.writeFileSync(path.join(__dirname,'license-utf16le.txt'),Buffer.concat([Buffer.from([0xff,0xfe]),Buffer.from(text,'utf16le')]));
 // electron-builderではfalse/undefinedが依存処理の外部委譲を意味するため、通常処理を継続する。
 return true;
};
