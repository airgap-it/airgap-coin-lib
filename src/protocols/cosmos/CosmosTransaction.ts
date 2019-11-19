import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { SerializableUnsignedCosmosTransaction } from '../../serializer/schemas/definitions/transaction-sign-request-cosmos'

// tslint:disable:max-classes-per-file

export interface JSONConvertible {
  toJSON(): any
}

export interface RPCConvertible {
  toRPCBody(): any
}

export interface RLPConvertible {
  toRLP(): any[]
}

export class CosmosTransaction implements JSONConvertible, RPCConvertible, RLPConvertible {
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
      messages: this.messages.map(value => value.toJSON()),
      sequence: this.sequence
    }
  }

  public toRPCBody(): any {
    return {
      account_number: this.accountNumber,
      chain_id: this.chainID,
      fee: this.fee.toRPCBody(),
      memo: this.memo,
      msgs: this.messages.map(value => value.toRPCBody()),
      sequence: this.sequence
    }
  }

  public toRLP(): any[] {
    return [this.messages.map(message => message.toRLP()), this.fee.toRLP(), this.memo, this.chainID, this.accountNumber, this.sequence]
  }

  public toAirGapTransactions(identifier: string): IAirGapTransaction[] {
    const fee = this.fee.amount.map(value => new BigNumber(value.amount)).reduce((prev, next) => prev.plus(next))

    return this.messages.map(message => message.toAirGapTransaction(identifier, fee.toString(10)))
  }

  public static fromJSON(json: SerializableUnsignedCosmosTransaction): CosmosTransaction {
    const messages: CosmosMessage[] = json.transaction.messages.map(value => {
      const type: CosmosMessageTypeIndex = value.type
      switch (type) {
        case CosmosMessageType.Send.index:
          return CosmosSendMessage.fromJSON(value)
        case CosmosMessageType.Delegate.index || CosmosMessageType.Undelegate.index:
          return CosmosDelegateMessage.fromJSON(value)
        default:
          throw new Error('Unknown message')
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
    const messages: CosmosMessage[] = json.msgs.map(value => {
      const type: string = value.type
      switch (type) {
        case CosmosMessageType.Send.value:
          return CosmosSendMessage.fromRPCBody(value)
        case CosmosMessageType.Delegate.value || CosmosMessageType.Undelegate.value:
          return CosmosDelegateMessage.fromRPCBody(value)
        default:
          throw new Error('Unknown message')
      }
    })
    return new CosmosTransaction(messages, CosmosFee.fromRPCBody(json.fee), json.memo, json.chain_id, json.account_number, json.sequence)
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

export interface CosmosMessage extends JSONConvertible, RPCConvertible, RLPConvertible {
  type: CosmosMessageType

  toAirGapTransaction(identifier: string, fee: string): IAirGapTransaction
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

  public toJSON(): any {
    return {
      type: this.type.index,
      amount: this.amount.map((value: CosmosCoin) => value.toJSON()),
      fromAddress: this.fromAddress,
      toAddress: this.toAddress
    }
  }

  public static fromJSON(json) {
    return new CosmosSendMessage(
      json.fromAddress,
      json.toAddress,
      json.amount.map((value: CosmosCoin) => CosmosCoin.fromJSON(value))
    )
  }

  public toRPCBody(): any {
    return {
      type: this.type.value,
      value: {
        amount: this.amount.map(value => value.toRPCBody()),
        from_address: this.fromAddress,
        to_address: this.toAddress
      }
    }
  }

  public toRLP(): any {
    return [this.type.index, this.fromAddress, this.toAddress, this.amount.map(coin => coin.toRLP())]
  }

  public toAirGapTransaction(identifier: string, fee: string): IAirGapTransaction {
    return {
      amount: this.amount
        .map(value => new BigNumber(value.amount))
        .reduce((prev, next) => prev.plus(next))
        .toString(10),
      to: [this.toAddress],
      from: [this.fromAddress],
      isInbound: false,
      fee,
      protocolIdentifier: identifier
    }
  }

  public static fromRPCBody(json: any): CosmosSendMessage {
    return new CosmosSendMessage(
      json.value.from_address,
      json.value.to_address,
      json.value.amount.map(value => CosmosCoin.fromRPCBody(value))
    )
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

  public toJSON(): any {
    return {
      type: this.type.index,
      amount: this.amount.toJSON(),
      delegatorAddress: this.delegatorAddress,
      validatorAddress: this.validatorAddress
    }
  }

  public static fromJSON(json: any): CosmosDelegateMessage {
    return new CosmosDelegateMessage(
      json.delegatorAddress,
      json.validatorAddress,
      CosmosCoin.fromJSON(json.amount),
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

  public toAirGapTransaction(identifier: string, fee: string): IAirGapTransaction {
    return {
      amount: this.amount.amount,
      to: [this.delegatorAddress],
      from: [this.validatorAddress],
      isInbound: false,
      fee,
      protocolIdentifier: identifier
    }
  }

  public toRLP(): any {
    return [this.type.index, this.delegatorAddress, this.validatorAddress, this.amount.toRLP()]
  }

  public static fromRPCBody(json: any): CosmosDelegateMessage {
    return new CosmosDelegateMessage(
      json.value.delegator_address,
      json.value.validator_address,
      CosmosCoin.fromRPCBody(json.value.amount),
      json.type === CosmosMessageType.Undelegate.value
    )
  }

  public static fromRLP(rlp: RLPCosmosDelegateMessage): CosmosDelegateMessage {
    const type: number = parseInt(rlp[0].toString(), 10)

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

  public toAirGapTransaction(identifier: string, fee: string): IAirGapTransaction {
    return {
      to: [this.validatorAddress],
      from: [this.delegatorAddress],
      amount: '0',
      isInbound: false,
      fee,
      protocolIdentifier: identifier
    }
  }

  public toJSON() {
    return {
      type: this.type.value,
      delegatorAddress: this.delegatorAddress,
      validatorAddress: this.validatorAddress
    }
  }

  public static fromJSON(json: any): CosmosWithdrawDelegationRewardMessage {
    return new CosmosWithdrawDelegationRewardMessage(json.delegator_address, json.validator_address)
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

  public toRLP(): any[] {
    return [this.type.index, this.delegatorAddress, this.validatorAddress]
  }

  public static fromRPCBody(json: any): CosmosWithdrawDelegationRewardMessage {
    return new CosmosWithdrawDelegationRewardMessage(json.value.delegator_address, json.value.validator_address)
  }

  public static fromRLP(rlp: RLPCosmosWithdrawDelegationRewardMessage): CosmosWithdrawDelegationRewardMessage {
    return new CosmosWithdrawDelegationRewardMessage(rlp[0].toString(), rlp[1].toString())
  }
}

export class CosmosCoin implements RPCConvertible, RLPConvertible {
  public readonly denom: string
  public readonly amount: string

  constructor(denom: string, amount: string) {
    this.denom = denom
    this.amount = amount
  }

  public toJSON() {
    return {
      amount: this.amount,
      denom: this.denom
    }
  }

  public static fromJSON(json: any): CosmosCoin {
    return new CosmosCoin(json.denom, json.amount)
  }

  public toRPCBody(): any {
    return {
      amount: this.amount,
      denom: this.denom
    }
  }

  public toRLP(): any {
    return [this.denom, this.amount]
  }

  public static fromRPCBody(json: any): CosmosCoin {
    return new CosmosCoin(json.denom, json.amount)
  }

  public static fromRLP(rlp: RLPCosmosCoin): CosmosCoin {
    return new CosmosCoin(rlp[0].toString(), rlp[1].toString())
  }
}

export class CosmosFee implements RPCConvertible, RLPConvertible {
  public readonly amount: CosmosCoin[]
  public readonly gas: string

  constructor(amount: CosmosCoin[], gas: string) {
    this.amount = amount
    this.gas = gas
  }

  public toJSON() {
    return {
      amount: this.amount.map(value => value.toJSON()),
      gas: this.gas
    }
  }

  public static fromJSON(json: any): CosmosFee {
    return new CosmosFee(
      json.amount.map((value: any) => CosmosCoin.fromJSON(value)),
      json.gas
    )
  }

  public toRPCBody(): any {
    return {
      amount: this.amount.map(value => value.toRPCBody()),
      gas: this.gas
    }
  }

  public toRLP(): any {
    return [this.amount.map(coin => coin.toRLP()), this.gas]
  }

  public static fromRPCBody(json: any): CosmosFee {
    return new CosmosFee(
      json.amount.map((value: any) => CosmosCoin.fromRPCBody(value)),
      json.gas
    )
  }

  public static fromRLP(rlp: RLPCosmosFee): CosmosFee {
    return new CosmosFee(
      rlp[0].map(coin => CosmosCoin.fromRLP(coin)),
      rlp[1].toString()
    )
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
