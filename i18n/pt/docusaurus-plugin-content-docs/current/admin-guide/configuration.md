# Configuração

O Semaphore pode ser configurado usando vários métodos:

* [Configurador online](https://semaphoreui.com/install) &mdash; interface web para gerar a configuração online.
* [Arquivo de configuração](/admin-guide/configuration/config-file) &mdash; a forma principal e mais flexível de configurar o Semaphore.
* [Variáveis de ambiente](/admin-guide/configuration/env-vars) &mdash; úteis para implantações em contêineres ou nativas em nuvem.


## Opções de configuração {#configuration-options}

Todas as opções, com a respetiva variável de ambiente, tipo e valor por omissão, estão
listadas na [referência das opções de configuração](/reference/configuration). Essa página
é gerada a partir do código-fonte do Semaphore, por isso corresponde sempre à versão que
está a executar.

Os valores são resolvidos por uma única ordem: uma variável de ambiente prevalece sobre o
ficheiro de configuração, e o valor por omissão só se aplica quando nenhum dos dois está
definido.

## Perguntas frequentes {#frequently-asked-questions}

### 1. Como configurar uma URL pública para o Semaphore UI {#1-how-to-configure-a-public-url-for-semaphore-ui}

Se você usa nginx ou outro servidor web na frente do Semaphore, deve informar a opção de configuração `web_host`.

Por exemplo, você configurou o NGINX no servidor que encaminha as requisições para o Semaphore.

O endereço do servidor é `https://example.com` e você encaminha todas as requisições de `https://example.com/semaphore` para o Semaphore.

Seu `web_host` será `https://example.com/semaphore`.
