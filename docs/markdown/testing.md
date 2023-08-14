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

The project unit testing is done with Jest and Supertest and can be performed with the command:

```sh
npx nx e2e SERVICE_NAME
```

Before the test it is necessary to initialize the database with:

```sh
docker compose up -d database-authentication
```
