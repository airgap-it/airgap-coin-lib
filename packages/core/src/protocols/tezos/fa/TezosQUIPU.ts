import { ProtocolSymbols, SubProtocolSymbols } from '../../../utils/ProtocolSymbols'
import { FeeDefaults } from '../../ICoinProtocol'
import { TezosProtocolNetwork } from '../TezosProtocolOptions'

import { TezosFA2Protocol } from './TezosFA2Protocol'
import { TezosFA2ProtocolConfig, TezosFA2ProtocolOptions } from './TezosFAProtocolOptions'

export class TezosQUIPU extends TezosFA2Protocol {
  constructor(
    public readonly options: TezosFA2ProtocolOptions = new TezosFA2ProtocolOptions(
      new TezosProtocolNetwork(),
      new TezosQUIPUProtocolConfig()
    )
  ) {
    super(options)
  }
}

export class TezosQUIPUProtocolConfig extends TezosFA2ProtocolConfig {
  constructor(
    symbol: string = 'QUIPU',
    name: string = 'Quipuswap Governance Token',
    marketSymbol: string = 'QUIPU',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_QUIPU,
    contractAddress: string = 'KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb',
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.200',
      high: '0.300'
    },
    decimals: number = 6,
    tokenId: number = 0,
    tokenMetadataBigMapID: number = 12046,
    ledgerBigMapID: number = 12043
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals, tokenId, tokenMetadataBigMapID, ledgerBigMapID)
  }
}
