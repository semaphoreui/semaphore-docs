---
title: 管理者ガイド
description: チームのために Semaphore サーバーをインストール、設定、保護、運用する管理者向けのガイドです。
---

# 管理者ガイド

このセクションは、他の人のために Semaphore をインストールして運用する管理者向けです。
ここにある作業はすべて、サーバー自体へのアクセスを必要とします。設定ファイル、
環境変数、コマンドライン、または Semaphore が動作しているマシンです。Web インター
フェースを通じてプロジェクト内で行う作業は、[ユーザーガイド](/user-guide)で説明しています。

Semaphore は、Web インターフェースと REST API を備えた単一の Go バイナリです。データは
SQLite、MySQL、または PostgreSQL に保存し、認証情報は暗号化して保持し、タスクはサーバー
自体か、別のランナーで実行します。したがって、動作するインストールは 4 つの判断に
集約されます。どのようにインストールするか、データベースをどこに置くか、ユーザーが
どのようにサインインするか、そしてタスクをどこで実行するかです。

## セットアップ {#set-up}

サーバーを起動する前後に設定するすべての事項です。

| ページ | 内容 |
|---|---|
| [インストール](/admin-guide/installation) | パッケージマネージャー、Docker、バイナリ、Kubernetes、および手動セットアップです。 |
| [設定](/admin-guide/configuration) | `config.json` ファイル、環境変数、およびサポートされるすべてのオプションです。 |
| [アップグレード](/admin-guide/upgrading) | 新しいリリースへの移行と、最初に確認すべき点です。 |
| [リバースプロキシ](/admin-guide/reverse-proxy) | nginx、Apache、または Caddy の背後で、TLS を使って Semaphore を公開します。 |
| [セキュリティ](/admin-guide/security) | パスワードのハッシュ化、シークレットの暗号化、ネットワークの強化、タスクの JWT です。 |
| [LDAP と AD](/admin-guide/ldap) | ディレクトリサービスに対して認証してサインインします。 |
| [OpenID Connect](/admin-guide/openid) | GitHub、Google、Keycloak、Okta とさらに 9 つのプロバイダーによるシングルサインオンです。 |
| [ランナー](/admin-guide/runners) | サーバー以外のマシンでタスクを実行します。 |
| [高可用性](/admin-guide/ha) | 1 つのデータベースに対して複数の Semaphore ノードを実行します。 |

## 運用 {#operate}

すでに稼働しているサーバー上で行うすべての作業です。

| ページ | 内容 |
|---|---|
| [CLI](/admin-guide/cli) | シェルからユーザー、プロジェクト、vault、ランナー、データベースマイグレーションを管理します。 |
| [API](/admin-guide/api) | トークンによる認証と、プログラムからの Semaphore の操作です。 |
| [CI/CD 連携](/admin-guide/cicd) | 外部のパイプラインから Semaphore のタスクを開始します。 |
| [ログ](/admin-guide/logs) | サーバーログ、タスクログ、およびそれらの外部への転送です。 |
| [メトリクス](/admin-guide/metrics) | Prometheus のエンドポイントと、そこで公開されるメトリクスです。 |
| [通知](/admin-guide/notifications) | アラートの配信チャンネルです。メール、Telegram、Slack などがあります。 |
| [ライセンス](/admin-guide/license) | Pro または Enterprise のサブスクリプションを有効化します。 |

## ここから始める {#where-to-start}

Semaphore を初めてインストールする場合は、[インストール](/admin-guide/installation)を
読んで方法を 1 つ選び、次に[設定](/admin-guide/configuration)でオプションの指定方法を
学んでください。他の人が使い始める前に、TLS を設定した
[リバースプロキシ](/admin-guide/reverse-proxy)の背後にサーバーを配置してください。

有償サブスクリプションで何が追加されるかは、[エディション](/editions)を参照してください。
