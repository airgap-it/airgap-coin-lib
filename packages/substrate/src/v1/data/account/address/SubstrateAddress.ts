import { implementsInterface, PublicKey } from '@airgap/module-kit'

export type SubstrateAccountId<T extends SubstrateAddress> = string | PublicKey | T

export interface SubstrateAddress {
  compare(other: SubstrateAccountId<this>): number

  getBufferBytes(): Buffer
  getHexBytes(): string

  asString(): string
}

export function isSubstrateAddress(object: unknown): object is SubstrateAddress {
  return implementsInterface<SubstrateAddress>(object, {
    compare: 'required',
    getBufferBytes: 'required',
    getHexBytes: 'required',
    asString: 'required'
  })
}
