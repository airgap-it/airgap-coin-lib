import { SignedAeternityTransaction, UnsignedAeternityTransaction } from '@airgap/aeternity'
import {
  SignedBitcoinSegwitTransaction,
  SignedBitcoinTransaction,
  UnsignedBitcoinSegwitTransaction,
  UnsignedBitcoinTransaction
} from '@airgap/bitcoin'
import { SerializerError, SerializerErrorType } from '@airgap/coinlib-core/errors'
import { MainProtocolSymbols, ProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import { SignedCosmosTransaction, UnsignedCosmosTransaction } from '@airgap/cosmos'
import { SignedEthereumTransaction, UnsignedEthereumTransaction, UnsignedTypedEthereumTransaction } from '@airgap/ethereum'
import { SignedSubstrateTransaction, UnsignedSubstrateTransaction } from '@airgap/substrate'
import {
  SignedTezosSaplingTransaction,
  SignedTezosTransaction,
  UnsignedTezosSaplingTransaction,
  UnsignedTezosTransaction
} from '@airgap/tezos'

import { IACMessageType } from './interfaces'
import { AccountShareResponse } from './schemas/definitions/account-share-response'
import { MessageSignRequest } from './schemas/definitions/message-sign-request'
import { MessageSignResponse } from './schemas/definitions/message-sign-response'
import { SchemaInfo, SchemaItem, SchemaTransformer } from './schemas/schema'
import { SerializerV3 } from './serializer'
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
  | UnsignedTypedEthereumTransaction
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
    const schemaInfos: SchemaInfo[] = SerializerV3.getSchemas(this.type, this.protocol)
    let lastError
    for (let schemaInfo of schemaInfos) {
      try {
        const schema = unwrapSchema(schemaInfo.schema)
        const array: CBORData = jsonToArray('root', schema, this.payload)
        return [this.version, this.type, this.protocol, this.id, array]
      } catch (e) {
        lastError = e
      }
    }

    if (lastError) {
      throw lastError
    }

    throw new Error('NO SCHEMA FOUND')
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

    const schemaInfos: SchemaInfo[] = SerializerV3.getSchemas(type, protocol)
    for (let schemaInfo of schemaInfos) {
      try {
        const schema: SchemaItem = unwrapSchema(schemaInfo.schema)
        const schemaTransformer: SchemaTransformer | undefined = schemaInfo.transformer
        const json: IACMessages = rlpArrayToJson(schema, encodedPayload) as any as IACMessages

        const payload: IACMessages = schemaTransformer ? schemaTransformer(json) : json
        return new Message(type, protocol, payload, id, version)
      } catch (e) {}
    }

    throw new Error('NO SCHEMA MATCHED')
  }

  private static validateVersion(version: number): number {
    return this.validateProperty<number, number>('Version', version, (val: number) => val === 0 || val === 1)
  }

  private static validateType(value: number, protocol: ProtocolSymbols): IACMessageType {
    return this.validateProperty<IACMessageType, number>('Type', value, (val: number) => {
      try {
        SerializerV3.getSchemas(val, protocol)

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
