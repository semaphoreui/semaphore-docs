# インストール

Semaphore は、オペレーティングシステム、環境、好みに応じて、さまざまな方法でインストールできます。

## このセクションの内容 {#in-this-section}

| 方法 | 適した用途 |
|---|---|
| [パッケージマネージャー](/admin-guide/installation/package-manager) | Linux ディストリビューション向けのネイティブパッケージを使いたい場合。 |
| [Docker](/admin-guide/installation/docker) | Docker または Docker Compose を使ってコンテナ内で Semaphore を実行したい場合。 |
| [クラウド](/admin-guide/installation/cloud) | クラウドプラットフォームにデプロイし、マネージドサービスやインフラに関する情報が必要な場合。 |
| [バイナリファイル](/admin-guide/installation/binary-file) | コンパイル済みバイナリをインストールし、プロセスを自分で管理したい場合。 |
| [Kubernetes (Helm チャート)](/admin-guide/installation/k8s) | すでに Kubernetes を使っており、Helm でデプロイを管理したい場合。 |

## 追加の Python パッケージのインストール {#installing-additional-python-packages}

一部の Ansible モジュールやロールは、実行に追加の Python パッケージを必要とします。追加の Python パッケージをインストールするには、`requirements.txt` ファイルを作成し、コンテナの `/etc/semaphore` ディレクトリにマウントします。たとえば、`docker-compose.yml` ファイルに次の行を追加します。

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

requirements ファイルで指定されたパッケージは、コンテナが起動するたびに、同梱の Ansible 仮想環境にインストールされます。同じマウントは `semaphoreui/runner` イメージでも機能します。詳細とカスタムイメージを使う代替方法については、[追加の Python 依存関係のインストール](/admin-guide/installation/docker#installing-additional-python-dependencies)を参照してください。

Python の requirements ファイルの詳細については、[Pip Requirements File Format リファレンス](https://pip.pypa.io/en/stable/reference/requirements-file-format/)を参照してください

## はじめに {#where-to-start}

デプロイ環境に合ったガイドから始めてください。バイナリをインストールする場合は、Semaphore を継続して実行するためにサービスとして実行する手順に従ってください。サービスユーザー、Python の依存関係、systemd の設定については、手動インストールのガイドを参照してください。

* [サービスとして実行する](/admin-guide/installation/binary-file#run-as-a-service)
* [手動インストール](/admin-guide/installation_manually)
