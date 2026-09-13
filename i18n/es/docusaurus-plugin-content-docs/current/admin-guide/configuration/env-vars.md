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
