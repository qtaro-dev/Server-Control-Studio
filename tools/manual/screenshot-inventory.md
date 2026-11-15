# スクリーンショット全件調査・差し替え対応表

> 最新：2026-11-01に汎用アイコン反映後の96画面へ更新。現行一覧は末尾の「2026-11-01 現行画像」を参照。以下の過去の撮影条件・検証結果は履歴です。

確認日：2026-10-30。対象：codex/docker-environment-managementの現行実装（アプリ内表示0.3.0 Release 1、開発中機能を含む）。

## 調査範囲と方針

操作ガイド・レシピ集・ルートREADME・関連Markdown/HTMLの参照を確認。履歴資料のdocs/OLDは現行操作資料と区別し、過去の実画面を現行画面として再利用しません。ペンギン等のイラストとモジュールアイコンはUIスクリーンショットではないため既存素材を維持しています。

更新前はPNG49枚（掲載34枚、未掲載15枚）とThumbs.db 1件。旧UI/以前の撮影分を含めすべて再撮影で置換しました。現行の掲載画像は96枚（基本/管理/設定26枚＋35レシピ×2枚）で、旧画像参照・欠落・未使用スクリーンショットは0です。

## 現行画像と参照先（96枚）

画像は全て専用一時コピーで撮影した無加工のElectron実画面です。ファイル名に日付と内容SHA-256の先頭10桁を含め、以前のURLがブラウザキャッシュで残ることを避けています。各画像の全SHA-256、寸法、テーマ、選択タブはqa/full-refresh/capture.jsonに記録。画像のクリックで原寸拡大できます。

|画像|用途|参照先|テーマ・寸法|確認結果|
|---|---|---|---|---|
|[modules](../../docs/OLD/logo-transition-JyMafG/ui-20261031-modules-2344fd830e.png)|4タブとモジュール選択|[index.html#screen-modules](../../docs/manual/index.html#screen-modules)・README|light / 1280×900|実画面・表示・目視確認済み|
|[selected-light](../../docs/OLD/logo-transition-JyMafG/ui-20261031-selected-light-d7b14c5a75.png)|ライトテーマで選択した行|[index.html#shot-selected-light](../../docs/manual/index.html#shot-selected-light)|light / 1280×900|実画面・表示・目視確認済み|
|[selected-dark](../../docs/OLD/logo-transition-JyMafG/ui-20261031-selected-dark-60a03313fc.png)|ダークテーマの選択ハイライト|[index.html#shot-selected-dark](../../docs/manual/index.html#shot-selected-dark)|dark / 1280×900|実画面・表示・目視確認済み|
|[accordion](../../docs/OLD/logo-transition-JyMafG/ui-20261031-accordion-61b8426839.png)|モジュール別の折りたたみと確認|[index.html#shot-accordion](../../docs/manual/index.html#shot-accordion)|light / 1280×900|実画面・表示・目視確認済み|
|[confirmed](../../docs/OLD/logo-transition-JyMafG/ui-20261031-confirmed-51d82f3745.png)|全件確認後は構成を実行できます|[index.html#shot-confirmed](../../docs/manual/index.html#shot-confirmed)|light / 1280×900|実画面・表示・目視確認済み|
|[review-reset](../../docs/OLD/logo-transition-JyMafG/ui-20261031-review-reset-25c6ef8da4.png)|設定値変更で確認済みが解除されます|[index.html#shot-review-reset](../../docs/manual/index.html#shot-review-reset)|light / 1280×900|実画面・表示・目視確認済み|
|[password](../../docs/OLD/logo-transition-JyMafG/ui-20261031-password-2bd4af9663.png)|MySQLの秘密値は初期状態でマスク|[index.html#shot-password](../../docs/manual/index.html#shot-password)|light / 1280×900|実画面・表示・目視確認済み|
|[output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-output-2c3a063b44.png)|生成結果と一式保存|[index.html#screen-output](../../docs/manual/index.html#screen-output)・README|light / 1280×900|実画面・表示・目視確認済み|
|[node-files](../../docs/OLD/logo-transition-JyMafG/ui-20261031-node-files-dcfa2fcd60.png)|追加ファイルを切り替える|[index.html#screen-node-files](../../docs/manual/index.html#screen-node-files)|light / 1280×900|実画面・表示・目視確認済み|
|[guide](../../docs/OLD/logo-transition-JyMafG/ui-20261031-guide-d0b960d896.png)|構成ファイルの配置・起動ガイド|[index.html#screen-guide](../../docs/manual/index.html#screen-guide)|light / 1280×900|実画面・表示・目視確認済み|
|[folders](../../docs/OLD/logo-transition-JyMafG/ui-20261031-folders-5080978e90.png)|フォルダ設定と保存・初期化・閉じる|[index.html#shot-folders](../../docs/manual/index.html#shot-folders)|light / 1280×900|実画面・表示・目視確認済み|
|[folder-error](../../docs/OLD/logo-transition-JyMafG/ui-20261031-folder-error-aef509907f.png)|不正なパスはフォルダ設定で修正|[index.html#shot-folder-error](../../docs/manual/index.html#shot-folder-error)|light / 1280×900|実画面・表示・目視確認済み|
|[theme-select](../../docs/OLD/logo-transition-JyMafG/ui-20261031-theme-select-28f02d60e1.png)|9テーマの選択と適用|[index.html#shot-theme-select](../../docs/manual/index.html#shot-theme-select)|light / 1280×900|実画面・表示・目視確認済み|
|[theme-applied](../../docs/OLD/logo-transition-JyMafG/ui-20261031-theme-applied-2cbff10841.png)|適用後は保存ボタン不要|[index.html#shot-theme-applied](../../docs/manual/index.html#shot-theme-applied)|blue / 1280×900|実画面・表示・目視確認済み|
|[about](../../docs/OLD/logo-transition-JyMafG/ui-20261031-about-2b91ef14b9.png)|バージョン情報|[index.html#shot-about](../../docs/manual/index.html#shot-about)|light / 1280×900|実画面・表示・目視確認済み|
|[config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-config-1aa06c4aff.png)|Node.jsの構成入力|[index.html#screen-config](../../docs/manual/index.html#screen-config)・README|light / 1280×900|実画面・表示・目視確認済み|
|[diagnosis](../../docs/OLD/logo-transition-JyMafG/ui-20261031-diagnosis-2121bd834e.png)|登録直後の不足ファイル診断|[index.html#screen-diagnosis](../../docs/manual/index.html#screen-diagnosis)・README|light / 1280×900|実画面・表示・目視確認済み|
|[project-list](../../docs/OLD/logo-transition-JyMafG/ui-20261031-project-list-60a869ecf2.png)|登録済みComposeプロジェクトの一覧|[index.html#screen-project-list](../../docs/manual/index.html#screen-project-list)|light / 1280×900|実画面・表示・目視確認済み|
|[completed](../../docs/OLD/logo-transition-JyMafG/ui-20261031-completed-3a983b7ba8.png)|Node.js HTTPサンプル補完後|[index.html#screen-completed](../../docs/manual/index.html#screen-completed)|light / 1280×900|実画面・表示・目視確認済み|
|[target](../../docs/OLD/logo-transition-JyMafG/ui-20261031-target-c29fa41744.png)|Composeの実行対象を設定|[index.html#screen-target](../../docs/manual/index.html#screen-target)|light / 1280×900|実画面・表示・目視確認済み|
|[operations](../../docs/OLD/logo-transition-JyMafG/ui-20261031-operations-92ed5415af.png)|Docker操作・ログの操作前画面|[index.html#screen-operations](../../docs/manual/index.html#screen-operations)|light / 1280×900|実画面・表示・目視確認済み|
|[edit](../../docs/OLD/logo-transition-JyMafG/ui-20261031-edit-404ba4d071.png)|編集内容の差分確認|[index.html#screen-edit](../../docs/manual/index.html#screen-edit)|light / 1280×900|実画面・表示・目視確認済み|
|[backup](../../docs/OLD/logo-transition-JyMafG/ui-20261031-backup-2801be56cc.png)|保存完了とバックアップ先|[index.html#screen-backup](../../docs/manual/index.html#screen-backup)|light / 1280×900|実画面・表示・目視確認済み|
|[diagnosis-dark](../../docs/OLD/logo-transition-JyMafG/ui-20261031-diagnosis-dark-f9d7955c80.png)|ダークテーマの不足診断|[index.html#screen-diagnosis-dark](../../docs/manual/index.html#screen-diagnosis-dark)|dark / 1280×900|実画面・表示・目視確認済み|
|[operations-dark](../../docs/OLD/logo-transition-JyMafG/ui-20261031-operations-dark-771af0e54a.png)|ダークテーマのDocker操作|[index.html#screen-operations-dark](../../docs/manual/index.html#screen-operations-dark)|dark / 1280×900|実画面・表示・目視確認済み|
|[management-720](../../docs/OLD/logo-transition-JyMafG/ui-20261031-management-720-5928ff3f68.png)|1280×720の管理画面|[index.html#screen-management-720](../../docs/manual/index.html#screen-management-720)|dark / 1280×720|実画面・表示・目視確認済み|
|[nginx-basic-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-basic-config-07f99e5728.png)|Nginx単体：構成入力|[recipes.html#screen-nginx-basic-config](../../docs/manual/recipes.html#screen-nginx-basic-config)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-basic-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-basic-output-b38585ef03.png)|Nginx単体：生成結果|[recipes.html#screen-nginx-basic-output](../../docs/manual/recipes.html#screen-nginx-basic-output)|light / 1280×900|実画面・表示・目視確認済み|
|[apache-basic-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-apache-basic-config-c93b8c2bef.png)|Apache単体：構成入力|[recipes.html#screen-apache-basic-config](../../docs/manual/recipes.html#screen-apache-basic-config)|light / 1280×900|実画面・表示・目視確認済み|
|[apache-basic-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-apache-basic-output-91c1884a45.png)|Apache単体：生成結果|[recipes.html#screen-apache-basic-output](../../docs/manual/recipes.html#screen-apache-basic-output)|light / 1280×900|実画面・表示・目視確認済み|
|[nodejs-basic-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nodejs-basic-config-cf4b5d646a.png)|Node.js単体：構成入力|[recipes.html#screen-nodejs-basic-config](../../docs/manual/recipes.html#screen-nodejs-basic-config)|light / 1280×900|実画面・表示・目視確認済み|
|[nodejs-basic-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nodejs-basic-output-e44feef3b5.png)|Node.js単体：生成結果|[recipes.html#screen-nodejs-basic-output](../../docs/manual/recipes.html#screen-nodejs-basic-output)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-nodejs-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-nodejs-config-8a724397a7.png)|Nginx＋Node.js（独立HTTP）：構成入力|[recipes.html#screen-nginx-nodejs-config](../../docs/manual/recipes.html#screen-nginx-nodejs-config)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-nodejs-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-nodejs-output-635d419fa9.png)|Nginx＋Node.js（独立HTTP）：生成結果|[recipes.html#screen-nginx-nodejs-output](../../docs/manual/recipes.html#screen-nginx-nodejs-output)|light / 1280×900|実画面・表示・目視確認済み|
|[flask-basic-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-flask-basic-config-486d0d8363.png)|Python Flask単体：構成入力|[recipes.html#screen-flask-basic-config](../../docs/manual/recipes.html#screen-flask-basic-config)|light / 1280×900|実画面・表示・目視確認済み|
|[flask-basic-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-flask-basic-output-49a6e92a23.png)|Python Flask単体：生成結果|[recipes.html#screen-flask-basic-output](../../docs/manual/recipes.html#screen-flask-basic-output)|light / 1280×900|実画面・表示・目視確認済み|
|[postgresql-basic-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-postgresql-basic-config-31d119f74c.png)|PostgreSQL単体：構成入力|[recipes.html#screen-postgresql-basic-config](../../docs/manual/recipes.html#screen-postgresql-basic-config)|light / 1280×900|実画面・表示・目視確認済み|
|[postgresql-basic-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-postgresql-basic-output-7b3b876498.png)|PostgreSQL単体：生成結果|[recipes.html#screen-postgresql-basic-output](../../docs/manual/recipes.html#screen-postgresql-basic-output)|light / 1280×900|実画面・表示・目視確認済み|
|[mysql-basic-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-mysql-basic-config-05868dd3b3.png)|MySQL単体：構成入力|[recipes.html#screen-mysql-basic-config](../../docs/manual/recipes.html#screen-mysql-basic-config)|light / 1280×900|実画面・表示・目視確認済み|
|[mysql-basic-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-mysql-basic-output-adaa40199c.png)|MySQL単体：生成結果|[recipes.html#screen-mysql-basic-output](../../docs/manual/recipes.html#screen-mysql-basic-output)|light / 1280×900|実画面・表示・目視確認済み|
|[mariadb-basic-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-mariadb-basic-config-72f91e34a1.png)|MariaDB単体：構成入力|[recipes.html#screen-mariadb-basic-config](../../docs/manual/recipes.html#screen-mariadb-basic-config)|light / 1280×900|実画面・表示・目視確認済み|
|[mariadb-basic-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-mariadb-basic-output-bfec93c73d.png)|MariaDB単体：生成結果|[recipes.html#screen-mariadb-basic-output](../../docs/manual/recipes.html#screen-mariadb-basic-output)|light / 1280×900|実画面・表示・目視確認済み|
|[redis-basic-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-redis-basic-config-e7aab8ec4e.png)|Redis単体：構成入力|[recipes.html#screen-redis-basic-config](../../docs/manual/recipes.html#screen-redis-basic-config)|light / 1280×900|実画面・表示・目視確認済み|
|[redis-basic-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-redis-basic-output-b7f40e2b7c.png)|Redis単体：生成結果|[recipes.html#screen-redis-basic-output](../../docs/manual/recipes.html#screen-redis-basic-output)|light / 1280×900|実画面・表示・目視確認済み|
|[memcached-basic-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-memcached-basic-config-59b83f8de1.png)|Memcached単体：構成入力|[recipes.html#screen-memcached-basic-config](../../docs/manual/recipes.html#screen-memcached-basic-config)|light / 1280×900|実画面・表示・目視確認済み|
|[memcached-basic-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-memcached-basic-output-0e677ea084.png)|Memcached単体：生成結果|[recipes.html#screen-memcached-basic-output](../../docs/manual/recipes.html#screen-memcached-basic-output)|light / 1280×900|実画面・表示・目視確認済み|
|[rabbitmq-basic-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-rabbitmq-basic-config-2f7d592922.png)|RabbitMQ管理・キュー環境：構成入力|[recipes.html#screen-rabbitmq-basic-config](../../docs/manual/recipes.html#screen-rabbitmq-basic-config)|light / 1280×900|実画面・表示・目視確認済み|
|[rabbitmq-basic-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-rabbitmq-basic-output-d2dc357ee3.png)|RabbitMQ管理・キュー環境：生成結果|[recipes.html#screen-rabbitmq-basic-output](../../docs/manual/recipes.html#screen-rabbitmq-basic-output)|light / 1280×900|実画面・表示・目視確認済み|
|[jenkins-basic-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-jenkins-basic-config-fb5cf7f5ff.png)|Jenkins開発・検証環境：構成入力|[recipes.html#screen-jenkins-basic-config](../../docs/manual/recipes.html#screen-jenkins-basic-config)|light / 1280×900|実画面・表示・目視確認済み|
|[jenkins-basic-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-jenkins-basic-output-a1775900e2.png)|Jenkins開発・検証環境：生成結果|[recipes.html#screen-jenkins-basic-output](../../docs/manual/recipes.html#screen-jenkins-basic-output)|light / 1280×900|実画面・表示・目視確認済み|
|[ollama-basic-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-ollama-basic-config-7f6d19c450.png)|Ollama APIの起動：構成入力|[recipes.html#screen-ollama-basic-config](../../docs/manual/recipes.html#screen-ollama-basic-config)|light / 1280×900|実画面・表示・目視確認済み|
|[ollama-basic-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-ollama-basic-output-92d592b0e0.png)|Ollama APIの起動：生成結果|[recipes.html#screen-ollama-basic-output](../../docs/manual/recipes.html#screen-ollama-basic-output)|light / 1280×900|実画面・表示・目視確認済み|
|[portainer-ui-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-portainer-ui-config-75270b9235.png)|Portainer初期画面：構成入力|[recipes.html#screen-portainer-ui-config](../../docs/manual/recipes.html#screen-portainer-ui-config)|light / 1280×900|実画面・表示・目視確認済み|
|[portainer-ui-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-portainer-ui-output-6f0e4dad49.png)|Portainer初期画面：生成結果|[recipes.html#screen-portainer-ui-output](../../docs/manual/recipes.html#screen-portainer-ui-output)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-nodejs-mysql-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-nodejs-mysql-config-752809c8c8.png)|Nginx＋Node.js＋MySQL：構成入力|[recipes.html#screen-nginx-nodejs-mysql-config](../../docs/manual/recipes.html#screen-nginx-nodejs-mysql-config)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-nodejs-mysql-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-nodejs-mysql-output-9e0f4cce0b.png)|Nginx＋Node.js＋MySQL：生成結果|[recipes.html#screen-nginx-nodejs-mysql-output](../../docs/manual/recipes.html#screen-nginx-nodejs-mysql-output)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-nodejs-mariadb-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-nodejs-mariadb-config-f0809da73f.png)|Nginx＋Node.js＋MariaDB：構成入力|[recipes.html#screen-nginx-nodejs-mariadb-config](../../docs/manual/recipes.html#screen-nginx-nodejs-mariadb-config)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-nodejs-mariadb-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-nodejs-mariadb-output-790f061348.png)|Nginx＋Node.js＋MariaDB：生成結果|[recipes.html#screen-nginx-nodejs-mariadb-output](../../docs/manual/recipes.html#screen-nginx-nodejs-mariadb-output)|light / 1280×900|実画面・表示・目視確認済み|
|[apache-nodejs-mysql-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-apache-nodejs-mysql-config-661a196d2f.png)|Apache＋Node.js＋MySQL：構成入力|[recipes.html#screen-apache-nodejs-mysql-config](../../docs/manual/recipes.html#screen-apache-nodejs-mysql-config)|light / 1280×900|実画面・表示・目視確認済み|
|[apache-nodejs-mysql-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-apache-nodejs-mysql-output-d640be95f8.png)|Apache＋Node.js＋MySQL：生成結果|[recipes.html#screen-apache-nodejs-mysql-output](../../docs/manual/recipes.html#screen-apache-nodejs-mysql-output)|light / 1280×900|実画面・表示・目視確認済み|
|[nodejs-postgresql-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nodejs-postgresql-config-d04a494928.png)|Node.js＋PostgreSQL：構成入力|[recipes.html#screen-nodejs-postgresql-config](../../docs/manual/recipes.html#screen-nodejs-postgresql-config)|light / 1280×900|実画面・表示・目視確認済み|
|[nodejs-postgresql-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nodejs-postgresql-output-4e22a00a45.png)|Node.js＋PostgreSQL：生成結果|[recipes.html#screen-nodejs-postgresql-output](../../docs/manual/recipes.html#screen-nodejs-postgresql-output)|light / 1280×900|実画面・表示・目視確認済み|
|[nodejs-redis-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nodejs-redis-config-cdb1f405cc.png)|Node.js＋Redis：構成入力|[recipes.html#screen-nodejs-redis-config](../../docs/manual/recipes.html#screen-nodejs-redis-config)|light / 1280×900|実画面・表示・目視確認済み|
|[nodejs-redis-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nodejs-redis-output-c22d117ed5.png)|Node.js＋Redis：生成結果|[recipes.html#screen-nodejs-redis-output](../../docs/manual/recipes.html#screen-nodejs-redis-output)|light / 1280×900|実画面・表示・目視確認済み|
|[flask-postgresql-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-flask-postgresql-config-c4bdbb5183.png)|Flask＋PostgreSQL：構成入力|[recipes.html#screen-flask-postgresql-config](../../docs/manual/recipes.html#screen-flask-postgresql-config)|light / 1280×900|実画面・表示・目視確認済み|
|[flask-postgresql-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-flask-postgresql-output-e73a7b2488.png)|Flask＋PostgreSQL：生成結果|[recipes.html#screen-flask-postgresql-output](../../docs/manual/recipes.html#screen-flask-postgresql-output)|light / 1280×900|実画面・表示・目視確認済み|
|[flask-redis-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-flask-redis-config-4b93e961df.png)|Flask＋Redis：構成入力|[recipes.html#screen-flask-redis-config](../../docs/manual/recipes.html#screen-flask-redis-config)|light / 1280×900|実画面・表示・目視確認済み|
|[flask-redis-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-flask-redis-output-18eeb0f93d.png)|Flask＋Redis：生成結果|[recipes.html#screen-flask-redis-output](../../docs/manual/recipes.html#screen-flask-redis-output)|light / 1280×900|実画面・表示・目視確認済み|
|[wordpress-mysql-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-wordpress-mysql-config-f18da2c5a8.png)|WordPress＋MySQL：構成入力|[recipes.html#screen-wordpress-mysql-config](../../docs/manual/recipes.html#screen-wordpress-mysql-config)|light / 1280×900|実画面・表示・目視確認済み|
|[wordpress-mysql-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-wordpress-mysql-output-fdec6c0276.png)|WordPress＋MySQL：生成結果|[recipes.html#screen-wordpress-mysql-output](../../docs/manual/recipes.html#screen-wordpress-mysql-output)|light / 1280×900|実画面・表示・目視確認済み|
|[wordpress-mariadb-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-wordpress-mariadb-config-929e302ca4.png)|WordPress＋MariaDB：構成入力|[recipes.html#screen-wordpress-mariadb-config](../../docs/manual/recipes.html#screen-wordpress-mariadb-config)|light / 1280×900|実画面・表示・目視確認済み|
|[wordpress-mariadb-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-wordpress-mariadb-output-fe45c5061a.png)|WordPress＋MariaDB：生成結果|[recipes.html#screen-wordpress-mariadb-output](../../docs/manual/recipes.html#screen-wordpress-mariadb-output)|light / 1280×900|実画面・表示・目視確認済み|
|[laravel-mysql-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-laravel-mysql-config-53b82af658.png)|Laravel＋MySQL：構成入力|[recipes.html#screen-laravel-mysql-config](../../docs/manual/recipes.html#screen-laravel-mysql-config)|light / 1280×900|実画面・表示・目視確認済み|
|[laravel-mysql-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-laravel-mysql-output-669a3f3c8a.png)|Laravel＋MySQL：生成結果|[recipes.html#screen-laravel-mysql-output](../../docs/manual/recipes.html#screen-laravel-mysql-output)|light / 1280×900|実画面・表示・目視確認済み|
|[laravel-postgresql-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-laravel-postgresql-config-a6878e8937.png)|Laravel＋PostgreSQL：構成入力|[recipes.html#screen-laravel-postgresql-config](../../docs/manual/recipes.html#screen-laravel-postgresql-config)|light / 1280×900|実画面・表示・目視確認済み|
|[laravel-postgresql-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-laravel-postgresql-output-e9ce0e5fdc.png)|Laravel＋PostgreSQL：生成結果|[recipes.html#screen-laravel-postgresql-output](../../docs/manual/recipes.html#screen-laravel-postgresql-output)|light / 1280×900|実画面・表示・目視確認済み|
|[redmine-postgresql-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-redmine-postgresql-config-e4d3f75bbc.png)|Redmine＋PostgreSQL：構成入力|[recipes.html#screen-redmine-postgresql-config](../../docs/manual/recipes.html#screen-redmine-postgresql-config)|light / 1280×900|実画面・表示・目視確認済み|
|[redmine-postgresql-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-redmine-postgresql-output-fb7ef819cc.png)|Redmine＋PostgreSQL：生成結果|[recipes.html#screen-redmine-postgresql-output](../../docs/manual/recipes.html#screen-redmine-postgresql-output)|light / 1280×900|実画面・表示・目視確認済み|
|[nodejs-mysql-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nodejs-mysql-config-f8dcd2cb91.png)|Node.js＋MySQL：構成入力|[recipes.html#screen-nodejs-mysql-config](../../docs/manual/recipes.html#screen-nodejs-mysql-config)|light / 1280×900|実画面・表示・目視確認済み|
|[nodejs-mysql-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nodejs-mysql-output-9a0365c37d.png)|Node.js＋MySQL：生成結果|[recipes.html#screen-nodejs-mysql-output](../../docs/manual/recipes.html#screen-nodejs-mysql-output)|light / 1280×900|実画面・表示・目視確認済み|
|[nodejs-mariadb-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nodejs-mariadb-config-a865deda93.png)|Node.js＋MariaDB：構成入力|[recipes.html#screen-nodejs-mariadb-config](../../docs/manual/recipes.html#screen-nodejs-mariadb-config)|light / 1280×900|実画面・表示・目視確認済み|
|[nodejs-mariadb-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nodejs-mariadb-output-4ca61f0f97.png)|Node.js＋MariaDB：生成結果|[recipes.html#screen-nodejs-mariadb-output](../../docs/manual/recipes.html#screen-nodejs-mariadb-output)|light / 1280×900|実画面・表示・目視確認済み|
|[mysql-phpmyadmin-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-mysql-phpmyadmin-config-5b71b9dee3.png)|MySQL＋phpMyAdmin：構成入力|[recipes.html#screen-mysql-phpmyadmin-config](../../docs/manual/recipes.html#screen-mysql-phpmyadmin-config)|light / 1280×900|実画面・表示・目視確認済み|
|[mysql-phpmyadmin-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-mysql-phpmyadmin-output-22a4d8dc44.png)|MySQL＋phpMyAdmin：生成結果|[recipes.html#screen-mysql-phpmyadmin-output](../../docs/manual/recipes.html#screen-mysql-phpmyadmin-output)|light / 1280×900|実画面・表示・目視確認済み|
|[mariadb-phpmyadmin-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-mariadb-phpmyadmin-config-e86ab7b107.png)|MariaDB＋phpMyAdmin：構成入力|[recipes.html#screen-mariadb-phpmyadmin-config](../../docs/manual/recipes.html#screen-mariadb-phpmyadmin-config)|light / 1280×900|実画面・表示・目視確認済み|
|[mariadb-phpmyadmin-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-mariadb-phpmyadmin-output-9e37e86619.png)|MariaDB＋phpMyAdmin：生成結果|[recipes.html#screen-mariadb-phpmyadmin-output](../../docs/manual/recipes.html#screen-mariadb-phpmyadmin-output)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-flask-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-flask-config-0aea914413.png)|Nginx＋Flask：構成入力|[recipes.html#screen-nginx-flask-config](../../docs/manual/recipes.html#screen-nginx-flask-config)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-flask-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-flask-output-26c9738470.png)|Nginx＋Flask：生成結果|[recipes.html#screen-nginx-flask-output](../../docs/manual/recipes.html#screen-nginx-flask-output)|light / 1280×900|実画面・表示・目視確認済み|
|[apache-flask-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-apache-flask-config-ce5f48eea5.png)|Apache＋Flask：構成入力|[recipes.html#screen-apache-flask-config](../../docs/manual/recipes.html#screen-apache-flask-config)|light / 1280×900|実画面・表示・目視確認済み|
|[apache-flask-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-apache-flask-output-5691785ee8.png)|Apache＋Flask：生成結果|[recipes.html#screen-apache-flask-output](../../docs/manual/recipes.html#screen-apache-flask-output)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-nodejs-postgresql-redis-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-nodejs-postgresql-redis-config-09c5d25b96.png)|Nginx＋Node.js＋PostgreSQL＋Redis：構成入力|[recipes.html#screen-nginx-nodejs-postgresql-redis-config](../../docs/manual/recipes.html#screen-nginx-nodejs-postgresql-redis-config)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-nodejs-postgresql-redis-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-nodejs-postgresql-redis-output-57a3dac05d.png)|Nginx＋Node.js＋PostgreSQL＋Redis：生成結果|[recipes.html#screen-nginx-nodejs-postgresql-redis-output](../../docs/manual/recipes.html#screen-nginx-nodejs-postgresql-redis-output)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-flask-postgresql-redis-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-flask-postgresql-redis-config-38d4a0d445.png)|Nginx＋Flask＋PostgreSQL＋Redis：構成入力|[recipes.html#screen-nginx-flask-postgresql-redis-config](../../docs/manual/recipes.html#screen-nginx-flask-postgresql-redis-config)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-flask-postgresql-redis-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-flask-postgresql-redis-output-a8c408e29a.png)|Nginx＋Flask＋PostgreSQL＋Redis：生成結果|[recipes.html#screen-nginx-flask-postgresql-redis-output](../../docs/manual/recipes.html#screen-nginx-flask-postgresql-redis-output)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-wordpress-mariadb-admin-config](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-wordpress-mariadb-admin-config-b15d0d94b3.png)|Nginx＋WordPress＋MariaDB＋phpMyAdmin：構成入力|[recipes.html#screen-nginx-wordpress-mariadb-admin-config](../../docs/manual/recipes.html#screen-nginx-wordpress-mariadb-admin-config)|light / 1280×900|実画面・表示・目視確認済み|
|[nginx-wordpress-mariadb-admin-output](../../docs/OLD/logo-transition-JyMafG/ui-20261031-nginx-wordpress-mariadb-admin-output-591764588e.png)|Nginx＋WordPress＋MariaDB＋phpMyAdmin：生成結果|[recipes.html#screen-nginx-wordpress-mariadb-admin-output](../../docs/manual/recipes.html#screen-nginx-wordpress-mariadb-admin-output)|light / 1280×900|実画面・表示・目視確認済み|

## 旧画像の調査・整理（PNG49枚）

旧画像はdocs/OLD/screenshots-before-2026-10-30/images/へ退避し、削除・加工していません。旧HTML内の注記座標は新しい画面へ流用せず、操作番号は画像直下の説明へ整理しました。

|旧画像|旧参照箇所・用途|対応|
|---|---|---|
|about.png|index.html / バージョン情報|現行実画面へ差し替え・OLDへ保全|
|accordion.png|index.html / モジュール別の折りたたみと確認|現行実画面へ差し替え・OLDへ保全|
|apache-basic-config.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|apache-basic-output.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|confirmed.png|index.html / 全件確認後は構成を実行できます|現行実画面へ差し替え・OLDへ保全|
|current-apache-basic-config.png|recipes.html / Apache単体：構成入力|現行実画面へ差し替え・OLDへ保全|
|current-apache-basic-output.png|recipes.html / Apache単体：生成結果|現行実画面へ差し替え・OLDへ保全|
|current-completed.png|index.html / Node.js HTTPサンプル補完後|現行実画面へ差し替え・OLDへ保全|
|current-config.png|index.html / Node.jsの構成入力|現行実画面へ差し替え・OLDへ保全|
|current-diagnosis-dark.png|index.html / ダークテーマの不足診断|現行実画面へ差し替え・OLDへ保全|
|current-diagnosis.png|index.html / 登録直後の不足ファイル診断|現行実画面へ差し替え・OLDへ保全|
|current-edit.png|index.html / 編集内容の差分確認|現行実画面へ差し替え・OLDへ保全|
|current-flask-basic-config.png|recipes.html / Python Flask単体：構成入力|現行実画面へ差し替え・OLDへ保全|
|current-flask-basic-output.png|recipes.html / Python Flask単体：生成結果|現行実画面へ差し替え・OLDへ保全|
|current-management-720.png|index.html / 1280×720の管理画面|現行実画面へ差し替え・OLDへ保全|
|current-modules.png|index.html / 4タブとモジュール選択|現行実画面へ差し替え・OLDへ保全|
|current-nginx-basic-config.png|recipes.html / Nginx単体：構成入力|現行実画面へ差し替え・OLDへ保全|
|current-nginx-basic-output.png|recipes.html / Nginx単体：生成結果|現行実画面へ差し替え・OLDへ保全|
|current-nginx-nodejs-config.png|recipes.html / Nginx＋Node.js（独立HTTP）：構成入力|現行実画面へ差し替え・OLDへ保全|
|current-nginx-nodejs-output.png|recipes.html / Nginx＋Node.js（独立HTTP）：生成結果|現行実画面へ差し替え・OLDへ保全|
|current-nodejs-basic-config.png|recipes.html / Node.js単体：構成入力|現行実画面へ差し替え・OLDへ保全|
|current-nodejs-basic-output.png|recipes.html / Node.js単体：生成結果|現行実画面へ差し替え・OLDへ保全|
|current-operations-dark.png|index.html / ダークテーマのDocker操作|現行実画面へ差し替え・OLDへ保全|
|current-operations.png|index.html / Docker操作・ログの操作前画面|現行実画面へ差し替え・OLDへ保全|
|current-output.png|index.html / 生成結果と一式保存|現行実画面へ差し替え・OLDへ保全|
|current-postgresql-basic-config.png|recipes.html / PostgreSQL単体：構成入力|現行実画面へ差し替え・OLDへ保全|
|current-postgresql-basic-output.png|recipes.html / PostgreSQL単体：生成結果|現行実画面へ差し替え・OLDへ保全|
|current-target.png|index.html / Composeの実行対象を設定|現行実画面へ差し替え・OLDへ保全|
|flask-basic-config.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|flask-basic-output.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|folder-error.png|index.html / 不正なパスはフォルダ設定で修正|現行実画面へ差し替え・OLDへ保全|
|folders.png|index.html / フォルダ設定と保存・初期化・閉じる|現行実画面へ差し替え・OLDへ保全|
|guide.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|home.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|nginx-basic-config.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|nginx-basic-output.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|nginx-nodejs-config.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|nginx-nodejs-output.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|node-files.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|nodejs-basic-config.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|nodejs-basic-output.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|password.png|index.html / MySQLの秘密値は初期状態でマスク|現行実画面へ差し替え・OLDへ保全|
|postgresql-basic-config.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|postgresql-basic-output.png|現行HTMLで未使用|未使用を確認・OLDへ保全|
|review-reset.png|index.html / 設定値変更で確認済みが解除されます|現行実画面へ差し替え・OLDへ保全|
|selected-dark.png|index.html / ダークテーマの選択ハイライト|現行実画面へ差し替え・OLDへ保全|
|selected-light.png|index.html / ライトテーマで選択した行|現行実画面へ差し替え・OLDへ保全|
|theme-applied.png|index.html / 適用後は保存ボタン不要|現行実画面へ差し替え・OLDへ保全|
|theme-select.png|index.html / 9テーマの選択と適用|現行実画面へ差し替え・OLDへ保全|

旧PNG49枚のほか、途中撮影の不採用PNG28枚、未使用イラスト1枚、Thumbs.db 1件もOLDへ移しました。退避前のSHA-256はOLD内manifest.jsonで照合できます。公開用images/は96枚だけで、全てHTMLから参照されています。

## 検証範囲

- 全11章・35レシピを1280×720と1920×1080でブラウザ巡回。本文のはみ出し、全画像の表示、章/レシピの見た目、ライト/ダークの実UI画像96枚を目視確認。
- 35レシピの実UI出力と共通生成器のComposeを完全一致で照合。新規Composeはservices:で始まり、obsoleteのトップレベルversionは出力されません。
- 画像拡大・閉じる/Esc・目次・検索/絞り込み・ページ往復・オフライン・印刷CSSをブラウザで確認。PDF出力/実印刷は今回行いません。
- 登録・診断・サンプル補完・Node.jsファイルの差分/保存/実バックアップは専用データで実施。OS選択/確認ダイアログだけは撮影器で操作先を指定。Docker操作の画像は操作前の画面で、Docker起動や実ログ取得の成功画像ではありません。今回Dockerコマンドは実行していません。
- 複数モジュールの入力画像は一部パネルを開いた状態です。隠れている項目は各レシピの設定値表とパネル操作で確認する説明を併記しています。

目視用一覧はqa/full-refresh/gallery-01.png〜24.png、本文一覧はpages-01.png〜06.png。テスト用プロファイル・確認画像・JSONは公開用docs/manualに含めません。




<!-- CURRENT-SCREENSHOT-INVENTORY -->
## 2026-11-01 現行画像

対象アプリ：0.1.0 Release 1。全画像は専用コピーの実Electronから撮影。読み込み・拡大・レイアウトは描画検査で確認し、目視の範囲とネイティブ操作の未確認事項はtools/release/RESULTS.mdの最新記録に区別します。旧画像・撮影時のハッシュはdocs/OLDのmanifestとqa/full-refresh/capture.jsonで保持します。

|画面|参照先|テーマ・寸法|
|---|---|---|
|[modules](../../docs/manual/images/ui-20261101-modules-20517c2c56.png)|[index.html#screen-modules](../../docs/manual/index.html#screen-modules)|light / 1280×900|
|[selected-light](../../docs/manual/images/ui-20261101-selected-light-06a066e6bb.png)|[index.html#shot-selected-light](../../docs/manual/index.html#shot-selected-light)|light / 1280×900|
|[selected-dark](../../docs/manual/images/ui-20261101-selected-dark-04d497079a.png)|[index.html#shot-selected-dark](../../docs/manual/index.html#shot-selected-dark)|dark / 1280×900|
|[accordion](../../docs/manual/images/ui-20261101-accordion-9148b4911c.png)|[index.html#shot-accordion](../../docs/manual/index.html#shot-accordion)|light / 1280×900|
|[confirmed](../../docs/manual/images/ui-20261101-confirmed-ab09f7e7bf.png)|[index.html#shot-confirmed](../../docs/manual/index.html#shot-confirmed)|light / 1280×900|
|[review-reset](../../docs/manual/images/ui-20261101-review-reset-4f97a7009c.png)|[index.html#shot-review-reset](../../docs/manual/index.html#shot-review-reset)|light / 1280×900|
|[password](../../docs/manual/images/ui-20261101-password-07f4582cd3.png)|[index.html#shot-password](../../docs/manual/index.html#shot-password)|light / 1280×900|
|[output](../../docs/manual/images/ui-20261101-output-2c3a063b44.png)|[index.html#screen-output](../../docs/manual/index.html#screen-output)|light / 1280×900|
|[node-files](../../docs/manual/images/ui-20261101-node-files-dcfa2fcd60.png)|[index.html#screen-node-files](../../docs/manual/index.html#screen-node-files)|light / 1280×900|
|[guide](../../docs/manual/images/ui-20261101-guide-aaf9445096.png)|[index.html#screen-guide](../../docs/manual/index.html#screen-guide)|light / 1280×900|
|[folders](../../docs/manual/images/ui-20261101-folders-c27e7ff8a1.png)|[index.html#shot-folders](../../docs/manual/index.html#shot-folders)|light / 1280×900|
|[folder-error](../../docs/manual/images/ui-20261101-folder-error-2b4e0ed676.png)|[index.html#shot-folder-error](../../docs/manual/index.html#shot-folder-error)|light / 1280×900|
|[theme-select](../../docs/manual/images/ui-20261101-theme-select-0bfa04015b.png)|[index.html#shot-theme-select](../../docs/manual/index.html#shot-theme-select)|light / 1280×900|
|[theme-applied](../../docs/manual/images/ui-20261101-theme-applied-a35192a681.png)|[index.html#shot-theme-applied](../../docs/manual/index.html#shot-theme-applied)|blue / 1280×900|
|[theme-toggle-light](../../docs/manual/images/ui-20261115-theme-toggle-light-892edd1c87.png)|[index.html#shot-theme-toggle-light](../../docs/manual/index.html#shot-theme-toggle-light)|light / 1024×260|
|[theme-toggle-dark](../../docs/manual/images/ui-20261115-theme-toggle-dark-fe35e136be.png)|[index.html#shot-theme-toggle-dark](../../docs/manual/index.html#shot-theme-toggle-dark)|dark / 1024×260|
|[about](../../docs/manual/images/ui-scs-about-c5fe526afe.png)|[index.html#shot-about](../../docs/manual/index.html#shot-about)|light / 1280×720|
|[config](../../docs/manual/images/ui-20261101-config-26a68b774c.png)|[index.html#screen-config](../../docs/manual/index.html#screen-config)|light / 1280×900|
|[diagnosis](../../docs/manual/images/ui-20261101-diagnosis-e05b5c2f06.png)|[index.html#screen-diagnosis](../../docs/manual/index.html#screen-diagnosis)|light / 1280×900|
|[project-list](../../docs/manual/images/ui-20261101-project-list-a092c6bdee.png)|[index.html#screen-project-list](../../docs/manual/index.html#screen-project-list)|light / 1280×900|
|[completed](../../docs/manual/images/ui-20261101-completed-fea7dbb623.png)|[index.html#screen-completed](../../docs/manual/index.html#screen-completed)|light / 1280×900|
|[target](../../docs/manual/images/ui-20261101-target-85c2da4c48.png)|[index.html#screen-target](../../docs/manual/index.html#screen-target)|light / 1280×900|
|[operations](../../docs/manual/images/ui-20261101-operations-28825e11a9.png)|[index.html#screen-operations](../../docs/manual/index.html#screen-operations)|light / 1280×900|
|[edit](../../docs/manual/images/ui-20261101-edit-c71cac8a69.png)|[index.html#screen-edit](../../docs/manual/index.html#screen-edit)|light / 1280×900|
|[backup](../../docs/manual/images/ui-20261101-backup-5e904e6f76.png)|[index.html#screen-backup](../../docs/manual/index.html#screen-backup)|light / 1280×900|
|[diagnosis-dark](../../docs/manual/images/ui-20261101-diagnosis-dark-193c0d8481.png)|[index.html#screen-diagnosis-dark](../../docs/manual/index.html#screen-diagnosis-dark)|dark / 1280×900|
|[operations-dark](../../docs/manual/images/ui-20261101-operations-dark-3099a5c504.png)|[index.html#screen-operations-dark](../../docs/manual/index.html#screen-operations-dark)|dark / 1280×900|
|[management-720](../../docs/manual/images/ui-20261101-management-720-2a474a8304.png)|[index.html#screen-management-720](../../docs/manual/index.html#screen-management-720)|dark / 1280×720|
|[nginx-basic-config](../../docs/manual/images/ui-20261101-nginx-basic-config-b58266f30e.png)|[recipes.html#screen-nginx-basic-config](../../docs/manual/recipes.html#screen-nginx-basic-config)|light / 1280×900|
|[nginx-basic-output](../../docs/manual/images/ui-20261101-nginx-basic-output-b38585ef03.png)|[recipes.html#screen-nginx-basic-output](../../docs/manual/recipes.html#screen-nginx-basic-output)|light / 1280×900|
|[apache-basic-config](../../docs/manual/images/ui-20261101-apache-basic-config-5d66b4762d.png)|[recipes.html#screen-apache-basic-config](../../docs/manual/recipes.html#screen-apache-basic-config)|light / 1280×900|
|[apache-basic-output](../../docs/manual/images/ui-20261101-apache-basic-output-91c1884a45.png)|[recipes.html#screen-apache-basic-output](../../docs/manual/recipes.html#screen-apache-basic-output)|light / 1280×900|
|[nodejs-basic-config](../../docs/manual/images/ui-20261101-nodejs-basic-config-642f4bd0e8.png)|[recipes.html#screen-nodejs-basic-config](../../docs/manual/recipes.html#screen-nodejs-basic-config)|light / 1280×900|
|[nodejs-basic-output](../../docs/manual/images/ui-20261101-nodejs-basic-output-e44feef3b5.png)|[recipes.html#screen-nodejs-basic-output](../../docs/manual/recipes.html#screen-nodejs-basic-output)|light / 1280×900|
|[nginx-nodejs-config](../../docs/manual/images/ui-20261101-nginx-nodejs-config-5c68958cdf.png)|[recipes.html#screen-nginx-nodejs-config](../../docs/manual/recipes.html#screen-nginx-nodejs-config)|light / 1280×900|
|[nginx-nodejs-output](../../docs/manual/images/ui-20261101-nginx-nodejs-output-635d419fa9.png)|[recipes.html#screen-nginx-nodejs-output](../../docs/manual/recipes.html#screen-nginx-nodejs-output)|light / 1280×900|
|[flask-basic-config](../../docs/manual/images/ui-20261101-flask-basic-config-e78d6a35a6.png)|[recipes.html#screen-flask-basic-config](../../docs/manual/recipes.html#screen-flask-basic-config)|light / 1280×900|
|[flask-basic-output](../../docs/manual/images/ui-20261101-flask-basic-output-49a6e92a23.png)|[recipes.html#screen-flask-basic-output](../../docs/manual/recipes.html#screen-flask-basic-output)|light / 1280×900|
|[postgresql-basic-config](../../docs/manual/images/ui-20261101-postgresql-basic-config-dc90d59ab0.png)|[recipes.html#screen-postgresql-basic-config](../../docs/manual/recipes.html#screen-postgresql-basic-config)|light / 1280×900|
|[postgresql-basic-output](../../docs/manual/images/ui-20261101-postgresql-basic-output-7b3b876498.png)|[recipes.html#screen-postgresql-basic-output](../../docs/manual/recipes.html#screen-postgresql-basic-output)|light / 1280×900|
|[mysql-basic-config](../../docs/manual/images/ui-20261101-mysql-basic-config-4c0a7d8fb8.png)|[recipes.html#screen-mysql-basic-config](../../docs/manual/recipes.html#screen-mysql-basic-config)|light / 1280×900|
|[mysql-basic-output](../../docs/manual/images/ui-20261101-mysql-basic-output-adaa40199c.png)|[recipes.html#screen-mysql-basic-output](../../docs/manual/recipes.html#screen-mysql-basic-output)|light / 1280×900|
|[mariadb-basic-config](../../docs/manual/images/ui-20261101-mariadb-basic-config-ded73d9b49.png)|[recipes.html#screen-mariadb-basic-config](../../docs/manual/recipes.html#screen-mariadb-basic-config)|light / 1280×900|
|[mariadb-basic-output](../../docs/manual/images/ui-20261101-mariadb-basic-output-bfec93c73d.png)|[recipes.html#screen-mariadb-basic-output](../../docs/manual/recipes.html#screen-mariadb-basic-output)|light / 1280×900|
|[redis-basic-config](../../docs/manual/images/ui-20261101-redis-basic-config-4991e836b7.png)|[recipes.html#screen-redis-basic-config](../../docs/manual/recipes.html#screen-redis-basic-config)|light / 1280×900|
|[redis-basic-output](../../docs/manual/images/ui-20261101-redis-basic-output-b7f40e2b7c.png)|[recipes.html#screen-redis-basic-output](../../docs/manual/recipes.html#screen-redis-basic-output)|light / 1280×900|
|[memcached-basic-config](../../docs/manual/images/ui-20261101-memcached-basic-config-f4ddfc8e67.png)|[recipes.html#screen-memcached-basic-config](../../docs/manual/recipes.html#screen-memcached-basic-config)|light / 1280×900|
|[memcached-basic-output](../../docs/manual/images/ui-20261101-memcached-basic-output-0e677ea084.png)|[recipes.html#screen-memcached-basic-output](../../docs/manual/recipes.html#screen-memcached-basic-output)|light / 1280×900|
|[rabbitmq-basic-config](../../docs/manual/images/ui-20261101-rabbitmq-basic-config-384b5935de.png)|[recipes.html#screen-rabbitmq-basic-config](../../docs/manual/recipes.html#screen-rabbitmq-basic-config)|light / 1280×900|
|[rabbitmq-basic-output](../../docs/manual/images/ui-20261101-rabbitmq-basic-output-d2dc357ee3.png)|[recipes.html#screen-rabbitmq-basic-output](../../docs/manual/recipes.html#screen-rabbitmq-basic-output)|light / 1280×900|
|[jenkins-basic-config](../../docs/manual/images/ui-20261101-jenkins-basic-config-dabb7094a5.png)|[recipes.html#screen-jenkins-basic-config](../../docs/manual/recipes.html#screen-jenkins-basic-config)|light / 1280×900|
|[jenkins-basic-output](../../docs/manual/images/ui-20261101-jenkins-basic-output-a1775900e2.png)|[recipes.html#screen-jenkins-basic-output](../../docs/manual/recipes.html#screen-jenkins-basic-output)|light / 1280×900|
|[ollama-basic-config](../../docs/manual/images/ui-20261101-ollama-basic-config-13c4ff9459.png)|[recipes.html#screen-ollama-basic-config](../../docs/manual/recipes.html#screen-ollama-basic-config)|light / 1280×900|
|[ollama-basic-output](../../docs/manual/images/ui-20261101-ollama-basic-output-92d592b0e0.png)|[recipes.html#screen-ollama-basic-output](../../docs/manual/recipes.html#screen-ollama-basic-output)|light / 1280×900|
|[portainer-ui-config](../../docs/manual/images/ui-20261101-portainer-ui-config-c95c4fb788.png)|[recipes.html#screen-portainer-ui-config](../../docs/manual/recipes.html#screen-portainer-ui-config)|light / 1280×900|
|[portainer-ui-output](../../docs/manual/images/ui-20261101-portainer-ui-output-6f0e4dad49.png)|[recipes.html#screen-portainer-ui-output](../../docs/manual/recipes.html#screen-portainer-ui-output)|light / 1280×900|
|[nginx-nodejs-mysql-config](../../docs/manual/images/ui-20261101-nginx-nodejs-mysql-config-97c40b113e.png)|[recipes.html#screen-nginx-nodejs-mysql-config](../../docs/manual/recipes.html#screen-nginx-nodejs-mysql-config)|light / 1280×900|
|[nginx-nodejs-mysql-output](../../docs/manual/images/ui-20261101-nginx-nodejs-mysql-output-9e0f4cce0b.png)|[recipes.html#screen-nginx-nodejs-mysql-output](../../docs/manual/recipes.html#screen-nginx-nodejs-mysql-output)|light / 1280×900|
|[nginx-nodejs-mariadb-config](../../docs/manual/images/ui-20261101-nginx-nodejs-mariadb-config-f864ff0ed3.png)|[recipes.html#screen-nginx-nodejs-mariadb-config](../../docs/manual/recipes.html#screen-nginx-nodejs-mariadb-config)|light / 1280×900|
|[nginx-nodejs-mariadb-output](../../docs/manual/images/ui-20261101-nginx-nodejs-mariadb-output-790f061348.png)|[recipes.html#screen-nginx-nodejs-mariadb-output](../../docs/manual/recipes.html#screen-nginx-nodejs-mariadb-output)|light / 1280×900|
|[apache-nodejs-mysql-config](../../docs/manual/images/ui-20261101-apache-nodejs-mysql-config-120d89454d.png)|[recipes.html#screen-apache-nodejs-mysql-config](../../docs/manual/recipes.html#screen-apache-nodejs-mysql-config)|light / 1280×900|
|[apache-nodejs-mysql-output](../../docs/manual/images/ui-20261101-apache-nodejs-mysql-output-d640be95f8.png)|[recipes.html#screen-apache-nodejs-mysql-output](../../docs/manual/recipes.html#screen-apache-nodejs-mysql-output)|light / 1280×900|
|[nodejs-postgresql-config](../../docs/manual/images/ui-20261101-nodejs-postgresql-config-5314268fb6.png)|[recipes.html#screen-nodejs-postgresql-config](../../docs/manual/recipes.html#screen-nodejs-postgresql-config)|light / 1280×900|
|[nodejs-postgresql-output](../../docs/manual/images/ui-20261101-nodejs-postgresql-output-4e22a00a45.png)|[recipes.html#screen-nodejs-postgresql-output](../../docs/manual/recipes.html#screen-nodejs-postgresql-output)|light / 1280×900|
|[nodejs-redis-config](../../docs/manual/images/ui-20261101-nodejs-redis-config-46950508ee.png)|[recipes.html#screen-nodejs-redis-config](../../docs/manual/recipes.html#screen-nodejs-redis-config)|light / 1280×900|
|[nodejs-redis-output](../../docs/manual/images/ui-20261101-nodejs-redis-output-c22d117ed5.png)|[recipes.html#screen-nodejs-redis-output](../../docs/manual/recipes.html#screen-nodejs-redis-output)|light / 1280×900|
|[flask-postgresql-config](../../docs/manual/images/ui-20261101-flask-postgresql-config-730767b901.png)|[recipes.html#screen-flask-postgresql-config](../../docs/manual/recipes.html#screen-flask-postgresql-config)|light / 1280×900|
|[flask-postgresql-output](../../docs/manual/images/ui-20261101-flask-postgresql-output-e73a7b2488.png)|[recipes.html#screen-flask-postgresql-output](../../docs/manual/recipes.html#screen-flask-postgresql-output)|light / 1280×900|
|[flask-redis-config](../../docs/manual/images/ui-20261101-flask-redis-config-0a82f22baf.png)|[recipes.html#screen-flask-redis-config](../../docs/manual/recipes.html#screen-flask-redis-config)|light / 1280×900|
|[flask-redis-output](../../docs/manual/images/ui-20261101-flask-redis-output-18eeb0f93d.png)|[recipes.html#screen-flask-redis-output](../../docs/manual/recipes.html#screen-flask-redis-output)|light / 1280×900|
|[wordpress-mysql-config](../../docs/manual/images/ui-20261101-wordpress-mysql-config-cd1e152ddc.png)|[recipes.html#screen-wordpress-mysql-config](../../docs/manual/recipes.html#screen-wordpress-mysql-config)|light / 1280×900|
|[wordpress-mysql-output](../../docs/manual/images/ui-20261101-wordpress-mysql-output-fdec6c0276.png)|[recipes.html#screen-wordpress-mysql-output](../../docs/manual/recipes.html#screen-wordpress-mysql-output)|light / 1280×900|
|[wordpress-mariadb-config](../../docs/manual/images/ui-20261101-wordpress-mariadb-config-567ca4f50f.png)|[recipes.html#screen-wordpress-mariadb-config](../../docs/manual/recipes.html#screen-wordpress-mariadb-config)|light / 1280×900|
|[wordpress-mariadb-output](../../docs/manual/images/ui-20261101-wordpress-mariadb-output-fe45c5061a.png)|[recipes.html#screen-wordpress-mariadb-output](../../docs/manual/recipes.html#screen-wordpress-mariadb-output)|light / 1280×900|
|[laravel-mysql-config](../../docs/manual/images/ui-20261101-laravel-mysql-config-39ad876578.png)|[recipes.html#screen-laravel-mysql-config](../../docs/manual/recipes.html#screen-laravel-mysql-config)|light / 1280×900|
|[laravel-mysql-output](../../docs/manual/images/ui-20261101-laravel-mysql-output-669a3f3c8a.png)|[recipes.html#screen-laravel-mysql-output](../../docs/manual/recipes.html#screen-laravel-mysql-output)|light / 1280×900|
|[laravel-postgresql-config](../../docs/manual/images/ui-20261101-laravel-postgresql-config-6b6f2a4331.png)|[recipes.html#screen-laravel-postgresql-config](../../docs/manual/recipes.html#screen-laravel-postgresql-config)|light / 1280×900|
|[laravel-postgresql-output](../../docs/manual/images/ui-20261101-laravel-postgresql-output-e9ce0e5fdc.png)|[recipes.html#screen-laravel-postgresql-output](../../docs/manual/recipes.html#screen-laravel-postgresql-output)|light / 1280×900|
|[redmine-postgresql-config](../../docs/manual/images/ui-20261101-redmine-postgresql-config-615e307a0a.png)|[recipes.html#screen-redmine-postgresql-config](../../docs/manual/recipes.html#screen-redmine-postgresql-config)|light / 1280×900|
|[redmine-postgresql-output](../../docs/manual/images/ui-20261101-redmine-postgresql-output-fb7ef819cc.png)|[recipes.html#screen-redmine-postgresql-output](../../docs/manual/recipes.html#screen-redmine-postgresql-output)|light / 1280×900|
|[nodejs-mysql-config](../../docs/manual/images/ui-20261101-nodejs-mysql-config-24b9173fe0.png)|[recipes.html#screen-nodejs-mysql-config](../../docs/manual/recipes.html#screen-nodejs-mysql-config)|light / 1280×900|
|[nodejs-mysql-output](../../docs/manual/images/ui-20261101-nodejs-mysql-output-9a0365c37d.png)|[recipes.html#screen-nodejs-mysql-output](../../docs/manual/recipes.html#screen-nodejs-mysql-output)|light / 1280×900|
|[nodejs-mariadb-config](../../docs/manual/images/ui-20261101-nodejs-mariadb-config-ad375598a9.png)|[recipes.html#screen-nodejs-mariadb-config](../../docs/manual/recipes.html#screen-nodejs-mariadb-config)|light / 1280×900|
|[nodejs-mariadb-output](../../docs/manual/images/ui-20261101-nodejs-mariadb-output-4ca61f0f97.png)|[recipes.html#screen-nodejs-mariadb-output](../../docs/manual/recipes.html#screen-nodejs-mariadb-output)|light / 1280×900|
|[mysql-phpmyadmin-config](../../docs/manual/images/ui-20261101-mysql-phpmyadmin-config-4e070399dc.png)|[recipes.html#screen-mysql-phpmyadmin-config](../../docs/manual/recipes.html#screen-mysql-phpmyadmin-config)|light / 1280×900|
|[mysql-phpmyadmin-output](../../docs/manual/images/ui-20261101-mysql-phpmyadmin-output-22a4d8dc44.png)|[recipes.html#screen-mysql-phpmyadmin-output](../../docs/manual/recipes.html#screen-mysql-phpmyadmin-output)|light / 1280×900|
|[mariadb-phpmyadmin-config](../../docs/manual/images/ui-20261101-mariadb-phpmyadmin-config-1c1b5d35f6.png)|[recipes.html#screen-mariadb-phpmyadmin-config](../../docs/manual/recipes.html#screen-mariadb-phpmyadmin-config)|light / 1280×900|
|[mariadb-phpmyadmin-output](../../docs/manual/images/ui-20261101-mariadb-phpmyadmin-output-9e37e86619.png)|[recipes.html#screen-mariadb-phpmyadmin-output](../../docs/manual/recipes.html#screen-mariadb-phpmyadmin-output)|light / 1280×900|
|[nginx-flask-config](../../docs/manual/images/ui-20261101-nginx-flask-config-4e531bff18.png)|[recipes.html#screen-nginx-flask-config](../../docs/manual/recipes.html#screen-nginx-flask-config)|light / 1280×900|
|[nginx-flask-output](../../docs/manual/images/ui-20261101-nginx-flask-output-26c9738470.png)|[recipes.html#screen-nginx-flask-output](../../docs/manual/recipes.html#screen-nginx-flask-output)|light / 1280×900|
|[apache-flask-config](../../docs/manual/images/ui-20261101-apache-flask-config-c00ebd258d.png)|[recipes.html#screen-apache-flask-config](../../docs/manual/recipes.html#screen-apache-flask-config)|light / 1280×900|
|[apache-flask-output](../../docs/manual/images/ui-20261101-apache-flask-output-5691785ee8.png)|[recipes.html#screen-apache-flask-output](../../docs/manual/recipes.html#screen-apache-flask-output)|light / 1280×900|
|[nginx-nodejs-postgresql-redis-config](../../docs/manual/images/ui-20261101-nginx-nodejs-postgresql-redis-config-2743e91a56.png)|[recipes.html#screen-nginx-nodejs-postgresql-redis-config](../../docs/manual/recipes.html#screen-nginx-nodejs-postgresql-redis-config)|light / 1280×900|
|[nginx-nodejs-postgresql-redis-output](../../docs/manual/images/ui-20261101-nginx-nodejs-postgresql-redis-output-57a3dac05d.png)|[recipes.html#screen-nginx-nodejs-postgresql-redis-output](../../docs/manual/recipes.html#screen-nginx-nodejs-postgresql-redis-output)|light / 1280×900|
|[nginx-flask-postgresql-redis-config](../../docs/manual/images/ui-20261101-nginx-flask-postgresql-redis-config-eebd920741.png)|[recipes.html#screen-nginx-flask-postgresql-redis-config](../../docs/manual/recipes.html#screen-nginx-flask-postgresql-redis-config)|light / 1280×900|
|[nginx-flask-postgresql-redis-output](../../docs/manual/images/ui-20261101-nginx-flask-postgresql-redis-output-a8c408e29a.png)|[recipes.html#screen-nginx-flask-postgresql-redis-output](../../docs/manual/recipes.html#screen-nginx-flask-postgresql-redis-output)|light / 1280×900|
|[nginx-wordpress-mariadb-admin-config](../../docs/manual/images/ui-20261101-nginx-wordpress-mariadb-admin-config-fef78b37d9.png)|[recipes.html#screen-nginx-wordpress-mariadb-admin-config](../../docs/manual/recipes.html#screen-nginx-wordpress-mariadb-admin-config)|light / 1280×900|
|[nginx-wordpress-mariadb-admin-output](../../docs/manual/images/ui-20261101-nginx-wordpress-mariadb-admin-output-591764588e.png)|[recipes.html#screen-nginx-wordpress-mariadb-admin-output](../../docs/manual/recipes.html#screen-nginx-wordpress-mariadb-admin-output)|light / 1280×900|
