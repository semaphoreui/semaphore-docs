# Grupos de Variáveis

![Lista de grupos de variáveis](/assets/variable-groups-list.webp)

A seção Grupos de Variáveis do Semaphore é um local para armazenar variáveis adicionais para um inventário, e elas devem ser armazenadas no formato JSON.

Todos os modelos de tarefa exigem que um grupo de variáveis seja definido, mesmo que esteja vazio. 

## Criar um grupo de variáveis {#create-a-variable-group}
1. Clique na aba Grupos de Variáveis.
2. Clique no botão Novo Grupo de Variáveis.
3. Dê um nome ao Grupo de Variáveis e digite ou cole variáveis em JSON válido. Se você precisa apenas de um Grupo de Variáveis vazio, digite ```{}```.

## Atualizando um grupo de variáveis {#updating-a-variable-group}
1. Clique na aba Grupos de Variáveis.
2. Clique no ícone de lápis.
3. Faça as alterações e clique em salvar.

## Excluindo o grupo de variáveis {#deleting-the-variable-group}
Antes de remover um grupo de variáveis, você deve remover todos os recursos vinculados a ele.
Se você não tem certeza de quais recursos estão sendo usados em um grupo de variáveis, siga os passos 1 e 2 abaixo. Eles mostrarão quais recursos estão sendo usados, com links para esses recursos.

1. Clique no Grupo de Variáveis.
2. Clique no ícone de lixeira ao lado do Grupo de Variáveis.
3. Clique em Sim se tiver certeza de que deseja remover o grupo de variáveis.

## Usando Grupos de Variáveis - Terraform/OpenTofu {#using-variable-groups---terraformopentofu}
Quando você quiser utilizar uma variável ou um segredo armazenado em um grupo de variáveis no seu modelo Terraform, deve prefixar o nome com `TF_VAR_` para que o script do Terraform o utilize. 

**Exemplo**
Passando a chave de API da Hetzner Cloud para um playbook OpenTofu/Terraform. 

1. Clique em Grupo de Variáveis
2. Clique em `New Group`
3. Clique na aba `Secrets`
4. Adicione `TF_VAR_hcloud_token` e insira seu `secret` no campo oculto
5. Clique em Salvar

Chamaremos nosso segredo `TF_VAR_hcloud_token` como `var.hcloud_token` em 
hetzner.tf
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
