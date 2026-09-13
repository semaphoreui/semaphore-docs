# 🔐 Seguridad

## Introducción {#introduction}

La seguridad es una prioridad absoluta en Semaphore UI. Tanto si automatiza tareas de infraestructura críticas como si gestiona el acceso de su equipo a sistemas sensibles, Semaphore UI está diseñado para ofrecer operaciones sólidas y seguras desde el primer momento. Esta sección describe cómo gestiona Semaphore la seguridad y qué debe tener en cuenta al desplegarlo en producción.

## Autenticación y autorización {#authentication--authorization}

Semaphore admite mecanismos de autenticación seguros y de autorización flexibles:

- **Métodos de inicio de sesión:**
  - **Usuario/contraseña**<br />Método predeterminado que usa credenciales almacenadas en la base de datos de Semaphore. Las contraseñas nunca se guardan en texto plano; se cifran con Argon2id (consulte [Cifrado de contraseñas](#password-hashing)).

  - **LDAP**<br />Permite la integración con servicios de directorio corporativos. Admite el filtrado de usuarios y grupos, así como conexiones seguras mediante LDAPS.

  - **OpenID Connect (OIDC)**<br />Habilita el inicio de sesión único con proveedores de identidad como Google, Azure AD o Keycloak. Admite reclamaciones personalizadas y asignación de grupos.

- **Autenticación de dos factores (2FA)**<br />La 2FA basada en TOTP está disponible y se recomienda para todos los usuarios. Puede activarse por usuario y admite códigos de recuperación opcionales. Consulte las opciones de configuración `mfa.totp.enabled` y `mfa.totp.allow_recovery`.

- **Control de acceso basado en roles**<br />Puede asignar distintos roles a los usuarios, como Admin, Maintainer o Viewer, limitando el acceso según su responsabilidad.

- **Gestión de sesiones**<br />Las sesiones se protegen con cookies HTTP seguras. Los mecanismos de caducidad de sesión y de cierre de sesión garantizan una exposición mínima.
<!-- - **Brute-Force Protection**: Login attempts are rate-limited to prevent brute-force attacks. -->

### Cifrado de contraseñas {#password-hashing}

:::info Desde la v2.20
El cifrado de contraseñas con Argon2id está disponible desde **Semaphore 2.20**. Las versiones anteriores usan bcrypt.
:::

Las contraseñas de los usuarios locales se cifran con **Argon2id**, el algoritmo recomendado por [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) para el almacenamiento de contraseñas. Semaphore usa los parámetros de robustez mínima de OWASP:

| Parámetro | Valor |
|-----------|-------|
| Memoria | 19 MiB (`m=19456`) |
| Iteraciones | 2 (`t=2`) |
| Paralelismo | 1 (`p=1`) |
| Sal | 16 bytes aleatorios por contraseña |
| Longitud del hash | 32 bytes |

Los hashes se almacenan en el [formato de cadena PHC](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md) estándar, por ejemplo `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>`, de modo que los parámetros usados en cada hash queden registrados junto a él.

Esto se aplica a todas las formas posibles de establecer una contraseña: la interfaz web, la API y los comandos de la CLI `semaphore user add`, `semaphore user change-by-login` y `semaphore setup`.

**Actualización desde versiones anteriores a la 2.20.** Las versiones anteriores a la 2.20 cifraban las contraseñas con bcrypt. No se requiere ningún paso de migración:

- Los hashes bcrypt existentes siguen aceptándose al iniciar sesión, por lo que todos los usuarios continúan funcionando tras la actualización.
- En el primer inicio de sesión correcto, la contraseña se vuelve a cifrar de forma transparente con Argon2id y el hash bcrypt se reemplaza.
- Si en una futura versión se refuerzan los parámetros de Argon2id de Semaphore, los hashes creados con los parámetros antiguos se actualizarán de la misma manera en el siguiente inicio de sesión.

Como el nuevo cifrado solo se produce al iniciar sesión, los usuarios que nunca vuelvan a iniciar sesión conservarán su hash bcrypt. Para forzar la actualización de esas cuentas, restablezca su contraseña con `semaphore user change-by-login --password ...` o desde la interfaz de administración.

:::note
Los códigos de recuperación de dos factores no son contraseñas de usuario y siguen usando bcrypt.
:::

## Secretos y credenciales {#secrets--credentials}

Gestionar los secretos de forma segura es una funcionalidad fundamental:

- **Almacén de claves cifrado**<br />Las credenciales y las variables secretas se cifran en reposo mediante cifrado AES.

- **Aislamiento del entorno**<br />Los secretos solo se pasan a los trabajos en tiempo de ejecución y no se exponen directamente al entorno del contenedor.

- **Claves SSH y tokens**<br />Los usuarios son responsables de subir claves SSH y tokens válidos. Estos se cifran y solo se usan al ejecutar tareas.
- **Integración con HashiCorp Vault (Pro)**<br />Los secretos pueden almacenarse en una instancia externa de Vault. Elija el almacenamiento de cada secreto al crearlo o editarlo.

## Cifrado de datos {#data-encryption}

Los datos sensibles se almacenan en la base de datos en forma cifrada. Debe establecer la opción de configuración `access_key_encryption` en el archivo de configuración para habilitar el cifrado de las claves de acceso. Debe generarse con el comando:

```bash
head -c32 /dev/urandom | base64
```

## Ejecución de código o playbooks no confiables {#running-untrusted-code--playbooks}

Semaphore ejecuta playbooks y comandos definidos por el usuario, lo que puede resultar arriesgado:

- **Aislamiento de la ejecución**<br />De forma predeterminada, una tarea es un proceso normal en el servidor de Semaphore, con su sistema de archivos y su acceso de red. El aislamiento es opcional: entregue la tarea a un [runner](/admin-guide/runners) configurado con el executor `docker` o `k8s` y cada tarea recibirá un contenedor o Pod nuevo que se descarta al terminar.

- **Privilegio mínimo**<br />Con los executors de Docker y Kubernetes usted elige la imagen, la red y la cuenta de servicio, de modo que la tarea recibe solo lo que necesita.

- **Ejecución en chroot**<br />Semaphore puede ejecutar tareas dentro de una jaula chroot para aislar todavía más el entorno de ejecución del sistema anfitrión.

- **Usuario del proceso de la tarea**<br />Las tareas pueden ejecutarse con un usuario del sistema dedicado y sin privilegios de root (por ejemplo, `semaphore`) para reducir el impacto de posibles vulnerabilidades. Esto es opcional y puede configurarse según las políticas del sistema.
<!-- - **Resource Limits**: To prevent abuse, CPU and memory limits can be applied. -->

## Despliegue seguro {#secure-deployment}

Para garantizar un despliegue seguro de Semaphore:

- **Use HTTPS**<br />
    Semaphore admite HTTPS tanto mediante su **compatibilidad integrada con TLS** como a través de un **proxy inverso como Nginx**. Se recomienda encarecidamente habilitar HTTPS en producción.

    Para habilitar la compatibilidad integrada con HTTPS, añada el siguiente bloque a **config.json**:
    ```json
    {
        ...
        "tls": {
            "enabled": true,
            "cert_file": "/path/to/cert/example.com.cert",
            "key_file": "/path/to/key/example.com.key"
        }
        ...
    }
    ```

- **Ejecútelo detrás de un cortafuegos**<br />Limite el acceso a Semaphore UI y a la base de datos únicamente a las IP de confianza.

- **Seguridad de la base de datos**<br />Use contraseñas robustas y restrinja el acceso a la base de datos solo a Semaphore.

## Actualizaciones y gestión de parches {#updates--patch-management}

Las actualizaciones de seguridad se publican periódicamente:

- **Manténgase actualizado**<br />Use siempre la última versión estable.

- **Registro de cambios**<br />Revise los cambios en GitHub antes de actualizar.

- **Actualizaciones automáticas**<br />Si usa Docker, considere implementar procesos automatizados para actualizar con regularidad.

<!-- ## Audit Logs & Monitoring

Semaphore provides basic audit logging:

- **User Activity**: Logins, failed attempts, and task executions are logged.
- **Configuration Changes**: Changes to settings, projects, and credentials are logged with timestamps.
- **Integration**: Logs can be forwarded to centralized logging systems like ELK or Prometheus exporters. -->

<!-- ## Backups & Disaster Recovery

To protect against data loss:

- **What to Back Up**: Semaphore database, configuration file, and secret storage.
- **How to Restore**: Follow the backup/restore guide in the admin docs.
- **Testing**: Periodically test restoring backups in a staging environment. -->

<!-- ## Common Vulnerabilities & Hardening Tips

- **Disable User Registration** if not needed to prevent unauthorized access.
- **Use Strong Passwords** and enforce complexity rules.
- **Limit Task Concurrency** to avoid resource exhaustion.
- **Restrict Access to Secrets** by managing team permissions carefully. -->

<!-- ## Compliance & Data Privacy

Semaphore collects minimal user data:

- **Data Handling**: Emails, IP logs, and session data are stored securely.
- **User Deletion**: Admins can delete user accounts and associated data upon request.
- **GDPR Compliance**: Self-hosted users are responsible for local compliance. -->

## Comunicación de vulnerabilidades {#reporting-vulnerabilities}

¿Ha encontrado una vulnerabilidad? Ayúdenos a mantener Semaphore seguro:

- **Divulgación responsable**<br />Escríbanos a `security@semaphoreui.com`.
 
### Objetivos de resolución de vulnerabilidades {#vulnerability-resolution-targets}

Nuestro objetivo es resolver las vulnerabilidades comunicadas dentro de los siguientes plazos:

- Críticas: en un plazo de 30 días
- Altas: en un plazo de 60 días
- Medias: en un plazo de 90 días
- Bajas: según disponibilidad, normalmente en un plazo de 180 días

Pueden publicarse parches fuera del ciclo habitual para problemas explotados activamente que afecten a las últimas versiones estables.

### Herramientas de seguridad del código {#code-security-tooling}

Usamos CodeQL, Codacy, Snyk y Renovate para analizar el código base y las dependencias, y para automatizar las actualizaciones de dependencias.
- **Sin exploits públicos**<br />No divulgue públicamente las vulnerabilidades hasta que estén corregidas.

- **Agradecimientos**<br />Los investigadores de seguridad pueden ser mencionados en las notas de la versión si así lo desean.
