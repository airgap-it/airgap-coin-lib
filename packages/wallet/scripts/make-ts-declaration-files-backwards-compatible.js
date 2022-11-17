'use strict'
exports.__esModule = true
var fs_1 = require('fs')
var replaceInFile = function (file, src, dest) {
  var content = fs_1.readFileSync(file, 'utf-8')
  var newContent = content.split(src).join(dest)
  fs_1.writeFileSync(file, newContent)
}
replaceInFile('./dist/wallet/AirGapWallet.d.ts', 'get receivingPublicAddress(): string;', 'readonly receivingPublicAddress: string;')
