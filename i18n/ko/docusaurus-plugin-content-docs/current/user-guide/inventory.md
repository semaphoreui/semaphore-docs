# 인벤토리

![인벤토리 목록](/assets/inventory-list.webp)

인벤토리는 Ansible이 플레이를 실행할 호스트 목록을 담고 있는 파일입니다.
인벤토리에는 playbook에서 사용할 수 있는 변수도 저장됩니다. 인벤토리는 YAML, JSON 또는 TOML 형식으로 저장할 수 있습니다.
인벤토리에 대한 자세한 정보는 [Ansible 문서](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)에서 확인할 수 있습니다.

Semaphore UI는 Semaphore 사용자가 읽기 권한을 가진 서버상의 파일에서 인벤토리를 읽거나, 웹 GUI를 통해 편집하는 정적 인벤토리를 사용할 수 있습니다.
각 인벤토리에는 최소 하나의 자격 증명이 연결되어 있습니다.
사용자 자격 증명은 필수이며, Ansible이 해당 인벤토리의 호스트에 로그인할 때 사용됩니다. Sudo 자격 증명은 해당 호스트에서 권한을 상승시키는 데 사용됩니다.
인벤토리를 생성하려면 키 저장소에 로그인 정보가 있는 사용자 이름 또는 SSH로 구성된 사용자 자격 증명이 있어야 합니다.
자격 증명에 대한 정보는 이 사이트의 [키 저장소](key-store) 섹션에서 확인할 수 있습니다.

## 인벤토리 유형 {#inventory-types}

| 유형 | 설명 |
|---|---|
| `static` | 웹 UI에서 편집하는 INI 형식의 인벤토리입니다. |
| `static-yaml` | 웹 UI에서 편집하는 YAML 형식의 인벤토리입니다. [NetBox](./inventory/netbox-dynamic-inventory)나 [Consul](./inventory/consul-dynamic-inventory)과 같은 플러그인 인벤토리에 사용하십시오. |
| `file` | 인벤토리 파일의 경로입니다. 상대 경로는 템플릿의 리포지토리를 가리키고, 절대 경로는 서버상의 파일을 가리킵니다. 파일이 다른 Git 리포지토리에 있는 경우 선택적으로 별도의 **인벤토리 리포지토리**를 선택할 수 있습니다. |
| `terraform-workspace`, `tofu-workspace`, `terragrunt-workspace` | Ansible 인벤토리가 아니라 [Terraform/OpenTofu](./apps/terraform/workspaces) 및 [Terragrunt](./apps/terragrunt) 템플릿을 위한 워크스페이스입니다. |

## 인벤토리 생성 {#creating-an-inventory}
1. 키 저장소 탭을 클릭하고 login_password 또는 ssh 유형의 키가 있는지 확인합니다
2. 인벤토리 탭을 클릭하고 새 인벤토리를 클릭합니다
3. 인벤토리의 이름을 지정하고 드롭다운에서 올바른 사용자 자격 증명을 선택합니다. 필요한 경우 올바른 sudo 자격 증명을 선택합니다
4. 인벤토리 유형을 선택합니다
  * 파일을 선택한 경우 파일의 절대 경로를 사용합니다. 이 파일이 git 리포지토리에 있는 경우 상대 경로를 사용합니다. 예: `inventory/linux-hosts.yaml`
  * static 또는 static-yaml을 선택한 경우 양식에 인벤토리를 붙여넣거나 입력합니다
5. 생성을 클릭합니다.

## 인벤토리 업데이트 {#updating-an-inventory}
1. 인벤토리 탭을 클릭합니다
2. 편집할 인벤토리 옆의 연필 아이콘을 클릭합니다
3. 변경 사항을 적용합니다
4. 저장을 클릭합니다

## 인벤토리 삭제 {#deleting-an-inventory}
인벤토리를 제거하기 전에 해당 인벤토리에 연결된 모든 리소스를 제거해야 합니다.
어떤 리소스가 환경에서 사용되고 있는지 확실하지 않은 경우 아래 1단계와 2단계를 따르십시오. 사용 중인 리소스와 해당 리소스로의 링크가 표시됩니다.

1. 인벤토리 탭을 클릭합니다
2. 인벤토리 옆의 휴지통 아이콘을 클릭합니다
3. 인벤토리를 제거하려는 것이 확실하면 예를 클릭합니다
