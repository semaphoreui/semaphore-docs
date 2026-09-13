# 변수 그룹

![변수 그룹 목록](/assets/variable-groups-list.webp)

Semaphore의 변수 그룹 섹션은 인벤토리에 대한 추가 변수를 저장하는 공간이며, 변수는 JSON 형식으로 저장해야 합니다.

모든 작업 템플릿은 변수 그룹이 비어 있더라도 반드시 정의되어 있어야 합니다. 

## 변수 그룹 생성 {#create-a-variable-group}
1. 변수 그룹 탭을 클릭합니다.
2. 새 변수 그룹 버튼을 클릭합니다.
3. 변수 그룹의 이름을 지정하고 유효한 JSON 변수를 입력하거나 붙여넣습니다. 빈 변수 그룹이 필요한 경우 ```{}```를 입력합니다.

## 변수 그룹 업데이트 {#updating-a-variable-group}
1. 변수 그룹 탭을 클릭합니다.
2. 연필 아이콘을 클릭합니다.
3. 변경 사항을 적용하고 저장을 클릭합니다.

## 변수 그룹 삭제 {#deleting-the-variable-group}
변수 그룹을 제거하기 전에 해당 그룹에 연결된 모든 리소스를 제거해야 합니다.
어떤 리소스가 변수 그룹에서 사용되고 있는지 확실하지 않은 경우 아래 1단계와 2단계를 따르십시오. 사용 중인 리소스와 해당 리소스로의 링크가 표시됩니다.

1. 변수 그룹을 클릭합니다.
2. 변수 그룹 옆의 휴지통 아이콘을 클릭합니다.
3. 변수 그룹을 제거하려는 것이 확실하면 예를 클릭합니다.

## 변수 그룹 사용 - Terraform/OpenTofu {#using-variable-groups---terraformopentofu}
저장된 변수 그룹의 변수나 시크릿을 terraform 템플릿에서 사용하려면, terraform 스크립트가 이를 사용할 수 있도록 이름 앞에 `TF_VAR_` 접두사를 붙여야 합니다. 

**예시**
Hetzner Cloud API 키를 OpenTofu/Terraform 플레이북에 전달하기. 

1. 변수 그룹을 클릭합니다
2. `New Group`을 클릭합니다
3. `Secrets` 탭을 클릭합니다
4. `TF_VAR_hcloud_token`을 추가하고 숨겨진 필드에 `secret`을 입력합니다
5. 저장을 클릭합니다

hetzner.tf에서는 시크릿 `TF_VAR_hcloud_token`을
`var.hcloud_token`으로 참조합니다
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
