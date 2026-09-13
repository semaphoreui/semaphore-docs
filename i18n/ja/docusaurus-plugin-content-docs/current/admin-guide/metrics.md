# メトリクス

:::info
メトリクスエンドポイントは **Semaphore バージョン 2.20** 以降で利用できます。それより古いバージョンを実行している場合は、この機能を使用するためにアップグレードしてください。
:::

Semaphore は、標準の Prometheus テキスト形式で `GET /api/metrics` エンドポイントを公開しています。そのため、既存の Prometheus + Grafana 環境から、外部のポーリングツールなしでサーバーを監視できます。

公開されるメトリクスは 2 つのカテゴリに分かれます。

- **プロセスメトリクス:** Go ランタイムとプロセスの統計情報(goroutine 数、メモリ(ヒープ/常駐)、CPU 時間、GC の一時停止)。これらは Prometheus の標準的な Go/プロセスコレクターによって自動的に提供されます。
- **タスクメトリクス**(Semaphore 固有のワークロードに関するもの):
  - `semaphore_tasks_running`(ゲージ): 現在実行中のタスク数。
  - `semaphore_tasks_total{status}`(カウンター): 完了したタスクの総数。結果(`success`、`error`、`stopped`)ごとに分類されます。

どちらもタスクの状態が変化するとリアルタイムに更新されます。カウンターはタスクランナー内部でタスクのステータスが実際に変化した瞬間に直接更新されるため、ポーリングによる遅延はありません。

## メトリクスの有効化 {#enabling-metrics}

このエンドポイントはデフォルトで無効になっており、静的なサービスレベルの認証情報による HTTP Basic 認証が必要です。Prometheus は対話的なログインができないため、この認証情報はどのユーザーアカウントにも紐づいていません。

```json
{
  "metrics": {
    "enabled": true,
    "username": "prometheus",
    "password": "changeme"
  }
}
```

または、環境変数を使用します。

```bash
SEMAPHORE_METRICS_ENABLED=true
SEMAPHORE_METRICS_USERNAME=prometheus
SEMAPHORE_METRICS_PASSWORD=changeme
```

### メトリクスのオプション {#metrics-options}

| パラメータ  | 環境変数         | 説明 |
| ---------- | ------------------------------ | ------------ |
| `enabled`  | `SEMAPHORE_METRICS_ENABLED`    | `/api/metrics` エンドポイントのオン/オフを切り替えます。デフォルトでは無効です。 |
| `username` | `SEMAPHORE_METRICS_USERNAME`   | エンドポイントのスクレイプに必要な Basic 認証のユーザー名。 |
| `password` | `SEMAPHORE_METRICS_PASSWORD`   | エンドポイントのスクレイプに必要な Basic 認証のパスワード(機密情報)。 |

`enabled` が `false`(デフォルト)のままの場合、または認証情報が欠落しているか誤っている場合、`/api/metrics` へのすべてのリクエストは `401 Unauthorized` を返します。

## Prometheus によるスクレイプ {#scraping-with-prometheus}

上記の認証情報を使用して、`basic_auth` 付きのスクレイプジョブを設定します。

```yaml
scrape_configs:
  - job_name: semaphore
    metrics_path: /api/metrics
    basic_auth:
      username: prometheus
      password: changeme
    static_configs:
      - targets: ["<semaphore-host>:3000"]
```

## Grafana でのメトリクスの表示 {#viewing-metrics-in-grafana}

Grafana の **Explore** ビューを使用すると、ダッシュボードを先に作成しなくても、メトリクスに対して任意の PromQL クエリを直接実行し、生の結果を確認できます。

![スクレイプされた Semaphore のメトリクスを表示する Grafana Explore](/assets/semaphore-grafana-explore.png)

その後、同じメトリクスを使用してダッシュボードを構築できます。この例では、実行中のタスク数、結果別のタスク総数、goroutine 数、プロセスの常駐メモリという 4 つのパネルで両方のカテゴリをカバーしています。

![Semaphore のパネルを含む Grafana ダッシュボード](/assets/semaphore-grafana-dashboard.png)
