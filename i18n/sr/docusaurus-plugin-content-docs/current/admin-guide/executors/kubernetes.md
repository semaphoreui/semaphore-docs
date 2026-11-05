---
title: Kubernetes executor
description: Izvršavajte svaki zadatak runnera u sopstvenom Kubernetes Podu, uz manifeste za servisne naloge i RBAC, podešavanja runnera, referencu konfiguracije i rešavanje problema.
sidebar_custom_props:
  edition: enterprise
---

# Kubernetes executor <FeatureState feature="k8s-executor" />

Sa Kubernetes executorom runner kreira jedan Pod po zadatku u namespace-u, prenosi
njegov log u Semaphore i briše Pod kada se zadatak završi. Runner može da radi u
klasteru (preporučeno) ili izvan njega, sa kubeconfig datotekom.

Kako se izvršava kontejnerski zadatak, šta se nalazi u kontejneru i šta nije podržano
opisano je u [Executori](./#how-a-container-task-runs). Ova stranica pokriva podešavanje
Kubernetes-a.

## Pre nego što počnete {#before-you-begin}

- Semaphore server sa Enterprise licencom.
- Runner raspoređen u klasteru, pogledajte [Instaliranje runnera na Kubernetes](/admin-guide/installation/k8s#runner).
  Koraci u nastavku koriste njegov namespace `semaphore` i Deployment `semaphore-runner`. Za
  runner van klastera pogledajte [Runner izvan klastera](#runner-outside-the-cluster).
- `kubectl` sa pravima da kreira servisne naloge i RBAC objekte u tom namespace-u.
- Klaster može da preuzme `semaphoreui/job` i `semaphoreui/helper` (ili vaše image-e).

## Šta runner kreira {#what-the-runner-creates}

Za zadatak sa ID-jem `42` runner kreira, u svom namespace-u:

| Objekat | Ime | Sadržaj |
|---|---|---|
| Pod | `semaphore-job-42-<random>` | Init kontejner `git-clone` (helper image) i kontejner `build` (build image), `restartPolicy: Never`. |
| Secret | `<pod>-ssh-<key id>` | Jedan po SSH ključu, montiran u `/secrets/ssh/<key id>/`. |
| Secret | `<pod>-vault` | Ansible vault lozinke. |
| Secret | `<pod>-extra-vars` | `values.json` sa dodatnim promenljivama. |
| Secret | `<pod>-env` | Tajne iz Variable Group tipa *Environment variable* i `SEMAPHORE_JWT`, ubačene pomoću `envFrom`. |
| ConfigMap | `<pod>-inventory` | Statički inventar. |

Kreiraju se samo objekti koji su zadatku potrebni. Svi nose oznaku
`semaphoreui.com/runner=semaphore`; Pod ima i `semaphoreui.com/task-id=42`.
Runner ih sve briše kada se zadatak završi, i posle neuspeha ili **Stop**.

## Podešavanje {#set-up}

### Korak 1. Kreirajte servisne naloge {#step-1-create-the-service-accounts}

Runneru je potreban jedan servisni nalog za kreiranje Podova zadataka. Podovi zadataka
dobijaju drugi, bez dozvola i bez API tokena, tako da playbook ne može da koristi prava runnera.

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

### Korak 2. Dodelite runneru dozvole {#step-2-grant-the-runner-its-permissions}

Ovo je kompletna lista API poziva koje executor izvršava:

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

`Role`, a ne `ClusterRole`: runner može da dira samo svoj namespace.

### Korak 3. Prebacite runner na Kubernetes executor {#step-3-switch-the-runner-to-the-kubernetes-executor}

Podovi zadataka ne postavljaju `securityContext`, pa ih namespace koji nameće Pod Security
nivo `restricted` odbija. Dozvolite `baseline`:

```bash
kubectl label namespace semaphore pod-security.kubernetes.io/enforce=baseline --overwrite
```

Dodelite Podu runnera njegov servisni nalog i podešavanja executora. U Deployment-u runnera
dodajte u `spec.template.spec`:

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

Bez podešenog `kubeconfig`-a runner koristi kredencijale naloga `semaphore-runner` unutar
klastera. Zadaci se više ne izvršavaju u Podu runnera, pa možete smanjiti njegove
`resources` (na primer `100m` CPU-a i `256Mi` memorije).

### Korak 4. Pokrenite zadatak {#step-4-run-a-task}

Usmerite šablon na runner i pokrenite zadatak. Pratite kako se njegov Pod pojavljuje i nestaje:

```bash
kubectl -n semaphore get pods -l semaphoreui.com/runner=semaphore -w
```

Log zadatka prikazuje:

```text
k8s: created pod semaphore/semaphore-job-42-a1b2c3 (1 ssh keys installed)
=== git-clone (init) ===
Cloning into '/workspace/repo'...
=== build (build) ===
semaphore: container executor: task 42, template 7
...
k8s: deleted pod semaphore/semaphore-job-42-a1b2c3
```

## Primeri {#examples}

### Runner izvan klastera {#runner-outside-the-cluster}

Runner radi na VM-u ili u Docker-u i pristupa API serveru pomoću kubeconfig-a.
Dajte kubeconfig-u [Role iz Koraka 2](#step-2-grant-the-runner-its-permissions)
i ništa više:

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

Koristi se trenutni kontekst kubeconfig-a.

### Image-i iz privatnog registra {#images-from-a-private-registry}

Kreirajte pull secret u namespace-u i navedite ga u `pull_secrets`; više imena se
razdvaja zarezima:

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

Secrets se dodaju svakom Podu zadatka, podjednako za build image, helper image i
**Executor image** šablona.

### CPU i memorija Podova zadataka {#cpu-and-memory-of-task-pods}

Executor ne postavlja requests ni limits na Podove zadataka. Podesite podrazumevane
vrednosti za namespace pomoću `LimitRange`; on važi za kontejnere `git-clone` i `build`:

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

Dodajte `ResourceQuota` da ograničite koliko svi paralelni zadaci namespace-a mogu da koriste.

### Ograničavanje mreže Podova zadataka {#restrict-the-network-of-task-pods}

Podovi zadataka nose oznaku `semaphoreui.com/runner=semaphore`, pa ih `NetworkPolicy`
može izabrati. Ova dozvoljava samo DNS, Git server i SSH ka upravljanim hostovima:

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

## Referenca konfiguracije {#configuration-reference}

Sve opcije se nalaze pod `runner.executor.k8s` u konfiguraciji runnera.

| Opcija | Promenljiva okruženja | Podrazumevano | Opis |
|---|---|---|---|
| `kubeconfig` | `SEMAPHORE_RUNNER_K8S_KUBECONFIG` | unutar klastera | Putanja do kubeconfig datoteke. Prazno: servisni nalog Poda runnera. |
| `namespace` | `SEMAPHORE_RUNNER_K8S_NAMESPACE` | `semaphore` | Namespace Podova zadataka, Secrets i ConfigMaps. Mora da postoji. |
| `image` | `SEMAPHORE_RUNNER_K8S_IMAGE` | `semaphoreui/job:latest` | Image kontejnera `build`. **Executor image** šablona ga zamenjuje. |
| `helper_image` | `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` | `semaphoreui/helper:latest` | Image init kontejnera `git-clone`. |
| `service_account` | `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` | `default` | Servisni nalog Podova zadataka. Koristite nalog bez dozvola, pogledajte [Korak 1](#step-1-create-the-service-accounts). |
| `pull_secrets` | `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` | — | `imagePullSecrets` za Podove zadataka, razdvojeni zarezima. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` | `3` | Koliko često runner čita status Poda. Niže vrednosti ranije pokreću prenos loga i troše više API poziva. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` | `30` | Grace period brisanja Poda posle završetka ili zaustavljanja zadatka. |

Pull politika image-a prati podrazumevano ponašanje Kubernetes-a: `Always` za `:latest`, inače
`IfNotPresent`.

## Bezbednost {#security}

- **Najmanja prava za runner.** [Role](#step-2-grant-the-runner-its-permissions)
  je ograničen na namespace i navodi samo ono što executor poziva. Ne vezujte `cluster-admin`.
- **Bez API pristupa za zadatke.** Sa podrazumevanim `service_account: default` Pod
  zadatka dobija token podrazumevanog naloga namespace-a. Koristite namenski nalog sa
  `automountServiceAccountToken: false`.
- **Namespace samo za Semaphore.** Runner ne može ništa da čita, ali tamo može da kreira
  i briše Podove i Secrets; ne delite namespace sa drugim workload-ima.
- **Tajne** su zasebni Kubernetes Secrets po zadatku, montirani samo za čitanje (tajne
  okruženja preko `envFrom`, pa njihove vrednosti nisu u specifikaciji Poda) i brišu se sa
  Podom. Ko može da čita Secrets u namespace-u, može da ih pročita dok zadatak radi;
  uključite [šifrovanje u mirovanju](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)
  za Secrets.
- **Mreža.** Ograničite šta zadaci dosežu pomoću [NetworkPolicy](#restrict-the-network-of-task-pods).

## Zaustavljanje i čišćenje {#stop-and-clean-up}

**Stop** u korisničkom interfejsu prekida prenos loga i briše Pod sa
`cleanup_grace_seconds`, a zatim njegove Secrets i ConfigMaps.

Ako se runner ubije tokom zadatka, objekti zadatka ostaju u namespace-u; runner
ih ne prikuplja pri sledećem pokretanju. Uklonite ih kada nijedan zadatak ne radi:

```bash
kubectl -n semaphore get pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
kubectl -n semaphore delete pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
```

## Rešavanje problema {#troubleshooting}

| Simptom | Uzrok i rešenje |
|---|---|
| Log runnera: `k8s executor is only available in the proprietary build` | Runner je Community verzija. Koristite `semaphoreui/runner` ili zvanični binarni fajl. |
| Log runnera: `failed to initialise executor provider` sa `unable to load in-cluster configuration` | Runner je izvan klastera i `kubeconfig` je prazan, ili je putanja do kubeconfig-a pogrešna. |
| Zadatak: `create pod ...: pods is forbidden: User "system:serviceaccount:..." cannot create resource` | RBAC nedostaje ili je vezan u drugom namespace-u. Proverite `kubectl auth can-i create pods -n semaphore --as=system:serviceaccount:semaphore:semaphore-runner`. |
| Zadatak: `create pod ...: namespaces "semaphore" not found` | Kreirajte namespace; runner to ne radi. |
| Zadatak: `create pod ...: violates PodSecurity "restricted"` | Označite namespace sa `pod-security.kubernetes.io/enforce: baseline`. |
| Zadatak ostaje u statusu **Running** bez izlaza | Pod je zaglavljen u `Pending`: nijedan čvor ne odgovara, image ne može da se preuzme (`ImagePullBackOff`) ili ga blokira kvota. Runner čeka dok se Pod ne završi. Proverite `kubectl -n semaphore describe pod -l semaphoreui.com/task-id=<task id>` i zaustavite zadatak. |
| Zadatak: `pod ... finished with status Failed` | Kloniranje ili aplikacija nisu uspeli. Log iznad prikazuje izlaz `git-clone` i `build`. |
| `interpreter python3 not found in image` | Build image-u nedostaje binarni fajl aplikacije; podesite drugi image ili **Executor image** šablona. |
| `No user exists for uid ...` (OpenShift) | U `/etc/passwd` image-a grupa ne može da piše. Pogledajte [Izgradnja prilagođenog image-a](./#build-a-custom-image). |

## Povezane stranice {#related-pages}

- [Executori](/admin-guide/executors): kako se izvršavaju kontejnerski zadaci, image-i, ograničenja.
- [Docker executor](./docker): isti model na Docker hostu.
- [Instalacija na Kubernetes](/admin-guide/installation/k8s): server i Deployment runnera.
- [Executor image](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): drugi image za jedan šablon.
