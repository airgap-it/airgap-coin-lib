#!/bin/bash

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/account-share-response.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/account-share-response.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/message-sign-request.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/message-sign-request.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/message-sign-response.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/message-sign-response.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/transaction-sign-response-ethereum.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-response-ethereum.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/transaction-sign-response-bitcoin.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-response-bitcoin.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/transaction-sign-response-cosmos.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-response-cosmos.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/transaction-sign-response-aeternity.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-response-aeternity.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/transaction-sign-response-tezos.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-response-tezos.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/transaction-sign-response-substrate.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-response-substrate.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/transaction-sign-request-ethereum.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-request-ethereum.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/transaction-sign-request-bitcoin.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-request-bitcoin.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/transaction-sign-request-cosmos.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-request-cosmos.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/transaction-sign-request-aeternity.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-request-aeternity.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/transaction-sign-request-tezos.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-request-tezos.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/transaction-sign-request-substrate.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-request-substrate.json
