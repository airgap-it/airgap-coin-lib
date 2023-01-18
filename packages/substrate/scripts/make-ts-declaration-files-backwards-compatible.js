'use strict'
exports.__esModule = true
var fs_1 = require('fs')
var replaceInFile = function (file, src, dest) {
  var content = fs_1.readFileSync(file, 'utf-8')
  var newContent = content.split(src).join(dest)
  fs_1.writeFileSync(file, newContent)
}
replaceInFile('./dist/v0/protocol/common/data/scale/type/SCALEEra.d.ts', 'get isMortal(): boolean;', 'readonly isMortal: boolean;')
replaceInFile('./dist/v0/protocol/common/data/scale/type/SCALEHash.d.ts', 'get isEmpty(): boolean;', 'readonly isEmpty: boolean;')
replaceInFile(
  './dist/v0/protocol/common/data/metadata/v11/module/storage/MetadataV11StorageEntryType.d.ts',
  'protected get scaleFields(): SCALEType[];',
  'protected readonly scaleFields: SCALEType[];'
)
replaceInFile(
  './dist/v0/protocol/common/data/transaction/SubstrateSignature.d.ts',
  'get isSigned(): boolean;',
  'readonly isSigned: boolean;'
)
replaceInFile('./dist/v1/data/scale/type/SCALEEra.d.ts', 'get isMortal(): boolean;', 'readonly isMortal: boolean;')
replaceInFile('./dist/v1/data/scale/type/SCALEHash.d.ts', 'get isEmpty(): boolean;', 'readonly isEmpty: boolean;')
replaceInFile(
  './dist/v1/data/metadata/v11/module/storage/MetadataV11StorageEntryType.d.ts',
  'protected get scaleFields(): SCALEType[];',
  'protected readonly scaleFields: SCALEType[];'
)
replaceInFile('./dist/v1/data/transaction/SubstrateSignature.d.ts', 'get isSigned(): boolean;', 'readonly isSigned: boolean;')
