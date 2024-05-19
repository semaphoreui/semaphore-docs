
You can use Bitbucket Access Token in Semaphore.

First of all you need to create Access Token for your BitBucket repository. It should allow read access.

![](<../../.gitbook/assets/bitbucket_access_token_1.webp>)


After creation you will see access token. Copy it to clipboard. Is is will be required for creating Access Key in Semaphore.

![](<../../.gitbook/assets/bitbucket_access_token_2.webp>)

1. Go to Semaphore to **Key Store** section and click **New Key** button.

2. Choose `Login with password` as type of the key.

3. Enter `x-token-auth` as **Login** and enter previously coppied key to **Password** field. Save the key. ![](<../../.gitbook/assets/bitbucket_access_token_3.webp>)

4. Go to **Repositories** section and click **New Repository** button.

5. Enter HTTPS URL of the repository (`https://bitbucket.org/path/to/repo`), enter correct branch and select previously created **Access Key**. ![](<../../.gitbook/assets/bitbucket_access_token_4.webp>)