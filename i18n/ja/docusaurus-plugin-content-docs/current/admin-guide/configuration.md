# 設定

Semaphore は、いくつかの方法で設定できます。

* [オンライン設定ツール](https://semaphoreui.com/install) &mdash; オンラインで設定を生成する Web インターフェースです。
* [設定ファイル](/admin-guide/configuration/config-file) &mdash; Semaphore を設定する主要かつ最も柔軟な方法です。
* [環境変数](/admin-guide/configuration/env-vars) &mdash; コンテナー環境やクラウドネイティブなデプロイに便利です。


## 設定オプション {#configuration-options}

すべてのオプションと、その環境変数・型・既定値は
[設定オプションのリファレンス](/reference/configuration)にまとめられています。このページは
Semaphore のソースから生成されるため、実行中のリリースと常に一致します。

値の解決順序は 1 つだけです。環境変数が設定ファイルより優先され、組み込みの既定値は
どちらも設定されていない場合にのみ適用されます。

## よくある質問 {#frequently-asked-questions}

### 1. Semaphore UI の公開 URL を設定する方法 {#1-how-to-configure-a-public-url-for-semaphore-ui}

Semaphore の前段に nginx やその他の Web サーバーを使用している場合は、設定オプション `web_host` を指定してください。

たとえば、Semaphore へリクエストをプロキシするサーバーに NGINX を設定したとします。

サーバーのアドレスが `https://example.com` で、`https://example.com/semaphore` へのすべてのリクエストを Semaphore にプロキシしているとします。

この場合、`web_host` は `https://example.com/semaphore` になります。
