# スケジュール

Semaphore のスケジュール機能を使うと、テンプレート（例: playbook の実行）を事前に定義した間隔で自動的に実行できます。この機能により、定期的なバックアップ、コンプライアンスチェック、システム更新など、日常的な自動化タスクを実現できます。

変更を有効にするには、変更後に Semaphore サービスを再起動してください。

[//]: # (## Setup and configuration)

## タイムゾーンの設定 {#timezone-configuration}

デフォルトでは、スケジュール機能は UTC タイムゾーンで動作します。ただし、ローカルのタイムゾーンや特定の要件に合わせてカスタマイズできます。

タイムゾーンは、設定ファイルを更新するか、環境変数を設定することで変更できます。

1. **設定ファイルを使用する場合**:  
    Semaphore の設定ファイルで `timezone` フィールドを追加または更新します。
    ```json
    {
      "schedule": {
        "timezone": "America/New_York"
      }
    }
    ```

2. **環境変数を使用する場合**:  
    `SEMAPHORE_SCHEDULE_TIMEZONE` 環境変数を設定します。
    ```bash
    export SEMAPHORE_SCHEDULE_TIMEZONE="America/New_York"
    ```

有効なタイムゾーン値の一覧については、[IANA タイムゾーンデータベース](https://www.iana.org/time-zones)を参照してください。

### スケジュール機能へのアクセス {#accessing-the-schedule-feature}

1. Semaphore の Web インターフェースにログインします
2. メインナビゲーションメニューの「スケジュール」タブに移動します
3. 右上の「新しいスケジュール」ボタンをクリックして、新しいスケジュールを作成します

![](/assets/schedule01.png)

### 新しいスケジュールの作成 {#creating-a-new-schedule}

新しいスケジュールを作成する際は、次のオプションを設定する必要があります。

| フィールド | 説明 |
|-------|-------------|
| 名前 | スケジュールされたタスクを表すわかりやすい名前 |
| テンプレート | 実行する特定のタスクテンプレート |
| タイミング | より柔軟に設定できる cron 形式、または一般的な間隔向けの組み込みオプションのいずれか |

![](/assets/schedule02.png) ![](/assets/schedule03.png)

### cron 形式の構文 {#cron-format-syntax}

スケジュールでは、5 つのフィールドからなる標準の cron 構文を使用します。

```
┌─────── minute (0-59)
│ ┌────── hour (0-23)
│ │ ┌───── day of month (1-31)
│ │ │ ┌───── month (1-12)
│ │ │ │ ┌───── day of week (0-6) (Sunday=0)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

例:
- `*/15 * * * *` - 15 分ごとに実行
- `0 2 * * *` - 毎日午前 2:00 に実行
- `0 0 * * 0` - 毎週日曜日の午前 0 時に実行
- `0 9 1 * *` - 毎月 1 日の午前 9:00 に実行

非常に便利な cron 式ジェネレーター: [https://crontab.guru/](https://crontab.guru/)

## ユースケース {#use-cases}

### システムメンテナンス {#system-maintenance}

```yaml
# Example playbook for system updates
---
- hosts: all
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes

    - name: Upgrade all packages
      apt:
        upgrade: yes

    - name: Remove dependencies that are no longer required
      apt:
        autoremove: yes
```

この playbook を業務時間外に週 1 回実行するようスケジュールすると、システムを常に最新の状態に保てます。

### バックアップ操作 {#backup-operations}

さまざまな頻度でデータベースバックアップのスケジュールを作成します。
- 1 週間保持する日次バックアップ
- 1 か月保持する週次バックアップ
- 1 年保持する月次バックアップ

### コンプライアンスチェック {#compliance-checks}

システムがセキュリティ要件を満たしていることを確認するため、定期的なコンプライアンススキャンをスケジュールします。

```yaml
# Example compliance check playbook
---
- hosts: all
  tasks:
    - name: Run compliance checks
      script: /path/to/compliance_script.sh

    - name: Collect compliance reports
      fetch:
        src: /var/log/compliance-report.log
        dest: reports/{{ inventory_hostname }}/
        flat: yes
```

### 環境のプロビジョニングとクリーンアップ {#environment-provisioning-and-cleanup}

開発環境やテスト環境向けです。朝にクラウド環境の作成を、夕方に破棄をスケジュールすることで、コストを最適化できます。

## ベストプラクティス {#best-practices}

* 機能とタイミングの両方がわかる説明的な名前をスケジュールに付ける（例: "Weekly-Backup-Sunday-2AM"）
* リソースを大量に消費するタスクを同時に多数スケジュールしない
* 長時間実行されるスケジュールタスクが他のスケジュールに与える影響を考慮する
* 長い間隔の本番スケジュールを設定する前に、短い間隔でスケジュールをテストする
* スケジュールされたタスクの目的と期待される結果を文書化する

---

## タスクのパラメーター {#task-parameters}

スケジュールからタスクにパラメーターを渡すことができます。テンプレートで必要なフィールドのプロンプトを有効にし、スケジュール設定でパラメーターの値を定義すると、各実行で目的の上書き値（例: ブランチ、変数、フラグ）が渡されます。
