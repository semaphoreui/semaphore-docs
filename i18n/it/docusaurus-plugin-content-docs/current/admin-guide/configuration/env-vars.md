# Variabili d'ambiente

Tramite le variabili d'ambiente è possibile sovrascrivere qualsiasi opzione di configurazione disponibile.

È disponibile un generatore interattivo di variabili d'ambiente (per Docker):
* per il [server](https://semaphoreui.com/install/docker/2_12/)
* per il [runner](https://semaphoreui.com/install/docker/2_12/runner).

---

## Ambiente applicativo per le app (Ansible, Terraform, ecc.) {#application-environment-for-apps-ansible-terraform-etc}

Semaphore può passare variabili d'ambiente ai processi delle applicazioni (Ansible, Terraform/OpenTofu, Python, PowerShell, ecc.). Esistono due opzioni correlate:

- `env_vars` / `SEMAPHORE_ENV_VARS`: coppie chiave-valore statiche che verranno impostate per i processi delle app.
- `forwarded_env_vars` / `SEMAPHORE_FORWARDED_ENV_VARS`: un elenco di nomi di variabili che il server inoltrerà dal proprio ambiente di processo.

Esempio di file di configurazione:

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

Equivalente con variabili d'ambiente:

```bash
export SEMAPHORE_ENV_VARS='{"HTTP_PROXY":"http://proxy.internal:3128","ANSIBLE_STDOUT_CALLBACK":"yaml"}'
export SEMAPHORE_FORWARDED_ENV_VARS='["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","GOOGLE_APPLICATION_CREDENTIALS"]'
```

Note:
- L'inoltro è esplicito: solo le variabili elencate in `forwarded_env_vars` vengono ereditate dai processi delle app.
- I segreti dovrebbero essere forniti in modo sicuro (ad esempio tramite i secret di Docker/Kubernetes) e poi inoltrati con `forwarded_env_vars`.

---

## Configurazione dell'executor del runner {#runner-executor-configuration}

Nelle installazioni con runner, l'intero blocco executor può essere impostato con una singola variabile d'ambiente JSON invece che con le singole chiavi:

```bash
export SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"image":"semaphoreui/job:latest"}}'
```

Equivale a impostare `runner.executor.type` e i campi annidati `runner.executor.docker.*` nel file di configurazione. Consultare [Opzioni di configurazione](/admin-guide/configuration) per tutte le impostazioni dell'executor del runner.

---

## Variabili d'ambiente segrete nei Gruppi di variabili {#secret-environment-variables-in-variable-groups}

Oltre alle variabili d'ambiente globali, è possibile definire segreti per progetto nei Gruppi di variabili. Le chiavi segrete vengono mascherate nell'interfaccia e nei log. Consultare `User Guide → Variable Groups` per l'uso e per l'integrazione con Terraform tramite le variabili `TF_VAR_*`.
