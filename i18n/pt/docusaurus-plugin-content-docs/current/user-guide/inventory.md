# Inventário

![Lista de inventários](/assets/inventory-list.webp)

Um Inventário é um arquivo que contém uma lista de hosts nos quais o Ansible executará os plays.
Um Inventário também armazena variáveis que podem ser usadas pelos playbooks. Um Inventário pode ser armazenado em YAML, JSON ou TOML.
Mais informações sobre Inventários podem ser encontradas na [Documentação do Ansible.](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)

O Semaphore UI pode ler um Inventário de um arquivo no servidor ao qual o usuário do Semaphore tenha acesso de leitura, ou um Inventário estático que é editado pela interface web.
Um Inventário gerenciado guarda hosts e variáveis como registros que você edita na interface web.
Cada Inventário também possui pelo menos uma credencial vinculada a ele.
A credencial de usuário é obrigatória e é o que o Ansible usa para fazer login nos hosts desse Inventário. As credenciais de sudo são usadas para elevar privilégios nesse host.
Para criar um Inventário, é necessário ter uma credencial de usuário que seja um nome de usuário com login ou um SSH configurado no Armazenamento de Chaves.
Informações sobre credenciais podem ser encontradas na seção [Armazenamento de Chaves](key-store) deste site.

## Tipos de inventário {#inventory-types}

| Tipo | Descrição |
|---|---|
| `static` | Inventário no formato INI editado na interface web. |
| `static-yaml` | Inventário no formato YAML editado na interface web. Use-o para inventários de plugin, como [NetBox](./inventory/netbox-dynamic-inventory) ou [Consul](./inventory/consul-dynamic-inventory). |
| `file` | Caminho para um arquivo de inventário. Um caminho relativo aponta para dentro do repositório do modelo; um caminho absoluto, para um arquivo no servidor. Opcionalmente, selecione um **Repositório de inventário** separado se o arquivo estiver em outro repositório Git. |
| `managed` | Hosts e variáveis são mantidos como registros na interface web. Consulte [Inventário gerenciado](#managed-inventory). |
| `terraform-workspace`, `tofu-workspace`, `terragrunt-workspace` | Não é um inventário do Ansible: é um workspace para modelos [Terraform/OpenTofu](./apps/terraform/workspaces) e [Terragrunt](./apps/terragrunt). |

## Criando um Inventário {#creating-an-inventory}
1. Clique na aba Armazenamento de Chaves e confirme que você possui uma chave do tipo login_password ou ssh
2. Clique na aba Inventário e clique em Novo Inventário
3. Dê um nome ao Inventário e selecione a credencial de usuário correta no menu suspenso. Selecione a credencial de sudo correta, se necessário
4. Selecione o tipo de Inventário
  * Se você selecionar file, use o caminho absoluto do arquivo. Se esse arquivo estiver no seu repositório git, use o caminho relativo. Ex.: `inventory/linux-hosts.yaml`
  * Se você selecionar static ou static-yaml, cole ou digite seu Inventário no formulário
  * Se você selecionar managed, crie primeiro o Inventário e depois adicione hosts e variáveis na página dele. Consulte [Inventário gerenciado](#managed-inventory)
5. Clique em Criar.

## Atualizando um Inventário {#updating-an-inventory}
1. Clique na aba Inventário
2. Clique no ícone de lápis ao lado do Inventário que deseja editar
3. Faça suas alterações
4. Clique em Salvar

Para alterar os hosts e as variáveis de um Inventário gerenciado, consulte [Inventário gerenciado](#managed-inventory).

## Excluindo um Inventário {#deleting-an-inventory}
Antes de remover um Inventário, você deve remover todos os recursos vinculados a ele.
Se você não tem certeza de quais recursos estão sendo usados em um ambiente, siga os passos 1 e 2 abaixo. Eles mostrarão quais recursos estão sendo usados, com links para esses recursos.

1. Clique na aba Inventário
2. Clique no ícone de lixeira ao lado do Inventário
3. Clique em Sim se tiver certeza de que deseja remover o Inventário

## Inventário gerenciado {#managed-inventory}

Um inventário gerenciado guarda seus hosts como registros em vez de texto de inventário. Use-o quando você adiciona, altera ou desativa hosts com frequência e não quer editar um texto longo.

Clique no nome do inventário na lista. A página tem duas abas:

* **Hosts**: pesquise hosts pelo nome, adicione, edite e exclua. A coluna **Variables** mostra quantas variáveis um host tem. Clique em uma linha para vê-las.
* **Variables**: variáveis do inventário inteiro.

Um host tem um nome, uma descrição opcional e variáveis. O nome é o que o Ansible vê como host. Ele deve ser único no inventário, diferencia maiúsculas de minúsculas e não deve conter espaços, vírgulas, colchetes ou dois-pontos. Coloque o endereço e a porta nas variáveis `ansible_host` e `ansible_port`.

Escreva as variáveis de um host e do inventário em YAML ou JSON, como um mapeamento:

```yaml
ansible_host: 10.0.0.5
ansible_user: deploy
```

Um valor definido em um host prevalece sobre a mesma variável definida no inventário. Âncoras, aliases e chaves de mesclagem do YAML não são aceitos.

Para pular um host, desligue a chave dele na lista de hosts. As tarefas criadas depois não usam o host. Ligue a chave para usar o host de novo.

* Você não pode mudar o tipo de um inventário para `managed` nem a partir de `managed` depois de criá-lo.
* Os hosts e as variáveis de um inventário gerenciado fazem parte do backup do projeto.
* Usuários que só podem ver o projeto podem abrir a página, mas não podem alterá-la.
