![POC NestJS](docs/markdown/images/poc-nestjs-bar//export/poc-nestjs-bar.png)

# Financial API with NestJS

[![Unit Integration](https://github.com/shimisnow/poc-nestjs/actions/workflows/lint-test.yml/badge.svg)](https://github.com/shimisnow/poc-nestjs/actions/workflows/lint-test.yml)
[![Unit Integration E2E](https://github.com/shimisnow/poc-nestjs/actions/workflows/lint-test-e2e.yml/badge.svg)](https://github.com/shimisnow/poc-nestjs/actions/workflows/lint-test-e2e.yml)
[![Build and publish Docker Images](https://github.com/shimisnow/poc-nestjs/actions/workflows/deploy.yml/badge.svg)](https://github.com/shimisnow/poc-nestjs/actions/workflows/deploy.yml)

[![Auth Service Docker image size](https://img.shields.io/docker/image-size/shimisnow/pocnestjs-auth-service/latest?logo=docker&label=Auth%20Service)](https://hub.docker.com/r/shimisnow/pocnestjs-auth-service)
[![Financial Service Docker image size](https://img.shields.io/docker/image-size/shimisnow/pocnestjs-financial-service/latest?logo=docker&label=Financial%20Service)](https://hub.docker.com/r/shimisnow/pocnestjs-financial-service)
[![User Service Docker image size](https://img.shields.io/docker/image-size/shimisnow/pocnestjs-user-service/latest?logo=docker&label=User%20Service)](https://hub.docker.com/r/shimisnow/pocnestjs-user-service)

## Project Overview

This [NestJS](https://docs.nestjs.com/) project is designed to provide a robust and maintainable backend application with a strong emphasis on testing, documentation, and deployment automation.

The project has three individual services:

- Auth Service (REST API): implements the authentication process with JWT tokens
- Financial Service (REST API): process and store financial data
- User Service (GraphQL): process and store user data (under development)

![General Diagram](/docs/markdown/diagrams/general-flow.svg)

## Key features

- Showcases [how to retrieve the account balance in a financial application](docs/markdown/resolved-problems/account-balance.md)
- Showcases [how to authenticate, issue and invalidate tokens](docs/markdown//resolved-problems/authentication-flow.md) using Redis cache and without storing token in database
- Shows how to make a secure authentication with [JWT](https://jwt.io/)
- Shows how to work with monorepo using [Nx](https://nx.dev/)
- Integrates with PostgreSQL (using [TypeORM](https://typeorm.io/)) and Redis
- Shows how to log in JSON with [winston](https://github.com/winstonjs/winston)
- Shows how to test with [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest)
- Shows how to e2e test usint [Testcontainers](https://testcontainers.com/) to create isolated environments for testing the entire application flow, ensuring that the application behaves correctly from the user's perspective
- Shows how to make automated deployment to [Docker Hub](https://hub.docker.com/) using [multi-stage builds](https://docs.docker.com/build/building/multi-stage/) and [Github Actions](https://github.com/features/actions)
- Shows how to make API documentation with [OpenAPI/Swagger](https://www.openapis.org/)
- Shows how to use pre-request scripts in [Postman](https://www.postman.com/) to build powerfull collections

## Technology Stack

- Code organization: monorepo with [Nx](https://nx.dev/)
- Backend: REST API, GraphQL, Node.js, [NestJS Framework](https://docs.nestjs.com/), TypeScript
- Database and cache: PostgreSQL, Redis, [TypeORM](https://typeorm.io/)
- Security: [JWT](https://jwt.io/) and [BCrypt](https://www.npmjs.com/package/bcrypt)
- Tests: Unit and integration testing ([Jest](https://jestjs.io/)), E2E Testing ([SuperTest](https://github.com/ladjs/supertest) and [Testcontainers](https://testcontainers.com/)), Code coverage ([IstanbulJS](https://istanbul.js.org/))
- CI/CD: [GitHub Actions](https://github.com/features/actions), [Docker Hub](https://hub.docker.com/u/shimisnow)
- Documentation: [OpenAPI/Swagger](https://www.openapis.org/), [Postman](https://www.postman.com/) collections, [Compodoc](https://compodoc.app/)
- Others: Docker ([with multi-stage build](https://docs.docker.com/build/building/multi-stage/)), Docker Compose, ESLint, Webpack, JWT, [winston](https://github.com/winstonjs/winston)

## DevOps flow

![DevOps flow](docs/markdown/diagrams/devops.png)

## Details about

- [How to run from code](docs/markdown/how-to-run.md)
- [How to deploy](docs/markdown/how-to-deploy.md)
- [Database structure and TypeORM entities](docs/markdown/database-structure.md)
- [GitHub Actions](docs/markdown/github-actions.md)
- [Documentation](docs/markdown/documentation.md)
- [Testing](docs/markdown/testing.md)
