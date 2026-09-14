---
title: オンライン設定ツールを使う
description: Semaphore のオンライン設定ツールで、バイナリの設定コマンドや Docker Compose ファイルを生成します。
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# オンライン設定ツールを使う

フォームに入力すると、新しい Semaphore サーバーの設定コマンドを生成できます。編集に合わせてプレビューが更新されます。設定を完了するには、生成結果を自分のサーバーに適用してください。

## 始める前に {#before-you-begin}

- バイナリまたは Docker のインストール方法と Semaphore のバージョンを選びます。以下のリンクと動画は **2.19** を使用しています。サイトでは自分のバージョンを選択してください。
- MySQL または Postgres では接続情報を準備します。SQLite では、Semaphore のサービスユーザーが書き込めるデータベースファイルの場所を選びます。
- 管理者パスワードは自分で設定してください。動画にはデモ用の値を使用しています。

## 手順 {#steps}

インストール方法に合ったセクションに従ってください。

### バイナリのインストール {#binary-installation}

1. [バイナリのインストールページ](https://semaphoreui.com/install/binary/2_19/install)を開きます。プラットフォーム、アーキテクチャ、パッケージ形式を探します。行をクリックするとコマンドが表示されるので、コピーしてサーバーで実行するか、**Download** でパッケージを取得します。
2. [Server setup](https://semaphoreui.com/install/binary/2_19/config) を開きます。**Database settings** で **SQLite**、**MySQL**、**Postgres** のいずれかを選び、ファイルパスまたは接続情報を入力します。**Admin user** にログイン名、パスワード、名前、メールアドレスを入力します。
3. **Config file** に戻り、コピーアイコンをクリックします。生成されたコマンドを確認し、サーバー上の書き込み可能なディレクトリで実行します。コマンドは `config.json` を作成し、管理者を追加して Semaphore を起動します。設定と生成された暗号化キーは、次回以降の起動のために保存してください。

![Linux amd64 deb の行を展開して表示したインストールコマンド](/img/admin-guide/configuration/online/binary-install.png)

![デモ用の値を入力したデータベースと管理者の設定欄](/img/admin-guide/configuration/online/binary-settings.png)

動画では、パッケージの選択、サーバーの設定、コマンドのコピーを示します。

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/binary-output.png')} aria-label="動画では、パッケージの選択、サーバーの設定、コマンドのコピーを示します。">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/binary-setup.webm')} type="video/webm" />
</video>

### Docker のインストール {#docker-installation}

1. [Docker 設定ツール](https://semaphoreui.com/install/docker/2_19)を開きます。**Container settings** で名前とホストのポートを指定します。**Docker volumes** でデータと設定のボリュームを有効にし、コンテナを置き換えても保持できるようにします。
2. データベースを選び、**Admin user** に自分のパスワードなどを入力します。外部データベースの場合、コンテナから接続できるホストを指定します。
3. **Docker Compose** を選び、ダウンロードアイコンをクリックします。結果をデプロイ用ディレクトリに `docker-compose.yml` として保存し、内容を確認してから、その場所で `docker compose up -d` を実行します。**Docker command** を選び、生成された `docker run` コマンドをコピーすることもできます。

![データと設定の永続ボリュームを有効にした Docker コンテナ設定](/img/admin-guide/configuration/online/docker-settings.png)

動画では、コンテナ設定、永続ボリューム、Docker Compose のダウンロードを示します。

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/docker-compose.png')} aria-label="動画では、コンテナ設定、永続ボリューム、Docker Compose のダウンロードを示します。">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/docker-setup.webm')} type="video/webm" />
</video>

## 次のステップ {#whats-next}

ブラウザーでサーバーを開き、入力した管理者の認証情報でサインインします。ローカルで実行する場合は、例えば `http://localhost:3000` を開きます。

- [バイナリをサービスとして実行する](/admin-guide/installation/binary-file#run-as-a-service).
- [Docker デプロイの詳細](/admin-guide/installation/docker).
- [すべての設定オプション](/reference/configuration).
