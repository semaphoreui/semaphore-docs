# Inventario

![Lista de inventarios](/assets/inventory-list.webp)

Un inventario es un archivo que contiene la lista de hosts sobre los que Ansible ejecutará los plays.
Un inventario también almacena variables que pueden usar los playbooks. Un inventario puede guardarse en YAML, JSON o TOML.
Encontrará más información sobre los inventarios en la [documentación de Ansible.](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)

Semaphore UI puede leer un inventario desde un archivo del servidor al que el usuario de Semaphore tenga acceso de lectura, o bien un inventario estático que se edita desde la interfaz web.
Un inventario administrado guarda los hosts y las variables como registros que se editan desde la interfaz web.
Cada inventario tiene además al menos una credencial vinculada.
La credencial de usuario es obligatoria y es la que Ansible usa para iniciar sesión en los hosts de ese inventario. Las credenciales sudo se usan para elevar privilegios en dicho host.
Para crear un inventario es necesario disponer de una credencial de usuario, ya sea un nombre de usuario con inicio de sesión o una clave SSH configurada en el Almacén de claves.
Encontrará información sobre las credenciales en la sección [Almacén de claves](key-store) de este sitio.

## Tipos de inventario {#inventory-types}

| Tipo | Descripción |
|---|---|
| `static` | Inventario en formato INI que se edita en la interfaz web. |
| `static-yaml` | Inventario en formato YAML que se edita en la interfaz web. Úselo para inventarios de complementos como [NetBox](./inventory/netbox-dynamic-inventory) o [Consul](./inventory/consul-dynamic-inventory). |
| `file` | Ruta a un archivo de inventario. Una ruta relativa apunta al repositorio de la plantilla; una ruta absoluta, a un archivo del servidor. Opcionalmente, seleccione un **Repositorio de inventario** aparte si el archivo se encuentra en otro repositorio Git. |
| `managed` | Hosts y variables se mantienen como registros en la interfaz web. Consulte [Inventario administrado](#managed-inventory). |
| `terraform-workspace`, `tofu-workspace`, `terragrunt-workspace` | No es un inventario de Ansible: es un espacio de trabajo para las plantillas de [Terraform/OpenTofu](./apps/terraform/workspaces) y [Terragrunt](./apps/terragrunt). |

## Crear un inventario {#creating-an-inventory}
1. Haga clic en la pestaña Almacén de claves y confirme que dispone de una clave de tipo login_password o ssh
2. Haga clic en la pestaña Inventario y haga clic en Nuevo inventario
3. Asigne un nombre al inventario y seleccione la credencial de usuario correcta en el desplegable. Seleccione la credencial sudo correcta, si es necesario
4. Seleccione el tipo de inventario
  * Si selecciona file, use la ruta absoluta al archivo. Si este archivo se encuentra en su repositorio git, use la ruta relativa. Ej. `inventory/linux-hosts.yaml`
  * Si selecciona static o static-yaml, pegue o escriba su inventario en el formulario
  * Si selecciona managed, cree primero el inventario y luego agregue hosts y variables en su página. Consulte [Inventario administrado](#managed-inventory)
5. Haga clic en Crear.

## Actualizar un inventario {#updating-an-inventory}
1. Haga clic en la pestaña Inventario
2. Haga clic en el icono del lápiz junto al inventario que desea editar
3. Realice sus cambios
4. Haga clic en Guardar

Para cambiar los hosts y las variables de un inventario administrado, consulte [Inventario administrado](#managed-inventory).

## Eliminar un inventario {#deleting-an-inventory}
Antes de eliminar un inventario, debe eliminar todos los recursos vinculados a él.
Si no está seguro de qué recursos se usan en un entorno, siga los pasos 1 y 2 a continuación. Se le mostrará qué recursos se están usando, con enlaces a dichos recursos.

1. Haga clic en la pestaña Inventario
2. Haga clic en el icono de la papelera junto al inventario
3. Haga clic en Sí si está seguro de que desea eliminar el inventario

## Inventario administrado {#managed-inventory}

Un inventario administrado guarda sus hosts como registros en lugar de texto de inventario. Úselo cuando agregue, cambie o desactive hosts con frecuencia y no quiera editar un texto largo.

Haga clic en el nombre del inventario en la lista. La página tiene tres pestañas:

* **Hosts**: busque hosts por nombre, fíltrelos por grupo, agréguelos, edítelos y elimínelos. La columna **Groups** muestra los grupos de un host. La columna **Variables** muestra cuántas variables tiene un host.
* **Groups**: grupos de hosts. Consulte [Grupos](#managed-inventory-groups).
* **Variables**: variables de todo el inventario.

Un host tiene un nombre, una descripción opcional y variables. El nombre es lo que Ansible ve como host. Debe ser único en el inventario, distingue mayúsculas de minúsculas y no debe contener espacios, comas, corchetes ni dos puntos. Ponga la dirección y el puerto en las variables `ansible_host` y `ansible_port`.

Escriba las variables de un host y del inventario en YAML o JSON, como un mapeo:

```yaml
ansible_host: 10.0.0.5
ansible_user: deploy
```

Un valor definido en un host prevalece sobre la misma variable definida en el inventario. No se aceptan anclas, alias ni claves de fusión de YAML.

Para omitir un host, desactive su interruptor en la lista de hosts. Las tareas creadas después no usan ese host. Actívelo de nuevo para volver a usarlo.

* No puede cambiar el tipo de un inventario a `managed` ni desde `managed` después de crearlo.
* Los hosts y las variables de un inventario administrado forman parte de la copia de seguridad del proyecto.
* Los usuarios que solo pueden ver el proyecto pueden abrir la página, pero no pueden cambiarla.

### Grupos {#managed-inventory-groups}

Un grupo le permite ejecutar un playbook en una parte de los hosts, por ejemplo con `hosts: web`, y definir una variable una sola vez para muchos hosts.

Agregue un grupo en la pestaña **Groups**. Un grupo tiene un nombre, una descripción opcional, variables y grupos hijos. El nombre debe ser único en el inventario, y los nombres `all` y `ungrouped` están reservados. Los hosts de un grupo hijo también pertenecen al grupo padre. Un grupo no puede ser su propio ancestro.

Para poner un host en grupos, elíjalos en el campo **Groups** al agregar o editar el host. Para cambiar varios hosts a la vez, selecciónelos en la pestaña **Hosts** y haga clic en **Add to groups** o **Remove from groups**. Un host puede estar en varios grupos.

Para ver los hosts de un grupo, elija el grupo en el filtro de la pestaña **Hosts**. La lista incluye los hosts de sus grupos hijos.

Un valor definido en un host prevalece sobre la misma variable definida en un grupo, y un valor definido en un grupo prevalece sobre el inventario. Una tarea dirigida a un grupo se ejecuta en sus hosts que están activados.
