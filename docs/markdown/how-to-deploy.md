# How to deploy

## Pull the Docker images from Docker Hub

```sh
docker pull shimisnow/pocnestjs-auth-service:latest
docker pull shimisnow/pocnestjs-financial-service:latest
```

## OR build the Docker images locally

Build the Docker images for each service with the commands:

```sh
docker compose build base-image-development
docker compose build base-image-production
docker compose build auth-service
docker compose build financial-service
```

`base-image-development` and `base-image-production` are images with the node_modules folder. They need to be generated only when the package.json is modified and are used at Docker multi-stage builds.

## Deploy with Docker

The auxiliary services can be launched with:

```sh
docker compose up -d database-authentication database-financial cache
```

The services can be started with:

```sh
docker compose --env-file docker.env up -d auth-service financial-service
```

The `docker.env` has environment configs for deploy with docker compose.
