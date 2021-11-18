import { ProtocolSymbols, SubProtocolSymbols } from '../../../utils/ProtocolSymbols'
import { FeeDefaults } from '../../ICoinProtocol'
import { TezosProtocolNetwork } from '../TezosProtocolOptions'

import { TezosFA2Protocol } from './TezosFA2Protocol'
import { TezosFA2ProtocolConfig, TezosFA2ProtocolOptions } from './TezosFAProtocolOptions'

export class TezosWRAP extends TezosFA2Protocol {
  constructor(
    public readonly options: TezosFA2ProtocolOptions = new TezosFA2ProtocolOptions(
      new TezosProtocolNetwork(),
      new TezosWRAPProtocolConfig()
    )
  ) {
    super(options)
  }
}

export class TezosWRAPProtocolConfig extends TezosFA2ProtocolConfig {
  constructor(
    symbol: string = 'WRAP',
    name: string = 'Wrap Governance Token',
    marketSymbol: string = 'WRAP',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_WRAP,
    contractAddress: string = 'KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd',
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.200',
      high: '0.300'
    },
    decimals: number = 8,
    tokenId: number = 0,
    tokenMetadataBigMapID: number = 1779,
    ledgerBigMapID: number = 1777
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals, tokenId, tokenMetadataBigMapID, ledgerBigMapID)
  }
}
