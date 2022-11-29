import { EncodeObject } from '@airgap/coinlib-core/dependencies/src/cosmjs'
import { AirGapTransactionType } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'
import { AirGapTransaction, newAmount } from '@airgap/module-kit'

import { CosmosProtocolNetwork, CosmosUnits } from '../../../types/protocol'
import { CosmosCoin } from '../../CosmosCoin'

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

  public toEncodeObject(): EncodeObject {
    return {
      typeUrl: this.type.value,
      value: {
        delegatorAddress: this.delegatorAddress,
        validatorAddress: this.validatorAddress,
        amount: this.amount
      }
    }
  }

  public static fromEncodeObject(encodeObject: EncodeObject): CosmosDelegateMessage {
    const undelegate = encodeObject.typeUrl === CosmosMessageType.Undelegate.value
    return new CosmosDelegateMessage(
      encodeObject.value.delegatorAddress,
      encodeObject.value.validatorAddress,
      new CosmosCoin(encodeObject.value.amount?.denom ?? 'uatom', encodeObject.value.amount?.amount ?? '0'),
      undelegate
    )
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

  public toAirGapTransaction(network: CosmosProtocolNetwork, fee: string): AirGapTransaction<CosmosUnits> {
    return {
      from: [this.delegatorAddress],
      to: [this.validatorAddress],
      isInbound: false,

      amount: newAmount(this.amount.amount, 'blockchain'),
      fee: newAmount(fee, 'blockchain'),

      network,
      type: this.type.index === CosmosMessageTypeIndex.DELEGATE ? AirGapTransactionType.DELEGATE : AirGapTransactionType.UNDELEGATE,
      json: this.toRPCBody()
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
