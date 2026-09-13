# JWT de tareas

Cuando [la emisión de JWT está habilitada en el servidor](/admin-guide/security/jwt),
una plantilla puede generar un token firmado de corta duración para cada tarea que lance.
El token se expone al playbook o script en ejecución como la variable de entorno
`SEMAPHORE_JWT` y puede intercambiarse por credenciales
en cualquier sistema que admita autenticación JWT,
como OpenBao o HashiCorp Vault.

La ventaja frente a un secreto de larga duración almacenado en el
[almacén de claves](/user-guide/key-store) es que cada tarea obtiene un **token nuevo
que identifica la ejecución exacta de la tarea** (proyecto, plantilla, id de usuario) y
que expira poco después de que la tarea finalice.

## Habilitar JWT en una plantilla {#enabling-jwts-on-a-template}

En el formulario de la plantilla, desplácese hasta la sección **JWT** (solo aparece cuando el
administrador ha [habilitado la emisión de JWT](/admin-guide/security/jwt)) y
marque **JWT habilitado**.

Puede configurar las siguientes opciones por plantilla:

| Campo | Descripción |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audiencia | Una o más cadenas emitidas en el claim `aud`. Establézcalo con el o los identificadores que espera su sistema de destino (por ejemplo, la URL del servidor OpenBao). Se admiten hasta 32 entradas. |
| TTL | Duración de vida del token expresada como duración (`30s`, `10m`, `1h`, ...). Si se deja vacío, se utiliza el valor global `jwt.default_ttl`. El TTL no debe superar el valor global `jwt.max_ttl`. |

## Claims del token {#token-claims}

Cada token contiene los siguientes claims, en los que puede confiar al conceder
acceso en el sistema de destino:

| Claim | Ejemplo | Notas |
| ------------- | ----------------------------- | -------------------------------------------------- |
| `iss` | `https://semaphore.example.com` | Configurado por el administrador. |
| `aud` | `https://bao.example.com` | De la lista de audiencias de la plantilla. |
| `sub` | `task:1234` | Único por ejecución de tarea. |
| `iat` / `nbf` / `exp` | | Claims de tiempo estándar. |
| `jti` | | Identificador único del token. |
| `project_id` | `7` | Proyecto al que pertenece la plantilla. |
| `template_id` | `42` | La plantilla que generó la tarea. |
| `user_id` | `67` | Usuario que lanzó la tarea (se omite en ejecuciones programadas o de integraciones) |

Utilice estos claims para **delimitar** el acceso en el lado consumidor. Por ejemplo, un
rol de OpenBao que solo acepte tokens con `project_id = 7` y un
`template_id` específico.

## Uso del token dentro de una tarea {#using-the-token-inside-a-task}

Semaphore exporta el token como `SEMAPHORE_JWT` en el entorno del
proceso de la tarea.

```bash
#!/usr/bin/env bash

# Bash example
echo "Look at my fancy token: $SEMAPHORE_JWT"
```

```yaml
# Ansible example
- name: Read secret from OpenBao KVv2 via JWT auth
  ansible.builtin.set_fact:
    openbao_secret_value: >-
      {{ lookup(
        'community.hashi_vault.hashi_vault',
        secret='kv/data/semaphore/demo:value',
        auth_method='jwt',
        url='https://bao.example.com',
        role_id=bao_role,
        jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
      ) }}
```

______________________________________________________________________

## Ejemplo: OpenBao {#example-openbao}

El siguiente recorrido configura OpenBao para que confíe en los JWT de Semaphore y
los intercambie por una contraseña de demostración.
Reemplace `semaphore.example.com` y `bao.example.com` por sus propios nombres de host.

### 1. Configurar el método de autenticación JWT {#1-configure-the-jwt-auth-method}

Habilite el método de autenticación JWT y apúntelo al endpoint JWKS de su
instancia de Semaphore. OpenBao utiliza la clave pública que obtiene allí para verificar
cada token.

```shell
bao auth enable jwt

bao write auth/jwt/config \
    jwks_url="https://semaphore.example.com/.well-known/jwks.json" \
    bound_issuer="https://semaphore.example.com"
```

### 2. Definir una política {#2-define-a-policy}

Conceda los permisos que necesita una tarea. El siguiente ejemplo permite leer la
credencial de demostración ubicada en `kv/data/semaphore/demo`:

```shell
bao policy write semaphore-demo-policy - <<EOF
path "kv/data/semaphore/demo" {
  capabilities = ["read"]
}
EOF
```

### 3. Definir un rol de OpenBao vinculado a una plantilla {#3-define-an-openbao-role-bound-to-a-template}

Un rol de OpenBao decide **qué tareas de Semaphore** pueden asumir qué
política. Utilice los claims específicos de Semaphore (`project_id`, `template_id`, ...)
como `bound_claims` para que solo la plantilla prevista pueda usar el rol:

```shell
bao write auth/jwt/role/semaphore-demo-role - <<EOF
{
  "role_type": "jwt",
  "user_claim": "sub",
  "bound_audiences": "https://bao.example.com",
  "bound_claims": {
    "project_id": "7",
    "template_id": "42"
  },
  "policies": ["semaphore-demo-policy"],
}
EOF
```

Restrinja siempre cada rol con al menos un claim `project_id` o `template_id`.
Sin una vinculación, **cualquier** JWT emitido por su instancia de Semaphore
podría asumir el rol.

Puede encontrar la lista completa de parámetros de configuración admitidos [aquí](https://openbao.org/api-docs/auth/jwt/#createupdate-role)

### 4. Configurar la plantilla {#4-configure-the-template}

En la plantilla de Semaphore que ejecuta el playbook de despliegue:

- Marque **JWT habilitado**.
- Establezca **Audiencia** en `https://bao.example.com`; esto coincide con
  `bound_audiences` en el rol de OpenBao.
- Opcionalmente, establezca **TTL** en `15m` para que el token expire poco después de que
  la tarea finalice.

### 5. Usar el token en la tarea {#5-use-the-token-in-the-task}

```yaml
- hosts: localhost
  gather_facts: false
  tasks:
    - name: Read secret from OpenBao KVv2 via JWT auth
      ansible.builtin.set_fact:
        openbao_secret_value: >-
        {{ lookup(
          'community.hashi_vault.hashi_vault',
          secret='kv/data/semaphore/demo:value',
          auth_method='jwt',
          url='https://bao.example.com',
          role_id='semaphore-demo-role',
          jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
        ) }}
```

La tarea ahora se autentica contra OpenBao sin ningún secreto compartido previamente :tada:
