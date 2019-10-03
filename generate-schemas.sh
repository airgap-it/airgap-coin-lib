#!/bin/bash

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/account-share-response.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/account-share-response.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/transaction-sign-response.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/transaction-sign-response.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/message-sign-request.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/message-sign-request.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/message-sign-response.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/message-sign-response.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/signed-transaction-ethereum.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/signed-transaction-ethereum.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/signed-transaction-bitcoin.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/signed-transaction-bitcoin.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/signed-transaction-aeternity.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/signed-transaction-aeternity.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/signed-transaction-tezos.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/signed-transaction-tezos.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/unsigned-transaction-ethereum.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/unsigned-transaction-ethereum.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/unsigned-transaction-bitcoin.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/unsigned-transaction-bitcoin.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/unsigned-transaction-aeternity.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/unsigned-transaction-aeternity.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/unsigned-transaction-tezos.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/unsigned-transaction-tezos.json