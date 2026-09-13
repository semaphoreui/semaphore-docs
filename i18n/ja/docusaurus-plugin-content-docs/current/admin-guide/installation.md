# インストール

Semaphore は、オペレーティングシステム、環境、好みに応じて、さまざまな方法でインストールできます。

* **パッケージマネージャー**<br />
  ディストリビューション向けのネイティブパッケージ (Debian/Ubuntu では apt、RHEL 系では dnf など) を使用して Semaphore をインストールします。Linux サーバーで始めるには最も簡単な方法で、システムサービスとの連携にも優れています。<br />
  [詳細はこちら »](/admin-guide/installation/package-manager)

* **Docker**<br />
  Docker または Docker Compose を使用して Semaphore をコンテナとして実行します。迅速なセットアップ、サンドボックス環境、CI/CD パイプラインに最適です。Infrastructure as Code を好むユーザーにおすすめです。<br />
  [詳細はこちら »](/admin-guide/installation/docker)

* **クラウド**<br />
  VM、コンテナ、またはマネージドサービスと組み合わせた Kubernetes を使用して、クラウドプラットフォームに Semaphore をデプロイするためのガイダンスです。<br />
  [詳細はこちら »](/admin-guide/installation/cloud)

* **バイナリファイル**<br />
  リリースページからコンパイル済みのバイナリをダウンロードします。手動インストールやカスタムワークフローへの組み込みに最適です。Linux、macOS、Windows (WSL 経由) で動作します。<br />
  [詳細はこちら »](/admin-guide/installation/binary-file)

* **Kubernetes (Helm チャート)**<br />
  Helm を使用して Kubernetes クラスターに Semaphore をデプロイします。本番環境向けのスケーラブルなインフラストラクチャに最も適しています。Helm の values による簡単な設定とアップグレードをサポートします。<br />
  [詳細はこちら »](/admin-guide/installation/k8s)

関連項目:
* [サービスとして実行する](/admin-guide/installation/binary-file#run-as-a-service)
* [手動インストール](/admin-guide/installation_manually)

----


### 追加の Python パッケージのインストール {#installing-additional-python-packages}

一部の Ansible モジュールやロールは、実行に追加の Python パッケージを必要とします。追加の Python パッケージをインストールするには、`requirements.txt` ファイルを作成し、コンテナの `/etc/semaphore` ディレクトリにマウントします。たとえば、`docker-compose.yml` ファイルに次の行を追加します。

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

requirements ファイルで指定されたパッケージは、コンテナが起動するたびに、同梱の Ansible 仮想環境にインストールされます。同じマウントは `semaphoreui/runner` イメージでも機能します。詳細とカスタムイメージを使う代替方法については、[追加の Python 依存関係のインストール](/admin-guide/installation/docker#installing-additional-python-dependencies)を参照してください。

Python の requirements ファイルの詳細については、[Pip Requirements File Format リファレンス](https://pip.pypa.io/en/stable/reference/requirements-file-format/)を参照してください
