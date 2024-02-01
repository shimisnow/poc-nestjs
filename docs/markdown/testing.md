# Testing

## Unit testing

The project unit testing is done with Jest and can be performed with the command:

```sh
npx nx test SERVICE_NAME
```

Available service name to be replace in `SERVICE_NAME`:

- auth-service

The `*.spec.ts` files can be found at `/apps/SERVICE_NAME/app/MODULE_NAME` with one file for the controller and one for the service.

## e2e testing

The project e2e testing is done with Jest, Supertest and (Testcontainers)[https://testcontainers.com/] and can be performed with the command:

```sh
npx nx e2e SERVICE_NAME
```

The tests require Docker, but it is not necessary to start the dependecies (database, cache). All external dependencies will be started up by Testcontainers.
