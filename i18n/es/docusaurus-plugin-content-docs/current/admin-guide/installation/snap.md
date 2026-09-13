# Snap (obsoleto)

Para instalar Semaphore mediante snap, ejecute el siguiente comando en el terminal:

```bash
sudo snap install semaphore
```

Semaphore estará disponible en la URL [https://localhost:3000](https://localhost:3000).&#x20;

Sin embargo, para iniciar sesión deberá crear un usuario administrador. Utilice los siguientes comandos:

```bash
sudo snap stop semaphore

sudo semaphore user add --admin \
--login john \
--name=John \
--email=john1996@gmail.com \
--password=12345

sudo snap start semaphore
```

Puede comprobar el estado del servicio de Semaphore con el siguiente comando:

```bash
sudo snap services semaphore
```

Debería mostrar la siguiente tabla:

```
Service               Startup  Current  Notes
semaphore.semaphored  enabled  active   -
```

Tras la instalación, puede configurar Semaphore mediante la [configuración de Snap](https://snapcraft.io/docs/configuration-in-snaps). Utilice el siguiente comando para ver la configuración de Semaphore:

```bash
sudo snap get semaphore
```

&#x20;Encontrará la lista de opciones disponibles en la [referencia de opciones de configuración](../configuration#configuration-options).

----
