---
title: Hosts
description: A visão do administrador dos hosts de todos os projetos, a contagem de Nodes da licença e como desativar um host que você não gerencia mais.
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

A página **Hosts** do administrador lista os hosts de todos os projetos em um só lugar e mostra quais
deles contam para os **Nodes** da sua licença. Abra o menu Admin no canto inferior esquerdo e
selecione **Hosts**.

Como os hosts entram na lista, os status, a busca e o cartão do host são os mesmos da página do
projeto. Para mais informações, veja [Hosts](/user-guide/hosts). Aqui um host é uma linha para todos os
projetos, e o seu cartão lista os projetos e as tarefas que o alcançaram.

## Contagem da licença {#license-count}

Sua licença inclui um número de hosts. A linha **Nodes** de **Assinatura e Cobrança** mostra quantos
estão em uso, por exemplo `42 / 50`. Um host está em uso quando uma tarefa Ansible o alcançou no último
mês e ninguém o desativou. Um host que só esteve inalcançável nunca está em uso.

Os hosts que não estão em uso mostram **Not counted** na lista. Eles voltam para a contagem
automaticamente na próxima vez que uma tarefa os alcançar.

Quando mais hosts estão em uso do que a licença inclui, a linha **Nodes** fica vermelha com
**(limit exceeded)** e esta página mostra um aviso. Desative os hosts que você não gerencia mais ou
amplie a sua licença. Para mais informações, veja [Ativação da licença](/admin-guide/license).

## Desativar um host {#decommission}

Quando você removeu um host da sua infraestrutura, clique em **Decommission** no final da sua linha
e confirme. O host sai da contagem imediatamente, mostra **Decommissioned** e mantém o seu histórico em
todos os projetos. Se uma tarefa o alcançar novamente mais tarde, o Semaphore remove a marca e o host está em uso
novamente.

## Próximos passos {#whats-next}

- [Hosts](/user-guide/hosts) — a página do projeto, os status e o cartão do host.
- [Ativação da licença](/admin-guide/license) — ative e substitua a chave de licença.
