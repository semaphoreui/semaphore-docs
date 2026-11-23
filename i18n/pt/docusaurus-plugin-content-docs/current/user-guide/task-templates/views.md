# Visualizações

As visualizações agrupam modelos de tarefa em abas acima da lista de modelos. Um projeto começa com uma única visualização **All**; você pode adicionar as suas próprias, por exemplo **Build**, **Deploy** e **Tools**, para que as pessoas encontrem rapidamente o modelo correto em projetos com muitos modelos.

![Lista de modelos com as abas de visualização](/assets/templates-list.webp)

## Gerenciando visualizações {#managing-views}

Usuários com o papel **Manager** ou superior podem editar as visualizações. Clique no ícone de lápis ao lado das abas de visualização para abrir a janela **Edit views** e use **Add view** para criar uma nova aba. Cada visualização possui as seguintes configurações:

| Configuração | Descrição |
|---|---|
| **Title** | O rótulo da aba. |
| **Type** | **Custom** exibe apenas os modelos atribuídos a esta visualização. **All** exibe todos os modelos do projeto. |
| **Sort by** e **Reverse** | Ordem de classificação padrão dos modelos na aba. |
| **Hidden** | Mantém a visualização, mas oculta a aba. |
| **Show task counts** | Mostra na aba quantos dos seus modelos estão em cada estado, consulte [Contagem de modelos nas abas](#template-counts). Desativado por padrão. |

Arraste as visualizações na janela para alterar a ordem das abas. Excluir uma visualização não exclui os seus modelos: eles continuam visíveis na visualização **All**.

## Atribuindo um modelo a uma visualização {#assigning-a-template-to-a-view}

Abra o formulário do modelo e escolha a aba no campo **View**. Um modelo pertence a uma visualização personalizada por vez e é sempre listado nas visualizações do tipo **All**.

## Contagem de modelos nas abas {#template-counts}

Uma visualização com **Show task counts** ativado mostra ao lado do título quantos dos seus modelos estão em cada estado, em um chip de segmentos coloridos. O estado de um modelo é o status da sua última tarefa. Um segmento fica oculto quando a contagem é zero, e as contagens acompanham as tarefas durante a execução. A configuração fica desativada em uma visualização nova, e as contagens são calculadas apenas para as visualizações que a têm ativada.

| Cor | Modelos contados |
|---|---|
| Verde | A última tarefa foi concluída com sucesso. |
| Vermelho | A última tarefa falhou. |
| Cinza | A última tarefa foi interrompida ou está sendo interrompida, ou o modelo nunca foi executado. |
| Laranja | A última tarefa aguarda uma confirmação. |
| Azul | A última tarefa está na fila, iniciando ou em execução. |

As contagens incluem apenas os modelos que você tem permissão para ver.

## Colunas {#columns}

O ícone de engrenagem no canto superior direito da lista de modelos abre o seletor de colunas. Ele se aplica a todas as visualizações e é armazenado no seu navegador.

![Seletor de colunas](/assets/templates-columns.webp)
