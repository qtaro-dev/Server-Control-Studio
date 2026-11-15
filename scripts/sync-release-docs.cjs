// バージョン表記はpackage.jsonから生成し、利用許諾/第三者表示もオフラインで参照可能にする。
const fs=require('node:fs'),path=require('node:path'),pkg=require('../package.json'),info=require('../app-info').describeApp();
const root=path.resolve(__dirname,'..');
for(const name of ['index.html','recipes.html']){
 const file=path.join(root,'docs/manual',name);let text=fs.readFileSync(file,'utf8');
 text=text.replace(/v?0\.3\.0(?:-dev\.0)?(?: Release 1)?/g,`v${pkg.version}`).replaceAll(' · 開発中機能を含む','').replaceAll(' / 現行開発版','').replaceAll('（開発版）','').replaceAll('CHAPTER 11 · 開発中','CHAPTER 11').replaceAll('現行開発版','本バージョン').replaceAll('開発中の管理機能','管理機能').replaceAll('開発中の変更','本バージョンの機能').replaceAll('開発中機能','本バージョンの機能');
 text=text.replace(/<a[^>]*href="https:\/\/github\.com\/qtaro-dev\/docker-builder-tool\/actions\/runs\/[^"]*"[^>]*>[^<]*<\/a>/g,'過去の実動作検証記録は開発用資料で管理しています。');
 text=text.replace('既存のReleaseや配布EXEが更新されたことを示すものではありません。','正式な配布先と対象バージョンを確認してください。');
 text=text.replace('配布済みEXEに管理機能が含まれるとは限りません。','旧バージョンのEXEでは操作が異なる場合があります。');
 // 公開用マニュアルはWindows配布版の操作を案内し、非公開ソースの取得を前提にしない。
 text=text.replace('<td>ソースからアプリを起動する</td><td>Windowsの作業フォルダに現行ソース、Node.js 22.12以上とnpm。既存の依存設定はElectron 45.0.0です。</td>',
 '<td>アプリを起動する</td><td>Windows x64向けのInstaller版、またはPortable版を使用します。Node.jsやElectronを別途インストールする必要はありません。</td>');
 text=text.replace(/<h3>ソースからアプリを起動する<\/h3><ol>[\s\S]*?<\/ol>/,
 `<h3>Windows配布版を起動する</h3><ol><li>Installer版はインストール後、スタートメニューから起動します。Portable版は書込み可能な専用フォルダへ置き、EXEを起動します。</li><li>「ヘルプ」→「バージョン情報」で <code>v${pkg.version}</code> を確認します。</li><li>更新前には設定・プロジェクトを別の場所へバックアップしてください。</li></ol>`);
 if(!text.includes('id="license-information"'))text=text.replace('<footer',`<aside class="note" id="license-information"><strong>無料フリーウェア・利用許諾</strong><p>個人・商用環境で利用できます。ソフト本体の無断再配布・販売は原則禁止です。現状有姿で提供し、動作・サポートを保証しません。<a href="LICENSE.txt">利用許諾全文</a>と<a href="THIRD_PARTY_NOTICES.txt">第三者著作権表示</a>を確認してください。第三者ソフトウェア・ロゴの権利は各権利者に帰属します。</p></aside><footer`);
 fs.writeFileSync(file,text);
}
for(const name of ['LICENSE.txt','THIRD_PARTY_NOTICES.txt'])fs.copyFileSync(path.join(root,name),path.join(root,'docs/manual',name));
fs.cpSync(path.join(root,'legal/third-party'),path.join(root,'docs/manual/third-party'),{recursive:true,filter:p=>fs.statSync(p).isDirectory()||/\.(txt|html)$/.test(p)});
console.log('Synchronized manual version and license resources:',info.displayVersion);
