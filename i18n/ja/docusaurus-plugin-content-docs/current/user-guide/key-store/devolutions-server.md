---
title: "Devolutions Server シークレットストレージ"
---

# Devolutions Server シークレットストレージ <Enterprise />

Semaphore UI は、シークレットのストレージとして Devolutions Server をサポートしています。 

![](/assets/dvls1.webp)

次のオプションを指定できます。
- **Devolutions Server URL** — Devolutions サーバーのアドレス。
- **Vault ID** — シークレットが保存されている Vault の識別子。
- **App Key** — 認証に使用するアプリケーションキー。
- **トークン** — 認証トークン。トークンは次の方法で指定できます:
    - データベースに保存する。
    - 環境変数で指定する。
    - ファイルで指定する。

このストレージは読み取り専用モードで動作させることができます。
