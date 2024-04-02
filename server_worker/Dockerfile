FROM node:20.11-alpine

RUN mkdir -p /var/www/node/pendulum && chown -R node:node /var/www/node/pendulum

WORKDIR /var/www/node/pendulum

COPY package*.json ./

RUN npm install

COPY --chown=node:node . .

RUN npm run build

EXPOSE 8080

CMD [ "node", "out/index.js" ]
