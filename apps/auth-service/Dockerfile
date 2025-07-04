FROM pocnestjs-base-dev:latest AS base

WORKDIR /home/node/app
COPY . .
RUN npx nx build auth-service --prod

##########
FROM pocnestjs-base-prod:latest

WORKDIR /home/node/app
COPY --from=base /home/node/app/dist/apps/auth-service/main.js ./
RUN rm -f package.json package-lock.json
ENV NODE_ENV="production"

CMD ["node", "main.js"]
