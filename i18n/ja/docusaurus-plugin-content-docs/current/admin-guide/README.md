# 管理者ガイド

Semaphore UI 管理者ガイドへようこそ。このガイドでは、Semaphore インスタンスのインストール、設定、保守に関する包括的な情報を提供します。

## Semaphore UI とは {#what-is-semaphore-ui}

Semaphore UI は、自動化タスクを実行するためのモダンなオープンソースの Web インターフェースです。より複雑な自動化プラットフォームに代わる、軽量で高速、かつ使いやすい選択肢として設計されています。

次のタスクを安全に管理・実行できます:
*   **Ansible** playbook
*   **Terraform/OpenTofu** による Infrastructure as Code
*   **PowerShell** および **Shell** スクリプト
*   **Python** スクリプト

## 主な機能と設計思想 {#core-features--philosophy}

Semaphore の設計原則を理解しておくと、その能力を最大限に活用できます:

*   **軽量で高性能**: Semaphore は **Go** で書かれており、**単一のバイナリファイル**として配布されます。必要なリソース (CPU/RAM) は最小限で、Kubernetes、Docker、JVM のような外部依存を必要としません。そのため高速で効率的、かつデプロイが容易です。
*   **インストールと保守が簡単**: Semaphore は数分で稼働させることができます。インストールは、バイナリをダウンロードして実行するだけという簡単なものにできます。シンプルなアーキテクチャにより、アップグレードや保守も容易です。
*   **柔軟なデプロイ**: バイナリとして、systemd サービスとして、あるいは Docker コンテナ内で実行できます。個人のホームラボからエンタープライズ環境まで、あらゆる用途に適しています。
*   **セルフホストで安全**: Semaphore はセルフホスト型のソリューションです。すべてのデータ、認証情報、ログは自身のインフラストラクチャ上に留まり、完全に管理下に置けます。認証情報はデータベース内で常に暗号化されます。
*   **強力な連携機能**: シンプルでありながら、Semaphore は LDAP/OpenID 認証、プロジェクトごとの詳細なロールベースアクセス制御 (RBAC)、タスク実行をスケールアウトするためのリモートランナー、プログラムからアクセスするための完全な REST API といった強力な機能をサポートしています。

このガイドでは、これらの機能を目的に合わせてセットアップし、管理する方法を順を追って説明します。

<!-- ## Start here

- Installation options: package manager, Docker/Compose, binary, Kubernetes (Helm), Snap (deprecated)
- Post-install configuration: config file, environment variables, interactive CLI setup
- Security essentials: reverse proxy, TLS, database and network hardening
- Authentication: LDAP and OpenID Connect providers
- Operations: CLI, runners, logs, notifications
- Maintenance: upgrading and troubleshooting -->

## クイックリンク {#quick-links}

- インストール: [概要](/admin-guide/installation)
  - [パッケージマネージャー](/admin-guide/installation/package-manager)
  - [Docker](/admin-guide/installation/docker)
  - [バイナリファイル](/admin-guide/installation/binary-file)
  - [Kubernetes (Helm チャート)](/admin-guide/installation/k8s)
  - [クラウド](/admin-guide/installation/cloud)
  - [手動インストール](/admin-guide/installation_manually)
- 設定: [概要](/admin-guide/configuration)
  - [設定ファイル](/admin-guide/configuration/config-file)
  - [環境変数](/admin-guide/configuration/env-vars)
  - [対話型セットアップ](/admin-guide/configuration/cli)
- セキュリティ: [概要](/admin-guide/security)
  - [データベースのセキュリティ](/admin-guide/security/database)
  - [ネットワークのセキュリティ](/admin-guide/security/network)
  - [NGINX の設定](/admin-guide/reverse-proxy/nginx)
  - [Apache の設定](/admin-guide/reverse-proxy/apache)
  - [Kerberos](/admin-guide/security/kerberos)
- 認証:
  - [LDAP](/admin-guide/ldap)
  - [OpenID](/admin-guide/openid)
    - [GitHub](/admin-guide/openid/github)
    - [Google](/admin-guide/openid/google)
    - [GitLab](/admin-guide/openid/gitlab)
    - [Gitea](/admin-guide/openid/gitea)
    - [Authelia](/admin-guide/openid/authelia)
    - [Authentik](/admin-guide/openid/authentik)
    - [Keycloak](/admin-guide/openid/keycloak)
    - [Okta](/admin-guide/openid/okta)
    - [PingFederate](/admin-guide/openid/pingfederate)
    - [Azure](/admin-guide/openid/azure)
    - [Zitadel](/admin-guide/openid/zitadel)
- 運用:
  - [CLI](/admin-guide/cli)
  - [ランナー](/admin-guide/runners)
  - [ログ](/admin-guide/logs)
  - [通知](/admin-guide/notifications)
    - [メール](/admin-guide/notifications/email)
    - [Telegram](/admin-guide/notifications/telegram)
    - [Slack](/admin-guide/notifications/slack)
    - [Teams](/admin-guide/notifications/teams)
    - [Rocket.Chat](/admin-guide/notifications/rocket)
    - [DingTalk](/admin-guide/notifications/ding)
    - [Gotify](/admin-guide/notifications/gotify)
- 保守:
  - [アップグレード](/admin-guide/upgrading)
  - [ライセンスの有効化](/admin-guide/license)
  - [トラブルシューティング](/faq/troubleshooting)
