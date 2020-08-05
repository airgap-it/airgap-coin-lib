import { TezosKtProtocol } from '../protocols/tezos/kt/TezosKtProtocol'

import { Action } from './Action'

export interface ImportAccoutActionContext {
  publicKey: string
}

export class ImportAccountAction extends Action<string[], ImportAccoutActionContext> {
  public readonly identifier: string = 'tezos-import-account-action'

  protected async perform(): Promise<string[]> {
    const protocol: TezosKtProtocol = new TezosKtProtocol()
    const ktAddresses: string[] = await protocol.getAddressesFromPublicKey(this.context.publicKey)

    return ktAddresses
  }
}
