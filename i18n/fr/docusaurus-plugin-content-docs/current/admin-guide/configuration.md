# Configuration

Semaphore peut être configuré de plusieurs façons :

* [Configurateur en ligne](https://semaphoreui.com/install) &mdash; interface web permettant de générer la configuration en ligne.
* [Fichier de configuration](/admin-guide/configuration/config-file) &mdash; la méthode principale et la plus flexible pour configurer Semaphore.
* [Variables d'environnement](/admin-guide/configuration/env-vars) &mdash; pratiques pour les déploiements conteneurisés ou cloud-native.


## Options de configuration {#configuration-options}

Chaque option, avec sa variable d'environnement, son type et sa valeur par défaut, est
listée dans la [référence des options de configuration](/reference/configuration). Cette
page est générée à partir des sources de Semaphore : elle correspond donc toujours à la
version que vous exécutez.

Les valeurs sont résolues dans un ordre unique : une variable d'environnement l'emporte
sur le fichier de configuration, et la valeur par défaut ne s'applique que si aucun des
deux n'est défini.

## Questions fréquentes {#frequently-asked-questions}

### 1. Comment configurer une URL publique pour Semaphore UI {#1-how-to-configure-a-public-url-for-semaphore-ui}

Si vous utilisez nginx ou un autre serveur web devant Semaphore, vous devez renseigner l'option de configuration `web_host`.

Par exemple, vous avez configuré NGINX sur le serveur, qui relaie les requêtes vers Semaphore.

L'adresse du serveur est `https://example.com` et vous relayez toutes les requêtes `https://example.com/semaphore` vers Semaphore.

Votre `web_host` sera alors `https://example.com/semaphore`.
