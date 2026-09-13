# Inventario

![Lista de inventarios](/assets/inventory-list.webp)

Un inventario es un archivo que contiene la lista de hosts sobre los que Ansible ejecutará los plays.
Un inventario también almacena variables que pueden usar los playbooks. Un inventario puede guardarse en YAML, JSON o TOML.
Encontrará más información sobre los inventarios en la [documentación de Ansible.](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)

Semaphore UI puede leer un inventario desde un archivo del servidor al que el usuario de Semaphore tenga acceso de lectura, o bien un inventario estático que se edita desde la interfaz web.
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
| `terraform-workspace`, `tofu-workspace`, `terragrunt-workspace` | No es un inventario de Ansible: es un espacio de trabajo para las plantillas de [Terraform/OpenTofu](./apps/terraform/workspaces) y [Terragrunt](./apps/terragrunt). |

## Crear un inventario {#creating-an-inventory}
1. Haga clic en la pestaña Almacén de claves y confirme que dispone de una clave de tipo login_password o ssh
2. Haga clic en la pestaña Inventario y haga clic en Nuevo inventario
3. Asigne un nombre al inventario y seleccione la credencial de usuario correcta en el desplegable. Seleccione la credencial sudo correcta, si es necesario
4. Seleccione el tipo de inventario
  * Si selecciona file, use la ruta absoluta al archivo. Si este archivo se encuentra en su repositorio git, use la ruta relativa. Ej. `inventory/linux-hosts.yaml`
  * Si selecciona static o static-yaml, pegue o escriba su inventario en el formulario
5. Haga clic en Crear.

## Actualizar un inventario {#updating-an-inventory}
1. Haga clic en la pestaña Inventario
2. Haga clic en el icono del lápiz junto al inventario que desea editar
3. Realice sus cambios
4. Haga clic en Guardar

## Eliminar un inventario {#deleting-an-inventory}
Antes de eliminar un inventario, debe eliminar todos los recursos vinculados a él.
Si no está seguro de qué recursos se usan en un entorno, siga los pasos 1 y 2 a continuación. Se le mostrará qué recursos se están usando, con enlaces a dichos recursos.

1. Haga clic en la pestaña Inventario
2. Haga clic en el icono de la papelera junto al inventario
3. Haga clic en Sí si está seguro de que desea eliminar el inventario
