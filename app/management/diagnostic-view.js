// 検出処理とは分離し、表示用にパス単位の理由と必須/任意をまとめる。
const path=require('node:path');
function groupIssues(issues,platform=process.platform){
 const grouped=new Map();
 for(const issue of issues){const normalized=path.posix.normalize(String(issue.path).replaceAll('\\','/').replace(/^\.\//,''));const key=platform==='win32'?normalized.toLowerCase():normalized;
  if(!grouped.has(key))grouped.set(key,{path:normalized,required:false,reasons:[]});
  const entry=grouped.get(key);entry.required ||= issue.required!==false;
  for(const reason of issue.reasons||[issue.message])if(reason&&!entry.reasons.includes(reason))entry.reasons.push(reason);
 }
 return [...grouped.values()].map(entry=>({...entry,message:entry.reasons.join(' / ')}));
}
module.exports={groupIssues};
