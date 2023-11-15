FROM node:20.8.1-alpine3.17

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm i