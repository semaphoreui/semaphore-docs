---
title: 設定
description: Semaphore は設定ファイルと環境変数から設定を読み込みます。オンライン設定ツールでは、フォームからどちらの形式も作成できます。サーバーの運用方法に合った手順を選んでください。
---

# 設定

Semaphore は設定ファイルと環境変数から設定を読み込みます。オンライン設定ツールでは、フォームからどちらの形式も作成できます。サーバーの運用方法に合った手順を選んでください。

## このセクションの内容 {#in-this-section}

| 方法 | 適した用途 |
|---|---|
| [オンライン設定ツール](/admin-guide/configuration/online) | バイナリまたは Docker のインストール用に、フォームから設定と起動コマンドを生成したい場合。 |
| [設定ファイル](/admin-guide/configuration/config-file) | サーバーの設定を `config.json` ファイルに保存したい場合。 |
| [環境変数](/admin-guide/configuration/env-vars) | Docker、サービス定義、デプロイツールで設定を管理する場合。 |

## 設定オプション {#configuration-options}

環境変数は設定ファイルの対応する値より優先されます。どちらも指定されていない場合は、既定値が適用されます。ファイルを変更しても反映されない場合は、Semaphore プロセスに渡される環境変数を確認してください。

[設定オプションのリファレンス](/reference/configuration)には、名前、環境変数、型、既定値が記載されています。Semaphore のソースコードから生成されるため、古いサーバーを設定する場合はそのバージョンのドキュメントを使用してください。

<span id="frequently-asked-questions" />

## 公開 URL {#1-how-to-configure-a-public-url-for-semaphore-ui}

`web_host`（または `SEMAPHORE_WEB_ROOT`）には、ユーザーがブラウザーで開くアドレスを指定します。リバースプロキシが `https://example.com/semaphore` で Semaphore を公開する場合、`/semaphore` を含む完全なアドレスを使用します。プロキシの接続先となる内部アドレスではなく、公開アドレスです。

## はじめに {#where-to-start}

新しいサーバーでは、上のオンライン設定ツールのガイドを開き、バイナリまたは Docker の手順に従ってください。既存のサーバーでは、サービスが使用するファイルまたは環境変数を更新し、Semaphore を再起動してください。
