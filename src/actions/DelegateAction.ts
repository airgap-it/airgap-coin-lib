import { AirGapMarketWallet, EncodedType, IAirGapTransaction, SyncProtocolUtils, TezosKtProtocol, TezosProtocol } from '..'
import { RawAeternityTransaction } from '../serializer/unsigned-transactions/aeternity-transactions.serializer'
import { RawBitcoinTransaction } from '../serializer/unsigned-transactions/bitcoin-transactions.serializer'
import { RawEthereumTransaction } from '../serializer/unsigned-transactions/ethereum-transactions.serializer'
import { RawTezosTransaction } from '../serializer/unsigned-transactions/tezos-transactions.serializer'

import { Action, ActionProgress } from './Action'

export interface DelegateActionContext {
  wallet: AirGapMarketWallet
  delegate: string
}

export interface DelegateActionResult {
  rawTx: RawTezosTransaction
  serializedTx: string
  airGapTx: IAirGapTransaction | void
  dataUrl: string
}

function serializeTx(
  wallet: AirGapMarketWallet,
  transaction: RawTezosTransaction | RawEthereumTransaction | RawBitcoinTransaction | RawAeternityTransaction
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
  transaction: RawTezosTransaction | RawEthereumTransaction | RawBitcoinTransaction | RawAeternityTransaction
): Promise<IAirGapTransaction | void> {
  return wallet.coinProtocol.getTransactionDetails({
    publicKey: wallet.publicKey,
    transaction
  })
}

export class DelegateAction<Context extends DelegateActionContext> extends Action<Context, ActionProgress<void>, DelegateActionResult> {
  public readonly identifier: string = 'tezos-delegate-action'

  public readonly handlerFunction = async (context?: Context): Promise<DelegateActionResult | undefined> => {
    if (!context) {
      return undefined
    }

    return new Promise<DelegateActionResult>(
      async (resolve: (context: DelegateActionResult) => void, reject: () => void): Promise<void> => {
        if (context.wallet.protocolIdentifier === 'xtz') {
          const protocol: TezosProtocol = new TezosProtocol()

          try {
            const originateTx: RawTezosTransaction = await protocol.originate(context.wallet.publicKey, context.delegate)
            const serializedTx: string = await serializeTx(context.wallet, originateTx)

            const airGapTx: IAirGapTransaction | void = await getAirGapTx(context.wallet, originateTx)
            resolve({ rawTx: originateTx, serializedTx, airGapTx, dataUrl: `airgap-vault://?d=${serializedTx}` })
          } finally {
            reject()
          }
        } else {
          const protocol: TezosKtProtocol = new TezosKtProtocol()

          try {
            const delegateTx: RawTezosTransaction = await protocol.delegate(
              context.wallet.publicKey,
              context.wallet.receivingPublicAddress,
              context.delegate
            )
            const serializedTx: string = await serializeTx(context.wallet, delegateTx)

            const airGapTx: IAirGapTransaction | void = await getAirGapTx(context.wallet, delegateTx)
            resolve({ rawTx: delegateTx, serializedTx, airGapTx, dataUrl: `airgap-vault://?d=${serializedTx}` })
          } finally {
            reject()
          }
        }
      }
    )
  }
}
