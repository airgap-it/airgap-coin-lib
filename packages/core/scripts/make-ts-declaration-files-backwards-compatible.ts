import { readFileSync, writeFileSync } from 'fs'

const replaceInFile: (file: string, src: string, dest: string) => void = (file: string, src: string, dest: string): void => {
  const content: string = readFileSync(file, 'utf-8')
  const newContent: string = content.split(src).join(dest)
  writeFileSync(file, newContent)
}

replaceInFile('./dist/protocols/ethereum/BaseEthereumProtocol.d.ts', 'get subProtocols(): any[];', 'readonly subProtocols: any[];')
replaceInFile('./dist/protocols/tezos/TezosProtocol.d.ts', 'get subProtocols(): any[];', 'readonly subProtocols: any[];')
replaceInFile('./dist/wallet/AirGapWallet.d.ts', 'get receivingPublicAddress(): string;', 'readonly receivingPublicAddress: string;')
replaceInFile(
  './dist/serializer/utils/toBuffer.d.ts',
  'export declare type RLPData = number | string | boolean | BigNumber | Buffer | RLPData[]',
  'export declare type RLPData = number | string | boolean | BigNumber | Buffer'
)
replaceInFile('./dist/protocols/substrate/common/data/scale/type/SCALEEra.d.ts', 'get isMortal(): boolean;', 'readonly isMortal: boolean;')
replaceInFile('./dist/protocols/substrate/common/data/scale/type/SCALEHash.d.ts', 'get isEmpty(): boolean;', 'readonly isEmpty: boolean;')
replaceInFile('./dist/protocols/substrate/common/data/metadata/v11/module/storage/MetadataV11StorageEntryType.d.ts', 'protected get scaleFields(): SCALEType[];', 'protected readonly scaleFields: SCALEType[];')
replaceInFile('./dist/protocols/substrate/common/data/transaction/SubstrateSignature.d.ts', 'get isSigned(): boolean;', 'readonly isSigned: boolean;')
