# Déploiement cloud

Vous pouvez exécuter Semaphore dans n'importe quel environnement cloud en utilisant les mêmes méthodes d'installation prises en charge :

- Machines virtuelles : installez via un gestionnaire de paquets ou un binaire, et exécutez Semaphore derrière un proxy inverse tel que NGINX. Utilisez une base de données managée (par exemple Amazon RDS, Cloud SQL) pour plus de fiabilité.
- Conteneurs : déployez avec Docker ou Docker Compose sur une machine virtuelle ou un service de conteneurs. Consultez la section sur les volumes persistants et la configuration par variables d'environnement dans le guide Docker.
- Kubernetes : déployez avec le chart Helm officiel. Utilisez les classes de stockage cloud et des bases de données managées.

Points essentiels :

- Configurez l'URL externe et TLS au niveau de votre répartiteur de charge ou de votre proxy inverse.
- Stockez les valeurs sensibles (identifiants de base de données, secrets OAuth) dans un gestionnaire de secrets sécurisé ou dans des Secrets Kubernetes.
- Utilisez des bases de données managées en production et activez des sauvegardes régulières.
- Placez les runners à proximité de vos charges de travail pour réduire la latence et le trafic sortant.

Guides associés :

- [Docker](../installation/docker)
- [Kubernetes (chart Helm)](../installation/k8s)
- [Fichier binaire](../installation/binary-file)
- [Renforcement de la sécurité](../security)
