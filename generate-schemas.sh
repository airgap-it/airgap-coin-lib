#!/bin/bash

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/definitions/account-share-response.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/generated/account-share-response.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/definitions/transaction-sign-response.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/generated/transaction-sign-response.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/definitions/message-sign-request.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/generated/message-sign-request.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/definitions/message-sign-response.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/generated/message-sign-response.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/definitions/signed-transaction-ethereum.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/generated/signed-transaction-ethereum.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/definitions/signed-transaction-bitcoin.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/generated/signed-transaction-bitcoin.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/definitions/signed-transaction-cosmos.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/generated/signed-transaction-cosmos.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/definitions/signed-transaction-aeternity.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/generated/signed-transaction-aeternity.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/definitions/signed-transaction-tezos.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/generated/signed-transaction-tezos.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/definitions/unsigned-transaction-ethereum.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/generated/unsigned-transaction-ethereum.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/definitions/unsigned-transaction-bitcoin.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/generated/unsigned-transaction-bitcoin.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/definitions/unsigned-transaction-cosmos.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/generated/unsigned-transaction-cosmos.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/definitions/unsigned-transaction-aeternity.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/generated/unsigned-transaction-aeternity.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/definitions/unsigned-transaction-tezos.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/generated/unsigned-transaction-tezos.json