FROM node:16.13.1

RUN apt-get update && apt-get install -yq git python build-essential

# create app directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY package.json /app
COPY package-lock.json /app
COPY scripts /app/scripts

COPY packages/core/package.json /app/packages/core/
COPY packages/core/scripts /app/packages/core/scripts

COPY packages/aeternity/package.json /app/packages/aeternity/
COPY packages/aeternity/scripts /app/packages/aeternity/scripts

COPY packages/astar/package.json /app/packages/astar/
COPY packages/astar/scripts /app/packages/astar/scripts

COPY packages/bitcoin/package.json /app/packages/bitcoin/
COPY packages/bitcoin/scripts /app/packages/bitcoin/scripts

COPY packages/cosmos/package.json /app/packages/cosmos/
COPY packages/cosmos/scripts /app/packages/cosmos/scripts

COPY packages/crypto/package.json /app/packages/crypto/
COPY packages/crypto/scripts /app/packages/crypto/scripts

COPY packages/ethereum/package.json /app/packages/ethereum/
COPY packages/ethereum/scripts /app/packages/ethereum/scripts

COPY packages/groestlcoin/package.json /app/packages/groestlcoin/
COPY packages/groestlcoin/scripts /app/packages/groestlcoin/scripts

COPY packages/icp/package.json /app/packages/icp/
COPY packages/icp/scripts /app/packages/icp/scripts

COPY packages/mina/package.json /app/packages/mina/
COPY packages/mina/scripts /app/packages/mina/scripts

COPY packages/module-kit/package.json /app/packages/module-kit/
COPY packages/module-kit/scripts /app/packages/module-kit/scripts

COPY packages/moonbeam/package.json /app/packages/moonbeam/
COPY packages/moonbeam/scripts /app/packages/moonbeam/scripts

COPY packages/optimism/package.json /app/packages/optimism/
COPY packages/optimism/scripts /app/packages/optimism/scripts

COPY packages/polkadot/package.json /app/packages/polkadot/
COPY packages/polkadot/scripts /app/packages/polkadot/scripts

COPY packages/substrate/package.json /app/packages/substrate/
COPY packages/substrate/scripts /app/packages/substrate/scripts

COPY packages/tezos/package.json /app/packages/tezos/
COPY packages/tezos/scripts /app/packages/tezos/scripts

COPY packages/serializer/package.json /app/packages/serializer/
COPY packages/serializer/scripts /app/packages/serializer/scripts

COPY lerna.json /app

# install dependencies
RUN npm ci

# Bundle app source
COPY . /app

RUN chmod +x ./npm-ci-publish-beta-only.sh
RUN chmod +x ./npm-ci-publish.sh

# set to production
RUN export NODE_ENV=production

# build
RUN npm run build

CMD ["npm", "run", "test"]