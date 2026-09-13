
# PowerShell

Semaphore は Windows ホスト上で (または Windows runner から) PowerShell スクリプトを実行できます。そのためには、**PowerShell** タスクテンプレートを作成します。

## PowerShell テンプレートの作成 {#creating-a-powershell-template}

1. **タスクテンプレート**セクションに移動し、**新しいテンプレート**ボタンをクリックします。
2. アプリの種類として **PowerShell** を選択します。
3. テンプレートを設定します:

| フィールド | 説明 |
|---|---|
| **名前** | テンプレートのわかりやすい名前 |
| **リポジトリ** | `.ps1` スクリプトを含むリポジトリ |
| **Playbook / スクリプト** | スクリプトへの相対パス (例: `scripts/deploy.ps1`) |
| **変数グループ** | 値が環境変数として注入される変数グループ |

4. **作成**をクリックします。
5. **実行**をクリックしてテンプレートを実行します。

## スクリプトへの変数の受け渡し {#passing-variables-to-scripts}

選択した**変数グループ**の変数は、スクリプトの実行前に環境変数として注入されます。PowerShell 内では `$env:VARIABLE_NAME` でアクセスします。

```powershell
Write-Host "Deploying to $env:TARGET_HOST"
```

## Windows ホストでの実行 {#running-on-windows-hosts}

PowerShell テンプレートには、次のいずれかが必要です。
- **Windows runner** — Windows ホストにデプロイされた Semaphore runner。[Runner](/admin-guide/runners) を参照してください。
- Semaphore サーバー自体が Windows 上で動作していること。

## 注意事項 {#notes}

- スクリプトは非対話的に実行されます。ユーザー入力を必要とするプロンプトは避けてください。
- 終了コード `0` は成功を意味し、0 以外の終了コードはタスクを失敗としてマークします。
