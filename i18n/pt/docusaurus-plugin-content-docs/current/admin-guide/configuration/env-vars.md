# Variáveis de ambiente

Usando variáveis de ambiente, você pode sobrescrever qualquer opção de configuração disponível.

Você pode usar o gerador interativo de variáveis de ambiente (para Docker):
* para o [servidor](https://semaphoreui.com/install/docker/2_12/)
* para o [runner](https://semaphoreui.com/install/docker/2_12/runner).

---

## Ambiente de aplicação para apps (Ansible, Terraform etc.) {#application-environment-for-apps-ansible-terraform-etc}

O Semaphore pode passar variáveis de ambiente para os processos das aplicações (Ansible, Terraform/OpenTofu, Python, PowerShell etc.). Existem duas opções relacionadas:

- `env_vars` / `SEMAPHORE_ENV_VARS`: pares chave-valor estáticos que serão definidos para os processos dos apps.
- `forwarded_env_vars` / `SEMAPHORE_FORWARDED_ENV_VARS`: uma lista de nomes de variáveis que o servidor encaminhará a partir do ambiente do seu próprio processo.

Exemplo de arquivo de configuração:

```json
{
  "env_vars": {
    "HTTP_PROXY": "http://proxy.internal:3128",
    "ANSIBLE_STDOUT_CALLBACK": "yaml"
  },
  "forwarded_env_vars": [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "GOOGLE_APPLICATION_CREDENTIALS"
  ]
}
```

Equivalente com variáveis de ambiente:

```bash
export SEMAPHORE_ENV_VARS='{"HTTP_PROXY":"http://proxy.internal:3128","ANSIBLE_STDOUT_CALLBACK":"yaml"}'
export SEMAPHORE_FORWARDED_ENV_VARS='["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","GOOGLE_APPLICATION_CREDENTIALS"]'
```

Observações:
- O encaminhamento é explícito: somente as variáveis listadas em `forwarded_env_vars` são herdadas pelos processos dos apps.
- Os segredos devem ser fornecidos de forma segura (por exemplo, via secrets do Docker/Kubernetes) e depois encaminhados usando `forwarded_env_vars`.

---

## Configuração do executor do runner {#runner-executor-configuration}

Para implantações de runner, todo o bloco do executor pode ser definido como uma única variável de ambiente JSON, em vez de chaves individuais:

```bash
export SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"image":"semaphoreui/job:latest"}}'
```

Isso é equivalente a definir `runner.executor.type` e os campos aninhados `runner.executor.docker.*` no arquivo de configuração. Consulte [Opções de configuração](/admin-guide/configuration) para ver todas as configurações do executor do runner.

---

## Variáveis de ambiente secretas em Grupos de Variáveis {#secret-environment-variables-in-variable-groups}

Além das variáveis de ambiente globais, você pode definir segredos por projeto em Grupos de Variáveis. As chaves secretas são mascaradas na interface e nos logs. Consulte `User Guide → Variable Groups` para saber como usar e sobre a integração com o Terraform por meio das variáveis `TF_VAR_*`.
