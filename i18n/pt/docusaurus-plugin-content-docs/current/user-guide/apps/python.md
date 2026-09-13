
# Python

O Semaphore pode executar scripts Python diretamente. Para isso, crie um modelo de tarefa do tipo **Python**.

## Criando um modelo Python {#creating-a-python-template}

1. Vá até a seção **Modelos de Tarefa** e clique no botão **Novo Modelo**.
2. Selecione **Python** como o tipo de app.
3. Configure o modelo:

| Campo | Descrição |
|---|---|
| **Nome** | Um nome descritivo para o modelo |
| **Repositório** | Repositório que contém o seu script `.py` |
| **Playbook / Script** | Caminho relativo do script, por exemplo `scripts/deploy.py` |
| **Grupos de Variáveis** | Grupos de variáveis cujos valores são injetados como variáveis de ambiente |

4. Clique em **Criar**.
5. Clique em **Executar** para executar o modelo.

## Passando variáveis para os scripts {#passing-variables-to-scripts}

As variáveis dos **Grupos de Variáveis** selecionados são injetadas como variáveis de ambiente. Acesse-as no Python com `os.environ`:

```python
import os

target = os.environ.get("TARGET_HOST")
print(f"Deploying to {target}")
```

## Versão do Python e dependências {#python-version-and-dependencies}

O Semaphore usa o binário `python3` que estiver no `PATH` do ambiente de execução.

- **Instalação por binário/pacote**: garanta que o `python3` correto esteja instalado no host.
- **Docker**: use uma imagem personalizada com a versão do Python necessária.
- **Docker (pacotes adicionais)**: monte um `requirements.txt` em `/etc/semaphore/requirements.txt` no contêiner do servidor ou do runner. O Semaphore o instala no ambiente virtual Python incluído a cada inicialização do contêiner. Consulte [Instalando dependências Python adicionais](/admin-guide/installation/docker#installing-additional-python-dependencies).

## Observações {#notes}

- Os scripts são executados de forma não interativa.
- O código de saída `0` significa sucesso; qualquer código de saída diferente de zero marca a tarefa como falha.
