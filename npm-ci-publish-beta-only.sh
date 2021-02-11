#!/bin/bash
echo "//registry.npmjs.org/:_authToken=$NPM_AUTH_TOKEN" > .npmrc

git update-index --assume-unchanged npm-ci-publish.sh
git update-index --assume-unchanged npm-ci-publish-beta-only.sh

git update-index --assume-unchanged package.json
git update-index --assume-unchanged package-lock.json

git update-index --assume-unchanged packages/core/package.json
git update-index --assume-unchanged packages/core/package-lock.json

VERSION=$(node -pe 'JSON.parse(process.argv[1]).version.indexOf("beta")' "$(cat lerna.json)")

if [ "$VERSION" = "-1" ]
then
  echo "cannot publish non-beta version"
else
  echo "version is beta, using --tag next"
  npx lerna publish from-package --contents dist --dist-tag next --yes
fi

rm .npmrc