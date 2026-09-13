# Sua conta

Suas configurações pessoais ficam no menu da conta, na parte inferior da barra lateral. Clique no seu nome para abri-lo.

![Menu da conta](/assets/user-menu.webp)

| Item | Descrição |
|---|---|
| Versão | A versão do Semaphore UI em execução no servidor. |
| **Tokens de API** | Tokens pessoais para a [API REST](/admin-guide/api). |
| **Editar Conta** | Seu nome, nome de usuário, e-mail, preferência de alertas e senha. |
| **Sair** | Encerra a sessão. |

Ao lado do menu você encontra o botão de **modo escuro** e o seletor de **idioma**. Ambas as configurações são armazenadas no seu navegador.

## Editar conta {#edit-account}

![Diálogo de edição da conta](/assets/account-edit.webp)

A aba **Configurações** contém:

| Campo | Descrição |
|---|---|
| **Nome** | Nome de exibição mostrado no histórico de tarefas e nas atividades. |
| **Nome de usuário** | Nome de login. |
| **E-mail** | Endereço usado para alertas por e-mail e recuperação de senha. |
| **Enviar alertas** | Receber alertas por e-mail sobre as tarefas. Os alertas são enviados somente quando o [canal de e-mail](/admin-guide/notifications/email) está configurado e o projeto permite alertas. |

Os selos ao lado das caixas de seleção mostram suas flags globais: **Usuário Pro** em uma instância Pro, **Admin** para administradores, **Externo** para contas gerenciadas por LDAP ou OpenID Connect. Usuários externos não podem alterar o nome de usuário nem a senha aqui.

A aba **Segurança** permite alterar a sua senha. Se o administrador habilitou senhas de uso único baseadas em tempo, o segundo fator é configurado na mesma aba.

![Aba Segurança](/assets/account-security.webp)

## Tokens de API {#api-tokens}

Escolha **Tokens de API** no menu da conta. A página lista seus tokens com a data de criação, a data de expiração e o status. O link **Referência da API** abre o Swagger UI integrado à sua instância.

![Tokens de API](/assets/api-tokens.webp)

Clique em **Novo Token**, dê um nome ao token e escolha quando ele expira. O valor do token é exibido uma única vez após a criação; copie-o imediatamente.

![Diálogo de novo token](/assets/api-token-new.webp)

Use o token no cabeçalho `Authorization: Bearer`; consulte [API](/admin-guide/api). Para revogar um token, exclua-o da lista.
