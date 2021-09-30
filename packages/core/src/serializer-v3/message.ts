import { SerializerError, SerializerErrorType } from '../errors'
import { MainProtocolSymbols, ProtocolSymbols } from '../utils/ProtocolSymbols'

import { IACMessageType } from './interfaces'
import { AccountShareResponse } from './schemas/definitions/account-share-response'
import { MessageSignRequest } from './schemas/definitions/message-sign-request'
import { MessageSignResponse } from './schemas/definitions/message-sign-response'
import { SignedAeternityTransaction } from './schemas/definitions/signed-transaction-aeternity'
import { SignedBitcoinTransaction } from './schemas/definitions/signed-transaction-bitcoin'
import { SignedBitcoinSegwitTransaction } from './schemas/definitions/signed-transaction-bitcoin-segwit'
import { SignedCosmosTransaction } from './schemas/definitions/signed-transaction-cosmos'
import { SignedEthereumTransaction } from './schemas/definitions/signed-transaction-ethereum'
import { SignedSubstrateTransaction } from './schemas/definitions/signed-transaction-substrate'
import { SignedTezosTransaction } from './schemas/definitions/signed-transaction-tezos'
import { SignedTezosSaplingTransaction } from './schemas/definitions/signed-transaction-tezos-sapling'
import { UnsignedAeternityTransaction } from './schemas/definitions/unsigned-transaction-aeternity'
import { UnsignedBitcoinTransaction } from './schemas/definitions/unsigned-transaction-bitcoin'
import { UnsignedBitcoinSegwitTransaction } from './schemas/definitions/unsigned-transaction-bitcoin-segwit'
import { UnsignedEthereumTransaction } from './schemas/definitions/unsigned-transaction-ethereum'
import { UnsignedSubstrateTransaction } from './schemas/definitions/unsigned-transaction-substrate'
import { UnsignedTezosTransaction } from './schemas/definitions/unsigned-transaction-tezos'
import { UnsignedTezosSaplingTransaction } from './schemas/definitions/unsigned-transaction-tezos-sapling'
import { SchemaInfo, SchemaItem, SchemaTransformer } from './schemas/schema'
import { SerializerV3 } from './serializer'
import { UnsignedCosmosTransaction } from './types'
import { generateId, ID_LENGTH } from './utils/generateId'
import { jsonToArray, rlpArrayToJson, unwrapSchema } from './utils/json-to-rlp'
import { CBORData } from './utils/toBuffer'

export type IACMessages =
  | AccountShareResponse
  | MessageSignRequest
  | MessageSignResponse
  | UnsignedTezosTransaction
  | UnsignedTezosSaplingTransaction
  | UnsignedAeternityTransaction
  | UnsignedBitcoinTransaction
  | UnsignedBitcoinSegwitTransaction
  | UnsignedCosmosTransaction
  | UnsignedEthereumTransaction
  | UnsignedSubstrateTransaction
  | SignedTezosTransaction
  | SignedTezosSaplingTransaction
  | SignedAeternityTransaction
  | SignedBitcoinTransaction
  | SignedBitcoinSegwitTransaction
  | SignedCosmosTransaction
  | SignedEthereumTransaction
  | SignedSubstrateTransaction

// tslint:disable-next-line:interface-name
export interface IACMessageDefinitionObjectV3 {
  id: number
  type: IACMessageType
  protocol: ProtocolSymbols
  payload: IACMessages
}

export type MessageDefinitionArray = [
  number, // Version
  number, // Type
  ProtocolSymbols, // Protocol
  number, // Session ID
  CBORData // Message
]

export function isMessageDefinitionArray(value: unknown): value is MessageDefinitionArray {
  return (
    Array.isArray(value) &&
    value.length === 5 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number' &&
    typeof value[2] === 'string' &&
    typeof value[3] === 'number' &&
    Array.isArray(value[4])
  )
}

export class Message implements IACMessageDefinitionObjectV3 {
  private readonly version: number
  private readonly schema: SchemaItem

  public readonly id: number
  public readonly type: IACMessageType
  public readonly protocol: ProtocolSymbols
  public readonly payload: IACMessages

  constructor(
    type: IACMessageType,
    protocol: ProtocolSymbols,
    payload: IACMessages,
    id: number = generateId(ID_LENGTH),
    version: number = 1
  ) {
    this.id = id
    this.type = type
    this.protocol = protocol
    this.payload = payload
    this.version = version

    const schemaInfo: SchemaInfo = SerializerV3.getSchema(this.type, this.protocol)
    this.schema = unwrapSchema(schemaInfo.schema)
  }

  public asJson(): IACMessageDefinitionObjectV3 {
    return {
      type: this.type,
      protocol: this.protocol,
      id: this.id,
      payload: this.payload
    }
  }

  public asArray(): MessageDefinitionArray {
    const array: CBORData = jsonToArray('root', this.schema, this.payload)

    return [this.version, this.type, this.protocol, this.id, array]
  }

  public static fromDecoded(object: IACMessageDefinitionObjectV3): Message {
    return new Message(object.type, object.protocol, object.payload, object.id)
  }

  public static fromEncoded(buf: MessageDefinitionArray): Message {
    const version: number = this.validateVersion(buf[0])
    const protocol: ProtocolSymbols = this.validateProtocol(buf[2])
    const type: IACMessageType = this.validateType(buf[1], protocol)

    const id: number = this.validateId(buf[3])
    const encodedPayload: CBORData = this.validatePayload(buf[4])

    const schemaInfo: SchemaInfo = SerializerV3.getSchema(type, protocol)
    const schema: SchemaItem = unwrapSchema(schemaInfo.schema)
    const schemaTransformer: SchemaTransformer | undefined = schemaInfo.transformer
    const json: IACMessages = rlpArrayToJson(schema, encodedPayload) as any as IACMessages
    const payload: IACMessages = schemaTransformer ? schemaTransformer(json) : json

    return new Message(type, protocol, payload, id, version)
  }

  private static validateVersion(version: number): number {
    return this.validateProperty<number, number>('Version', version, (val: number) => val === 0 || val === 1)
  }

  private static validateType(value: number, protocol: ProtocolSymbols): IACMessageType {
    return this.validateProperty<IACMessageType, number>('Type', value, (val: number) => {
      try {
        SerializerV3.getSchema(val, protocol)

        return true
      } catch (error) {
        return false
      }
    })
  }

  private static validateProtocol(protocol: string): ProtocolSymbols {
    return this.validateProperty<ProtocolSymbols, string>(
      'Protocol',
      protocol,
      (val: string) => val.length === 0 || Object.values(MainProtocolSymbols).some((value: string) => val.split('-')[0] === value)
    )
  }

  private static validateId(id: number): number {
    return this.validateProperty<number, number>('Id', id, (val: number) => val.toString().length <= ID_LENGTH)
  }

  private static validatePayload(payload: CBORData): string {
    return this.validateProperty<string, CBORData>('Payload', payload, () => true)
  }

  private static validateProperty<T, U>(property: string, value: U, validate: (value: U) => boolean): T {
    if (typeof value === 'undefined') {
      throw new SerializerError(SerializerErrorType.PROPERTY_IS_EMPTY, `${property} is empty`)
    }

    if (validate(value)) {
      return value as unknown as T // TODO: Use type guard?
    }

    throw new SerializerError(SerializerErrorType.PROPERTY_IS_EMPTY, `${property} is invalid: "${value}"`)
  }
}
