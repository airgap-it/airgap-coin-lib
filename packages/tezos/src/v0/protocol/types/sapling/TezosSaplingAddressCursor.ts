import { IProtocolAddressCursor } from '@airgap/coinlib-core/interfaces/IAirGapAddress'

export interface TezosSaplingAddressCursor extends IProtocolAddressCursor {
  diversifierIndex?: string
}
