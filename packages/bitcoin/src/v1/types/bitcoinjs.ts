import type * as bitcoin from 'bitcoinjs-lib'

export interface BitcoinJS {
  lib: any
  message: any
  config: {
    network: any
  }
}

export interface BitcoinLegacyJS {
  lib: typeof bitcoin
  config: {
    network: any
  }
}

export interface BitcoinSegwitJS {
  lib: typeof bitcoin
  config: {
    network: bitcoin.Network
  }
}

export interface BitcoinTaprootJS {
  lib: typeof bitcoin
  config: {
    network: bitcoin.Network
  }
}
