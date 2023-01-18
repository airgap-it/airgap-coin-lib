const mnemonic: string =
  'move fit muffin gauge initial supreme one language grace keep myth trick sun eyebrow radio movie marriage height water sad faint inherit end try'

import { AeternityProtocol } from '../../packages/aeternity/src'
import { BitcoinProtocol } from '../../packages/bitcoin/src'
import { CosmosProtocol } from '../../packages/cosmos/src'
import { EthereumProtocol } from '../../packages/ethereum/src'
import { GroestlcoinProtocol } from '../../packages/groestlcoin/src'
import { KusamaProtocol, PolkadotProtocol } from '../../packages/polkadot/src'
import { TezosProtocol } from '../../packages/tezos/src'
// import { writeFile } from 'fs'

import { generateIACCode } from './functions/generate-iac-code'

const aeternityProtocol = new AeternityProtocol()
const bitcoinProtocol = new BitcoinProtocol()
const cosmosProtocol = new CosmosProtocol()
const ethereumProtocol = new EthereumProtocol()
const groestlcoinProtocol = new GroestlcoinProtocol()
const polkadotProtocol = new PolkadotProtocol()
const kusamaProtocol = new KusamaProtocol()
const tezosProtocol = new TezosProtocol()
setTimeout(() => {
  Promise.all([
    generateIACCode(aeternityProtocol, mnemonic),
    generateIACCode(aeternityProtocol, mnemonic, 50),
    generateIACCode(bitcoinProtocol, mnemonic),
    generateIACCode(bitcoinProtocol, mnemonic, 50),
    generateIACCode(cosmosProtocol, mnemonic),
    generateIACCode(cosmosProtocol, mnemonic, 50),
    generateIACCode(ethereumProtocol, mnemonic),
    generateIACCode(ethereumProtocol, mnemonic, 50),
    generateIACCode(groestlcoinProtocol, mnemonic),
    generateIACCode(groestlcoinProtocol, mnemonic, 50),
    generateIACCode(polkadotProtocol, mnemonic),
    generateIACCode(polkadotProtocol, mnemonic, 50),
    generateIACCode(kusamaProtocol, mnemonic),
    generateIACCode(kusamaProtocol, mnemonic, 50),
    generateIACCode(tezosProtocol, mnemonic),
    generateIACCode(tezosProtocol, mnemonic, 50)
  ])
    .then((res) => {
      console.log(res)
      // writeFile('./codes.json', JSON.stringify(res), () => {})
    })
    .catch(console.error)
}, 1000)
