# How to deploy

## Deploy with Docker

The services can be started with:

```sh
docker compose --env-file docker.env up -d auth-service financial-service user-service
```

The `docker.env` has environment configs for deploy with docker compose.

The auxiliary services can be launched with:

```sh
docker compose up -d database-authentication database-financial database-info redis
```

## Build the Docker image locally

Build the Docker images for each service with the commands:

```sh
docker compose build base-image
docker compose build auth-service
docker compose build financial-service
docker compose build user-service
```

`base-image` is a image with the node_modules folder. It is generate only one time to be used Docker multi-stage builds.
