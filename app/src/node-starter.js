/* 生成処理から使う起動確認用アプリ。任意のホストパスへは出力しない。 */
(function(root,factory){const node=typeof module==='object'&&module.exports;const api=factory(node?require('./node-starter-data'):root.NodeStarterData,node?require('./release1-text'):root.Release1Text);if(node)module.exports=api;else root.NodeStarter=api;})(typeof window==='object'?window:globalThis,(data,texts)=>{
 const enabled=cfg=>cfg.generateStarter!==false&&cfg.generateStarter!=='false';
 function files(cfg){
  if(!enabled(cfg))return [];
  const directories=['nodejs'];
  // プロジェクト内の安全な相対マウントだけは、ビルド用と実行用の両方へ同じ初期アプリを置く。
  const bind=String(cfg.dataStorePath||'./nodejs').replace(/\\/g,'/');
  if(cfg.dataStoreType==='bind'&&/^\.\/(?:[a-zA-Z0-9_-][a-zA-Z0-9_.-]*\/?)+$/.test(bind)&&!bind.split('/').slice(1).some(p=>p==='..'||/[.]$/.test(p))){const dir=bind.slice(2).replace(/\/$/,'');if(dir!=='nodejs')directories.push(dir);}
  return directories.flatMap(directory=>Object.entries(data).map(([filename,content])=>({moduleId:'nodejs',filename,relativePath:directory+'/'+filename,content})));
 }
 return {enabled,files,texts};
});
