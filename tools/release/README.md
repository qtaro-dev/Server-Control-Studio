# v0.1.0 公開準備・停止条件

本体バージョンはpackage.json、画面表示はapp-info.js、配布先・権利者・連絡先はpackage.jsonのdistributionを参照します。
この案件はElectron/JavaScriptです。WPFのICommand構造は存在せず、既存の用途限定IPC・イベントの責務を維持しています。

## 対象機能

19モジュール、9テーマ、4タブ、生成結果の可変レイアウト、名前付きフォルダ一式保存、Compose version属性廃止、Compose管理の登録・診断・既知Node.js HTTPサンプル補完・差分/バックアップ・基本Docker操作を対象とします。
管理画面は任意コマンド・ボリューム削除・全Docker管理・常時監視・自動復元を提供しません。

## 現在の停止条件

2026-11-01更新：未解決モジュールロゴ15点はMITの汎用図形へ置換し、旧4公式ロゴとAI9点は保持しました。残る停止条件はAI画像/Docker商標、FFmpegとNSISプラグイン等の対応ソース・配布義務、Portable等の未確認実機操作です。詳細と今回の最終候補は[RESULTS.md](RESULTS.md)の最新節を参照してください。過去の候補や過去の成功記録を今回の再試験として扱いません。

`npm run verify:release`は未解決事項を表示します。`node scripts/verify-release.cjs --assert-ready`は、最終公開承認・画像権利確認・第三者ソース提供義務の確認が全部完了していなければ失敗します。
単にビルドとテストが成功しても公開可能とは扱いません。distributionのフラグを推測でtrueにしません。

著作権者は利用者指示によりqtaro-dev、連絡先は配布リポジトリのIssues。個人メールは公開しません。第三者ライセンス全文に含まれる権利者の連絡先は改変しません。
利用許諾の配布前の文言確認、素材の取得元・使用許可、LGPL/CPL等の対応ソース・再リンク条件を確認してから最終判断します。

## GitHubの調査（2026-10-31）

- 開発リポジトリはPublic。接続アカウントはadmin権限あり。API上は公開Fork 0件、has_pages=false。権限/契約条件を含む最終可否は変更直前にも再確認します。
- 配布用予定名は接続アカウントで404。作成・上書きはしていません。作成前に再照合します。
- 公開Releaseはv0.2.2とv0.2.1。変更・削除していません。Private化後、権限のない利用者は従来のソース・Issues・Actions・Releaseリンクにアクセスできなくなるため、移行案内・必要な配布物の保全計画が必要です。
- [GitHub公式](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)では公開ForkはPrivate化されません。取得済みコード、過去のISC宣言、第三者が保持するコピーの権利は今回の独自利用許諾で取り消せると扱いません。
- Pagesは現在存在する表示ではありませんが、Private化時のプラン別制限・カスタムドメインは変更直前に確認します。
- Actionsの設定APIは未認証読取で401。現在の管理設定・Private後の利用可能分数/課金/保持期間は未確認。既存ワークフロー履歴は変更しません。
- ポートフォリオのURLが未提示のため、外部サイト全体のリンク修正範囲は未確認。ローカルの公開文書から内部Run/PR等へのリンクは除外しました。

## 分離構成

開発用にはソース・履歴・CI・テスト・内部資料を残します。配布用は新しい空のフォルダへ許可リストで作成し、Forkやgit cloneで作りません。
`node scripts/prepare-public.cjs <release内の出力親>`で、repository/（README・利用許諾・第三者表示・マニュアル・更新履歴）とrelease-assets/（EXE・SHA-256用）を分けます。
実行時JavaScriptはElectronのapp.asarに必要です。ASARは暗号化やソース保護ではありません。マニュアルのJavaScriptと利用者向けレシピサンプルも文書の一部であり、開発用ソースツリーと区別します。

## CI/CD

release-validation.ymlはworkflow_dispatchのみ、contents:read、認証情報なし。単体/Electron/35レシピconfig/ビルド/同梱検査を行い、公開機能とEXEアップロードはありません。全体npm auditの未解決事項はローカル記録を確認し、実行時のみのaudit結果と混同しません。
実GitHub CIは未実行です。pushや公開は承認待ちです。
将来の自動公開を設ける場合は、配布先1リポジトリだけを許可するGitHub App installation token（contents:write、metadata:read）を推奨する設計とし、秘密鍵は保護環境のSecretsに置きます。短命トークン、承認付きenvironment、固定ブランチ、成果物ハッシュ照合を組み合わせます。今回AppやSecrets、環境、workflow_run公開経路は作成・有効化していません。開発側GITHUB_TOKENは他リポジトリへの書込みに流用しません。

## 承認後の最終操作

1. 素材・第三者義務・脆弱性/検証の残項目を解決し、最終候補のハッシュを確定。
2. 開発用の差分をレビューし、承認されたpush/CIを実行。Private化の影響と既存Releaseの移行方針を最終確認。
3. 承認後に開発リポジトリをPrivateへ変更。
4. 同名不存在を再確認して、配布用を空のPublicリポジトリとして作成。新しい独立Git履歴で公開用ファイルだけを登録。
5. 承認されたタグ/ReleaseへInstaller・Portable・SHA256SUMSをアップロード。開発履歴、パッチ、内部検証ログは含めない。
6. 匿名アクセス・ダウンロード・ハッシュ・手順・外部リンクを再確認。
