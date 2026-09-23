# Variables de entorno

Mediante variables de entorno puede sobrescribir cualquier opción de configuración disponible.

Puede usar el generador interactivo de variables de entorno (para Docker):
* para el [servidor](https://semaphoreui.com/install/docker/2_12/)
* para el [runner](https://semaphoreui.com/install/docker/2_12/runner).

---

## Entorno de ejecución para las aplicaciones (Ansible, Terraform, etc.) {#application-environment-for-apps-ansible-terraform-etc}

Semaphore puede pasar variables de entorno a los procesos de las aplicaciones (Ansible, Terraform/OpenTofu, Python, PowerShell, etc.). Hay dos opciones relacionadas:

- `env_vars` / `SEMAPHORE_ENV_VARS`: pares clave-valor estáticos que se definirán para los procesos de las aplicaciones.
- `forwarded_env_vars` / `SEMAPHORE_FORWARDED_ENV_VARS`: lista de nombres de variables que el servidor reenviará desde su propio entorno de proceso.

Ejemplo de archivo de configuración:

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

Equivalente con variables de entorno:

```bash
export SEMAPHORE_ENV_VARS='{"HTTP_PROXY":"http://proxy.internal:3128","ANSIBLE_STDOUT_CALLBACK":"yaml"}'
export SEMAPHORE_FORWARDED_ENV_VARS='["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","GOOGLE_APPLICATION_CREDENTIALS"]'
```

Notas:
- El reenvío es explícito: solo las variables listadas en `forwarded_env_vars` son heredadas por los procesos de las aplicaciones.
- Los secretos deben proporcionarse de forma segura (por ejemplo mediante secretos de Docker/Kubernetes) y después reenviarse usando `forwarded_env_vars`.
- La misma lista se usa para los procesos `git` que clonan y actualizan repositorios, así que todo lo que `git` necesite del entorno del host también debe reenviarse.

---

## Ejecución detrás de un proxy corporativo {#running-behind-a-corporate-proxy}

Semaphore no transmite todo su entorno a los procesos que inicia. En particular, las variables de proxy solo llegan a una tarea o a un clonado de `git` si están listadas en `forwarded_env_vars` o definidas en `env_vars`.

Esto importa sobre todo en una instalación por paquete (systemd). Las variables de proxy definidas en el archivo de unidad se aplican al propio servidor de Semaphore, pero no a `git`:

```ini
[Service]
Environment="HTTPS_PROXY=http://proxy.internal:3128"
Environment="HTTP_PROXY=http://proxy.internal:3128"
Environment="NO_PROXY=.corp.example.com"
```

Con la configuración anterior y nada más, clonar un repositorio falla con:

```
fatal: Authentication failed for 'https://git.corp.example.com/team/_git/infra'
```

`git` nunca vio `NO_PROXY`, así que envió la petición del host interno a través del proxy externo, que la rechazó. Reenvíe las tres variables de forma explícita para solucionarlo:

```json
{
  "forwarded_env_vars": ["HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY"]
}
```

O bien, como variable de entorno:

```bash
export SEMAPHORE_FORWARDED_ENV_VARS='["HTTP_PROXY","HTTPS_PROXY","NO_PROXY"]'
```

Notas:
- Reenvíe `NO_PROXY` junto con las variables de proxy. Sin ella, el tráfico hacia los servidores Git internos también se enruta por el proxy.
- Muchas herramientas leen la forma en minúsculas (`http_proxy`, `https_proxy`, `no_proxy`). En Linux y macOS los nombres de variable distinguen mayúsculas de minúsculas, así que incluya ambas formas si su entorno las define en minúsculas.
- Los paquetes de CA personalizados funcionan igual. Si su proxy termina el TLS, reenvíe `GIT_SSL_CAINFO`, `SSL_CERT_FILE` o `REQUESTS_CA_BUNDLE` según corresponda, en lugar de desactivar la verificación de certificados.
- En las instalaciones con Docker esto suele funcionar sin más, porque las variables de proxy se definen para todo el contenedor. Aun así, conviene reenviarlas explícitamente para que la misma configuración se comporte igual en ambos casos.

---

## Configuración del ejecutor del runner {#runner-executor-configuration}

En los despliegues de runners, el bloque completo del ejecutor puede definirse como una única variable de entorno JSON en lugar de claves individuales:

```bash
export SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"image":"semaphoreui/job:latest"}}'
```

Esto equivale a definir `runner.executor.type` y los campos anidados `runner.executor.docker.*` en el archivo de configuración. Consulte [Opciones de configuración](/admin-guide/configuration) para ver todos los ajustes del ejecutor del runner.

---

## Variables de entorno secretas en los grupos de variables {#secret-environment-variables-in-variable-groups}

Además de las variables de entorno globales, puede definir secretos por proyecto en los grupos de variables. Las claves secretas se enmascaran en la interfaz y en los registros. Consulte `User Guide → Variable Groups` para conocer su uso y la integración con Terraform mediante variables `TF_VAR_*`.
