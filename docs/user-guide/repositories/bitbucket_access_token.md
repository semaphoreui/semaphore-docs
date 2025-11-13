<div class="breadcrumbs">
    <a href="/user-guide/repositories">Repositories</a>
    → Bitbucket Access Token
</div>

# Bitbucket Access Token

You can use a Bitbucket Access Token in Semaphore to access repositories from Bitbucket.

First, you need to create an Access Token for your Bitbucket repository with read access permissions.

![](<../../.gitbook/assets/bitbucket_access_token_1.webp>)


After creation, you will see the access token. Copy it to your clipboard as it will be required for creating an **Access Key** in Semaphore.

![](<../../.gitbook/assets/bitbucket_access_token_2.webp>)

1. Go to to the **Key Store** section in Semaphore and click the **New Key** button.

2. Choose `Login with password` as the type of key.

3. Enter `x-token-auth` as **Login** and paste the previously copied key into the **Password** field. Save the key.<br/><br/>![](<../../.gitbook/assets/bitbucket_access_token_3.webp>)

4. Go to the **Repositories** section and click the **New Repository** button.

5. Enter HTTPS URL of the repository (`https://bitbucket.org/path/to/repo`), enter correct branch and select previously created **Access Key**.<br/><br/>![](<../../.gitbook/assets/bitbucket_access_token_4.webp>)