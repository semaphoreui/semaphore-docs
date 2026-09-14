# Equipos

En Semaphore UI, cada proyecto está asociado a un **Equipo**. Solo los miembros del equipo y los administradores pueden acceder al proyecto. A cada miembro del equipo se le asigna uno de los cuatro roles integrados, que determinan su nivel de acceso y las acciones que puede realizar.

En la edición **Enterprise**, los roles integrados pueden ampliarse con [roles personalizados](#extended-rbac-enterprise) que conceden permisos adicionales y detallados sobre plantillas específicas.

:::tip
Para evitar perder el acceso a un proyecto, se recomienda tener al menos dos miembros del equipo con el rol <b>Propietario</b>.
:::

La sección **Equipo** de un proyecto tiene dos pestañas: **Miembros**, con los usuarios y sus roles, y **Roles**, con los roles personalizados (Enterprise).

![Miembros del equipo](/assets/team-members.webp)

## Roles integrados {#built-in-roles}

Cada miembro del equipo tiene exactamente uno de estos cuatro roles:

- **Propietario**
- **Gestor**
- **Ejecutor de tareas**
- **Invitado**

A continuación se describen en detalle cada rol y sus permisos.

### Propietario {#owner}

- **Permisos completos**<br />
  Los Propietarios pueden hacer cualquier cosa dentro del proyecto, incluida la gestión de roles, agregar o eliminar miembros y configurar cualquier ajuste del proyecto.

- **Varios propietarios**<br />
  Un proyecto puede tener varios Propietarios, lo que garantiza que haya más de una persona con privilegios completos.

- **Restricciones para eliminarse a sí mismo**<br />
  Un Propietario no puede eliminarse a sí mismo si es el único Propietario del proyecto. Esto evita que el proyecto se quede sin Propietario.

- **Gestión de otros propietarios**<br />
  Los Propietarios pueden gestionar (incluido eliminar o cambiar los roles de) a todos los miembros del equipo, incluidos otros Propietarios.

### Gestor {#manager}

- **Amplio control del proyecto:** Los Gestores tienen casi los mismos permisos que los Propietarios, lo que les permite encargarse de la mayoría de las tareas diarias y gestionar el entorno del proyecto.

- Los Gestores **no pueden**:
  - Eliminar el proyecto.
  - Eliminar o cambiar los roles de los Propietarios.

- **Caso de uso típico:** Asigne el rol de Gestor a miembros sénior del equipo que necesiten un acceso amplio pero no requieran la autoridad para eliminar el proyecto o gestionar a los Propietarios.

### Ejecutor de tareas {#task-runner}

- **Ejecutar tareas:** Los Ejecutores de tareas pueden ejecutar cualquier plantilla de tarea que exista en el proyecto.

- **Solo lectura para el resto de recursos:** Aunque pueden ejecutar tareas, solo tienen acceso de lectura a otros recursos como el inventory, las variables, los repositorios, etc.

- **Caso de uso típico:** Desarrolladores o ingenieros de QA que necesitan lanzar y supervisar tareas, pero no necesitan la capacidad de modificar la configuración del proyecto ni gestionar la pertenencia al equipo.

### Invitado {#guest}

- **Acceso de solo lectura:** Los Invitados tienen acceso de solo lectura a todos los recursos del proyecto (por ejemplo, ver registros, inventories, paneles de control).

- **Sin permisos de escritura:** No pueden modificar ajustes, ejecutar tareas ni cambiar roles.

- **Caso de uso típico:** Partes interesadas u otros colaboradores que solo necesitan ver el estado y los detalles del proyecto sin realizar cambios.

---

## RBAC extendido <Enterprise /> {#extended-rbac-enterprise}

:::info
El RBAC extendido está disponible en la edición **Semaphore Enterprise**, a partir de [Semaphore v2.17](https://semaphoreui.com/releases/semaphore-v2_17).
:::

El RBAC extendido añade permisos adicionales por encima de los cuatro roles integrados. Los propios roles integrados no cambian. Si no define roles personalizados, cada proyecto se comporta exactamente igual que en la edición comunitaria.

Con el RBAC extendido, los roles personalizados pueden conceder permisos individuales a nivel de proyecto. También puede conceder a un rol permisos sobre plantillas de tareas seleccionadas. Esto le permite dar a un miembro del equipo acceso a las plantillas que necesita sin ascenderlo a un rol integrado superior.

### Roles personalizados {#custom-roles}

Un rol personalizado es un conjunto de permisos con nombre que complementa el rol de proyecto integrado de un miembro. Cada miembro del equipo conserva su rol integrado. Los roles personalizados le añaden permisos.

Los roles personalizados están disponibles en dos ámbitos:

- Los **roles globales** se definen a nivel de instancia y pueden utilizarse en cualquier proyecto.
- Los **roles de proyecto** se definen dentro de un único proyecto y solo están disponibles en ese proyecto.

### Niveles de permisos {#permission-levels}

Los roles personalizados conceden permisos en dos niveles:

- Los **permisos a nivel de proyecto** amplían el acceso de un usuario en todo el proyecto. Se eligen al crear el rol.
- Los **permisos de plantilla** controlan las acciones sobre una plantilla de tarea concreta. Se eligen en la pestaña **Permisos** de esa plantilla después de agregar el rol a la plantilla.

### Crear un rol personalizado {#create-a-custom-role}

Elija el ámbito antes de abrir el formulario del rol.

#### Rol global {#global-role}

Los roles globales se crean una sola vez y pueden asignarse a usuarios en cualquier proyecto. Solo un administrador de la instancia puede crear un rol global.

Abra el menú de administración de la parte inferior izquierda y seleccione **Roles**.

En la lista de roles de toda la instancia, seleccione **Nuevo rol**.

![Abra Roles desde el menú de administrador y luego seleccione Nuevo rol](/assets/custom-roles-navigation-to-new-role-annotated-v4.png)

#### Rol de proyecto {#project-role}

Los roles de proyecto solo están disponibles en el proyecto en el que se crean. Los Propietarios y Gestores del proyecto pueden crearlos.

1. Abra el proyecto y vaya a **Equipo** > **Roles**.
2. Seleccione **Nuevo rol**.

La pestaña **Roles** está vacía hasta que se crea el primer rol de proyecto. Muestra todos los roles del proyecto y contiene el botón **Nuevo rol**.

![](https://www.semaphoreui.com/uploads/v2.17/roles1.webp)

### Configurar un rol personalizado {#configure-a-custom-role}

Ambas vías abren el mismo formulario de rol. Configure el rol para que se ajuste al acceso que necesita el miembro de su equipo.

![Diálogo Nuevo rol con campos y casillas de permisos](/assets/custom-roles-global-role-form.jpg)

| Campo | Descripción |
| --- | --- |
| **Nombre** | Una etiqueta legible para el rol. |
| **Slug** | Un identificador técnico único que se usa para hacer referencia al rol. Utilice letras minúsculas, números, guiones bajos o guiones, por ejemplo `release_operator`. |
| **Permisos** | Los permisos a nivel de proyecto que concede el rol. |

#### Permisos a nivel de proyecto {#project-wide-permissions}

Elija solo los permisos a nivel de proyecto que necesita el rol:

| Permiso | Descripción |
| --- | --- |
| **Puede ejecutar tareas del proyecto** | Ejecutar tareas del proyecto. |
| **Puede actualizar el proyecto** | Editar la información básica del proyecto en **Panel de control** > **Configuración**. |
| **Puede gestionar los recursos del proyecto** | Gestionar los recursos del proyecto, como plantillas de tareas, repositorios, inventory, entornos, entradas del almacén de claves, programaciones, integraciones y runners. Se trata de un acceso a nivel de proyecto. No puede limitarse a recursos individuales que no sean plantillas. |
| **Puede gestionar los usuarios del proyecto** | Gestionar la pertenencia al proyecto y la asignación de roles. |

Los permisos a nivel de proyecto no pueden limitarse a un único inventory, repositorio, entorno o entrada del almacén de claves. Las plantillas de tareas son el único tipo de recurso que admite asignaciones de roles granulares.

:::tip Acceso solo a plantillas
Para crear un rol granular que añada acceso únicamente a plantillas de tareas seleccionadas, deje sin marcar todos los permisos a nivel de proyecto. El rol entonces no añade permisos a nivel de proyecto por sí mismo. Agréguelo a las plantillas necesarias y elija solo las acciones que ese rol necesita en ellas.
:::

Seleccione **Guardar** cuando la configuración del rol esté lista.

### Configurar el acceso a plantillas de tareas específicas {#configure-access-to-specific-task-templates}

Los permisos de plantilla añaden acceso sobre plantillas de tareas seleccionadas. El ejemplo siguiente utiliza un rol personalizado sin permisos a nivel de proyecto. Esta configuración de mínimo privilegio es útil cuando un miembro del equipo solo necesita determinadas acciones sobre plantillas. También puede añadir permisos de plantilla a un rol que ya concede acceso a nivel de proyecto.

**Abra la plantilla necesaria**

1. Abra **Plantillas de tareas** y seleccione la plantilla de destino.
2. Abra la pestaña **Permisos**.

La pestaña **Permisos** muestra los roles ya agregados a la plantilla.

![](https://www.semaphoreui.com/uploads/v2.17/roles2.webp)

**Agregue el rol y conceda permisos de plantilla**

1. Seleccione **Agregar rol** y elija el rol personalizado que desea agregar a esta plantilla.
2. Seleccione solo los permisos de plantilla que necesita el rol, como **Puede ejecutar tareas** o **Puede actualizar la plantilla**.

Este ejemplo utiliza un rol creado previamente sin permisos a nivel de proyecto. Puede elegir cualquier rol personalizado que esté disponible en el proyecto.

![Diálogo de permisos de plantilla con los controles necesarios resaltados](/assets/custom-roles-template-permissions-annotated.png)

Para conceder al mismo rol acceso a plantillas adicionales, repita estos pasos para cada plantilla.

:::note Acceso existente al proyecto
Los permisos de plantilla son aditivos. Añaden acceso sin reemplazar ni reducir el acceso derivado del rol integrado del usuario o de otros roles personalizados. Si un usuario ya puede ejecutar o actualizar todas las plantillas de tareas, agregar un rol específico de plantilla no restringe ese acceso.
:::

### Asignar un rol personalizado en un proyecto {#assign-a-custom-role-in-a-project}

Después de crear y configurar un rol global o de proyecto, asígnelo al miembro del equipo correspondiente:

1. Abra el proyecto y vaya a **Equipo**.
2. Despliegue **Roles** junto al usuario correspondiente.
3. Seleccione el rol personalizado.

### No admitido actualmente {#not-currently-supported}

- **Asignación de grupos LDAP / OIDC.** Los roles personalizados se asignan por usuario. No se admite la asignación de grupos de directorios externos a roles personalizados.
- **Permisos granulares para recursos que no son plantillas.** Actualmente, solo las plantillas pueden regirse por roles personalizados a nivel de recurso individual.

---

## Gestión de los miembros del equipo {#managing-team-members}

- **Invitar a nuevos miembros:** Los **Propietarios** y **Gestores** pueden invitar a nuevos usuarios a unirse al equipo y asignarles un rol inicial.

- **Cambiar roles:** Los Propietarios siempre pueden cambiar los roles de cualquier miembro del equipo. Los Gestores pueden cambiar los roles de los **Ejecutores de tareas** y los **Invitados**, pero **no** los de otros Gestores o Propietarios.

- **Eliminar miembros:** Los Propietarios y Gestores pueden eliminar a los miembros del equipo con roles inferiores.
  - Un Propietario puede eliminar a cualquiera (incluidos otros Propietarios), pero no puede eliminarse a sí mismo si es el único Propietario.
  - Un Gestor puede eliminar a **Ejecutores de tareas** e **Invitados**, pero **no** a otros Gestores o Propietarios.

---

## Buenas prácticas {#best-practices}

1. **Mantenga la redundancia:** Asigne el rol de **Propietario** a al menos dos personas para garantizar el acceso continuo y evitar un punto único de fallo.
2. **Siga el principio de mínimo privilegio:**
   - Otorgue a los miembros del equipo el rol mínimo necesario para sus tareas.
   - Utilice los roles **Ejecutor de tareas** o **Invitado** para quienes solo necesiten permisos limitados.
   - En Enterprise, prefiera los [roles personalizados](#extended-rbac-enterprise) para conceder acceso a plantillas específicas en lugar de elevar el rol integrado de un miembro.
3. **Revise la pertenencia periódicamente:**
   - A medida que cambie la estructura del equipo, vuelva a evaluar los roles.
   - Revoque el acceso o reduzca los roles de los usuarios que ya no necesiten privilegios elevados.
4. **Utilice gestores para la administración diaria:**
   - Reserve el rol de Propietario para un grupo reducido con la máxima autoridad.
   - Delegue las tareas rutinarias de gestión del proyecto en los Gestores para reducir el riesgo de cambios importantes accidentales o de eliminaciones del proyecto.

---

## Preguntas frecuentes {#frequently-asked-questions}

### 1. ¿Puede un Propietario eliminar a otro Propietario? {#1-can-an-owner-remove-another-owner}
Sí, un Propietario puede eliminar o cambiar el rol de cualquier otro Propietario, a menos que sea el único Propietario que queda en el proyecto.

### 2. ¿Quién puede eliminar el proyecto? {#2-who-can-delete-the-project}
Solo los **Propietarios** pueden eliminar un proyecto.

### 3. ¿Pueden los Gestores agregar o eliminar a otros Gestores? {#3-can-managers-add-or-remove-other-managers}
No. Los Gestores solo pueden agregar o eliminar usuarios con los roles **Ejecutor de tareas** o **Invitado**. Para gestionar Propietarios u otros Gestores, debe ser Propietario.

### 4. ¿Qué ocurre si elimino a todos los Propietarios por accidente? {#4-what-happens-if-i-remove-all-owners-by-accident}
Semaphore UI impide la eliminación de un Propietario si ello dejara al proyecto sin ningún Propietario. Debe haber al menos un Propietario en todo momento.

### 5. ¿Pueden los Invitados ejecutar tareas? {#5-can-guests-run-tasks}
No. Los Invitados tienen acceso de solo lectura y no pueden lanzar ni gestionar tareas. En la edición Enterprise puede conceder a un Invitado permiso para ejecutar plantillas individuales mediante un [rol personalizado](#extended-rbac-enterprise).

### 6. ¿Los roles personalizados reemplazan a los roles integrados? {#6-do-custom-roles-replace-the-built-in-roles}
No. Los roles personalizados amplían los roles integrados con permisos adicionales a nivel de proyecto y de plantilla. Cada miembro del equipo sigue teniendo exactamente un rol integrado.

### 7. ¿Está disponible el RBAC extendido en la edición comunitaria? {#7-is-extended-rbac-available-in-the-community-edition}
No. El RBAC extendido requiere una suscripción a **Semaphore Enterprise**.
