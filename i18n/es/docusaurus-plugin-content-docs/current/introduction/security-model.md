---
title: Modelo de seguridad
description: Qué protege Semaphore, las fronteras de confianza de una instalación, quién puede hacer que se ejecute código y qué decisiones quedan en tus manos.
---

# Modelo de seguridad

Semaphore guarda las credenciales de tu infraestructura y ejecuta código contra ella. De ahí
se derivan dos propiedades, y ambas condicionan todas las demás decisiones de esta página:
**los secretos nunca deben viajar de vuelta a un navegador** y **cualquiera que pueda iniciar
una tarea puede ejecutar código en las máquinas a las que llega esa tarea**.

Esta página explica el modelo. Para los ajustes que lo implementan, consulta
[Seguridad](/admin-guide/security).

## Fronteras de confianza {#trust-boundaries}

| Frontera | La cruzan | Está protegida por |
|---|---|---|
| Navegador ↔ servidor | Sesiones, tokens de API | TLS, cookies seguras, [proxy inverso](/admin-guide/reverse-proxy) |
| Servidor ↔ base de datos | Todo el estado persistente | Restricción de red; secretos cifrados antes de escribirse |
| Servidor ↔ runner | Cargas de trabajo, incluidos los secretos | HTTPS y un token bearer por runner |
| Tarea ↔ hosts gestionados | Tu automatización | Las claves que diste a la plantilla |

Una tarea está al otro lado de todas esas fronteras. Recibe en su entorno los secretos que
necesita y, a partir de ese momento, el código de tu repositorio decide qué ocurre con ellos.

## Identidad {#identity}

Los usuarios se autentican de una de estas tres formas, y las tres terminan en la misma sesión:

- **Cuentas locales.** Las contraseñas se cifran con Argon2id (bcrypt antes de la 2.20, con
  actualización en el primer inicio de sesión). Se puede exigir autenticación de dos factores TOTP.
- **[LDAP o Active Directory](/admin-guide/ldap).** El directorio verifica la contraseña;
  Semaphore conserva solo la cuenta.
- **[OpenID Connect](/admin-guide/openid).** El proveedor autentica y Semaphore asigna los
  claims a los usuarios.

El acceso no interactivo usa **tokens de API** creados por un usuario, que llevan los permisos
de ese usuario. Los runners no usan identidad de usuario en absoluto: se autentican con su
propio token emitido en el registro.

Las tareas también pueden llevar identidad. Con los [JWT de tarea](/user-guide/task-templates/jwt),
una ejecución recibe un token firmado de corta duración que identifica el proyecto, la plantilla
y el usuario, y que un almacén de secretos externo puede verificar en lugar de que tú guardes
una credencial de larga duración.

## Autorización {#authorization}

Existen dos niveles y son independientes.

**Nivel de servidor.** Un administrador gestiona usuarios, runners globales y ajustes del
servidor. Ser administrador del servidor no otorga por sí mismo pertenencia a un proyecto.

**Nivel de proyecto.** Cada miembro tiene un rol en cada proyecto:

| Rol | Puede |
|---|---|
| **Owner** | Todo dentro del proyecto, incluidos los miembros y su eliminación. |
| **Manager** | Ejecutar tareas y gestionar recursos y plantillas. |
| **Task Runner** | Ejecutar tareas. Nada más. |
| **Guest** | Leer. |

Enterprise añade [roles personalizados](/user-guide/team) <FeatureState feature="extended-rbac" />
cuando esos cuatro resultan demasiado gruesos.

La línea que importa para la seguridad pasa entre **Task Runner** y **Manager**.
Un Manager puede cambiar lo que ejecuta una plantilla y, por tanto, puede ejecutar código
arbitrario con las credenciales de ese proyecto. Un Task Runner solo puede iniciar lo que ya
existe — salvo que la plantilla exponga peticiones o variables de encuesta que lleguen a la
línea de comandos, en cuyo caso el autor de la plantilla ha ampliado esa frontera deliberadamente.

## Secretos {#secrets}

Los valores secretos — claves privadas SSH, contraseñas, tokens, variables secretas — se cifran
con la clave de `access_key_encryption` antes de almacenarse, de modo que un volcado de la base
de datos por sí solo no los revela. La API nunca devuelve un valor secreto; la interfaz muestra
que un secreto está definido, no cuál es.

Los secretos llegan a una tarea a través de su entorno en el momento en que se inicia. Por eso
conviene tratar la salida de las tareas como información sensible: un playbook que imprime una
variable la imprime en un registro que otros miembros del proyecto pueden leer.

Si prefieres no guardar los secretos en absoluto, los
[almacenamientos de secretos externos](/user-guide/key-store) mantienen los valores en HashiCorp
Vault, OpenBao, AWS Secrets Manager o Devolutions Server y los recuperan en cada ejecución.

## Ejecutar código no confiable {#executing-untrusted-code}

Con la configuración predeterminada, una tarea es un proceso en el servidor de Semaphore, con el
sistema de archivos y el acceso de red del servidor. Eso es adecuado cuando todo el que puede
editar una plantilla ya es de confianza para el servidor.

Cuando no lo es, aleja la ejecución del servidor:

- Un [runner](/admin-guide/runners) coloca las tareas en otra máquina, de modo que comprometer
  una tarea no compromete el servicio web ni la base de datos.
- El ejecutor **Docker** o **Kubernetes** da a cada trabajo un contenedor o Pod nuevo, así que
  una ejecución no puede leer los archivos de otra ejecución ni los del host.
- Separar proyectos con claves separadas hace que una tarea solo pueda llegar hasta donde
  permitan las credenciales de su propio proyecto.

:::warning
Un repositorio que un miembro del proyecto puede cambiar es código que se ejecutará con las
credenciales de ese proyecto. Protege la rama desde la que compila una plantilla, o apunta las
plantillas a una rama en la que solo puedan escribir los revisores.
:::

## Qué queda en tus manos {#what-is-left-to-you}

Semaphore es autoalojado, así que partes del modelo te corresponden a ti:

- TLS delante del servicio, ya sea integrado o mediante un [proxy inverso](/admin-guide/reverse-proxy).
- Restricción de red de la base de datos y de la superficie de administración del servidor.
- Copias de seguridad de la base de datos y de `access_key_encryption` — la segunda es inútil
  sin la primera, y la primera es ilegible sin la segunda.
- Mantener la versión actualizada. Informa de vulnerabilidades a `security@semaphoreui.com`.

## Qué sigue {#whats-next}

- [Seguridad](/admin-guide/security) — los ajustes concretos, los parámetros de hashing y los pasos de fortificación.
- [Arquitectura](/introduction/architecture) — los componentes que separan estas fronteras.
- [Equipos](/user-guide/team) — asignación de roles en un proyecto.
