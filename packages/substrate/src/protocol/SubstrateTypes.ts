import { IAirGapAddressResult, IProtocolAddressCursor } from '@airgap/coinlib-core/interfaces/IAirGapAddress'
import { IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'

export interface SubstrateTransactionCursor {
  page: number
}

export interface SubstrateTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: SubstrateTransactionCursor
}

export interface SubstrateAddressCursor extends IProtocolAddressCursor {
  hasNext: false
}

export interface SubstrateAddressResult extends IAirGapAddressResult<SubstrateAddressCursor> {}
