---
title: "HTTP バックエンド"
sidebar_custom_props:
  edition: pro
---

# HTTP バックエンド <Pro />

Semaphore UI の Terraform 用 HTTP バックエンドは、Terraform のステートファイルを Semaphore 内で直接、安全に保存・管理します。Pro プランで利用でき、いくつかの重要な利点があります。

## 機能 {#features}

- **安全なステート保存**: ステートファイルは <!-- encrypted and--> Semaphore 内に安全に保存されます。
- **ステートロック**: 同じステートファイルへの同時変更を防ぎます。
- **バージョン履歴**: インフラストラクチャのステートの変更を時系列で追跡できます。
- **UI との統合**: Semaphore のインターフェースからステートファイルを直接管理できます。

## 設定 {#configuration}

組み込みの HTTP バックエンドを使い始めるには、まず Terraform タスクテンプレートのワークスペースを作成する必要があります。

ワークスペースを追加するには、Terraform/OpenTofu テンプレートの**ワークスペース**タブに移動します。

ワークスペースを作成する際、Terraform コードで使用されるプライベートモジュールをクローンするための SSH キーを選択するよう求められます。プライベートモジュールを使用しない場合は、`None` オプションを選択してください。

![](https://github.com/user-attachments/assets/0a6a0b4d-8b10-41df-8500-e3084d5b6c64)

### タスクでの HTTP バックエンドの使用 {#using-the-http-backend-in-tasks}

Terraform タスクのステートを保存するために組み込みの HTTP バックエンドを使用する場合、Terraform コード内でバックエンドを手動で設定する必要はありません。Semaphore は実行時に設定ファイルを自動的に作成できます。これを有効にするには、下のスクリーンショットのように、タスクテンプレートの設定で**バックエンド設定を上書き**オプションにチェックを入れるだけです。


必要に応じて、実行時に動的に作成される設定ファイルの名前を指定できます。これは、コードにすでにバックエンド設定ファイルが含まれており、Semaphore の組み込みバックエンドと連携するためにそれを動的に上書きする必要がある場合に便利です。

### Semaphore の外部での HTTP バックエンドの使用 {#using-the-http-backend-outside-semaphore}

組み込みの HTTP バックエンドは、Semaphore 内でタスクを実行する場合だけでなく、ローカルのターミナルなど Semaphore の外部で Terraform コードを実行する場合にも使用できます。

これを可能にするために、Semaphore ではステートストレージのエイリアス (一意の HTTP エンドポイント) を作成できます。エイリアスを使用すると、外部環境からステートファイルを簡単に参照できます。

設定するには、**ワークスペース**タブに移動して目的のワークスペースを選択し、エイリアスを追加します。また、バックエンドへのアクセス認証に使用される、ユーザー名とパスワードを持つキーを選択する必要があります。

<video controls>
  <source src="https://www.semaphoreui.com/uploads/v2.11/video2.mp4" type="video/mp4" />
</video>

その後、Terraform コードにバックエンド設定を追加する必要があります。

```
terraform {
  backend "http" {
    address = "http://localhost:3000/api/terraform/***"
    username = "***"
    password = "***"
  }
}
```

これで、ターミナルから実行した場合でも Terraform は Semaphore の組み込み HTTP バックエンドを使用するようになります。

```
terraform apply
```
