export enum MainProtocolSymbols {
  AE = 'ae',
  BTC = 'btc',
  BTC_SEGWIT = 'btc_segwit',
  ETH = 'eth',
  XTZ = 'xtz',
  XTZ_SHIELDED = 'xtz_shielded',
  GRS = 'grs',
  COSMOS = 'cosmos',
  POLKADOT = 'polkadot',
  KUSAMA = 'kusama',
  MOONBASE = 'moonbase',
  MOONRIVER = 'moonriver',
  MOONBEAM = 'moonbeam',
  ASTAR = 'astar',
  SHIDEN = 'shiden'
}

export enum SubProtocolSymbols {
  XTZ_KT = 'xtz-kt',
  XTZ_BTC = 'xtz-btc',
  XTZ_USD = 'xtz-usd',
  XTZ_KUSD = 'xtz-kusd',
  XTZ_STKR = 'xtz-stkr',
  XTZ_ETHTZ = 'xtz-eth',
  XTZ_UUSD = 'xtz-uusd',
  XTZ_YOU = 'xtz-you',
  XTZ_W = 'xtz-w',
  XTZ_UDEFI = 'xtz-udefi',
  XTZ_UBTC = 'xtz-ubtc',
  XTZ_CTEZ = 'xtz-ctez',
  XTZ_PLENTY = 'xtz-plenty',
  XTZ_WRAP = 'xtz-wrap',
  XTZ_QUIPU = 'xtz-quipu',
  XTZ_DOGA = 'xtz-doga',
  XTZ_BTC_TEZ = 'xtz-btc-tez',
  ETH_ERC20 = 'eth-erc20',
  ETH_ERC20_XCHF = 'eth-erc20-xchf'
}

export type ProtocolSymbols = MainProtocolSymbols | SubProtocolSymbols

export function isMainProtocolSymbol(identifier: string): identifier is MainProtocolSymbols {
  return Object.values(MainProtocolSymbols).includes(identifier as MainProtocolSymbols)
}

export function isSubProtocolSymbol(identifier: string): identifier is SubProtocolSymbols {
  return Object.values(SubProtocolSymbols).includes(identifier as SubProtocolSymbols)
}

export function isProtocolSymbol(identifier: string): identifier is ProtocolSymbols {
  return isMainProtocolSymbol(identifier) || isSubProtocolSymbol(identifier)
}
