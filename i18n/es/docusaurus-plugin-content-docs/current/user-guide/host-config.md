---
title: Host config
description: Asocie un host Git o la URL de un repositorio a una credencial del Almacén de claves, para que los submódulos, los roles de Galaxy, los módulos de Terraform y los repositorios de inventario alojados en otro lugar sean accesibles con su propia clave.
---

# Host config

Una tarea se autentica en su repositorio con la clave seleccionada en el [Repositorio](/user-guide/repositories). Todo lo demás que la tarea obtiene de Git no recibe ninguna credencial propia: un submódulo en otro servidor, un rol de `requirements.yml`, un módulo de Terraform, un inventario guardado en un segundo repositorio. **Host config** (configuración de hosts) cierra esa brecha. Una asignación vincula un host Git o la URL de un repositorio a una credencial del [Almacén de claves](/user-guide/key-store), y todas las operaciones Git del proyecto la usan cuando llegan a ese host o a esa URL.

La página está en el menú del proyecto, debajo de **Repositorios**. Añadir, editar y eliminar asignaciones requiere el permiso para gestionar los recursos del proyecto, el mismo que necesita el Almacén de claves.

![Página Host config de un proyecto con tres asignaciones](/assets/host-config-page.webp)

## Tipos de asignación {#mapping-types}

Pulse **Add mapping** (añadir asignación) y elija con qué debe coincidir la asignación.

### Host {#host}

Una asignación de tipo **Host** coincide con un nombre de host SSH, por ejemplo `github.com` o `gitlab.example.com`, y necesita una clave **SSH**. Cada vez que la tarea abre una conexión SSH a ese host, se autentica con la clave asignada: un repositorio o submódulo clonado por SSH, una URL `git@host:group/repo.git` en `requirements.yml` y también los hosts de un inventario de Ansible con ese nombre. Cuando la clave tiene un nombre de usuario, se usa como usuario SSH para el host.

<div style={{maxWidth: 720}}>

![Diálogo Add mapping con el tipo Host seleccionado](/assets/host-config-form-host.webp)

</div>

### URL {#url}

Una asignación de tipo **URL** coincide con la URL `https://` o `http://` de un repositorio. Puede nombrar un solo repositorio, `https://gitlab.example.com/infra/network.git`, o terminar en `/` para cubrir todos los repositorios de un grupo, `https://gitlab.example.com/ansible/`. Cuando coinciden varias asignaciones, gana la URL más específica, de modo que la asignación de un repositorio concreto prevalece sobre la asignación del grupo que lo contiene.

La credencial decide cómo se accede a la URL:

| Credencial | Qué ocurre |
|---|---|
| Clave **SSH** | La URL se reescribe en su forma SSH y la conexión se autentica con la clave. El nombre de usuario de la clave es el usuario SSH, `git` cuando la clave no tiene ninguno. |
| **Inicio de sesión con contraseña** | El nombre de usuario y la contraseña se añaden a la URL y se envían por HTTPS. Deje vacío el nombre de usuario para usar un token de acceso personal. Solo una URL `https://` acepta esta credencial, de modo que el secreto nunca viaja en texto claro. |

La URL no debe contener credenciales propias, espacios, comillas ni el carácter `=`.

<div style={{maxWidth: 720}}>

![Diálogo de edición de una asignación URL que usa un inicio de sesión con contraseña](/assets/host-config-form-url.webp)

</div>

## Dónde se aplican las asignaciones {#where-mappings-apply}

Las asignaciones de un proyecto se instalan antes del primer comando Git de una tarea y permanecen en vigor hasta que esta termina. Cubren:

- la clonación y actualización del repositorio de la plantilla, incluidos sus submódulos;
- los roles y colecciones instalados desde `requirements.yml`, consulte [Requisitos de Galaxy](/user-guide/apps/ansible#galaxy-requirements);
- los módulos descargados por `terraform init` o `tofu init`;
- los comandos Git iniciados por el propio playbook o script, por ejemplo el módulo `git` de Ansible;
- el repositorio de un inventario guardado en Git;
- los hosts del inventario, cuando una asignación **Host** coincide con su nombre;
- la exploración de ramas y playbooks de un repositorio en el formulario de plantilla, y el sondeo de las programaciones que se inician con un nuevo commit.

Las tareas enviadas a un [runner remoto](/admin-guide/runners) reciben las asignaciones junto con la tarea, por lo que allí se comportan de la misma manera.

Una asignación prevalece sobre la entrada del mismo host en la configuración SSH global del servidor (`ssh.config_path` en la [configuración](/reference/configuration)); el resto de entradas de ese archivo siguen funcionando. Las asignaciones necesitan el cliente Git de línea de comandos, que es el predeterminado `git_client: cmd_git`; con el cliente integrado `go_git`, una tarea de un proyecto con asignaciones falla con un error explicativo en lugar de usar la credencial equivocada.

## Credenciales {#credentials}

Las claves privadas nunca tocan el disco: cada asignación SSH guarda su clave en un agente SSH que vive tanto como la tarea, y la configuración SSH generada solo nombra al agente. Un inicio de sesión con contraseña se pasa a Git a través de su entorno de configuración, no en la línea de comandos, y Git muestra la URL original en el registro de la tarea, así que el secreto no aparece en ninguno de los dos.

Una clave a la que hace referencia una asignación no puede eliminarse; el diálogo de confirmación muestra las asignaciones que la usan. Cambiar el tipo de una clave así a uno que la asignación no pueda usar, por ejemplo convertir la clave SSH de una asignación Host en un inicio de sesión con contraseña, también se rechaza.

## Ejemplo {#example}

Un playbook vive en GitHub, usa un submódulo de un GitLab autoalojado e instala un rol de un segundo grupo de GitLab mediante `requirements.yml`:

```yaml
# requirements.yml
- src: https://gitlab.example.com/ansible/role-nginx.git
  version: v2.1.0
```

Tres asignaciones hacen que la tarea se ejecute sin ningún cambio en el repositorio:

| Tipo | Host o URL | Credencial |
|---|---|---|
| Host | `github.com` | La clave de despliegue del repositorio de GitHub |
| URL | `https://gitlab.example.com/ansible/` | Un token de acceso de GitLab, como inicio de sesión con contraseña |
| URL | `https://gitlab.example.com/infra/network.git` | La clave SSH autorizada solo en ese repositorio |

## Copias de seguridad {#backups}

Las asignaciones forman parte de la [copia de seguridad del proyecto](./projects/settings#danger-zone). Hacen referencia a su credencial por nombre, de modo que un proyecto restaurado las mantiene vinculadas a las claves restauradas. Como con cualquier clave, el valor secreto en sí no se exporta.
