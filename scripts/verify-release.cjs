// 公開許可と権利監査は、単にビルドできたことから推定しない。
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const pkg=require('../package.json');
function releaseBlockers(manifest=pkg){const d=manifest.distribution;return [['publicationApproved','最終公開承認'],['assetsApproved','画像・ロゴの権利確認'],['thirdPartyComplianceApproved','第三者の対応ソース等の義務確認']].filter(([key])=>d[key]!==true).map(([,label])=>label);}
if(require.main===module){
 const blockers=releaseBlockers();console.log(JSON.stringify({version:pkg.version,readyToPublish:blockers.length===0,blockers},null,2));
 if(process.argv.includes('--assert-ready'))assert.equal(blockers.length,0,'Release must remain local until all checks and approval are complete');
}
module.exports={releaseBlockers};
