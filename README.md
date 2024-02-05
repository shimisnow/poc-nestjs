# Financial REST API with NestJS

[![Unit/Integration Tests](https://github.com/shimisnow/poc-nestjs/actions/workflows/unit-testing.yml/badge.svg)](https://github.com/shimisnow/poc-nestjs/actions/workflows/unit-testing.yml)
[![E2E Tests](https://github.com/shimisnow/poc-nestjs/actions/workflows/e2e-testing.yml/badge.svg)](https://github.com/shimisnow/poc-nestjs/actions/workflows/e2e-testing.yml)
[![Build and publish Docker Images](https://github.com/shimisnow/poc-nestjs/actions/workflows/deploy.yml/badge.svg)](https://github.com/shimisnow/poc-nestjs/actions/workflows/deploy.yml)

This project implements a REST API for a financial backend with NestJS and serves as a demonstration of how to architect and develop a scalable backend API application.

## Key features

- Showcases [how to retrieve the account balance in a financial application](docs/markdown/resolved-problems/account-balance.md)
- Demonstrates [NestJS](https://docs.nestjs.com/) architecture and patterns and provides a strong foundation for building scalable APIs.
- Integrates with PostgreSQL and Redis.
- Shows how to test with [Jest](https://jestjs.io/), [SuperTest](https://github.com/ladjs/supertest) and [Testcontainers](https://testcontainers.com/).
- Shows how to deploy with Docker using [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- Shows how to Github Actions to E2E teste the application and publish the compiled code to Docker Hub.
- Shows how to use [OpenAPI/Swagger](https://www.openapis.org/) documentation for REST APIs.

## Technologies

- Code organization: monorepo with [Nx](https://nx.dev/)
- Backend: REST API, Node.js, [NestJS Framework](https://docs.nestjs.com/), TypeScript
- Database and cache: Postgres (SQL), Redis, [TypeORM](https://typeorm.io/)
- Tests: Unit and integration testing ([Jest](https://jestjs.io/)), E2E Testing ([SuperTest](https://github.com/ladjs/supertest) and [Testcontainers](https://testcontainers.com/))
- DevOps: [GitHub Actions](https://github.com/features/actions), [Docker Hub](https://hub.docker.com/u/shimisnow)
- Documentation: [OpenAPI/Swagger](https://www.openapis.org/)
- Others: Docker (with multi-stage builds), Docker Compose

## Details about

- [How to run from code](docs/markdown/how-to-run.md)
- [How to deploy](docs/markdown/how-to-deploy.md)
- [Database structure and TypeORM entities](docs/markdown/database-structure.md)
- [GitHub Actions](docs/markdown/github-actions.md)
- [Documentation](docs/markdown/documentation.md)
- [Testing](docs/markdown/testing.md)
