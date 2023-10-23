FROM node:20-alpine As development

# RUN npm i -g yarn

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

# RUN yarn fetch --prod

COPY --chown=node:node . .

RUN yarn install

RUN npm install -D prisma-dbml-generator

RUN yarn prisma generate

USER node

# BUILD

FROM node:20 As build

# RUN npm i -g yarn

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN yarn build

ENV NODE_ENV production

RUN npm install -D prisma-dbml-generator

RUN yarn add --prod --ignore-scripts

RUN npx prisma generate && npx prisma db push

USER node

# PRODUCTION

FROM node:20-alpine As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/src/main.js" ]
