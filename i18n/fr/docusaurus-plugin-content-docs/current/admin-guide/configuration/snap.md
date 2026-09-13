# Configuration Snap

Les configurations Snap doivent être utilisées lorsque Semaphore a été installé via Snap.

Pour afficher la liste des options disponibles, utilisez la commande suivante :

```bash
sudo snap get semaphore
```

Vous pouvez modifier chacune de ces configurations. Par exemple, si vous souhaitez changer le port de Semaphore, utilisez la commande suivante :

```bash
sudo snap set semaphore port=4444
```

N'oubliez pas de redémarrer Semaphore après avoir modifié une configuration :

```bash
sudo snap restart semaphore
```
