'use strict'
exports.__esModule = true
var fs_1 = require('fs')
var replaceInFile = function (file, src, dest) {
  var content = fs_1.readFileSync(file, 'utf-8')
  var newContent = content.split(src).join(dest)
  fs_1.writeFileSync(file, newContent)
}
replaceInFile('./node_modules/@polkadot/util/bn/max.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/@polkadot/util/bn/min.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/@polkadot/util/bn/toBn.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/@polkadot/util/bn/toHex.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/@polkadot/util/bn/toU8a.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/@polkadot/util/compact/fromU8a.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/@polkadot/util/compact/toU8a.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/@polkadot/util/format/formatBalance.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/@polkadot/util/format/formatElapsed.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/@polkadot/util/format/formatNumber.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/@polkadot/util/hex/toBn.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/@polkadot/util/is/bn.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/@polkadot/util/u8a/toBn.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('./node_modules/@polkadot/util/types.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
