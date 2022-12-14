import { FeeDefaults, ProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { TezosProtocolNetwork } from '../TezosProtocolOptions'

import { TezosFA2Protocol } from './TezosFA2Protocol'
import { TezosFA2ProtocolConfig, TezosFA2ProtocolOptions } from './TezosFAProtocolOptions'

export class TezosUBTC extends TezosFA2Protocol {
  constructor(
    public readonly options: TezosFA2ProtocolOptions = new TezosFA2ProtocolOptions(
      new TezosProtocolNetwork(),
      new TezosUBTCProtocolConfig()
    )
  ) {
    super(options)
  }
}

export class TezosUBTCProtocolConfig extends TezosFA2ProtocolConfig {
  constructor(
    symbol: string = 'uBTC',
    name: string = 'youves uBTC',
    marketSymbol: string = 'uBTC',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_UBTC,
    contractAddress: string = 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW',
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.200',
      high: '0.300'
    },
    decimals: number = 12,
    tokenId: number = 2,
    tokenMetadataBigMapID: number = 7708,
    ledgerBigMapID: number = 7706
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals, tokenId, tokenMetadataBigMapID, ledgerBigMapID)
  }
}
