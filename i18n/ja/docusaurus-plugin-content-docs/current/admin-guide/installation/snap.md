# Snap (非推奨)

snap 経由で Semaphore をインストールするには、ターミナルで次のコマンドを実行します。

```bash
sudo snap install semaphore
```

Semaphore には次の URL からアクセスできます: [https://localhost:3000](https://localhost:3000)。&#x20;

ただし、ログインするには管理者ユーザーを作成する必要があります。次のコマンドを使用します。

```bash
sudo snap stop semaphore

sudo semaphore user add --admin \
--login john \
--name=John \
--email=john1996@gmail.com \
--password=12345

sudo snap start semaphore
```

次のコマンドで Semaphore サービスの状態を確認できます。

```bash
sudo snap services semaphore
```

次のような表が出力されるはずです。

```
Service               Startup  Current  Notes
semaphore.semaphored  enabled  active   -
```

インストール後は、[Snap Configuration](https://snapcraft.io/docs/configuration-in-snaps) を使用して Semaphore を設定できます。次のコマンドで Semaphore の設定を確認できます。

```bash
sudo snap get semaphore
```

&#x20;利用可能なオプションの一覧は、[設定オプションリファレンス](../configuration#configuration-options)にあります。

----
