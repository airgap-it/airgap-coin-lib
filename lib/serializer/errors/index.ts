/**
 * Gets thrown if the serializer version does not match
 */
export class SerializerVersionMismatch extends Error {
  constructor() {
    super('SERIALIZER_VERSION_MISMATCH')
  }
}

/**
 * Gets thrown if the serializer cannot handle the specified coin/protocol
 */
export class ProtocolNotSupported extends Error {
  constructor() {
    super('PROTOCOL_NOT_SUPPORTED')
  }
}

/**
 * Gets thrown if the serializer CAN handle the specified coin/protocol, but not in this version
 */
export class ProtocolVersionMismatch extends Error {
  constructor() {
    super('PROTOCOL_VERSION_MISMATCH')
  }
}

/**
 * Gets thrown if the specified Type is not supported
 */
export class TypeNotSupported extends Error {
  constructor() {
    super('TYPE_NOT_SUPPORTED')
  }
}
