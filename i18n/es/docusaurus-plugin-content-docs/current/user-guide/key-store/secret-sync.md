# Sincronización de secretos desde almacenamientos remotos

Semaphore puede conectarse a un gestor de secretos externo — como **HashiCorp Vault**, **OpenBao**, **AWS Secrets Manager**, **Azure Key Vault** o **Devolutions Server (DVLS)** — e importar automáticamente sus secretos al Almacén de claves. En lugar de copiar credenciales a mano en Semaphore y mantenerlas actualizadas, apunta Semaphore a su almacenamiento remoto y este mantiene una réplica local por usted.

Las **rutas de sincronización** son las reglas que indican a Semaphore *qué* secretos importar desde un almacenamiento remoto y *cómo* nombrarlos una vez importados. Un gestor de secretos puede contener miles de secretos repartidos en muchas carpetas; las rutas de sincronización le permiten seleccionar solo los subárboles que le interesan y controlar el nombre de las claves que se crean.

## Conceptos clave {#key-concepts}

- **Almacenamiento remoto** — una conexión configurada a un gestor de secretos externo, que incluye su dirección y la credencial que Semaphore usa para leer de él.
- **Sincronización** — el proceso de leer secretos del almacenamiento remoto y conciliarlos con las claves guardadas en Semaphore.
- **Ruta de sincronización** — una única regla de importación, compuesta por una *ruta*, un *prefijo* y un *separador*.

## Cómo funciona una ruta de sincronización {#how-a-sync-path-works}

Cada ruta de sincronización tiene tres campos:

- **Ruta** — la ubicación del almacenamiento remoto desde la que importar. Es la carpeta base, el prefijo o el subárbol que Semaphore lista y lee. Todo lo que se encuentre debajo se convierte en candidato para la importación.
- **Prefijo** — una cadena que se añade al principio de cada nombre de clave generado. Úselo para dar un espacio de nombres a los secretos importados y evitar que colisionen con claves de otras rutas u otros almacenamientos (por ejemplo, `prod-`).
- **Separador** — el carácter usado para unir las partes de la ubicación remota de un secreto en un único nombre de clave. Como un secreto remoto puede estar varias carpetas por debajo, el separador determina cómo se aplana esa jerarquía en un nombre legible.

Cuando se ejecuta una sincronización, Semaphore recorre la **ruta** y, para cada secreto que encuentra, construye un nombre de clave combinando la ubicación del secreto con el **separador** y anteponiendo el **prefijo**. El tipo de clave creada (clave SSH, usuario/contraseña o cadena secreta simple) se infiere automáticamente a partir de la forma del secreto remoto.

Puede definir **varias rutas de sincronización** en un mismo almacenamiento. Cada ruta se importa de forma independiente, de modo que puede extraer secretos de varias áreas no relacionadas del mismo gestor de secretos y asignar a cada una su propio prefijo y estilo de nomenclatura.

:::tip
Se aplican valores predeterminados razonables para cada proveedor — por ejemplo, HashiCorp Vault, OpenBao y AWS Secrets Manager usan `/` como separador predeterminado, Azure Key Vault `-` y Devolutions Server `\` —, de modo que en la mayoría de los casos solo necesita rellenar la ruta.
:::

## Ejecución de una sincronización {#running-a-sync}

Una sincronización puede producirse de dos formas:

1. **Manualmente.** Abra el almacenamiento y use la acción **Sincronizar ahora**. Semaphore concilia de inmediato ese almacenamiento con sus rutas de sincronización configuradas. Es útil para una primera importación o para incorporar un cambio de inmediato.
2. **Automáticamente, de forma programada.** Habilite **Sincronizar claves** para el almacenamiento y establezca un **intervalo de sincronización** en minutos. Semaphore volverá a ejecutar la sincronización con esa cadencia en segundo plano. Un intervalo de `0` desactiva la sincronización automática y deja solo la opción manual.

Cada almacenamiento registra cuándo se sincronizó por última vez y si el último intento falló, de modo que siempre puede ver el estado de la réplica.

:::note
En un despliegue de alta disponibilidad, las sincronizaciones automáticas se coordinan entre nodos, de modo que una sincronización dada se ejecuta en un solo nodo a la vez; no obtendrá importaciones duplicadas.
:::

## Qué hace la sincronización con sus claves {#what-syncing-does-to-your-keys}

Una sincronización es una **réplica completa**, no una copia única. En cada ejecución, Semaphore concilia el almacenamiento remoto con las claves que importó previamente:

- Los secretos **nuevos** encontrados bajo una ruta de sincronización se crean como claves.
- Las claves importadas **existentes** se **actualizan** para coincidir con el valor remoto actual.
- Las claves importadas anteriormente que **ya no existen** en el almacenamiento remoto se **eliminan**.

Solo se tocan las claves que Semaphore importó; las claves que creó manualmente nunca se modifican ni se eliminan durante una sincronización.

:::warning
Dado que las claves importadas son copias gestionadas de los secretos remotos, eliminar un almacenamiento (o desactivar su sincronización) también elimina las claves que provienen de él.
:::

## Dos ámbitos: claves compartidas y variables de entorno {#two-scopes-shared-keys-and-environment-variables}

Las rutas de sincronización pueden configurarse en dos lugares:

- **Nivel de almacenamiento** — los secretos importados se convierten en **claves compartidas**, disponibles en todo el proyecto allí donde se usen claves.
- **Nivel de entorno** — un [grupo de variables](/user-guide/environment) puede apuntar a un almacenamiento y a sus rutas de sincronización para importar secretos como **variables de entorno** limitadas a ese grupo.

La mecánica es idéntica; solo cambia el destino de los secretos importados.

## Notas y limitaciones {#notes-and-limitations}

- La sincronización solo se admite para tipos de almacenamiento **externos** (HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault, Devolutions Server). El almacenamiento **Base de datos** integrado guarda los secretos de forma nativa y no tiene nada que sincronizar.
- La propia credencial del almacenamiento remoto (el token o la clave que Semaphore usa para autenticarse) se guarda de forma segura y separada de los secretos que importa.
- Si se desactiva la sincronización y no quedan rutas, la configuración de sincronización de ese almacenamiento se borra.
