# Testing

## Unit and integration testing

The project testing is done with Jest and can be performed with the command:

```sh
npx nx test $SERVICE_NAME
```

Available service name to be replace in `$SERVICE_NAME`:

- auth-service
- financial-service

The `*.spec.ts` files can be found at `/apps/SERVICE_NAME/app/MODULE_NAME` with one file for the controller and one for the service.

To collect code coverage, use:

```sh
npx nx test $SERVICE_NAME -- --coverage
```

The results can be found at `coverage/apps/$SERVICE_NAME`.

## E2E testing

The project E2E testing is done with Jest, Supertest and [Testcontainers](https://testcontainers.com/).

Before running the tests, it is necessary to build two Docker images with the commands:

```sh
docker compose build base-image-development
docker compose build base-image-production
```

The tests require Docker, but it is not necessary to start the dependecies (database, cache). All external dependencies will be started and controlled by Testcontainers.

### Auth Service

The tests can be performed with:

```sh
npx nx e2e auth-service-e2e
```

```mermaid
stateDiagram-v2
direction LR

state "Build Auth Service Image" as auth_service_image

state "Setup Auth Database" as auth_database
state "Setup Cache" as cache
state "Start Auth Container" as auth_container
state "Perform E2E Tests" as perform_test

state build_join <<join>>
state setup_join <<join>>

[*] --> auth_service_image
auth_service_image --> build_join
build_join --> auth_database
build_join --> cache
auth_database --> setup_join
cache --> setup_join
setup_join --> auth_container
auth_container --> perform_test
perform_test --> [*]
```

### Financial Service

The tests can be performed with:

```sh
npx nx e2e financial-service-e2e
```

The tests for `financial-service` also used `auth-service` because the service is always necessary to validate token invalidation.

```mermaid
stateDiagram-v2
direction LR

state "Build Auth Service Image" as auth_service_image
state "Build Financial Service Image" as financial_service_image
state "Setup Auth Database" as auth_database
state "Setup Financial Database" as financial_database
state "Setup Cache" as cache
state "Start Auth Container" as auth_container
state "Start Financial Container" as financial_container
state "Perform E2E Tests" as perform_test

state build_join <<join>>
state setup_join <<join>>
state perform_join <<join>>

[*] --> auth_service_image
[*] --> financial_service_image
auth_service_image --> build_join
financial_service_image --> build_join
build_join --> auth_database
build_join --> financial_database
build_join --> cache
auth_database --> setup_join
financial_database --> setup_join
cache --> setup_join
setup_join --> auth_container
setup_join --> financial_container
auth_container --> perform_join
financial_container --> perform_join
perform_join --> perform_test
perform_test --> [*]
```
