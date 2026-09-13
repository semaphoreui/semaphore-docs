# Sincronizando segredos de armazenamentos remotos

O Semaphore pode se conectar a um gerenciador de segredos externo — como **HashiCorp Vault**, **OpenBao**, **AWS Secrets Manager**, **Azure Key Vault** ou **Devolutions Server (DVLS)** — e importar automaticamente os segredos dele para o Armazenamento de Chaves. Em vez de copiar credenciais manualmente para o Semaphore e mantê-las atualizadas, você aponta o Semaphore para o seu armazenamento remoto e ele mantém um espelho local para você.

Os **caminhos de sincronização** são as regras que informam ao Semaphore *quais* segredos importar de um armazenamento remoto e *como* nomeá-los quando chegarem. Um gerenciador de segredos pode conter milhares de segredos em muitas pastas; os caminhos de sincronização permitem selecionar apenas as subárvores que interessam e controlar a nomenclatura das chaves que serão criadas.

## Conceitos principais {#key-concepts}

- **Armazenamento remoto** — uma conexão configurada com um gerenciador de segredos externo, incluindo seu endereço e a credencial que o Semaphore usa para ler dele.
- **Sincronização** — o processo de ler os segredos do armazenamento remoto e reconciliá-los com as chaves armazenadas no Semaphore.
- **Caminho de sincronização** — uma única regra de importação, composta por um *caminho*, um *prefixo* e um *separador*.

## Como funciona um caminho de sincronização {#how-a-sync-path-works}

Cada caminho de sincronização tem três campos:

- **Caminho** — o local no armazenamento remoto de onde importar. É a pasta base, o prefixo ou a subárvore que o Semaphore lista e lê. Tudo o que for encontrado abaixo dele se torna candidato à importação.
- **Prefixo** — uma string adicionada ao início de cada nome de chave gerado. Use-o para criar um namespace para os segredos importados, de modo que não colidam com chaves de outros caminhos ou de outros armazenamentos (por exemplo, `prod-`).
- **Separador** — o caractere usado para unir as partes da localização remota de um segredo em um único nome de chave. Como um segredo remoto pode estar vários níveis de pastas abaixo, o separador determina como essa hierarquia é achatada em um único nome legível.

Quando uma sincronização é executada, o Semaphore percorre o **caminho** e, para cada segredo encontrado, constrói um nome de chave combinando a localização do segredo com o **separador** e acrescentando o **prefixo** no início. O tipo de chave criada (chave SSH, login/senha ou uma string secreta simples) é inferido automaticamente a partir do formato do segredo remoto.

Você pode definir **vários caminhos de sincronização** em um único armazenamento. Cada caminho é importado de forma independente, então você pode buscar de várias áreas não relacionadas do mesmo gerenciador de segredos e dar a cada uma seu próprio prefixo e estilo de nomenclatura.

:::tip
Padrões sensatos são aplicados por provedor — por exemplo, HashiCorp Vault, OpenBao e AWS Secrets Manager usam `/` como separador padrão, o Azure Key Vault usa `-` e o Devolutions Server usa `\` — então, na maioria dos casos, você só precisa preencher o caminho.
:::

## Executando uma sincronização {#running-a-sync}

Há duas formas de uma sincronização acontecer:

1. **Manualmente.** Abra o armazenamento e use a ação **Sincronizar agora**. O Semaphore reconcilia imediatamente esse armazenamento com os caminhos de sincronização configurados. Isso é útil para uma primeira importação ou para trazer uma alteração na hora.
2. **Automaticamente, de forma agendada.** Habilite **Sincronizar chaves** para o armazenamento e defina um **intervalo de sincronização** em minutos. O Semaphore então executa novamente a sincronização nessa cadência, em segundo plano. Um intervalo de `0` desabilita a sincronização automática, deixando apenas a opção manual.

Cada armazenamento registra quando foi sincronizado pela última vez e se a última tentativa falhou, para que você sempre possa ver o estado do espelho.

:::note
Em uma implantação de alta disponibilidade, as sincronizações automáticas são coordenadas entre os nós, de modo que uma determinada sincronização é executada em apenas um nó por vez — você não terá importações duplicadas.
:::

## O que a sincronização faz com as suas chaves {#what-syncing-does-to-your-keys}

Uma sincronização é um **espelho completo**, não uma cópia única. A cada execução, o Semaphore reconcilia o armazenamento remoto com as chaves que importou anteriormente:

- Segredos **novos** encontrados em um caminho de sincronização são criados como chaves.
- Chaves importadas **existentes** são **atualizadas** para corresponder ao valor remoto atual.
- Chaves que foram importadas anteriormente, mas que **não existem mais** no armazenamento remoto, são **removidas**.

Apenas as chaves que o Semaphore importou são afetadas — as chaves que você criou manualmente nunca são modificadas ou excluídas por uma sincronização.

:::warning
Como as chaves importadas são cópias gerenciadas dos segredos remotos, excluir um armazenamento (ou desabilitar sua sincronização) também remove as chaves que vieram dele.
:::

## Dois escopos: chaves compartilhadas e variáveis de ambiente {#two-scopes-shared-keys-and-environment-variables}

Os caminhos de sincronização podem ser configurados em dois lugares:

- **Nível do armazenamento** — os segredos importados se tornam **chaves compartilhadas**, disponíveis em todo o projeto onde quer que chaves sejam usadas.
- **Nível do ambiente** — um [Grupo de Variáveis](/user-guide/environment) pode apontar para um armazenamento e seus caminhos de sincronização para importar segredos como **variáveis de ambiente** com escopo nesse grupo.

O mecanismo é idêntico; apenas o destino dos segredos importados é diferente.

## Observações e limitações {#notes-and-limitations}

- A sincronização é suportada apenas para tipos de armazenamento **externos** (HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault, Devolutions Server). O armazenamento **Banco de dados** integrado mantém os segredos nativamente e não tem nada para sincronizar.
- A credencial do armazenamento remoto em si (o token ou a chave que o Semaphore usa para se autenticar) é armazenada de forma segura e separada dos segredos que ela importa.
- Se a sincronização for desativada e não restar nenhum caminho, a configuração de sincronização desse armazenamento é limpa.
