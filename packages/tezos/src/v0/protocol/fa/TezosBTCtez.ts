import { FeeDefaults, ProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'

import { TezosProtocolNetwork } from '../TezosProtocolOptions'

import { TezosFA2Protocol } from './TezosFA2Protocol'
import { TezosFA2ProtocolConfig, TezosFA2ProtocolOptions } from './TezosFAProtocolOptions'

export class TezosBTCTez extends TezosFA2Protocol {
  constructor(
    public readonly options: TezosFA2ProtocolOptions = new TezosFA2ProtocolOptions(
      new TezosProtocolNetwork(),
      new TezosBTCTezProtocolConfig()
    )
  ) {
    super(options)
  }
}

export class TezosBTCTezProtocolConfig extends TezosFA2ProtocolConfig {
  constructor(
    symbol: string = 'BTCtz',
    name: string = 'BTCtez',
    marketSymbol: string = 'BTCtz',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_BTC_TEZ,
    contractAddress: string = 'KT1T87QbpXEVgkwsNPzz8iRoah3SS3D1MDmh',
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.200',
      high: '0.300'
    },
    decimals: number = 8,
    tokenId: number = 0,
    tokenMetadataBigMapID: number = 24121,
    ledgerBigMapID: number = 24117
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals, tokenId, tokenMetadataBigMapID, ledgerBigMapID)
  }
}
