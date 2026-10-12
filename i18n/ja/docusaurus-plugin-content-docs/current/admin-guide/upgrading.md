# アップグレード

### パッケージマネージャー {#package-manager}

[リリースページ](https://github.com/semaphoreui/semaphore/releases)からパッケージファイルをダウンロードします。

&#x20;Debian と Ubuntu には `*.deb`、CentOS と RedHat には `*.rpm` を使用します。&#x20;

パッケージマネージャーを使用してインストールします。

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="debian-x64" label="Debian / Ubuntu (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.deb

      sudo dpkg -i semaphore_2.17.15_linux_amd64.deb
      ```
  </TabItem>
  <TabItem value="debian-arm64" label="Debian / Ubuntu (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.deb

      sudo dpkg -i semaphore_2.17.15_linux_arm64.deb
      ```
  </TabItem>
  <TabItem value="centos-x64" label="CentOS (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.rpm

      sudo yum install semaphore_2.17.15_linux_amd64.rpm
      ```
  </TabItem>
  <TabItem value="centos-arm64" label="CentOS (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.rpm

      sudo yum install semaphore_2.17.15_linux_arm64.rpm
      ```
  </TabItem>
</Tabs>


### バイナリ {#binary}

<Tabs>
  <TabItem value="linux-x64" label="Linux (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.tar.gz

      tar xf semaphore_2.17.15_linux_amd64.tar.gz
      ```
  </TabItem>
  <TabItem value="linux-arm64" label="Linux (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.tar.gz

      tar xf semaphore_2.17.15_linux_arm64.tar.gz
      ```
  </TabItem>
  <TabItem value="windows-x64" label="Windows (x64)">
      ```powershell
      Invoke-WebRequest `
      -Uri ("https://github.com/semaphoreui/semaphore/releases/" +
            "download/v2.17.15/semaphore_2.17.15_windows_amd64.zip") `
      -OutFile semaphore.zip

      Expand-Archive -Path semaphore.zip  -DestinationPath ./
      ```
  </TabItem>
</Tabs>

## 主な動作の変更 {#behavior-changes}

これらの変更は、最近の **2.20.x** リリースにアップグレードすると適用されます。データベースのマイグレーションは不要ですが、以前の動作に依存していた playbook や API クライアントは更新が必要になる場合があります。

### Ansible の追加変数はリテラルとして扱われます {#ansible-extra-vars-literal}

Semaphore は Ansible の追加変数をコマンドラインで渡さなくなりました。変数グループ、アンケートの回答、ワークフローの入力、組み込みの `semaphore_vars` オブジェクトは一時的な YAML ファイルに書き込まれ、`--extra-vars @file` として渡されます。すべての文字列値には `!unsafe` タグが付けられるため、Ansible は値をデータとして扱い、値の中の Jinja2 を評価しません。

アンケートのフィールド、変数グループ、`--extra-vars` テンプレートに Jinja2 を保存し、playbook の実行前に Semaphore や Ansible が展開することを期待していた場合、その展開は行われなくなります。ロジックを playbook に移す(たとえば、`my_var` が Semaphore から渡される単純な値であるときに `{{ my_var }}` を使う)か、Semaphore の外で値を計算してください。

アンケートのシークレットと変数グループのシークレットは、別の Ansible Vault ファイルで暗号化されます。Semaphore はタスクごとに一度限りの vault ID とパスワードを生成し、Ansible の vault プロンプトに stdin で応答します。これはテンプレートに関連付ける vault パスワードとは別のものです。

[アンケート変数](/user-guide/task-templates/survey-vars)、[変数グループ](/user-guide/environment)、[セキュリティ — Ansible タスク変数](/admin-guide/security#ansible-task-variables)を参照してください。

### ワークフローの出力とタスク API のフィールド {#workflow-outputs-and-task-api}

[ワークフローの出力](/user-guide/workflows#producing-outputs)はタスクの実行によって書き込まれ、API でタスクを開始するときに設定することはできません。`POST /api/project/{project_id}/tasks` は、ボディに `workflow_run_id`、`workflow_node_id`、`workflow_template_id`、`artifacts`、`runner_id` が含まれていても無視します。
