import BigNumber from 'bignumber.js'
import { AirGapMarketWallet } from '../wallet/AirGapMarketWallet'
import { RawCosmosTransaction } from '../serializer/unsigned-transactions/cosmos-transactions.serializer'
import { IAirGapTransaction } from '../interfaces/IAirGapTransaction'
import { CosmosProtocol } from '../protocols/cosmos/CosmosProtocol'
import { SyncProtocolUtils, EncodedType } from '../serializer/serializer'
import { Action } from './Action'

export interface CosmosDelegationActionContext {
  wallet: AirGapMarketWallet
  validatorAddress: string
  amount: BigNumber
  undelegate: boolean
}

export interface CosmosDelegationActionResult {
  rawTx: RawCosmosTransaction
  serializedTx: string
  airGapTxs: IAirGapTransaction[] | void
  dataUrl: string
}

export class CosmosDelegateAction<Context extends CosmosDelegationActionContext> extends Action<CosmosDelegationActionResult, Context> {
  public readonly identifier = 'cosmos-delegate-action'

  protected async perform(): Promise<CosmosDelegationActionResult> {
    const protocol = new CosmosProtocol()
    const syncProtocol = new SyncProtocolUtils()
    const transaction = await protocol.delegate(
      this.context.wallet.publicKey,
      this.context.validatorAddress,
      this.context.amount,
      this.context.undelegate
    )

    const serializeTransaction = await syncProtocol.serialize({
      version: 1,
      protocol: this.context.wallet.coinProtocol.identifier,
      type: EncodedType.UNSIGNED_TRANSACTION,
      payload: {
        publicKey: this.context.wallet.publicKey,
        transaction,
        callback: 'airgap-wallet://?d='
      }
    })

    let airGapTransactions: IAirGapTransaction[] | void
    try {
      airGapTransactions = await this.context.wallet.coinProtocol.getTransactionDetails({
        publicKey: this.context.wallet.publicKey,
        transaction
      })
    } catch {}

    return {
      rawTx: transaction,
      serializedTx: serializeTransaction,
      airGapTxs: airGapTransactions,
      dataUrl: `airgap-vault://?d=${serializeTransaction}`
    }
  }
}
