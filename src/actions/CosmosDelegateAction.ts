import BigNumber from '../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../interfaces/IAirGapTransaction'
import { CosmosProtocol } from '../protocols/cosmos/CosmosProtocol'
import { CosmosTransaction } from '../protocols/cosmos/CosmosTransaction'
import { IACMessageType } from '../serializer/v2/interfaces'
import { Serializer } from '../serializer/v2/serializer.new'
import { AirGapMarketWallet } from '../wallet/AirGapMarketWallet'

import { Action } from './Action'

export interface CosmosDelegateActionContext {
  wallet: AirGapMarketWallet
  validatorAddress: string
  amount: BigNumber
  undelegate: boolean
}

export interface CosmosDelegateActionResult {
  rawTx: CosmosTransaction
  serializedTx: string[]
  airGapTxs: IAirGapTransaction[] | void
  dataUrl: string
}

export class CosmosDelegateAction<Context extends CosmosDelegateActionContext> extends Action<CosmosDelegateActionResult, Context> {
  public readonly identifier = 'cosmos-delegate-action'

  protected async perform(): Promise<CosmosDelegateActionResult> {
    const protocol = new CosmosProtocol()
    const transaction = await protocol.delegate(
      this.context.wallet.publicKey,
      this.context.validatorAddress,
      this.context.amount,
      this.context.undelegate
    )

    const serializer: Serializer = new Serializer()

    const serializedTx: string[] = await serializer.serialize([
      {
        protocol: this.context.wallet.coinProtocol.identifier,
        type: IACMessageType.TransactionSignRequest,
        data: {
          publicKey: this.context.wallet.publicKey,
          transaction,
          callback: 'airgap-wallet://?d='
        }
      }
    ])

    let airGapTransactions: IAirGapTransaction[] | void
    try {
      airGapTransactions = await this.context.wallet.coinProtocol.getTransactionDetails({
        publicKey: this.context.wallet.publicKey,
        transaction
      })
    } catch {}

    return {
      rawTx: transaction,
      serializedTx,
      airGapTxs: airGapTransactions,
      dataUrl: `airgap-vault://?d=${serializedTx.join(',')}`
    }
  }
}
