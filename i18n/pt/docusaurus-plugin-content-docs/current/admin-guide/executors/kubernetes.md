---
title: Executor Kubernetes
description: Execute cada tarefa de um runner em um Pod próprio do Kubernetes, com manifestos de service accounts e RBAC, configurações do runner, referência de configuração e solução de problemas.
sidebar_custom_props:
  edition: enterprise
---

# Executor Kubernetes <FeatureState feature="k8s-executor" />

Com o executor Kubernetes, o runner cria um Pod por tarefa em um namespace, transmite o
log dele para o Semaphore e exclui o Pod quando a tarefa termina. O runner pode rodar
dentro do cluster (recomendado) ou fora dele, com um kubeconfig.

Como uma tarefa em contêiner é executada, o que há dentro do contêiner e o que não é
suportado está descrito em [Executores](./#how-a-container-task-runs). Esta página trata
da configuração do Kubernetes.

## Antes de começar {#before-you-begin}

- Um servidor Semaphore com licença Enterprise.
- Um runner implantado no cluster, consulte [Instalar um runner no Kubernetes](/admin-guide/installation/k8s#runner).
  As etapas abaixo usam o namespace `semaphore` e o Deployment `semaphore-runner` dele. Para um
  runner fora do cluster, consulte [Runner fora do cluster](#runner-outside-the-cluster).
- `kubectl` com permissão para criar service accounts e objetos RBAC nesse namespace.
- O cluster consegue baixar `semaphoreui/job` e `semaphoreui/helper` (ou suas próprias imagens).

## O que o runner cria {#what-the-runner-creates}

Para uma tarefa com ID `42`, o runner cria, no namespace dele:

| Objeto | Nome | Conteúdo |
|---|---|---|
| Pod | `semaphore-job-42-<random>` | Init container `git-clone` (imagem auxiliar) e contêiner `build` (imagem build), `restartPolicy: Never`. |
| Secret | `<pod>-ssh-<key id>` | Um por chave SSH, montado em `/secrets/ssh/<key id>/`. |
| Secret | `<pod>-vault` | Senhas do Ansible vault. |
| Secret | `<pod>-extra-vars` | `values.json` com as variáveis extras. |
| Secret | `<pod>-env` | Segredos do Variable Group do tipo *Environment variable* e `SEMAPHORE_JWT`, injetados com `envFrom`. |
| ConfigMap | `<pod>-inventory` | Um inventário estático. |

Somente os objetos de que a tarefa precisa são criados. Todos levam o rótulo
`semaphoreui.com/runner=semaphore`; o Pod também tem `semaphoreui.com/task-id=42`. O
runner exclui todos quando a tarefa termina, inclusive após uma falha ou **Stop**.

## Configuração {#set-up}

### Etapa 1. Criar as service accounts {#step-1-create-the-service-accounts}

O runner precisa de uma service account para criar os Pods das tarefas. Os Pods das
tarefas recebem uma segunda, sem permissões e sem token de API, para que um playbook não
possa usar os direitos do runner.

```yaml title="semaphore-serviceaccounts.yaml"
apiVersion: v1
kind: ServiceAccount
metadata:
  name: semaphore-runner
  namespace: semaphore
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: semaphore-job
  namespace: semaphore
automountServiceAccountToken: false
```

### Etapa 2. Conceder as permissões ao runner {#step-2-grant-the-runner-its-permissions}

Esta é a lista completa de chamadas de API que o executor faz:

```yaml title="semaphore-rbac.yaml"
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: semaphore-runner
  namespace: semaphore
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["create", "get", "delete"]
  - apiGroups: [""]
    resources: ["pods/log"]
    verbs: ["get"]
  - apiGroups: [""]
    resources: ["secrets", "configmaps"]
    verbs: ["create", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: semaphore-runner
  namespace: semaphore
subjects:
  - kind: ServiceAccount
    name: semaphore-runner
    namespace: semaphore
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: semaphore-runner
```

Um `Role`, não um `ClusterRole`: o runner só pode mexer no próprio namespace.

### Etapa 3. Mudar o runner para o executor Kubernetes {#step-3-switch-the-runner-to-the-kubernetes-executor}

Os Pods das tarefas não definem um `securityContext`, então um namespace que impõe o nível de
Pod Security `restricted` os rejeita. Permita `baseline`:

```bash
kubectl label namespace semaphore pod-security.kubernetes.io/enforce=baseline --overwrite
```

Dê ao Pod do runner a service account dele e as configurações do executor. No Deployment do
runner, adicione em `spec.template.spec`:

```yaml title="semaphore-runner.yaml (fragment)"
    spec:
      serviceAccountName: semaphore-runner
      containers:
        - name: runner
          env:
            # ...SEMAPHORE_WEB_ROOT and SEMAPHORE_RUNNER_TOKEN as before
            - name: SEMAPHORE_RUNNER_EXECUTOR_TYPE
              value: k8s
            - name: SEMAPHORE_RUNNER_K8S_NAMESPACE
              value: semaphore
            - name: SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT
              value: semaphore-job
            - name: SEMAPHORE_RUNNER_K8S_IMAGE
              value: semaphoreui/job:latest
```

```bash
kubectl apply -f semaphore-serviceaccounts.yaml -f semaphore-rbac.yaml -f semaphore-runner.yaml
kubectl -n semaphore rollout status deploy/semaphore-runner
```

Sem `kubeconfig` definido, o runner usa as credenciais in-cluster de
`semaphore-runner`. As tarefas não rodam mais no Pod do runner, então você pode reduzir os
`resources` dele (por exemplo, `100m` de CPU e `256Mi` de memória).

### Etapa 4. Executar uma tarefa {#step-4-run-a-task}

Direcione um modelo para o runner e inicie uma tarefa. Observe o Pod dela aparecer e sumir:

```bash
kubectl -n semaphore get pods -l semaphoreui.com/runner=semaphore -w
```

O log da tarefa mostra:

```text
k8s: created pod semaphore/semaphore-job-42-a1b2c3 (1 ssh keys installed)
=== git-clone (init) ===
Cloning into '/workspace/repo'...
=== build (build) ===
semaphore: container executor: task 42, template 7
...
k8s: deleted pod semaphore/semaphore-job-42-a1b2c3
```

## Exemplos {#examples}

### Runner fora do cluster {#runner-outside-the-cluster}

O runner roda em uma VM ou no Docker e acessa o API server com um kubeconfig.
Dê ao kubeconfig o [Role da Etapa 2](#step-2-grant-the-runner-its-permissions)
e nada mais:

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "k8s",
      "k8s": {
        "kubeconfig": "/etc/semaphore/kubeconfig",
        "namespace": "semaphore",
        "service_account": "semaphore-job"
      }
    }
  }
}
```

O contexto atual do kubeconfig é usado.

### Imagens de um registry privado {#images-from-a-private-registry}

Crie um pull secret no namespace e liste-o em `pull_secrets`; vários nomes são
separados por vírgulas:

```bash
kubectl -n semaphore create secret docker-registry registry-example \
  --docker-server=registry.example.com \
  --docker-username=<user> --docker-password=<password>
```

```yaml
            - name: SEMAPHORE_RUNNER_K8S_IMAGE
              value: registry.example.com/semaphore/job-aws:1.0
            - name: SEMAPHORE_RUNNER_K8S_PULL_SECRETS
              value: registry-example
```

Os secrets são anexados a cada Pod de tarefa, valendo igualmente para a imagem build, a
imagem auxiliar e o **Executor image** de um modelo.

### CPU e memória dos Pods de tarefa {#cpu-and-memory-of-task-pods}

O executor não define requests nem limits nos Pods das tarefas. Defina padrões para o
namespace com um `LimitRange`; ele se aplica aos contêineres `git-clone` e `build`:

```yaml title="semaphore-limits.yaml"
apiVersion: v1
kind: LimitRange
metadata:
  name: semaphore-task-defaults
  namespace: semaphore
spec:
  limits:
    - type: Container
      defaultRequest:
        cpu: 250m
        memory: 256Mi
      default:
        cpu: "2"
        memory: 2Gi
```

Adicione um `ResourceQuota` para limitar quanto todas as tarefas paralelas do namespace podem usar.

### Restringir a rede dos Pods de tarefa {#restrict-the-network-of-task-pods}

Os Pods das tarefas levam o rótulo `semaphoreui.com/runner=semaphore`, então uma
`NetworkPolicy` pode selecioná-los. Esta permite apenas DNS, o servidor Git e SSH para os hosts gerenciados:

```yaml title="semaphore-netpol.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: semaphore-tasks
  namespace: semaphore
spec:
  podSelector:
    matchLabels:
      semaphoreui.com/runner: semaphore
  policyTypes: ["Ingress", "Egress"]
  egress:
    - ports:
        - { protocol: UDP, port: 53 }
        - { protocol: TCP, port: 53 }
    - to:
        - ipBlock: { cidr: 10.20.0.0/16 }   # Git server and managed hosts
      ports:
        - { protocol: TCP, port: 22 }
        - { protocol: TCP, port: 443 }
```

## Referência de configuração {#configuration-reference}

Todas as opções ficam em `runner.executor.k8s` na configuração do runner.

| Opção | Variável de ambiente | Padrão | Descrição |
|---|---|---|---|
| `kubeconfig` | `SEMAPHORE_RUNNER_K8S_KUBECONFIG` | in-cluster | Caminho para um arquivo kubeconfig. Vazio: a service account do Pod do runner. |
| `namespace` | `SEMAPHORE_RUNNER_K8S_NAMESPACE` | `semaphore` | Namespace dos Pods, Secrets e ConfigMaps das tarefas. Precisa existir. |
| `image` | `SEMAPHORE_RUNNER_K8S_IMAGE` | `semaphoreui/job:latest` | Imagem do contêiner `build`. O **Executor image** de um modelo a substitui. |
| `helper_image` | `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` | `semaphoreui/helper:latest` | Imagem do init container `git-clone`. |
| `service_account` | `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` | `default` | Service account dos Pods das tarefas. Use uma sem permissões, consulte a [Etapa 1](#step-1-create-the-service-accounts). |
| `pull_secrets` | `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` | — | `imagePullSecrets` separados por vírgula para os Pods das tarefas. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` | `3` | Com que frequência o runner lê o status do Pod. Valores menores iniciam a transmissão do log mais cedo e custam mais chamadas de API. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` | `30` | Período de carência da exclusão do Pod após a tarefa terminar ou ser interrompida. |

A política de pull de imagem segue o padrão do Kubernetes: `Always` para `:latest`; caso
contrário, `IfNotPresent`.

## Segurança {#security}

- **Privilégio mínimo para o runner.** O [Role](#step-2-grant-the-runner-its-permissions)
  é restrito ao namespace e lista apenas o que o executor chama. Não vincule `cluster-admin`.
- **Sem acesso à API para as tarefas.** Com o padrão `service_account: default`, o Pod da
  tarefa recebe o token da conta default do namespace. Use uma conta dedicada com
  `automountServiceAccountToken: false`.
- **Um namespace só para o Semaphore.** O runner não consegue ler nada, mas pode criar
  e excluir Pods e Secrets nele; não compartilhe o namespace com outras cargas de trabalho.
- **Segredos** são Secrets do Kubernetes separados por tarefa, montados somente leitura
  (segredos de ambiente via `envFrom`, então os valores não ficam na spec do Pod) e
  excluídos com o Pod. Quem pode ler Secrets no namespace pode lê-los enquanto a tarefa
  roda; ative a [criptografia em repouso](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)
  para Secrets.
- **Rede.** Limite o que as tarefas alcançam com uma [NetworkPolicy](#restrict-the-network-of-task-pods).

## Parar e limpar {#stop-and-clean-up}

**Stop** na interface encerra a transmissão do log e exclui o Pod com
`cleanup_grace_seconds`, depois os Secrets e ConfigMaps dele.

Se o runner for morto durante uma tarefa, os objetos da tarefa permanecem no namespace; o
runner não os recolhe na próxima inicialização. Remova-os quando nenhuma tarefa estiver rodando:

```bash
kubectl -n semaphore get pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
kubectl -n semaphore delete pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
```

## Solução de problemas {#troubleshooting}

| Sintoma | Causa e solução |
|---|---|
| Log do runner: `k8s executor is only available in the proprietary build` | O runner é uma build Community. Use `semaphoreui/runner` ou o binário oficial. |
| Log do runner: `failed to initialise executor provider` com `unable to load in-cluster configuration` | O runner está fora de um cluster e `kubeconfig` está vazio, ou o caminho do kubeconfig está errado. |
| Tarefa: `create pod ...: pods is forbidden: User "system:serviceaccount:..." cannot create resource` | O RBAC está ausente ou vinculado em outro namespace. Verifique com `kubectl auth can-i create pods -n semaphore --as=system:serviceaccount:semaphore:semaphore-runner`. |
| Tarefa: `create pod ...: namespaces "semaphore" not found` | Crie o namespace; o runner não o cria. |
| Tarefa: `create pod ...: violates PodSecurity "restricted"` | Adicione ao namespace o rótulo `pod-security.kubernetes.io/enforce: baseline`. |
| A tarefa fica em **Running** sem saída | O Pod está preso em `Pending`: nenhum nó comporta, a imagem não pode ser baixada (`ImagePullBackOff`) ou uma cota o bloqueia. O runner espera o Pod terminar. Verifique com `kubectl -n semaphore describe pod -l semaphoreui.com/task-id=<task id>` e pare a tarefa. |
| Tarefa: `pod ... finished with status Failed` | A clonagem ou o aplicativo falhou. O log acima mostra a saída de `git-clone` e `build`. |
| `interpreter python3 not found in image` | A imagem build não tem o binário do aplicativo; defina outra imagem ou o **Executor image** do modelo. |
| `No user exists for uid ...` (OpenShift) | O `/etc/passwd` da imagem não é gravável pelo grupo. Consulte [Criar uma imagem personalizada](./#build-a-custom-image). |

## Páginas relacionadas {#related-pages}

- [Executores](/admin-guide/executors): como as tarefas em contêiner são executadas, imagens, limitações.
- [Executor Docker](./docker): o mesmo modelo em um host Docker.
- [Instalação no Kubernetes](/admin-guide/installation/k8s): o servidor e o Deployment do runner.
- [Imagem do executor](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): uma imagem diferente para um modelo.
