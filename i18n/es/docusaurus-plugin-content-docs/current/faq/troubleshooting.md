# Solución de problemas

## El runner muestra el error 404 {#runner-prints-error-404}

### Cómo solucionarlo {#how-to-fix}

[Obtención del código de error 401 desde el runner](https://github.com/semaphoreui/semaphore/discussions/1873?converting=1)

---

## Problema de Gathering Facts para localhost {#gathering-facts-issue-for-localhost}

El problema puede producirse en Semaphore UI instalado mediante [Snap](https://snapcraft.io/semaphore) o [Docker](https://hub.docker.com/r/semaphoreui/semaphore).

```
4:10:16 PM
TASK [Gathering Facts] *********************************************************
4:10:17 PM
fatal: [localhost]: FAILED! => changed=false
```

### Por qué ocurre {#why-this-happens}

Para más información sobre el uso de localhost en Ansible, lea este artículo: [Implicit 'localhost'](https://docs.ansible.com/ansible/latest/inventory/implicit_localhost.html).

Ansible intenta recopilar los facts localmente, pero Ansible se encuentra en un contenedor aislado y limitado que no lo permite.

### Cómo solucionarlo {#how-to-fix-this}

Hay dos formas:

1. Desactivar la recopilación de facts:

```yaml
- hosts: localhost
  gather_facts: False
  roles:
    - ...
```

2. Establecer explícitamente el tipo de conexión en **ssh**:
```
[localhost]
127.0.0.1 ansible_connection=ssh ansible_ssh_user=your_localhost_user
```
---
## panic: pq: SSL is not enabled on the server {#panic-pq-ssl-is-not-enabled-on-the-server}

Esto significa que su Postgres no funciona con SSL.

### Cómo solucionarlo {#how-to-fix-this-1}

Añada la opción `sslmode=disable` al archivo de configuración:

```json
	"postgres": {
		"host": "localhost",
		"user": "postgres",
		"pass": "pwd",
		"name": "semaphore",
		"options": {
			"sslmode": "disable"
		}
	},
```
---
## fatal: bad numeric config value '0' for 'GIT_TERMINAL_PROMPT': invalid unit {#fatal-bad-numeric-config-value-0-for-git_terminal_prompt-invalid-unit}

Esto significa que está intentando acceder a un repositorio a través de HTTPS que requiere autenticación.

### Cómo solucionarlo {#how-to-fix-this-2}

* Vaya a la pantalla **Almacén de claves**.
* Cree una nueva clave de tipo `Login with password`.
* Indique su usuario de GitHub/BitBucket/etc.
* Indique la contraseña. No puede usar la contraseña de su cuenta de GitHub/BitBucket; en su lugar debe usar un Personal Access Token (PAT). Lea más [aquí](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
* Tras crear la clave, vaya a la pantalla **Repositorios**, busque su repositorio e indique la clave.

---

## El clone o pull de Git falla de forma intermitente {#git-clone-or-pull-fails-intermittently}

Los registros de la tarea pueden mostrar mensajes como `Git pull failed (...), retrying in 2s` seguidos de un éxito o de un fallo definitivo tras varios intentos.

### Por qué ocurre {#why-this-happens-1}

El servidor git (GitHub, GitLab, Bitbucket o una instancia autoalojada) estuvo temporalmente inaccesible, devolvió un error HTTP transitorio, o la red entre Semaphore y el servidor sufrió una breve interrupción. Semaphore reintenta automáticamente las operaciones de clone y pull antes de marcar la tarea como fallida.

### Cómo solucionarlo {#how-to-fix-this-3}

1. **Interrupciones transitorias**: normalmente se resuelven por sí solas. Semaphore reintenta hasta `git_attempts` veces (4 de forma predeterminada) con retroceso exponencial entre intentos.
2. **Fallos frecuentes**: aumente el número de intentos en su configuración:

```json
{
  "git_attempts": 8
}
```

O con una variable de entorno:

```bash
export SEMAPHORE_GIT_ATTEMPTS=8
```

3. **Fallos inmediatos y constantes**: los reintentos no ayudarán. Compruebe la URL del repositorio, el nombre de la rama, las claves de acceso y la conectividad de red desde el servidor de Semaphore o el host del runner.

Consulte [Operaciones de Git](/admin-guide/configuration/config-file#git-operations) para más detalles sobre `git_client` y `git_attempts`.

---

## La salida del script Bash falta o está incompleta {#bash-script-output-is-missing-or-incomplete}

Una tarea Bash termina correctamente, pero el registro muestra poca o ninguna salida de `echo`, `printf` u otros comandos, especialmente cuando el script finaliza rápidamente.

### Por qué ocurre {#why-this-happens-2}

Semaphore captura stdout y stderr de los comandos de shell mientras se ejecutan. Los scripts muy cortos pueden terminar antes de que se lea toda la salida almacenada en el búfer, por lo que las últimas líneas pueden perderse en el registro de la tarea.

### Cómo solucionarlo {#how-to-fix-this-4}

1. **Actualice**: las versiones recientes de Semaphore vacían la salida del proceso antes de marcar una tarea como completada. Actualice el servidor y los runners si usa una versión antigua.
2. **Vacíe la salida en el script** cuando necesite garantizar su entrega:

```bash
#!/bin/bash
echo "Starting deploy"
echo "Done" >&2
```

Para diagnósticos críticos, escriba en un archivo dentro del espacio de trabajo del repositorio y haga `cat` de él al final del script.
3. **Evite salidas anticipadas silenciosas**: use `set -euo pipefail` y mensajes de error explícitos para que los fallos sean visibles incluso cuando la salida sea breve.

---

## unable to read LDAP response packet: unexpected EOF {#unable-to-read-ldap-response-packet-unexpected-eof}

Lo más probable es que esté intentando conectarse al servidor LDAP con un método inseguro, aunque este espera una conexión segura (mediante TLS).

### Cómo solucionarlo {#how-to-fix-this-5}

Habilite TLS en su archivo `config.json`:

```json
...
"ldap_needtls": true
...
```

---

## LDAP Result Code 49 "Invalid Credentials" {#ldap-result-code-49-invalid-credentials}

Tiene una contraseña o un `binddn` incorrectos.

### Cómo solucionarlo {#how-to-fix-this-6}

Use la herramienta `ldapwhoami` y compruebe si su binddn funciona:

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=/your/ldap_binddn/value/in/config/file"\
  -x\
  -W
```

Le pedirá la contraseña de forma interactiva y debería devolver el código **0** y mostrar el **DN** especificado.

También puede leer los siguientes artículos: 
* [ldapsearch: Invalid credentials (49)](https://serverfault.com/q/771549/443463)
* [https://github.com/semaphoreui/semaphore/issues/906](https://github.com/semaphoreui/semaphore/issues/906)

---

## LDAP Result Code 32 "No Such Object" {#ldap-result-code-32-no-such-object}

Próximamente.
