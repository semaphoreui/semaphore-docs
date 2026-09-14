---
title: Usar o configurador online
description: Gere comandos de configuração binária ou um arquivo Docker Compose com o configurador online do Semaphore.
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Usar o configurador online

Preencha o formulário para gerar comandos de configuração de um novo servidor Semaphore. A prévia é atualizada durante a edição; aplique o resultado no seu servidor para concluir a configuração.

## Antes de começar {#before-you-begin}

- Escolha a instalação binária ou Docker e a versão do Semaphore. Os links e vídeos usam **2.19**; selecione sua versão no site.
- Para MySQL ou Postgres, prepare os dados de conexão. Para SQLite, escolha um caminho de arquivo de banco de dados com permissão de escrita para o usuário do serviço Semaphore.
- Use sua própria senha de administrador. Os vídeos contêm valores de demonstração.

## Passos {#steps}

Siga a seção correspondente ao seu método de instalação.

### Instalação binária {#binary-installation}

1. Abra a [página de instalação binária](https://semaphoreui.com/install/binary/2_19/install). Encontre sua plataforma, arquitetura e tipo de pacote. Clique na linha para exibir os comandos; copie-os e execute-os no servidor, ou use **Download** para baixar o pacote.
2. Abra [Server setup](https://semaphoreui.com/install/binary/2_19/config). Em **Database settings**, selecione **SQLite**, **MySQL** ou **Postgres** e informe o caminho ou os dados de conexão. Em **Admin user**, preencha login, senha, nome e email.
3. Volte a **Config file** e clique no ícone de cópia. Revise os comandos antes de executá-los em um diretório com permissão de escrita no servidor. Eles criam `config.json`, adicionam o administrador e iniciam o Semaphore. Guarde a configuração e as chaves de criptografia geradas para as próximas inicializações.

![Linha Linux amd64 deb expandida com comandos de instalação](/img/admin-guide/configuration/online/binary-install.png)

![Campos de banco de dados e administrador preenchidos com valores de demonstração](/img/admin-guide/configuration/online/binary-settings.png)

O vídeo mostra a escolha do pacote, as configurações do servidor e a cópia dos comandos.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/binary-output.png')} aria-label="O vídeo mostra a escolha do pacote, as configurações do servidor e a cópia dos comandos.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/binary-setup.webm')} type="video/webm" />
</video>

### Instalação Docker {#docker-installation}

1. Abra o [configurador Docker](https://semaphoreui.com/install/docker/2_19). Em **Container settings**, defina nome e porta do host. Em **Docker volumes**, ative os volumes de dados e configuração para mantê-los ao substituir o contêiner.
2. Escolha o banco de dados e preencha **Admin user**, incluindo sua própria senha. Para um banco externo, use um host acessível a partir do contêiner.
3. Selecione **Docker Compose** e clique no ícone de download. Salve o resultado como `docker-compose.yml` no diretório de implantação, revise-o e execute ali `docker compose up -d`. Como alternativa, selecione **Docker command** e copie o comando `docker run` gerado.

![Configurações do contêiner Docker com volumes persistentes de dados e configuração ativados](/img/admin-guide/configuration/online/docker-settings.png)

O vídeo mostra as configurações do contêiner, os volumes persistentes e o download do Docker Compose.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/docker-compose.png')} aria-label="O vídeo mostra as configurações do contêiner, os volumes persistentes e o download do Docker Compose.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/docker-setup.webm')} type="video/webm" />
</video>

## Próximos passos {#whats-next}

Abra o servidor no navegador, por exemplo `http://localhost:3000` ao executá-lo localmente, e entre com as credenciais de administrador informadas.

- [Executar o binário como serviço](/admin-guide/installation/binary-file#run-as-a-service).
- [Detalhes da implantação Docker](/admin-guide/installation/docker).
- [Todas as opções de configuração](/reference/configuration).
