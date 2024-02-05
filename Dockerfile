FROM node:21.6.1-alpine3.18

WORKDIR /home/node/app
COPY package.json package-lock.json ./
RUN npm i