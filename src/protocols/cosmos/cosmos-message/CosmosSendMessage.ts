import { CosmosProtocol, IAirGapTransaction } from '../../..'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { AirGapTransactionType } from '../../../interfaces/IAirGapTransaction'
import { CosmosCoin, CosmosCoinJSON } from '../CosmosCoin'

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

  public toAirGapTransaction(protocol: CosmosProtocol, fee: string): IAirGapTransaction {
    return {
      amount: this.amount
        .map((value: CosmosCoin) => new BigNumber(value.amount))
        .reduce((prev: BigNumber, next: BigNumber) => prev.plus(next))
        .toString(10),
      to: [this.toAddress],
      from: [this.fromAddress],
      isInbound: false,
      fee,
      protocolIdentifier: protocol.identifier,
      network: protocol.options.network,
      transactionDetails: this.toRPCBody(),
      extra: {
        type: AirGapTransactionType.SPEND
      }
    }
  }

  public static fromRPCBody(json: any): CosmosSendMessage {
    return new CosmosSendMessage(
      json.value.from_address,
      json.value.to_address,
      json.value.amount.map((value) => CosmosCoin.fromRPCBody(value))
    )
  }
}
