---
title: 監査ログを表示する
description: "Web UI で監査ログを確認します。最新のイベント、イベントのすべてのフィールド、Semaphore Pro ではフィルターと CSV または JSON Lines へのエクスポートを使えます。"
---

# 監査ログを表示する

管理者は、ユーザーメニューから **Audit log** を開きます。新しいイベントが先頭に表示され、1 ページに 50 件ずつ表示されます。

![新しいイベントが先頭に表示される監査ログ](/assets/audit-log-list.png)

イベントをクリックすると、そのイベントのすべてのフィールドを確認できます。コピーボタンは、Semaphore が SIEM に送信する形式でイベントをコピーします。

![すべてのフィールドを表示したイベント](/assets/audit-log-card.png)

## フィルタリングとエクスポート <FeatureState feature="audit-log-filters" /> {#filter-export}

期間、ユーザー、イベントの種類、結果、プロジェクト、IP アドレスで絞り込めます。イベント内のユーザー、アドレス、オブジェクト、プロジェクトはリンクになっており、クリックするとそれらでログを絞り込みます。

![イベントのアドレスで絞り込んだログ](/assets/audit-log-filters.png)

フィルターの組み合わせで見つかるイベントが少ない場合、Semaphore は一度に約 2 秒ずつ検索します。**Older** と **Newer** はイベントが見つかるまで自動で検索を続け、どこまで検索したかを表示し、**Stop** で止まります。

**Export** は、フィルターに一致するすべてのイベントを CSV または JSON Lines ファイルとして保存します。エクスポートはそのたびに `audit.log/export` イベントとして記録されます。

![CSV または JSON Lines でエクスポート](/assets/audit-log-export.png)
