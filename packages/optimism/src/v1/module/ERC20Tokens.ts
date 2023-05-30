// tslint:disable: max-file-line-count
import { ERC20TokenMetadata } from '@airgap/ethereum/v1'

export const erc20Tokens: Record<string, ERC20TokenMetadata> = {
  'optimism-erc20-op': {
    symbol: 'OP',
    name: 'Optimism',
    marketSymbol: 'op',
    identifier: 'optimism-erc20-op',
    contractAddress: '0x4200000000000000000000000000000000000042',
    decimals: 18
  },
  'optimism-erc20-usdt': {
    symbol: 'USDT',
    name: 'USD Tether (erc20)',
    marketSymbol: 'usdt',
    identifier: 'optimism-erc20-usdt',
    contractAddress: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    decimals: 6
  },
  'optimism-erc20-usdc': {
    symbol: 'USDC',
    name: 'USD Coin',
    marketSymbol: 'usdc',
    identifier: 'optimism-erc20-usdc',
    contractAddress: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    decimals: 6
  },
  'optimism-erc20-dai': {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    marketSymbol: 'dai',
    identifier: 'optimism-erc20-dai',
    contractAddress: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    decimals: 18
  },
  'optimism-erc20-wbtc': {
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    marketSymbol: 'wbtc',
    identifier: 'optimism-erc20-wbtc',
    contractAddress: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
    decimals: 8
  },
  'optimism-erc20-link': {
    symbol: 'LINK',
    name: 'Chainlink Token',
    marketSymbol: 'link',
    identifier: 'optimism-erc20-link',
    contractAddress: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
    decimals: 18
  },
  'optimism-erc20-ldo': {
    symbol: 'LDO',
    name: 'Lido DAO Token',
    marketSymbol: 'ldo',
    identifier: 'optimism-erc20-ldo',
    contractAddress: '0xFdb794692724153d1488CcdBE0C56c252596735F',
    decimals: 18
  },
  'optimism-erc20-frax': {
    symbol: 'FRAX',
    name: 'Frax',
    marketSymbol: 'frax',
    identifier: 'optimism-erc20-frax',
    contractAddress: '0x2E3D870790dC77A83DD1d18184Acc7439A53f475',
    decimals: 18
  },
  'optimism-erc20-snx': {
    symbol: 'SNX',
    name: 'Synthetix Network Token',
    marketSymbol: 'snx',
    identifier: 'optimism-erc20-snx',
    contractAddress: '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4',
    decimals: 18
  },
  'optimism-erc20-ust': {
    symbol: 'UST',
    name: 'TerraUSD',
    marketSymbol: 'ust',
    identifier: 'optimism-erc20-ust',
    contractAddress: '0xFB21B70922B9f6e3C6274BcD6CB1aa8A0fe20B80',
    decimals: 6
  }
}

export const erc20TokensIdentifiers: string[] = Object.keys(erc20Tokens)
