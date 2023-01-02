import { implementsInterface } from '@airgap/module-kit'

import { TezosFATokenMetadata } from '../types/fa/TezosFATokenMetadata'

export function isFATokenMetadata(obj: unknown): obj is TezosFATokenMetadata {
  return implementsInterface<TezosFATokenMetadata>(obj, {
    symbol: 'required',
    name: 'required',
    decimals: 'required'
  })
}
