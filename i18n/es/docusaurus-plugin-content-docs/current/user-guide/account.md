# Su cuenta

Sus ajustes personales se encuentran en el menú de la cuenta, en la parte inferior de la barra lateral. Haga clic en su nombre para abrirlo.

<div class="DialogScreenshot" style={{maxWidth: 300}}>
![Menú de la cuenta](/assets/user-menu.webp)
</div>

| Elemento | Descripción |
|---|---|
| Versión | La versión de Semaphore UI que se está ejecutando en el servidor. |
| **Tokens de API** | Tokens personales para la [API REST](/reference/api). |
| **Editar cuenta** | Su nombre, nombre de usuario, correo electrónico, preferencia de alertas y contraseña. |
| **Cerrar sesión** | Finaliza la sesión. |

Junto al menú encontrará el interruptor de **modo oscuro** y el selector de **idioma**. Ambos ajustes se guardan en su navegador.

## Editar cuenta {#edit-account}

<div class="DialogScreenshot">
![Diálogo de edición de la cuenta](/assets/account-edit.webp)
</div>

La pestaña **Ajustes** contiene:

| Campo | Descripción |
|---|---|
| **Nombre** | Nombre visible que se muestra en el historial de tareas y en la actividad. |
| **Nombre de usuario** | Nombre de inicio de sesión. |
| **Correo electrónico** | Dirección usada para las alertas por correo y la recuperación de contraseña. |
| **Enviar alertas** | Recibir alertas por correo sobre las tareas. Las alertas solo se envían si el [canal de correo electrónico](/admin-guide/notifications/email) está configurado y el proyecto permite alertas. |

Las etiquetas situadas junto a las casillas muestran sus indicadores globales: **Usuario Pro** en una instancia Pro, **Administrador** para los administradores y **Externo** para las cuentas gestionadas por LDAP u OpenID Connect. Los usuarios externos no pueden cambiar aquí su nombre de usuario ni su contraseña.

La pestaña **Seguridad** le permite cambiar su contraseña. Si el administrador ha habilitado las contraseñas de un solo uso basadas en tiempo, el segundo factor se configura en esta misma pestaña.

<div class="DialogScreenshot">
![Pestaña de seguridad](/assets/account-security.webp)
</div>

## Tokens de API {#api-tokens}

Elija **Tokens de API** en el menú de la cuenta. La página muestra la lista de sus tokens con su fecha de creación, fecha de caducidad y estado. El enlace **Referencia de la API** abre la interfaz de Swagger integrada en su instancia.

![Tokens de API](/assets/api-tokens.webp)

Haga clic en **Nuevo token**, asigne un nombre al token y elija cuándo caduca. El valor del token se muestra una sola vez tras la creación, cópielo de inmediato.

<div class="DialogScreenshot">
![Diálogo de nuevo token](/assets/api-token-new.webp)
</div>

Use el token en la cabecera `Authorization: Bearer`, consulte [API](/reference/api). Para revocar un token, elimínelo de la lista.
