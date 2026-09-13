---
title: Semaphore UI ドキュメント
sidebar_label: ホーム
hide_table_of_contents: true
---

import Link from '@docusaurus/Link';

# Semaphore UI ドキュメント

Semaphore UI は、**Ansible**、**Terraform/OpenTofu**、**Shell**、**PowerShell**、**Python** の自動化を実行するためのセルフホスト型の Web UI および API です。playbook やスクリプトの実行、認証情報の暗号化保管、ジョブのスケジュール実行、そして誰がいつ何を実行したかの確認を、チームでひとつの場所から行えます。

単一の Go バイナリまたは Docker イメージとして提供され、Linux、macOS、Windows 上で動作し、データは SQLite、MySQL、PostgreSQL のいずれかに保存されます。

Semaphore を初めて使いますか。[はじめに](/introduction)では、Semaphore で何ができるか、デプロイがどのような構成になっているか、インストール前に何を準備すべきかを説明します。

:::tip[クイックスタート]

次のコマンド 1 つで SQLite を使って Semaphore を起動し、[http://localhost:3000](http://localhost:3000) を開いて `admin` / `changeme` でログインします。

```bash
docker run -d -p 3000:3000 \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME=Admin \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -v semaphore-data:/var/lib/semaphore \
  semaphoreui/semaphore:latest
```

本番環境向けには、Docker Compose、パッケージ、Kubernetes、バイナリでのインストール方法を[インストール](/admin-guide/installation)で確認してください。その後、[はじめに](/getting-started)に従って最初のタスクを実行してください。

:::

<div className="row home-cards">
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>インストールと設定</h3></div>
      <div className="card__body">
        <p>サーバーを起動し、データベース、ID プロバイダー、ネットワークに接続します。</p>
        <ul>
          <li><Link to="/admin-guide/installation">インストール</Link></li>
          <li><Link to="/admin-guide/configuration">設定</Link></li>
          <li><Link to="/admin-guide/reverse-proxy">リバースプロキシと TLS</Link></li>
          <li><Link to="/admin-guide/authentication/ldap">LDAP</Link> と <Link to="/admin-guide/authentication/openid">OpenID Connect</Link></li>
          <li><Link to="/admin-guide/security">セキュリティ強化</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>自動化の実行</h3></div>
      <div className="card__body">
        <p>作業をプロジェクトに整理し、リポジトリと認証情報を接続して、タスクをオンデマンドまたはスケジュールで実行します。</p>
        <ul>
          <li><Link to="/getting-started">はじめに: 6 つのステップで最初のタスクを実行</Link></li>
          <li><Link to="/user-guide/projects">プロジェクト</Link> と <Link to="/user-guide/team">チーム</Link></li>
          <li><Link to="/user-guide/task-templates">タスクテンプレート</Link> と <Link to="/user-guide/tasks">タスク</Link></li>
          <li><Link to="/user-guide/key-store">キーストア</Link>、<Link to="/user-guide/inventory">インベントリ</Link>、<Link to="/user-guide/environment">変数グループ</Link></li>
          <li><Link to="/user-guide/schedules">スケジュール</Link> と <Link to="/user-guide/workflows">ワークフロー</Link> (Pro)</li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>大規模運用</h3></div>
      <div className="card__body">
        <p>実行を分散し、冗長構成で稼働させ、サービスを監視可能かつ最新の状態に保ちます。</p>
        <ul>
          <li><Link to="/admin-guide/runners">ランナー</Link></li>
          <li><Link to="/admin-guide/ha">高可用性</Link></li>
          <li><Link to="/admin-guide/upgrading">アップグレード</Link></li>
          <li><Link to="/admin-guide/logs">ログ</Link> と <Link to="/admin-guide/metrics">メトリクス</Link></li>
          <li><Link to="/admin-guide/notifications">通知</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>リファレンス</h3></div>
      <div className="card__body">
        <p>探しているものが分かっている場合に参照する、正確なオプションとエンドポイントです。</p>
        <ul>
          <li><Link to="/admin-guide/configuration/config-file">設定ファイル</Link> と <Link to="/admin-guide/configuration/env-vars">環境変数</Link></li>
          <li><Link to="/reference/api">REST API</Link></li>
          <li><Link to="/reference/cli">CLI</Link></li>
          <li><Link to="/admin-guide/cicd">CI/CD 連携</Link></li>
          <li><Link to="/faq/troubleshooting">トラブルシューティング FAQ</Link></li>
        </ul>
      </div>
    </div>
  </div>
</div>

## ツール別ガイド {#guides-by-tool}

<div className="home-tools margin-bottom--lg">
  <Link className="button button--outline button--primary" to="/user-guide/apps/ansible">Ansible</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/terraform">Terraform / OpenTofu</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/bash">Shell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/powershell">PowerShell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/python">Python</Link>
</div>

## ヘルプとコミュニティ {#help-and-community}

- **質問:** [Discord](https://discord.gg/5R6k7hNGcH) でお尋ねください。
- **バグ報告と機能要望:** [GitHub](https://github.com/semaphoreui/semaphore/issues) で issue を作成してください。
- **ソースコード:** [github.com/semaphoreui/semaphore](https://github.com/semaphoreui/semaphore)。
- **Pro および Enterprise:** [ライセンスの有効化](/admin-guide/license)。
