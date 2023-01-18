import { SerializerError, SerializerErrorType } from '@airgap/coinlib-core/errors'
import { MainProtocolSymbols, ProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'

import { IACMessageWrapper } from './iac-message-wrapper'
import { IACMessageType } from './interfaces'
import { IACMessageDefinitionObjectV3 } from './message'
import { SchemaInfo, SchemaRoot } from './schemas/schema'
import { TransactionValidator, TransactionValidatorFactory } from './validators/transactions.validator'

const accountShareResponse: SchemaRoot = require('./schemas/generated/account-share-response.json')

const messageSignRequest: SchemaRoot = require('./schemas/generated/message-sign-request.json')
const messageSignResponse: SchemaRoot = require('./schemas/generated/message-sign-response.json')

export class SerializerV3 {
  private readonly schemas: Map<string, SchemaInfo[]> = new Map()
  private readonly validators: Map<ProtocolSymbols, TransactionValidatorFactory> = new Map()

  private static instance: SerializerV3 | undefined = undefined
  public static getInstance(): SerializerV3 {
    if (SerializerV3.instance === undefined) {
      SerializerV3.instance = new SerializerV3()
    }

    return SerializerV3.instance
  }

  private constructor() {
    this.addSchema(IACMessageType.AccountShareResponse, { schema: accountShareResponse })
    this.addSchema(IACMessageType.MessageSignRequest, { schema: messageSignRequest })
    this.addSchema(IACMessageType.MessageSignResponse, { schema: messageSignResponse })
  }

  public static addSchema(schemaId: number, schema: SchemaInfo, protocol?: ProtocolSymbols): void {
    SerializerV3.getInstance().addSchema(schemaId, schema, protocol)
  }

  public addSchema(schemaId: number, schema: SchemaInfo, protocol?: ProtocolSymbols): void {
    const protocolSpecificSchemaName: string = SerializerV3.getSchemaName(schemaId, protocol)

    const schemas = this.schemas.get(protocolSpecificSchemaName) ?? []
    if (schemas.some((el) => el.schema === schema.schema)) {
      throw new SerializerError(SerializerErrorType.SCHEMA_ALREADY_EXISTS, `Schema ${protocolSpecificSchemaName} already exists`)
    }
    schemas.push(schema)
    this.schemas.set(protocolSpecificSchemaName, schemas)
  }

  public static getSchemas(schemaId: number, protocol?: ProtocolSymbols): SchemaInfo[] {
    return SerializerV3.getInstance().getSchemas(schemaId, protocol)
  }

  public getSchemas(schemaId: number, protocol?: ProtocolSymbols): SchemaInfo[] {
    const protocolSpecificSchemaName: string = SerializerV3.getSchemaName(schemaId, protocol)

    let schemas: SchemaInfo[] | undefined
    if (this.schemas.has(protocolSpecificSchemaName)) {
      schemas = this.schemas.get(protocolSpecificSchemaName)
    } else if (protocol !== undefined) {
      const split = protocol.split('-')
      // if protocol is a sub protocol and there is no schema defined for it, use the main protocol schema as the fallback
      if (split.length >= 2) {
        return this.getSchemas(schemaId, split[0] as MainProtocolSymbols)
      }
    }

    // Try to get the protocol specific scheme, if it doesn't exist fall back to the generic one
    schemas = schemas !== undefined && schemas.length > 0 ? schemas : this.schemas.get(SerializerV3.getSchemaName(schemaId))

    if (!schemas) {
      throw new SerializerError(SerializerErrorType.SCHEMA_DOES_NOT_EXISTS, `Schema ${protocolSpecificSchemaName} does not exist`)
    }

    return schemas
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
    SerializerV3.getInstance().addValidator(protocol, validator)
  }

  public addValidator(protocol: ProtocolSymbols, validator: TransactionValidatorFactory): void {
    this.validators.set(protocol, validator)
  }

  public async serialize(messages: IACMessageDefinitionObjectV3[]): Promise<string> {
    if (
      messages.every((message: IACMessageDefinitionObjectV3) => {
        return this.getSchemas(message.type, message.protocol).length > 0
      })
    ) {
      const iacps: IACMessageWrapper = IACMessageWrapper.fromDecoded(JSON.parse(JSON.stringify(messages)))

      return iacps.encoded(this)
    } else {
      throw new SerializerError(SerializerErrorType.SCHEMA_DOES_NOT_EXISTS, `Unknown schema`)
    }
  }

  public async deserialize(data: string): Promise<IACMessageDefinitionObjectV3[]> {
    let result: IACMessageWrapper
    try {
      result = IACMessageWrapper.fromEncoded(data, this)
    } catch {
      throw new Error('Cannot decode data')
    }
    const deserializedIACMessageDefinitionObjects: IACMessageDefinitionObjectV3[] = result.payload.asJson()

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
