FROM node:22.9.0-alpine3.19

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install --no-audit
