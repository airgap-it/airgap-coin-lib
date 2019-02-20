#!/bin/bash
echo "//registry.npmjs.org/:_authToken=$NPM_AUTH_TOKEN" > .npmrc

VERSION=$(node -pe 'JSON.parse(process.argv[1]).version.indexOf("beta")' "$(cat package.json)")

if [ "$VERSION" = "-1" ]
then
  echo "cannot publish non-beta version"
else
  echo "version is beta, using --tag next"
  npm publish --tag next
fi

rm .npmrc