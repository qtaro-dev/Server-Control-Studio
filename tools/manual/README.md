# 正規マニュアルの検査（開発者向け）

全レシピを最大6件ずつGitHubのDocker環境で構築する計画は[recipe-ci.md](recipe-ci.md)、初期チェックリストは[recipe-ci-checklist.md](recipe-ci-checklist.md)を参照してください。実Actions実行前の項目にはOKを付けません。

配布対象は `docs/manual/` 一式のみです。HTML2ページ、CSS・JavaScript、art・images・icons・examplesで構成されます。

- 操作ガイド表紙の「レシピ集を開く」で、キャラクター付きレシピ表紙へ移動します。
- レシピ表紙の「操作ガイドへ戻る」と両ページ末尾のリンクで往復できます。
- 元のdocs691ファイルは `docs/OLD/` へ無変更で退避しています。アーカイブのマニフェストは `docs/OLD/docs-archive-manifest-2026-10-27.json`。
- READMEの技術資料リンクはOLDへ、画面画像は現行マニュアルの画像へ更新しました。

リポジトリルートで実行します。

```powershell
python tools/manual/verify-current-docs.py
python tools/manual/audit-links.py
npm test
```

`verify.py`は旧資料退避時のソースハッシュも固定照合する当時の検査です。現行開発版の文書更新には`verify-current-docs.py`を使用します。`verify-generation.cjs`も旧生成物との厳密比較用記録です。現行35レシピの生成回帰は`npm test`内の`manual-recipes-validation.test.js`が本体の生成処理で検査します。

`verify-browser.cjs`はElectronでローカルHTMLを開く専用描画試験です。子プロセスのELECTRON_RUN_AS_NODEを除外して起動してください。証跡・隔離プロファイルはこのフォルダの`qa/`に保存し、公開用docsには置きません。

Chromiumでページ往復・レシピ側キャラクター・全画像・目次11章・全レシピの遷移・検索・初級/中級/上級の絞り込み・解除・拡大/閉じる/Esc・1280×720/560px・オフライン表示・A4印刷用CSSを検証します。PDFや実印刷は行いません。

## 現行開発版への操作ガイド更新（2026-10-30）

- `docs/manual/index.html`は既存デザインを維持し、4タブ説明・第6章の一式保存・第11章の管理操作を更新。全面更新では`recipes.html`の全35構成に現行の入力/生成画面を配置しました。
- 生成→名前付きフォルダ保存→登録→必須/任意の診断→Node.js HTTPサンプル補完→Docker操作→編集差分/バックアップを説明します。開発中機能と配布済みReleaseを区別し、既存Composeのversion属性は自動変換しない旨も記載しています。
- `capture-current-ui.cjs`をNode.jsから実行すると、現行アプリの一時コピーをWindows Tempに作り、専用プロファイルと専用サンプルで実UIを撮影します。全面更新後は96枚の`images/ui-20261030-<用途>-<内容ハッシュ>.png`です。旧49枚は`docs/OLD/screenshots-before-2026-10-30/`へ退避し、加工・再利用していません。
- OSの保存先・登録先選択と確認だけを撮影器で指定します。生成・一式保存・登録・診断・Nodeサンプル補完・差分確認・Node.jsサンプルの保存とバックアップは実処理です。Docker接続・起動は撮影時には実行しません。Docker操作画像は空の操作前画面です。撮影環境を実Docker成功の証跡には扱いません。
- ライト/ダークの管理画面、1280×720の操作画面、1280×900の説明用画面を撮影。撮影先は個人名を含まない一時フォルダで、終了時に専用コピーとサンプルを削除します。利用者の既存設定・登録一覧・稼働環境には触れません。
- `verify-current-docs.py`はリンク・画像・重複ID・注記番号・新規PNGの寸法/使用状況・READMEリンクを検査。全面更新の証跡は`qa/full-refresh/`、撮影・テストのログは`release/manual-full-*.log`へ保存し、配布用本文に混在させません。
- 全96画像の用途・参照先・テーマ・寸法と旧49画像の対応は[スクリーンショット対応表](screenshot-inventory.md)を参照してください。`publish-screenshots.cjs`は参照差し替え/旧画像退避用の一回限りの処理です。既存退避先があれば停止するので、上書き目的で再実行しません。`review-full.cjs`は全章/レシピの2解像度での巡回と目視用一覧を作成します。

### この更新での確認結果

- 静的検査：HTML 13ファイル、リンク401件、画像/CSS/JavaScript等123資産。欠落・リンク切れ0。新規画面96枚の使用と寸法を確認。
- Chromium：11章の目次、35レシピのリンク・検索・難易度絞り込み・解除、画像拡大/閉じる/Esc、ページ往復、オフライン、1280×720/560px、OS light/dark、A4印刷CSSを確認。印刷ダイアログやPDF出力は未実施。
- リンク実体155件：表示またはダウンロード開始を確認。ダウンロード保存は取り消し。ApacheのサンプルHTMLは期待した本文を表示し、元マニュアルも保持。
- 全35構成の実UI生成Composeを、レシピ入力に基づく本体共通生成器の出力と完全一致で照合。
- 全面更新後、96画像全件の拡大/読み込み/閉じる、全11章・35レシピの1280×720/1920×1080表示を確認しました。参照対応表は`screenshot-inventory.md`、全件の目視用一覧は`qa/full-refresh/`に保持しています。旧画像49枚・不採用の途中撮影28枚・未使用イラスト1枚・Thumbs.db 1件をOLDへ保全し、公開用のスクリーンショットは参照中の96枚のみです。
- `npm test`：77件成功。`npm run test:electron`：成功（同梱マニュアルメニュー・4タブUI・既存機能を含む）。テストのDocker応答は模擬で、今回新たに実Dockerを起動していません。
- アプリ本体・設定・Compose生成ロジック・既存サンプルCompose・既存ユーザーデータはこの文書作業では変更していません。既存の未コミット変更は保持。コミット・push・配布EXE更新は未実施。

公開UIにはレシピ件数の固定表示と検証区分バッジ・絞り込みを表示しません。必要な追加設定・利用上の注意は本文に残しています。


全ハイパーリンクの検査：`python tools/manual/audit-links.py`。HTMLサンプルを含む全HTMLを走査し、ファイルとフラグメントを確認します。`verify-link-targets.cjs`をElectronで起動すると、各実体ファイルが表示されるかダウンロードを開始するかも確認します（保存は取り消す）。HTMLサンプルの別画面表示と元マニュアルの維持も検証します。

## 難易度と上級サンプル

難易度は必要な追加設定・連携・切り分けの複雑さで分類し、各記事に理由を記載しています。現在の入力定義は`recipe-inputs.json`に保持します。生成確認は現行アプリの共通生成器を使用します。

追加した3例はNginx＋Node.js＋PostgreSQL＋Redis、Nginx＋Flask＋PostgreSQL＋Redis、Nginx＋WordPress＋MariaDB＋phpMyAdminです。アプリ生成物と利用者が準備する追加ファイルを分離しています。`extend-recipes.cjs`は一回限りの制作記録で、追加済みの場合は停止します。再生成用には実行しません。

```powershell
node tools/manual/verify-advanced.cjs
python tools/manual/verify-python-sample.py
node tools/manual/verify-advanced-ui.cjs
```

Node/Pythonのキャッシュ処理はDB・Redisの代替オブジェクトで、キャッシュヒット・TTL・更新・無効化・障害時処理を検証します。実DB・Redis接続ではありません。UI検査は隔離した実アプリコピーから3例を生成し、配布生成物との一致を確認します。PowerShellのバックアップは構文のみ検査し、バックアップ・復旧は実行していません。Docker起動・依存パッケージのインストール・HTTP/DB実接続は今回行っていません。

2026-10-27の検査：35例の共通生成器との一致、追加3例の実Electron UI生成、391リンク（実体155ファイル）、Chromiumの表示・検索・3難易度の絞り込み・印刷CSS、既存npmテスト39件と`npm run test:electron`が成功。証跡は`qa/`にあり、公開マニュアルには含めません。
