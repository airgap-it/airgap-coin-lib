import { EncodeObject } from '@airgap/coinlib-core/dependencies/src/cosmjs'
import { AirGapTransaction, newAmount } from '@airgap/module-kit'

import { CosmosProtocolNetwork } from '../../../../types/protocol'

import { CosmosMessage, CosmosMessageJSON, CosmosMessageType } from './CosmosMessage'

export class CosmosWithdrawDelegationRewardMessage implements CosmosMessage {
  public readonly delegatorAddress: string
  public readonly validatorAddress: string
  public readonly type: CosmosMessageType = CosmosMessageType.WithdrawDelegationReward

  constructor(delegatorAddress: string, validatorAddress: string) {
    this.delegatorAddress = delegatorAddress
    this.validatorAddress = validatorAddress
  }

  public toEncodeObject(): EncodeObject {
    return {
      typeUrl: this.type.value,
      value: {
        delegatorAddress: this.delegatorAddress,
        validatorAddress: this.validatorAddress
      }
    }
  }

  public static fromEncodeObject(encodeObject: EncodeObject): CosmosWithdrawDelegationRewardMessage {
    return new CosmosWithdrawDelegationRewardMessage(encodeObject.value.delegatorAddress, encodeObject.value.validatorAddress)
  }

  public toAirGapTransaction<_Units extends string>(network: CosmosProtocolNetwork, fee: string): AirGapTransaction<_Units> {
    return {
      from: [this.delegatorAddress],
      to: [this.validatorAddress],
      isInbound: false,

      amount: newAmount('0', 'blockchain'),
      fee: newAmount(fee, 'blockchain'),
      network,
      json: this.toRPCBody()
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
