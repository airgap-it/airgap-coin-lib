import { TezosKtAddress } from '../protocols/tezos/kt/TezosKtAddress'
import { TezosKtProtocol } from '../protocols/tezos/kt/TezosKtProtocol'

import { Action } from './Action'

export interface ImportAccoutActionContext {
  publicKey: string
}

export class ImportAccountAction extends Action<string[], ImportAccoutActionContext> {
  get identifier(): string {
    return 'tezos-import-account-action'
  }

  protected async perform(): Promise<string[]> {
    const protocol: TezosKtProtocol = new TezosKtProtocol()
    const ktAddresses: TezosKtAddress[] = await protocol.getAddressesFromPublicKey(this.context.publicKey)

    return ktAddresses.map((address: TezosKtAddress) => address.getValue())
  }
}
