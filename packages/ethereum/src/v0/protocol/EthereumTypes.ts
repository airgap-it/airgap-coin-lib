import { IAirGapAddressResult, IProtocolAddressCursor } from '@airgap/coinlib-core/interfaces/IAirGapAddress'
import { IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'

export interface EthereumTransactionCursor {
  page: number
}

export interface EthereumTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: EthereumTransactionCursor
}

export interface EthereumAddressCursor extends IProtocolAddressCursor {
  hasNext: false
}

export interface EthereumAddressResult extends IAirGapAddressResult<EthereumAddressCursor> {}
