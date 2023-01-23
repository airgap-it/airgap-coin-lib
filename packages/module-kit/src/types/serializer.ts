import { IACMessageType, SchemaInfo } from '@airgap/serializer'

export interface V3SchemaConfiguration {
  type: IACMessageType
  schema: SchemaInfo
  protocolIdentifier?: string
}
