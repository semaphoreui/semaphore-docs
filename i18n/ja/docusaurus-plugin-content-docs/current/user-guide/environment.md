# 変数グループ

![変数グループの一覧](/assets/variable-groups-list.webp)

Semaphore の変数グループセクションは、インベントリ用の追加変数を保存する場所で、JSON 形式で保存する必要があります。

すべてのタスクテンプレートには、空であっても変数グループの定義が必要です。 

## 変数グループの作成 {#create-a-variable-group}
1. 変数グループタブをクリックします。
2. 「新しい変数グループ」ボタンをクリックします。
3. 変数グループに名前を付け、有効な JSON の変数を入力または貼り付けます。空の変数グループが必要な場合は ```{}``` と入力します。

## 変数グループの更新 {#updating-a-variable-group}
1. 変数グループタブをクリックします。
2. 鉛筆アイコンをクリックします。
3. 変更を加えて「保存」をクリックします。

## 変数グループの削除 {#deleting-the-variable-group}
変数グループを削除する前に、それに関連付けられているすべてのリソースを削除する必要があります。
変数グループでどのリソースが使用されているかわからない場合は、以下の手順 1 と 2 に従ってください。使用されているリソースが、それらへのリンクとともに表示されます。

1. 変数グループをクリックします。
2. 変数グループの横にあるゴミ箱アイコンをクリックします。
3. 本当に変数グループを削除してよければ「はい」をクリックします。

## 変数グループの使用 - Terraform/OpenTofu {#using-variable-groups---terraformopentofu}
保存した変数グループの変数やシークレットを terraform テンプレートで利用したい場合は、terraform スクリプトがそれを使用できるように、名前の先頭に `TF_VAR_` を付ける必要があります。 

**例**
Hetzner Cloud の API キーを OpenTofu/Terraform の playbook に渡します。 

1. 変数グループをクリックします
2. `New Group` をクリックします
3. `Secrets` タブをクリックします
4. `TF_VAR_hcloud_token` を追加し、非表示のフィールドに `secret` を入力します
5. 「保存」をクリックします

`TF_VAR_hcloud_token` というシークレットは、hetzner.tf では
`var.hcloud_token` として参照します。
```
terraform {
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
  }
}

# Declare the variable
variable "hcloud_token" {
  type        = string
  description = "Hetzner Cloud API token"
  sensitive   = true  # This prevents the token from being displayed in logs
}

provider "hcloud" {
  token = var.hcloud_token
}

# Create a new server running debian
resource "hcloud_server" "webserver" {
  name        = "webserver"
  image       = "ubuntu-24.04"
  server_type = "cpx11" 
  location    = "ash"
  ssh_keys = [ "mysshkey" ]
  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }
}
``` 
