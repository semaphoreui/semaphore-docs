# Votre compte

Vos paramètres personnels se trouvent dans le menu du compte, en bas de la barre latérale. Cliquez sur votre nom pour l'ouvrir.

![Menu du compte](/assets/user-menu.webp)

| Élément | Description |
|---|---|
| Version | La version de Semaphore UI qui s'exécute sur le serveur. |
| **Jetons d'API** | Jetons personnels pour l'[API REST](/reference/api). |
| **Modifier le compte** | Votre nom, nom d'utilisateur, adresse e-mail, préférence d'alertes et mot de passe. |
| **Se déconnecter** | Met fin à la session. |

À côté du menu, vous trouverez l'interrupteur du **mode sombre** et le sélecteur de **langue**. Ces deux paramètres sont enregistrés dans votre navigateur.

## Modifier le compte {#edit-account}

![Boîte de dialogue de modification du compte](/assets/account-edit.webp)

L'onglet **Paramètres** contient :

| Champ | Description |
|---|---|
| **Nom** | Nom affiché dans l'historique des tâches et l'activité. |
| **Nom d'utilisateur** | Nom de connexion. |
| **E-mail** | Adresse utilisée pour les alertes par e-mail et la récupération du mot de passe. |
| **Envoyer des alertes** | Recevoir des alertes par e-mail à propos des tâches. Les alertes ne sont envoyées que si le [canal e-mail](/admin-guide/notifications/email) est configuré et que le projet autorise les alertes. |

Les badges à côté des cases à cocher indiquent vos indicateurs globaux : **Pro user** sur une instance Pro, **Admin** pour les administrateurs, **External** pour les comptes gérés par LDAP ou OpenID Connect. Les utilisateurs externes ne peuvent pas modifier ici leur nom d'utilisateur ni leur mot de passe.

L'onglet **Sécurité** vous permet de changer votre mot de passe. Si l'administrateur a activé les mots de passe à usage unique basés sur le temps, le second facteur se configure dans ce même onglet.

![Onglet Sécurité](/assets/account-security.webp)

## Jetons d'API {#api-tokens}

Choisissez **Jetons d'API** dans le menu du compte. La page liste vos jetons avec leur date de création, leur date d'expiration et leur statut. Le lien **Référence de l'API** ouvre l'interface Swagger UI intégrée à votre instance.

![Jetons d'API](/assets/api-tokens.webp)

Cliquez sur **Nouveau jeton**, donnez un nom au jeton et choisissez sa date d'expiration. La valeur du jeton n'est affichée qu'une seule fois après la création : copiez-la immédiatement.

![Boîte de dialogue de nouveau jeton](/assets/api-token-new.webp)

Utilisez le jeton dans l'en-tête `Authorization: Bearer`, voir [API](/reference/api). Pour révoquer un jeton, supprimez-le de la liste.
