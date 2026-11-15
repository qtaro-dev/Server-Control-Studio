# プロジェクト専用npm

Node.jsの既存インストールはそのまま使用します。CIのNode版はルートの `.node-version`、npm版・公式アーカイブ・SRIは `toolchain.json` で管理します。`package.json` の `packageManager` はその版と一致させます。

初回だけ、リポジトリのルートで実行します。

```powershell
node tools/npm/bootstrap.cjs
```

公式npmアーカイブをSRIで検査し、`.tools/` へ導入します。既存npmのCLIは、この明示的な初期導入にだけ使用します。グローバルインストール・グローバル設定・親プロセスのPATHは変更しません。

通常の開発とビルドでは、次のランチャーを使います。

```powershell
node tools/npm/run.cjs ci
node tools/npm/run.cjs ls --all
node tools/npm/run.cjs audit
node tools/npm/run.cjs audit --omit=dev
node tools/npm/run.cjs test
node tools/npm/run.cjs run test:electron
npm start
node tools/npm/run.cjs run build:win
```

専用npmがない・版が違う・検査に失敗した場合は停止します。グローバルnpmへの自動切替はありません。子ビルド処理のPATHも専用npmを優先し、プロジェクトの `ci` はroot postinstallの完了記録を確認します。`ignore-scripts` でElectron導入やtemp修正を省略したインストールを成功扱いにしません。

既存85テストに依存互換性4件・temp API4件・対象外書換え防止8件を加え、`test` は101件を実行します。CIは旧依存から採取した `test/fixtures/dependency-contract.json` と比較します。任意の `DBT_BASELINE_ROOT` を指定すると、保全した旧依存との実比較も追加します。脆弱な旧依存をCIへ再導入しません。

GitHub Actionsは `.github/actions/project-toolchain` を共有します。初期導入後の `ci`・監査・テスト・ビルドはすべて同じランチャーです。Actions自体の実行確認はpush等の承認後に行います。

更新時はnpmの公式アーカイブとSRI、Node要件、lock、temp修正、全回帰、Windows配布物を再確認します。`temp` の版やハッシュ検査を通すためだけに許容値を変更しないでください。
