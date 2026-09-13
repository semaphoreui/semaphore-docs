# Migraciones de la base de datos

El comando `semaphore migrate` actualiza o revierte el esquema de la base de datos de Semaphore
para que coincida con una versión concreta de Semaphore. Úselo para actualizaciones y reversiones de versión.

```bash
semaphore migrate --help
```

:::info
Rara vez necesitará ejecutar `migrate` manualmente. `semaphore server`, `semaphore setup`
y cualquier otro comando de la CLI que acceda a la base de datos aplican automáticamente las
migraciones pendientes antes de ejecutarse. `migrate` sirve para aplicar migraciones sin
iniciar el servidor, o para revertirlas.
:::

:::warning
Haga siempre una copia de seguridad de la base de datos antes de aplicar o revertir migraciones.
:::

## Aplicar migraciones {#applying-migrations}

Aplique todas las migraciones pendientes y actualice la base de datos:

```bash
semaphore migrate --config /path/to/config.json
```

Aplique migraciones solo hasta una versión concreta:

```bash
semaphore migrate --apply-to 2.15.1
```

## Revertir migraciones {#rolling-back-migrations}

Deshaga las migraciones hasta una versión anterior:

```bash
semaphore migrate --undo-to 2.13
```

Use la versión de Semaphore a la que va a retroceder. El binario con el que ejecute `migrate`
debe conocer todas las migraciones que se van a deshacer, así que ejecútelo con el binario
**más reciente** antes de instalar el antiguo.

## Opciones {#options}

| Opción | Descripción |
|------|-------------|
| `--apply-to <version>` | Aplica las migraciones hasta esta versión inclusive (p. ej. `2.15` o `2.14.4`). |
| `--undo-to <version>` | Revierte las migraciones hasta esta versión. |

`--apply-to` y `--undo-to` son mutuamente excluyentes; pasar ambas es un error.
Sin ninguna de las dos opciones, se aplican todas las migraciones pendientes.

Al finalizar, el comando muestra la conexión a la base de datos que ha utilizado.

:::note
`semaphore migrate` sigue aceptando `--err-log-size`, `--skip-task-output` y
`--merge-existing-users` por compatibilidad con versiones anteriores, pero en 2.19 y posteriores
no tienen ningún efecto. Pertenecían a la importación desde BoltDB descrita a continuación.
:::

## Migración de BoltDB a SQLite/MySQL/PostgreSQL {#migration-from-boltdb-to-sqlitemysqlpostgresql}

*Disponible únicamente en las versiones 2.17 y 2.18*

BoltDB quedó obsoleto a partir de la versión 2.16, y **su soporte se eliminó en la
versión 2.19**. La opción `--from-boltdb` y la variable de entorno `SEMAPHORE_MIGRATE_FROM_BOLTDB`
ya no existen en 2.19+, y `semaphore setup` se niega a
configurar una base de datos BoltDB.

:::warning
Si todavía utiliza BoltDB, migre **antes** de actualizar a 2.19 o posterior.
Instale Semaphore **2.17 o 2.18**, realice la migración descrita a continuación y solo entonces
actualice a una versión más reciente.
:::

Para migrar, instale primero Semaphore versión 2.17 o 2.18 y, a continuación, configure la
base de datos de destino (SQLite, MySQL o PostgreSQL) en su `config.json`. Después,
ejecute el siguiente comando para importar todos los datos del antiguo archivo BoltDB
a la nueva base de datos:

```bash
semaphore migrate --from-boltdb /path/to/boltdb/file --config /path/to/config.json
```

El comando lee todos los proyectos, plantillas, inventarios, repositorios, claves,
usuarios e historial de tareas desde BoltDB y los escribe en la base de datos especificada
en la configuración actual de Semaphore. El archivo BoltDB original no se
modifica.

Argumentos adicionales (solo 2.17 y 2.18):

| Opción | Descripción |
|------|-------------|
| `--err-log-size <n>` | Número máximo de líneas de error mostradas en la salida. |
| `--skip-task-output` | No importar las salidas de las tareas. |
| `--merge-existing-users` | Reutilizar los usuarios existentes coincidentes por nombre de usuario en lugar de fallar por conflicto. |

Si usa el contenedor Docker de Semaphore UI, puede definir la variable de entorno
`SEMAPHORE_MIGRATE_FROM_BOLTDB` para importar automáticamente la
base de datos BoltDB existente. La importación se ejecuta una sola vez, en el primer arranque del
contenedor. Ejemplo:

```bash
docker run --name semaphore \
  -p 3000:3000 \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME="Admin" \
  -e SEMAPHORE_MIGRATE_FROM_BOLTDB=/var/lib/semaphore/database.boltdb \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -v semaphore_data:/var/lib/semaphore \
  -d semaphoreui/semaphore:v2.18.2
```

## Resolución de problemas {#troubleshooting}

- Si una migración falla, revise los registros para obtener detalles y asegúrese de que el binario de la CLI
  tiene la misma versión que el servidor de Semaphore.
- Asegúrese de que la CLI usa el mismo archivo de configuración (y, por tanto, la misma
  base de datos) que el servidor. Consulte
  [Cómo se localiza el archivo de configuración](/reference/cli#how-the-configuration-file-is-found).
