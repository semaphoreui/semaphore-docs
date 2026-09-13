---
title: "Backend HTTP"
sidebar_custom_props:
  edition: pro
---

# Backend HTTP <Pro />

O backend HTTP do Semaphore UI para Terraform armazena e gerencia com segurança os arquivos de estado do Terraform diretamente dentro do Semaphore. Disponível no plano Pro, ele oferece várias vantagens importantes.

## Recursos {#features}

- **Armazenamento Seguro de Estado**: os arquivos de estado são <!-- encrypted and--> armazenados com segurança dentro do Semaphore.
- **Bloqueio de Estado**: impede modificações simultâneas no mesmo arquivo de estado.
- **Histórico de Versões**: acompanhe as alterações no estado da sua infraestrutura ao longo do tempo.
- **Integração com a Interface**: gerencie os arquivos de estado diretamente pela interface do Semaphore.

## Configuração {#configuration}

Para começar a usar o backend HTTP integrado, primeiro você precisa criar um workspace para o seu modelo de tarefa Terraform.

Para adicionar um workspace, vá para a aba **Workspaces** do seu modelo Terraform/OpenTofu.

Ao criar um workspace, será solicitado que você selecione uma chave SSH para clonar os módulos privados usados no seu código Terraform. Se você não usa módulos privados, basta selecionar a opção `None`.

![](https://github.com/user-attachments/assets/0a6a0b4d-8b10-41df-8500-e3084d5b6c64)

### Usando o backend HTTP nas tarefas {#using-the-http-backend-in-tasks}

Para usar o backend HTTP integrado para armazenar o estado das suas tarefas Terraform, você não precisa configurar manualmente o backend no seu código Terraform. O Semaphore pode criar automaticamente o arquivo de configuração durante a execução. Para habilitar isso, basta marcar a opção **Substituir configurações do backend** nas configurações do seu modelo de tarefa, como mostrado na captura de tela abaixo.


Opcionalmente, você pode especificar o nome do arquivo de configuração que será criado dinamicamente durante a execução. Isso é útil se o seu código já contém um arquivo de configuração de backend e você precisa substituí-lo dinamicamente para funcionar com o backend integrado do Semaphore.

### Usando o backend HTTP fora do Semaphore {#using-the-http-backend-outside-semaphore}

Você pode usar o backend HTTP integrado não apenas ao executar tarefas dentro do Semaphore, mas também ao executar código Terraform fora do Semaphore, como a partir do seu terminal local.

Para habilitar isso, o Semaphore permite criar aliases (endpoint HTTP exclusivo) para o seu armazenamento de estado. Esses aliases facilitam a referência aos seus arquivos de estado a partir de ambientes externos.

Para configurar isso, vá para a aba **Workspaces**, selecione o workspace desejado e adicione um alias. Você também precisará escolher uma chave com nome de usuário e senha, que será usada para autenticar o acesso ao backend.

<video controls>
  <source src="https://www.semaphoreui.com/uploads/v2.11/video2.mp4" type="video/mp4" />
</video>

Depois disso, você precisa adicionar as configurações de backend ao seu código Terraform:

```
terraform {
  backend "http" {
    address = "http://localhost:3000/api/terraform/***"
    username = "***"
    password = "***"
  }
}
```

Agora o Terraform usará o backend HTTP integrado do Semaphore mesmo ao ser executado a partir do seu terminal:

```
terraform apply
```
