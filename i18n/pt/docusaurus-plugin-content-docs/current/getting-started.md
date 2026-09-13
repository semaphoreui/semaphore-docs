# Primeiros passos

Esta página guia você desde uma instalação nova até a sua primeira tarefa executada com sucesso. Cada passo tem um link para a página com os detalhes.

## Do zero à primeira tarefa {#from-zero-to-first-task}

1. **Instale o Semaphore** com o método de sua preferência: [Instalação](/admin-guide/installation).
2. **Faça login** com o usuário administrador que você criou durante a configuração, ou por meio das variáveis `SEMAPHORE_ADMIN_*` no Docker.
3. **Crie um projeto.** Um projeto isola equipes, infraestruturas ou aplicações umas das outras: [Projetos](/user-guide/projects).
4. **Conecte o que a sua automação precisa:**
   - Código-fonte com playbooks, módulos ou scripts: [Repositórios](/user-guide/repositories).
   - Chaves SSH, tokens e senhas: [Armazenamento de Chaves](/user-guide/key-store).
   - Hosts de destino e configurações de conexão: [Inventário](/user-guide/inventory).
   - Variáveis reutilizáveis: [Grupos de Variáveis](/user-guide/environment).
5. **Crie um template de tarefa e execute-o.** Escolha o guia da sua ferramenta: [Ansible](/user-guide/apps/ansible), [Terraform/OpenTofu](/user-guide/apps/terraform), [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell) ou [Python](/user-guide/apps/python). Em seguida, execute e acompanhe: [Tarefas](/user-guide/tasks).
6. **Automatize e operacionalize:**
   - Execute em um agendamento: [Agendamentos](/user-guide/schedules).
   - Controle quem pode fazer o quê: [Equipes e papéis personalizados](/user-guide/team).
   - Receba alertas sobre os resultados: [Notificações](/admin-guide/notifications).

## Conceitos principais {#key-concepts}

Estes termos aparecem em toda a interface.

| Termo | Significado |
|------|---------|
| **Projeto** | A principal unidade de separação. Cada projeto tem seus próprios repositórios, chaves, inventários, templates e equipe. [Projetos](/user-guide/projects) |
| **Repositório** | Um repositório Git ou caminho local onde ficam os playbooks, módulos ou scripts. [Repositórios](/user-guide/repositories) |
| **Inventário** | Hosts, grupos e configurações de conexão para execuções no estilo Ansible. [Inventário](/user-guide/inventory) |
| **Grupo de Variáveis** | Variáveis reutilizáveis e configuração de ambiente, também chamado de Environment. [Grupos de Variáveis](/user-guide/environment) |
| **Armazenamento de Chaves** | Credenciais criptografadas, como chaves SSH, tokens e senhas. [Armazenamento de Chaves](/user-guide/key-store) |
| **Template de Tarefa** | A definição de uma execução: aplicativo, repositório, inventário, variáveis e opções. [Templates de Tarefa](/user-guide/task-templates) |
| **Tarefa** | Uma única execução de um template, com seu log e status. [Tarefas](/user-guide/tasks) |
| **Workflow** | Um grafo de templates com ramificações, aprovações e pausas. Recurso Pro. [Workflows](/user-guide/workflows) |
| **Runner** | Onde as tarefas são executadas: o próprio servidor ou um runner remoto. [Runners](/admin-guide/runners) |

## Próximos passos {#next-steps}

- Coloque o Semaphore atrás de TLS com um [proxy reverso](/admin-guide/reverse-proxy).
- Conecte o seu provedor de identidade: [LDAP](/admin-guide/authentication/ldap) ou [OpenID Connect](/admin-guide/authentication/openid).
- Controle o Semaphore a partir de CI ou scripts com a [API](/reference/api) e a [CLI](/reference/cli).
