---
title: Pré-requisitos
description: O que você precisa antes de instalar o Semaphore - um host, um banco de dados, acesso de rede, credenciais e as ferramentas de automação que as suas tarefas chamam.
---

# Pré-requisitos

O Semaphore tem poucos requisitos rígidos próprios. A maior parte do que você precisa preparar
pertence à automação que ele vai executar e ao ambiente ao redor dela. Percorra
esta página antes da [Instalação](/admin-guide/installation) e a instalação em si
leva minutos.

## Um host {#a-host}

O Semaphore é distribuído como um único binário e como uma imagem de contêiner, e roda em Linux,
macOS e Windows. O Linux é o alvo dos pacotes, das imagens Docker e do chart Helm,
e é o que a maioria das instalações usa.

O serviço é leve: é um processo Go servindo uma interface web. O que de fato
consome memória e CPU é o Ansible, o Terraform e os seus scripts, rodando em paralelo
na mesma máquina. Dimensione o host para o trabalho, não para o Semaphore, e limite a
concorrência com a configuração de projeto **Número máximo de tarefas paralelas** — ou mova
a execução para [runners](/admin-guide/runners) e dimensione-os em vez do host.

Planeje armazenamento persistente em dois lugares: o banco de dados e o diretório em
`tmp_path`, onde os repositórios são clonados. No Docker, isso significa um volume; um contêiner
sem um perde os seus dados quando é recriado.

## Um banco de dados {#a-database}

Escolha um antes de instalar, porque mudar depois significa migrar dados.

| Motor | Use quando |
|---|---|
| **SQLite** | Um servidor, uma equipe. Já incluído, nada a configurar, é o padrão. |
| **PostgreSQL** ou **MySQL/MariaDB** | O serviço é importante para mais do que umas poucas pessoas, você quer backups e monitoramento a partir da sua plataforma de banco de dados existente, ou pretende rodar mais de um nó. |

A [alta disponibilidade](/admin-guide/ha) exige PostgreSQL ou MySQL mais Redis, e
não pode usar SQLite. Se a HA está no seu roadmap, comece com PostgreSQL.

Crie o banco de dados e um usuário com direitos sobre ele antes de instalar; o Semaphore cria
as suas próprias tabelas na primeira inicialização e a cada atualização.

## Acesso de rede {#network-access}

| O Semaphore precisa alcançar | Para |
|---|---|
| Os seus remotos Git | Clonar os repositórios para os quais os templates apontam. |
| Os hosts e as APIs de nuvem que você automatiza | Fazer o trabalho de fato. |
| O seu provedor de identidade, se você usar um | Login por [LDAP](/admin-guide/authentication/ldap) ou [OpenID Connect](/admin-guide/authentication/openid). |
| Os seus canais de notificação | E-mail, Telegram, Slack e os demais. |

Os usuários acessam a interface web na porta `3000`, a menos que você a altere. Coloque
[TLS](/admin-guide/reverse-proxy) na frente dela antes que alguém faça login: as sessões
e os tokens de API trafegam por ali.

Se um runner for executar as tarefas, então é *ele* que precisa do acesso aos remotos Git e
aos hosts de destino, e precisa de acesso de saída ao servidor Semaphore. O servidor nunca
se conecta a um runner.

## Ferramentas de automação {#automation-tooling}

Aquilo que uma tarefa executa precisa estar instalado onde ela é executada — no servidor, no
runner ou na imagem de contêiner que o executor usa.

- As imagens Docker já vêm com Ansible, Terraform, OpenTofu e as
  dependências habituais. Pacotes Python extras vão em um `requirements.txt` montado; consulte
  [Instalando dependências Python adicionais](/admin-guide/installation/docker#installing-additional-python-dependencies).
- Uma instalação por pacote ou binário entrega apenas o Semaphore. Instale Git, Python, Ansible
  e quaisquer collections ou providers você mesmo; consulte
  [Instalação manual](/admin-guide/installation_manually).

Verifique se o seu playbook ou configuração roda a partir de um shell naquela máquina, com o
usuário com o qual o Semaphore roda, antes de criar um template a partir dele. Quase todo relato de
"funciona localmente" se resolve em uma collection, provider ou pacote Python faltando.

## Credenciais a ter em mãos {#credentials-to-have-ready}

Reúna estas antes do primeiro template, porque cada uma delas é uma parada separada caso contrário:

- Uma **deploy key ou token** para cada repositório que o Semaphore vai clonar.
- As **chaves SSH ou logins** usados para alcançar os hosts que você gerencia.
- Quaisquer **credenciais de nuvem** que o seu Terraform ou os seus módulos exijam.
- Uma **senha do Ansible Vault**, se os seus playbooks forem criptografados.

Todas elas pertencem ao [Armazenamento de Chaves](/user-guide/key-store), não ao repositório.

## Decisões a tomar primeiro {#decisions-to-make-first}

Três escolhas são baratas agora e caras depois:

1. **Motor de banco de dados**, conforme acima.
2. **A URL que os usuários vão usar.** Defina-a como `web_host`. Proxies reversos, URIs de redirecionamento
   do OIDC, destinos de webhook e links de notificação derivam todos dela.
3. **`access_key_encryption`.** Gere-a no momento da instalação, faça backup dela separadamente
   e nunca a rotacione sem critério: cada segredo armazenado é criptografado com ela.

```bash
head -c32 /dev/urandom | base64
```

## Próximos passos {#whats-next}

- [Instalação](/admin-guide/installation) — escolha um método e instale.
- [Configuração](/admin-guide/configuration) — como as opções são fornecidas e o que significam.
- [Primeiros passos](/getting-started) — de um servidor instalado à primeira tarefa.
