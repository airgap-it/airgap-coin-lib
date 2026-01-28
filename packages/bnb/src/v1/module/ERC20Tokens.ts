// tslint:disable: max-file-line-count
import { ERC20TokenMetadata } from '@airgap/ethereum/v1'

export const erc20Tokens: Record<string, ERC20TokenMetadata> = {
  'bnb-erc20-acu': {
    symbol: 'ACU',
    name: 'Acurast (bridged)',
    marketSymbol: 'acu',
    identifier: 'bnb-erc20-acu',
    contractAddress: '0x6EF2FFB38D64aFE18ce782DA280b300e358CFeAF',
    decimals: 12
  },
  'bnb-erc20-usdt': {
    symbol: 'USDT',
    name: 'Tether USD',
    marketSymbol: 'usdt',
    identifier: 'bnb-erc20-usdt',
    contractAddress: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18
  },
  'bnb-erc20-usdc': {
    symbol: 'USDC',
    name: 'USD Coin',
    marketSymbol: 'usdc',
    identifier: 'bnb-erc20-usdc',
    contractAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    decimals: 18
  },
  'bnb-erc20-eth': {
    symbol: 'ETH',
    name: 'Binance-Peg Ethereum',
    marketSymbol: 'eth',
    identifier: 'bnb-erc20-eth',
    contractAddress: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    decimals: 18
  },
  'bnb-erc20-btcb': {
    symbol: 'BTCB',
    name: 'Binance-Peg BTCB',
    marketSymbol: 'btcb',
    identifier: 'bnb-erc20-btcb',
    contractAddress: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    decimals: 18
  },
  'bnb-erc20-cake': {
    symbol: 'CAKE',
    name: 'PancakeSwap',
    marketSymbol: 'cake',
    identifier: 'bnb-erc20-cake',
    contractAddress: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    decimals: 18
  },
  'bnb-erc20-xvs': {
    symbol: 'XVS',
    name: 'Venus',
    marketSymbol: 'xvs',
    identifier: 'bnb-erc20-xvs',
    contractAddress: '0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63',
    decimals: 18
  },
  'bnb-erc20-aster': {
    symbol: 'ASTER',
    name: 'Aster',
    marketSymbol: 'aster',
    identifier: 'bnb-erc20-aster',
    contractAddress: '0x000Ae314E2A2172a039B26378814C252734f556A',
    decimals: 18
  },
  'bnb-erc20-twt': {
    symbol: 'TWT',
    name: 'Trust Wallet Token',
    marketSymbol: 'twt',
    identifier: 'bnb-erc20-twt',
    contractAddress: '0x4B0F1812e5Df2A09796481Ff14017e6005508003',
    decimals: 18
  },
  'bnb-erc20-sfp': {
    symbol: 'SFP',
    name: 'SafePal Token',
    marketSymbol: 'sfp',
    identifier: 'bnb-erc20-sfp',
    contractAddress: '0xD41FDb03Ba84762dD66a0af1a6C8540FF1ba5dfb',
    decimals: 18
  },
  'bnb-erc20-dai': {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    marketSymbol: 'dai',
    identifier: 'bnb-erc20-dai',
    contractAddress: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    decimals: 18
  },
  'bnb-erc20-wbnb': {
    symbol: 'WBNB',
    name: 'Wrapped BNB',
    marketSymbol: 'wbnb',
    identifier: 'bnb-erc20-wbnb',
    contractAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    decimals: 18
  }
}

export const erc20TokensIdentifiers: string[] = Object.keys(erc20Tokens)
