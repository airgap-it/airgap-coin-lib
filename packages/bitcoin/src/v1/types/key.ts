export type BitcoinExtendedSecretKeyEncoding = 'xpriv'
export type BitcoinTestnetExtendedSecretKeyEncoding = 'tpriv'
export type BitcoinSegwitSecretKeyEncoding = BitcoinExtendedSecretKeyEncoding | 'ypriv' | 'zpriv'

export type BitcoinExtendedPublicKeyEncoding = 'xpub'
export type BitcoinTestnetExtendedPublicKeyEncoding = 'tpub'
export type BitcoinSegwitExtendedPublicKeyEncoding = BitcoinExtendedPublicKeyEncoding | 'ypub' | 'zpub'
