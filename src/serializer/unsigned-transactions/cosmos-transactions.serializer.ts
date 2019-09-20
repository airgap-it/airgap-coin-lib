import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'
import BigNumber from 'bignumber.js'

export type SerializedUnsignedCosmosTransaction = [
  [[Buffer, Buffer, [[Buffer, Buffer]]]],
  [[[Buffer, Buffer]], Buffer],
  Buffer,
  Buffer,
  Buffer,
  Buffer
]

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

  toSignJSON(accountNumber: string, sequence: string): any {
    return {
      accountNumber: accountNumber,
      chain_id: this.chainID,
      fee: this.fee.toSignJSON(),
      memo: this.memo,
      msgs: this.messages.map(value => value.toSignJSON()),
      sequence: sequence
    }
  }
}

export interface RawCosmosMessage {
  toSignJSON(): any
  toRLP(): any
}

export class RawCosmosSendMessage implements RawCosmosMessage {
  public fromAddress: string
  public toAddress: string
  public amount: RawCosmosCoin[]

  constructor(fromAddress: string, toAddress: string, amount: RawCosmosCoin[]) {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
  }

  toSignJSON(): any {
    return {
      type: 'cosmos-sdk/MsgSend',
      value: {
        amount: this.amount.map(value => value.toSignJSON()),
        from_address: this.fromAddress,
        to_address: this.toAddress
      }
    }
  }

  toRLP(): any {
    return [this.fromAddress, this.toAddress, this.amount.map(coin => coin.toRLP())]
  }
}

export class RawCosmosDelegateMessage implements RawCosmosMessage {
  public delegatorAddress: string
  public validatorAddress: string
  public amount: RawCosmosCoin

  constructor(delegatorAddress: string, validatorAddress: string, amount: RawCosmosCoin) {
    this.delegatorAddress = delegatorAddress
    this.validatorAddress = validatorAddress
    this.amount = amount
  }

  toSignJSON(): any {
    return {
      type: 'cosmos-sdk/MsgDelegate',
      value: {
        amount: this.amount.toSignJSON(),
        delegator_address: this.delegatorAddress,
        validator_address: this.validatorAddress
      }
    }
  }

  toRLP(): any {}
}

export class RawCosmosCoin implements RawCosmosMessage {
  public denom: string
  public amount: BigNumber

  constructor(denom: string, amount: BigNumber) {
    this.denom = denom
    this.amount = amount
  }

  toSignJSON(): any {
    return {
      amount: this.amount.toFixed(),
      denom: this.denom
    }
  }

  toRLP(): any {
    return [this.denom, this.amount]
  }
}

export class RawCosmosFee implements RawCosmosMessage {
  public amount: RawCosmosCoin[]
  public gas: BigNumber

  constructor(amount: RawCosmosCoin[], gas: BigNumber) {
    this.amount = amount
    this.gas = gas
  }

  toSignJSON(): any {
    return {
      amount: this.amount.map(value => value.toSignJSON()),
      gas: this.gas.toFixed()
    }
  }

  toRLP(): any {
    return [this.amount.map(coin => [coin.denom, coin.amount]), this.gas]
  }
}

export interface UnsignedCosmosTransaction extends UnsignedTransaction {
  transaction: RawCosmosTransaction
}

export class CosmosTransactionSerializer extends UnsignedTransactionSerializer {
  public serialize(unsignedTx: UnsignedCosmosTransaction): SerializedSyncProtocolTransaction {
    const serialized = [
      [
        unsignedTx.transaction.messages.map(message => message.toRLP()),
        unsignedTx.transaction.fee.toRLP(),
        unsignedTx.transaction.memo,
        unsignedTx.transaction.chainID
      ],
      unsignedTx.publicKey, // publicKey
      unsignedTx.callback ? unsignedTx.callback : 'airgap-wallet://?d=' // callback-scheme
    ]
    return toBuffer(serialized) as SerializedSyncProtocolTransaction
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedCosmosTransaction {
    const cosmosTx = serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION] as SerializedUnsignedCosmosTransaction
    const messages = cosmosTx[0]
    const fee = cosmosTx[1]
    const memo = cosmosTx[2]
    const chainID = cosmosTx[3]
    const accountNumber = cosmosTx[4]
    const sequence = cosmosTx[5]

    const rawCosmosTx = new RawCosmosTransaction(
      messages.map(
        message =>
          new RawCosmosSendMessage(
            message[0].toString(),
            message[1].toString(),
            message[2].map(coin => new RawCosmosCoin(coin[0].toString(), new BigNumber(coin[1].toString())))
          )
      ),
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
