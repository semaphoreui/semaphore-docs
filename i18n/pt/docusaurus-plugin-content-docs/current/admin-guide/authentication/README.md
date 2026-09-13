---
title: Autenticação
description: As três formas de os usuários entrarem no Semaphore - contas locais, LDAP e OpenID Connect - como elas se combinam e como as identidades são vinculadas.
---

# Autenticação

O Semaphore tem três formas de determinar quem é uma pessoa. Elas são independentes e
podem ser habilitadas todas ao mesmo tempo, de modo que a tela de login pode oferecer um
formulário de senha, um login de diretório e um botão para cada provedor de identidade.

| Método | Quem verifica a senha | Use quando |
|---|---|---|
| [Contas locais](/admin-guide/authentication/local) | O Semaphore, contra o próprio banco de dados | Você não tem um diretório ou precisa de um administrador de emergência. |
| [LDAP e Active Directory](/admin-guide/authentication/ldap) | Seu servidor de diretório | As pessoas já existem no LDAP ou no AD e você quer um único conjunto de credenciais. |
| [OpenID Connect](/admin-guide/authentication/openid) | Seu provedor de identidade | Você usa single sign-on: Keycloak, Okta, Entra ID, Google, GitHub e outros. |

A autenticação responde apenas *quem* é o usuário. O que ele tem permissão de fazer é
decidido separadamente, pelo papel no servidor e pelo papel em cada projeto — veja
[Equipes](/user-guide/team).

## Como um registro de usuário passa a existir {#how-a-user-record-comes-to-exist}

Toda pessoa que faz login tem uma linha no banco de dados do Semaphore, qualquer que seja
o método usado. Uma conta local é criada por um administrador ou por `semaphore user add`.
Uma conta LDAP ou OIDC é criada no primeiro login bem-sucedido, e o Semaphore armazena ao
lado dela uma **identidade externa**: o ID do provedor mais o ID de usuário que aquele
provedor retornou.

É essa identidade externa que os logins seguintes usam para correspondência, o que
significa que renomear alguém no diretório não cria uma segunda conta. O que exige cuidado
é o *primeiro* login de um usuário já existente, quando ainda não há identidade externa. A
opção `external_auth_email_matching` decide o que acontece nesse caso:

| Valor | Comportamento |
|---|---|
| `auto` (padrão) | Vincula por e-mail, mas apenas para usuários externos que ainda não têm identidade. Isso adota uma única vez as contas criadas antes da 2.20, e nada além disso. |
| `always` | Vincula por e-mail qualquer usuário externo. Use quando uma mesma pessoa entra por vários provedores. |
| `never` | Nunca vincula por e-mail; as identidades são correspondidas estritamente pelo ID do provedor. |

Contas locais com senha nunca são correspondidas por e-mail, em nenhum modo. Caso
contrário, um provedor OIDC que permita ao usuário escolher o próprio endereço de e-mail
poderia ser usado para tomar a conta de um administrador.

:::warning
O ID do provedor — a chave em `oidc_providers` ou `ldap_providers` — faz parte de toda
identidade armazenada. Renomeá-lo deixa órfãs as identidades que o referenciam, e esses
usuários recebem contas novas e vazias no login seguinte. Escolha-o uma única vez.
:::

## Combinando métodos {#combining-methods}

Uma configuração realista habilita single sign-on para as pessoas e mantém um
administrador local para o dia em que o provedor de identidade estiver inacessível:

1. Configure o provedor e confirme que um usuário real consegue entrar por ele.
2. Dê a esse usuário os papéis de que ele precisa.
3. Mantenha uma conta de administrador local com uma senha forte e
   [TOTP](/admin-guide/authentication/local#two-factor-authentication) habilitado.
4. Defina `password_login_disable` para impedir que todos os demais usem senhas.

Faça isso nessa ordem. Definir `password_login_disable` antes do passo 1 funciona
exatamente como anunciado e tranca você para fora do seu próprio servidor.

## Nesta seção {#in-this-section}

| Página | O que cobre |
|---|---|
| [Contas locais](/admin-guide/authentication/local) | Senhas, TOTP, códigos únicos por e-mail, duração da sessão e desativação do login por senha. |
| [LDAP e Active Directory](/admin-guide/authentication/ldap) | Bind em um diretório, filtros de busca, mapeamentos de atributos e TLS. |
| [OpenID Connect](/admin-guide/authentication/openid) | Configuração de provedores, expressões de claim, login iniciado pelo IdP e doze exemplos práticos de provedores. |

## Por onde começar {#where-to-start}

Uma instalação nova já tem o administrador local criado durante a configuração inicial,
então comece por [Contas locais](/admin-guide/authentication/local) para protegê-lo e
depois adicione [OpenID Connect](/admin-guide/authentication/openid) ou
[LDAP](/admin-guide/authentication/ldap) para todos os demais.
