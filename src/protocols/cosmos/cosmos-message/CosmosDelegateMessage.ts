import { CosmosProtocol, IAirGapTransaction } from '../../..'
import { AirGapTransactionType } from '../../../interfaces/IAirGapTransaction'
import { CosmosCoin } from '../CosmosCoin'

import { CosmosMessage, CosmosMessageJSON, CosmosMessageType, CosmosMessageTypeIndex } from './CosmosMessage'

export class CosmosDelegateMessage implements CosmosMessage {
  public readonly delegatorAddress: string
  public readonly validatorAddress: string
  public readonly amount: CosmosCoin

  public readonly type: CosmosMessageType

  constructor(delegatorAddress: string, validatorAddress: string, amount: CosmosCoin, undelegate: boolean = false) {
    this.delegatorAddress = delegatorAddress
    this.validatorAddress = validatorAddress
    this.amount = amount
    this.type = undelegate ? CosmosMessageType.Undelegate : CosmosMessageType.Delegate
  }

  public toJSON(): CosmosMessageJSON {
    return {
      type: this.type.index,
      amount: [this.amount.toJSON()],
      fromAddress: this.delegatorAddress,
      toAddress: this.validatorAddress
    }
  }

  public static fromJSON(json: CosmosMessageJSON): CosmosDelegateMessage {
    return new CosmosDelegateMessage(
      json.fromAddress,
      json.toAddress,
      CosmosCoin.fromJSON(json.amount[0]),
      json.type === CosmosMessageType.Undelegate.index
    )
  }

  public toRPCBody(): any {
    return {
      type: this.type.value,
      value: {
        amount: this.amount.toRPCBody(),
        delegator_address: this.delegatorAddress,
        validator_address: this.validatorAddress
      }
    }
  }

  public toAirGapTransaction(protocol: CosmosProtocol, fee: string): IAirGapTransaction {
    return {
      amount: this.amount.amount,
      from: [this.delegatorAddress],
      to: [this.validatorAddress],
      isInbound: false,
      fee,
      protocolIdentifier: protocol.identifier,
      network: protocol.options.network,
      transactionDetails: this.toRPCBody(),
      extra: {
        type: this.type.index === CosmosMessageTypeIndex.DELEGATE ? AirGapTransactionType.DELEGATE : AirGapTransactionType.UNDELEGATE
      }
    }
  }

  public static fromRPCBody(json: any): CosmosDelegateMessage {
    return new CosmosDelegateMessage(
      json.value.delegator_address,
      json.value.validator_address,
      CosmosCoin.fromRPCBody(json.value.amount),
      json.type === CosmosMessageType.Undelegate.value
    )
  }
}
