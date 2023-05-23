import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA1p2ProtocolNetwork, TezosFA1p2ProtocolOptions } from '../../../types/protocol'
import { TezosFA1p2Protocol, TezosFA1p2ProtocolImpl, TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK } from '../TezosFA1p2Protocol'

// Interface

type SiriusUnits = 'SIRS'

export interface SiriusProtocol extends TezosFA1p2Protocol<SiriusUnits> {}

// Implementation

export class SiriusProtocolImpl extends TezosFA1p2ProtocolImpl<SiriusUnits> implements SiriusProtocol {
  public constructor(options: RecursivePartial<SiriusProtocolOptions>) {
    const completeOptions: SiriusProtocolOptions = createSiriusProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'Sirius',
      identifier: SubProtocolSymbols.XTZ_SIRS,

      units: {
        SIRS: {
          symbol: { value: 'SIRS' },
          decimals: 8
        }
      },
      mainUnit: 'SIRS',

      feeDefaults: {
        // TODO: check why it is so high
        low: newAmount(0.1, 'tez'),
        medium: newAmount(0.2, 'tez'),
        high: newAmount(0.3, 'tez')
      }
    })
  }
}

// Factory

type SiriusProtocolOptions = Pick<TezosFA1p2ProtocolOptions<SiriusUnits>, 'network'>

export function createSiriusProtocol(options: RecursivePartial<SiriusProtocolOptions> = {}): SiriusProtocol {
  return new SiriusProtocolImpl(options)
}

export const SIRIUS_MAINNET_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = {
  ...TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b'
}

const DEFAULT_SIRIUS_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = SIRIUS_MAINNET_PROTOCOL_NETWORK

export function createSiriusProtocolOptions(network: RecursivePartial<TezosFA1p2ProtocolNetwork> = {}): SiriusProtocolOptions {
  return {
    network: {
      ...DEFAULT_SIRIUS_PROTOCOL_NETWORK,
      ...network,
      callbackContracts: {
        ...DEFAULT_SIRIUS_PROTOCOL_NETWORK.callbackContracts,
        ...network.callbackContracts
      }
    }
  }
}
