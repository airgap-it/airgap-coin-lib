import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { ProtocolMetadata, RecursivePartial } from '@airgap/module-kit'

import { BitcoinProtocolOptions, BitcoinUnits } from '../types/protocol'

import { BitcoinKeyConfiguration, BitcoinProtocol, BitcoinProtocolImpl } from './BitcoinProtocol'

// Interface

export interface BitcoinTestnetProtocol extends BitcoinProtocol {}

// Implementation

export class BitcoinTestnetProtocolImpl extends BitcoinProtocolImpl implements BitcoinTestnetProtocol {
  public readonly metadata: ProtocolMetadata<BitcoinUnits> = {
    identifier: MainProtocolSymbols.BTC,
    name: 'Bitcoin Testnet',

    units: this.units,
    mainUnit: 'BTC',

    fee: {
      defaults: this.feeDefaults
    },

    account: {
      standardDerivationPath: `m/44'/1'/0'`,
      address: {
        isCaseSensitive: true,
        placeholder: '1ABC...',
        regex: '^..[13][a-km-zA-HJ-NP-Z1-9]{25,34}$'
      }
    }
  }

  public constructor() {
    const options: RecursivePartial<BitcoinProtocolOptions> = {
      network: {
        name: 'Testnet',
        type: 'testnet',
        rpcUrl: '',
        indexerApi: 'https://bitcoin.prod.gke.papers.tech'
      }
    }
    const keyConfiguration: BitcoinKeyConfiguration = {
      xpriv: {
        type: 'tprv'
      },
      xpub: {
        type: 'tpub'
      }
    }

    super(options, keyConfiguration)
  }
}

// Factory

export function createBitcoinTestnetProtocol(): BitcoinTestnetProtocol {
  return new BitcoinTestnetProtocolImpl()
}
