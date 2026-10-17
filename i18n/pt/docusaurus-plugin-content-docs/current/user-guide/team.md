# Equipes

No Semaphore UI, cada projeto está associado a uma **Equipe**. Apenas os membros da equipe e os administradores podem acessar o projeto. Cada membro da equipe tem um ou mais papéis, que determinam o seu nível de acesso e as ações que pode executar. Um membro pode fazer tudo o que qualquer um dos seus papéis permite.

Na edição **Enterprise**, os papéis integrados podem ser estendidos com [papéis personalizados](#extended-rbac-enterprise), que concedem permissões adicionais e granulares em modelos específicos.

:::tip
Para evitar a perda de acesso a um projeto, recomenda-se ter pelo menos dois membros da equipe com o papel <b>Owner</b>.
:::

A seção **Team** de um projeto tem duas abas: **Members**, com os usuários e os seus papéis, e **Roles**, com os papéis personalizados (Enterprise).

![Membros da equipe](/assets/team-members.webp)

## Papéis integrados {#built-in-roles}

Os quatro papéis integrados são:

- **Owner**
- **Manager**
- **Task Runner**
- **Guest**

Abaixo estão as descrições detalhadas de cada papel e das suas permissões.

### Owner {#owner}

- **Permissões completas**<br />
  Os Owners podem fazer qualquer coisa dentro do projeto, incluindo gerenciar papéis, adicionar/remover membros e configurar quaisquer opções do projeto.

- **Vários owners**<br />
  Um projeto pode ter vários Owners, garantindo que haja mais de uma pessoa com privilégios completos.

- **Último Owner**<br />
  Um projeto não pode ficar sem Owner. Por isso, ninguém além de um administrador pode remover o último Owner do projeto nem tirar o papel de Owner dele. O último Owner também não pode sair do projeto.

- **Gerenciamento de outros owners**<br />
  Os Owners podem gerenciar (incluindo remover ou alterar os papéis de) todos os membros da equipe, incluindo outros Owners.

### Manager {#manager}

- **Amplo controle do projeto:** os Managers têm quase as mesmas permissões que os Owners, o que lhes permite lidar com a maioria das tarefas do dia a dia e gerenciar o ambiente do projeto.

- Os Managers **não podem**:
  - Remover o projeto.
  - Remover ou alterar os papéis dos Owners.

- **Caso de uso típico:** atribua o papel Manager a membros seniores da equipe que precisam de acesso amplo, mas não necessitam da autoridade para excluir o projeto ou gerenciar Owners.

### Task Runner {#task-runner}

- **Executar tarefas:** os Task Runners podem executar qualquer modelo de tarefa existente no projeto.

- **Somente leitura para os demais recursos:** embora possam executar tarefas, eles têm apenas acesso de leitura aos demais recursos, como inventário, variáveis, repositórios etc.

- **Caso de uso típico:** desenvolvedores ou engenheiros de QA que precisam acionar e monitorar tarefas, mas não precisam modificar as configurações do projeto nem gerenciar os membros da equipe.

### Guest {#guest}

- **Acesso somente leitura:** os Guests têm acesso de leitura a todos os recursos do projeto (por exemplo, visualizar logs, inventários, painéis).

- **Sem permissões de escrita:** eles não podem modificar configurações, executar tarefas ou alterar papéis.

- **Caso de uso típico:** stakeholders ou outros colaboradores que só precisam visualizar o status e os detalhes do projeto sem fazer alterações.

---

## RBAC estendido <Enterprise /> {#extended-rbac-enterprise}

:::info
O RBAC estendido está disponível na edição **Semaphore Enterprise**, a partir do [Semaphore v2.17](https://semaphoreui.com/releases/semaphore-v2_17).
:::

O RBAC estendido adiciona permissões extras sobre os quatro papéis integrados. Os papéis integrados em si permanecem inalterados. Se você não definir papéis personalizados, cada projeto se comporta exatamente como na edição community.

Com o RBAC estendido, os papéis personalizados podem conceder permissões individuais em todo o projeto. Você também pode conceder a um papel permissões em modelos de tarefa selecionados. Isso permite dar a um membro da equipe acesso aos modelos de que ele precisa sem promovê-lo a um papel integrado superior.

### Papéis personalizados {#custom-roles}

Um papel personalizado é um papel que você mesmo cria, com as permissões que escolher. Você o atribui a um membro como um papel integrado. Um membro pode ter um papel personalizado sozinho ou junto com um papel integrado.

Os papéis personalizados estão disponíveis em dois escopos:

- **Papéis globais** são definidos no nível da instância e podem ser usados em qualquer projeto.
- **Papéis de projeto** são definidos dentro de um único projeto e estão disponíveis apenas nesse projeto.

### Níveis de permissão {#permission-levels}

Os papéis personalizados concedem permissões em dois níveis:

- **Permissões em todo o projeto** ampliam o acesso de um usuário em todo o projeto. Você as escolhe ao criar o papel.
- **Permissões de modelo** controlam as ações em um único modelo de tarefa. Você as escolhe na aba **Permissions** desse modelo após adicionar o papel ao modelo.

### Criar um papel personalizado {#create-a-custom-role}

Escolha o escopo antes de abrir o formulário do papel.

#### Papel global {#global-role}

Os papéis globais são criados uma única vez e podem ser atribuídos a usuários em qualquer projeto. Um papel global também pode carregar [permissões globais](#global-permissions): direitos em toda a instância que um usuário recebe quando o papel lhe é [atribuído globalmente](#assign-a-global-role-to-a-user), fora de qualquer projeto.

Um administrador da instância, ou um usuário cujo papel global concede **Can manage global roles**, pode criar um papel global.

Abra o menu de administração no canto inferior esquerdo e selecione **Roles**.

Na lista de papéis de toda a instância, selecione **New Role**.

![Abra Roles no menu do administrador e, em seguida, selecione New Role](/assets/custom-roles-navigation-to-new-role-annotated-v4.png)

![Global roles tab on the Users page](/assets/custom-roles-global-roles-tab.webp)

#### Papel de projeto {#project-role}

Os papéis de projeto estão disponíveis apenas no projeto em que foram criados. Os Owners e Managers do projeto podem criá-los.

1. Abra o projeto e vá em **Team** > **Roles**.
2. Selecione **New Role**.

A aba **Roles** fica vazia até que o primeiro papel de projeto seja criado. Ela lista todos os papéis do projeto e contém o botão **New Role**.

![](/assets/custom-roles-project-roles-tab.webp)

### Configurar um papel personalizado {#configure-a-custom-role}

Ambos os caminhos abrem o mesmo formulário de papel. Configure o papel de acordo com o acesso de que o membro da sua equipe precisa.

![Caixa de diálogo New Role com os campos e as caixas de seleção de permissões](/assets/custom-roles-global-role-form.jpg)

| Campo | Descrição |
| --- | --- |
| **Name** | Um rótulo legível para o papel. |
| **Slug** | Um identificador técnico único usado para referenciar o papel. Pode conter letras, números, `_` e `-`, até 100 caracteres, por exemplo `release_operator`. Maiúsculas e minúsculas não importam: `Ops` e `ops` são o mesmo slug. Não é possível alterar o slug depois de criar o papel. |
| **Permissions** | As permissões em todo o projeto concedidas pelo papel. |
| **Global permissions** | Apenas papéis globais. As permissões em toda a instância que um usuário recebe quando o papel lhe é atribuído globalmente. |

![New Global Role dialog with the global permission checkboxes](/assets/custom-roles-new-global-role.webp)

#### Permissões em todo o projeto {#project-wide-permissions}

Escolha apenas as permissões em todo o projeto de que o papel precisa:

| Permissão | Descrição |
| --- | --- |
| **Can run project tasks** | Executar tarefas do projeto. |
| **Can update project** | Editar as informações básicas do projeto em **Dashboard** > **Settings**. |
| **Can manage project resources** | Gerenciar os recursos do projeto, como modelos de tarefa, repositórios, inventário, ambientes, entradas do Armazenamento de Chaves, agendamentos, integrações e runners. Este é um acesso em todo o projeto. Não pode ser limitado a recursos individuais que não sejam modelos. |
| **Can manage project users** | Gerenciar os membros do projeto e as atribuições de papéis. |

As permissões em todo o projeto não podem ser limitadas a um único inventário, repositório, ambiente ou entrada do Armazenamento de Chaves. Os modelos de tarefa são o único tipo de recurso que suporta atribuições granulares de papéis.

:::tip Acesso apenas a modelos
Para criar um papel granular que adicione acesso apenas a modelos de tarefa selecionados, deixe todas as permissões em todo o projeto desmarcadas. O papel então não adiciona nenhuma permissão em todo o projeto por conta própria. Adicione-o aos modelos necessários e escolha apenas as ações de que esse papel precisa neles.
:::

#### Permissões globais {#global-permissions}

Um papel global pode conceder permissões em toda a instância. Elas se aplicam apenas quando o papel é atribuído globalmente a um usuário, na aba **Global roles** do usuário. O mesmo papel adicionado a um membro do projeto concede apenas suas permissões em todo o projeto.

| Permissão | Descrição |
| --- | --- |
| **Can manage users** | Criar, editar e excluir usuários. Os sinalizadores **Admin** e **Pro user** ficam com os administradores, e um gerente de usuários não pode alterar nem excluir um administrador ou um usuário que possua uma permissão global que o gerente não tem. |
| **Can manage global roles** | Criar, editar e excluir papéis globais e atribuí-los a usuários. |
| **Can manage system settings** | Abrir **Settings**, **Apps**, **Runners**, **Cluster** e **Active tasks**, e limpar o cache. |
| **Can read the audit log** | Abrir o log de auditoria. |

Um administrador (o sinalizador **Admin** no usuário) possui todas as permissões globais. As permissões globais nunca concedem acesso a um projeto: o acesso ao projeto continua vindo da participação no projeto.

O Semaphore mantém pelo menos um usuário capaz de gerenciar papéis globais: um administrador ou um detentor de **Can manage global roles**. O último deles não pode ser excluído, não pode perder o sinalizador **Admin** nem o papel, e o papel não pode perder essa permissão.

Selecione **Save** quando a configuração do papel estiver pronta.

### Atribuir um papel global a um usuário {#assign-a-global-role-to-a-user}

1. Abra o menu de administração no canto inferior esquerdo e selecione **Users**.
2. Abra o usuário e vá para a aba **Global roles**.
3. Escolha um papel global e selecione **Assign**.

A aba lista os papéis que o usuário possui e as **permissões globais efetivas** resultantes, com o papel que concede cada uma delas. Remova um papel com o botão de exclusão ao lado dele.

Apenas papéis com pelo menos uma permissão global são oferecidos. Papéis integrados não podem ser atribuídos globalmente: eles não concedem nada fora de um projeto.

![Roles tab of a user with an assigned global role and the effective global permissions](/assets/custom-roles-assign-global-role.webp)

### Configurar o acesso a modelos de tarefa específicos {#configure-access-to-specific-task-templates}

As permissões de modelo adicionam acesso a modelos de tarefa selecionados. O exemplo abaixo usa um papel personalizado sem permissões em todo o projeto. Essa configuração de privilégio mínimo é útil quando um membro da equipe precisa apenas de ações selecionadas em modelos. Você também pode adicionar permissões de modelo a um papel que já concede acesso em todo o projeto.

**Abra o modelo desejado**

1. Abra **Modelos de Tarefa** e selecione o modelo de destino.
2. Abra a aba **Permissions**.

A aba **Permissions** lista os papéis já adicionados ao modelo.

![](/assets/custom-roles-template-permissions-tab.webp)

**Adicione o papel e conceda as permissões de modelo**

1. Selecione **Add Role** e escolha o papel personalizado a ser adicionado a este modelo.
2. Selecione apenas as permissões de modelo de que o papel precisa, como **Can run tasks** ou **Can update the template**.

Este exemplo usa um papel criado anteriormente sem permissões em todo o projeto. Você pode escolher qualquer papel personalizado disponível no projeto.

![Caixa de diálogo de permissões do modelo com os controles necessários destacados](/assets/custom-roles-template-permissions-annotated.png)

Para conceder ao mesmo papel acesso a outros modelos, repita estes passos para cada modelo.

:::note Acesso existente ao projeto
As permissões de modelo são aditivas. Elas adicionam acesso sem substituir ou reduzir o acesso proveniente do papel integrado do usuário ou de outros papéis personalizados. Se um usuário já pode executar ou atualizar todos os modelos de tarefa, adicionar um papel específico de modelo não restringe esse acesso.
:::

### Atribuir um papel personalizado em um projeto {#assign-a-custom-role-in-a-project}

Após criar e configurar um papel global ou de projeto, atribua-o ao membro da equipe desejado:

1. Abra o projeto e vá em **Team**.
2. Selecione o campo de papéis ao lado do membro desejado.
3. Selecione o papel personalizado. Um membro pode ter vários papéis.

### Excluir um papel em uso {#delete-a-role-that-is-in-use}

Se um papel ainda está atribuído a membros ou é usado em permissões de modelo, o Semaphore pergunta antes de excluí-lo e mostra quantos membros, projetos e permissões de modelo ele afeta. Selecione **Delete with assignments** para excluir o papel e retirá-lo de todos eles. Os membros que não têm outro papel são removidos dos seus projetos.

### Não suportado no momento {#not-currently-supported}

- **Mapeamento de grupos LDAP / OIDC.** Os papéis personalizados são atribuídos por usuário. O mapeamento de grupos de diretórios externos para papéis personalizados não é suportado.
- **Permissões granulares para recursos que não são modelos.** Atualmente, apenas os modelos podem ser controlados por papéis personalizados no nível de recurso individual.

---

## Gerenciando os membros da equipe {#managing-team-members}

- **Convidar novos membros:** **Owners** e **Managers** podem convidar novos usuários para a equipe e atribuir a eles um papel integrado inicial.

- **Alterar papéis:** os Owners sempre podem alterar os papéis de qualquer membro da equipe. Os Managers podem alterar os papéis de **Task Runners** e **Guests**, mas **não** de outros Managers ou Owners.

- **Remover membros:** os Owners e Managers podem remover membros da equipe com papéis inferiores.
  - Um Owner pode remover qualquer pessoa (incluindo outros Owners), exceto o último Owner.
  - Um Manager pode remover **Task Runners** e **Guests**, mas **não** outros Managers ou Owners.

---

## Boas práticas {#best-practices}

1. **Mantenha redundância:** atribua o papel **Owner** a pelo menos duas pessoas para garantir acesso contínuo e evitar um ponto único de falha.
2. **Siga o princípio do privilégio mínimo:**
   - Dê aos membros da equipe o papel mínimo necessário para as suas tarefas.
   - Use os papéis **Task Runner** ou **Guest** para quem precisa apenas de permissões limitadas.
   - Na edição Enterprise, prefira [papéis personalizados](#extended-rbac-enterprise) para conceder acesso a modelos específicos em vez de elevar o papel integrado de um membro.
3. **Revise os membros regularmente:**
   - À medida que a estrutura da equipe muda, reavalie os papéis.
   - Revogue o acesso ou rebaixe os papéis dos usuários que não precisam mais de privilégios elevados.
4. **Use managers para a administração do dia a dia:**
   - Reserve o papel Owner para um grupo menor com autoridade máxima.
   - Delegue as tarefas rotineiras de gerenciamento do projeto aos Managers para reduzir o risco de grandes alterações acidentais ou exclusões de projeto.

---

## Perguntas frequentes {#frequently-asked-questions}

### 1. Um Owner pode remover outro Owner? {#1-can-an-owner-remove-another-owner}
Sim, um Owner pode remover ou alterar o papel de qualquer outro Owner, a menos que ele seja o último Owner do projeto.

### 2. Quem pode excluir o projeto? {#2-who-can-delete-the-project}
Apenas os **Owners** podem excluir um projeto.

### 3. Os Managers podem adicionar ou remover outros Managers? {#3-can-managers-add-or-remove-other-managers}
Não. Os Managers só podem adicionar ou remover usuários com os papéis **Task Runner** ou **Guest**. Para gerenciar Owners ou outros Managers, você precisa ser um Owner.

### 4. O que acontece se eu remover todos os Owners por acidente? {#4-what-happens-if-i-remove-all-owners-by-accident}
Um projeto não pode ficar sem Owner. Por isso, ninguém além de um administrador pode remover o último Owner do projeto nem tirar o papel de Owner dele. O último Owner também não pode sair do projeto. Se um administrador remover o último Owner, o projeto continua funcionando, e um administrador pode adicionar um novo Owner na página **Team**.

### 5. Os Guests podem executar tarefas? {#5-can-guests-run-tasks}
Não. Os Guests têm acesso somente leitura e não podem acionar nem gerenciar tarefas. Na edição Enterprise, você pode conceder a um Guest permissão para executar modelos individuais por meio de um [papel personalizado](#extended-rbac-enterprise).

### 6. Os papéis personalizados substituem os papéis integrados? {#6-do-custom-roles-replace-the-built-in-roles}
Não. Os papéis personalizados se somam aos papéis integrados. Um membro pode ter um papel integrado, papéis personalizados ou ambos.

### 7. O RBAC estendido está disponível na edição community? {#7-is-extended-rbac-available-in-the-community-edition}
Não. O RBAC estendido requer uma assinatura do **Semaphore Enterprise**.
