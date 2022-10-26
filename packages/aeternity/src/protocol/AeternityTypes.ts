import { IAirGapAddressResult, IProtocolAddressCursor } from '@airgap/coinlib-core/interfaces/IAirGapAddress'
import { IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'

export interface AeternityTransactionCursor {
  page: number
}

export interface AeternityTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: AeternityTransactionCursor
}

export interface AeternityAddressCursor extends IProtocolAddressCursor {
  hasNext: false
}

export interface AeternityAddressResult extends IAirGapAddressResult<AeternityAddressCursor> {}
