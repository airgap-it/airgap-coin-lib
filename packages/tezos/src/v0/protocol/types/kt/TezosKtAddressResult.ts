import { TezosAddressResult } from '../TezosAddressResult'

import { TezosKtAddressCursor } from './TezosKtAddressCursor'

export interface TezosKtAddressResult extends TezosAddressResult {
  cursor: TezosKtAddressCursor
}
