/* Release 1最終修正の表示文言。main/renderer/生成ガイドで同じ定義を使う。 */
(function(root,factory){const value=factory();if(typeof module==='object'&&module.exports)module.exports=value;else root.Release1Text=value;})(typeof window==='object'?window:globalThis,()=>({
  starterLabel:'最低限の起動用ファイルを生成する',
  starterHint:'生成されるNode.jsアプリは、Docker環境の起動確認を目的とした最小構成です。本番運用向けのアプリケーションではありません。実際の開発では、利用者自身のアプリケーションに置き換えてください。',
  starterOn:'Node.jsのpackage.json・npm生成のpackage-lock.json・server.cjsを追加生成します。npm run devで0.0.0.0:3000に待ち受ける起動確認用アプリです。既存の初期アプリ関連ファイルがあれば、その組を上書きせず保持します。',
  starterOff:'初期ファイル生成はOFFです。package.json・一致するpackage-lock.json・起動用ソースを利用者が用意するまでビルド・起動できません。scripts.devと0.0.0.0:3000の待受を確認してください。',
  starterExternal:'Node.js初期ファイルはnodejs/に生成します。外部のバインドマウント先には書き込みません。そのマウント先にも同じpackage.json・lock・ソースを配置するまで起動できません。',
  starterCustomCommand:'初期アプリの標準起動コマンドはnpm run devです。カスタム起動コマンドに必要な追加ファイルは利用者が用意してください。',
  preservedTitle:'既存アプリを保持（上書きしません）',
  preservedResult:'既存アプリ関連ファイルは上書きせず保持しました。package.json・lock・起動ソースの整合性は起動前に確認してください。',
  guideSources:'生成された初期Node.jsアプリ以外のアプリ・依存ファイルは利用者が準備してください。Node.jsの初期ファイル生成がOFFの場合も準備が必要です。'
}));
