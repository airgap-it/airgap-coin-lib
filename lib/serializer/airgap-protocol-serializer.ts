import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import * as rlp from 'rlp'
import { IAirGapTransaction } from '../interfaces/IAirGapTransaction'
import { EthereumProtocol } from '../protocols/EthereumProtocol'

const localWeb3: Web3 = new Web3()

enum EncodedType {
  UNSIGNED_TRANSACTION = 0,
  SIGNED_TRANSACTION = 1
}

abstract class TransactionSerializer {
  protected urlPrefix = 'airgap-vault://s?d='

  public abstract serialize(...args: any): string
  public abstract toURLScheme(serializedTx: string): string
  public abstract fromURLScheme(url: string): string
  public abstract deserialize(serializedTx: string): IAirGapTransaction
}

export type UnsignedEthereumTransaction = [string, string, string, string, string, string]
export type UnsignedTransaction = UnsignedEthereumTransaction

export enum TransactionKeys {
  VERSION,
  UNSIGNED_TRANSACTION,
  TYPE,
  PROTOCOL,
  FROM,
  TO,
  AMOUNT,
  FEE,
  PUBLIC_KEY
}

interface SerializedTransaction extends Array<number | UnsignedTransaction | string | EncodedType | string[]> {
  [TransactionKeys.VERSION]: number
  [TransactionKeys.UNSIGNED_TRANSACTION]: UnsignedTransaction
  [TransactionKeys.TYPE]: EncodedType
  [TransactionKeys.PROTOCOL]: string
  [TransactionKeys.FROM]: string
  [TransactionKeys.TO]: string[]
  [TransactionKeys.AMOUNT]: string[]
  [TransactionKeys.FEE]: string
  [TransactionKeys.PUBLIC_KEY]: string
}

export class EthereumUnsignedTransactionSerializer extends TransactionSerializer {
  constructor(private coinProtocol: EthereumProtocol) {
    super()
  }

  public serialize(from: string, fee: BigNumber, amount: BigNumber, publicKey: string, transaction: UnsignedEthereumTransaction): string {
    const serializedTx: SerializedTransaction = [
      1, // version
      transaction,
      EncodedType.UNSIGNED_TRANSACTION, // type
      'eth', // protocol identifier
      from, // from
      [], // to
      [localWeb3.utils.stringToHex(amount.toString())], // amount
      localWeb3.utils.stringToHex(fee.toString()), // fee
      publicKey // publicKey
    ]

    // as any is necessary due to https://github.com/ethereumjs/rlp/issues/35
    return rlp.encode(serializedTx as any).toString('base64')
  }

  public deserialize(serializedTx: string): IAirGapTransaction {
    const base64DecodedBuffer = Buffer.from(serializedTx, 'base64')
    const rlpDecodedTx: SerializedTransaction = (rlp.decode(base64DecodedBuffer as any) as unknown) as SerializedTransaction

    const airgapTx: IAirGapTransaction = {
      amount: new BigNumber(rlpDecodedTx[TransactionKeys.AMOUNT][0]),
      fee: new BigNumber(rlpDecodedTx[TransactionKeys.FEE]),
      from: [rlpDecodedTx[TransactionKeys.FROM]],
      to: [''], // ToDo
      isInbound: true, // ToDO
      protocolIdentifier: 'eth'
    }

    return airgapTx
  }

  public toURLScheme(serializedTx: string) {
    return this.urlPrefix + serializedTx
  }

  public fromURLScheme(url: string) {
    if (url.startsWith(this.urlPrefix)) {
      return this.deserialize(url.slice(url.indexOf(this.urlPrefix)))
    }

    throw new Error(`URL-Scheme does not start with ${this.urlPrefix}`)
  }
}
