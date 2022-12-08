import { readFileSync, writeFileSync } from 'fs'

const replaceInFile: (file: string, src: string, dest: string) => void = (file: string, src: string, dest: string): void => {
  const content: string = readFileSync(file, 'utf-8')
  const newContent: string = content.split(src).join(dest)
  writeFileSync(file, newContent)
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
