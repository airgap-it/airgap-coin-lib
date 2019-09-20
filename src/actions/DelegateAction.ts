import { AirGapMarketWallet, EncodedType, IAirGapTransaction, SyncProtocolUtils, TezosKtProtocol, TezosProtocol } from '..'
import { RawAeternityTransaction } from '../serializer/unsigned-transactions/aeternity-transactions.serializer'
import { RawBitcoinTransaction } from '../serializer/unsigned-transactions/bitcoin-transactions.serializer'
import { RawEthereumTransaction } from '../serializer/unsigned-transactions/ethereum-transactions.serializer'
import { RawTezosTransaction } from '../serializer/unsigned-transactions/tezos-transactions.serializer'

import { Action } from './Action'
import { RawCosmosTransaction } from '../serializer/unsigned-transactions/cosmos-transactions.serializer'

export interface TezosDelegateActionContext {
  wallet: AirGapMarketWallet
  delegate: string
}

export interface TezosDelegateActionResult {
  rawTx: RawTezosTransaction
  serializedTx: string
  airGapTxs: IAirGapTransaction[] | void
  dataUrl: string
}

function serializeTx(
  wallet: AirGapMarketWallet,
  transaction: RawTezosTransaction | RawEthereumTransaction | RawBitcoinTransaction | RawAeternityTransaction | RawCosmosTransaction
): Promise<string> {
  const syncProtocol: SyncProtocolUtils = new SyncProtocolUtils()

  return syncProtocol.serialize({
    version: 1,
    protocol: wallet.coinProtocol.identifier,
    type: EncodedType.UNSIGNED_TRANSACTION,
    payload: {
      publicKey: wallet.publicKey,
      transaction,
      callback: 'airgap-wallet://?d='
    }
  })
}

function getAirGapTx(
  wallet: AirGapMarketWallet,
  transaction: RawTezosTransaction | RawEthereumTransaction | RawBitcoinTransaction | RawAeternityTransaction | RawCosmosTransaction
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
      async (resolve: (context: TezosDelegateActionResult) => void, reject: () => void): Promise<void> => {
        if (this.context.wallet.protocolIdentifier === 'xtz') {
          const protocol: TezosProtocol = new TezosProtocol()

          try {
            const originateTx: RawTezosTransaction = await protocol.originate(this.context.wallet.publicKey, this.context.delegate)
            const serializedTx: string = await serializeTx(this.context.wallet, originateTx)

            const airGapTxs: IAirGapTransaction[] | void = await getAirGapTx(this.context.wallet, originateTx)
            resolve({ rawTx: originateTx, serializedTx, airGapTxs, dataUrl: `airgap-vault://?d=${serializedTx}` })
          } finally {
            reject()
          }
        } else {
          const protocol: TezosKtProtocol = new TezosKtProtocol()

          try {
            const delegateTx: RawTezosTransaction = await protocol.delegate(
              this.context.wallet.publicKey,
              this.context.wallet.receivingPublicAddress,
              this.context.delegate
            )
            const serializedTx: string = await serializeTx(this.context.wallet, delegateTx)

            const airGapTxs: IAirGapTransaction[] | void = await getAirGapTx(this.context.wallet, delegateTx)
            resolve({ rawTx: delegateTx, serializedTx, airGapTxs, dataUrl: `airgap-vault://?d=${serializedTx}` })
          } finally {
            reject()
          }
        }
      }
    )
  }
}
