import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import BigNumber from 'bignumber.js'

export interface JSONConvertible {
  toJSON(): any
}

export interface RLPConvertible {
  toRLP(): any[]
}

export class CosmosTransaction implements JSONConvertible, RLPConvertible {
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

  public toJSON(): any {
    return {
      account_number: this.accountNumber,
      chain_id: this.chainID,
      fee: this.fee.toJSON(),
      memo: this.memo,
      msgs: this.messages.map(value => value.toJSON()),
      sequence: this.sequence
    }
  }

  public toRLP(): any[] {
    return [this.messages.map(message => message.toRLP()), this.fee.toRLP(), this.memo, this.chainID, this.accountNumber, this.sequence]
  }

  public toAirGapTransactions(identifier: string): IAirGapTransaction[] {
    const fee = this.fee.amount.map(value => value.amount).reduce((prev, next) => prev.plus(next))
    return this.messages.map(message => message.toAirGapTransaction(identifier, fee))
  }

  public static fromJSON(json: any): CosmosTransaction {
    const messages: CosmosMessage[] = json.msgs.map(value => {
      const type: string = value.type
      switch (type) {
        case CosmosMessageType.Send.value:
          return CosmosSendMessage.fromJSON(value)
        case CosmosMessageType.Delegate.value || CosmosMessageType.Undelegate.value:
          return CosmosDelegateMessage.fromJSON(value)
        default:
          throw new Error('Unknown message')
      }
    })
    return new CosmosTransaction(messages, CosmosFee.fromJSON(json.fee), json.memo, json.chain_id, json.account_number, json.sequence)
  }

  public static fromRLP(rlp: RLPCosmosTransaction): CosmosTransaction {
    const messages = rlp[RLPCosmosTransactionKeys.MESSAGES]
    const fee = rlp[RLPCosmosTransactionKeys.FEE]
    const memo = rlp[RLPCosmosTransactionKeys.MEMO]
    const chainID = rlp[RLPCosmosTransactionKeys.CHAIN_ID]
    const accountNumber = rlp[RLPCosmosTransactionKeys.ACCOUNT_NUMBER]
    const sequence = rlp[RLPCosmosTransactionKeys.SEQUENCE]

    return new CosmosTransaction(
      messages.map(message => {
        const type = parseInt(message[0].toString())
        switch (type) {
          case CosmosMessageType.Send.index:
            const sendMessage = message as RLPCosmosSendMessage
            return CosmosSendMessage.fromRLP(sendMessage)
          case CosmosMessageType.Delegate.index:
          case CosmosMessageType.Undelegate.index:
            const delegateMessage = message as RLPCosmosDelegateMessage
            return CosmosDelegateMessage.fromRLP(delegateMessage)
          case CosmosMessageType.WithdrawDelegationReward.index:
            const withdrawMessage = message as RLPCosmosWithdrawDelegationRewardMessage
            return CosmosWithdrawDelegationRewardMessage.fromRLP(withdrawMessage)
          default:
            throw new Error('Unknown message type')
        }
      }),
      CosmosFee.fromRLP(fee),
      memo.toString(),
      chainID.toString(),
      accountNumber.toString(),
      sequence.toString()
    )
  }
}

export interface CosmosMessage extends JSONConvertible, RLPConvertible {
  type: CosmosMessageType

  toAirGapTransaction(identifier: string, fee: BigNumber): IAirGapTransaction
}

export enum CosmosMessageTypeIndex {
  SEND = 0,
  DELEGATE = 1,
  UNDELEGATE = 2,
  WITHDRAW_DELEGATION_REWARD = 3
}

export class CosmosMessageType {
  public static Send = new CosmosMessageType(CosmosMessageTypeIndex.SEND)
  public static Delegate = new CosmosMessageType(CosmosMessageTypeIndex.DELEGATE)
  public static Undelegate = new CosmosMessageType(CosmosMessageTypeIndex.UNDELEGATE)
  public static WithdrawDelegationReward = new CosmosMessageType(CosmosMessageTypeIndex.WITHDRAW_DELEGATION_REWARD)

  public readonly index: CosmosMessageTypeIndex
  public readonly value: string

  constructor(index: CosmosMessageTypeIndex) {
    this.index = index
    switch (index) {
      case CosmosMessageTypeIndex.SEND:
        this.value = 'cosmos-sdk/MsgSend'
        break
      case CosmosMessageTypeIndex.DELEGATE:
        this.value = 'cosmos-sdk/MsgDelegate'
        break
      case CosmosMessageTypeIndex.UNDELEGATE:
        this.value = 'cosmos-sdk/MsgUndelegate'
        break
      case CosmosMessageTypeIndex.WITHDRAW_DELEGATION_REWARD:
        this.value = 'cosmos-sdk/MsgWithdrawDelegationReward'
        break
      default:
        throw new Error('Unknown message type')
    }
  }
}

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

  toJSON(): any {
    return {
      type: this.type.value,
      value: {
        amount: this.amount.map(value => value.toJSON()),
        from_address: this.fromAddress,
        to_address: this.toAddress
      }
    }
  }

  toRLP(): any {
    return [this.type.index, this.fromAddress, this.toAddress, this.amount.map(coin => coin.toRLP())]
  }

  toAirGapTransaction(identifier: string, fee: BigNumber): IAirGapTransaction {
    return {
      amount: this.amount.map(value => value.amount).reduce((prev, next) => prev.plus(next)),
      to: [this.toAddress],
      from: [this.fromAddress],
      isInbound: false,
      fee: fee,
      protocolIdentifier: identifier
    }
  }

  public static fromJSON(json: any): CosmosSendMessage {
    return new CosmosSendMessage(json.value.from_address, json.value.to_address, json.value.amount.map(value => CosmosCoin.fromJSON(value)))
  }

  public static fromRLP(rlp: RLPCosmosSendMessage): CosmosSendMessage {
    const from = rlp[1].toString()
    const to = rlp[2].toString()
    const amount = rlp[3].map(coin => CosmosCoin.fromRLP(coin))
    return new CosmosSendMessage(from, to, amount)
  }
}

export class CosmosDelegateMessage implements CosmosMessage {
  public readonly delegatorAddress: string
  public readonly validatorAddress: string
  public readonly amount: CosmosCoin

  public readonly type: CosmosMessageType

  constructor(delegatorAddress: string, validatorAddress: string, amount: CosmosCoin, undelegate: boolean = false) {
    this.delegatorAddress = delegatorAddress
    this.validatorAddress = validatorAddress
    this.amount = amount
    if (undelegate) {
      this.type = CosmosMessageType.Undelegate
    } else {
      this.type = CosmosMessageType.Delegate
    }
  }

  toJSON(): any {
    return {
      type: this.type.value,
      value: {
        amount: this.amount.toJSON(),
        delegator_address: this.delegatorAddress,
        validator_address: this.validatorAddress
      }
    }
  }

  toAirGapTransaction(identifier: string, fee: BigNumber): IAirGapTransaction {
    return {
      amount: this.amount.amount,
      to: [this.delegatorAddress],
      from: [this.validatorAddress],
      isInbound: false,
      fee: fee,
      protocolIdentifier: identifier
    }
  }

  toRLP(): any {
    return [this.type.index, this.delegatorAddress, this.validatorAddress, this.amount.toRLP()]
  }

  public static fromJSON(json: any): CosmosDelegateMessage {
    return new CosmosDelegateMessage(
      json.value.delegator_address,
      json.value.validator_address,
      CosmosCoin.fromJSON(json.value.amount),
      json.type === CosmosMessageType.Undelegate.value
    )
  }

  public static fromRLP(rlp: RLPCosmosDelegateMessage): CosmosDelegateMessage {
    const type = parseInt(rlp[0].toString())
    return new CosmosDelegateMessage(
      rlp[1].toString(),
      rlp[2].toString(),
      CosmosCoin.fromRLP(rlp[3]),
      type === CosmosMessageType.Undelegate.index
    )
  }
}

export class CosmosWithdrawDelegationRewardMessage implements CosmosMessage {
  public readonly delegatorAddress: string
  public readonly validatorAddress: string
  public readonly type: CosmosMessageType = CosmosMessageType.WithdrawDelegationReward

  constructor(delegatorAddress: string, validatorAddress: string) {
    this.delegatorAddress = delegatorAddress
    this.validatorAddress = validatorAddress
  }

  toAirGapTransaction(identifier: string, fee: BigNumber): IAirGapTransaction {
    return {
      to: [this.validatorAddress],
      from: [this.delegatorAddress],
      amount: new BigNumber(0),
      isInbound: false,
      fee: fee,
      protocolIdentifier: identifier
    }
  }

  toJSON() {
    return {
      type: this.type.value,
      value: {
        delegator_address: this.delegatorAddress,
        validator_address: this.validatorAddress
      }
    }
  }

  toRLP(): any[] {
    return [this.type.index, this.delegatorAddress, this.validatorAddress]
  }

  public static fromJSON(json: any): CosmosWithdrawDelegationRewardMessage {
    return new CosmosWithdrawDelegationRewardMessage(json.value.delegator_address, json.value.validator_address)
  }

  public static fromRLP(rlp: RLPCosmosWithdrawDelegationRewardMessage): CosmosWithdrawDelegationRewardMessage {
    return new CosmosWithdrawDelegationRewardMessage(rlp[0].toString(), rlp[1].toString())
  }
}

export class CosmosCoin implements JSONConvertible, RLPConvertible {
  public readonly denom: string
  public readonly amount: BigNumber

  constructor(denom: string, amount: BigNumber) {
    this.denom = denom
    this.amount = amount
  }

  toJSON(): any {
    return {
      amount: this.amount.toFixed(),
      denom: this.denom
    }
  }

  toRLP(): any {
    return [this.denom, this.amount]
  }

  public static fromJSON(json: any): CosmosCoin {
    return new CosmosCoin(json.denom, new BigNumber(json.amount))
  }

  public static fromRLP(rlp: RLPCosmosCoin): CosmosCoin {
    return new CosmosCoin(rlp[0].toString(), new BigNumber(rlp[1].toString()))
  }
}

export class CosmosFee implements JSONConvertible, RLPConvertible {
  public readonly amount: CosmosCoin[]
  public readonly gas: BigNumber

  constructor(amount: CosmosCoin[], gas: BigNumber) {
    this.amount = amount
    this.gas = gas
  }

  toJSON(): any {
    return {
      amount: this.amount.map(value => value.toJSON()),
      gas: this.gas.toFixed()
    }
  }

  toRLP(): any {
    return [this.amount.map(coin => coin.toRLP()), this.gas]
  }

  public static fromJSON(json: any): CosmosFee {
    return new CosmosFee(json.amount.map((value: any) => CosmosCoin.fromJSON(value)), new BigNumber(json.gas))
  }

  public static fromRLP(rlp: RLPCosmosFee): CosmosFee {
    return new CosmosFee(rlp[0].map(coin => CosmosCoin.fromRLP(coin)), new BigNumber(rlp[1].toString()))
  }
}

export type RLPCosmosCoin = [
  Buffer, // denom
  Buffer // amount
]

export type RLPCosmosFee = [
  RLPCosmosCoin[],
  Buffer // gas
]

export type RLPCosmosSendMessage = [
  Buffer, // type
  Buffer, // from address
  Buffer, // to address
  RLPCosmosCoin[] // amount
]

export type RLPCosmosDelegateMessage = [
  Buffer, // type
  Buffer, // delegator address
  Buffer, // validator address
  RLPCosmosCoin // amount
]

export type RLPCosmosWithdrawDelegationRewardMessage = [
  Buffer, // type
  Buffer, // delegator address
  Buffer // validator address
]

export type RLPCosmosMessage = RLPCosmosSendMessage | RLPCosmosDelegateMessage | RLPCosmosWithdrawDelegationRewardMessage

export enum RLPCosmosTransactionKeys {
  MESSAGES = 0,
  FEE = 1,
  MEMO = 2,
  CHAIN_ID = 3,
  ACCOUNT_NUMBER = 4,
  SEQUENCE = 5
}

export type RLPCosmosTransaction = [
  RLPCosmosMessage[], // messages
  RLPCosmosFee, // fee end
  Buffer, // memo
  Buffer, // chain id
  Buffer, // account number
  Buffer // sequence number
]
