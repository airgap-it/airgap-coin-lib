'use strict'
exports.__esModule = true
var fs_1 = require('fs')
var replaceInFile = function (file, src, dest) {
  var content = fs_1.readFileSync(file, 'utf-8')
  var newContent = content.split(src).join(dest)
  fs_1.writeFileSync(file, newContent)
}
replaceInFile('./node_modules/ethereumjs-util/dist/account.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/ethereumjs-util/dist/address.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/ethereumjs-util/dist/bytes.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/ethereumjs-util/dist/constants.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/ethereumjs-util/dist/externals.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/ethereumjs-util/dist/types.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
