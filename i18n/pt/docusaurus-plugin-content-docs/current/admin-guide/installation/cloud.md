# Implantação em nuvem

Você pode executar o Semaphore em qualquer ambiente de nuvem usando os mesmos métodos de instalação suportados:

- Máquinas virtuais: instale via gerenciador de pacotes ou binário e execute atrás de um proxy reverso como o NGINX. Use um banco de dados gerenciado (por exemplo, Amazon RDS, Cloud SQL) para maior confiabilidade.
- Contêineres: implante com Docker ou Docker Compose em uma VM ou em um serviço de contêineres. Consulte os volumes persistentes e a configuração de ambiente no guia do Docker.
- Kubernetes: implante com o Helm chart oficial. Use storage classes da nuvem e bancos de dados gerenciados.

Pontos essenciais:

- Configure a URL externa e o TLS no seu balanceador de carga ou proxy reverso.
- Armazene valores sensíveis (credenciais do banco de dados, segredos OAuth) em um gerenciador de segredos seguro ou em Kubernetes Secrets.
- Use bancos de dados gerenciados em produção e habilite backups regulares.
- Posicione os runners próximos às suas cargas de trabalho para reduzir a latência e o tráfego de saída.

Guias relacionados:

- [Docker](../installation/docker)
- [Kubernetes (Helm chart)](../installation/k8s)
- [Arquivo binário](../installation/binary-file)
- [Reforço de segurança](../security)

