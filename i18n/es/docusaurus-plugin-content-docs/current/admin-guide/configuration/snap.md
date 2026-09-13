# Configuración de Snap

La configuración de Snap debe usarse cuando Semaphore se ha instalado mediante Snap.

Para ver la lista de opciones disponibles, use el siguiente comando:

```bash
sudo snap get semaphore
```

Puede cambiar cada una de estas opciones. Por ejemplo, si desea cambiar el puerto de Semaphore, use el siguiente comando:

```bash
sudo snap set semaphore port=4444
```

No olvide reiniciar Semaphore después de cambiar una opción de configuración:

```bash
sudo snap restart semaphore
```
