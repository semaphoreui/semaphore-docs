---
title: Configuração
description: O Semaphore lê as configurações de um arquivo e de variáveis de ambiente. O configurador online ajuda a prepará-las por meio de um formulário. Escolha o método adequado ao seu servidor.
---

# Configuração

O Semaphore lê as configurações de um arquivo e de variáveis de ambiente. O configurador online ajuda a prepará-las por meio de um formulário. Escolha o método adequado ao seu servidor.

## Nesta seção {#in-this-section}

| Método | Quando usar |
|---|---|
| [Configurador online](/admin-guide/configuration/online) | Você quer um formulário que gere configurações e comandos de inicialização para uma instalação binária ou Docker. |
| [Arquivo de configuração](/admin-guide/configuration/config-file) | Você quer manter as configurações do servidor em um arquivo `config.json`. |
| [Variáveis de ambiente](/admin-guide/configuration/env-vars) | Você gerencia as configurações pelo Docker, por uma definição de serviço ou por ferramentas de implantação. |

## Opções de configuração {#configuration-options}

Uma variável de ambiente substitui o valor correspondente no arquivo. O valor padrão se aplica quando nenhum dos dois está definido. Se editar o arquivo não tiver efeito, verifique o ambiente do processo do Semaphore.

A [referência de opções de configuração](/reference/configuration) lista nomes, variáveis de ambiente, tipos e valores padrão. Ela é gerada a partir do código do Semaphore; use a documentação da sua versão ao configurar um servidor antigo.

<span id="frequently-asked-questions" />

## URL pública {#1-how-to-configure-a-public-url-for-semaphore-ui}

Defina `web_host` (ou `SEMAPHORE_WEB_ROOT`) como o endereço que os usuários abrem no navegador. Se um proxy reverso disponibiliza o Semaphore em `https://example.com/semaphore`, use o endereço completo, incluindo `/semaphore`. Esse é o endereço público, não o endereço interno usado pelo proxy.

## Por onde começar {#where-to-start}

Para um novo servidor, abra o guia do configurador online e siga os passos para binários ou Docker. Para um servidor existente, altere o arquivo ou as variáveis de ambiente do serviço e reinicie o Semaphore.
