import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { EncodeObject } from '@airgap/coinlib-core/dependencies/src/cosmjs'
import { AirGapTransactionType } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'
import { AirGapTransaction, newAmount } from '@airgap/module-kit'

import { CosmosProtocolNetwork } from '../../../../types/protocol'
import { CosmosCoin, CosmosCoinJSON } from '../../CosmosCoin'

import { CosmosMessage, CosmosMessageJSON, CosmosMessageType } from './CosmosMessage'

export class CosmosSendMessage implements CosmosMessage {
  public readonly fromAddress: string
  public readonly toAddress: string
  public readonly amount: CosmosCoin[]

  public readonly type: CosmosMessageType = CosmosMessageType.Send

  constructor(fromAddress: string, toAddress: string, amount: CosmosCoin[]) {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
  }

  public toEncodeObject(): EncodeObject {
    return {
      typeUrl: this.type.value,
      value: {
        fromAddress: this.fromAddress,
        toAddress: this.toAddress,
        amount: [...this.amount]
      }
    }
  }

  public static fromEncodeObject(encodeObject: EncodeObject): CosmosSendMessage {
    return new CosmosSendMessage(
      encodeObject.value.fromAddress,
      encodeObject.value.toAddress,
      encodeObject.value.amount.map((amount: any) => new CosmosCoin(amount.denom, amount.amount))
    )
  }

  public toJSON(): CosmosMessageJSON {
    return {
      type: this.type.index,
      amount: this.amount.map((value: CosmosCoin) => value.toJSON()),
      fromAddress: this.fromAddress,
      toAddress: this.toAddress
    }
  }

  public static fromJSON(json: CosmosMessageJSON): CosmosSendMessage {
    return new CosmosSendMessage(
      json.fromAddress,
      json.toAddress,
      json.amount.map((value: CosmosCoinJSON) => CosmosCoin.fromJSON(value))
    )
  }

  public toRPCBody(): any {
    return {
      type: this.type.value,
      value: {
        amount: this.amount.map((value: CosmosCoin) => value.toRPCBody()),
        from_address: this.fromAddress,
        to_address: this.toAddress
      }
    }
  }

  public toAirGapTransaction<_Units extends string>(network: CosmosProtocolNetwork, fee: string): AirGapTransaction<_Units> {
    return {
      from: [this.fromAddress],
      to: [this.toAddress],
      isInbound: false,

      amount: newAmount(
        this.amount
          .map((value: CosmosCoin) => new BigNumber(value.amount))
          .reduce((prev: BigNumber, next: BigNumber) => prev.plus(next))
          .toString(10),
        'blockchain'
      ),
      fee: newAmount(fee, 'blockchain'),

      network,
      type: AirGapTransactionType.SPEND,
      json: this.toRPCBody()
    }
  }

  public static fromRPCBody(json: any): CosmosSendMessage {
    return new CosmosSendMessage(
      json.value.from_address,
      json.value.to_address,
      json.value.amount.map((value: any) => CosmosCoin.fromRPCBody(value))
    )
  }
}
