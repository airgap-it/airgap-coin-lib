#!/bin/bash
echo "//registry.npmjs.org/:_authToken=$NPM_AUTH_TOKEN" > .npmrc

$VERSION = "$(node -pe 'JSON.parse(process.argv[1]).version' \"$(cat package.json)\")"

if [[ $VERSION == *"beta"* ]]; then
  npm publish --tag next
else
  npm publish
fi

npm publish 
rm .npmrc