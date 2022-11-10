import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { EncodeObject } from '../../dependencies/src/cosmjs'
import { InvalidValueError } from '../../errors'
import { Domain } from '../../errors/coinlib-error'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { SerializableUnsignedCosmosTransaction } from '../../serializer/schemas/definitions/unsigned-transaction-cosmos'

import { CosmosDelegateMessage } from './cosmos-message/CosmosDelegateMessage'
import { CosmosMessage, CosmosMessageType, CosmosMessageTypeIndex } from './cosmos-message/CosmosMessage'
import { CosmosRedelegateMessage } from './cosmos-message/CosmosRedelegateMessage'
import { CosmosSendMessage } from './cosmos-message/CosmosSendMessage'
import { CosmosWithdrawDelegationRewardMessage } from './cosmos-message/CosmosWithdrawDelegationRewardMessage'
import { CosmosFee } from './CosmosFee'
import { CosmosProtocol } from './CosmosProtocol'

export interface JSONConvertible {
  toJSON(): any
}

export interface RPCConvertible {
  toRPCBody(): any
}

export interface Encodable {
  toEncodeObject(): EncodeObject
}

export class CosmosTransaction implements JSONConvertible, RPCConvertible, Encodable {
  public readonly messages: CosmosMessage[]
  public readonly fee: CosmosFee
  public readonly memo: string
  public readonly chainID: string
  public readonly accountNumber: string
  public readonly sequence: string

  constructor(messages: CosmosMessage[], fee: CosmosFee, memo: string, chainID: string, accountNumber: string, sequence: string) {
    this.messages = messages
    this.fee = fee
    this.memo = memo
    this.chainID = chainID
    this.accountNumber = accountNumber
    this.sequence = sequence
  }

  public toJSON() {
    return {
      accountNumber: this.accountNumber,
      chainID: this.chainID,
      fee: this.fee.toJSON(),
      memo: this.memo,
      messages: this.messages.map((value) => value.toJSON()),
      sequence: this.sequence
    }
  }

  public toRPCBody(): any {
    return {
      account_number: this.accountNumber,
      chain_id: this.chainID,
      fee: this.fee.toRPCBody(),
      memo: this.memo,
      msgs: this.messages.map((value) => value.toRPCBody()),
      sequence: this.sequence
    }
  }

  public toEncodeObject(): EncodeObject {
    return {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: {
        messages: this.messages.map((msg) => msg.toEncodeObject()),
        memo: this.memo
      }
    }
  }

  public toAirGapTransactions(protocol: CosmosProtocol): IAirGapTransaction[] {
    const fee = this.fee.amount.map((value) => new BigNumber(value.amount)).reduce((prev, next) => prev.plus(next))

    return this.messages
      .map((message: CosmosMessage) => message.toAirGapTransaction(protocol, fee.toString(10)))
      .map((tx: IAirGapTransaction) => {
        if (!tx.transactionDetails) {
          tx.transactionDetails = {}
        }
        tx.transactionDetails.accountNumber = this.accountNumber
        tx.transactionDetails.chainID = this.chainID
        tx.transactionDetails.memo = this.memo
        tx.transactionDetails.sequence = this.sequence

        return tx
      })
  }

  public static fromJSON(json: SerializableUnsignedCosmosTransaction): CosmosTransaction {
    const messages: CosmosMessage[] = json.transaction.messages.map((value) => {
      const type: CosmosMessageTypeIndex = value.type
      switch (type) {
        case CosmosMessageType.Send.index:
          return CosmosSendMessage.fromJSON(value)
        case CosmosMessageType.Delegate.index:
        case CosmosMessageType.Undelegate.index:
          return CosmosDelegateMessage.fromJSON(value)
        case CosmosMessageType.WithdrawDelegationReward.index:
          return CosmosWithdrawDelegationRewardMessage.fromJSON(value)
        case CosmosMessageType.Redelegate.index:
          return CosmosRedelegateMessage.fromJSON(value)
        default:
          throw new InvalidValueError(Domain.COSMOS, 'Unknown message')
      }
    })

    return new CosmosTransaction(
      messages,
      CosmosFee.fromJSON(json.transaction.fee),
      json.transaction.memo,
      json.transaction.chainID,
      json.transaction.accountNumber,
      json.transaction.sequence
    )
  }

  public static fromRPCBody(json: any): CosmosTransaction {
    const messages: CosmosMessage[] = json.msgs.map((value) => {
      const type: string = value.type
      switch (type) {
        case CosmosMessageType.Send.value:
          return CosmosSendMessage.fromRPCBody(value)
        case CosmosMessageType.Delegate.value:
        case CosmosMessageType.Undelegate.value:
          return CosmosDelegateMessage.fromRPCBody(value)
        case CosmosMessageType.WithdrawDelegationReward.value:
          return CosmosWithdrawDelegationRewardMessage.fromRPCBody(value)
        case CosmosMessageType.Redelegate.value:
          return CosmosRedelegateMessage.fromRPCBody(value)
        default:
          throw new InvalidValueError(Domain.COSMOS, 'Unknown message')
      }
    })

    return new CosmosTransaction(messages, CosmosFee.fromRPCBody(json.fee), json.memo, json.chain_id, json.account_number, json.sequence)
  }
}
