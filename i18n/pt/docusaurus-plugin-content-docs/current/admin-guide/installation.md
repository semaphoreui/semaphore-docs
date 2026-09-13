# Instalação

Você pode instalar o Semaphore de várias maneiras, dependendo do seu sistema operacional, ambiente e preferências:

* **Gerenciador de pacotes**<br />
  Instale o Semaphore usando um pacote nativo da sua distribuição (por exemplo, apt para Debian/Ubuntu ou dnf para sistemas baseados em RHEL). Esta é a forma mais fácil de começar em servidores Linux e se integra bem aos serviços do sistema.<br />
  [Saiba mais »](/admin-guide/installation/package-manager)

* **Docker**<br />
  Execute o Semaphore como um contêiner usando Docker ou Docker Compose. Ideal para configuração rápida, ambientes isolados e pipelines de CI/CD. Recomendado para usuários que preferem infraestrutura como código.<br />
  [Saiba mais »](/admin-guide/installation/docker)

* **Nuvem**<br />
  Orientações para implantar o Semaphore em plataformas de nuvem usando VMs, contêineres ou Kubernetes com serviços gerenciados.<br />
  [Saiba mais »](/admin-guide/installation/cloud)

* **Arquivo binário**<br />
  Baixe um binário pré-compilado na página de releases. Ótimo para instalação manual ou para incorporar em fluxos de trabalho personalizados. Funciona em Linux, macOS e Windows (via WSL).<br />
  [Saiba mais »](/admin-guide/installation/binary-file)

* **Kubernetes (Helm chart)**<br />
  Implante o Semaphore em um cluster Kubernetes usando o Helm. Mais adequado para infraestrutura escalável e de nível de produção. Oferece suporte a configuração e atualizações fáceis por meio dos values do Helm.<br />
  [Saiba mais »](/admin-guide/installation/k8s)

Veja também:
* [Executar como serviço](/admin-guide/installation/binary-file#run-as-a-service)
* [Instalação manual](/admin-guide/installation_manually)

----


### Instalando pacotes Python adicionais {#installing-additional-python-packages}

Alguns módulos e roles do Ansible precisam de pacotes Python adicionais para funcionar. Para instalar pacotes Python adicionais, crie um arquivo `requirements.txt` e monte-o no diretório `/etc/semaphore` do contêiner. Por exemplo, você pode adicionar as seguintes linhas ao seu arquivo `docker-compose.yml`:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

Os pacotes especificados no arquivo de requirements serão instalados no ambiente virtual do Ansible incluído na imagem toda vez que o contêiner iniciar. A mesma montagem funciona para a imagem `semaphoreui/runner`. Consulte [Instalando dependências Python adicionais](/admin-guide/installation/docker#installing-additional-python-dependencies) para mais detalhes e uma alternativa com imagem personalizada.

Para mais informações sobre arquivos de requirements do Python, consulte a [referência do formato de arquivo de requirements do Pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/)
