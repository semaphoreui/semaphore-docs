---
title: Guia de Administração
description: Para administradores que instalam, configuram, protegem e operam um servidor Semaphore para suas equipes.
---

# Guia de Administração

Esta seção é destinada a administradores que instalam e operam o Semaphore para
outras pessoas. Tudo o que está aqui exige acesso ao próprio servidor: o arquivo
de configuração, as variáveis de ambiente, a linha de comando ou a máquina em que
o Semaphore é executado. O trabalho feito dentro de um projeto pela interface web
é abordado no [Guia do Usuário](/user-guide).

O Semaphore é um único binário Go com uma interface web e uma API REST. Ele
armazena seus dados em SQLite, MySQL ou PostgreSQL, mantém as credenciais
criptografadas e executa tarefas no próprio servidor ou em runners separados. Uma
instalação em funcionamento se resume, portanto, a quatro decisões: como instalá-lo,
onde fica o banco de dados, como os usuários fazem login e onde as tarefas são
executadas.

## Configurar {#set-up}

Tudo o que você configura antes de iniciar o servidor ou ao redor dele.

| Página | O que aborda |
|---|---|
| [Instalação](/admin-guide/installation) | Gerenciador de pacotes, Docker, binário, Kubernetes e uma instalação manual. |
| [Configuração](/admin-guide/configuration) | O arquivo `config.json`, as variáveis de ambiente e todas as opções suportadas. |
| [Atualização](/admin-guide/upgrading) | Migrar para uma versão mais recente e o que verificar primeiro. |
| [Proxy reverso](/admin-guide/reverse-proxy) | Servir o Semaphore atrás de nginx, Apache ou Caddy, com TLS. |
| [Segurança](/admin-guide/security) | Hash de senhas, criptografia de segredos, proteção de rede e JWTs de tarefa. |
| [LDAP e AD](/admin-guide/ldap) | Fazer login em um serviço de diretório. |
| [OpenID Connect](/admin-guide/openid) | Single sign-on com GitHub, Google, Keycloak, Okta e mais nove provedores. |
| [Runners](/admin-guide/runners) | Executar tarefas em máquinas diferentes do servidor. |
| [Alta disponibilidade](/admin-guide/ha) | Executar vários nós do Semaphore sobre um único banco de dados. |

## Operar {#operate}

Tudo o que você faz em um servidor que já está em execução.

| Página | O que aborda |
|---|---|
| [CLI](/reference/cli) | Gerenciar usuários, projetos, vaults, runners e migrações de banco de dados pelo shell. |
| [API](/reference/api) | Autenticar-se com um token e controlar o Semaphore programaticamente. |
| [Integração com CI/CD](/admin-guide/cicd) | Iniciar tarefas do Semaphore a partir de um pipeline externo. |
| [Logs](/admin-guide/logs) | Logs do servidor, logs de tarefas e como encaminhá-los para outro lugar. |
| [Métricas](/admin-guide/metrics) | O endpoint do Prometheus e as métricas que ele expõe. |
| [Notificações](/admin-guide/notifications) | Canais de entrega de alertas: e-mail, Telegram, Slack e outros. |
| [Licença](/admin-guide/license) | Ativar uma assinatura Pro ou Enterprise. |

## Por onde começar {#where-to-start}

Se você está instalando o Semaphore pela primeira vez, leia
[Instalação](/admin-guide/installation) e escolha um método, depois
[Configuração](/admin-guide/configuration) para entender como as opções são
informadas. Coloque o servidor atrás de um
[proxy reverso](/admin-guide/reverse-proxy) com TLS antes que qualquer outra
pessoa o utilize.

Para ver o que uma assinatura paga acrescenta, consulte [Edições](/editions).
