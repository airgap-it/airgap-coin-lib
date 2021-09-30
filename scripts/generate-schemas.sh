#!/bin/bash

node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/account-share-request.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/account-share-request.json

node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/account-share-response.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/account-share-response.json

node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/message-sign-request.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/message-sign-request.json

node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/message-sign-response.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/message-sign-response.json

node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/signed-transaction-ethereum.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/transaction-sign-response-ethereum.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/signed-transaction-bitcoin-segwit.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/transaction-sign-response-bitcoin-segwit.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/signed-transaction-bitcoin.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/transaction-sign-response-bitcoin.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/signed-transaction-cosmos.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/transaction-sign-response-cosmos.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/signed-transaction-aeternity.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/transaction-sign-response-aeternity.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/signed-transaction-tezos.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/transaction-sign-response-tezos.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/signed-transaction-tezos-sapling.ts' --tsconfig "tsconfig.json" > packages/core/src/serializer-v3/schemas/generated/transaction-sign-response-tezos-sapling.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/signed-transaction-substrate.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/transaction-sign-response-substrate.json

node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/unsigned-transaction-ethereum.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/transaction-sign-request-ethereum.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/unsigned-transaction-bitcoin-segwit.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/transaction-sign-request-bitcoin-segwit.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/unsigned-transaction-bitcoin.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/transaction-sign-request-bitcoin.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/unsigned-transaction-cosmos.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/transaction-sign-request-cosmos.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/unsigned-transaction-aeternity.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/transaction-sign-request-aeternity.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/unsigned-transaction-tezos.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/transaction-sign-request-tezos.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/unsigned-transaction-tezos-sapling.ts' --tsconfig "tsconfig.json" > packages/core/src/serializer-v3/schemas/generated/transaction-sign-request-tezos-sapling.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/src/serializer-v3/schemas/definitions/unsigned-transaction-substrate.ts' --tsconfig 'tsconfig.json' > packages/core/src/serializer-v3/schemas/generated/transaction-sign-request-substrate.json

# Tests
node_modules/.bin/ts-json-schema-generator --path 'packages/core/test/serializer/schemas/definitions/AnyMessage.ts' --tsconfig 'tsconfig.json' > packages/core/test/serializer/schemas/generated/any-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/test/serializer/schemas/definitions/ArrayMessage.ts' --tsconfig 'tsconfig.json' > packages/core/test/serializer/schemas/generated/array-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/test/serializer/schemas/definitions/BooleanMessage.ts' --tsconfig 'tsconfig.json' > packages/core/test/serializer/schemas/generated/boolean-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/test/serializer/schemas/definitions/ComplexMessage.ts' --tsconfig 'tsconfig.json' > packages/core/test/serializer/schemas/generated/complex-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/test/serializer/schemas/definitions/HexMessage.ts' --tsconfig 'tsconfig.json' > packages/core/test/serializer/schemas/generated/hex-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/test/serializer/schemas/definitions/NumberMessage.ts' --tsconfig 'tsconfig.json' > packages/core/test/serializer/schemas/generated/number-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/test/serializer/schemas/definitions/ObjectMessage.ts' --tsconfig 'tsconfig.json' > packages/core/test/serializer/schemas/generated/object-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/test/serializer/schemas/definitions/StringMessage.ts' --tsconfig 'tsconfig.json' > packages/core/test/serializer/schemas/generated/string-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/test/serializer/schemas/definitions/SimpleMessage.ts' --tsconfig 'tsconfig.json' > packages/core/test/serializer/schemas/generated/simple-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/core/test/serializer/schemas/definitions/TupleMessage.ts' --tsconfig 'tsconfig.json' > packages/core/test/serializer/schemas/generated/tuple-message.json
