# Token de acceso de Bitbucket

Puede usar un token de acceso de Bitbucket en Semaphore para acceder a repositorios de Bitbucket.

Primero, necesita crear un token de acceso para su repositorio de Bitbucket con permisos de lectura.

![](/assets/bitbucket_access_token_1.webp)

Tras crearlo, verá el token de acceso. Cópielo al portapapeles, ya que lo necesitará para crear una **clave de acceso** en Semaphore.

![](/assets/bitbucket_access_token_2.webp)

1. Vaya a la sección **Almacén de claves** de Semaphore y haga clic en el botón **Nueva clave**.
2. Elija `Login with password` como tipo de clave.
3. Introduzca `x-token-auth` como **Login** y pegue la clave copiada anteriormente en el campo **Contraseña**. Guarde la clave.<br/><br/>![](/assets/bitbucket_access_token_3.png)
4. Vaya a la sección **Repositorios** y haga clic en el botón **Nuevo repositorio**.
5. Introduzca la URL HTTPS del repositorio (`https://bitbucket.org/path/to/repo`), introduzca la rama correcta y seleccione la **clave de acceso** creada anteriormente.<br/><br/>![](/assets/bitbucket_access_token_4.webp)