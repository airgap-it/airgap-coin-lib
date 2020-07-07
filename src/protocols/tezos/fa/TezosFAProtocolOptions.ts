// tslint:disable:max-classes-per-file

import { TezosBTCDetails } from '../../../serializer/constants'
import { ProtocolOptions } from '../../../utils/ProtocolOptions'
import { ProtocolSymbols, SubProtocolSymbols } from '../../../utils/ProtocolSymbols'
import { FeeDefaults } from '../../ICoinProtocol'
import { TezosProtocolConfig, TezosProtocolNetwork } from '../TezosProtocolOptions'

export class TezosFAProtocolConfig extends TezosProtocolConfig {
  constructor(
    public readonly symbol: string,
    public readonly name: string,
    public readonly marketSymbol: string,
    public readonly identifier: ProtocolSymbols,
    public readonly contractAddress: string,
    public readonly feeDefaults: FeeDefaults,
    public readonly decimals: number
  ) {
    super()
  }
}

export class TezosFA2ProtocolConfig extends TezosFAProtocolConfig {
  constructor(
    public readonly symbol: string,
    public readonly name: string,
    public readonly marketSymbol: string,
    public readonly identifier: ProtocolSymbols,
    public readonly contractAddress: string,
    public readonly feeDefaults: FeeDefaults,
    public readonly decimals: number,
    public readonly tokenID?: number,
    public readonly tokenMetadataBigMapID?: number,
    public readonly tokenMetadataBigMapName?: string,
    public readonly tokenMetadataBigMapRegex?: RegExp
  ) {
    super(symbol, name, marketSymbol, identifier, contractAddress, feeDefaults, decimals)
  }
}

export class TezosBTCProtocolConfig extends TezosFAProtocolConfig {
  constructor(
    symbol: string = 'tzBTC',
    name: string = 'Tezos BTC',
    marketSymbol: string = 'btc',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_BTC,
    contractAddress: string = TezosBTCDetails.CONTRACT_ADDRESS,
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.200',
      high: '0.300'
    },
    decimals: number = 8
  ) {
    super(symbol, name, marketSymbol, identifier, contractAddress, feeDefaults, decimals)
  }
}

export class TezosStakerProtocolConfig extends TezosFAProtocolConfig {
  constructor(
    symbol: string = 'STKR',
    name: string = 'Staker',
    marketSymbol: string = 'stkr',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_BTC,
    contractAddress: string = 'KT1EctCuorV2NfVb1XTQgvzJ88MQtWP8cMMv',
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.300',
      high: '0.500'
    },
    decimals: number = 8
  ) {
    super(symbol, name, marketSymbol, identifier, contractAddress, feeDefaults, decimals)
  }
}

export class TezosUSDProtocolConfig extends TezosFAProtocolConfig {
  constructor(
    symbol: string = 'USDtz',
    name: string = 'USD Tez',
    marketSymbol: string = 'USDtz',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_USD,
    contractAddress: string = 'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9',
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.300',
      high: '0.500'
    },
    decimals: number = 8
  ) {
    super(symbol, name, marketSymbol, identifier, contractAddress, feeDefaults, decimals)
  }
}

export class TezosFAProtocolOptions implements ProtocolOptions<TezosFAProtocolConfig> {
  // tslint:disable-next-line:no-unnecessary-initializer
  constructor(public readonly network: TezosProtocolNetwork = new TezosProtocolNetwork(), public readonly config: TezosFAProtocolConfig) {}
}

export class TezosFA2ProtocolOptions implements ProtocolOptions<TezosFA2ProtocolConfig> {
  // tslint:disable-next-line:no-unnecessary-initializer
  constructor(public readonly network: TezosProtocolNetwork = new TezosProtocolNetwork(), public readonly config: TezosFA2ProtocolConfig) {}
}
