# 🔐 セキュリティ

## はじめに {#introduction}

Semaphore UI ではセキュリティを最優先事項としています。重要なインフラ作業を自動化する場合でも、機密システムへのチームのアクセスを管理する場合でも、Semaphore UI は堅牢で安全な運用を標準で提供できるように設計されています。このセクションでは、Semaphore がセキュリティをどのように扱っているか、また本番環境に導入する際に検討すべき点を説明します。

## 認証と認可 {#authentication--authorization}

Semaphore は、安全な認証と柔軟な認可のしくみに対応しています。

- **ログイン方法:**
  - **ユーザー名／パスワード**<br />Semaphore のデータベースに保存された認証情報を使用する既定の方法です。パスワードが平文で保存されることはなく、Argon2id でハッシュ化されます（[パスワードのハッシュ化](#password-hashing)を参照）。

  - **LDAP**<br />企業のディレクトリサービスと連携できます。ユーザー／グループのフィルタリングと、LDAPS による安全な接続に対応しています。

  - **OpenID Connect (OIDC)**<br />Google、Azure AD、Keycloak などの ID プロバイダーによるシングルサインオンを利用できます。カスタムクレームとグループマッピングに対応しています。

- **2 要素認証 (2FA)**<br />TOTP ベースの 2FA を利用でき、すべてのユーザーに推奨されます。ユーザーごとに有効化でき、任意でリカバリーコードを使用できます。設定オプション `mfa.totp.enabled` と `mfa.totp.allow_recovery` を参照してください。

- **ロールベースのアクセス制御**<br />ユーザーに管理者、メンテナー、閲覧者などの異なるロールを割り当て、責任範囲に応じてアクセスを制限できます。

- **セッション管理**<br />セッションはセキュアな HTTP クッキーで保護されます。セッションの有効期限とログアウトのしくみにより、露出を最小限に抑えます。
<!-- - **Brute-Force Protection**: Login attempts are rate-limited to prevent brute-force attacks. -->

### パスワードのハッシュ化 {#password-hashing}

:::info v2.20 以降
Argon2id によるパスワードのハッシュ化は **Semaphore 2.20** 以降で利用できます。それより前のバージョンでは bcrypt を使用します。
:::

ローカルユーザーのパスワードは、[OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) がパスワード保存に推奨しているアルゴリズムである **Argon2id** でハッシュ化されます。Semaphore は OWASP の最低強度パラメーターを使用します。

| パラメーター | 値 |
|-----------|-------|
| メモリ | 19 MiB (`m=19456`) |
| 反復回数 | 2 (`t=2`) |
| 並列度 | 1 (`p=1`) |
| ソルト | パスワードごとにランダムな 16 バイト |
| ハッシュ長 | 32 バイト |

ハッシュは標準の [PHC 文字列形式](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md)（例: `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>`）で保存されるため、各ハッシュに使用されたパラメーターもあわせて記録されます。

これは、パスワードを設定するあらゆる方法に適用されます。Web UI、API、および CLI コマンド `semaphore user add`、`semaphore user change-by-login`、`semaphore setup` のいずれでも同様です。

**2.20 より前のバージョンからのアップグレード。** 2.20 より前のリリースでは、パスワードを bcrypt でハッシュ化していました。移行作業は必要ありません。

- 既存の bcrypt ハッシュはログイン時にそのまま受け付けられるため、アップグレード後もすべてのユーザーが引き続き利用できます。
- 最初のログインが成功した時点で、パスワードは自動的に Argon2id で再ハッシュ化され、bcrypt のハッシュが置き換えられます。
- 将来のリリースで Semaphore の Argon2id パラメーターが強化された場合も、古いパラメーターで作成されたハッシュは次回のログイン時に同じ方法でアップグレードされます。

再ハッシュ化はログイン時にのみ行われるため、その後一度もログインしないユーザーは bcrypt のハッシュを保持したままになります。そのようなアカウントを強制的にアップグレードするには、`semaphore user change-by-login --password ...` または管理 UI からパスワードをリセットしてください。

:::note
2 要素認証のリカバリーコードはユーザーのパスワードではないため、引き続き bcrypt を使用します。
:::

## シークレットと認証情報 {#secrets--credentials}

シークレットを安全に管理することは中核的な機能です。

- **暗号化されたキーストア**<br />認証情報とシークレット変数は、AES 暗号化により保存時に暗号化されます。

- **環境の分離**<br />シークレットは実行時にのみジョブへ渡され、コンテナー環境に直接公開されることはありません。

- **SSH キーとトークン**<br />有効な SSH キーとトークンをアップロードする責任はユーザーにあります。これらは暗号化され、タスクの実行時にのみ使用されます。
- **HashiCorp Vault 連携 (Pro)**<br />シークレットを外部の Vault インスタンスに保存できます。シークレットの作成時または編集時に、保存先をシークレットごとに選択します。

## データの暗号化 {#data-encryption}

機密データは暗号化された形式でデータベースに保存されます。アクセスキーの暗号化を有効にするには、設定ファイルで設定オプション `access_key_encryption` を指定してください。この値は次のコマンドで生成する必要があります。

```bash
head -c32 /dev/urandom | base64
```

## 信頼できないコードや playbook の実行 {#running-untrusted-code--playbooks}

Semaphore はユーザーが定義した playbook やコマンドを実行するため、リスクが伴う可能性があります。

- **実行の分離**<br />既定では、タスクは Semaphore サーバー上の通常のプロセスであり、そのサーバーのファイルシステムとネットワークにアクセスできます。分離は任意です。`docker` または `k8s` エグゼキューターを設定した [ランナー](/admin-guide/runners) にタスクを渡すと、タスクごとに新しいコンテナーまたは Pod が作成され、終了時に破棄されます。

- **最小権限**<br />Docker および Kubernetes エグゼキューターでは、イメージ、ネットワーク、サービスアカウントを自分で選べるため、タスクには必要なものだけを与えられます。

- **chroot による実行**<br />Semaphore は chroot jail 内でタスクを実行し、実行環境をホストシステムからさらに分離できます。

- **タスクプロセスのユーザー**<br />タスクは専用の非 root システムユーザー（例: `semaphore`）として実行でき、潜在的な脆弱性悪用の影響を軽減できます。これは任意であり、システムのポリシーに応じて設定できます。
<!-- - **Resource Limits**: To prevent abuse, CPU and memory limits can be applied. -->

## 安全なデプロイ {#secure-deployment}

Semaphore を安全にデプロイするには、次の点に注意してください。

- **HTTPS を使用する**<br />
    Semaphore は、**組み込みの TLS サポート** と **Nginx などのリバースプロキシ** の両方で HTTPS に対応しています。本番環境では HTTPS を有効にすることを強く推奨します。

    組み込みの HTTPS サポートを有効にするには、**config.json** に次のブロックを追加します。
    ```json
    {
        ...
        "tls": {
            "enabled": true,
            "cert_file": "/path/to/cert/example.com.cert",
            "key_file": "/path/to/key/example.com.key"
        }
        ...
    }
    ```

- **ファイアウォールの背後で実行する**<br />Semaphore UI とデータベースへのアクセスを、信頼できる IP アドレスのみに制限します。

- **データベースのセキュリティ**<br />強力なパスワードを使用し、データベースへのアクセスを Semaphore のみに制限します。

## 更新とパッチ管理 {#updates--patch-management}

セキュリティ更新は定期的に公開されています。

- **最新の状態を保つ**<br />常に最新の安定版リリースを使用してください。

- **変更履歴**<br />更新前に GitHub で変更内容を確認してください。

- **自動更新**<br />Docker を使用している場合は、定期的な更新のための自動化パイプラインを検討してください。

<!-- ## Audit Logs & Monitoring

Semaphore provides basic audit logging:

- **User Activity**: Logins, failed attempts, and task executions are logged.
- **Configuration Changes**: Changes to settings, projects, and credentials are logged with timestamps.
- **Integration**: Logs can be forwarded to centralized logging systems like ELK or Prometheus exporters. -->

<!-- ## Backups & Disaster Recovery

To protect against data loss:

- **What to Back Up**: Semaphore database, configuration file, and secret storage.
- **How to Restore**: Follow the backup/restore guide in the admin docs.
- **Testing**: Periodically test restoring backups in a staging environment. -->

<!-- ## Common Vulnerabilities & Hardening Tips

- **Disable User Registration** if not needed to prevent unauthorized access.
- **Use Strong Passwords** and enforce complexity rules.
- **Limit Task Concurrency** to avoid resource exhaustion.
- **Restrict Access to Secrets** by managing team permissions carefully. -->

<!-- ## Compliance & Data Privacy

Semaphore collects minimal user data:

- **Data Handling**: Emails, IP logs, and session data are stored securely.
- **User Deletion**: Admins can delete user accounts and associated data upon request.
- **GDPR Compliance**: Self-hosted users are responsible for local compliance. -->

## 脆弱性の報告 {#reporting-vulnerabilities}

脆弱性を見つけた場合は、Semaphore の安全性維持にご協力ください。

- **責任ある開示**<br />`security@semaphoreui.com` までメールでご連絡ください。
 
### 脆弱性の解決目標 {#vulnerability-resolution-targets}

報告された脆弱性は、次の目標期間内に解決することを目指しています。

- 緊急: 30 日以内
- 高: 60 日以内
- 中: 90 日以内
- 低: ベストエフォート。通常は 180 日以内

最新の安定版リリースに影響し、実際に悪用されている問題については、通常のサイクル外でパッチをリリースする場合があります。

### コードセキュリティのツール {#code-security-tooling}

コードベースと依存関係の解析、および依存関係の更新の自動化には、CodeQL、Codacy、Snyk、Renovate を使用しています。
- **公開された攻撃コードを共有しない**<br />パッチが提供されるまで、脆弱性を公開しないでください。

- **謝辞**<br />ご希望に応じて、セキュリティ研究者の方をリリースノートで謝辞として記載することがあります。
