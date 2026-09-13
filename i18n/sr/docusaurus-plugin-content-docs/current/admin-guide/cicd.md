# CI/CD integracija

Semaphore može biti korak u spoljnom pipeline-u, a može i da pokreće sopstvene jednostavne pipeline-ove za build i deploy.

## Build i deploy pipeline-ovi unutar Semaphore-a {#build-and-deploy-pipelines-inside-semaphore}

Tipovi šablona zadatka (Task Template) **Build** i **Deploy**, verzionisanje artefakata i promenljiva `semaphore_vars` opisani su u vodiču za korisnike: [Build i deploy šabloni](/user-guide/task-templates/build-deploy). Višekoračni pipeline-ovi sa odobrenjima prave se pomoću [tokova rada (Workflows)](/user-guide/workflows).

## Pokretanje Semaphore zadataka iz spoljnog CI sistema {#starting-semaphore-tasks-from-an-external-ci-system}

Postoje dva načina da pokrenete zadatak (Task) iz GitHub Actions, GitLab CI, Jenkins-a ili bilo kog drugog sistema:

- **Integracije** (Integrations): webhook URL po projektu (Project) koji pokreće šablon kada zahtev odgovara pravilu. Podržava GitHub potpise, tokene i HMAC i može proslediti polja zahteva zadatku kao promenljive. Pogledajte [Integracije](/user-guide/integrations).
- **REST API**: kreirajte zadatak pomoću API tokena:

```bash
curl -X POST https://semaphore.example.com/api/project/1/tasks \
  -H 'Authorization: Bearer YOUR_API_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"template_id": 5, "message": "Triggered by CI"}'
```

Odgovor sadrži ID zadatka. Proveravajte `GET /api/project/1/tasks/{task_id}` dok `status` ne postane `success`, `error` ili `stopped`. Pogledajte [API](/reference/api) za tokene i ugrađenu Swagger referencu.
