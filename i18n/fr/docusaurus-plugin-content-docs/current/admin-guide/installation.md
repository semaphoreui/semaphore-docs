# Installation

Vous pouvez installer Semaphore de plusieurs manières, selon votre système d'exploitation, votre environnement et vos préférences :

* **Gestionnaire de paquets**<br />
  Installez Semaphore à l'aide d'un paquet natif pour votre distribution (par exemple apt pour Debian/Ubuntu ou dnf pour les systèmes basés sur RHEL). C'est le moyen le plus simple de démarrer sur des serveurs Linux, et il s'intègre bien aux services système.<br />
  [En savoir plus »](/admin-guide/installation/package-manager)

* **Docker**<br />
  Exécutez Semaphore en tant que conteneur avec Docker ou Docker Compose. Idéal pour une mise en place rapide, des environnements isolés et les pipelines CI/CD. Recommandé pour les utilisateurs qui privilégient l'infrastructure as code.<br />
  [En savoir plus »](/admin-guide/installation/docker)

* **Cloud**<br />
  Conseils pour déployer Semaphore sur des plateformes cloud à l'aide de machines virtuelles, de conteneurs ou de Kubernetes avec des services managés.<br />
  [En savoir plus »](/admin-guide/installation/cloud)

* **Fichier binaire**<br />
  Téléchargez un binaire précompilé depuis la page des versions. Idéal pour une installation manuelle ou une intégration dans des workflows personnalisés. Fonctionne sous Linux, macOS et Windows (via WSL).<br />
  [En savoir plus »](/admin-guide/installation/binary-file)

* **Kubernetes (chart Helm)**<br />
  Déployez Semaphore dans un cluster Kubernetes à l'aide de Helm. Le mieux adapté aux infrastructures de production évolutives. Prend en charge une configuration et des mises à niveau simplifiées via les valeurs Helm.<br />
  [En savoir plus »](/admin-guide/installation/k8s)

Voir aussi :
* [Exécuter en tant que service](/admin-guide/installation/binary-file#run-as-a-service)
* [Installation manuelle](/admin-guide/installation_manually)

----


### Installation de paquets Python supplémentaires {#installing-additional-python-packages}

Certains modules et rôles Ansible nécessitent des paquets Python supplémentaires pour fonctionner. Pour installer des paquets Python supplémentaires, créez un fichier `requirements.txt` et montez-le dans le répertoire `/etc/semaphore` du conteneur. Par exemple, vous pouvez ajouter les lignes suivantes à votre fichier `docker-compose.yml` :

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

Les paquets indiqués dans le fichier requirements sont installés dans l'environnement virtuel Ansible embarqué à chaque démarrage du conteneur. Le même montage fonctionne pour l'image `semaphoreui/runner`. Consultez [Installation de dépendances Python supplémentaires](/admin-guide/installation/docker#installing-additional-python-dependencies) pour plus de détails et une alternative basée sur une image personnalisée.

Pour plus d'informations sur les fichiers requirements de Python, consultez la [référence du format des fichiers requirements de pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/)
