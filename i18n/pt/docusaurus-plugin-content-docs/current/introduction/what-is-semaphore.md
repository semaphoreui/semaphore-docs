---
title: O que é o Semaphore
description: O que o Semaphore UI faz, os problemas que ele resolve, para quem ele é e os casos em que outra ferramenta é a melhor escolha.
---

# O que é o Semaphore

O Semaphore UI é uma interface web e API REST auto-hospedada para executar a automação que
você já tem. Você o aponta para um repositório Git com os seus playbooks do Ansible,
configurações do Terraform ou scripts de shell, diz quais credenciais e hosts
usar, e ele se torna o único lugar onde a sua equipe executa essa automação, armazena os
segredos de que ela precisa e mantém o registro de cada execução.

Você pode executar tarefas individualmente ou combiná-las em um único pipeline com
[Workflows](/user-guide/workflows) (Pro), conectando builds, testes, implantações
e automação de infraestrutura.

O Semaphore não substitui o Ansible, o Terraform ou os seus scripts. Ele os executa, em um
servidor em vez de no notebook de alguém.

## O problema que ele resolve {#the-problem-it-solves}

A automação geralmente começa em uma estação de trabalho. Um engenheiro tem o playbook, o
inventário, a chave SSH e a versão certa do Ansible instalada. Isso funciona até que
uma segunda pessoa precise executar a mesma coisa, ou até que alguém pergunte o que mudou em um
host na terça-feira passada.

O Semaphore move a execução para um servidor compartilhado e acrescenta as partes que faltavam:

| Peça que faltava | O que o Semaphore oferece |
|---|---|
| Todo mundo precisa ter as ferramentas instaladas | Um servidor (ou um runner) as tem; os usuários só precisam de um navegador. |
| Credenciais são copiadas entre notebooks | [Armazenamento de Chaves](/user-guide/key-store) criptografado, que entrega os segredos à execução, nunca ao usuário. |
| Nenhum registro de quem executou o quê | Cada [tarefa](/user-guide/tasks) guarda a sua saída, o status de saída, o usuário e o horário. |
| Ninguém deveria ter root para executar um playbook | Os [papéis](/user-guide/team) definem quem pode executar, editar ou apenas assistir. |
| As execuções acontecem quando alguém lembra | [Agendamentos](/user-guide/schedules), [webhooks](/user-guide/integrations) e chamadas de API as iniciam. |

## Para quem ele é {#who-it-is-for}

- **Equipes de infraestrutura e plataforma** que já usam Ansible ou Terraform e querem
  que os seus colegas o executem sem distribuir credenciais de produção.
- **Equipes que criam pipelines de CI/CD** e querem conectar tarefas de build, teste
  e implantação usando workflows, além de jobs operacionais agendados e sob demanda.
- **Equipes com uma plataforma de CI/CD** que querem manter as execuções operacionais — reinicializações, implantações,
  renovações de certificados — fora do sistema de build e visíveis para pessoas que não
  leem YAML de pipeline.

O Semaphore é auto-hospedado. Não existe versão SaaS: você executa o binário ou o contêiner na
sua própria infraestrutura, e os seus segredos nunca saem dela.

## O que ele executa {#what-it-runs}

Cada [template de tarefa](/user-guide/task-templates) escolhe um aplicativo:

- [Ansible](/user-guide/apps/ansible) — playbooks com inventários, senhas de vault e
  o conjunto completo de opções do `ansible-playbook`.
- [Terraform, OpenTofu e Terragrunt](/user-guide/apps/terraform) — plan e apply com
  workspaces e estado mantidos pelo seu backend.
- [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell) e
  [Python](/user-guide/apps/python) — qualquer coisa que não seja coberta pelos itens acima.

As tarefas são executadas no próprio servidor ou em [runners](/admin-guide/runners) posicionados perto dos
sistemas que eles gerenciam.

[Workflows](/user-guide/workflows) (Pro) conecta templates de tarefas em um pipeline
por meio de um editor visual. Cada etapa pode executar um aplicativo diferente: por exemplo,
compilar e testar código-fonte com scripts de shell, provisionar infraestrutura com
Terraform e depois implantar com Ansible. Você pode adicionar etapas de aprovação,
pausas temporizadas e ramificações executadas em caso de sucesso ou falha. O Semaphore
inicia as tarefas seguintes automaticamente quando as suas condições são atendidas.

## Quando não usá-lo {#when-not-to-use-it}

Conhecer os limites poupa tempo depois.

- **Substituir o Ansible ou o Terraform.** O Semaphore não tem um motor de execução próprio. Se
  o seu playbook não funciona a partir de um shell, ele não funcionará a partir do Semaphore.
- **Atuar como um CMDB.** Os [inventários](/user-guide/inventory) são os inventários de que as suas
  execuções precisam, não uma fonte de verdade sobre o seu parque. Gere-os a partir da sua fonte real
  com um inventário dinâmico.
- **Ser o gerenciador de segredos da sua organização.** Os segredos são criptografados em repouso e foram
  projetados para serem usados por tarefas, não para serem lidos de volta por pessoas. Se você já usa o HashiCorp
  Vault ou outro cofre, [conecte-o](/user-guide/key-store) em vez de copiar os segredos para dentro.
- **Executar um serviço de nó único em que qualquer indisponibilidade é inaceitável.** Vários nós ativos
  exigem [alta disponibilidade](/admin-guide/ha), que é um recurso Enterprise e
  requer PostgreSQL ou MySQL mais Redis.

## Próximos passos {#whats-next}

- [Arquitetura](/introduction/architecture) — os processos, o banco de dados e onde as tarefas são executadas.
- [Conceitos principais](/introduction/concepts) — as dez palavras que a interface espera que você conheça.
- [Primeiros passos](/getting-started) — instale e execute algo.
