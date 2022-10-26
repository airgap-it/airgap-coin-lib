#!/bin/bash

node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/src/v3/schemas/definitions/account-share-request.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/account-share-request.json

node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/src/v3/schemas/definitions/account-share-response.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/account-share-response.json

node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/src/v3/schemas/definitions/message-sign-request.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/message-sign-request.json

node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/src/v3/schemas/definitions/message-sign-response.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/message-sign-response.json

node_modules/.bin/ts-json-schema-generator --path 'packages/ethereum/src/types/signed-transaction-ethereum.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-response-ethereum.json
node_modules/.bin/ts-json-schema-generator --path 'packages/bitcoin/src/types/signed-transaction-bitcoin-segwit.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-response-bitcoin-segwit.json
node_modules/.bin/ts-json-schema-generator --path 'packages/bitcoin/src/types/signed-transaction-bitcoin.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-response-bitcoin.json
node_modules/.bin/ts-json-schema-generator --path 'packages/cosmos/src/types/signed-transaction-cosmos.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-response-cosmos.json
node_modules/.bin/ts-json-schema-generator --path 'packages/aeternity/src/types/signed-transaction-aeternity.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-response-aeternity.json
node_modules/.bin/ts-json-schema-generator --path 'packages/tezos/src/types/signed-transaction-tezos.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-response-tezos.json
node_modules/.bin/ts-json-schema-generator --path 'packages/tezos/src/types/signed-transaction-tezos-sapling.ts' --tsconfig "tsconfig.json" > packages/serializer/src/v3/schemas/generated/transaction-sign-response-tezos-sapling.json
node_modules/.bin/ts-json-schema-generator --path 'packages/substrate/src/types/signed-transaction-substrate.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-response-substrate.json

node_modules/.bin/ts-json-schema-generator --path 'packages/ethereum/src/types/unsigned-transaction-ethereum-typed.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-request-ethereum-typed.json
node_modules/.bin/ts-json-schema-generator --path 'packages/ethereum/src/types/unsigned-transaction-ethereum.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-request-ethereum.json
node_modules/.bin/ts-json-schema-generator --path 'packages/bitcoin/src/types/unsigned-transaction-bitcoin-segwit.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-request-bitcoin-segwit.json
node_modules/.bin/ts-json-schema-generator --path 'packages/bitcoin/src/types/unsigned-transaction-bitcoin.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-request-bitcoin.json
node_modules/.bin/ts-json-schema-generator --path 'packages/cosmos/src/types/unsigned-transaction-cosmos.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-request-cosmos.json
node_modules/.bin/ts-json-schema-generator --path 'packages/aeternity/src/types/unsigned-transaction-aeternity.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-request-aeternity.json
node_modules/.bin/ts-json-schema-generator --path 'packages/tezos/src/types/unsigned-transaction-tezos.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-request-tezos.json
node_modules/.bin/ts-json-schema-generator --path 'packages/tezos/src/types/unsigned-transaction-tezos-sapling.ts' --tsconfig "tsconfig.json" > packages/serializer/src/v3/schemas/generated/transaction-sign-request-tezos-sapling.json
node_modules/.bin/ts-json-schema-generator --path 'packages/substrate/src/types/unsigned-transaction-substrate.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/transaction-sign-request-substrate.json

# Tests
node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/AnyMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/any-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/ArrayMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/array-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/BooleanMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/boolean-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/ComplexMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/complex-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/HexMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/hex-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/NumberMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/number-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/ObjectMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/object-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/StringMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/string-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/SimpleMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/simple-message.json
node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/TupleMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/tuple-message.json
