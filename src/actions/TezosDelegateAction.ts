import { AirGapMarketWallet, IAirGapTransaction, TezosProtocol } from '..'
import { CosmosTransaction } from '../protocols/cosmos/CosmosTransaction'
import { IACMessageType } from '../serializer/interfaces'
import { Serializer } from '../serializer/serializer'
import { RawAeternityTransaction, RawBitcoinTransaction, RawEthereumTransaction, RawTezosTransaction } from '../serializer/types'

import { Action } from './Action'

export interface TezosDelegateActionContext {
  wallet: AirGapMarketWallet
  delegate: string
}

export interface TezosDelegateActionResult {
  rawTx: RawTezosTransaction
  serializedTx: string[]
  airGapTxs: IAirGapTransaction[] | void
  dataUrl: string
}

async function serializeTx(
  wallet: AirGapMarketWallet,
  transaction: RawTezosTransaction | RawEthereumTransaction | RawBitcoinTransaction | RawAeternityTransaction | CosmosTransaction
): Promise<string[]> {
  const serializer: Serializer = new Serializer()

  return serializer.serialize([
    {
      protocol: wallet.coinProtocol.identifier,
      type: IACMessageType.TransactionSignRequest,
      payload: {
        publicKey: wallet.publicKey,
        transaction: transaction as RawEthereumTransaction,
        callback: 'airgap-wallet://?d='
      }
    }
  ])
}

function getAirGapTx(
  wallet: AirGapMarketWallet,
  transaction: RawTezosTransaction | RawEthereumTransaction | RawBitcoinTransaction | RawAeternityTransaction | CosmosTransaction
): Promise<IAirGapTransaction[] | void> {
  return wallet.coinProtocol.getTransactionDetails({
    publicKey: wallet.publicKey,
    transaction
  })
}

export class TezosDelegateAction<Context extends TezosDelegateActionContext> extends Action<TezosDelegateActionResult, Context> {
  public readonly identifier: string = 'tezos-delegate-action'

  protected async perform(): Promise<TezosDelegateActionResult> {
    return new Promise<TezosDelegateActionResult>(
      async (resolve: (context: TezosDelegateActionResult) => void, reject: (error: Error) => void): Promise<void> => {
        if (this.context.wallet.protocolIdentifier === 'xtz') {
          const protocol: TezosProtocol = new TezosProtocol()

          try {
            const originateTx: RawTezosTransaction = await protocol.delegate(this.context.wallet.publicKey, this.context.delegate)
            const serializedTx: string[] = await serializeTx(this.context.wallet, originateTx)

            const airGapTxs: IAirGapTransaction[] | void = await getAirGapTx(this.context.wallet, originateTx)
            resolve({ rawTx: originateTx, serializedTx, airGapTxs, dataUrl: `airgap-vault://?d=${serializedTx.join(',')}` })
          } catch (error) {
            reject(error)
          }
        }
      }
    )
  }
}
