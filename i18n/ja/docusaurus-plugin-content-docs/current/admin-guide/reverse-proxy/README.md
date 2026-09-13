---
title: リバースプロキシ
description: Semaphore をリバースプロキシの背後に置く理由、どの構成でも必ず対応すべき事項、および nginx、Apache、Caddy の例です。
---

# リバースプロキシ

リバースプロキシは Semaphore の前段に置かれて TLS を終端します。これにより、ブラウザーと
ランナーは HTTPS でプロキシと通信し、Semaphore 自体はローカルインターフェース上で平文の
HTTP を待ち受けます。Semaphore には[組み込みの TLS](/admin-guide/security/network#tls) も
あるため、プロキシは必須ではありません。すでにプロキシを運用している場合、証明書を別の
場所で管理する必要がある場合、Semaphore をサブパスで公開したい場合、または 1 台のホストで
複数のサービスを提供する場合にプロキシを使ってください。

## どの構成でも必ず対応すべき事項 {#what-every-configuration-must-handle}

どのプロキシを選ぶ場合でも、次の 3 点が正しくないと、インターフェースの一部が
原因を特定しにくい形で動作しなくなります。

- **`/api/ws` での WebSocket アップグレード。** タスクログは WebSocket でストリーミング
  されます。アップグレードのヘッダーがないと、タスクの実行中もログウィンドウは空のままです。
- **ping の間隔より長い読み取りタイムアウト。** Semaphore はアイドル状態の WebSocket に
  対して約 2 分ごとに ping を送ります。アイドル接続を 60 秒で閉じるプロキシでは、ログ表示が
  繰り返し切断されます。
- **公開 URL に設定された `web_host`。** Semaphore はこの値からリダイレクト URL を組み立て、
  クッキーの `Secure` フラグを設定し、リクエストのオリジンを検証します。ブラウザーが使った
  URL と一致しないとサインインに失敗します。
  [設定](/admin-guide/configuration)を参照してください。

## このセクションの内容 {#in-this-section}

| ページ | 内容 |
|---|---|
| [nginx](/admin-guide/reverse-proxy/nginx) | TLS、WebSocket のアップグレード、転送ヘッダーを含む server ブロックです。 |
| [Apache](/admin-guide/reverse-proxy/apache) | `mod_proxy` と `mod_proxy_wstunnel` を使う仮想ホストです。 |
| [Caddy](/admin-guide/reverse-proxy/caddy) | 証明書を自動取得する最小限の Caddyfile です。 |

## ここから始める {#where-to-start}

すでに運用しているプロキシを選んでください。特に希望がなく、既存のプロキシもない場合は、
[Caddy](/admin-guide/reverse-proxy/caddy) が最短の道です。証明書の取得と更新を自動で
行ってくれます。

TLS を超える強化については、[ネットワークのセキュリティ](/admin-guide/security/network)を
参照してください。
