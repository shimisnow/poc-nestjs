FROM pocnestjs-base-dev:latest as base

WORKDIR /home/node/app
COPY . .
RUN npx nx build financial-service

##########
FROM pocnestjs-base-prod:latest

WORKDIR /home/node/app
COPY --from=base /home/node/app/dist/apps/financial-service/main.js ./
ENV NODE_ENV="production"

CMD ["node", "main.js"]
