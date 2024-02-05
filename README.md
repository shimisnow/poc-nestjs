# Financial REST API with NestJS

This project implements a REST API for a financial backend with NestJS and serves as a demonstration of how to architect and develop a scalable backend API application.

Key Features:

- Showcases [how to retrieve the account balance in a financial application](docs/markdown/resolved-problems/account-balance.md)
- Demonstrates [NestJS](https://docs.nestjs.com/) architecture and patterns and provides a strong foundation for building scalable APIs.
- Integrates with PostgreSQL and Redis.
- Shows how to test with [Jest](https://jestjs.io/), [SuperTest](https://github.com/ladjs/supertest) and [Testcontainers](https://testcontainers.com/).
- Shows how to use [OpenAPI/Swagger](https://www.openapis.org/) documentation.

## Technologies

- Code organization: monorepo with [Nx](https://nx.dev/)
- Backend: REST API, Node.js, [NestJS Framework](https://docs.nestjs.com/), TypeScript
- Database and cache: Postgres (SQL), Redis, [TypeORM](https://typeorm.io/)
- Tests: Unit and integration testing ([Jest](https://jestjs.io/)), E2E Testing ([SuperTest](https://github.com/ladjs/supertest) and [Testcontainers](https://testcontainers.com/))
- Documentation: [OpenAPI/Swagger](https://www.openapis.org/)
- DevOps: [GitHub Actions](https://github.com/features/actions)
- Others: Docker, Docker Compose, Webpack

## Details about

- [How to run](docs/markdown/how-to-run.md)
- TO-CHANGE [How to deploy](docs/markdown/how-to-deploy.md)
- TO-DO [Repository organization](docs/markdown/repository-organization.md)
- [Database structure and TypeORM entities](docs/markdown/database-structure.md)
- [GitHub Actions](docs/markdown/github-actions.md)
- [Documentation](docs/markdown/documentation.md)
- [Testing](docs/markdown/testing.md)
