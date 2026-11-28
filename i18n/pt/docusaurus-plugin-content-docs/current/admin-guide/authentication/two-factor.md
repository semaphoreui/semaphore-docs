---
title: Autenticação de dois fatores
description: Como funciona a autenticação de dois fatores TOTP no Semaphore, como ativá-la no servidor, configurá-la para uma conta, entrar com um código e recuperar o acesso.
---

# Autenticação de dois fatores

A autenticação de dois fatores (2FA) pede uma segunda prova depois da primeira etapa do login:
um código de seis dígitos de um aplicativo autenticador no telefone do usuário. Assim, uma
senha roubada sozinha não basta para entrar.

O Semaphore implementa o segundo fator com TOTP — senhas de uso único baseadas em tempo, o
padrão por trás do Google Authenticator, Microsoft Authenticator, Aegis, 1Password, Bitwarden
e aplicativos semelhantes. Ela está disponível em todas as edições.

## Como funciona {#how-it-works}

Duas chaves decidem se um login pede um código:

- **O servidor** precisa permitir TOTP — a opção `mfa.totp.enabled`. Ela vem desabilitada.
- **A conta** precisa ter TOTP configurado. Cada usuário o ativa na própria conta; ele não é
  imposto a todo mundo.

Quando as duas estão ligadas, o login passa por duas etapas:

1. O usuário entra como de costume — com senha, por LDAP ou por um provedor OpenID Connect.
   O segundo fator vale para os três.
2. O Semaphore abre uma sessão, mas a marca como não verificada, e pede o código. Até o código
   ser aceito, toda chamada de API nessa sessão é recusada com `401` e
   `{"error":"TOTP_REQUIRED"}`.
3. O usuário digita o código exibido pelo aplicativo. O Semaphore o confere com o segredo
   armazenado para a conta; um código correto verifica a sessão e o usuário entra.

O código muda a cada 30 segundos, e o aplicativo o calcula a partir de um segredo recebido uma
única vez, quando a conta foi configurada. O Semaphore e o telefone nunca se comunicam, então o
telefone não precisa de conexão de rede — apenas de um relógio aproximadamente certo.

## Ativar no servidor {#turn-it-on-for-the-server}

Adicione a seção `mfa.totp` ao arquivo de configuração e reinicie o Semaphore:

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true
    }
  }
}
```

As mesmas configurações podem ser passadas como variáveis de ambiente:

```bash
SEMAPHORE_TOTP_ENABLED=true
SEMAPHORE_TOTP_ALLOW_RECOVERY=true
```

| Opção | Variável de ambiente | Efeito |
|---|---|---|
| `mfa.totp.enabled` | `SEMAPHORE_TOTP_ENABLED` | Permite que os usuários configurem TOTP e faz o login pedir o código. Sem ela, a configuração não aparece para ninguém. |
| `mfa.totp.allow_recovery` | `SEMAPHORE_TOTP_ALLOW_RECOVERY` | Dá a cada usuário um [código de recuperação](#recovery-code) de uso único quando ele configura TOTP, e permite entrar com ele quando o telefone é perdido. |
| `mfa.totp.app_name` | `SEMAPHORE_TOTP_ISSUER` | O nome do emissor que o aplicativo autenticador mostra ao lado da conta. O padrão é `Semaphore`. Uma alteração só vale para as contas configuradas depois dela. |

Todas as opções também estão listadas na
[referência de configuração](/reference/configuration).

## Configurar TOTP na sua conta {#set-up-totp-for-your-account}

Primeiro instale um aplicativo autenticador no telefone. Depois:

1. Abra um projeto, clique no seu nome na parte de baixo da barra lateral e escolha
   **Edit Account**.
2. Abra a aba **Security**.
3. Em **Two-factor authentication**, ative **Time-based one-time password**.
   O Semaphore cria o segredo na hora e o mostra como um QR code.
4. No aplicativo autenticador, adicione uma conta e escaneie o QR code. O aplicativo passa a
   mostrar um código de seis dígitos para `Semaphore` ou para o nome definido em
   `mfa.totp.app_name`.
5. Se um **Recovery code** aparecer abaixo do QR code, copie-o com o botão ao lado e guarde-o
   em um lugar seguro — um gerenciador de senhas, ou em papel. Ele só é mostrado agora.
6. Feche a janela.

<div style={{maxWidth: 450}}>

![A aba Security da janela Edit User com a autenticação de dois fatores ativada: um QR code para escanear e um código de recuperação abaixo dele](/assets/two-factor-enrol.webp)

</div>

A chave vale imediatamente; não há **Save** para clicar nem código de teste para digitar.
Verifique se o aplicativo mostra um código para o Semaphore antes de sair — o próximo login vai
pedi-lo.

Mais tarde, você pode abrir a aba **Security** de novo para escanear o QR code em um segundo
dispositivo. O código de recuperação não é mostrado novamente.

## Entrar com um código {#sign-in-with-a-code}

Depois da etapa de senha, LDAP ou single sign-on, o Semaphore mostra **Two-step verification**:

![A tela Two-step verification pedindo o código de seis dígitos do aplicativo autenticador](/assets/two-factor-verify.webp)

Digite os seis dígitos que o aplicativo está mostrando no momento. O formulário é enviado
sozinho após o sexto dígito. Um código errado ou vencido mostra um erro e mantém você na mesma
tela; espere o próximo código e tente de novo.

**Return to login** abandona este login e recomeça do início.

## Usar o código de recuperação {#recovery-code}

Quando o telefone é perdido ou redefinido, o código de recuperação permite que o usuário volte
a entrar por conta própria:

1. Entre com sua senha como de costume.
2. Em **Two-step verification**, clique em **Use recovery code**.
3. Digite o código de recuperação e clique em **Send**.

O Semaphore conecta você e **remove o TOTP da sua conta**. O código de recuperação é consumido
junto. Configure o TOTP novamente logo em seguida, como descrito
[acima](#set-up-totp-for-your-account), para obter um novo segredo e um novo código de
recuperação.

**Use recovery code** só aparece quando o servidor tem `mfa.totp.allow_recovery` ativado.
Os códigos de recuperação têm 16 caracteres e são armazenados apenas como um hash bcrypt, então
ninguém — nem os administradores — consegue ler o código de um usuário depois.

## Remover o segundo fator {#remove-the-second-factor}

**Sua própria conta.** Desative **Time-based one-time password** na aba **Security** de
**Edit Account**. O TOTP é removido na hora e o próximo login pede apenas a primeira etapa.
Apague também a entrada do Semaphore do seu aplicativo autenticador; ela não corresponde mais a
nada.

**A conta de outra pessoa.** Um usuário que perdeu o telefone e não tem código de recuperação
não consegue remover o TOTP sozinho. Um administrador, ou um usuário cujo papel global permite
gerenciar usuários, abre **Users**, edita esse usuário e desliga a chave na aba **Security**.
O usuário entra só com a senha e configura o TOTP de novo.

### Gerenciar o segundo fator pela linha de comando {#manage-the-second-factor-from-the-command-line}

No servidor, o mesmo pode ser feito sem a interface web — útil quando o único administrador
perdeu o telefone:

```bash
semaphore users totp disable --login jane
```

`semaphore users totp enable --login jane` configura o TOTP para um usuário e imprime no
terminal a URL `otpauth://`, um QR code e um código de recuperação; `show` imprime a URL e o QR
code de uma configuração existente. Os dois imprimem o próprio segredo, então execute-os apenas
onde ninguém mais possa ver o terminal e entregue o QR code diretamente ao dono. A sintaxe
completa está em [`semaphore users`](/reference/cli/users#totp-management).

## Desativar no servidor {#turn-it-off-for-the-server}

Defina `mfa.totp.enabled` como `false`, ou remova a seção, e reinicie. O login deixa de pedir
códigos e a configuração **Two-factor authentication** desaparece de **Security**.

A configuração de ninguém é apagada. Ative a opção novamente e toda conta que tinha TOTP volta
a pedir o código, com o mesmo segredo — não é preciso escanear nada de novo.

## O que é bom saber {#things-to-know}

- **Tokens de API pulam o segundo fator.** Uma requisição com um token
  `Authorization: Bearer` nunca recebe pedido de código. Um token só pode ser criado a partir de
  uma sessão com login completo, mas tokens que já existiam antes de o TOTP ser configurado
  continuam funcionando. Revise-os na página **API Tokens** depois de ativar o TOTP.
- **O Semaphore não limita as tentativas de código.** Seis dígitos são um espaço pequeno, então
  coloque um limite de taxa em `POST /api/auth/verify` e `POST /api/auth/recovery` no seu
  [proxy reverso](/admin-guide/reverse-proxy).
- **O segredo é armazenado no banco de dados como está.** Quem consegue ler a tabela
  `user__totp`, ou um backup do banco de dados, consegue gerar códigos válidos para todas as
  contas. Proteja os backups como você protege o arquivo de configuração.
- **O TOTP não pode ser exigido.** O Semaphore não tem nenhuma opção que obrigue os usuários a
  configurá-lo. Se a sua política exige um segundo fator para todos, aplique-a no seu provedor
  de identidade e faça os usuários entrarem por [OpenID Connect](/admin-guide/authentication/openid).

A configuração, a remoção e o uso do segundo fator são registrados no
[log de auditoria](/admin-guide/audit-log) como eventos `iam.mfa` e `auth.mfa`; veja
[Eventos de auditoria](/reference/audit-events) para a lista.

## Próximos passos {#whats-next}

- [Contas locais](/admin-guide/authentication/local) — senhas, duração da sessão e desativação
  do login por senha.
- [Segurança](/admin-guide/security) — parâmetros de hashing, criptografia e hardening.
- [`semaphore users`](/reference/cli/users#totp-management) — os comandos de TOTP.
