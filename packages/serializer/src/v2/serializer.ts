import { SerializerError, SerializerErrorType } from '@airgap/coinlib-core/errors'
import { MainProtocolSymbols, ProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'

import { IACProtocol } from './inter-app-communication-protocol'
import { IACMessageType } from './interfaces'
import { IACMessageDefinitionObject } from './message'
import { FullPayload } from './payloads/full-payload'
import { Payload } from './payloads/payload'
import { SchemaInfo, SchemaRoot } from './schemas/schema'
import { TransactionValidator, TransactionValidatorFactory } from './validators/transactions.validator'

const accountShareResponse: SchemaRoot = require('./schemas/generated/account-share-response.json')

const messageSignRequest: SchemaRoot = require('./schemas/generated/message-sign-request.json')
const messageSignResponse: SchemaRoot = require('./schemas/generated/message-sign-response.json')

export enum IACPayloadType {
  FULL = 0,
  CHUNKED = 1
}

export class Serializer {
  private readonly schemas: Map<string, SchemaInfo> = new Map()
  private readonly validators: Map<ProtocolSymbols, TransactionValidatorFactory> = new Map()

  private static instance: Serializer | undefined = undefined
  public static getInstance(): Serializer {
    if (Serializer.instance === undefined) {
      Serializer.instance = new Serializer()
    }

    return Serializer.instance
  }

  private constructor() {
    this.addSchema(IACMessageType.AccountShareResponse, { schema: accountShareResponse })
    this.addSchema(IACMessageType.MessageSignRequest, { schema: messageSignRequest })
    this.addSchema(IACMessageType.MessageSignResponse, { schema: messageSignResponse })
  }

  public static addSchema(schemaId: number, schema: SchemaInfo, protocol?: ProtocolSymbols): void {
    Serializer.getInstance().addSchema(schemaId, schema, protocol)
  }

  public addSchema(schemaId: number, schema: SchemaInfo, protocol?: ProtocolSymbols): void {
    const protocolSpecificSchemaName: string = Serializer.getSchemaName(schemaId, protocol)

    if (this.schemas.has(protocolSpecificSchemaName)) {
      throw new SerializerError(SerializerErrorType.SCHEMA_ALREADY_EXISTS, `Schema ${protocolSpecificSchemaName} already exists`)
    }
    this.schemas.set(protocolSpecificSchemaName, schema)
  }

  public static getSchema(schemaId: number, protocol?: ProtocolSymbols): SchemaInfo {
    return Serializer.getInstance().getSchema(schemaId, protocol)
  }

  public getSchema(schemaId: number, protocol?: ProtocolSymbols): SchemaInfo {
    const protocolSpecificSchemaName: string = Serializer.getSchemaName(schemaId, protocol)

    let schema: SchemaInfo | undefined
    if (this.schemas.has(protocolSpecificSchemaName)) {
      schema = this.schemas.get(protocolSpecificSchemaName)
    } else if (protocol !== undefined) {
      const split = protocol.split('-')
      // if protocol is a sub protocol and there is no schema defined for it, use the main protocol schema as the fallback
      if (split.length >= 2) {
        return this.getSchema(schemaId, split[0] as MainProtocolSymbols)
      }
    }

    // Try to get the protocol specific scheme, if it doesn't exist fall back to the generic one
    schema = schema ?? this.schemas.get(Serializer.getSchemaName(schemaId))

    if (!schema) {
      throw new SerializerError(SerializerErrorType.SCHEMA_DOES_NOT_EXISTS, `Schema ${protocolSpecificSchemaName} does not exist`)
    }

    return schema
  }

  private static getSchemaName(schemaId: number, protocol?: ProtocolSymbols): string {
    const schemaName = `${schemaId}-${protocol}`
    if (
      (protocol !== undefined && schemaId === IACMessageType.TransactionSignRequest) ||
      schemaId === IACMessageType.TransactionSignResponse
    ) {
      const split = schemaName.split('-')
      if (split.length >= 3 && `${split[1]}-${split[2]}` === SubProtocolSymbols.ETH_ERC20) {
        return `${schemaId}-${SubProtocolSymbols.ETH_ERC20}`
      }
    }

    return protocol ? `${schemaId}-${protocol}` : schemaId.toString()
  }

  public static addValidator(protocol: ProtocolSymbols, validator: TransactionValidatorFactory): void {
    Serializer.getInstance().addValidator(protocol, validator)
  }

  public addValidator(protocol: ProtocolSymbols, validator: TransactionValidatorFactory): void {
    this.validators.set(protocol, validator)
  }

  public async serialize(
    messages: IACMessageDefinitionObject[],
    singleChunkSize: number = 0,
    multiChunkSize: number = 0
  ): Promise<string[]> {
    if (
      messages.every((message: IACMessageDefinitionObject) => {
        return this.getSchema(message.type, message.protocol)
      })
    ) {
      const iacps: IACProtocol[] = IACProtocol.fromDecoded(JSON.parse(JSON.stringify(messages)), singleChunkSize, multiChunkSize, this)

      return iacps.map((iac: IACProtocol) => iac.encoded(this))
    } else {
      throw new SerializerError(SerializerErrorType.SCHEMA_DOES_NOT_EXISTS, `Unknown schema`)
    }
  }

  public async deserialize(data: string[]): Promise<IACMessageDefinitionObject[]> {
    const result: IACProtocol[] = IACProtocol.fromEncoded(data, this)
    const deserializedIACMessageDefinitionObjects: IACMessageDefinitionObject[] = result
      .map((el: IACProtocol) => el.payload)
      .map((el: Payload) => (el as FullPayload).asJson())
      .reduce((pv: IACMessageDefinitionObject[], cv: IACMessageDefinitionObject[]) => pv.concat(...cv), [] as IACMessageDefinitionObject[])

    return deserializedIACMessageDefinitionObjects
  }

  public serializationValidatorByProtocolIdentifier(protocolIdentifier: ProtocolSymbols): TransactionValidator {
    const validatorsKeys: ProtocolSymbols[] = Array.from(this.validators.keys())

    const exactMatch: ProtocolSymbols | undefined = validatorsKeys.find((protocol) => protocolIdentifier === protocol)
    const startsWith: ProtocolSymbols | undefined = validatorsKeys.find((protocol) => protocolIdentifier.startsWith(protocol))
    // TODO: Only use validator if it's a transaction
    const validatorFactory: TransactionValidatorFactory | undefined = this.validators.get(
      exactMatch ?? startsWith ?? MainProtocolSymbols.ETH
    )

    if (!validatorFactory) {
      throw Error(`Validator not registered for ${protocolIdentifier}, ${exactMatch}, ${startsWith}, ${validatorFactory}`)
    }

    return validatorFactory.create()
  }
}
