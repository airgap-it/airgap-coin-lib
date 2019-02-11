FROM node:8-slim

RUN apt-get update && apt-get install -yq git python build-essential

# create app directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies, using wildcard if package-lock exists
COPY package.json /app
COPY package-lock.json /app

# install dependencies
RUN npm install

# Bundle app source
COPY . /app

RUN chmod +x ./npm-ci-publish-beta-only.sh
RUN chmod +x ./npm-ci-publish.sh

# set to production
RUN export NODE_ENV=production

# build
RUN npm run build

CMD ["npm", "run", "test"]
