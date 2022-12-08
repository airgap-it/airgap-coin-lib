import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { ExtendedPublicKey, ProtocolMetadata } from '@airgap/module-kit'

import { BitcoinTestnetExtendedPublicKeyEncoding } from '../types/key'
import { BitcoinUnits } from '../types/protocol'
import { convertExtendedPublicKey } from '../utils/key'

import { BitcoinProtocol, BitcoinProtocolImpl } from './BitcoinProtocol'

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
    super({
      network: {
        name: 'Testnet',
        type: 'testnet',
        rpcUrl: '',
        indexerApi: 'https://bitcoin.prod.gke.papers.tech'
      }
    })
  }

  protected convertExtendedPublicKey(extendedPublicKey: ExtendedPublicKey, targetFormat: ExtendedPublicKey['format']): ExtendedPublicKey {
    return convertExtendedPublicKey<BitcoinTestnetExtendedPublicKeyEncoding>(extendedPublicKey, {
      format: targetFormat,
      type: 'tpub'
    })
  }
}

// Factory

export function createBitcoinTestnetProtocol(): BitcoinTestnetProtocol {
  return new BitcoinTestnetProtocolImpl()
}