#!/bin/bash

# node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/src/v3/schemas/definitions/account-share-request.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/account-share-request.json

# node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/src/v3/schemas/definitions/account-share-response.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/account-share-response.json

# node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/src/v3/schemas/definitions/message-sign-request.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/message-sign-request.json

# node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/src/v3/schemas/definitions/message-sign-response.ts' --tsconfig 'tsconfig.json' > packages/serializer/src/v3/schemas/generated/message-sign-response.json

# Aeternity
# node_modules/.bin/ts-json-schema-generator --path 'packages/aeternity/src/v0/types/signed-transaction-aeternity.ts' --tsconfig 'tsconfig.json' > packages/aeternity/src/v0/serializer/schemas/v3/transaction-sign-response-aeternity.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/aeternity/src/v0/types/unsigned-transaction-aeternity.ts' --tsconfig 'tsconfig.json' > packages/aeternity/src/v0/serializer/schemas/v3/transaction-sign-request-aeternity.json

# node_modules/.bin/ts-json-schema-generator --path 'packages/aeternity/src/v1/serializer/v3/schemas/definitions/transaction-sign-response-aeternity.ts' --tsconfig 'tsconfig.json' -c > packages/aeternity/src/v1/serializer/v3/schemas/generated/transaction-sign-response-aeternity.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/aeternity/src/v1/serializer/v3/schemas/definitions/transaction-sign-request-aeternity.ts' --tsconfig 'tsconfig.json' -c > packages/aeternity/src/v1/serializer/v3/schemas/generated/transaction-sign-request-aeternity.json

# Astar
# node_modules/.bin/ts-json-schema-generator --path 'packages/astar/src/v1/serializer/v3/schemas/definitions/transaction-sign-response-astar.ts' --tsconfig 'tsconfig.json' -c > packages/astar/src/v1/serializer/v3/schemas/generated/transaction-sign-response-astar.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/astar/src/v1/serializer/v3/schemas/definitions/transaction-sign-request-astar.ts' --tsconfig 'tsconfig.json' -c > packages/astar/src/v1/serializer/v3/schemas/generated/transaction-sign-request-astar.json

# Bitcoin
# node_modules/.bin/ts-json-schema-generator --path 'packages/bitcoin/src/v0/types/signed-transaction-bitcoin-segwit.ts' --tsconfig 'tsconfig.json' > packages/bitcoin/src/v0/serializer/schemas/v3/transaction-sign-response-bitcoin-segwit.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/bitcoin/src/v0/types/signed-transaction-bitcoin.ts' --tsconfig 'tsconfig.json' > packages/bitcoin/src/v0/serializer/schemas/v3/transaction-sign-response-bitcoin.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/bitcoin/src/v0/types/unsigned-transaction-bitcoin-segwit.ts' --tsconfig 'tsconfig.json' > packages/bitcoin/src/v0/serializer/schemas/v3/transaction-sign-request-bitcoin-segwit.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/bitcoin/src/v0/types/unsigned-transaction-bitcoin.ts' --tsconfig 'tsconfig.json' > packages/bitcoin/src/v0/serializer/schemas/v3/transaction-sign-request-bitcoin.json

# node_modules/.bin/ts-json-schema-generator --path 'packages/bitcoin/src/v1/serializer/v3/schemas/definitions/transaction-sign-response-bitcoin-segwit.ts' --tsconfig 'tsconfig.json' -c > packages/bitcoin/src/v1/serializer/v3/schemas/generated/transaction-sign-response-bitcoin-segwit.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/bitcoin/src/v1/serializer/v3/schemas/definitions/transaction-sign-response-bitcoin.ts' --tsconfig 'tsconfig.json' -c > packages/bitcoin/src/v1/serializer/v3/schemas/generated/transaction-sign-response-bitcoin.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/bitcoin/src/v1/serializer/v3/schemas/definitions/transaction-sign-request-bitcoin-segwit.ts' --tsconfig 'tsconfig.json' -c > packages/bitcoin/src/v1/serializer/v3/schemas/generated/transaction-sign-request-bitcoin-segwit.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/bitcoin/src/v1/serializer/v3/schemas/definitions/transaction-sign-request-bitcoin.ts' --tsconfig 'tsconfig.json' -c > packages/bitcoin/src/v1/serializer/v3/schemas/generated/transaction-sign-request-bitcoin.json

# Cosmos
# node_modules/.bin/ts-json-schema-generator --path 'packages/cosmos/src/v0/types/signed-transaction-cosmos.ts' --tsconfig 'tsconfig.json' > packages/cosmos/src/v0/serializer/schemas/v3/transaction-sign-response-cosmos.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/cosmos/src/v0/types/unsigned-transaction-cosmos.ts' --tsconfig 'tsconfig.json' > packages/cosmos/src/v0/serializer/schemas/v3/transaction-sign-request-cosmos.json

# node_modules/.bin/ts-json-schema-generator --path 'packages/cosmos/src/v1/serializer/v3/schemas/definitions/transaction-sign-response-cosmos.ts' --tsconfig 'tsconfig.json' -c > packages/cosmos/src/v1/serializer/v3/schemas/generated/transaction-sign-response-cosmos.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/cosmos/src/v1/serializer/v3/schemas/definitions/transaction-sign-request-cosmos.ts' --tsconfig 'tsconfig.json' -c > packages/cosmos/src/v1/serializer/v3/schemas/generated/transaction-sign-request-cosmos.json

# Ethereum
# node_modules/.bin/ts-json-schema-generator --path 'packages/ethereum/src/v0/types/signed-transaction-ethereum.ts' --tsconfig 'tsconfig.json' > packages/ethereum/src/v0/serializer/schemas/v3/transaction-sign-response-ethereum.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/ethereum/src/v0/types/unsigned-transaction-ethereum-typed.ts' --tsconfig 'tsconfig.json' > packages/ethereum/src/v0/serializer/schemas/v3/transaction-sign-request-ethereum-typed.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/ethereum/src/v0/types/unsigned-transaction-ethereum.ts' --tsconfig 'tsconfig.json' > packages/ethereum/src/v0/serializer/schemas/v3/transaction-sign-request-ethereum.json

# node_modules/.bin/ts-json-schema-generator --path 'packages/ethereum/src/v1/serializer/v3/schemas/definitions/transaction-sign-response-ethereum.ts' --tsconfig 'tsconfig.json' -c > packages/ethereum/src/v1/serializer/v3/schemas/generated/transaction-sign-response-ethereum.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/ethereum/src/v1/serializer/v3/schemas/definitions/transaction-sign-request-ethereum.ts' --tsconfig 'tsconfig.json' -c > packages/ethereum/src/v1/serializer/v3/schemas/generated/transaction-sign-request-ethereum.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/ethereum/src/v1/serializer/v3/schemas/definitions/transaction-sign-request-ethereum-typed.ts' --tsconfig 'tsconfig.json' -c > packages/ethereum/src/v1/serializer/v3/schemas/generated/transaction-sign-request-ethereum-typed.json

# Groestlcoin
# node_modules/.bin/ts-json-schema-generator --path 'packages/groestlcoin/src/v1/serializer/v3/schemas/definitions/transaction-sign-response-groestlcoin.ts' --tsconfig 'tsconfig.json' -c > packages/groestlcoin/src/v1/serializer/v3/schemas/generated/transaction-sign-response-groestlcoin.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/groestlcoin/src/v1/serializer/v3/schemas/definitions/transaction-sign-request-groestlcoin.ts' --tsconfig 'tsconfig.json' -c > packages/groestlcoin/src/v1/serializer/v3/schemas/generated/transaction-sign-request-groestlcoin.json

# Moonbeam
# node_modules/.bin/ts-json-schema-generator --path 'packages/moonbeam/src/v1/serializer/v3/schemas/definitions/transaction-sign-response-moonbeam.ts' --tsconfig 'tsconfig.json' -c > packages/moonbeam/src/v1/serializer/v3/schemas/generated/transaction-sign-response-moonbeam.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/moonbeam/src/v1/serializer/v3/schemas/definitions/transaction-sign-request-moonbeam.ts' --tsconfig 'tsconfig.json' -c > packages/moonbeam/src/v1/serializer/v3/schemas/generated/transaction-sign-request-moonbeam.json

# Polkadot
# node_modules/.bin/ts-json-schema-generator --path 'packages/polkadot/src/v1/serializer/v3/schemas/definitions/transaction-sign-response-polkadot.ts' --tsconfig 'tsconfig.json' -c > packages/polkadot/src/v1/serializer/v3/schemas/generated/transaction-sign-response-polkadot.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/polkadot/src/v1/serializer/v3/schemas/definitions/transaction-sign-request-polkadot.ts' --tsconfig 'tsconfig.json' -c > packages/polkadot/src/v1/serializer/v3/schemas/generated/transaction-sign-request-polkadot.json

# Tezos
# node_modules/.bin/ts-json-schema-generator --path 'packages/tezos/src/v0/types/signed-transaction-tezos.ts' --tsconfig 'tsconfig.json' > packages/tezos/src/v0/serializer/schemas/v3/transaction-sign-response-tezos.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/tezos/src/v0/types/signed-transaction-tezos-sapling.ts' --tsconfig "tsconfig.json" > packages/tezos/src/v0/serializer/schemas/v3/transaction-sign-response-tezos-sapling.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/tezos/src/v0/types/unsigned-transaction-tezos.ts' --tsconfig 'tsconfig.json' > packages/tezos/src/v0/serializer/schemas/v3/transaction-sign-request-tezos.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/tezos/src/v0/types/unsigned-transaction-tezos-sapling.ts' --tsconfig "tsconfig.json" > packages/tezos/src/v0/serializer/schemas/v3/transaction-sign-request-tezos-sapling.json

# node_modules/.bin/ts-json-schema-generator --path 'packages/tezos/src/v1/serializer/v3/schemas/definitions/transaction-sign-response-tezos.ts' --tsconfig 'tsconfig.json' -c > packages/tezos/src/v1/serializer/v3/schemas/generated/transaction-sign-response-tezos.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/tezos/src/v1/serializer/v3/schemas/definitions/transaction-sign-response-tezos-sapling.ts' --tsconfig 'tsconfig.json' -c > packages/tezos/src/v1/serializer/v3/schemas/generated/transaction-sign-response-tezos-sapling.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/tezos/src/v1/serializer/v3/schemas/definitions/transaction-sign-request-tezos.ts' --tsconfig 'tsconfig.json' -c > packages/tezos/src/v1/serializer/v3/schemas/generated/transaction-sign-request-tezos.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/tezos/src/v1/serializer/v3/schemas/definitions/transaction-sign-request-tezos-sapling.ts' --tsconfig 'tsconfig.json' -c > packages/tezos/src/v1/serializer/v3/schemas/generated/transaction-sign-request-tezos-sapling.json

# ICP
# node_modules/.bin/ts-json-schema-generator --path 'packages/icp/src/v1/serializer/v3/schemas/definitions/transaction-sign-response-icp.ts' --tsconfig 'tsconfig.json' -c > packages/icp/src/v1/serializer/v3/schemas/generated/transaction-sign-response-icp.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/icp/src/v1/serializer/v3/schemas/definitions/transaction-sign-request-icp.ts' --tsconfig 'tsconfig.json' -c > packages/icp/src/v1/serializer/v3/schemas/generated/transaction-sign-request-icp.json


# Tests
# node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/AnyMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/any-message.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/ArrayMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/array-message.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/BooleanMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/boolean-message.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/ComplexMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/complex-message.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/HexMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/hex-message.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/NumberMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/number-message.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/ObjectMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/object-message.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/StringMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/string-message.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/SimpleMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/simple-message.json
# node_modules/.bin/ts-json-schema-generator --path 'packages/serializer/test/schemas/definitions/TupleMessage.ts' --tsconfig 'tsconfig.json' > packages/serializer/test/schemas/generated/tuple-message.json
