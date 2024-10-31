# GitHub Actions

See the [contributing guide](../../CONTRIBUTING.md) to get a diagram for the project gitflow.

### Unit and Integration testing (Jest)

Will be executed for pull request to the branches `milestone-**`, `develop`, `staging`.

- See the [workflow file](../../.github/workflows/lint-test.yml) for details.

This workflow creates the `node_modules` folder at the `setup` step and uses it to test the code for the services (`auth-service`, `financial-service`, and `user-service` steps) and for the shared code (`shared-code` step). At the end, generates a coverage report and adds it to a pull request comment (`coverage-report` step).

```mermaid
stateDiagram-v2
direction LR
state "auth-service" as auth
state "financial-service" as financial
state "user-service" as user
state "shared-code" as shared
state "coverage-report" as coverage
state wait1 <<fork>>
state wait2 <<fork>>

[*] --> setup
setup --> wait1
wait1 --> auth
wait1 --> financial
wait1 --> user
wait1 --> shared
auth --> wait2
financial --> wait2
user --> wait2
shared --> wait2
wait2 --> coverage
coverage --> [*]
```

### E2E Testing (Supertest and Testcontainers)

Will be executed for pull request to the branches `staging` and `main`.

- See the [workflow file](../../.github/workflows/e2e-test.yml) for details.

This workflow creates the `node_modules` folder at the `setup` step and uses it to execute e2e tests for each service (`auth-service-e2e`, `financial-service-e2e`, and `user-service-e2e` steps).

```mermaid
stateDiagram-v2
direction LR
state "auth-service-e2e" as auth
state "financial-service-e2e" as financial
state "user-service-e2e" as user
state wait <<fork>>

[*] --> setup
setup --> wait
wait --> auth
wait --> financial
wait --> user
auth --> [*]
financial --> [*]
user --> [*]
```

### Build Docker images and publish to Docker Hub

Will be executed when a pull request to the branch `main` is accepted.

- See the [workflow file](../../.github/workflows/deploy.yml) for details.

This workflow builds two Docker images to be used at the multi-stage build process. One at the `build-base-image-dev` step that creates an image with all npm packages (prod and dev) that are necessary to build the code. The second image is created at the `build-base-image-prod` step and has only the production dependencies.

After the creation of the base images, the final images are build at the `auth-service`, `financial-service` and `user-service` step and each image is uploaded to Docker Hub.

```mermaid
stateDiagram-v2
direction LR
state "build-base-image-dev" as dev
state "build-base-image-prod" as prod
state build <<fork>>
state "auth-service" as auth
state "financial-service" as financial
state "user-service" as user

[*] --> dev
[*] --> prod
dev --> build
prod --> build
build --> auth
build --> financial
build --> user
auth --> [*]
financial --> [*]
user --> [*]
```
