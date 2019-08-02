import { TezosKtProtocol } from '..'

import { Action } from './Action'

export interface ImportAccoutActionContext {
  publicKey: string
}

export class ImportAccountAction extends Action<string[]> {
  public readonly identifier: string = 'tezos-import-account-action'

  public readonly context: ImportAccoutActionContext

  public constructor(context: ImportAccoutActionContext) {
    super()
    this.context = context
  }

  protected async perform(): Promise<string[] | undefined> {
    const protocol: TezosKtProtocol = new TezosKtProtocol()
    const ktAddresses: string[] = await protocol.getAddressesFromPublicKey(this.context.publicKey)

    return ktAddresses
  }
}
