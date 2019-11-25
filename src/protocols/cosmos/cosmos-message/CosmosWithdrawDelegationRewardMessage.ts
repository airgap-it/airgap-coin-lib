import { CosmosMessageType, CosmosMessage, CosmosMessageJSON } from './CosmosMessage'
import { IAirGapTransaction } from '../../..'

export class CosmosWithdrawDelegationRewardMessage implements CosmosMessage {
  public readonly delegatorAddress: string
  public readonly validatorAddress: string
  public readonly type: CosmosMessageType = CosmosMessageType.WithdrawDelegationReward

  constructor(delegatorAddress: string, validatorAddress: string) {
    this.delegatorAddress = delegatorAddress
    this.validatorAddress = validatorAddress
  }

  public toAirGapTransaction(identifier: string, fee: string): IAirGapTransaction {
    return {
      to: [this.validatorAddress],
      from: [this.delegatorAddress],
      amount: '0',
      isInbound: false,
      fee,
      protocolIdentifier: identifier,
      transactionDetails: this.toRPCBody()
    }
  }

  public toJSON(): CosmosMessageJSON {
    return {
      type: this.type.index,
      amount: [{ denom: '', amount: '' }],
      fromAddress: this.delegatorAddress,
      toAddress: this.validatorAddress
    }
  }

  public static fromJSON(json: CosmosMessageJSON): CosmosWithdrawDelegationRewardMessage {
    return new CosmosWithdrawDelegationRewardMessage(json.fromAddress, json.toAddress)
  }

  public toRPCBody() {
    return {
      type: this.type.value,
      value: {
        delegator_address: this.delegatorAddress,
        validator_address: this.validatorAddress
      }
    }
  }

  public static fromRPCBody(json: any): CosmosWithdrawDelegationRewardMessage {
    return new CosmosWithdrawDelegationRewardMessage(json.value.delegator_address, json.value.validator_address)
  }
}
