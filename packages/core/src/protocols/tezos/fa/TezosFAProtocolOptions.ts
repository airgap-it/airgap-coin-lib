// tslint:disable:max-classes-per-file

import {
  TezosBTCDetails,
  TezosETHtzDetails,
  TezosKolibriUSDDetails,
  TezosUUSDDetails,
  TezosWrappedDetails,
  TezosYOUDetails
} from '../../../serializer/constants'
import { ProtocolOptions } from '../../../utils/ProtocolOptions'
import { ProtocolSymbols, SubProtocolSymbols } from '../../../utils/ProtocolSymbols'
import { FeeDefaults } from '../../ICoinProtocol'
import { TezosProtocolConfig, TezosProtocolNetwork } from '../TezosProtocolOptions'

export class TezosFAProtocolConfig extends TezosProtocolConfig {
  constructor(
    public readonly contractAddress: string,
    public readonly identifier: ProtocolSymbols,
    public readonly symbol?: string,
    public readonly name?: string,
    public readonly marketSymbol?: string,
    public readonly feeDefaults?: FeeDefaults,
    public readonly decimals?: number,
    public readonly tokenMetadataBigMapID?: number
  ) {
    super()
  }
}

export class TezosFA2ProtocolConfig extends TezosFAProtocolConfig {
  constructor(
    contractAddress: string,
    identifier: ProtocolSymbols,
    symbol?: string,
    name?: string,
    marketSymbol?: string,
    feeDefaults?: FeeDefaults,
    decimals?: number,
    public readonly defaultTokenID?: number,
    tokenMetadataBigMapID?: number,
    public readonly ledgerBigMapID?: number,
    public readonly totalSupplyBigMapID?: number
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals, tokenMetadataBigMapID)
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
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals)
  }
}
export class TezosETHtzProtocolConfig extends TezosFAProtocolConfig {
  constructor(
    symbol: string = 'ETHtz',
    name: string = 'ETH Tezos',
    marketSymbol: string = 'ethtz',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_ETHTZ,
    contractAddress: string = TezosETHtzDetails.CONTRACT_ADDRESS,
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.200',
      high: '0.300'
    },
    decimals: number = 18
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals)
  }
}
export class TezosWrappedProtocolConfig extends TezosFAProtocolConfig {
  constructor(
    symbol: string = 'Wtz',
    name: string = 'Wrapped Tezos',
    marketSymbol: string = 'wtz',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_W,
    contractAddress: string = TezosWrappedDetails.CONTRACT_ADDRESS,
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.200',
      high: '0.300'
    },
    decimals: number = 6
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals)
  }
}
export class TezosKolibriUSDProtocolConfig extends TezosFAProtocolConfig {
  constructor(
    symbol: string = 'kUSD',
    name: string = 'Kolibri USD Tezos',
    marketSymbol: string = 'kUSD',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_KUSD,
    contractAddress: string = TezosKolibriUSDDetails.CONTRACT_ADDRESS,
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.200',
      high: '0.300'
    },
    decimals: number = 6
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals)
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
    decimals: number = 6
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals)
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
    decimals: number = 6
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals)
  }
}

export class TezosUUSDProtocolConfig extends TezosFA2ProtocolConfig {
  constructor(
    symbol: string = 'uUSD',
    name: string = 'youves uUSD',
    marketSymbol: string = 'uusd',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_UUSD,
    contractAddress: string = TezosUUSDDetails.CONTRACT_ADDRESS,
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.200',
      high: '0.300'
    },
    decimals: number = 12,
    tokenId: number = 0,
    tokenMetadataBigMapID: number = 7708,
    ledgerBigMapID: number = 7706
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals, tokenId, tokenMetadataBigMapID, ledgerBigMapID)
  }
}

export class TezosYOUProtocolConfig extends TezosFA2ProtocolConfig {
  constructor(
    symbol: string = 'YOU',
    name: string = 'youves YOU Governance',
    marketSymbol: string = 'you',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_YOU,
    contractAddress: string = TezosYOUDetails.CONTRACT_ADDRESS,
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.200',
      high: '0.300'
    },
    decimals: number = 12,
    tokenId: number = 0,
    tokenMetadataBigMapID: number = 7718,
    ledgerBigMapID: number = 7715
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals, tokenId, tokenMetadataBigMapID, ledgerBigMapID)
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
