# Prompts

Prompts são flags e opções predefinidas, específicas de cada tipo de template, que você pode ativar para permitir a personalização em tempo de execução. Diferentemente das [Variáveis de Survey](/user-guide/task-templates/survey-vars), que são campos personalizados criados por você, os prompts são opções internas que correspondem a flags específicas da CLI do Ansible, do Terraform e de outras ferramentas.

Este recurso permite que você:
- Substitua os valores padrão do template em tempo de execução
- Direcione hosts ou recursos específicos
- Controle o comportamento da execução com flags da CLI
- Passe opções de execução por chamadas de API ou agendamentos

## Prompts vs. Variáveis de Survey {#prompts-vs-survey-variables}

| Recurso | Prompts | Variáveis de Survey |
|---------|---------|-----------------|
| **Definição** | Opções predefinidas específicas do template | Campos personalizados criados por você |
| **Exemplos** | Ansible: `--limit`, `--tags`<br/>Terraform: workspaces, `-destroy` | Nome do ambiente, número da versão, parâmetros personalizados |
| **Configuração** | Ativadas por caixas de seleção no template | Adicionadas nas configurações do template com nome e tipo |
| **Passadas como** | Flags internas da CLI | Ansible: `--extra-vars`<br/>Terraform: `-var` |

Os **Prompts** são opções padronizadas incorporadas ao Semaphore para ferramentas específicas, enquanto as **Variáveis de Survey** são campos personalizados flexíveis que você mesmo define.

## Prompts do Ansible {#ansible-prompts}

Para templates de playbook do Ansible, você pode ativar prompts para as seguintes opções da CLI:

### Limit {#limit}

Ative o prompt `--limit` para especificar quais hosts serão o alvo ao executar o playbook.

**Equivalente na CLI**: `ansible-playbook playbook.yml --limit webservers`

**Casos de uso**:
- Executar o playbook em um subconjunto dos hosts do inventário
- Direcionar servidores específicos para o deploy
- Testar alterações em um único host antes de aplicá-las em todos

**Exemplo**:
- Seu inventário contém 50 servidores web
- Ative o prompt Limit
- Ao executar a tarefa, especifique `web-01.example.com` para direcionar apenas esse servidor
- Ou especifique `webservers:&production` para direcionar os servidores web de produção

### Tags {#tags}

Ative o prompt `--tags` para executar apenas as tasks com tags específicas.

**Equivalente na CLI**: `ansible-playbook playbook.yml --tags deploy,restart`

**Casos de uso**:
- Executar apenas partes específicas de um playbook
- Executar as etapas de deploy sem as tasks de configuração
- Reiniciar serviços rapidamente sem executar o playbook completo

**Exemplo**:
```yaml
---
- hosts: all
  tasks:
    - name: Install packages
      apt:
        name: nginx
      tags: install

    - name: Deploy application
      copy:
        src: app.tar.gz
        dest: /opt/app/
      tags: deploy

    - name: Restart service
      service:
        name: nginx
        state: restarted
      tags: restart
```

Ative o prompt Tags e informe `deploy,restart` para pular a etapa de instalação.

### Skip Tags {#skip-tags}

Ative o prompt `--skip-tags` para pular as tasks com tags específicas.

**Equivalente na CLI**: `ansible-playbook playbook.yml --skip-tags testing,debug`

**Casos de uso**:
- Pular tasks opcionais em produção
- Excluir tasks de depuração ou de teste
- Ignorar tasks demoradas quando não forem necessárias

**Exemplo**: Usando o playbook acima, ative Skip Tags e informe `install` para pular a instalação de pacotes e executar apenas as tasks de deploy e reinício.

### Skip Galaxy install {#skip-galaxy-install}

Ative o prompt para permitir que o usuário pule a etapa `ansible-galaxy install` de roles e coleções ao executar a tarefa.

**Casos de uso**:
- Os requirements já estão instalados na imagem do runner
- Economizar tempo em execuções repetidas quando nada mudou no `requirements.yml`

### Force Galaxy install {#force-galaxy-install}

Ative o prompt para permitir que o usuário force `ansible-galaxy install --force` para todos os arquivos de requirements, ignorando o checksum dos requirements que o Semaphore mantém entre as execuções.

**Equivalente na CLI**: `ansible-galaxy role install -r requirements.yml --force`

**Casos de uso**:
- Um arquivo de requirements referencia um branch em vez de uma versão fixa e você precisa do commit mais recente
- Uma instalação anterior deixou roles ou coleções em um estado inconsistente
- Verificar que um playbook funciona a partir de um conjunto limpo de dependências

Consulte [Requirements do Galaxy](../apps/ansible.md#galaxy-requirements) para saber como funcionam os valores padrão no nível do template.

### Ativando os prompts do Ansible {#enabling-ansible-prompts}

Para ativar os prompts do Ansible:

1. Acesse **Templates de Tarefa** e selecione o seu template do Ansible
2. Localize a seção **Ansible Prompts** nas configurações do template
3. Marque as caixas de seleção dos prompts desejados:
   - ☐ **Limit** - Ativa a flag `--limit`
   - ☐ **Tags** - Ativa a flag `--tags`
   - ☐ **Skip Tags** - Ativa a flag `--skip-tags`
   - ☐ **Debug** - Ativa a seleção de verbosidade (`-v`)
   - ☐ **Skip Galaxy install** - Permite pular o `ansible-galaxy install`
   - ☐ **Force Galaxy install** - Permite forçar o `ansible-galaxy install --force`
4. Salve o template

![](/assets/ansible_2.png)

Quando ativados, esses campos aparecem no formulário de execução da tarefa, nas requisições de API e nas configurações de agendamento.

## Prompts do Terraform/OpenTofu {#terraformopentofu-prompts}

Para templates do Terraform e do OpenTofu, o Semaphore oferece vários prompts internos:

### Seleção de workspace {#workspace-selection}

Selecione qual workspace do Terraform será usado na execução da tarefa.

**Equivalente na CLI**: `terraform workspace select staging`

**Casos de uso**:
- Gerenciar vários ambientes (dev, staging, produção)
- Separar os arquivos de state para configurações diferentes
- Testar alterações de infraestrutura de forma isolada

**Configuração**:
1. Crie os workspaces na aba **Workspaces** do template
2. O seletor de workspace aparece automaticamente no formulário da tarefa
3. Os usuários escolhem o workspace de destino ao executar as tarefas

Consulte [Workspaces do Terraform](/user-guide/apps/terraform/workspaces) para a configuração detalhada.

### Flag Destroy {#destroy-flag}

Ative a flag `-destroy` para desmontar a infraestrutura.

**Equivalente na CLI**: `terraform apply -destroy`

**Casos de uso**:
- Limpar ambientes de teste temporários
- Desativar infraestrutura
- Remover recursos específicos

**Importante**: Esta é uma operação destrutiva. Use com cautela e considere exigir confirmação nos seus fluxos de trabalho.

### Flag Migrate State {#migrate-state-flag}

Ative a flag `-migrate-state` ao alterar a configuração do backend.

**Equivalente na CLI**: `terraform init -migrate-state`

**Casos de uso**:
- Mover o state para outro backend
- Migrar entre locais de armazenamento
- Atualizar a configuração do backend

### Ativando os prompts do Terraform {#enabling-terraform-prompts}

Os prompts do Terraform estão disponíveis nas configurações do template:

1. Acesse **Templates de Tarefa** e selecione o seu template do Terraform
2. Configure os prompts disponíveis nas configurações do template:
   - Seleção de workspace (ativada automaticamente se houver workspaces configurados)
   - Opção da flag Destroy
   - Opção Migrate State
3. Salve o template

O formulário da tarefa exibe essas opções ao executar tarefas do Terraform.

## Prompts de Bash, PowerShell e Python {#bash-powershell-and-python-prompts}

Para templates de Bash, PowerShell e Python, os prompts são mínimos, pois a maior parte da personalização é feita por meio das [Variáveis de Survey](/user-guide/task-templates/survey-vars).

Os prompts disponíveis são:

- CLI args
- Branch

Esses tipos de template se beneficiam mais das Variáveis de Survey personalizadas para passar parâmetros aos scripts.

## Usando os prompts {#using-prompts}

### Execução manual de tarefas {#manual-task-execution}

Ao executar uma tarefa a partir de um template com prompts ativados:

1. Clique em **Run** no template
2. Um formulário aparece com os campos dos prompts ativados
3. Preencha os valores dos prompts que deseja usar (campos opcionais podem ficar vazios)
4. Clique em **Run Task**

A tarefa é executada com os valores de prompt especificados, passados como flags da CLI.

### Chamadas de API {#api-calls}

Para passar valores de prompt pela API, inclua-os no payload da requisição:

**Exemplo com Ansible:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "limit": "webservers",
    "tags": "deploy,restart",
    "skip_tags": "testing"
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

**Importante**: Os prompts precisam estar ativados no template para que os valores sejam aceitos. Se você passar valores de prompt pela API sem ativá-los, esses valores serão ignorados.

### Tarefas agendadas {#scheduled-tasks}

Os agendamentos podem incluir valores de prompt para personalizar a execução automatizada das tarefas:

**Exemplo**: Agendamento com prompts do Ansible
- Agendamento diário de deploy com `limit: "production"` e `tags: "deploy"`
- Agendamento semanal de manutenção com `tags: "updates,cleanup"`

Configure os valores de prompt nas configurações do agendamento para que cada execução agendada use as opções especificadas.

### Integrações e webhooks {#integrations-and-webhooks}

As integrações podem extrair valores dos webhooks e mapeá-los para os prompts:

**Exemplo**: Webhook do GitHub aciona o deploy
- Extrai o nome do branch do webhook
- Mapeia para o prompt Limit para direcionar um ambiente específico
- Faz o deploy apenas nos servidores correspondentes ao ambiente do branch

Consulte [Integrações](../integrations) para a configuração de webhooks.

## Boas práticas {#best-practices}

### Ative apenas os prompts necessários {#enable-only-necessary-prompts}

Cada prompt ativado adiciona um campo ao formulário da tarefa. Ative apenas os prompts que os usuários realmente precisarão personalizar.

✅ **Bom**: Ativar Limit para equipes de operações que precisam direcionar hosts específicos
❌ **Ruim**: Ativar todos os prompts "por precaução"

### Combine com Variáveis de Survey {#combine-with-survey-variables}

Use prompts para as opções de CLI específicas da ferramenta e Variáveis de Survey para parâmetros personalizados:

**Exemplo de template do Ansible:**
- **Prompts**: Limit (quais hosts), Tags (quais tasks)
- **Variáveis de Survey**: `app_version` (qual versão), `enable_rollback` (lógica personalizada)

### Documente o uso da API {#document-api-usage}

Se os templates forem acionados pela API, documente quais prompts estão disponíveis e o formato esperado:

```markdown
## API Usage

Enabled prompts:
- `limit`: Host pattern (optional)
- `tags`: Comma-separated tag list (optional)

Example:
POST /api/project/1/tasks
{
  "template_id": 123,
  "limit": "webservers:&production",
  "tags": "deploy"
}
```

### Use Limit para testes seguros {#use-limit-for-safe-testing}

Sempre teste playbooks potencialmente destrutivos primeiro com o prompt Limit:

1. Ative o prompt Limit no template
2. Primeira execução: especifique `limit: "test-server-01"` para testar em um host
3. Verifique o sucesso
4. Segunda execução: especifique `limit: "production"` para aplicar em todos os hosts

### Valide as combinações de prompts {#validate-prompt-combinations}

Algumas combinações de prompts podem não fazer sentido. Adicione documentação ou validação:

- Usar `--tags deploy` com `--skip-tags deploy` gera conflito
- Especificar workspace e flag destroy ao mesmo tempo exige cautela extra

## Casos de uso comuns {#common-use-cases}

### Rollout gradual com Limit {#gradual-rollout-with-limit}

Faça o deploy em produção gradualmente usando o Limit do Ansible:

1. Execução 1: `limit: "web-01.example.com"` - Deploy em um servidor
2. Monitore em busca de problemas
3. Execução 2: `limit: "webservers:&canary"` - Deploy nos servidores canary
4. Valide as métricas
5. Execução 3: `limit: "webservers:&production"` - Rollout completo

### Execução seletiva com Tags {#selective-execution-with-tags}

Use Tags para executar apenas partes específicas de um playbook:

**Manhã**: `tags: "deploy"` - Deploy da nova versão
**Tarde**: `tags: "config"` - Atualização da configuração
**Noite**: `tags: "restart"` - Reinício dos serviços com a nova configuração

### Gerenciamento de ambientes com workspaces {#environment-management-with-workspaces}

Use a seleção de workspace do Terraform para gerenciar ambientes:

- **Desenvolvimento**: Selecione o workspace `dev` - recursos mais baratos, iteração mais rápida
- **Staging**: Selecione o workspace `staging` - semelhante à produção, para testes
- **Produção**: Selecione o workspace `prod` - infraestrutura de produção completa

### Limpeza com Destroy {#cleanup-with-destroy}

Use o destroy do Terraform para infraestrutura temporária:

1. Crie o ambiente de teste: execute com o workspace `test-branch-123`
2. Execute os testes de integração
3. Limpe: execute com a flag destroy ativada e o workspace `test-branch-123`

## Solução de problemas {#troubleshooting}

### Valores de prompt ignorados {#prompt-values-ignored}

**Problema**: Os valores de prompt são passados, mas não têm efeito

**Solução**: Verifique se o prompt correspondente está ativado nas configurações do template. Os prompts precisam ser ativados explicitamente.

### Não é possível especificar o limit {#cannot-specify-limit}

**Problema**: O campo Limit não aparece no formulário da tarefa

**Solução**: 
1. Edite o template
2. Localize a seção "Ansible Prompts"
3. Marque a caixa de seleção "Limit"
4. Salve o template

### Chamadas de API falham com valores de prompt {#api-calls-fail-with-prompt-values}

**Problema**: Requisições de API com valores de prompt retornam erros

**Solução**: 
1. Confirme que os prompts estão ativados no template
2. Verifique a formatação do JSON no corpo da requisição
3. Verifique se os nomes dos campos correspondem exatamente (`limit`, não `host_limit`)

### Tags não filtram as tasks {#tags-not-filtering-tasks}

**Problema**: As tags são especificadas, mas todas as tasks continuam sendo executadas

**Solução**: 
1. Verifique se as tasks no playbook têm as tags corretamente definidas
2. Verifique se há erros de digitação nos nomes das tags
3. Confirme que as tags estão separadas por vírgula sem espaços: `deploy,restart`, e não `deploy, restart`

## Documentação relacionada {#related-documentation}

- [Variáveis de Survey](/user-guide/task-templates/survey-vars) - Campos personalizados para templates
- [Templates do Ansible](/user-guide/apps/ansible) - Configuração específica do Ansible
- [Templates do Terraform](/user-guide/apps/terraform) - Configuração específica do Terraform
- [Agendamentos](../schedules) - Execução automatizada de tarefas
- [Integrações](../integrations) - Tarefas acionadas por webhook
- [Documentação da API](../../reference/api) - Referência da API
