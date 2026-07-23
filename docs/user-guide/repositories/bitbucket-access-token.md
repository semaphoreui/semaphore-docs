# Bitbucket Access Token

You can use a Bitbucket Access Token in Semaphore to access repositories from Bitbucket.

Prerequisites:

- A Bitbucket repository for which you can create an Access Token.

First, you need to create an Access Token for your Bitbucket repository with read access permissions.

![](/assets/bitbucket_access_token_1.webp)

After creation, you will see the access token. Copy it to your clipboard as it will be required for creating an **Access Key** in Semaphore.

![](/assets/bitbucket_access_token_2.webp)

1. In the **Key Store** section in Semaphore, click the **New Key** button.
2. Choose `Login with password` as the type of key.
3. Enter `x-token-auth` as **Login** and paste the previously copied key into the **Password** field. Save the key.<br/><br/>![](/assets/bitbucket_access_token_3.png)
4. In the **Repositories** section, click the **New Repository** button.
5. Enter the HTTPS URL of the repository (`https://bitbucket.org/path/to/repo`), enter the correct branch, and select the previously created **Access Key**.<br/><br/>![](/assets/bitbucket_access_token_4.webp)
