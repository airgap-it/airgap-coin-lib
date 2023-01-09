import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { EncodeObject } from '@airgap/coinlib-core/dependencies/src/cosmjs'
import { InvalidValueError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { JSONConvertible } from '@airgap/coinlib-core/interfaces/JSONConvertible'
import { RPCConvertible } from '@airgap/coinlib-core/interfaces/RPCConvertible'
import { AirGapTransaction } from '@airgap/module-kit'

import { CosmosProtocolNetwork, CosmosUnits } from '../../types/protocol'
import { CosmosUnsignedTransaction } from '../../types/transaction'
import { CosmosFee } from '../CosmosFee'

import { CosmosDelegateMessage } from './message/CosmosDelegateMessage'
import { CosmosMessage, CosmosMessageType, CosmosMessageTypeIndex } from './message/CosmosMessage'
import { CosmosSendMessage } from './message/CosmosSendMessage'
import { CosmosWithdrawDelegationRewardMessage } from './message/CosmosWithdrawDelegationRewardMessage'

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

  public toAirGapTransactions(network: CosmosProtocolNetwork): AirGapTransaction<CosmosUnits>[] {
    const fee = this.fee.amount.map((value) => new BigNumber(value.amount)).reduce((prev, next) => prev.plus(next))

    return this.messages
      .map((message: CosmosMessage) => message.toAirGapTransaction(network, fee.toString(10)))
      .map((tx: AirGapTransaction<CosmosUnits>) => {
        if (!tx.json) {
          tx.json = {}
        }
        tx.json.accountNumber = this.accountNumber
        tx.json.chainID = this.chainID
        tx.json.memo = this.memo
        tx.json.sequence = this.sequence

        tx.arbitraryData = this.memo

        return tx
      })
  }

  public static fromJSON(json: CosmosUnsignedTransaction): CosmosTransaction {
    const messages: CosmosMessage[] = json.messages.map((value) => {
      const type: CosmosMessageTypeIndex = value.type
      switch (type) {
        case CosmosMessageType.Send.index:
          return CosmosSendMessage.fromJSON(value)
        case CosmosMessageType.Delegate.index:
        case CosmosMessageType.Undelegate.index:
          return CosmosDelegateMessage.fromJSON(value)
        case CosmosMessageType.WithdrawDelegationReward.index:
          return CosmosWithdrawDelegationRewardMessage.fromJSON(value)
        default:
          throw new InvalidValueError(Domain.COSMOS, 'Unknown message')
      }
    })

    return new CosmosTransaction(messages, CosmosFee.fromJSON(json.fee), json.memo, json.chainID, json.accountNumber, json.sequence)
  }

  public static fromRPCBody(json: any): CosmosTransaction {
    const messages: CosmosMessage[] = json.msgs.map((value: any) => {
      const type: string = value.type
      switch (type) {
        case CosmosMessageType.Send.value:
          return CosmosSendMessage.fromRPCBody(value)
        case CosmosMessageType.Delegate.value:
        case CosmosMessageType.Undelegate.value:
          return CosmosDelegateMessage.fromRPCBody(value)
        case CosmosMessageType.WithdrawDelegationReward.value:
          return CosmosWithdrawDelegationRewardMessage.fromRPCBody(value)
        default:
          throw new InvalidValueError(Domain.COSMOS, 'Unknown message')
      }
    })

    return new CosmosTransaction(messages, CosmosFee.fromRPCBody(json.fee), json.memo, json.chain_id, json.account_number, json.sequence)
  }
}
