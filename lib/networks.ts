import * as bitcoinJS from 'bitcoinjs-lib'

export interface INetwork {
  messagePrefix?: string
  bip32: {
    public: number
    private: number
  },
  pubKeyHash: number
  scriptHash?: number
  wif: number
  dustSoftThreshold?: number
  dustThreshold?: number
  feePerKb?: number
  ethereum?: boolean
}

const networks: { [key: string]: INetwork | bitcoinJS.Network } = {}

networks.shadow = {
  messagePrefix: '\x19ShadowCash Signed Message:\n',
  bip32: {
    public: 0xEE80286A,
    private: 0xEE8031E8
  },
  pubKeyHash: 0x3f,
  scriptHash: 0x7d,
  wif: 0xbf,
  dustThreshold: 0,
  feePerKb: 1000
}

networks.shadowtn = {
  messagePrefix: '\x19ShadowCash Signed Message:\n',
  bip32: {
    public: 0x76C0FDFB,
    private: 0x76C1077A
  },
  pubKeyHash: 0x7f,
  scriptHash: 0xc4,
  wif: 0xff,
  dustThreshold: 0,
  feePerKb: 1000
}

networks.clam = {
  bip32: {
    public: 0xa8c26d64,
    private: 0xa8c17826
  },
  pubKeyHash: 0x89,
  wif: 0x85
}

networks.bitcoin = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
  dustThreshold: 546, // https://github.com/bitcoin/bitcoin/blob/v0.9.2/src/core.h#L151-L162
  feePerKb: 10000 // https://github.com/bitcoin/bitcoin/blob/v0.9.2/src/main.cpp#L53
}
networks.testnet = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
  dustThreshold: 546,
  feePerKb: 10000
}
networks.litecoin = {
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bip32: {
    public: 0x019da462,
    private: 0x019d9cfe
  },
  pubKeyHash: 0x30,
  scriptHash: 0x05,
  wif: 0xb0,
  dustThreshold: 0, // https://github.com/litecoin-project/litecoin/blob/v0.8.7.2/src/main.cpp#L360-L365
  dustSoftThreshold: 100000, // https://github.com/litecoin-project/litecoin/blob/v0.8.7.2/src/main.h#L53
  feePerKb: 100000 // https://github.com/litecoin-project/litecoin/blob/v0.8.7.2/src/main.cpp#L56
}
networks.dogecoin = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e,
  dustThreshold: 0, // https://github.com/dogecoin/dogecoin/blob/v1.7.1/src/core.h#L155-L160
  dustSoftThreshold: 100000000, // https://github.com/dogecoin/dogecoin/blob/v1.7.1/src/main.h#L62
  feePerKb: 100000000 // https://github.com/dogecoin/dogecoin/blob/v1.7.1/src/main.cpp#L58
}
networks.dash = {
  messagePrefix: '\x19DarkCoin Signed Message:\n',
  bip32: {
    public: 0x02FE52F8,
    private: 0x02FE52CC
  },
  pubKeyHash: 0x4c,
  scriptHash: 0x10,
  wif: 0xcc,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.viacoin = {
  messagePrefix: '\x18Viacoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x47,
  scriptHash: 0x21,
  wif: 0xc7,
  dustThreshold: 560,
  dustSoftThreshold: 100000,
  feePerKb: 100000 //
}
networks.viacointestnet = {
  messagePrefix: '\x18Viacoin Signed Message:\n',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394
  },
  pubKeyHash: 0x7f,
  scriptHash: 0xc4,
  wif: 0xff,
  dustThreshold: 560,
  dustSoftThreshold: 100000,
  feePerKb: 100000
}
networks.gamecredits = {
  messagePrefix: '\x19Gamecredits Signed Message:\n',
  bip32: {
    public: 0x019da462,
    private: 0x019d9cfe
  },
  pubKeyHash: 0x26,
  scriptHash: 0x05,
  wif: 0xA6,
  dustThreshold: 0, // https://github.com/gamers-coin/gamers-coinv3/blob/master/src/main.cpp#L358-L363
  dustSoftThreshold: 100000, // https://github.com/gamers-coin/gamers-coinv3/blob/master/src/main.cpp#L51
  feePerKb: 100000 // https://github.com/gamers-coin/gamers-coinv3/blob/master/src/main.cpp#L54
}
networks.jumbucks = {
  messagePrefix: '\x19Jumbucks Signed Message:\n',
  bip32: {
    public: 0x037a689a,
    private: 0x037a6460
  },
  pubKeyHash: 0x2b,
  scriptHash: 0x05,
  wif: 0xab,
  dustThreshold: 0,
  dustSoftThreshold: 10000,
  feePerKb: 10000
}
networks.zetacoin = {
  messagePrefix: '\x18Zetacoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x50,
  scriptHash: 0x09,
  wif: 0xe0,
  dustThreshold: 546, // https://github.com/zetacoin/zetacoin/blob/master/src/core.h#L159
  feePerKb: 10000 // https://github.com/zetacoin/zetacoin/blob/master/src/main.cpp#L54
}
networks.nubits = {
  messagePrefix: '\x18Nu Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x19,
  scriptHash: 0x1a,
  wif: 0x96,
  dustThreshold: 100,
  feePerKb: 100
}
networks.nushares = {
  messagePrefix: '\x18Nu Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x3f,
  scriptHash: 0x40,
  wif: 0x95,
  dustThreshold: 10000,
  feePerKb: 10000
}
networks.blackcoin = {
  messagePrefix: '\x18BlackCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x19,
  scriptHash: 0x55,
  wif: 0x99,
  dustThreshold: 1,
  feePerKb: 10000
}
networks.potcoin = {
  messagePrefix: '\x18PotCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 55,
  scriptHash: 5,
  wif: 183,
  dustThreshold: 1,
  feePerKb: 100000
}
networks.batacoin = {
  messagePrefix: '\x19Bata Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 25,
  scriptHash: 5,
  wif: 153,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.feathercoin = {
  messagePrefix: '\x19Feathercoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 14,
  scriptHash: 5,
  wif: 142,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.gridcoin = {
  messagePrefix: '\x19Gridcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 62,
  scriptHash: 85,
  wif: 190,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.richcoin = {
  messagePrefix: '\x19Richcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 61,
  scriptHash: 9,
  wif: 128,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.auroracoin = {
  messagePrefix: '\x19Auroracoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 23,
  scriptHash: 5,
  wif: 151,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.novacoin = {
  messagePrefix: '\x19Novacoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 8,
  scriptHash: 20,
  wif: 136,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.cannacoin = {
  messagePrefix: '\x19Cannacoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 28,
  scriptHash: 5,
  wif: 156,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.clubcoin = {
  messagePrefix: '\x19Clubcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 28,
  scriptHash: 85,
  wif: 153,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.digibyte = {
  messagePrefix: '\x19Digibyte Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 30,
  scriptHash: 5,
  wif: 128,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.digitalcoin = {
  messagePrefix: '\x19Digitalcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 30,
  scriptHash: 5,
  wif: 158,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.edrcoin = {
  messagePrefix: '\x19EDRcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 93,
  scriptHash: 28,
  wif: 221,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.egulden = {
  messagePrefix: '\x19e-Gulden Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 48,
  scriptHash: 5,
  wif: 176,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.gulden = {
  messagePrefix: '\x19Gulden Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 38,
  scriptHash: 5,
  wif: 166,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.gcrcoin = {
  messagePrefix: '\x19GCR Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 38,
  scriptHash: 97,
  wif: 154,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.monacoin = {
  messagePrefix: '\x19Monacoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 50,
  scriptHash: 5,
  wif: 178,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.myriadcoin = {
  messagePrefix: '\x19Myriadcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 50,
  scriptHash: 9,
  wif: 178,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.neoscoin = {
  messagePrefix: '\x19Neoscoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 53,
  scriptHash: 5,
  wif: 177,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.parkbyte = {
  messagePrefix: '\x19ParkByte Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 55,
  scriptHash: 28,
  wif: 183,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.peercoin = {
  messagePrefix: '\x19PPCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 55,
  scriptHash: 117,
  wif: 183,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.pesobit = {
  messagePrefix: '\x19Pesobit Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 55,
  scriptHash: 85,
  wif: 183,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.reddcoin = {
  messagePrefix: '\x19Reddcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 61,
  scriptHash: 5,
  wif: 189,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.primecoin = {
  messagePrefix: '\x19Primecoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 23,
  scriptHash: 83,
  wif: 151,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.rubycoin = {
  messagePrefix: '\x19Rubycoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 60,
  scriptHash: 85,
  wif: 188,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.smileycoin = {
  messagePrefix: '\x19Smileycoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 25,
  scriptHash: 5,
  wif: 153,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.solarcoin = {
  messagePrefix: '\x19SolarCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 18,
  scriptHash: 5,
  wif: 146,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.syscoin = {
  messagePrefix: '\x19Syscoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 63,
  scriptHash: 5,
  wif: 191,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.unobtanium = {
  messagePrefix: '\x19Unobtanium Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 130,
  scriptHash: 30,
  wif: 224,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.vergecoin = {
  messagePrefix: '\x19Vergecoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 30,
  scriptHash: 33,
  wif: 158,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.vertcoin = {
  messagePrefix: '\x19Vertcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 71,
  scriptHash: 5,
  wif: 199,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}
networks.vpncoin = {
  messagePrefix: '\x19VpnCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 71,
  scriptHash: 5,
  wif: 199,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}

networks.pivx = {
  messagePrefix: '\x19PIVX Signed Message:\n',
  bip32: {
    public: 0x022D2533,
    private: 0x0221312B
  },
  pubKeyHash: 30,
  scriptHash: 13,
  wif: 212
}

networks.eth = {
  messagePrefix: '\x19Ethereum Signed Message:\n',
  bip32: {
    public: 0xffffffff,
    private: 0xffffffff
  },
  scriptHash: 13,
  pubKeyHash: 0xff,
  wif: 0xff,
  ethereum: true
}

networks.etc = {
  bip32: {
    public: 0xffffffff,
    private: 0xffffffff
  },
  pubKeyHash: 0xff,
  wif: 0xff,
  ethereum: true
}

networks.clo = {
  bip32: {
    public: 0xffffffff,
    private: 0xffffffff
  },
  pubKeyHash: 0xff,
  wif: 0xff,
  ethereum: true
}

networks.abncoin = {
  messagePrefix: '\x19Abncoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 25,
  scriptHash: 85,
  wif: 153
}

networks.asiacoin = {
  messagePrefix: '\x19Asiacoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 23,
  scriptHash: 8,
  wif: 151
}

networks.bitcoinplus = {
  messagePrefix: '\x19Bitcoinplus Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 25,
  scriptHash: 85,
  wif: 153
}

networks.canadaecoin = {
  messagePrefix: '\x19Canada eCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 28,
  scriptHash: 5,
  wif: 156
}

networks.einsteinium = {
  messagePrefix: '\x19Einsteinium Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 33,
  scriptHash: 5,
  wif: 161
}

networks.expanse = {
  bip32: {
    public: 0xffffffff,
    private: 0xffffffff
  },
  pubKeyHash: 0xff,
  wif: 0xff,
  ethereum: true
}

networks.iop = {
  messagePrefix: '\x19Internet of People Signed Message:\n',
  bip32: {
    public: 0x2780915f,
    private: 0xae3416f6
  },
  pubKeyHash: 117,
  scriptHash: 174,
  wif: 49
}

networks.ixcoin = {
  messagePrefix: '\x19Ixcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 138,
  scriptHash: 5,
  wif: 128
}

networks.landcoin = {
  messagePrefix: '\x19Landcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 48,
  scriptHash: 122,
  wif: 176
}

networks.namecoin = {
  messagePrefix: '\x19Namecoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 52,
  scriptHash: 13,
  wif: 180
}

networks.navcoin = {
  messagePrefix: '\x19Navcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 53,
  scriptHash: 85,
  wif: 150
}

networks.okcash = {
  messagePrefix: '\x19Okcash Signed Message:\n',
  bip32: {
    public: 0x03cc23d7,
    private: 0x03cc1c73
  },
  pubKeyHash: 55,
  scriptHash: 28,
  wif: 183
}

networks.posw = {
  messagePrefix: '\x19POSWcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 55,
  scriptHash: 85,
  wif: 183
}

networks.stratis = {
  messagePrefix: '\x19Stratis Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488b2dd
  },
  pubKeyHash: 63,
  scriptHash: 125,
  wif: 191
}

networks.zcash = {
  messagePrefix: '\x19Zcash Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x1cb8,
  scriptHash: 0x1cbd,
  wif: 128
}

networks.lbry = {
  messagePrefix: '\x19LBRYcrd Signed Message:\n',
  bip32: {
    public: 0x019c354f,
    private: 0x019c3118
  },
  pubKeyHash: 85,
  scriptHash: 122,
  wif: 28
}

networks.bela = {
  messagePrefix: '\x19Belacoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 25,
  scriptHash: 5,
  wif: 153
}

networks.britcoin = {
  messagePrefix: '\x19Britcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 25,
  scriptHash: 85,
  wif: 153
}

networks.compcoin = {
  messagePrefix: '\x19Compcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 28,
  scriptHash: 5,
  wif: 156
}

networks.zcoin = {
  messagePrefix: '\x19ZCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 82,
  scriptHash: 7,
  wif: 210
}

networks.insane = {
  messagePrefix: '\x19Insanecoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 102,
  scriptHash: 57,
  wif: 55
}

networks.ultimatesecurecash = {
  messagePrefix: '\x19Ultimate Secure Cash Signed Message:\n',
  bip32: {
    public: 0xee80286a,
    private: 0xee8031e8
  },
  pubKeyHash: 68,
  scriptHash: 125,
  wif: 137
}

networks.neurocoin = {
  messagePrefix: '\x19PPCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 53,
  scriptHash: 117,
  wif: 181
}

networks.hempcoin = {
  messagePrefix: '\x19Hempcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 40,
  scriptHash: 8,
  wif: 168
}

networks.linxcoin = {
  messagePrefix: '\x19LinX Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 75,
  scriptHash: 5,
  wif: 203
}

networks.ecoin = {
  messagePrefix: '\x19eCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 92,
  scriptHash: 20,
  wif: 220
}

networks.denarius = {
  messagePrefix: '\x19Denarius Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 30,
  scriptHash: 90,
  wif: 158
}

networks.pinkcoin = {
  messagePrefix: '\x19Pinkcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 3,
  scriptHash: 28,
  wif: 131
}

networks.flashcoin = {
  messagePrefix: '\x19Flashcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 68,
  scriptHash: 130,
  wif: 196
}

networks.defcoin = {
  messagePrefix: '\x19defcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 30,
  scriptHash: 5,
  wif: 158
}

networks.putincoin = {
  messagePrefix: '\x19PutinCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 55,
  scriptHash: 20,
  wif: 183
}

networks.zencash = {
  messagePrefix: '\x19Zcash Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x2089,
  scriptHash: 0x2096,
  wif: 128
}

networks.smartcash = {
  messagePrefix: '\x19SmartCash Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 63,
  scriptHash: 18,
  wif: 191
}

networks.fujicoin = {
  messagePrefix: '\x19Fujicoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 36,
  scriptHash: 16,
  wif: 164
}

networks.mix = {
  bip32: {
    public: 0xffffffff,
    private: 0xffffffff
  },
  pubKeyHash: 0xff,
  wif: 0xff,
  ethereum: true
}

networks.voxels = {
  messagePrefix: '\x19Voxels Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 70,
  scriptHash: 5,
  wif: 198
}

networks.crown = {
  messagePrefix: '\x19Crown Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0,
  scriptHash: 28,
  wif: 128
}

networks.vcash = {
  messagePrefix: '\x19Vcash Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 71,
  scriptHash: 8,
  wif: 199
}

networks.bridgecoin = {
  messagePrefix: '\x19bridgecoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 27,
  scriptHash: 50,
  wif: 176
}

networks.bitsend = {
  messagePrefix: '\x19Bitsend Signed Message:\n',
  bip32: {
    public: 0x02FE52F8,
    private: 0x02FE52CC
  },
  pubKeyHash: 102,
  scriptHash: 5,
  wif: 204,
  dustThreshold: 0,
  dustSoftThreshold: 0,
  feePerKb: 0
}

networks.bitcore = {
  messagePrefix: '\x19BitCore Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0,
  scriptHash: 5,
  wif: 128
}

networks.europecoin = {
  messagePrefix: '\x19Bitcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 33,
  scriptHash: 5,
  wif: 168
}

networks.toacoin = {
  messagePrefix: '\x19TOA Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 65,
  scriptHash: 23,
  wif: 193
}

networks.diamond = {
  messagePrefix: '\x19Diamond Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 90,
  scriptHash: 8,
  wif: 218
}

networks.adcoin = {
  messagePrefix: '\x19AdCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 23,
  scriptHash: 5,
  wif: 151
}

networks.Helleniccoin = {
  messagePrefix: '\x19helleniccoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 48,
  scriptHash: 5,
  wif: 176
}

networks.bitcoincash = {
  messagePrefix: '\x19Bitcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80
}

networks.bitcoingold = {
  messagePrefix: '\x19Bitcoin Gold Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 38,
  scriptHash: 23,
  wif: 128
}

networks.firstcoin = {
  messagePrefix: '\x19FirstCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 35,
  scriptHash: 5,
  wif: 163
}

networks.vivo = {
  messagePrefix: '\x19DarkCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 70,
  scriptHash: 10,
  wif: 198
}

networks.whitecoin = {
  messagePrefix: '\x19Whitecoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 73,
  scriptHash: 87,
  wif: 201
}

networks.gobyte = {
  messagePrefix: '\x19DarkCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 38,
  scriptHash: 10,
  wif: 198
}

networks.groestlcoin = {
  messagePrefix: '\x19GroestlCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 36,
  scriptHash: 5,
  wif: 128
}

networks.newyorkcoin = {
  messagePrefix: '\x19newyorkc Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 60,
  scriptHash: 22,
  wif: 188
}

networks.omni = {
  messagePrefix: '\x19Bitcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0,
  scriptHash: 5,
  wif: 128
}

networks.bitcoinz = {
  messagePrefix: '\x19BitcoinZ Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x1cb8,
  scriptHash: 0x1cbd,
  wif: 128
}

networks.poa = {
  bip32: {
    public: 0xffffffff,
    private: 0xffffffff
  },
  pubKeyHash: 0xff,
  wif: 0xff,
  ethereum: true
}

networks.tether = {
  messagePrefix: '\x19Bitcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0,
  scriptHash: 5,
  wif: 128
}

networks.bitcoinatom = {
  messagePrefix: '\x19Bitcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 23,
  scriptHash: 10,
  wif: 128
}

networks.crave = {
  messagePrefix: '\x19DarkNet Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 70,
  scriptHash: 85,
  wif: 153
}

networks.exclusivecoin = {
  messagePrefix: '\x19ExclusiveCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 33,
  scriptHash: 137,
  wif: 161
}

networks.lynx = {
  messagePrefix: '\x19Lynx Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 45,
  scriptHash: 50,
  wif: 173
}

networks.minexcoin = {
  messagePrefix: '\x19Bitcoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 75,
  scriptHash: 5,
  wif: 128
}

networks.musicoin = {
  bip32: {
    public: 0xffffffff,
    private: 0xffffffff
  },
  pubKeyHash: 0xff,
  wif: 0xff,
  ethereum: true
}

networks.wincoin = {
  messagePrefix: '\x19WinCoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 73,
  scriptHash: 83,
  wif: 201
}

networks.zclassic = {
  messagePrefix: '\x19Zcash Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x1cb8,
  scriptHash: 0x1cbd,
  wif: 128
}

networks.litecoincash = {
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 28,
  scriptHash: 50,
  wif: 176
}

networks.bitcoinprivate = {
  messagePrefix: '\x19Zcash Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x1325,
  scriptHash: 0x13AF,
  wif: 128
}

networks.kobocoin = {
  messagePrefix: '\x18Kobocoin Signed Message:\n',
  bip32: {
    public: 0x0488B21E,
    private: 0x0488ADE4
  },
  pubKeyHash: 0x23,
  scriptHash: 0x1c,
  wif: 0xa3
}

networks.komodo = {
  messagePrefix: '\x18Komodo Signed Message:\n',
  bip32: {
    public: 0x0488B21E,
    private: 0x0488ADE4
  },
  pubKeyHash: 0x3c,
  scriptHash: 0x55,
  wif: 0xbc
}

export { networks }
