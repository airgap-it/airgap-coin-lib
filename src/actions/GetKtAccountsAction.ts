import { TezosKtProtocol } from '..'

import { Action, ActionProgress } from './Action'

export interface ImportAccoutActionContext {
  publicKey: string
}

export class ImportAccountAction extends Action<ImportAccoutActionContext, ActionProgress<void>, string[]> {
  public readonly identifier: string = 'tezos-import-account-action'

  public readonly handlerFunction = async (context?: ImportAccoutActionContext): Promise<string[] | undefined> => {
    if (!context) {
      return undefined
    }

    const protocol: TezosKtProtocol = new TezosKtProtocol()
    const ktAddresses: string[] = await protocol.getAddressesFromPublicKey(context.publicKey)

    return ktAddresses
  }
}
