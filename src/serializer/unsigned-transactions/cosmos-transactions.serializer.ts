import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'
import BigNumber from 'bignumber.js'

export type SerializedUnsignedCosmosSendMessage = [
  Buffer, // type
  Buffer, // from address
  Buffer, // to address
  [
    // amount
    Buffer, // denom
    Buffer // amount
  ][] // amount end
]

export type SerializedUnsignedCosmosDelegateMessage = [
  Buffer, // type
  Buffer, // delegator address
  Buffer, // validator address
  [
    // amount
    Buffer, // denom
    Buffer // amount
  ] // amount end
]

export type SerializedUnsignedCosmosTransaction = [
  (SerializedUnsignedCosmosSendMessage | SerializedUnsignedCosmosDelegateMessage)[], // messages
  [
    // fee
    [
      Buffer, // denom
      Buffer // amount
    ][],
    Buffer // gas
  ], // fee end
  Buffer, // memo
  Buffer, // chain id
  Buffer, // account number
  Buffer // sequence number
]

export enum SerializedUnsignedCosmosTransactionKeys {
  MESSAGES = 0,
  FEE = 1,
  MEMO = 2,
  CHAIN_ID = 3,
  ACCOUNT_NUMBER = 4,
  SEQUENCE = 5
}

export class RawCosmosTransaction {
  public messages: RawCosmosMessage[]
  public fee: RawCosmosFee
  public memo: string
  public chainID: string
  public accountNumber: string
  public sequence: string

  constructor(messages: RawCosmosMessage[], fee: RawCosmosFee, memo: string, chainID: string, accountNumber: string, sequence: string) {
    this.messages = messages
    this.fee = fee
    this.memo = memo
    this.chainID = chainID
    this.accountNumber = accountNumber
    this.sequence = sequence
  }

  toJSON(): any {
    return {
      account_number: this.accountNumber,
      chain_id: this.chainID,
      fee: this.fee.toJSON(),
      memo: this.memo,
      msgs: this.messages.map(value => value.toJSON()),
      sequence: this.sequence
    }
  }

  public static fromJSON(json: any): RawCosmosTransaction {
    const messages: RawCosmosMessage[] = json.msgs.map(value => {
      const type: string = value.type
      switch (type) {
        case RawCosmosMessageType.Send.value:
          return RawCosmosSendMessage.fromJSON(value)
        case RawCosmosMessageType.Delegate.value || RawCosmosMessageType.Undelegate.value:
          return RawCosmosDelegateMessage.fromJSON(value)
        default:
          throw new Error('Unknown message')
      }
    })
    return new RawCosmosTransaction(messages, RawCosmosFee.fromJSON(json.fee), json.memo, json.chain_id, json.account_number, json.sequence)
  }
}

export interface RawCosmosMessage extends JSONConvertible, RLPConvertible {
  type: RawCosmosMessageType
}

export interface JSONConvertible {
  toJSON(): any
}

export interface RLPConvertible {
  toRLP(): any[]
}

enum RawCosmosMessageTypeIndex {
  SEND = 0,
  DELEGATE = 1,
  UNDELEGATE = 2
}

export class RawCosmosMessageType {
  static Send = new RawCosmosMessageType(RawCosmosMessageTypeIndex.SEND)
  static Delegate = new RawCosmosMessageType(RawCosmosMessageTypeIndex.DELEGATE)
  static Undelegate = new RawCosmosMessageType(RawCosmosMessageTypeIndex.UNDELEGATE)

  index: RawCosmosMessageTypeIndex
  value: string

  constructor(index: RawCosmosMessageTypeIndex) {
    this.index = index
    switch (index) {
      case RawCosmosMessageTypeIndex.SEND:
        this.value = 'cosmos-sdk/MsgSend'
        break
      case RawCosmosMessageTypeIndex.DELEGATE:
        this.value = 'cosmos-sdk/MsgDelegate'
        break
      case RawCosmosMessageTypeIndex.UNDELEGATE:
        this.value = 'cosmos-sdk/MsgUndelegate'
        break
      default:
        this.value = 'cosmos-sdk/MsgSend'
        break
    }
  }
}

export class RawCosmosSendMessage implements RawCosmosMessage {
  public fromAddress: string
  public toAddress: string
  public amount: RawCosmosCoin[]

  public readonly type: RawCosmosMessageType = RawCosmosMessageType.Send

  constructor(fromAddress: string, toAddress: string, amount: RawCosmosCoin[]) {
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

  public static fromJSON(json: any): RawCosmosSendMessage {
    return new RawCosmosSendMessage(json.value.from_address, json.to_address, json.value.amount.map(value => RawCosmosCoin.fromJSON(value)))
  }
}

export class RawCosmosDelegateMessage implements RawCosmosMessage {
  public delegatorAddress: string
  public validatorAddress: string
  public amount: RawCosmosCoin

  public readonly type: RawCosmosMessageType

  constructor(delegatorAddress: string, validatorAddress: string, amount: RawCosmosCoin, undelegate: boolean = false) {
    this.delegatorAddress = delegatorAddress
    this.validatorAddress = validatorAddress
    this.amount = amount
    if (undelegate) {
      this.type = RawCosmosMessageType.Undelegate
    } else {
      this.type = RawCosmosMessageType.Delegate
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

  toRLP(): any {
    return [this.type.index, this.delegatorAddress, this.validatorAddress, this.amount.toRLP()]
  }

  public static fromJSON(json: any): RawCosmosDelegateMessage {
    return new RawCosmosDelegateMessage(
      json.value.delegator_address,
      json.value.validator_address,
      RawCosmosCoin.fromJSON(json.value.amount),
      json.type === RawCosmosMessageType.Undelegate.value
    )
  }
}

export class RawCosmosCoin implements JSONConvertible, RLPConvertible {
  public denom: string
  public amount: BigNumber

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

  public static fromJSON(json: any): RawCosmosCoin {
    return new RawCosmosCoin(json.denom, new BigNumber(json.denom))
  }
}

export class RawCosmosFee implements JSONConvertible, RLPConvertible {
  public amount: RawCosmosCoin[]
  public gas: BigNumber

  constructor(amount: RawCosmosCoin[], gas: BigNumber) {
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
    return [this.amount.map(coin => [coin.denom, coin.amount]), this.gas]
  }

  public static fromJSON(json: any): RawCosmosFee {
    return new RawCosmosFee(json.account.map((value: any) => RawCosmosCoin.fromJSON(value)), new BigNumber(json.gas))
  }
}

export interface UnsignedCosmosTransaction extends UnsignedTransaction {
  transaction: RawCosmosTransaction
}

export class CosmosUnsignedTransactionSerializer extends UnsignedTransactionSerializer {
  public serialize(unsignedTx: UnsignedCosmosTransaction): SerializedSyncProtocolTransaction {
    const serialized = [
      [
        unsignedTx.transaction.messages.map(message => message.toRLP()),
        unsignedTx.transaction.fee.toRLP(),
        unsignedTx.transaction.memo,
        unsignedTx.transaction.chainID,
        unsignedTx.transaction.accountNumber,
        unsignedTx.transaction.sequence
      ],
      unsignedTx.publicKey, // publicKey
      unsignedTx.callback ? unsignedTx.callback : 'airgap-wallet://?d=' // callback-scheme
    ]
    return toBuffer(serialized) as SerializedSyncProtocolTransaction
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedCosmosTransaction {
    const cosmosTx = serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION] as SerializedUnsignedCosmosTransaction
    const messages = cosmosTx[SerializedUnsignedCosmosTransactionKeys.MESSAGES]
    const fee = cosmosTx[SerializedUnsignedCosmosTransactionKeys.FEE]
    const memo = cosmosTx[SerializedUnsignedCosmosTransactionKeys.MEMO]
    const chainID = cosmosTx[SerializedUnsignedCosmosTransactionKeys.CHAIN_ID]
    const accountNumber = cosmosTx[SerializedUnsignedCosmosTransactionKeys.ACCOUNT_NUMBER]
    const sequence = cosmosTx[SerializedUnsignedCosmosTransactionKeys.SEQUENCE]

    const rawCosmosTx = new RawCosmosTransaction(
      messages.map(message => {
        const type = parseInt(message[0].toString())
        if (type === RawCosmosMessageType.Send.index) {
          const sendMessage = message as SerializedUnsignedCosmosSendMessage
          return new RawCosmosSendMessage(
            sendMessage[1].toString(),
            sendMessage[2].toString(),
            sendMessage[3].map(coin => new RawCosmosCoin(coin[0].toString(), new BigNumber(coin[1].toString())))
          )
        } /* if (type === RawCosmosMessageType.DELEGATE || type === RawCosmosMessageType.UNDELEGATE) */ else {
          const delegateMessage = message as SerializedUnsignedCosmosDelegateMessage
          return new RawCosmosDelegateMessage(
            delegateMessage[1].toString(),
            delegateMessage[2].toString(),
            new RawCosmosCoin(delegateMessage[3][0].toString(), new BigNumber(delegateMessage[3][1].toString())),
            type === RawCosmosMessageType.Undelegate.index
          )
        }
      }),
      new RawCosmosFee(
        fee[0].map(amount => new RawCosmosCoin(amount[0].toString(), new BigNumber(amount[1].toString()))),
        new BigNumber(fee[1].toString())
      ),
      memo.toString(),
      chainID.toString(),
      accountNumber.toString(),
      sequence.toString()
    )
    return {
      transaction: rawCosmosTx,
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
    }
  }
}
