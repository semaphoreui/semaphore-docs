# Instalação

Você pode instalar o Semaphore de várias maneiras, dependendo do seu sistema operacional, ambiente e preferências.

## Nesta seção {#in-this-section}

| Método | Quando usar |
|---|---|
| [Gerenciador de pacotes](/admin-guide/installation/package-manager) | Você quer um pacote nativo para sua distribuição Linux. |
| [Docker](/admin-guide/installation/docker) | Você quer executar o Semaphore em um contêiner com Docker ou Docker Compose. |
| [Nuvem](/admin-guide/installation/cloud) | Você está implantando em uma plataforma de nuvem e precisa de orientações sobre serviços gerenciados e infraestrutura. |
| [Arquivo binário](/admin-guide/installation/binary-file) | Você quer instalar um binário pré-compilado e gerenciar o processo por conta própria. |
| [Kubernetes (Helm chart)](/admin-guide/installation/k8s) | Você já usa Kubernetes e quer gerenciar a implantação com Helm. |

## Instalando pacotes Python adicionais {#installing-additional-python-packages}

Alguns módulos e roles do Ansible precisam de pacotes Python adicionais para funcionar. Para instalar pacotes Python adicionais, crie um arquivo `requirements.txt` e monte-o no diretório `/etc/semaphore` do contêiner. Por exemplo, você pode adicionar as seguintes linhas ao seu arquivo `docker-compose.yml`:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

Os pacotes especificados no arquivo de requirements serão instalados no ambiente virtual do Ansible incluído na imagem toda vez que o contêiner iniciar. A mesma montagem funciona para a imagem `semaphoreui/runner`. Consulte [Instalando dependências Python adicionais](/admin-guide/installation/docker#installing-additional-python-dependencies) para mais detalhes e uma alternativa com imagem personalizada.

Para mais informações sobre arquivos de requirements do Python, consulte a [referência do formato de arquivo de requirements do Pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/)

## Por onde começar {#where-to-start}

Comece pelo guia do seu ambiente de implantação. Para uma instalação binária, siga as instruções do serviço para manter o Semaphore em execução. Para configurar o usuário do serviço, as dependências Python e o systemd, use o guia de instalação manual.

* [Executar como serviço](/admin-guide/installation/binary-file#run-as-a-service)
* [Instalação manual](/admin-guide/installation_manually)
