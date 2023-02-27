import { derive } from './derive'
import { deriveEd25519 } from './ed25519/derive'
import { decodeDerivative, encodeDerivative } from './encoding'
import { mnemonicToSeed } from './secret'
import { deriveSr25519 } from './sr25519/derive'

// Derive

export { derive, deriveEd25519, deriveSr25519 }

// Secret

export { mnemonicToSeed }

// Utils

export { encodeDerivative, decodeDerivative }
