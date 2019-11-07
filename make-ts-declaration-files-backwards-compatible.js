var fs = require('fs')

const replaceInFile = (file, src, dest) => {
  const content = fs.readFileSync(file, 'utf-8')
  const newContent = content.split(src).join(dest)
  fs.writeFileSync(file, newContent)
}

replaceInFile('./dist/protocols/ethereum/BaseEthereumProtocol.d.ts', 'get subProtocols(): any[];', 'readonly subProtocols: any[];')
replaceInFile('./dist/protocols/tezos/TezosProtocol.d.ts', 'get subProtocols(): any[];', 'readonly subProtocols: any[];')
replaceInFile('./dist/wallet/AirGapWallet.d.ts', 'get receivingPublicAddress(): string;', 'readonly receivingPublicAddress: string;')
