#!/bin/bash

./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/account-share-response.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/account-share-response.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/transaction-sign-response.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/transaction-sign-response.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/message-sign-request.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/message-sign-request.json
./node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v2/schemas/message-sign-response.ts' --tsconfig 'tsconfig.json' > src/serializer/v2/schemas/message-sign-response.json