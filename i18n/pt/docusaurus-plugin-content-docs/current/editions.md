---
title: Edições
description: O que Semaphore Community, Pro e Enterprise incluem e quais recursos exigem uma assinatura paga.
---

import EditionsTable from '@site/src/components/EditionsTable';

# Edições

O Semaphore é distribuído em três edições a partir de uma única base de código e de uma
única documentação. Tudo o que é descrito nesta documentação está disponível na edição
**Community**, a menos que a página ou a seção tenha um selo de edição.

| Edição | O que é |
|---|---|
| **Community** | A edição de código aberto. Gratuita, auto-hospedada, sem chave de licença. Tudo o que não está listado na tabela abaixo. |
| **Pro** | Adiciona workflows, runners de projeto, armazenamentos de segredos externos, executores de contêiner e logs estruturados. |
| **Enterprise** | Adiciona alta disponibilidade, RBAC estendido com funções personalizadas, o executor do Kubernetes e armazenamentos de segredos corporativos. |

Pro e Enterprise são ativados com uma chave de licença, consulte
[Licença](/admin-guide/license). A edição executada pelo seu servidor é exibida no menu da
conta, consulte [Sua conta](/user-guide/account).

## Matriz de recursos {#feature-matrix}

Recursos que exigem uma edição paga. Um recurso que não está listado aqui está disponível
em todas as edições.

<EditionsTable />

## Como as edições são marcadas nesta documentação {#how-editions-are-marked}

Um selo ao lado de um título significa que o recurso abaixo dele precisa dessa edição:

- <Pro /> marca um recurso Pro.
- <Enterprise /> marca um recurso Enterprise.

Um selo também pode indicar a versão em que o recurso surgiu, por exemplo
<FeatureState feature="extended-rbac" />. Clicar em um selo leva você de volta a esta
página.
