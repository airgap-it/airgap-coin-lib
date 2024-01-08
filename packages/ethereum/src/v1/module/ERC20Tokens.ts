// tslint:disable: max-file-line-count
import { ERC20TokenMetadata } from '../types/protocol'

export const erc20Tokens: Record<string, ERC20TokenMetadata> = {
  'eth-erc20-xchf': {
    symbol: 'XCHF',
    name: 'CryptoFranc',
    marketSymbol: 'xchf',
    identifier: 'eth-erc20-xchf',
    contractAddress: '0xB4272071eCAdd69d933AdcD19cA99fe80664fc08',
    decimals: 18
  },
  'eth-erc20-usdt': {
    symbol: 'USDT',
    name: 'USD Tether (erc20)',
    marketSymbol: 'usdt',
    identifier: 'eth-erc20-usdt',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6
  },
  'eth-erc20-mnw': {
    symbol: 'MNW',
    name: 'Morpheus.Network',
    marketSymbol: 'mnw',
    identifier: 'eth-erc20-mnw',
    contractAddress: '0xd3e4ba569045546d09cf021ecc5dfe42b1d7f6e4',
    decimals: 18
  },
  'eth-erc20-bnb': {
    symbol: 'BNB',
    name: 'Binance Coin',
    marketSymbol: 'bnb',
    identifier: 'eth-erc20-bnb',
    contractAddress: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
    decimals: 18
  },
  'eth-erc20-link': {
    symbol: 'LINK',
    name: 'Chainlink token',
    marketSymbol: 'link',
    identifier: 'eth-erc20-link',
    contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    decimals: 18
  },
  'eth-erc20-cro': {
    symbol: 'CRO',
    name: 'Crypto.com Coin',
    marketSymbol: 'cro',
    identifier: 'eth-erc20-cro',
    contractAddress: '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b',
    decimals: 8
  },
  'eth-erc20-usdc': {
    symbol: 'USDC',
    name: 'USD Coin',
    marketSymbol: 'usdc',
    identifier: 'eth-erc20-usdc',
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6
  },
  'eth-erc20-leo': {
    symbol: 'LEO',
    name: 'Bitfinex LEO',
    marketSymbol: 'leo',
    identifier: 'eth-erc20-leo',
    contractAddress: '0x2af5d2ad76741191d15dfe7bf6ac92d4bd912ca3',
    decimals: 18
  },
  'eth-erc20-yfi': {
    symbol: 'YFI',
    name: 'yearn.finance',
    marketSymbol: 'yfi',
    identifier: 'eth-erc20-yfi',
    contractAddress: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    decimals: 18
  },
  'eth-erc20-ht': {
    symbol: 'HT',
    name: 'HuobiToken',
    marketSymbol: 'ht',
    identifier: 'eth-erc20-ht',
    contractAddress: '0x6f259637dcd74c767781e37bc6133cd6a68aa161',
    decimals: 18
  },
  'eth-erc20-uma': {
    symbol: 'UMA',
    name: 'UMA Voting Token v1',
    marketSymbol: 'uma',
    identifier: 'eth-erc20-uma',
    contractAddress: '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828',
    decimals: 18
  },
  'eth-erc20-ven': {
    symbol: 'VEN',
    name: 'VeChain',
    marketSymbol: 'ven',
    identifier: 'eth-erc20-ven',
    contractAddress: '0xD850942eF8811f2A866692A623011bDE52a462C1',
    decimals: 18
  },
  'eth-erc20-lend': {
    symbol: 'LEND',
    name: 'EthLend',
    marketSymbol: 'lend',
    identifier: 'eth-erc20-lend',
    contractAddress: '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03',
    decimals: 18
  },
  'eth-erc20-wbtc': {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    marketSymbol: 'wbtc',
    identifier: 'eth-erc20-wbtc',
    contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8
  },
  'eth-erc20-dai': {
    symbol: 'DAI',
    name: 'Dai Stabletoken',
    marketSymbol: 'dai',
    identifier: 'eth-erc20-dai',
    contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18
  },
  'eth-erc20-tusd': {
    symbol: 'TUSD',
    name: 'TrueUSD',
    marketSymbol: 'tusd',
    identifier: 'eth-erc20-tusd',
    contractAddress: '0x0000000000085d4780B73119b644AE5ecd22b376',
    decimals: 18
  },
  'eth-erc20-mkr': {
    symbol: 'MKR',
    name: 'Maker',
    marketSymbol: 'mkr',
    identifier: 'eth-erc20-mkr',
    contractAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    decimals: 18
  },
  // 'eth-erc20-snx': {
  //   symbol: 'SNX',
  //   name: 'Synthetix Network Token',
  //   marketSymbol: 'snx',
  //   identifier: 'eth-erc20-snx',
  //   contractAddress: '0xC011A72400E58ecD99Ee497CF89E3775d4bd732F',
  //   decimals: 18
  // },
  'eth-erc20-theta': {
    symbol: 'THETA',
    name: 'Theta Token',
    marketSymbol: 'theta',
    identifier: 'eth-erc20-theta',
    contractAddress: '0x3883f5e181fccaF8410FA61e12b59BAd963fb645',
    decimals: 18
  },
  'eth-erc20-omg': {
    symbol: 'OMG',
    name: 'OMG Network',
    marketSymbol: 'omg',
    identifier: 'eth-erc20-omg',
    contractAddress: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
    decimals: 18
  },
  'eth-erc20-ino': {
    symbol: 'INO',
    name: 'Ino Coin',
    marketSymbol: 'ino',
    identifier: 'eth-erc20-ino',
    contractAddress: '0xc9859fccc876e6b4b3c749c5d29ea04f48acb74f',
    decimals: 0
  },
  'eth-erc20-comp': {
    symbol: 'COMP',
    name: 'Compound',
    marketSymbol: 'comp',
    identifier: 'eth-erc20-comp',
    contractAddress: '0xc00e94cb662c3520282e6f5717214004a7f26888',
    decimals: 18
  },
  'eth-erc20-okb': {
    symbol: 'OKB',
    name: 'OKB',
    marketSymbol: 'okb',
    identifier: 'eth-erc20-okb',
    contractAddress: '0x75231f58b43240c9718dd58b4967c5114342a86c',
    decimals: 18
  },
  'eth-erc20-busd': {
    symbol: 'BUSD',
    name: 'Binance USD',
    marketSymbol: 'busd',
    identifier: 'eth-erc20-busd',
    contractAddress: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
    decimals: 18
  },
  'eth-erc20-bat': {
    symbol: 'BAT',
    name: 'Basic Attention Token',
    marketSymbol: 'bat',
    identifier: 'eth-erc20-bat',
    contractAddress: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
    decimals: 18
  },
  'eth-erc20-hedge': {
    symbol: 'HEDG',
    name: 'HEDG Trade',
    marketSymbol: 'hedg',
    identifier: 'eth-erc20-hedge',
    contractAddress: '0xf1290473e210b2108a85237fbcd7b6eb42cc654f',
    decimals: 18
  },
  'eth-erc20-inb': {
    symbol: 'INB',
    name: 'Insight Chain',
    marketSymbol: 'inb',
    identifier: 'eth-erc20-inb',
    contractAddress: '0x17aa18a4b64a55abed7fa543f2ba4e91f2dce482',
    decimals: 18
  },
  'eth-erc20-zrx': {
    symbol: 'ZRX',
    name: 'Ox',
    marketSymbol: 'zrx',
    identifier: 'eth-erc20-zrx',
    contractAddress: '0xe41d2489571d322189246dafa5ebde1f4699f498',
    decimals: 18
  },
  'eth-erc20-lrc': {
    symbol: 'LRC',
    name: 'LoopringCoin V2',
    marketSymbol: 'lrc',
    identifier: 'eth-erc20-lrc',
    contractAddress: '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd',
    decimals: 18
  },
  'eth-erc20-nxm': {
    symbol: 'NXM',
    name: 'NXM',
    marketSymbol: 'nxm',
    identifier: 'eth-erc20-nxm',
    contractAddress: '0xd7c49cee7e9188cca6ad8ff264c1da2e69d4cf3b',
    decimals: 18
  },
  'eth-erc20-pax': {
    symbol: 'PAX',
    name: 'Paxos Standard',
    marketSymbol: 'pax',
    identifier: 'eth-erc20-pax',
    contractAddress: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
    decimals: 18
  },
  'eth-erc20-ren': {
    symbol: 'REN',
    name: 'Republic Token',
    marketSymbol: 'ren',
    identifier: 'eth-erc20-ren',
    contractAddress: '0x408e41876cCCDC0F92210600ef50372656052a38',
    decimals: 18
  },
  'eth-erc20-knc': {
    symbol: 'KNC',
    name: 'Kyber Network',
    marketSymbol: 'knc',
    identifier: 'eth-erc20-knc',
    contractAddress: '0xdd974D5C2e2928deA5F71b9825b8b646686BD200',
    decimals: 18
  },
  'eth-erc20-cusdc': {
    symbol: 'cUSDC',
    name: 'Compound USD Coin',
    marketSymbol: 'cusdc',
    identifier: 'eth-erc20-cusdc',
    contractAddress: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
    decimals: 8
  },
  'eth-erc20-repv2': {
    symbol: 'REPv2',
    name: 'Reputation',
    marketSymbol: 'repv2',
    identifier: 'eth-erc20-repv2',
    contractAddress: '0x221657776846890989a759ba2973e427dff5c9bb',
    decimals: 18
  },
  'eth-erc20-sushi': {
    symbol: 'SUSHI',
    name: 'SushiToken',
    marketSymbol: 'sushi',
    identifier: 'eth-erc20-sushi',
    contractAddress: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    decimals: 18
  },
  'eth-erc20-band': {
    symbol: 'BAND',
    name: 'BandToken',
    marketSymbol: 'band',
    identifier: 'eth-erc20-band',
    contractAddress: '0xba11d00c5f74255f56a5e366f4f77f5a186d7f55',
    decimals: 18
  },
  'eth-erc20-ant': {
    symbol: 'ANT',
    name: 'Aragon',
    marketSymbol: 'ant',
    identifier: 'eth-erc20-ant',
    contractAddress: '0x960b236A07cf122663c4303350609A66A7B288C0',
    decimals: 18
  },
  'eth-erc20-bal': {
    symbol: 'BAL',
    name: 'Balancer',
    marketSymbol: 'bal',
    identifier: 'eth-erc20-bal',
    contractAddress: '0xba100000625a3754423978a60c9317c58a424e3d',
    decimals: 18
  },
  'eth-erc20-husd': {
    symbol: 'HUSD',
    name: 'HUSD',
    marketSymbol: 'husd',
    identifier: 'eth-erc20-husd',
    contractAddress: '0xdf574c24545e5ffecb9a659c229253d4111d87e1',
    decimals: 8
  },
  'eth-erc20-cel': {
    symbol: 'CEL',
    name: 'Celsius',
    marketSymbol: 'cel',
    identifier: 'eth-erc20-cel',
    contractAddress: '0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d',
    decimals: 4
  },
  'eth-erc20-ampl': {
    symbol: 'AMPL',
    name: 'Ampleforth',
    marketSymbol: 'ampl',
    identifier: 'eth-erc20-ampl',
    contractAddress: '0xd46ba6d942050d489dbd938a2c909a5d5039a161',
    decimals: 9
  },
  'eth-erc20-enj': {
    symbol: 'ENJ',
    name: 'Enjin',
    marketSymbol: 'enj',
    identifier: 'eth-erc20-enj',
    contractAddress: '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c',
    decimals: 18
  },
  'eth-erc20-rev': {
    symbol: 'REV',
    name: 'Revain',
    marketSymbol: 'rev',
    identifier: 'eth-erc20-rev',
    contractAddress: '0x2ef52Ed7De8c5ce03a4eF0efbe9B7450F2D7Edc9',
    decimals: 6
  },
  'eth-erc20-cvt': {
    symbol: 'CVT',
    name: 'CyberVeinToken',
    marketSymbol: 'cvt',
    identifier: 'eth-erc20-cvt',
    contractAddress: '0xbe428c3867f05dea2a89fc76a102b544eac7f772',
    decimals: 18
  },
  'eth-erc20-btm': {
    symbol: 'Bytom',
    name: 'CyberVeinToken',
    marketSymbol: 'btm',
    identifier: 'eth-erc20-btm',
    contractAddress: '0xcb97e65f07da24d46bcdd078ebebd7c6e6e3d750',
    decimals: 18
  },
  'eth-erc20-ocean': {
    symbol: 'OCEAN',
    name: 'Ocean Token',
    marketSymbol: 'ocean',
    identifier: 'eth-erc20-ocean',
    contractAddress: '0x7AFeBBB46fDb47ed17b22ed075Cde2447694fB9e',
    decimals: 18
  },
  'eth-erc20-wnxm': {
    symbol: 'wNXM',
    name: 'Wrapped NXM',
    marketSymbol: 'wnxm',
    identifier: 'eth-erc20-wnxm',
    contractAddress: '0x0d438f3b5175bebc262bf23753c1e53d03432bde',
    decimals: 18
  },
  'eth-erc20-mana': {
    symbol: 'MANA',
    name: 'Decentraland',
    marketSymbol: 'mana',
    identifier: 'eth-erc20-mana',
    contractAddress: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
    decimals: 18
  },
  'eth-erc20-sxp': {
    symbol: 'SXP',
    name: 'Swipe',
    marketSymbol: 'sxp',
    identifier: 'eth-erc20-sxp',
    contractAddress: '0x8ce9137d39326ad0cd6491fb5cc0cba0e089b6a9',
    decimals: 18
  },
  'eth-erc20-lpt': {
    symbol: 'LPT',
    name: 'Livepeer Token',
    marketSymbol: 'lpt',
    identifier: 'eth-erc20-lpt',
    contractAddress: '0x58b6a8a3302369daec383334672404ee733ab239',
    decimals: 18
  },
  'eth-erc20-gnt': {
    symbol: 'GNT',
    name: 'Golem',
    marketSymbol: 'gnt',
    identifier: 'eth-erc20-gnt',
    contractAddress: '0xa74476443119A942dE498590Fe1f2454d7D4aC0d',
    decimals: 18
  },
  'eth-erc20-qnt': {
    symbol: 'QNT',
    name: 'Quant',
    marketSymbol: 'qnt',
    identifier: 'eth-erc20-qnt',
    contractAddress: '0x4a220e6096b25eadb88358cb44068a3248254675',
    decimals: 18
  },
  'eth-erc20-sai': {
    symbol: 'SAI',
    name: 'Sai Stablecoin v1.0',
    marketSymbol: 'sai',
    identifier: 'eth-erc20-sai',
    contractAddress: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    decimals: 18
  },
  'eth-erc20-nmr': {
    symbol: 'NMR',
    name: 'Numeraire',
    marketSymbol: 'nmr',
    identifier: 'eth-erc20-nmr',
    contractAddress: '0x1776e1f26f98b1a5df9cd347953a26dd3cb46671',
    decimals: 18
  },
  'eth-erc20-dx': {
    symbol: 'DX',
    name: 'DxChain Token',
    marketSymbol: 'dx',
    identifier: 'eth-erc20-dx',
    contractAddress: '0x973e52691176d36453868d9d86572788d27041a9',
    decimals: 18
  },
  'eth-erc20-iost': {
    symbol: 'IOST',
    name: 'IOSToken',
    marketSymbol: 'iost',
    identifier: 'eth-erc20-iost',
    contractAddress: '0xfa1a856cfa3409cfa145fa4e20eb270df3eb21ab',
    decimals: 18
  },
  'eth-erc20-kcs': {
    symbol: 'KCS',
    name: 'Kucoin Shares',
    marketSymbol: 'kcs',
    identifier: 'eth-erc20-kcs',
    contractAddress: '0x039b5649a59967e3e936d7471f9c3700100ee1ab',
    decimals: 6
  },
  'eth-erc20-rsr': {
    symbol: 'RSR',
    name: 'Reserve Rights',
    marketSymbol: 'rsr',
    identifier: 'eth-erc20-rsr',
    contractAddress: '0x8762db106b2c2a0bccb3a80d1ed41273552616e8',
    decimals: 18
  },
  'eth-erc20-srm': {
    symbol: 'SRM',
    name: 'Serum',
    marketSymbol: 'srm',
    identifier: 'eth-erc20-srm',
    contractAddress: '0x476c5E26a75bd202a9683ffD34359C0CC15be0fF',
    decimals: 6
  },
  'eth-erc20-hot': {
    symbol: 'HOT',
    name: 'HoloToken',
    marketSymbol: 'hot',
    identifier: 'eth-erc20-hot',
    contractAddress: '0x6c6ee5e31d828de241282b9606c8e98ea48526e2',
    decimals: 18
  },
  'eth-erc20-divx': {
    symbol: 'DIVX',
    name: 'DIVX',
    marketSymbol: 'divx',
    identifier: 'eth-erc20-divx',
    contractAddress: '0x13f11C9905A08ca76e3e853bE63D4f0944326C72',
    decimals: 18
  },
  'eth-erc20-snt': {
    symbol: 'SNT',
    name: 'Status Network',
    marketSymbol: 'snt',
    identifier: 'eth-erc20-snt',
    contractAddress: '0x744d70FDBE2Ba4CF95131626614a1763DF805B9E',
    decimals: 18
  },
  'eth-erc20-zb': {
    symbol: 'ZB',
    name: 'ZBToken',
    marketSymbol: 'zb',
    identifier: 'eth-erc20-zb',
    contractAddress: '0xbd0793332e9fb844a52a205a233ef27a5b34b927',
    decimals: 18
  },
  'eth-erc20-rlc': {
    symbol: 'RLC',
    name: 'RLC',
    marketSymbol: 'rlc',
    identifier: 'eth-erc20-rlc',
    contractAddress: '0x607F4C5BB672230e8672085532f7e901544a7375',
    decimals: 9
  },
  'eth-erc20-brc': {
    symbol: 'BRC',
    name: 'Baer Chain',
    marketSymbol: 'brc',
    identifier: 'eth-erc20-brc',
    contractAddress: '0x21ab6c9fac80c59d401b37cb43f81ea9dde7fe34',
    decimals: 9
  },
  'eth-erc20-storj': {
    symbol: 'STORJ',
    name: 'STORJ',
    marketSymbol: 'storj',
    identifier: 'eth-erc20-storj',
    contractAddress: '0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC',
    decimals: 8
  },
  'eth-erc20-matic': {
    symbol: 'MATIC',
    name: 'Matic Token',
    marketSymbol: 'matic',
    identifier: 'eth-erc20-matic',
    contractAddress: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    decimals: 18
  },
  'eth-erc20-utk': {
    symbol: 'UTK',
    name: 'UTRUST',
    marketSymbol: 'utk',
    identifier: 'eth-erc20-utk',
    contractAddress: '0x70a72833d6bf7f508c8224ce59ea1ef3d0ea3a38',
    decimals: 18
  },
  'eth-erc20-trac': {
    symbol: 'TRAC',
    name: 'Trace',
    marketSymbol: 'trac',
    identifier: 'eth-erc20-trac',
    contractAddress: '0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f',
    decimals: 18
  },
  'eth-erc20-mco': {
    symbol: 'MCO',
    name: 'MCO',
    marketSymbol: 'mco',
    identifier: 'eth-erc20-mco',
    contractAddress: '0xb63b606ac810a52cca15e44bb630fd42d8d1d83d',
    decimals: 8
  },
  'eth-erc20-crv': {
    symbol: 'CRV',
    name: 'Curve DAO Token',
    marketSymbol: 'crv',
    identifier: 'eth-erc20-crv',
    contractAddress: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    decimals: 18
  },
  'eth-erc20-mxc': {
    symbol: 'MXC',
    name: 'MXCToken',
    marketSymbol: 'mxc',
    identifier: 'eth-erc20-mxc',
    contractAddress: '0x5ca381bbfb58f0092df149bd3d243b08b9a8386e',
    decimals: 18
  },
  'eth-erc20-bnt': {
    symbol: 'BNT',
    name: 'Bancor',
    marketSymbol: 'bnt',
    identifier: 'eth-erc20-bnt',
    contractAddress: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
    decimals: 18
  },
  'eth-erc20-xin': {
    symbol: 'XIN',
    name: 'Mixin',
    marketSymbol: 'xin',
    identifier: 'eth-erc20-xin',
    contractAddress: '0xa974c709cfb4566686553a20790685a47aceaa33',
    decimals: 18
  },
  'eth-erc20-xdce': {
    symbol: 'XDCE',
    name: 'XinFin XDCE',
    marketSymbol: 'xdce',
    identifier: 'eth-erc20-xdce',
    contractAddress: '0x41ab1b6fcbb2fa9dced81acbdec13ea6315f2bf2',
    decimals: 18
  },
  'eth-erc20-nexo': {
    symbol: 'NEXO',
    name: 'Nexo',
    marketSymbol: 'nexo',
    identifier: 'eth-erc20-nexo',
    contractAddress: '0xb62132e35a6c13ee1ee0f84dc5d40bad8d815206',
    decimals: 18
  },
  'eth-erc20-cennz': {
    symbol: 'CENNZ',
    name: 'Centrality',
    marketSymbol: 'cennz',
    identifier: 'eth-erc20-cennz',
    contractAddress: '0x1122B6a0E00DCe0563082b6e2953f3A943855c1F',
    decimals: 18
  },
  'eth-erc20-paxg': {
    symbol: 'PAXG',
    name: 'Paxos Gold',
    marketSymbol: 'paxg',
    identifier: 'eth-erc20-paxg',
    contractAddress: '0x45804880De22913dAFE09f4980848ECE6EcbAf78',
    decimals: 18
  },
  'eth-erc20-chz': {
    symbol: 'CHZ',
    name: 'chiliZ',
    marketSymbol: 'chz',
    identifier: 'eth-erc20-chz',
    contractAddress: '0x3506424f91fd33084466f402d5d97f05f8e3b4af',
    decimals: 18
  },
  'eth-erc20-gno': {
    symbol: 'GNO',
    name: 'Gnosis',
    marketSymbol: 'gno',
    identifier: 'eth-erc20-gno',
    contractAddress: '0x6810e776880C02933D47DB1b9fc05908e5386b96',
    decimals: 18
  },
  'eth-erc20-chsb': {
    symbol: 'CHSB',
    name: 'SwissBorg',
    marketSymbol: 'chsb',
    identifier: 'eth-erc20-chsb',
    contractAddress: '0xba9d4199fab4f26efe3551d490e3821486f135ba',
    decimals: 8
  },
  'eth-erc20-elf': {
    symbol: 'ELF',
    name: 'ELF',
    marketSymbol: 'elf',
    identifier: 'eth-erc20-elf',
    contractAddress: '0xbf2179859fc6d5bee9bf9158632dc51678a4100e',
    decimals: 18
  },
  'eth-erc20-dia': {
    symbol: 'DIA',
    name: 'DIAToken',
    marketSymbol: 'dia',
    identifier: 'eth-erc20-dia',
    contractAddress: '0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419',
    decimals: 18
  },
  'eth-erc20-stake': {
    symbol: 'STAKE',
    name: 'STAKE',
    marketSymbol: 'stake',
    identifier: 'eth-erc20-stake',
    contractAddress: '0x0Ae055097C6d159879521C384F1D2123D1f195e6',
    decimals: 18
  },
  'eth-erc20-czrx': {
    symbol: 'cZRX',
    name: 'Compound 0x',
    marketSymbol: 'czrx',
    identifier: 'eth-erc20-czrx',
    contractAddress: '0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407',
    decimals: 8
  },
  'eth-erc20-ftm': {
    symbol: 'FTM',
    name: 'Fantom Token',
    marketSymbol: 'ftm',
    identifier: 'eth-erc20-ftm',
    contractAddress: '0x4e15361fd6b4bb609fa63c81a2be19d873717870',
    decimals: 18
  },
  'eth-erc20-agi': {
    symbol: 'AGI',
    name: 'SingularityNET',
    marketSymbol: 'agi',
    identifier: 'eth-erc20-agi',
    contractAddress: '0x8eb24319393716668d768dcec29356ae9cffe285',
    decimals: 8
  },
  'eth-erc20-agix': {
    symbol: 'AGIX',
    name: 'SingularityNET',
    marketSymbol: 'agix',
    identifier: 'eth-erc20-agix',
    contractAddress: '0x5B7533812759B45C2B44C19e320ba2cD2681b542',
    decimals: 8
  },
  'eth-erc20-mln': {
    symbol: 'MLN',
    name: 'Melonport',
    marketSymbol: 'mln',
    identifier: 'eth-erc20-mln',
    contractAddress: '0xec67005c4E498Ec7f55E092bd1d35cbC47C91892',
    decimals: 18
  },
  'eth-erc20-fet-new': {
    symbol: 'FET',
    name: 'Fetch (erc20)',
    marketSymbol: 'fet',
    identifier: 'eth-erc20-fet-new',
    contractAddress: '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
    decimals: 18
  },
  'eth-erc20-fet': {
    symbol: 'FET',
    name: 'Fetch (erc20, old)',
    marketSymbol: 'fet',
    identifier: 'eth-erc20-fet',
    contractAddress: '0x1d287cc25dad7ccaf76a26bc660c5f7c8e2a05bd',
    decimals: 18
  },
  'eth-erc20-pnk': {
    symbol: 'PNK',
    name: 'Pinakion',
    marketSymbol: 'pnk',
    identifier: 'eth-erc20-pnk',
    contractAddress: '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d',
    decimals: 18
  },
  'eth-erc20-wic': {
    symbol: 'WIC',
    name: 'WaykiCoin',
    marketSymbol: 'wic',
    identifier: 'eth-erc20-wic',
    contractAddress: '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d',
    decimals: 18
  },
  'eth-erc20-eng': {
    symbol: 'ENG',
    name: 'Enigma',
    marketSymbol: 'eng',
    identifier: 'eth-erc20-eng',
    contractAddress: '0xf0ee6b27b759c9893ce4f094b49ad28fd15a23e4',
    decimals: 8
  },
  'eth-erc20-wax': {
    symbol: 'WAX',
    name: 'WAX Token',
    marketSymbol: 'wax',
    identifier: 'eth-erc20-wax',
    contractAddress: '0x39bb259f66e1c59d5abef88375979b4d20d98022',
    decimals: 8
  },
  'eth-erc20-ubt': {
    symbol: 'UBT',
    name: 'UniBright',
    marketSymbol: 'ubt',
    identifier: 'eth-erc20-ubt',
    contractAddress: '0x8400d94a5cb0fa0d041a3788e395285d61c9ee5e',
    decimals: 8
  },
  'eth-erc20-trb': {
    symbol: 'TRB',
    name: 'Tellor Tributes',
    marketSymbol: 'trb',
    identifier: 'eth-erc20-trb',
    contractAddress: '0x0ba45a8b5d5575935b8158a88c631e9f9c95a2e5',
    decimals: 18
  },
  'eth-erc20-iotx': {
    symbol: 'IOTX',
    name: 'IoTeX Network',
    marketSymbol: 'iotx',
    identifier: 'eth-erc20-iotx',
    contractAddress: '0x6fb3e0a217407efff7ca062d46c26e5d60a14d69',
    decimals: 18
  },
  'eth-erc20-aion': {
    symbol: 'AION',
    name: 'AION',
    marketSymbol: 'aion',
    identifier: 'eth-erc20-aion',
    contractAddress: '0x4CEdA7906a5Ed2179785Cd3A40A69ee8bc99C466',
    decimals: 8
  },
  'eth-erc20-noah': {
    symbol: 'NOAH',
    name: 'NOAHCOIN',
    marketSymbol: 'noah',
    identifier: 'eth-erc20-noah',
    contractAddress: '0x58a4884182d9e835597f405e5f258290e46ae7c2',
    decimals: 18
  },
  'eth-erc20-vest': {
    symbol: 'VEST',
    name: 'Vestchain',
    marketSymbol: 'vest',
    identifier: 'eth-erc20-vest',
    contractAddress: '0x37f04d2c3ae075fad5483bb918491f656b12bdb6',
    decimals: 8
  },
  'eth-erc20-aoa': {
    symbol: 'AOA',
    name: 'Aurora',
    marketSymbol: 'aoa',
    identifier: 'eth-erc20-aoa',
    contractAddress: '0x9ab165D795019b6d8B3e971DdA91071421305e5a',
    decimals: 18
  },
  'eth-erc20-weth': {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    marketSymbol: 'weth',
    identifier: 'eth-erc20-weth',
    contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18
  },
  'eth-erc20-verse': {
    symbol: 'VERSE',
    name: 'Verse',
    marketSymbol: 'verse',
    identifier: 'eth-erc20-verse',
    contractAddress: '0x249ca82617ec3dfb2589c4c17ab7ec9765350a18',
    decimals: 18
  }
}

export const erc20TokensIdentifiers: string[] = Object.keys(erc20Tokens)
