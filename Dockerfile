FROM node:15-slim

RUN apt-get update && apt-get install -yq git python build-essential

# create app directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY package.json /app
COPY package-lock.json /app
COPY packages/core/package.json /app/packages/core/
COPY packages/core/package-lock.json /app/packages/core/
COPY packages/core/scripts /app/packages/core/scripts
COPY scripts /app/scripts
COPY lerna.json /app

# install dependencies
RUN npm ci

# Bundle app source
COPY . /app

RUN chmod +x ./npm-ci-publish-beta-only.sh
RUN chmod +x ./npm-ci-publish.sh

# set to production
RUN export NODE_ENV=production

# bootstrap
RUN npx lerna bootstrap

# build
RUN npm run build

# browserify
RUN npm i -D browserify
RUN npm run browserify

CMD ["npm", "run", "test"]