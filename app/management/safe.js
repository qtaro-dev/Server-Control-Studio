const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),YAML=require('yaml');
const secretName=/(?:password|passwd|token|secret|private[_-]?key|api[_-]?key|credential)/i;
const privateFile=p=>/(^|\/)(?:\.env(?:\..*)?|[^/]*\.(?:pem|key|pfx|p12))$/i.test(p);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function parse(text){if(Buffer.byteLength(text)>1024*1024)throw Error('構成ファイルが大きすぎます（上限1MB）。');const doc=YAML.parseDocument(text,{uniqueKeys:true});if(doc.errors.length)throw Error('YAML構文を確認してください：'+doc.errors[0].message.split('\n')[0]);const obj=doc.toJS({maxAliasCount:50});if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error('Composeの構成がオブジェクトではありません。');let count=0;const stack=new WeakSet();function check(value,depth){if(++count>50000||depth>64)throw Error('構成の深さまたは要素数が上限を超えています。');if(!value||typeof value!=='object')return;if(stack.has(value))throw Error('循環するYAML参照は扱えません。');stack.add(value);for(const key of Object.keys(value)){if(['__proto__','constructor','prototype'].includes(key))throw Error('安全に扱えない構成キーです。');check(value[key],depth+1);}stack.delete(value);}check(obj,0);return obj;}
async function local(root,relative,{missing=false}={}){
 if(typeof relative!=='string'||relative.length>600||relative.includes('\0')||relative.includes('\\')||path.isAbsolute(relative)||relative.split('/').some(s=>!s||s==='.'||s==='..'||s.includes(':')||s.toLowerCase()==='.git'))throw Error('プロジェクト外または不正なパスです。');
 let current=root;for(const part of relative.split('/')){current=path.join(current,part);try{const s=await fs.lstat(current);if(s.isSymbolicLink())throw Error('リンクを経由したファイル操作はできません。');}catch(e){if(e.code!=='ENOENT'||!missing)throw e;}}
 return current;
}
async function read(root,relative){const target=await local(root,relative);const s=await fs.stat(target);if(!s.isFile()||s.size>1024*1024)throw Error('通常の1MB以下のファイルのみ扱えます。');return fs.readFile(target,'utf8');}
function mask(text){
 const lines=text.split('\n'),values=[],hidden=[];let blockIndent=-1;
 const masked=lines.map((line,index)=>{const indent=line.match(/^\s*/)[0].length;const block=blockIndent>=0&&(line.trim()===''||indent>blockIndent);if(!block)blockIndent=-1;
  if(block||secretName.test(line)&&/[:=]/.test(line)||/-----BEGIN .*PRIVATE KEY-----/.test(line)){
   if(/[|>]\s*$/.test(line))blockIndent=indent;
   const token='[非表示-'+crypto.randomUUID()+']';hidden.push({token,line});const m=line.match(/[:=]\s*["']?([^"'\r\n]+)["']?\s*$/);if(m&&m[1].trim().length)values.push(m[1].trim());return token;
  }return line;});return {text:masked.join('\n'),hidden,values};
}
function restore(text,hidden){for(const item of hidden){if(text.split(item.token).length!==2)throw Error('機密値の非表示行は削除・複製・編集できません。');text=text.replace(item.token,item.line);}if(/\[非表示-/.test(text))throw Error('不明な機密値プレースホルダーです。');return text;}
function redactor(values=[]){return input=>{let text=String(input||'');for(const value of [...new Set(values)].filter(v=>typeof v==='string'&&v.length).sort((a,b)=>b.length-a.length))text=text.split(value).join('[非表示]');return text.replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g,'[秘密鍵は非表示]').replace(/((?:password|passwd|token|secret|api[_-]?key)\s*[:=]\s*)[^\s,;]+/gi,'$1[非表示]').replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/g,'$1[非表示]@').slice(-200000);};}
module.exports={parse,local,read,hash,mask,restore,redactor,privateFile,secretName};
