# Almacenamiento de secretos en AWS Secrets Manager

<Enterprise />

Semaphore UI Enterprise puede usar **AWS Secrets Manager** como almacenamiento externo para los secretos del Almacén de claves en lugar de la base de datos.

## Opciones de configuración {#configuration-options}

Al crear un almacenamiento **AWS Secrets Manager** en **Almacén de claves → Almacenamientos**, configure:

| Campo | Descripción |
|-------|-------------|
| **Región** | Región de AWS donde residen los secretos (por ejemplo `us-east-1`). Obligatorio. |
| **URL del endpoint** | Endpoint personalizado opcional. Déjelo vacío para usar el endpoint estándar de la API de AWS. Útil para LocalStack o endpoints de VPC. |
| **Usar rol IAM / perfil de instancia** | Cuando está habilitado, Semaphore usa la cadena de credenciales de AWS del entorno (perfil de instancia EC2, rol de tarea ECS, IRSA de EKS, etc.) y no requiere claves de acceso estáticas. |
| **ID de clave de acceso** | Obligatorio cuando el modo de rol IAM está desactivado. |
| **Clave de acceso secreta** | Obligatoria cuando el modo de rol IAM está desactivado. Puede guardarse en la base de datos, leerse desde una variable de entorno o cargarse desde un archivo. |

### Rol IAM frente a claves de acceso {#iam-role-vs-access-keys}

- **Rol IAM / perfil de instancia** (recomendado en AWS): habilite **Usar rol IAM / perfil de instancia** y conceda al servidor de Semaphore o al host del runner permiso para leer los secretos a los que hace referencia. No se guardan claves de larga duración en Semaphore.
- **Claves de acceso**: deje la casilla desmarcada y proporcione un par de claves de acceso de un usuario o rol IAM con `secretsmanager:GetSecretValue` (y los permisos relacionados de listado/descripción para la sincronización).

Al editar un almacenamiento existente, Semaphore asume el modo de rol IAM si no se guardó ningún ID de clave de acceso.

## Cómo usarlo {#how-to-use}

1. En su proyecto, abra **Almacén de claves → Almacenamientos** y cree un almacenamiento **AWS Secrets Manager**.
2. Al crear o editar una clave, seleccione ese almacenamiento y proporcione el nombre del secreto o su ARN en AWS Secrets Manager.
3. Opcionalmente, configure [rutas de sincronización](/user-guide/key-store/secret-sync) para importar secretos automáticamente de forma programada.

El almacenamiento puede funcionar en modo de solo lectura.

## Sincronización de secretos {#syncing-secrets}

Los secretos de AWS Secrets Manager pueden importarse al Almacén de claves y mantenerse sincronizados como con otros almacenamientos externos. El separador de ruta predeterminado es `/`. Consulte [Sincronización de secretos desde almacenamientos remotos](/user-guide/key-store/secret-sync).
