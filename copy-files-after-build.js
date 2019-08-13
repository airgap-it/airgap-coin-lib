let fs = require('fs')

fs.createReadStream('./src/dependencies/src/axios-0.19.0/package.json').pipe(
  fs.createWriteStream('./dist/dependencies/src/axios-0.19.0/package.json')
)
