import { EncodeObject } from '@airgap/coinlib-core/dependencies/src/cosmjs'
import { IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'
import { ProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import { CosmosProtocolNetwork } from '../CosmosProtocolOptions'

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

  public toAirGapTransaction(identifier: ProtocolSymbols, network: CosmosProtocolNetwork, fee: string): IAirGapTransaction {
    return {
      from: [this.delegatorAddress],
      to: [this.validatorAddress],
      amount: '0',
      isInbound: false,
      fee,
      protocolIdentifier: identifier,
      network,
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
