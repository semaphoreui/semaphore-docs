# Snap の設定

Snap の設定は、Semaphore を Snap 経由でインストールした場合に使用します。

利用可能なオプションの一覧を確認するには、次のコマンドを使用します:

```bash
sudo snap get semaphore
```

これらの設定はそれぞれ変更できます。例えば Semaphore のポートを変更したい場合は、次のコマンドを使用します:

```bash
sudo snap set semaphore port=4444
```

設定を変更した後は、Semaphore の再起動を忘れないでください:

```bash
sudo snap restart semaphore
```
