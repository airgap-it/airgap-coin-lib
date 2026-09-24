import type * as bitcoin from '@airgap/coinlib-core/dependencies/src/bitcoinjs-lib-6.1.7/src/index'

export interface BitcoinJS {
  lib: any
  message: any
  config: {
    network: any
    /** Hash used when base58check-encoding extended keys: SHA256d for Bitcoin, groestl for Groestlcoin. */
    addressHashFunction: (input: Buffer) => Buffer
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
