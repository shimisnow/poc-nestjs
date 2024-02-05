FROM pocnestjs-base:latest as base

WORKDIR /home/node/app
COPY . .
RUN npx nx build auth-service

##########
FROM pocnestjs-base:latest

WORKDIR /home/node/app
COPY --from=base /home/node/app/dist/apps/auth-service/main.js ./
ENV NODE_ENV="production"

CMD ["node", "main.js"]
