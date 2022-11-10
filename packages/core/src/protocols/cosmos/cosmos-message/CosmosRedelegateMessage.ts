import { EncodeObject } from '../../../dependencies/src/cosmjs'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { CosmosCoin } from '../CosmosCoin'
import { CosmosProtocol } from '../CosmosProtocol'

import { CosmosMessage, CosmosMessageJSON, CosmosMessageType, CosmosMessageTypeIndex } from './CosmosMessage'

export class CosmosRedelegateMessage implements CosmosMessage {
  public readonly delegatorAddress: string
  public readonly validatorSrcAddress: string
  public readonly validatorDestAddress: string
  public readonly amount: CosmosCoin

  public readonly type: CosmosMessageType

  constructor(delegatorAddress: string, validatorSrcAddress: string, validatorDestAddress: string, amount: CosmosCoin) {
    this.delegatorAddress = delegatorAddress
    this.validatorSrcAddress = validatorSrcAddress
    this.validatorDestAddress = validatorDestAddress
    this.amount = amount
    this.type = CosmosMessageType.Redelegate
  }

  public toEncodeObject(): EncodeObject {
    return {
      typeUrl: this.type.value,
      value: {
        delegatorAddress: this.delegatorAddress,
        validatorSrcAddress: this.validatorSrcAddress,
        validatorDestAddress: this.validatorDestAddress,
        amount: this.amount
      }
    }
  }

  public static fromEncodeObject(encodeObject: EncodeObject): CosmosRedelegateMessage {
    return new CosmosRedelegateMessage(
      encodeObject.value.delegatorAddress,
      encodeObject.value.validatorSrcAddress,
      encodeObject.value.validatorDestAddress,
      new CosmosCoin(encodeObject.value.amount?.denom ?? 'uatom', encodeObject.value.amount?.amount ?? '0')
    )
  }

  public toJSON(): CosmosMessageJSON {
    // toAddress is a concatentation of two strings: (1) srcValidator, (2) destValidator
    const toAddress = `${this.validatorSrcAddress}|${this.validatorDestAddress}`

    return {
      type: this.type.index,
      amount: [this.amount.toJSON()],
      fromAddress: this.delegatorAddress,
      toAddress
    }
  }

  public static fromJSON(json: CosmosMessageJSON): CosmosRedelegateMessage {
    // toAddress is a concatentation of two strings: (1) srcValidator, (2) destValidator
    const addressLength = 52 // cosmosvaloper...
    const validatorSrcAddress = json.toAddress.slice(0, addressLength)
    const validatorDestAddress = json.toAddress.slice(addressLength)

    return new CosmosRedelegateMessage(json.fromAddress, validatorSrcAddress, validatorDestAddress, CosmosCoin.fromJSON(json.amount[0]))
  }

  public toRPCBody(): any {
    return {
      type: this.type.value,
      value: {
        amount: this.amount.toRPCBody(),
        delegator_address: this.delegatorAddress,
        validator_src_address: this.validatorSrcAddress,
        validator_dest_address: this.validatorDestAddress
      }
    }
  }

  public toAirGapTransaction(protocol: CosmosProtocol, fee: string): IAirGapTransaction {
    return {
      amount: this.amount.amount,
      from: [this.delegatorAddress],
      // TODO: Not clear what these are used for.
      to: [this.validatorSrcAddress, this.validatorDestAddress],
      isInbound: false,
      fee,
      protocolIdentifier: protocol.identifier,
      network: protocol.options.network,
      transactionDetails: this.toRPCBody(),
      extra: {
        type: CosmosMessageTypeIndex.REDELEGATE
      }
    }
  }

  public static fromRPCBody(json: any): CosmosRedelegateMessage {
    return new CosmosRedelegateMessage(
      json.value.delegator_address,
      json.value.validator_src_address,
      json.value.validator_dest_address,
      CosmosCoin.fromRPCBody(json.value.amount)
    )
  }
}
