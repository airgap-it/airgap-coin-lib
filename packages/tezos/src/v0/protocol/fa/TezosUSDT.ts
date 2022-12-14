import { FeeDefaults, ProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { TezosProtocolNetwork } from '../TezosProtocolOptions'

import { TezosFA2Protocol } from './TezosFA2Protocol'
import { TezosFA2ProtocolConfig, TezosFA2ProtocolOptions } from './TezosFAProtocolOptions'

export class TezosUSDT extends TezosFA2Protocol {
  constructor(
    public readonly options: TezosFA2ProtocolOptions = new TezosFA2ProtocolOptions(
      new TezosProtocolNetwork(),
      new TezosUSDTProtocolConfig()
    )
  ) {
    super(options)
  }
}

export class TezosUSDTProtocolConfig extends TezosFA2ProtocolConfig {
  constructor(
    symbol: string = 'USDt',
    name: string = 'Tether USD',
    marketSymbol: string = 'USDT',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_USDT,
    contractAddress: string = 'KT1XnTn74bUtxHfDtBmm2bGZAQfhPbvKWR8o',
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.200',
      high: '0.300'
    },
    decimals: number = 6,
    tokenId: number = 0,
    tokenMetadataBigMapID: number = 198034,
    ledgerBigMapID: number = 198031
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals, tokenId, tokenMetadataBigMapID, ledgerBigMapID)
  }
}
