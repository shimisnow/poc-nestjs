# Database structure

SQL files with database structure can be found at:

- [Authentication](../../deployment/database/authentication)
- [Financial](../../deployment/database/financial)

### Authentication database

![Authentication database](./images/database-diagram-authentication.png)

### Financial database

![Financial database](./images/database-diagram-financial.png)

## TypeORM entities

The TypeORM entities can be found at:

- [Authentication](../../apps/auth-service/src/app/database/entities/)
- [Financial](../../apps/financial-service/src/app/database/entities/)

## TypeORM migrations

All migration files are at `apps/$SERVICE/src/app/database/migrations`

To automatically scan the database and the entities for changes and generate a migration

```sh
npx nx typeorm:migration:generate $SERVICE --name=MyMigration
# npx nx typeorm:migration:generate auth-service --name=MyMigration
```

To create an empty migration file with up and down functions

```sh
npx nx typeorm:migration:create $SERVICE --name=MyMigration
# npx nx typeorm:migration:create auth-service --name=MyMigration
```

To run the migrations

```sh
npx nx typeorm:migration:run $SERVICE
# npx nx typeorm:migration:run auth-service
```
