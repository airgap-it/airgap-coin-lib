import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA1p2ProtocolNetwork, TezosFA1p2ProtocolOptions } from '../../../types/protocol'
import { TezosFA1p2Protocol, TezosFA1p2ProtocolImpl, TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK } from '../TezosFA1p2Protocol'

// Interface

type CTezUnits = 'ctez'

export interface CTezProtocol extends TezosFA1p2Protocol<CTezUnits> {}

// Implementation

export class CTezProtocolImpl extends TezosFA1p2ProtocolImpl<CTezUnits> implements CTezProtocol {
  public constructor(options: RecursivePartial<CTezProtocolOptions>) {
    const completeOptions: CTezProtocolOptions = createCTezProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'CTez',
      identifier: SubProtocolSymbols.XTZ_CTEZ,

      units: {
        ctez: {
          symbol: { value: 'ctez' },
          decimals: 8
        }
      },
      mainUnit: 'ctez',

      feeDefaults: {
        // TODO: check why it is so high
        low: newAmount(0.1, 'tez'),
        medium: newAmount(0.3, 'tez'),
        high: newAmount(0.5, 'tez')
      }
    })
  }
}

// Factory

type CTezProtocolOptions = Pick<TezosFA1p2ProtocolOptions<CTezUnits>, 'network'>

export function createCTezProtocol(options: RecursivePartial<CTezProtocolOptions> = {}): CTezProtocol {
  return new CTezProtocolImpl(options)
}

export const CTEZ_MAINNET_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = {
  ...TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4'
}

const DEFAULT_CTEZ_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = CTEZ_MAINNET_PROTOCOL_NETWORK

export function createCTezProtocolOptions(network: RecursivePartial<TezosFA1p2ProtocolNetwork> = {}): CTezProtocolOptions {
  return {
    network: {
      ...DEFAULT_CTEZ_PROTOCOL_NETWORK,
      ...network,
      callbackContracts: {
        ...DEFAULT_CTEZ_PROTOCOL_NETWORK.callbackContracts,
        ...network.callbackContracts
      }
    }
  }
}
