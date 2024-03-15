# How to run

## Docker containers (database and cache)

First, start the databases and the cache manager:

```sh
docker compose up -d redis database-authentication database-financial database-info
```

See the [.env](../../.env) file to get database and cache ports.

If you **want** to see the data stored at the redis, use:

```sh
docker compose up -d redis-ui
```

Then the redis UI can be accessed at [http://localhost:7843](http://localhost:7843)

## Services

```sh
npx nx serve auth-service
npx nx serve financial-service
npx nx serve user-service
```

Refer to the [REST API documentation](./documentation.md) to see the available endpoints.
