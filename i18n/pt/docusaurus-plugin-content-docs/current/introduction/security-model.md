---
title: Modelo de segurança
description: O que o Semaphore protege, as fronteiras de confiança em uma instalação, quem pode fazer código ser executado e quais decisões ficam por sua conta.
---

# Modelo de segurança

O Semaphore guarda as credenciais da sua infraestrutura e executa código contra ela. Duas
propriedades decorrem disso, e ambas moldam todas as outras decisões desta página:
**os segredos nunca devem voltar para um navegador** e **quem pode iniciar uma tarefa
pode executar código nas máquinas que essa tarefa alcança**.

Esta página explica o modelo. Para as configurações que o implementam, consulte
[Segurança](/admin-guide/security).

## Fronteiras de confiança {#trust-boundaries}

| Fronteira | Atravessada por | Protegida por |
|---|---|---|
| Navegador ↔ servidor | Sessões, tokens de API | TLS, cookies seguros, [proxy reverso](/admin-guide/reverse-proxy) |
| Servidor ↔ banco de dados | Todo o estado persistente | Restrição de rede; segredos criptografados antes de serem gravados |
| Servidor ↔ runner | Payloads de jobs, incluindo segredos | HTTPS e um token bearer por runner |
| Tarefa ↔ hosts gerenciados | A sua automação | As chaves que você deu ao template |

Uma tarefa está do outro lado de cada uma dessas fronteiras. Ela recebe os segredos
de que precisa no seu ambiente e, a partir desse momento, o código do seu repositório decide
o que acontece com eles.

## Identidade {#identity}

Os usuários se autenticam de uma destas três formas, e todas as três terminam na mesma sessão:

- **Contas locais.** As senhas são hasheadas com Argon2id (bcrypt antes da 2.20, atualizado
  no primeiro login). A autenticação de dois fatores TOTP pode ser exigida.
- **[LDAP ou Active Directory](/admin-guide/ldap).** O diretório verifica a senha;
  o Semaphore mantém apenas a conta.
- **[OpenID Connect](/admin-guide/openid).** O provedor autentica e o Semaphore
  mapeia as claims para os usuários.

O acesso não interativo usa **tokens de API** criados por um usuário, carregando as permissões
desse usuário. Os runners não usam identidade de usuário: eles se autenticam com o seu próprio
token emitido no registro.

As tarefas também podem carregar identidade. Com [JWTs de tarefa](/user-guide/task-templates/jwt), uma execução
recebe um token assinado de curta duração que nomeia o projeto, o template e o usuário, o qual um
armazenamento de segredos externo pode verificar, em vez de você armazenar uma credencial de longa duração.

## Autorização {#authorization}

Existem dois níveis, e eles são independentes.

**Nível de servidor.** Um administrador gerencia usuários, runners globais e as configurações do servidor.
Ser administrador do servidor não concede, por si só, participação em um projeto.

**Nível de projeto.** Cada membro tem um papel em cada projeto:

| Papel | Pode |
|---|---|
| **Owner** | Tudo no projeto, incluindo membros e exclusão. |
| **Manager** | Executar tarefas e gerenciar recursos e templates. |
| **Task Runner** | Executar tarefas. Nada além disso. |
| **Guest** | Ler. |

O Enterprise acrescenta [papéis personalizados](/user-guide/team) <FeatureState feature="extended-rbac" />
quando esses quatro são grosseiros demais.

A linha que importa para a segurança passa entre **Task Runner** e **Manager**.
Um Manager pode alterar o que um template executa e, portanto, pode executar código arbitrário
com as credenciais daquele projeto. Um Task Runner só pode iniciar o que já existe —
a menos que o template exponha prompts ou variáveis de survey que cheguem à linha de comando,
caso em que o autor do template ampliou essa fronteira deliberadamente.

## Segredos {#secrets}

Os valores secretos — chaves SSH privadas, senhas, tokens, variáveis secretas — são criptografados
com a chave em `access_key_encryption` antes de serem armazenados, de modo que um dump do banco de dados sozinho
não os revela. A API nunca retorna um valor secreto; a interface mostra que um
segredo está definido, não qual é.

Os segredos chegam a uma tarefa pelo seu ambiente no momento em que ela começa. É por isso que
vale a pena tratar a saída da tarefa como sensível: um playbook que imprime uma variável a imprime
em um log que outros membros do projeto podem ler.

Se você preferir não guardar os segredos,
os [armazenamentos de segredos externos](/user-guide/key-store) mantêm os valores no HashiCorp Vault,
OpenBao, AWS Secrets Manager ou Devolutions Server e os buscam a cada execução.

## Executando código não confiável {#executing-untrusted-code}

Com a configuração padrão, uma tarefa é um processo no servidor do Semaphore com o sistema de arquivos
e o acesso de rede do servidor. Isso é adequado quando todos que podem editar um
template já são confiáveis para o servidor.

Quando não são, afaste a execução do servidor:

- Um [runner](/admin-guide/runners) coloca as tarefas em outra máquina, de modo que comprometer uma
  tarefa não compromete o serviço web nem o banco de dados.
- O executor **Docker** ou **Kubernetes** dá a cada job um contêiner ou Pod novo,
  de modo que uma execução não consegue ler os arquivos de outra execução nem os do host.
- Projetos separados com chaves separadas fazem com que uma tarefa só alcance o que as credenciais
  do seu próprio projeto permitem.

:::warning
Um repositório que um membro do projeto pode alterar é código que será executado com as
credenciais daquele projeto. Proteja a branch a partir da qual um template é construído, ou aponte os templates
para uma branch em que somente revisores possam escrever.
:::

## O que fica por sua conta {#what-is-left-to-you}

O Semaphore é auto-hospedado, portanto partes do modelo cabem a você fornecer:

- TLS na frente do serviço, seja o integrado, seja o de um [proxy reverso](/admin-guide/reverse-proxy).
- Restrição de rede do banco de dados e da superfície administrativa do servidor.
- Backups do banco de dados e de `access_key_encryption` — o segundo é inútil
  sem o primeiro, e o primeiro é ilegível sem o segundo.
- Manter a versão atualizada. Relate vulnerabilidades para `security@semaphoreui.com`.

## Próximos passos {#whats-next}

- [Segurança](/admin-guide/security) — as configurações concretas, os parâmetros de hash e os passos de hardening.
- [Arquitetura](/introduction/architecture) — os componentes que essas fronteiras separam.
- [Equipes](/user-guide/team) — atribuindo papéis em um projeto.
