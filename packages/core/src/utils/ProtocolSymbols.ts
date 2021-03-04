export enum MainProtocolSymbols {
  AE = 'ae',
  BTC = 'btc',
  ETH = 'eth',
  XTZ = 'xtz',
  GRS = 'grs',
  COSMOS = 'cosmos',
  POLKADOT = 'polkadot',
  KUSAMA = 'kusama'
}

export enum SubProtocolSymbols {
  XTZ_KT = 'xtz-kt',
  XTZ_BTC = 'xtz-btc',
  XTZ_USD = 'xtz-usd',
  XTZ_KUSD = 'xtz-kusd',
  XTZ_STKR = 'xtz-stkr',
  XTZ_ETHTZ = 'xtz-eth',
  XTZ_W = 'xtz-w',
  ETH_ERC20 = 'eth-erc20',
  ETH_ERC20_XCHF = 'eth-erc20-xchf'
}

export type ProtocolSymbols = MainProtocolSymbols | SubProtocolSymbols
