FROM node:20.8.1-alpine3.17

WORKDIR /home/node/app
COPY package.json package-lock.json ./
RUN npm i --force