# How to run

## Environment variables

Copy the file `example.env` to `.env` and configure the values

## Docker containers (database and cache)

First, start the databases and the cache manager:

```sh
docker compose up -d redis database-authentication database-financial
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
```

Refer to the [REST API documentation](./documentation.md) to see the available endpoints.
