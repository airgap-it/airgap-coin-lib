#!/bin/bash

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/account-share-response.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/account-share-response.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/message-sign-request.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/message-sign-request.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/message-sign-response.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/message-sign-response.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/signed-transaction-ethereum.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-response-ethereum.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/signed-transaction-bitcoin.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-response-bitcoin.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/signed-transaction-cosmos.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-response-cosmos.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/signed-transaction-aeternity.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-response-aeternity.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/signed-transaction-tezos.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-response-tezos.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/signed-transaction-substrate.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-response-substrate.json

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/unsigned-transaction-ethereum.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-request-ethereum.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/unsigned-transaction-bitcoin.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-request-bitcoin.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/unsigned-transaction-cosmos.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-request-cosmos.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/unsigned-transaction-aeternity.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-request-aeternity.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/unsigned-transaction-tezos.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-request-tezos.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/schemas/definitions/unsigned-transaction-substrate.ts' --tsconfig 'tsconfig.json' > src/serializer/schemas/generated/transaction-sign-request-substrate.json

# Tests
./node_modules/.bin/ts-json-schema-generator --path 'test/serializer/schemas/AnyMessage.ts' --tsconfig 'tsconfig.json' > test/serializer/schemas/generated/any-message.json
./node_modules/.bin/ts-json-schema-generator --path 'test/serializer/schemas/ArrayMessage.ts' --tsconfig 'tsconfig.json' > test/serializer/schemas/generated/array-message.json
./node_modules/.bin/ts-json-schema-generator --path 'test/serializer/schemas/BooleanMessage.ts' --tsconfig 'tsconfig.json' > test/serializer/schemas/generated/boolean-message.json
./node_modules/.bin/ts-json-schema-generator --path 'test/serializer/schemas/ComplexMessage.ts' --tsconfig 'tsconfig.json' > test/serializer/schemas/generated/complex-message.json
./node_modules/.bin/ts-json-schema-generator --path 'test/serializer/schemas/NumberMessage.ts' --tsconfig 'tsconfig.json' > test/serializer/schemas/generated/number-message.json
./node_modules/.bin/ts-json-schema-generator --path 'test/serializer/schemas/ObjectMessage.ts' --tsconfig 'tsconfig.json' > test/serializer/schemas/generated/object-message.json
./node_modules/.bin/ts-json-schema-generator --path 'test/serializer/schemas/StringMessage.ts' --tsconfig 'tsconfig.json' > test/serializer/schemas/generated/string-message.json
./node_modules/.bin/ts-json-schema-generator --path 'test/serializer/schemas/SimpleMessage.ts' --tsconfig 'tsconfig.json' > test/serializer/schemas/generated/simple-message.json
./node_modules/.bin/ts-json-schema-generator --path 'test/serializer/schemas/TupleMessage.ts' --tsconfig 'tsconfig.json' > test/serializer/schemas/generated/tuple-message.json
