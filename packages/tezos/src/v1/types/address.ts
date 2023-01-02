import { AddressCursor } from '@airgap/module-kit'

export interface TezosSaplingAddressCursor extends AddressCursor {
  diversifierIndex?: string
}

export interface TezosKtAddressCursor extends AddressCursor {
  index: number
}
