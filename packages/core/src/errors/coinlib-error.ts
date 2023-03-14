export enum Domain {
  SERIALIZER = 'SERIALIZER',
  SUBPROTOCOLS = 'SUBPROTOCOLS',
  WALLET = 'WALLET',
  BITCOIN = 'BITCOIN',
  ETHEREUM = 'ETHEREUM',
  ERC20 = 'ERC20',
  COSMOS = 'COSMOS',
  SUBSTRATE = 'SUBSTRATE',
  AETERNITY = 'AETERNITY',
  GROESTLCOIN = 'GROESTLCOIN',
  TEZOS = 'TEZOS',
  TEZOSFA = 'TEZOSFA',
  UTILS = 'UTILS',
  ACTIONS = 'ACTIONS',
  ICP = 'ICP',
  COREUM = 'COREUM'
}

export class CoinlibError extends Error {
  constructor(public domain: Domain, public code: string, public description?: string) {
    super(description ? `${domain}(${code}): ${description}` : `${domain}(${code})`)
  }
}

export class CoinlibAssertionError extends Error {
  constructor(public domain: Domain, public code: string, public expected: string, public actual) {
    super(`${domain}(${code}): expected ${expected} but got ${actual}.`)
  }
}
