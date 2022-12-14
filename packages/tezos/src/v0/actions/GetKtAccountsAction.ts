import { Action } from '@airgap/coinlib-core'

import { TezosKtProtocol } from '../protocol/kt/TezosKtProtocol'
import { TezosKtAddressResult } from '../protocol/types/kt/TezosKtAddressResult'

export interface ImportAccoutActionContext {
  publicKey: string
}

export class ImportAccountAction extends Action<string[], ImportAccoutActionContext> {
  get identifier(): string {
    return 'tezos-import-account-action'
  }

  protected async perform(): Promise<string[]> {
    const protocol: TezosKtProtocol = new TezosKtProtocol()
    const ktAddresses: TezosKtAddressResult[] = await protocol.getAddressesFromPublicKey(this.context.publicKey)

    return ktAddresses.map((address: TezosKtAddressResult) => address.address)
  }
}
