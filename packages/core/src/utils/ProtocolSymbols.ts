export enum MainProtocolSymbols {
  AE = 'ae',
  BTC = 'btc',
  ETH = 'eth',
  XTZ = 'xtz',
  XTZ_SHIELDED = 'xtz_shielded',
  GRS = 'grs',
  COSMOS = 'cosmos',
  POLKADOT = 'polkadot',
  KUSAMA = 'kusama',
  MOONBASE = 'moonbase',
  MOONRIVER = 'moonriver'
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
