// tslint:disable: max-file-line-count
import { ERC20TokenMetadata } from '@airgap/ethereum/v1'

export const erc20Tokens: Record<string, ERC20TokenMetadata> = {
  'base-erc20-acu': {
    symbol: 'ACU',
    name: 'Acurast (bridged)',
    marketSymbol: 'acu',
    identifier: 'base-erc20-acu',
    contractAddress: '0xc5fEd7c8cCC75D8A72b601a66DffD7A489073F0b',
    decimals: 12
  },
  'base-erc20-virtual': {
    symbol: 'VIRTUAL',
    name: 'Virtuals Protocol',
    marketSymbol: 'virtual',
    identifier: 'base-erc20-virtual',
    contractAddress: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b',
    decimals: 18
  },
  'base-erc20-brett': {
    symbol: 'BRETT',
    name: 'Brett',
    marketSymbol: 'brett',
    identifier: 'base-erc20-brett',
    contractAddress: '0x532f27101965dd16442E59d40670FaF5eBB142E4',
    decimals: 18
  },
  'base-erc20-aero': {
    symbol: 'AERO',
    name: 'Aerodrome',
    marketSymbol: 'aero',
    identifier: 'base-erc20-aero',
    contractAddress: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    decimals: 18
  },
  'base-erc20-toshi': {
    symbol: 'TOSHI',
    name: 'Toshi',
    marketSymbol: 'toshi',
    identifier: 'base-erc20-toshi',
    contractAddress: '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4',
    decimals: 18
  },
  'base-erc20-zora': {
    symbol: 'ZORA',
    name: 'Zora',
    marketSymbol: 'zora',
    identifier: 'base-erc20-zora',
    contractAddress: '0x1111111111166b7FE7bd91427724B487980aFc69',
    decimals: 18
  },
  'base-erc20-usdc': {
    symbol: 'USDC',
    name: 'USD Coin',
    marketSymbol: 'usdc',
    identifier: 'base-erc20-usdc',
    contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6
  },
  'base-erc20-usdt': {
    symbol: 'USDT',
    name: 'Tether USD',
    marketSymbol: 'usdt',
    identifier: 'base-erc20-usdt',
    contractAddress: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    decimals: 6
  },
  'base-erc20-avnt': {
    symbol: 'AVNT',
    name: 'Avantis',
    marketSymbol: 'avnt',
    identifier: 'base-erc20-avnt',
    contractAddress: '0x696F9436B67233384889472Cd7cD58A6fB5DF4f1',
    decimals: 18
  }
}

export const erc20TokensIdentifiers: string[] = Object.keys(erc20Tokens)
